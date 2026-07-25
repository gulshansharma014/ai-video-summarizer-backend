import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: [
        'src/config/gemini.js',
        'src/config/env.js'
      ],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 70,
        statements: 75
      }
    }
  }
});