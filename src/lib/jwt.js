import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = "30d";

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: EXPIRES_IN
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};