import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

vi.mock('../../src/config/gemini.js', () => ({
  geminiModel: {
    generateContent: vi.fn()
  }
}));

import { geminiModel } from '../../src/config/gemini.js';
import app from '../../src/app.js';

describe('POST /api/analyze-transcript', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an AI-generated analysis', async () => {
    geminiModel.generateContent.mockResolvedValue({
      response: {
        text: () => 'Generated learning notes'
      }
    });

    const response = await request(app)
      .post('/api/analyze-transcript')
      .send({
        transcript: 'A valid video transcript'
      })
      .expect(200);

    expect(response.body).toEqual({
      analyzedTranscript: 'Generated learning notes'
    });
  });

  it('returns a structured provider error', async () => {
    geminiModel.generateContent.mockRejectedValue(
      new Error('Gemini unavailable')
    );

    const response = await request(app)
      .post('/api/analyze-transcript')
      .send({
        transcript: 'A valid video transcript'
      })
      .expect(502);

    expect(response.body).toMatchObject({
      error: 'Failed to analyse the transcript.',
      code: 'AI_PROVIDER_ERROR'
    });
  });
});