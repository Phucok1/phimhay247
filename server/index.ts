import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import moviesRouter from './routes/movies.js';
import episodesRouter from './routes/episodes.js';
import playlistRouter from './routes/playlist.js';
import categoriesRouter from './routes/categories.js';
import settingsRouter from './routes/settings.js';
import statsRouter from './routes/stats.js';
import sitemapRouter from './routes/sitemap.js';
import chatRouter from './routes/chat.js';
import feedbackRouter from './routes/feedback.js';
import memberMoviesRouter from './routes/memberMovies.js';
import novelsRouter from './routes/novels.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in dev
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production' && req.url.startsWith('/api')) {
      console.log(`[${req.method}] ${req.url} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Sitemap & SEO Routes
app.use('/', sitemapRouter);

// API Routes
app.use('/api/movies', moviesRouter);
app.use('/api/episodes', episodesRouter);
app.use('/api/playlist', playlistRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/member-movies', memberMoviesRouter);
app.use('/api/novels', novelsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    site: 'PHIM HAY 247',
    channel: 'https://www.youtube.com/@phimhay.momtiti',
    timestamp: new Date().toISOString(),
  });
});

// Phục vụ Frontend React (dist) khi chạy production
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Điều hướng toàn bộ route còn lại về index.html cho React Router xử lý (không cache index.html để luôn nhận code mới)
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api') || req.url === '/sitemap.xml') {
      return next();
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Đã có lỗi hệ thống xảy ra trên server.',
  });
});

// Chặn sập tiến trình khi gặp lỗi mạng bất ngờ hoặc Promise không bắt lỗi
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT_EXCEPTION]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED_REJECTION]', reason);
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🎬 PHIM HAY 247 API Server running!`);
  console.log(`🚀 Port: http://localhost:${PORT}`);
  console.log(`🔗 Channel: https://www.youtube.com/@phimhay.momtiti`);
  console.log(`=========================================`);
});
