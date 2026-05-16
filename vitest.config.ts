// SPDX-Licence-Identifier: EUPL-1.2
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    target: 'es2022',
  },
  test: {
    // happy-dom carries the Web Crypto API, CustomElements, FormData,
    // <dialog>, performance.now, and crypto.subtle.* — everything the
    // form and Web Component tests need.
    environment: 'happy-dom',
    globals: false,
    include: [
      'src/**/*.test.ts',
      'src/**/*_example_test.ts',
      // Integration tests live outside src/ — keep them off the coverage path.
      'tests/**/*.test.ts',
    ],
    // Permissive on purpose: lets src/**/*.test.ts use `?raw` imports
    // for any CSS file across the lib. Later utils/elements tasks rely
    // on this; tightening will break them.
    css: {
      include: [/.+/],
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*_example_test.ts'],
    },
  },
});
