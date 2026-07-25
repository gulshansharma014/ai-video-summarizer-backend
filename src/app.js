import express from 'express';
import cors from 'cors';

import { env } from './config/env.js';
import analysisRoutes from './routes/analysis.routes.js';
import healthRoutes from './routes/health.routes.js';
import pdfRoutes from './routes/pdf.routes.js';
import transcriptRoutes from './routes/transcript.routes.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

app.disable('x-powered-by');

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
app.use('/api/transcript', transcriptRoutes);
app.use('/api/analyze-transcript', analysisRoutes);
app.use('/api/download-analyzed-pdf', pdfRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;