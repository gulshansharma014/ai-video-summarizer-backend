import { fetchTranscript } from '../services/transcript.service.js';

export async function getTranscript(req, res, next) {
  try {
    const result = await fetchTranscript(req.query.url);

    return res.status(200).json({
      videoId: result.videoId,
      transcript: result.transcript,
      provider: result.provider,
    });
  } catch (error) {
    return next(error);
  }
}