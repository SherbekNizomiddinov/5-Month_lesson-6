import mongoose from 'mongoose';
import { hashPassword } from '../lib/hash.js';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  const { comparePassword } = await import('../lib/hash.js');
  return await comparePassword(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);