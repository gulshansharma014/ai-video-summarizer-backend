import { Router } from 'express';
import { getTranscript } from '../controllers/transcript.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get('/', asyncHandler(getTranscript));

export default router;