import { streamPdf, validatePdfContent } from '../services/pdf.service.js';

export const downloadAnalysedPdf = (req, res) => {
  const content = validatePdfContent(req.body.content);
  const filename = `analysed-transcript-${Date.now()}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${filename}"`
  );

  streamPdf(content, res);
};