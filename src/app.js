import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { env } from './config/env.js';
import {
  aiAnalysisLimiter,
  generalApiLimiter
} from './config/rate-limit.js';

import analysisRoutes from './routes/analysis.routes.js';
import healthRoutes from './routes/health.routes.js';
import pdfRoutes from './routes/pdf.routes.js';
import transcriptRoutes from './routes/transcript.routes.js';

import { notFoundHandler } from './middleware/not-found.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet());

app.use(
  cors({
    origin: env.frontendUrl,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  })
);

app.use(
  express.json({
    limit: '2mb'
  })
);

app.use('/health', healthRoutes);

app.use('/api', generalApiLimiter);

app.use('/api/transcript', transcriptRoutes);

app.use(
  '/api/analyze-transcript',
  aiAnalysisLimiter,
  analysisRoutes
);

app.use('/api/download-analyzed-pdf', pdfRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;