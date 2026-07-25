import { YoutubeTranscript } from 'youtube-transcript';
import { fetchTranscript as fetchTranscriptFallback } from 'youtube-transcript-plus';

import AppError from '../utils/AppError.js';

const TRANSCRIPT_TIMEOUT_MS = 20_000;

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/137.0.0.0 Safari/537.36';

function extractVideoId(input) {
  if (!input || typeof input !== 'string') {
    throw new AppError(
      'A YouTube URL is required.',
      400,
      'YOUTUBE_URL_REQUIRED'
    );
  }

  const trimmedInput = input.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedInput)) {
    return trimmedInput;
  }

  try {
    const parsedUrl = new URL(trimmedInput);
    const hostname = parsedUrl.hostname.replace(/^www\./, '');

    if (hostname === 'youtu.be') {
      const videoId = parsedUrl.pathname.split('/').filter(Boolean)[0];

      if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return videoId;
      }
    }

    if (
      hostname === 'youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname === 'music.youtube.com'
    ) {
      const queryVideoId = parsedUrl.searchParams.get('v');

      if (/^[a-zA-Z0-9_-]{11}$/.test(queryVideoId)) {
        return queryVideoId;
      }

      const pathMatch = parsedUrl.pathname.match(
        /^\/(?:shorts|embed|live)\/([a-zA-Z0-9_-]{11})/
      );

      if (pathMatch?.[1]) {
        return pathMatch[1];
      }
    }
  } catch {
    // Converted to a controlled validation error below.
  }

  throw new AppError(
    'Please provide a valid YouTube URL.',
    400,
    'INVALID_YOUTUBE_URL'
  );
}

function withTimeout(promise, timeoutMs, providerName) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          `${providerName} transcript request timed out after ${timeoutMs}ms`
        )
      );
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

function normaliseTranscript(entries) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => ({
      text: String(entry?.text ?? '').trim(),
      offset: Number(entry?.offset ?? entry?.start ?? 0),
      duration: Number(entry?.duration ?? 0),
    }))
    .filter((entry) => entry.text);
}

async function fetchUsingPrimaryProvider(videoId) {
  const entries = await withTimeout(
    YoutubeTranscript.fetchTranscript(videoId),
    TRANSCRIPT_TIMEOUT_MS,
    'Primary'
  );

  return normaliseTranscript(entries);
}

async function fetchUsingFallbackProvider(videoId) {
  const entries = await withTimeout(
    fetchTranscriptFallback(videoId, {
      userAgent: BROWSER_USER_AGENT,
    }),
    TRANSCRIPT_TIMEOUT_MS,
    'Fallback'
  );

  return normaliseTranscript(entries);
}

function isRateLimitError(error) {
  const message = error?.message?.toLowerCase() ?? '';

  return (
    message.includes('too many request') ||
    message.includes('rate limit') ||
    message.includes('429')
  );
}

function isTimeoutError(error) {
  return error?.message?.toLowerCase().includes('timed out');
}

function isTranscriptUnavailableError(error) {
  const message = error?.message?.toLowerCase() ?? '';

  return (
    message.includes('transcript is disabled') ||
    message.includes('transcript disabled') ||
    message.includes('no transcript') ||
    message.includes('transcript not available') ||
    message.includes('could not retrieve')
  );
}

export async function fetchTranscript(videoUrl) {
  const videoId = extractVideoId(videoUrl);
  const providerFailures = [];

  try {
    console.info('Trying primary transcript provider', {
      videoId,
    });

    const transcriptEntries =
      await fetchUsingPrimaryProvider(videoId);

    if (transcriptEntries.length > 0) {
      console.info('Primary transcript provider succeeded', {
        videoId,
        entries: transcriptEntries.length,
      });

      return {
        videoId,
        transcript: transcriptEntries
          .map((entry) => entry.text)
          .join(' ')
          .trim(),
        entries: transcriptEntries,
        provider: 'youtube-transcript',
      };
    }

    providerFailures.push({
      provider: 'youtube-transcript',
      message: 'Provider returned an empty transcript.',
    });
  } catch (error) {
    providerFailures.push({
      provider: 'youtube-transcript',
      message: error?.message ?? 'Unknown primary provider error',
    });

    console.warn('Primary transcript provider failed', {
      videoId,
      name: error?.name,
      message: error?.message,
    });
  }

  try {
    console.info('Trying fallback transcript provider', {
      videoId,
    });

    const transcriptEntries =
      await fetchUsingFallbackProvider(videoId);

    if (transcriptEntries.length > 0) {
      console.info('Fallback transcript provider succeeded', {
        videoId,
        entries: transcriptEntries.length,
      });

      return {
        videoId,
        transcript: transcriptEntries
          .map((entry) => entry.text)
          .join(' ')
          .trim(),
        entries: transcriptEntries,
        provider: 'youtube-transcript-plus',
      };
    }

    providerFailures.push({
      provider: 'youtube-transcript-plus',
      message: 'Provider returned an empty transcript.',
    });
  } catch (error) {
    providerFailures.push({
      provider: 'youtube-transcript-plus',
      message: error?.message ?? 'Unknown fallback provider error',
    });

    console.error('Fallback transcript provider failed', {
      videoId,
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });

    if (isRateLimitError(error)) {
      throw new AppError(
        'YouTube temporarily limited transcript requests. Please try again later.',
        429,
        'YOUTUBE_RATE_LIMITED'
      );
    }

    if (isTimeoutError(error)) {
      throw new AppError(
        'Transcript extraction timed out. Please try again.',
        504,
        'TRANSCRIPT_TIMEOUT'
      );
    }
  }

  console.error('All transcript providers failed', {
    videoId,
    providerFailures,
  });

  const allUnavailable = providerFailures.every((failure) =>
    isTranscriptUnavailableError({
      message: failure.message,
    })
  );

  if (allUnavailable) {
    throw new AppError(
      'A transcript could not be retrieved for this video.',
      422,
      'TRANSCRIPT_NOT_RETRIEVABLE'
    );
  }

  throw new AppError(
    'Transcript extraction failed unexpectedly.',
    500,
    'TRANSCRIPT_EXTRACTION_FAILED'
  );
}