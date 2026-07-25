import { fetchTranscript } from '../services/transcript.service.js';

export const getTranscript = async (req, res) => {
  const transcript = await fetchTranscript(req.query.url);

  return res.status(200).json({
    transcript
  });
};