import { Router } from 'express';
import { downloadAnalysedPdf } from '../controllers/pdf.controller.js';

const router = Router();

router.post('/', downloadAnalysedPdf);

export default router;