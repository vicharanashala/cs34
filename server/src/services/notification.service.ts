import { Notification } from '../models/Notification';
import mongoose from 'mongoose';

export const createNotification = async (
  userId: mongoose.Types.ObjectId | string,
  message: string
): Promise<void> => {
  await Notification.create({ userId, message });
};

export const getUserNotifications = async (userId: string) => {
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50);
  const unreadCount = await Notification.countDocuments({ userId, isRead: false });
  return { notifications, unreadCount };
};

export const markRead = async (notificationId: string, userId: string) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new Error('Notification not found');
  return notification;
};

export const markAllRead = async (userId: string) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
};
