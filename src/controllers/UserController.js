import bcrypt from 'bcrypt';
import multer from 'multer';

import multerConfig from '../config/multerConfig';
import User from '../models/User';
import generateAuthToken from '../util/generateAuthToken';

const upload = multer(multerConfig).single('picture');

const USER_NOT_FOUND_ERROR = 'Usuário não encontrado';
const USERS_NOT_FOUND_ERROR = 'Usuário(s) não encontrado(s)';

class UserController {
  /**
   * Retrieve a single User by id
   *
   * @returns {Object} - The User object
   */
  async show(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id)
        .select(
          '_id firstName lastName email picturePath friends location occupation twitter linkedin viewedProfile impressions',
        )
        .lean();

      // If the user is not found
      if (!user) {
        return res.status(404).json({
          errors: [USER_NOT_FOUND_ERROR],
        });
      }

      // req.userId from middleware loginRequired
      const loggedUser = await User.findById(req.userId).select('friends');

      user.isFriend = loggedUser.friends.includes(user._id);

      return res.status(200).json(user);
    } catch (err) {
      return res.status(500).json({
        errors: [err.message],
      });
    }
  }

  /**
   * Retrieve a list of friends for a specific User
   *
   * @returns {Array} - An array of user's friends or []
   */
  async listUserFriends(req, res) {
    try {
      const { id } = req.params;
      const loggedUserId = req.userId; // from middleware loginRequired

      let user = null;
      let loggedUser = null;

      if (id === loggedUserId) {
        user = await User.findById(id);
      } else {
        user = await User.findById(id);
        loggedUser = await User.findById(loggedUserId);
      }

      // If the user is not found
      if (!user) {
        return res.status(404).json({
          errors: [USER_NOT_FOUND_ERROR],
        });
      }

      // If the user has no friends
      if (!user.friends || user.friends.length === 0) {
        return res.status(200).json([]);
      }

      // Retrieve friend's details in parallel using Promise.all
      const friends = await Promise.all(
        user.friends.map(async (friendId) => {
          try {
            // Find each friend by ID and select specific fields
            const friend = await User.findById(friendId)
              .select('_id firstName lastName picturePath location occupation')
              .lean(); // Plain js object { _id, firstName... } whitout mongoose metadada

            // is the friend a friend of the logged-in user?
            let isFriend;

            if (id === loggedUserId) {
              isFriend = true;
            } else if (!loggedUser.friends || loggedUser.friends.length === 0) {
              isFriend = false;
            } else {
              isFriend = loggedUser.friends.includes(friendId);
            }

            return { ...friend, isFriend };
          } catch (error) {
            console.error(
              `Error finding friend with ID ${friendId}: ${error.message}`,
            );
            return null;
          }
        }),
      );

      // Filter out null values (errors in finding specific friends)
      const validFriends = friends.filter((friend) => friend !== null);

      return res.status(200).json(validFriends);
    } catch (err) {
      return res.status(500).json({
        errors: [err.message],
      });
    }
  }

  /**
   * Create a new User
   *
   * @returns {Object} - The created User and a Token (JWT)
   */
  async store(req, res) {
    try {
      const { firstName, lastName, email, password, location, occupation } =
        req.body;

      // Generate a salt and hash the user's password
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = new User({
        firstName,
        lastName,
        email,
        password: passwordHash,
        location,
        occupation,
      });

      // Save the new User to the database
      const user = await newUser.save();
      user.password = '';

      // Create a new token for user authentication (login)
      const token = generateAuthToken(user);

      return res.status(201).json({ token, user });
    } catch (err) {
      // Check if email already exists (unique constraint violation)
      if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
        return res.status(409).json({
          errors: ['Esse endereço de email já está em uso'],
        });
      }

      // Handle other unexpected errors
      return res.status(500).json({
        errors: [err.message],
      });
    }
  }

  /**
   * Update the User picture
   *
   * @returns {Object} - The User object
   */
  updatePicture(req, res) {
    // Use the 'upload' middleware to handle file uploads asynchronously
    return upload(req, res, async (err) => {
      // Check for and handle any errors that may occur during file upload
      if (err) {
        return res.status(400).json({
          errors: [err.message],
        });
      }

      try {
        const { filename } = req.file;
        // Ensure that the current user can only edit their own profile
        // req.userId from middleware loginRequired
        const user = await User.findById(req.userId);

        user.picturePath = filename;
        await user.save();

        user.password = '';
        return res.status(200).json(user);
      } catch (err) {
        return res.status(500).json({
          errors: [err.message],
        });
      }
    });
  }

  /**
   * Add or Remove a Friend from User's Friends List
   */
  async toggleFriend(req, res) {
    try {
      const { userId } = req; // from middleware loginRequired
      const { friendId } = req.params;
      const user = await User.findById(userId);
      const friend = await User.findById(friendId);

      // If one of the users is not found
      if (!user || !friend) {
        return res.status(404).json({
          errors: [USERS_NOT_FOUND_ERROR],
        });
      }

      // If the limit of friends has been reached by one of the users
      const maxFriendLimit = 30;
      if (
        user.friends.length >= maxFriendLimit ||
        friend.friends.length >= maxFriendLimit
      ) {
        return res.status(403).json({
          errors: [
            'Você ou o outro usuário atingiram o número máximo de amigos',
          ],
        });
      }

      // Check if the friendId is already in the user's friends list
      if (user.friends.includes(friendId)) {
        // Remove friend
        user.friends = user.friends.filter((id) => id !== friendId);
        friend.friends = friend.friends.filter((id) => id !== userId);
      } else {
        // Add friend
        user.friends.push(friendId);
        friend.friends.push(userId);
      }

      await user.save();
      await friend.save();

      return res.status(204).end();
    } catch (err) {
      return res.status(404).json({
        errors: [err.message],
      });
    }
  }
}

export default new UserController();
