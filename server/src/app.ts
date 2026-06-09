import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes';
import questionRoutes from './routes/question.routes';
import answerRoutes from './routes/answer.routes';
import bookmarkRoutes from './routes/bookmark.routes';
import notificationRoutes from './routes/notification.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import voteRoutes from './routes/vote.routes';
import searchRoutes from './routes/search.routes';
import feedRoutes from './routes/feed.routes';
import { reportUserRoutes, reportAdminRoutes } from './routes/report.routes';

import { errorHandler, notFound } from './middleware/error.middleware';

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Campus Doubt Hub API is running 🚀' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/reports', reportUserRoutes);
app.use('/api/admin/reports', reportAdminRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
