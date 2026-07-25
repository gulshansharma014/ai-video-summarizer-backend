import { describe, expect, it } from 'vitest';
import {
  validatePdfContent
} from '../../src/services/pdf.service.js';

describe('validatePdfContent', () => {
  it('returns trimmed PDF content', () => {
    expect(
      validatePdfContent('  Generated summary  ')
    ).toBe('Generated summary');
  });

  it('rejects empty content', () => {
    expect(() => validatePdfContent('   ')).toThrow(
      'Content is required to generate the PDF.'
    );
  });

  it('rejects undefined content', () => {
    expect(() => validatePdfContent()).toThrow(
      'Content is required to generate the PDF.'
    );
  });
});