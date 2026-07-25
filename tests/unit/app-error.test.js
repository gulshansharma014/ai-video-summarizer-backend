import { describe, expect, it } from 'vitest';
import { AppError } from '../../src/utils/app-error.js';

describe('AppError', () => {
  it('creates an operational application error', () => {
    const error = new AppError(
      'Invalid request',
      400,
      'INVALID_REQUEST'
    );

    expect(error).toMatchObject({
      name: 'AppError',
      message: 'Invalid request',
      statusCode: 400,
      code: 'INVALID_REQUEST',
      isOperational: true
    });

    expect(error.stack).toBeDefined();
  });

  it('uses default values', () => {
    const error = new AppError('Unexpected error');

    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
  });
});