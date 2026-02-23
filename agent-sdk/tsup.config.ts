import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  target: 'es2020',
  platform: 'neutral',
  esbuildOptions(options) {
    options.define = {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    };
  },
});
