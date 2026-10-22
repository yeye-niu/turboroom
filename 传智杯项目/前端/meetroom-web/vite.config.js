// Nginx serves the checked-in public directory directly. This Vite-compatible
// configuration is provided for IDE tooling and an optional future bundling step.
import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  build: { outDir: 'dist', emptyOutDir: true },
  server: { port: 3000, proxy: { '/meetroom': 'http://127.0.0.1:8888', '/pic': 'http://127.0.0.1:8888' } }
});
