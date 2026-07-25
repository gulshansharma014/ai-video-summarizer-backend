import PDFDocument from 'pdfkit';
import { AppError } from '../utils/app-error.js';

export const validatePdfContent = (content) => {
  if (!content || typeof content !== 'string' || !content.trim()) {
    throw new AppError(
      'Content is required to generate the PDF.',
      400,
      'PDF_CONTENT_REQUIRED'
    );
  }

  return content.trim();
};

export const streamPdf = (content, writableStream) => {
  const normalizedContent = validatePdfContent(content);

  const document = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: 'AI Video Summary',
      Author: 'AI Video Summarizer'
    }
  });

  document.on('error', (error) => {
    writableStream.destroy(error);
  });

  document.pipe(writableStream);

  document
    .fontSize(20)
    .text('AI Video Summary', {
      align: 'center'
    })
    .moveDown();

  document
    .fontSize(11)
    .text(normalizedContent, {
      align: 'left',
      lineGap: 4
    });

  document.end();
};