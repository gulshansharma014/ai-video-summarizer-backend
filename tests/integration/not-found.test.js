import request from 'supertest';
import app from '../../src/app.js';

describe('Unknown route handling', () => {
  it('returns a structured 404 response', async () => {
    const response = await request(app)
      .get('/unknown-route')
      .expect(404);

    expect(response.body).toMatchObject({
      error: 'Route not found: GET /unknown-route',
      code: 'ROUTE_NOT_FOUND'
    });
  });
});