import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  return res.status(200).json({
    status: 'UP',
    service: 'ai-video-summarizer-backend',
    timestamp: new Date().toISOString()
  });
});

export default router;