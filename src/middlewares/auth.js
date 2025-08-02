import { verifyToken } from '../lib/jwt.js';

export const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token kiritilmadi' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Noto\'g\'ri token' });
  }

  req.user = decoded;
  next();
};