import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/config/gemini.js', () => ({
  geminiModel: {
    generateContent: vi.fn()
  }
}));

import { geminiModel } from '../../src/config/gemini.js';
import {
  analyseTranscript
} from '../../src/services/analysis.service.js';

describe('analyseTranscript', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the generated analysis', async () => {
    geminiModel.generateContent.mockResolvedValue({
      response: {
        text: () => '  Structured analysis  '
      }
    });

    await expect(
      analyseTranscript('Sample transcript')
    ).resolves.toBe('Structured analysis');

    expect(geminiModel.generateContent).toHaveBeenCalledOnce();
  });

  it('rejects an empty transcript', async () => {
    await expect(
      analyseTranscript('   ')
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'TRANSCRIPT_REQUIRED'
    });
  });

  it('rejects an oversized transcript', async () => {
    await expect(
      analyseTranscript('a'.repeat(100_001))
    ).rejects.toMatchObject({
      statusCode: 413,
      code: 'TRANSCRIPT_TOO_LARGE'
    });
  });

  it('rejects an empty AI response', async () => {
    geminiModel.generateContent.mockResolvedValue({
      response: {
        text: () => '   '
      }
    });

    await expect(
      analyseTranscript('Sample transcript')
    ).rejects.toMatchObject({
      statusCode: 502,
      code: 'EMPTY_AI_RESPONSE'
    });
  });

  it('converts provider failures into an operational error', async () => {
    geminiModel.generateContent.mockRejectedValue(
      new Error('Provider unavailable')
    );

    await expect(
      analyseTranscript('Sample transcript')
    ).rejects.toMatchObject({
      statusCode: 502,
      code: 'AI_PROVIDER_ERROR'
    });
  });
});