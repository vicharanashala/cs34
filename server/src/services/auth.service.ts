import { User } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

export const registerUser = async (input: RegisterInput) => {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new Error('Email already in use');

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({ name: input.name, email: input.email, passwordHash });
  const token = signToken({ userId: String(user._id), role: user.role });

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      spPoints: user.spPoints,
    },
  };
};

export const loginUser = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email });
  if (!user) throw new Error('Invalid email or password');

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) throw new Error('Invalid email or password');

  const token = signToken({ userId: String(user._id), role: user.role });

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      spPoints: user.spPoints,
    },
  };
};

export const getMe = async (userId: string) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) throw new Error('User not found');
  return user;
};
