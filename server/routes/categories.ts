import { Router, Request, Response } from 'express';
import { db } from '../services/database.js';

const router = Router();

// GET /api/categories
router.get('/', (req: Request, res: Response) => {
  try {
    const categories = db.getCategories();
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/categories
router.post('/', (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Tên thể loại không được để trống.' });
    }

    const cat = db.createCategory(name);
    res.status(201).json({ success: true, data: cat });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = db.deleteCategory(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy thể loại.' });
    }
    res.json({ success: true, message: 'Đã xóa thể loại thành công.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
