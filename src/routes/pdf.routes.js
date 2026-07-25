import { Router } from 'express';
import { downloadAnalysedPdf } from '../controllers/pdf.controller.js';
import { validatePdfRequest } from '../middleware/validation.middleware.js';

const router = Router();

router.post(
  '/',
  validatePdfRequest,
  downloadAnalysedPdf
);

export default router;