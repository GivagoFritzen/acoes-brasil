import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['projects/app/src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      exclude: [
        'projects/app/src/**/*.spec.ts',
        'projects/app/src/test.ts',
        'projects/app/src/environments/**',
        '**/node_modules/**',
      ],
    },
  },
});