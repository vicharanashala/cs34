export type UserRole = 'USER' | 'ADMIN';
export type BadgeLevel = 'Beginner' | 'Helper' | 'Expert' | 'Mentor';
export type AnswerStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type QuestionTag =
  | 'Onboarding & VINS'
  | 'Timelines & Clashes'
  | 'NOC Compliance'
  | 'Dashboard & Offers'
  | 'Certification & Credits'
  | 'ViBe LMS Tech'
  | 'Yaksha AI Engine'
  | 'Communication Tech'
  | 'Rosetta Journaling'
  | 'Team & Code Engineering';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  spPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  title: string;
  description: string;
  tags: QuestionTag[];
  author: User;
  viewsCount: number;
  answersCount: number;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  acceptedAnswerId?: string | null;
  trendingScore?: number;
}

export interface Answer {
  _id: string;
  questionId: string | Question;
  authorId: User;
  content: string;
  status: AnswerStatus;
  isBestAnswer: boolean;
  rewarded: boolean;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  reportCount: number;
  isFlagged: boolean;
}

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED';
export type ReportReason =
  | 'Spam'
  | 'Irrelevant'
  | 'Incorrect Information'
  | 'Offensive Content'
  | 'Duplicate Answer'
  | 'Other';

export interface Report {
  _id: string;
  answerId: {
    _id: string;
    content: string;
    authorId: {
      _id: string;
      name: string;
      email: string;
      spPoints: number;
    };
    questionId: {
      _id: string;
      title: string;
    };
  };
  reporterId: {
    _id: string;
    name: string;
    email: string;
  };
  reason: ReportReason;
  comment?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  _id: string;
  userId: string;
  targetId: string;
  targetType: 'question' | 'answer';
  value: 1 | -1;
  createdAt: string;
}

export interface Bookmark {
  _id: string;
  userId: string;
  questionId: Question;
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Analytics {
  totalUsers: number;
  totalQuestions: number;
  totalAnswers: number;
  pendingAnswers: number;
  approvedAnswers: number;
  rejectedAnswers: number;
  activeUsers: number;
  trendingQuestions: Question[];
  acceptanceRate: number;
  avgAnswersPerQ: number;
  topContributors: Array<{ _id: string; name: string; spPoints: number }>;
}

export interface UserStats {
  questionsAsked: number;
  answersSubmitted: number;
  approvedAnswers: number;
  bestAnswers: number;
  badgeProgress: number;
}

export interface ReputationEntry {
  _id: string;
  userId: string;
  amount: number;
  reason: string;
  sourceId?: string;
  createdAt: string;
}

export interface ActivityItem {
  _id: string;
  userId: User;
  action: 'asked' | 'answered' | 'upvoted' | 'downvoted' | 'accepted';
  targetType: 'question' | 'answer';
  targetId: string;
  metadata: {
    questionId?: string;
    questionTitle?: string;
    answerAuthorId?: string;
  };
  createdAt: string;
}

export const QUESTION_TAGS: QuestionTag[] = [
  'Onboarding & VINS',
  'Timelines & Clashes',
  'NOC Compliance',
  'Dashboard & Offers',
  'Certification & Credits',
  'ViBe LMS Tech',
  'Yaksha AI Engine',
  'Communication Tech',
  'Rosetta Journaling',
  'Team & Code Engineering'
];

export const getBadge = (sp: number): BadgeLevel => {
  if (sp > 500) return 'Mentor';
  if (sp > 200) return 'Expert';
  if (sp > 50) return 'Helper';
  return 'Beginner';
};
