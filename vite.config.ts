import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `--mode artifact` は claude.ai の Artifact 用に 1 ファイルの HTML を作る。
// `--mode lan` serves over self-signed HTTPS so a phone on the same Wi-Fi
// can use the microphone (getUserMedia requires a secure context).
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), ...(mode === 'lan' ? [basicSsl()] : []), ...(mode === 'artifact' ? [viteSingleFile()] : [])],
  build: mode === 'artifact' ? { outDir: 'dist-artifact', copyPublicDir: false } : undefined,
  test: { include: ['tests/**/*.test.ts'] },
}));
