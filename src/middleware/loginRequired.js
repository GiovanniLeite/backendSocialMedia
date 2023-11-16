import jwt from 'jsonwebtoken';

export default async (req, res, next) => {
  try {
    let token = req.header('Authorization');

    if (!token)
      return res.status(401).json({
        errors: ['Login required'],
      });

    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }

    const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
    const { id } = verifiedUser;

    req.userId = id;
    next();
  } catch (err) {
    res.status(401).json({
      errors: ['Token expirado ou inválido.'],
    });
  }
};
