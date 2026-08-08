import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['projects/app/src/**/*.spec.ts'],
    setupFiles: ['projects/app/src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      thresholds: {
        statements: 50,
        branches: 50,
        functions: 50,
        lines: 50,
      },
      exclude: [
        'projects/app/src/**/*.spec.ts',
        'projects/app/src/test.ts',
        'projects/app/src/environments/**',
        '**/node_modules/**',
      ],
    },
  },
});
