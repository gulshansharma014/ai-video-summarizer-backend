import { YoutubeTranscript } from 'youtube-transcript';
import { AppError } from '../utils/app-error.js';

const VIDEO_ID_PATTERN =
  /(?:youtube\.com\/(?:.*v=|v\/|embed\/|shorts\/)|youtu\.be\/)([0-9A-Za-z_-]{11})/;

export const extractVideoId = (url) => {
  if (!url || typeof url !== 'string') {
    throw new AppError(
      'Please provide a valid YouTube URL.',
      400,
      'INVALID_YOUTUBE_URL'
    );
  }

  const match = url.trim().match(VIDEO_ID_PATTERN);

  if (!match) {
    throw new AppError(
      'Invalid YouTube URL.',
      400,
      'INVALID_YOUTUBE_URL'
    );
  }

  return match[1];
};

export const fetchTranscript = async (url) => {
  const videoId = extractVideoId(url);

  try {
    const entries = await YoutubeTranscript.fetchTranscript(videoId);

    if (!entries?.length) {
      throw new AppError(
        'No transcript is available for this video.',
        404,
        'TRANSCRIPT_NOT_AVAILABLE'
      );
    }

    return entries
      .map((entry) => entry.text)
      .filter(Boolean)
      .join(' ')
      .trim();
  } catch (error) {
      console.error("Raw transcript provider error:", {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      status: error?.status,
      statusCode: error?.statusCode,
      cause: error?.cause,
      responseStatus: error?.response?.status,
      responseData: error?.response?.data,
      stack: error?.stack,
    });
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      'Unable to fetch the transcript for this video.',
      502,
      'TRANSCRIPT_PROVIDER_ERROR'
    );
  }
};