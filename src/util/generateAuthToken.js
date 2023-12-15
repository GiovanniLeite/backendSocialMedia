import jwt from 'jsonwebtoken';

const generateAuthToken = (user) => {
  // Create a new token for user authentication (login)
  return jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRATION,
  });
};

export default generateAuthToken;
