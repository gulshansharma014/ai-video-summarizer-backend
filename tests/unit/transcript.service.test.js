import { describe, expect, it } from 'vitest';
import {
  extractVideoId
} from '../../src/services/transcript.service.js';

describe('extractVideoId', () => {
  const videoId = 'dQw4w9WgXcQ';

  it.each([
    [`https://www.youtube.com/watch?v=${videoId}`, videoId],
    [`https://youtu.be/${videoId}`, videoId],
    [`https://www.youtube.com/embed/${videoId}`, videoId],
    [`https://www.youtube.com/shorts/${videoId}`, videoId]
  ])(
    'extracts the video ID from %s',
    (url, expectedVideoId) => {
      expect(extractVideoId(url)).toBe(expectedVideoId);
    }
  );

  it('rejects an unsupported URL', () => {
    expect(() =>
      extractVideoId('https://example.com/video')
    ).toThrow('Invalid YouTube URL.');
  });

  it('rejects a missing URL', () => {
    expect(() => extractVideoId()).toThrow(
      'Please provide a valid YouTube URL.'
    );
  });
});