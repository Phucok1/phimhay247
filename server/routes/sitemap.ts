import { Router, Request, Response } from 'express';
import { db } from '../services/database.js';

const router = Router();

router.get('/sitemap.xml', (req: Request, res: Response) => {
  try {
    const host = req.get('host') || 'phimhay247.vn';
    const protocol = req.protocol || 'https';
    const baseUrl = `${protocol}://${host}`;

    const movies = db.getMovies({ includeHidden: false });
    const categories = db.getCategories();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

    // Thêm các danh mục
    for (const cat of categories) {
      xml += `  <url>
    <loc>${baseUrl}/the-loai/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    // Thêm các phim và tập
    for (const movie of movies) {
      const lastMod = movie.updatedAt ? movie.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `  <url>
    <loc>${baseUrl}/phim/${movie.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

      const episodes = db.getEpisodesByMovieId(movie.id);
      for (const ep of episodes) {
        xml += `  <url>
    <loc>${baseUrl}/phim/${movie.slug}/tap-${ep.episodeNumber}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  } catch (error: any) {
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
