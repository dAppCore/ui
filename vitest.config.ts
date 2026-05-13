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
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*_example_test.ts'],
    },
  },
});
