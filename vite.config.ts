import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// `--mode lan` serves over self-signed HTTPS so a phone on the same Wi-Fi
// can use the microphone (getUserMedia requires a secure context).
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), ...(mode === 'lan' ? [basicSsl()] : [])],
  test: { include: ['tests/**/*.test.ts'] },
}));
