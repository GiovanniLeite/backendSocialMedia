import jwt from 'jsonwebtoken';

import { INVALID_TOKEN_ERROR, LOGIN_REQUIRED_ERROR } from '../constants/apiErrorMessages';

const loginRequired = async (req, res, next) => {
  try {
    let token = req.header('Authorization');

    if (!token || typeof token !== 'string') {
      return res.status(401).json({
        errors: [LOGIN_REQUIRED_ERROR],
      });
    }

    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimStart();
    }

    const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
    req.userId = verifiedUser.id;

    next();
  } catch (err) {
    res.status(401).json({
      errors: [INVALID_TOKEN_ERROR],
    });
  }
};

export default loginRequired;
