import { defineConfig } from 'vitest/config';
import { webdriverio } from "@vitest/browser-webdriverio";

/**
 * @description
 *  https://vitest.dev/guide/browser/#browser-option-types
 *  - webdriverio support chrome env
 *  - webdriverio chrome support webgpu context
 * 
 */
export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html']
    },
    browser: {
      enabled: true,
      provider: webdriverio(),
      instances: [
        { browser: 'chrome' },
      ],
    },
    exclude: [],
    include: ['test/**/*.{test,spec}.?(c|m)[jt]s?(x)']
  }
})