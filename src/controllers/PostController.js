import mongoose from 'mongoose';

import User from '../models/User';
import Post from '../models/Post';
import { POST_NOT_FOUND_ERROR, USER_NOT_FOUND_ERROR } from '../constants/apiErrorMessages';

class PostController {
  /**
   * Retrieve a list of posts from the database
   *
   * @returns {Array} - An array of posts or []
   */
  async index(req, res) {
    try {
      const { userId } = req.params;
      let posts = [];

      // If userId is provided, retrieve posts associated with that userId
      if (mongoose.isValidObjectId(userId)) {
        posts = await Post.find({ userId }).sort({ createdAt: -1 }).lean();
      } else {
        // If userId is not provided, retrieve posts from the friends
        // and of the logged-in user
        const loggedUser = await User.findById(req.userId); // req.userId from middleware loginRequired
        if (!loggedUser) {
          return res.status(404).json({
            errors: [USER_NOT_FOUND_ERROR],
          });
        }

        posts = await Post.find({
          userId: { $in: [...loggedUser.friends, loggedUser._id] },
        })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
      }

      return res.status(200).json(posts);
    } catch (err) {
      return res.status(500).json({
        errors: [err.message],
      });
    }
  }

  /**
   * Create a new post
   *
   * @returns {Array} - An array of posts
   */
  async store(req, res) {
    try {
      const { userId } = req; // from middleware loginRequired
      const { page } = req.params;
      const { description } = req.body;
      const filename = req.files?.picture?.[0]?.filename ?? '';

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          errors: [USER_NOT_FOUND_ERROR],
        });
      }

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

      // Retrieves a list of posts either from the user only
      // or from the user and their friends
      const query = page === 'profile' ? { userId } : { userId: { $in: [...user.friends, user._id] } };
      const posts = await Post.find(query).sort({ createdAt: -1 }).limit(50).lean();

      return res.status(201).json(posts);
    } catch (err) {
      return res.status(500).json({
        errors: [err.message],
      });
    }
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
      if (!post) {
        return res.status(404).json({
          errors: [POST_NOT_FOUND_ERROR],
        });
      }

      const isLiked = post.likes.get(userId);
      if (isLiked) {
        post.likes.delete(userId);
      } else {
        post.likes.set(userId, true);
      }

      const updatedPost = await post.save();

      return res.status(200).json(updatedPost);
    } catch (err) {
      return res.status(500).json({
        errors: [err.message],
      });
    }
  }
}

export default new PostController();
