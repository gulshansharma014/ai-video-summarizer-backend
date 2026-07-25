import { analyseTranscript } from '../services/analysis.service.js';

export const analyseTranscriptController = async (req, res) => {
  const analyzedTranscript = await analyseTranscript(req.body.transcript);

  return res.status(200).json({
    analyzedTranscript
  });
};