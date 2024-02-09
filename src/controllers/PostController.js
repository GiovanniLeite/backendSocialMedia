import multer from 'multer';

import multerConfig from '../config/multerConfig';
import User from '../models/User';
import Post from '../models/Post';

const upload = multer(multerConfig).single('picture');

class PostController {
  /**
   * Retrieve a list of posts from the database
   *
   * @returns {Array} - An array of posts, which may be empty []
   */
  async index(req, res) {
    try {
      const { userId } = req.params;
      const query = userId ? { userId } : {};

      const posts = await Post.find(query).sort({ createdAt: 'desc' });

      return res.status(200).json(posts);
    } catch (err) {
      return res.status(404).json({
        errors: [err.message],
      });
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
        return res.status(400).json({
          errors: [err.message],
        });
      }

      try {
        const { userId } = req; // from middleware loginRequired
        const { description } = req.body;
        const filename = req.file ? req.file.filename : '';

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
        const posts = await Post.find().sort({ createdAt: 'desc' });

        return res.status(201).json(posts);
      } catch (err) {
        return res.status(409).json({
          errors: [err.message],
        });
      }
    });
  }

  /**
   * Toggle the like status of a post and return the updated post
   *
   * @returns {Object} - The updated post object
   */
  async toggleLike(req, res) {
    try {
      const { postId } = req.params;
      const { userId } = req; // from middleware loginRequired

      const post = await Post.findById(postId);
      const isLiked = post.likes.get(userId);

      if (isLiked) {
        post.likes.delete(userId);
      } else {
        post.likes.set(userId, true);
      }

      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { likes: post.likes },
        { new: true },
      );

      return res.status(200).json(updatedPost);
    } catch (err) {
      return res.status(404).json({
        errors: [err.message],
      });
    }
  }
}

export default new PostController();
