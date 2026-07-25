import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('POST /api/download-analyzed-pdf', () => {
  it('streams a generated PDF', async () => {
    const response = await request(app)
      .post('/api/download-analyzed-pdf')
      .send({
        content: 'Generated video summary'
      })
      .buffer(true)
      .parse((res, callback) => {
        const chunks = [];

        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () =>
          callback(null, Buffer.concat(chunks))
        );
      })
      .expect(200);

    expect(response.headers['content-type']).toContain(
      'application/pdf'
    );

    expect(
      response.headers['content-disposition']
    ).toContain('attachment');

    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.subarray(0, 4).toString()).toBe(
      '%PDF'
    );
  });

  it('rejects oversized PDF content', async () => {
    const response = await request(app)
      .post('/api/download-analyzed-pdf')
      .send({
        content: 'a'.repeat(150_001)
      })
      .expect(413);

    expect(response.body.code).toBe(
      'PDF_CONTENT_TOO_LARGE'
    );
  });
});