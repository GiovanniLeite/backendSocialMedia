import User from '../models/User';
import generateAuthToken from '../util/generateAuthToken';
import generatePasswordHash from '../util/generatePasswordHash';
import {
  EMAIL_ALREADY_IN_USE_ERROR,
  MAX_FRIENDS_REACHED_ERROR,
  NO_FIELDS_PROVIDED_ERROR,
  USERS_NOT_FOUND_ERROR,
  USER_NOT_FOUND_ERROR,
} from '../constants/apiErrorMessages';

class UserController {
  /**
   * Retrieve a single User by id
   *
   * @returns {Object} - The User object
   */
  async show(req, res) {
    try {
      const { id } = req.params;
      const loggedUserId = req.userId;

      // Retrieve the user being searched for
      const user = await User.findById(id)
        .select(
          '_id firstName lastName email picturePath coverPath friends location occupation twitter linkedin viewedProfile impressions',
        )
        .lean();

      // If the searched user is the same as the logged-in user
      if (id === loggedUserId) {
        return res.status(200).json(user);
      }

      // Retrieve the logged-in user
      const loggedUser = await User.findById(loggedUserId).select('friends');

      // If either user is not found
      if (!user || !loggedUser) {
        return res.status(404).json({
          errors: [USERS_NOT_FOUND_ERROR],
        });
      }

      // Check if the searched user is a friend of the logged-in user
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
            console.error(`Error finding friend with ID ${friendId}: ${error.message}`);
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
      const { firstName, lastName, email, password, location, occupation } = req.body;

      // Generate a hash of the user's password;
      const passwordHash = await generatePasswordHash(password);

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
          errors: [EMAIL_ALREADY_IN_USE_ERROR],
        });
      }

      // Handle other unexpected errors
      return res.status(500).json({
        errors: [err.message],
      });
    }
  }

  /**
   * Update the User
   *
   * @returns {Object} - The User object
   */
  async update(req, res) {
    try {
      const { firstName, lastName, email, password, location, occupation, linkedin, twitter } = req.body;

      // Ensure that the current user can only edit their own profile
      // req.userId from middleware loginRequired
      const user = await User.findById(req.userId).select(
        '_id firstName lastName email picturePath coverPath friends location occupation twitter linkedin viewedProfile impressions',
      );

      if (!user) {
        return res.status(404).json({
          errors: [USER_NOT_FOUND_ERROR],
        });
      }

      // Verifies and updates user fields based on the provided field
      switch (true) {
        case !!(firstName && lastName && location && occupation):
          Object.assign(user, {
            firstName,
            lastName,
            location,
            occupation,
            twitter,
            linkedin,
          });
          break;
        case !!email:
          user.email = email;
          break;
        case !!password:
          user.password = await generatePasswordHash(password);
          break;
        case !!req.files?.picturePath:
          user.picturePath = req.files.picturePath[0].filename;
          break;
        case !!req.files?.coverPath:
          user.coverPath = req.files.coverPath[0].filename;
          break;
        default:
          // If no field was provided for update
          return res.status(400).json({
            errors: [NO_FIELDS_PROVIDED_ERROR],
          });
      }

      await user.save();

      user.password = '';
      return res.status(200).json(user);
    } catch (err) {
      // Check if email already exists (unique constraint violation)
      if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
        return res.status(409).json({
          errors: [EMAIL_ALREADY_IN_USE_ERROR],
        });
      }

      // Handle other unexpected errors
      return res.status(500).json({
        errors: [err.message],
      });
    }
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
      if (user.friends.length >= maxFriendLimit || friend.friends.length >= maxFriendLimit) {
        return res.status(403).json({
          errors: [MAX_FRIENDS_REACHED_ERROR],
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
      return res.status(500).json({
        errors: [err.message],
      });
    }
  }
}

export default new UserController();
