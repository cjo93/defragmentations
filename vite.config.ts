import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Inject env vars at build time (Vercel sets these in the dashboard)
      'process.env.HF_TOKEN': JSON.stringify(env.VITE_HF_TOKEN || ''),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    build: {
      // Ensure clean production output
      sourcemap: false,
      target: 'es2020',
    },
  };
});