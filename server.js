import app from './src/app.js';
import { env } from './src/config/env.js';

const server = app.listen(env.port, () => {
  console.log(
    `AI Video Summarizer backend running on port ${env.port}`
  );
});

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully.`);

  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));