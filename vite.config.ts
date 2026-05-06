import type { UserConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default {
  base: './',
  build: {
    outDir: './build/',
    emptyOutDir: true,
    lib: {
      entry: './index.ts',
      name: 'pipegpu.core',
      fileName: (format) => `index.${format}.js`,
      formats: ['cjs', 'es', 'iife', 'umd'],
    },
    rollupOptions: {
      external: [],
      output: {
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    }
  },
  plugins: [
    dts({ insertTypesEntry: true, bundleTypes: true })
  ]
} satisfies UserConfig;