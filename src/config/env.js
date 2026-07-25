import { config } from 'dotenv';

config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isTestEnvironment = nodeEnv === 'test';

if (!isTestEnvironment && !process.env.GOOGLE_API_KEY) {
  throw new Error(
    'Missing required environment variable: GOOGLE_API_KEY'
  );
}

export const env = Object.freeze({
  port: Number(process.env.PORT) || 3000,
  googleApiKey:
    process.env.GOOGLE_API_KEY || 'test-google-api-key',
  frontendUrl:
    process.env.FRONTEND_LIVE_URL || 'http://localhost:3001',
  nodeEnv
});