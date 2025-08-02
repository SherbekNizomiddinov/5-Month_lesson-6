import express from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, (req, res) => {
  res.json({ message: 'Profil sahifasi', userId: req.user.userId });
});

export default router;