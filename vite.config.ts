import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import fs from 'fs';
import {execSync} from 'child_process';

// Version info baked into every build: shown in the app and served at /api/version.
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));
const gitCommit = (() => {
  if (process.env.CQ_COMMIT) return process.env.CQ_COMMIT.slice(0, 7);
  try { return execSync('git rev-parse --short HEAD', {stdio: ['ignore', 'pipe', 'ignore']}).toString().trim(); } catch { return 'unknown'; }
})();
const buildInfo = {version: pkg.version as string, commit: gitCommit, builtAt: new Date().toISOString()};
const writeVersionFile = (): Plugin => ({
  name: 'cq-version-file',
  apply: 'build',
  generateBundle() {
    this.emitFile({type: 'asset', fileName: 'version.json', source: JSON.stringify(buildInfo, null, 2)});
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), writeVersionFile()],
    define: {
      __CQ_BUILD__: JSON.stringify(buildInfo),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('dompurify')) {
                return 'pdf-vendor';
              }
              if (id.includes('canvas-confetti')) {
                return 'confetti-vendor';
              }
              if (id.includes('lucide-react')) {
                return 'lucide-vendor';
              }
              if (id.includes('motion')) {
                return 'motion-vendor';
              }
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
