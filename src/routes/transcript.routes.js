import { Router } from 'express';
import { getTranscript } from '../controllers/transcript.controller.js';
import { validateTranscriptRequest } from '../middleware/validation.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get(
  '/',
  validateTranscriptRequest,
  asyncHandler(getTranscript)
);

export default router;