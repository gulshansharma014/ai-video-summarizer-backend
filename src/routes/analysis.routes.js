import { Router } from 'express';
import { analyseTranscriptController } from '../controllers/analysis.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.post('/', asyncHandler(analyseTranscriptController));

export default router;