import multer from 'multer';

import multerConfig from '../config/multerConfig';
import User from '../models/User';
import Post from '../models/Post';

const upload = multer(multerConfig).single('picture');

class PostController {
  /**
   * Retrieve a list of posts from the database
   *
   * @returns {Array} - An array of posts, which may be empty
   */
  async index(req, res) {
    try {
      const posts = await Post.find();

      return res.status(200).json(posts);
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }
  }

  /**
   * Retrieve a list of posts from the database
   *
   * @param {string} [userId] -  ID of the user for filtering posts by user
   * @returns {Array} - An array of posts, which may be empty
   */
  async indexByUser(req, res) {
    try {
      const { userId } = req.params;
      const posts = await Post.find({ userId });

      return res.status(200).json(posts);
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }
  }

  /**
   * Create a new post
   *
   * @returns {Array} - An array of posts
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
        const { userId, description } = req.body;
        const user = await User.findById(userId);

        // Create a new post object with user and file information
        const newPost = new Post({
          userId,
          firstName: user.firstName,
          lastName: user.lastName,
          location: user.location,
          description,
          userPicturePath: user.picturePath,
          picturePath: filename,
          likes: {},
          comments: [],
        });

        await newPost.save();

        // Retrieve all posts from the database after creating the new post
        const posts = await Post.find();

        return res.status(201).json(posts);
      } catch (err) {
        return res.status(409).json({ message: err.message });
      }
    });
  }

  /**
   * Toggle the like status of a post and return the updated post
   *
   * @returns {Object} - The updated post object
   */
  async updateToggleLike(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const post = await Post.findById(id);
      const isLiked = post.likes.get(userId);

      if (isLiked) {
        post.likes.delete(userId);
      } else {
        post.likes.set(userId, true);
      }

      const updatedPost = await Post.findByIdAndUpdate(
        id,
        { likes: post.likes },
        { new: true },
      );

      return res.status(200).json(updatedPost);
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }
  }
}

export default new PostController();
