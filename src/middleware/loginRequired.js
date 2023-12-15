import jwt from 'jsonwebtoken';

const loginRequired = async (req, res, next) => {
  try {
    let token = req.header('Authorization');

    if (!token || typeof token !== 'string') {
      return res.status(401).json({
        errors: ['É necessário fazer login'],
      });
    }

    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimStart();
    }

    const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
    const { id } = verifiedUser;
    req.userId = id;

    next();
  } catch (err) {
    res.status(401).json({
      errors: ['Token expirado ou inválido, deslogue e logue novamente'],
    });
  }
};

export default loginRequired;
