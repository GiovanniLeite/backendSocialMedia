import multer from 'multer';
import bcrypt from 'bcrypt';

import multerConfig from '../config/multerConfig';
import User from '../models/User';

const upload = multer(multerConfig).single('picture');

class UserController {
  /**
   * Retrieve a single User by id
   *
   * @returns {Object} - The User object
   */
  async show(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      return res.status(200).json(user);
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }
  }

  /**
   * Retrieve a list of friends for a specific User
   *
   * @returns {Array} - An array of user's friends, which may be empty
   */
  async listUserFriends(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      const friends = await Promise.all(
        user.friends.map((id) => User.findById(id)),
      );
      const formattedFriends = friends.map(
        ({ _id, firstName, lastName, occupation, location, picturePath }) => {
          return {
            _id,
            firstName,
            lastName,
            occupation,
            location,
            picturePath,
          };
        },
      );
      return res.status(200).json(formattedFriends);
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }
  }

  /**
   * Create a new User
   *
   * @returns {Object} - The created User object
   */
  store(req, res) {
    // Use the 'upload' middleware to handle file uploads asynchronously
    return upload(req, res, async (err) => {
      // Check for and handle any errors that may occur during file upload
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      try {
        const { filename } = req.file;
        const {
          firstName,
          lastName,
          email,
          password,
          friends,
          location,
          occupation,
        } = req.body;

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
          firstName,
          lastName,
          email,
          password: passwordHash,
          picturePath: filename,
          friends,
          location,
          occupation,
          viewedProfile: Math.floor(Math.random() * 10000),
          impressions: Math.floor(Math.random() * 10000),
        });

        const savedUser = await newUser.save();
        return res.status(201).json(savedUser);
      } catch (err) {
        return res.status(500).json({
          error: err.message,
        });
      }
    });
  }

  /**
   * Add or Remove a Friend from User's Friends List
   *
   * @returns {Array} - An array of user's friends, which may be empty
   */
  async updateToggleFriends(req, res) {
    try {
      const { id, friendId } = req.params;
      const user = await User.findById(id);
      const friend = await User.findById(friendId);

      if (user.friends.includes(friendId)) {
        // The friend already exists, so we remove them from both the user's array
        // and the friend's array

        // Copy the user's friends array, keeping only those with an ID different
        // from the one sent in the request (friendId)
        user.friends = user.friends.filter((id) => id !== friendId);

        // Copy the friend's friends array, keeping only those with an ID different
        // from the one sent in the request (id)
        friend.friends = user.friends.filter((id) => id !== id);
      } else {
        // The friend doesn't exist, so we add them

        // Add the friend's ID from the request to the user's friends array
        user.friends.push(friendId);

        // Add the user's ID from the request to the friend's friends array
        friend.friends.push(id);
      }

      await user.save();
      await friend.save();

      const friends = await Promise.all(
        user.friends.map((id) => User.findById(id)),
      );
      const formattedFriends = friends.map(
        ({ _id, firstName, lastName, occupation, location, picturePath }) => {
          return {
            _id,
            firstName,
            lastName,
            occupation,
            location,
            picturePath,
          };
        },
      );
      return res.status(200).json(formattedFriends);
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }
  }
}

export default new UserController();
