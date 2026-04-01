import type { UserConfig } from 'vite';

export default {
  base: './',
  build: {
    outDir: './build/',
    emptyOutDir: true,
    lib: {
      entry: './src/index.ts',
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
} satisfies UserConfig;