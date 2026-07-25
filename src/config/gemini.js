import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env.js';

const genAI = new GoogleGenerativeAI(env.googleApiKey);

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash'
});