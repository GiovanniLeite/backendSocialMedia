import jwt from 'jsonwebtoken';

/**
 * Generate a new token for authentication
 *
 * @param {Object} user - The user object
 * @returns {string} - The generated token
 */
const generateAuthToken = (user) => {
  // Create a new token for user authentication (login)
  return jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRATION,
  });
};

export default generateAuthToken;
