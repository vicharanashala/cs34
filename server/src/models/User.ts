import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'USER' | 'ADMIN';
export type BadgeLevel = 'Beginner' | 'Helper' | 'Expert' | 'Mentor';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  spPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    spPoints: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const getBadge = (spPoints: number): BadgeLevel => {
  if (spPoints > 500) return 'Mentor';
  if (spPoints > 200) return 'Expert';
  if (spPoints > 50) return 'Helper';
  return 'Beginner';
};

export const User = mongoose.model<IUser>('User', UserSchema);
