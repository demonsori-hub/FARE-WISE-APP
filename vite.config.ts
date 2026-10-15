import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// Serverless dev middleware to serve /api/health and /api/taxiavailability locally
function serverlessApiPlugin(): Plugin {
  return {
    name: 'serverless-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const parsedUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
          if (parsedUrl.pathname === '/api/health') {
            const { default: handler } = await server.ssrLoadModule('/api/health.ts');
            await handler(req, res);
            return;
          }
          if (parsedUrl.pathname === '/api/taxiavailability') {
            const { default: handler } = await server.ssrLoadModule('/api/taxiavailability.ts');
            await handler(req, res);
            return;
          }
          if (parsedUrl.pathname === '/api/onemap') {
            const { default: handler } = await server.ssrLoadModule('/api/onemap.ts');
            await handler(req, res);
            return;
          }
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Serverless execution error', details: err?.message }));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), serverlessApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
