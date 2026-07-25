import request from 'supertest';
import app from '../../src/app.js';

describe('Security middleware', () => {
  it('adds security headers', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.headers).toHaveProperty(
      'x-content-type-options',
      'nosniff'
    );

    expect(response.headers).toHaveProperty(
      'x-frame-options'
    );

    expect(response.headers).not.toHaveProperty(
      'x-powered-by'
    );
  });
});