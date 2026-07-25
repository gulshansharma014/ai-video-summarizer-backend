import { geminiModel } from '../config/gemini.js';
import { AppError } from '../utils/app-error.js';

const MAX_TRANSCRIPT_LENGTH = 100_000;

const buildAnalysisPrompt = (transcript) => `
Analyse the following video transcript and transform it into structured,
easy-to-review learning notes.

Return the response with:

1. A concise overview
2. Main ideas and key points
3. Important examples or scenarios
4. Practical takeaways
5. Bonus tips for understanding or remembering the topic

Use clear headings, concise paragraphs and readable bullet points.

Transcript:
${transcript}
`;

export const analyseTranscript = async (transcript) => {
  if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
    throw new AppError(
      'Transcript is required.',
      400,
      'TRANSCRIPT_REQUIRED'
    );
  }

  const normalizedTranscript = transcript.trim();

  if (normalizedTranscript.length > MAX_TRANSCRIPT_LENGTH) {
    throw new AppError(
      `Transcript exceeds the ${MAX_TRANSCRIPT_LENGTH}-character limit.`,
      413,
      'TRANSCRIPT_TOO_LARGE'
    );
  }

  try {
    const result = await geminiModel.generateContent(
      buildAnalysisPrompt(normalizedTranscript)
    );

    const generatedText = result.response.text()?.trim();

    if (!generatedText) {
      throw new AppError(
        'The AI provider returned an empty analysis.',
        502,
        'EMPTY_AI_RESPONSE'
      );
    }

    return generatedText;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      'Failed to analyse the transcript.',
      502,
      'AI_PROVIDER_ERROR'
    );
  }
};