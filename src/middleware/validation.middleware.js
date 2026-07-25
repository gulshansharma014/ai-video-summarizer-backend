import { AppError } from '../utils/app-error.js';

const MAX_TRANSCRIPT_LENGTH = 100_000;
const MAX_PDF_CONTENT_LENGTH = 150_000;

const isNonEmptyString = (value) =>
  typeof value === 'string' && Boolean(value.trim());

export const validateTranscriptRequest = (req, res, next) => {
  const { url } = req.query;

  if (!isNonEmptyString(url)) {
    return next(
      new AppError(
        'A YouTube URL is required.',
        400,
        'YOUTUBE_URL_REQUIRED'
      )
    );
  }

  return next();
};

export const validateAnalysisRequest = (req, res, next) => {
  const { transcript } = req.body;

  if (!isNonEmptyString(transcript)) {
    return next(
      new AppError(
        'Transcript is required.',
        400,
        'TRANSCRIPT_REQUIRED'
      )
    );
  }

  if (transcript.trim().length > MAX_TRANSCRIPT_LENGTH) {
    return next(
      new AppError(
        `Transcript exceeds the ${MAX_TRANSCRIPT_LENGTH}-character limit.`,
        413,
        'TRANSCRIPT_TOO_LARGE'
      )
    );
  }

  return next();
};

export const validatePdfRequest = (req, res, next) => {
  const { content } = req.body;

  if (!isNonEmptyString(content)) {
    return next(
      new AppError(
        'Content is required to generate the PDF.',
        400,
        'PDF_CONTENT_REQUIRED'
      )
    );
  }

  if (content.trim().length > MAX_PDF_CONTENT_LENGTH) {
    return next(
      new AppError(
        `PDF content exceeds the ${MAX_PDF_CONTENT_LENGTH}-character limit.`,
        413,
        'PDF_CONTENT_TOO_LARGE'
      )
    );
  }

  return next();
};