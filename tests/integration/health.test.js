import request from 'supertest';
import app from '../../src/app.js';

describe('GET /health', () => {
  it('returns the service health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'UP',
      service: 'ai-video-summarizer-backend'
    });

    expect(response.body.timestamp).toBeDefined();
  });
});