import { Router } from 'express';
import { analyseTranscriptController } from '../controllers/analysis.controller.js';
import { validateAnalysisRequest } from '../middleware/validation.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.post(
  '/',
  validateAnalysisRequest,
  asyncHandler(analyseTranscriptController)
);

export default router;