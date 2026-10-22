import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  clean: true,
  // @ipolens/shared ships TypeScript source, so bundle it in.
  noExternal: ['@ipolens/shared'],
});
