import { rateLimit } from 'express-rate-limit';
import { env } from './env.js';

const isTestEnvironment = env.nodeEnv === 'test';

export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTestEnvironment ? 10_000 : 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

export const aiAnalysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTestEnvironment ? 10_000 : 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'AI analysis request limit exceeded. Please try again later.',
    code: 'AI_RATE_LIMIT_EXCEEDED'
  }
});