import { Router, Request, Response } from 'express';
import { db } from '../services/database.js';

const router = Router();

// GET /api/movies
router.get('/', (req: Request, res: Response) => {
  try {
    const { category, status, search, sort, limit, featured, includeHidden } = req.query;

    const movies = db.getMovies({
      categorySlug: category ? String(category) : undefined,
      status: status ? String(status) : undefined,
      search: search ? String(search) : undefined,
      sort: (sort as any) || 'updated',
      limit: limit ? parseInt(String(limit), 10) : undefined,
      featured: featured !== undefined ? featured === 'true' : undefined,
      includeHidden: includeHidden === 'true',
    });

    res.json({ success: true, data: movies });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/movies/:slug
router.get('/:slug', (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    let movie = db.getMovieBySlug(slug);
    if (!movie) {
      // Thử tìm theo ID
      movie = db.getMovieById(slug);
    }

    if (!movie) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy bộ phim này.' });
    }

    const episodes = db.getEpisodesByMovieId(movie.id);

    // Lấy thêm 6 phim liên quan (cùng thể loại)
    const related = db
      .getMovies({ includeHidden: false })
      .filter((m) => m.id !== movie!.id && m.category.some((c) => movie!.category.includes(c)))
      .slice(0, 6);

    res.json({
      success: true,
      data: {
        ...movie,
        episodes,
        related,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/movies (Tạo phim mới)
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, slug, description, posterUrl, bannerUrl, category, year, status, keywords, seoTitle, seoDescription, hidden, featured } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Tên phim không được để trống.' });
    }

    const movie = db.createMovie({
      title,
      slug,
      description,
      posterUrl,
      bannerUrl,
      category: Array.isArray(category) ? category : [category].filter(Boolean),
      year: year ? parseInt(year, 10) : new Date().getFullYear(),
      status: status || 'Đang cập nhật',
      keywords,
      seoTitle,
      seoDescription,
      hidden: !!hidden,
      featured: !!featured,
    });

    res.status(201).json({ success: true, data: movie });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/movies/:id (Cập nhật phim)
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.updateMovie(id, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy bộ phim để cập nhật.' });
    }

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/movies/:id/toggle-hidden
router.patch('/:id/toggle-hidden', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movie = db.getMovieById(id);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy bộ phim.' });
    }

    const updated = db.updateMovie(id, { hidden: !movie.hidden });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/movies/:id (Xóa phim)
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = db.deleteMovie(id);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy bộ phim để xóa.' });
    }

    res.json({ success: true, message: 'Đã xóa bộ phim và toàn bộ các tập thành công.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
