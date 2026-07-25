import request from 'supertest';
import app from '../../src/app.js';

describe('Request validation', () => {
  describe('GET /api/transcript', () => {
    it('rejects a missing YouTube URL', async () => {
      const response = await request(app)
        .get('/api/transcript')
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'A YouTube URL is required.',
        code: 'YOUTUBE_URL_REQUIRED'
      });
    });

    it('rejects an invalid YouTube URL', async () => {
      const response = await request(app)
        .get('/api/transcript')
        .query({
          url: 'not-a-youtube-url'
        })
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Invalid YouTube URL.',
        code: 'INVALID_YOUTUBE_URL'
      });
    });
  });

  describe('POST /api/analyze-transcript', () => {
    it('rejects a missing transcript', async () => {
      const response = await request(app)
        .post('/api/analyze-transcript')
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Transcript is required.',
        code: 'TRANSCRIPT_REQUIRED'
      });
    });

    it('rejects an empty transcript', async () => {
      const response = await request(app)
        .post('/api/analyze-transcript')
        .send({
          transcript: '   '
        })
        .expect(400);

      expect(response.body.code).toBe('TRANSCRIPT_REQUIRED');
    });

    it('rejects transcripts above the permitted limit', async () => {
      const response = await request(app)
        .post('/api/analyze-transcript')
        .send({
          transcript: 'a'.repeat(100_001)
        })
        .expect(413);

      expect(response.body.code).toBe(
        'TRANSCRIPT_TOO_LARGE'
      );
    });
  });

  describe('POST /api/download-analyzed-pdf', () => {
    it('rejects missing PDF content', async () => {
      const response = await request(app)
        .post('/api/download-analyzed-pdf')
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Content is required to generate the PDF.',
        code: 'PDF_CONTENT_REQUIRED'
      });
    });
  });
});