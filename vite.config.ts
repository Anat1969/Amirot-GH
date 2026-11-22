import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { articlesFeed } from './src/data/feed';

// articles.json נכתב בכל בנייה מתוך articles.ts, כדי שהמגזין "חוט" יקרא את הכתבות מכאן ולא יחזיק עותק.
const feed = (): Plugin => ({
  name: 'articles-feed',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'articles.json', source: JSON.stringify(articlesFeed(), null, 2) + '\n' });
  },
  configureServer(server) {
    server.middlewares.use('/articles.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(articlesFeed()));
    });
  },
});

export default defineConfig({ plugins: [react(), feed()], base: '/' });
