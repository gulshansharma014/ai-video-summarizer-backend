import { config } from 'dotenv';

config();

const requiredVariables = ['GOOGLE_API_KEY'];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

export const env = Object.freeze({
  port: Number(process.env.PORT) || 3000,
  googleApiKey: process.env.GOOGLE_API_KEY,
  frontendUrl: process.env.FRONTEND_LIVE_URL || 'http://localhost:3001',
  nodeEnv: process.env.NODE_ENV || 'development'
});