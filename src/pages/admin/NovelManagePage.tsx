import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Layers,
  Search,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  X,
  ExternalLink,
  Zap,
  Globe,
  DownloadCloud,
} from 'lucide-react';
import {
  fetchNovels,
  createNovel,
  updateNovel,
  deleteNovel,
  fetchNovelBySlug,
  addChapter,
  importChapters,
  deleteChapter,
  crawlWebnovelStory,
  importNovelsBackup,
} from '../../services/api';
import { Novel, Chapter } from '../../types';

export const NovelManagePage: React.FC = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal Cào Truyện Tự Động Webnovel.vn & MeTruyenHot
  const [crawlModalOpen, setCrawlModalOpen] = useState(false);
  const [crawlUrl, setCrawlUrl] = useState('');
  const [crawlLimit, setCrawlLimit] = useState<number | 'all'>('all');
  const [crawlStartChapter, setCrawlStartChapter] = useState(1);
  const [crawling, setCrawling] = useState(false);
  const [crawlError, setCrawlError] = useState<string | null>(null);
  const [crawlProgress, setCrawlProgress] = useState<{
    current: number;
    total: number;
    text: string;
  } | null>(null);

  // Modal Tạo/Sửa Truyện
  const [novelModalOpen, setNovelModalOpen] = useState(false);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Tiên Hiệp, Kiếm Hiệp',
    coverUrl: '',
    description: '',
    status: 'Đang ra' as 'Đang ra' | 'Hoàn thành',
    linkedMovieSlug: '',
  });

  // Modal Quản Lý Chương
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [currentNovel, setCurrentNovel] = useState<Novel | null>(null);
  const [chapterTab, setChapterTab] = useState<'list' | 'add' | 'bulk'>('list');

  // Thêm 1 chương
  const [singleChapter, setSingleChapter] = useState({
    chapterNumber: 1,
    title: '',
    content: '',
  });

  // Nhập hàng loạt / Upload file .txt
  const [bulkText, setBulkText] = useState('');
  const [parsedChapters, setParsedChapters] = useState<Chapter[]>([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchNovels();
      setNovels(data);
    } catch (err) {
      console.error('Lỗi tải danh sách truyện:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateNovel = () => {
    setEditingNovel(null);
    setFormData({
      title: '',
      author: '',
      category: 'Tiên Hiệp, Kiếm Hiệp',
      coverUrl: '',
      description: '',
      status: 'Đang ra',
      linkedMovieSlug: '',
    });
    setNovelModalOpen(true);
  };

  const handleOpenEditNovel = (n: Novel) => {
    setEditingNovel(n);
    setFormData({
      title: n.title,
      author: n.author,
      category: (n.category || []).join(', '),
      coverUrl: n.coverUrl || '',
      description: n.description || '',
      status: n.status || 'Đang ra',
      linkedMovieSlug: n.linkedMovieSlug || '',
    });
    setNovelModalOpen(true);
  };

  const handleSaveNovel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const catArray = formData.category.split(',').map((c) => c.trim()).filter(Boolean);
      const payload: Partial<Novel> = {
        title: formData.title,
        author: formData.author,
        category: catArray,
        coverUrl: formData.coverUrl,
        description: formData.description,
        status: formData.status,
        linkedMovieSlug: formData.linkedMovieSlug,
      };

      if (editingNovel) {
        await updateNovel(editingNovel.id, payload);
      } else {
        await createNovel(payload);
      }

      setNovelModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu bộ truyện.');
    }
  };

  const handleDeleteNovel = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bộ truyện "${title}" không?`)) return;
    try {
      await deleteNovel(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa truyện.');
    }
  };

  // Mở modal quản lý chương
  const handleOpenChapterManager = async (n: Novel) => {
    try {
      const full = await fetchNovelBySlug(n.slug);
      setCurrentNovel(full);
      const nextNum = (full.chapters?.length || 0) + 1;
      setSingleChapter({
        chapterNumber: nextNum,
        title: `Chương ${nextNum}`,
        content: '',
      });
      setChapterTab('list');
      setParsedChapters([]);
      setBulkText('');
      setChapterModalOpen(true);
    } catch (err) {
      alert('Lỗi tải danh sách chương.');
    }
  };

  // Lưu 1 chương đơn lẻ
  const handleSaveSingleChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNovel || !singleChapter.content.trim()) return;

    try {
      await addChapter(currentNovel.id, {
        chapterNumber: singleChapter.chapterNumber,
        title: singleChapter.title || `Chương ${singleChapter.chapterNumber}`,
        content: singleChapter.content,
      });

      alert(`Đã lưu Chương ${singleChapter.chapterNumber} thành công!`);
      const updated = await fetchNovelBySlug(currentNovel.slug);
      setCurrentNovel(updated);
      setSingleChapter({
        chapterNumber: (updated.chapters?.length || 0) + 1,
        title: `Chương ${(updated.chapters?.length || 0) + 1}`,
        content: '',
      });
      setChapterTab('list');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu chương.');
    }
  };

  // Xóa 1 chương
  const handleDeleteChapter = async (chapterNumber: number) => {
    if (!currentNovel || !window.confirm(`Xóa Chương ${chapterNumber}?`)) return;
    try {
      await deleteChapter(currentNovel.id, chapterNumber);
      const updated = await fetchNovelBySlug(currentNovel.slug);
      setCurrentNovel(updated);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa chương.');
    }
  };

  // Bộ phân tích văn bản thành danh sách chương tự động
  const parseBulkTextIntoChapters = (text: string) => {
    if (!text.trim()) return [];

    // Tìm các vị trí xuất hiện của "Chương X: ..." hoặc "Hồi X: ..." hoặc "Chapter X: ..."
    const chapterRegex = /(?:Chương|Hồi|Chapter)\s+(\d+)[:\s]*(.*?)(?=(?:Chương|Hồi|Chapter)\s+\d+|$)/gis;
    const matches: Chapter[] = [];

    let match;
    while ((match = chapterRegex.exec(text)) !== null) {
      const cNum = parseInt(match[1], 10);
      const rawHeader = match[2].trim();
      const firstLineBreak = rawHeader.indexOf('\n');
      let title = `Chương ${cNum}`;
      let content = '';

      if (firstLineBreak !== -1) {
        title = `Chương ${cNum}: ${rawHeader.slice(0, firstLineBreak).trim()}`;
        content = rawHeader.slice(firstLineBreak).trim();
      } else {
        title = `Chương ${cNum}`;
        content = rawHeader;
      }

      if (content) {
        matches.push({
          chapterNumber: cNum,
          title,
          content,
        });
      }
    }

    // Nếu không khớp regex Chương, thử chia theo dòng trắng nếu có
    return matches;
  };

  // Xử lý upload file .txt
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBulkText(text);
      const parsed = parseBulkTextIntoChapters(text);
      setParsedChapters(parsed);
    };
    reader.readAsText(file, 'utf-8');
  };

  // Nhập hàng loạt vào database
  const handleImportParsedChapters = async () => {
    if (!currentNovel || parsedChapters.length === 0) return;
    try {
      setImporting(true);
      const res = await importChapters(currentNovel.id, parsedChapters);
      alert(res.message || `Đã nhập thành công ${parsedChapters.length} chương!`);
      const updated = await fetchNovelBySlug(currentNovel.slug);
      setCurrentNovel(updated);
      setParsedChapters([]);
      setBulkText('');
      setChapterTab('list');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi nhập danh sách chương.');
    } finally {
      setImporting(false);
    }
  };

  // Cào truyện tự động từ Webnovel.vn & MeTruyenHot (tự động chia nhỏ đợt an toàn không lag server)
  const handleStartCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crawlUrl.trim()) return;

    setCrawling(true);
    setCrawlError(null);

    try {
      let currentStart = crawlStartChapter;
      let totalFetched = 0;
      const isFull = crawlLimit === 'all';
      const targetLimit = isFull ? Infinity : Number(crawlLimit);
      let isDone = false;
      let lastTotalInDb = 0;
      let detectedMaxCh = 0;

      setCrawlProgress({
        current: 0,
        total: isFull ? 0 : targetLimit,
        text: 'Đang kết nối tới trang nguồn...',
      });

      while (!isDone && (isFull || totalFetched < targetLimit)) {
        const chunkSize = isFull ? 30 : Math.min(30, targetLimit - totalFetched);
        setCrawlProgress({
          current: totalFetched,
          total: isFull ? (detectedMaxCh || 0) : targetLimit,
          text: `Đang cào các chương từ ${currentStart}... (Đã tải ${totalFetched} chương mới)`,
        });

        const res = await crawlWebnovelStory(crawlUrl.trim(), chunkSize, currentStart);

        if (!res.success || res.chapterCount === 0) {
          isDone = true;
          break;
        }

        totalFetched += res.chapterCount;
        lastTotalInDb = res.totalChapters;
        detectedMaxCh = Math.max(detectedMaxCh, res.detectedMax || 0, lastTotalInDb);
        currentStart = res.nextStartChapter || currentStart + res.chapterCount;

        setCrawlProgress({
          current: totalFetched,
          total: isFull ? (detectedMaxCh || 0) : targetLimit,
          text: `Đã lưu đến chương ${lastTotalInDb}...`,
        });

        if (res.reachedEnd) {
          isDone = true;
          break;
        }

        if (res.chapterCount < chunkSize) {
          isDone = true;
          break;
        }

        // Nghỉ nhẹ 600ms giữa các đợt để server V8 Garbage Collection thu hồi RAM
        await new Promise((r) => setTimeout(r, 600));
      }

      alert(
        `🎉 Hoàn tất cào truyện! Đã lưu thành công ${totalFetched} chương mới (Hiện có tổng cộng: ${lastTotalInDb || totalFetched} chương trong kho).`
      );
      setCrawlModalOpen(false);
      setCrawlUrl('');
      setCrawlProgress(null);
      loadData();
    } catch (err: any) {
      setCrawlError(err.response?.data?.error || err.message || 'Lỗi khi cào truyện.');
    } finally {
      setCrawling(false);
      setCrawlProgress(null);
    }
  };

  const handleImportNovels = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await importNovelsBackup(json);
      alert(res.message || 'Khôi phục truyện thành công!');
      loadData();
    } catch (err: any) {
      alert('File JSON không hợp lệ: ' + (err.message || 'Lỗi'));
    }
  };

  const filteredNovels = novels.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <span>Quản Lý Tủ Sách Truyện Chữ</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Đăng truyện, cào truyện tự động, tải lên file (.txt) tự động tách chương
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Nút Sao lưu truyện */}
          <a
            href="/api/novels/admin/export"
            download
            className="px-3.5 py-2.5 rounded-xl bg-cinema-850 hover:bg-cinema-800 text-gray-200 border border-cinema-700 font-bold text-xs transition flex items-center gap-2"
            title="Tải toàn bộ danh sách truyện và các chương về máy tính"
          >
            <DownloadCloud className="w-4 h-4 text-emerald-400" />
            <span>Sao Lưu Truyện (.json)</span>
          </a>

          {/* Nút Khôi phục truyện */}
          <label
            className="px-3.5 py-2.5 rounded-xl bg-cinema-850 hover:bg-cinema-800 text-gray-200 border border-cinema-700 font-bold text-xs transition flex items-center gap-2 cursor-pointer"
            title="Khôi phục dữ liệu truyện từ file backup JSON"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Khôi Phục Truyện</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportNovels}
            />
          </label>

          <button
            type="button"
            onClick={() => {
              setCrawlUrl('');
              setCrawlError(null);
              setCrawlModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-emerald-950/40 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>⚡ Cào Webnovel & MeTruyenHot</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateNovel}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-cinema-950 font-bold text-xs sm:text-sm transition shadow-lg shadow-amber-950/40 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Bộ Truyện Mới</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên truyện, tác giả..."
            className="w-full pl-9 pr-4 py-2 bg-cinema-900 border border-cinema-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-gray-400 font-medium">
          Tổng số: <strong className="text-amber-400">{filteredNovels.length}</strong> bộ truyện
        </span>
      </div>

      {/* Danh sách bảng truyện */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
          <p className="text-xs">Đang tải danh sách truyện...</p>
        </div>
      ) : filteredNovels.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-cinema-900 border border-cinema-800 text-gray-400 text-xs">
          Chưa có bộ truyện nào. Hãy bấm "Thêm Bộ Truyện Mới" để bắt đầu!
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-cinema-800 bg-cinema-950/60 text-gray-400 font-bold uppercase tracking-wider">
                <th className="p-4">Bìa / Tên Truyện</th>
                <th className="p-4">Tác giả</th>
                <th className="p-4">Thể loại</th>
                <th className="p-4 text-center">Số chương</th>
                <th className="p-4 text-center">Lượt xem</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-800/60 text-gray-300">
              {filteredNovels.map((novel) => (
                <tr key={novel.id} className="hover:bg-cinema-850/60 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={novel.coverUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100'}
                        alt={novel.title}
                        className="w-10 h-14 object-cover rounded-lg bg-cinema-950 border border-cinema-700 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-white text-sm block truncate max-w-xs sm:max-w-sm">
                          {novel.title}
                        </span>
                        <span className="text-[11px] text-gray-500 font-mono">
                          /truyen/{novel.slug}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-amber-300">{novel.author}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(novel.category || []).map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 rounded bg-cinema-800 text-[10px] text-gray-300 border border-cinema-700"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleOpenChapterManager(novel)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 font-bold transition"
                      title="Nhấn để quản lý các chương"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{novel.totalChapters || (novel.chapters ? novel.chapters.length : 0)} chương</span>
                    </button>
                  </td>
                  <td className="p-4 text-center font-mono">{novel.viewCount || 0}</td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-300 border border-green-500/30">
                      {novel.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`/truyen/${novel.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-cinema-800 hover:bg-cinema-700 text-gray-300 transition"
                        title="Xem trang đọc ngoài web"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleOpenChapterManager(novel)}
                        className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition"
                        title="Quản lý chương truyện"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditNovel(novel)}
                        className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNovel(novel.id, novel.title)}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                        title="Xóa bộ truyện"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= MODAL TẠO / SỬA TRUYỆN ================= */}
      {novelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-cinema-900 border border-cinema-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-cinema-800 flex items-center justify-between bg-cinema-950/60">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>{editingNovel ? 'Chỉnh Sửa Bộ Truyện' : 'Thêm Bộ Truyện Mới'}</span>
              </h3>
              <button
                onClick={() => setNovelModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNovel} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Tên bộ truyện <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Lưu Ly Kiếm Tông, Phàm Nhân Tu Tiên..."
                  className="w-full px-3 py-2 bg-cinema-850 border border-cinema-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Tác giả</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="VD: Vong Ngữ, Cổ Chân..."
                    className="w-full px-3 py-2 bg-cinema-850 border border-cinema-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-cinema-850 border border-cinema-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="Đang ra">Đang ra</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Thể loại (ngăn cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Tiên Hiệp, Kiếm Hiệp, Trọng Sinh..."
                  className="w-full px-3 py-2 bg-cinema-850 border border-cinema-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Link Ảnh Bìa (Poster)</label>
                <input
                  type="url"
                  value={formData.coverUrl}
                  onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-cinema-850 border border-cinema-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Slug Phim Chuyển Thể (Nếu có phim trên web)
                </label>
                <input
                  type="text"
                  value={formData.linkedMovieSlug}
                  onChange={(e) => setFormData({ ...formData, linkedMovieSlug: e.target.value })}
                  placeholder="VD: luu-ly-kiem-tong"
                  className="w-full px-3 py-2 bg-cinema-850 border border-cinema-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Tóm tắt cốt truyện</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Giới thiệu sơ lược nội dung tiểu thuyết..."
                  className="w-full px-3 py-2 bg-cinema-850 border border-cinema-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-cinema-800">
                <button
                  type="button"
                  onClick={() => setNovelModalOpen(false)}
                  className="px-4 py-2 bg-cinema-800 text-gray-300 rounded-xl text-xs hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-cinema-950 font-bold rounded-xl text-xs"
                >
                  {editingNovel ? 'Cập Nhật' : 'Tạo Truyện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL QUẢN LÝ CHƯƠNG & UPLOAD FILE ================= */}
      {chapterModalOpen && currentNovel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl bg-cinema-900 border border-cinema-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-cinema-800 flex items-center justify-between bg-cinema-950/60">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>Quản Lý Chương: {currentNovel.title}</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Tổng số hiện tại: <strong className="text-amber-400">{currentNovel.chapters?.length || 0}</strong> chương
                </p>
              </div>
              <button
                onClick={() => setChapterModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs chuyển đổi */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-cinema-800 text-xs">
              <button
                type="button"
                onClick={() => setChapterTab('list')}
                className={`pb-2.5 px-2 font-bold border-b-2 transition ${
                  chapterTab === 'list'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Mục Lục Các Chương ({currentNovel.chapters?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setChapterTab('add')}
                className={`pb-2.5 px-2 font-bold border-b-2 transition ${
                  chapterTab === 'add'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                + Thêm 1 Chương Mới
              </button>
              <button
                type="button"
                onClick={() => setChapterTab('bulk')}
                className={`pb-2.5 px-2 font-bold border-b-2 transition flex items-center gap-1.5 ${
                  chapterTab === 'bulk'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>⚡ Tải Lên File .TXT / Hàng Loạt</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-grow text-xs">
              {/* TAB 1: Danh sách các chương */}
              {chapterTab === 'list' && (
                <div className="space-y-3">
                  {(!currentNovel.chapters || currentNovel.chapters.length === 0) ? (
                    <div className="text-center py-12 text-gray-400 space-y-3">
                      <FileText className="w-12 h-12 text-gray-600 mx-auto" />
                      <p>Chưa có chương nào. Bạn có thể bấm sang tab "Thêm 1 Chương" hoặc "Tải Lên File .TXT".</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[480px] overflow-y-auto pr-1">
                      {currentNovel.chapters.map((ch) => (
                        <div
                          key={ch.chapterNumber}
                          className="p-2.5 rounded-xl bg-cinema-850 border border-cinema-700/80 flex items-center justify-between gap-2"
                        >
                          <span className="font-medium text-gray-200 truncate">
                            {ch.title || `Chương ${ch.chapterNumber}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteChapter(ch.chapterNumber)}
                            className="p-1 text-gray-500 hover:text-red-400 transition"
                            title="Xóa chương này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Thêm 1 chương đơn lẻ */}
              {chapterTab === 'add' && (
                <form onSubmit={handleSaveSingleChapter} className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-gray-300 font-semibold mb-1">Số chương</label>
                      <input
                        type="number"
                        required
                        value={singleChapter.chapterNumber}
                        onChange={(e) =>
                          setSingleChapter({ ...singleChapter, chapterNumber: parseInt(e.target.value, 10) })
                        }
                        className="w-full px-3 py-1.5 bg-cinema-850 border border-cinema-700 rounded-xl text-white font-bold text-center"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-gray-300 font-semibold mb-1">Tiêu đề chương</label>
                      <input
                        type="text"
                        required
                        value={singleChapter.title}
                        onChange={(e) => setSingleChapter({ ...singleChapter, title: e.target.value })}
                        placeholder="VD: Chương 1: Đan Điền Vỡ Nát"
                        className="w-full px-3 py-1.5 bg-cinema-850 border border-cinema-700 rounded-xl text-white font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      Nội dung văn bản chương <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={12}
                      value={singleChapter.content}
                      onChange={(e) => setSingleChapter({ ...singleChapter, content: e.target.value })}
                      placeholder="Dán toàn bộ văn bản chương truyện vào đây..."
                      className="w-full p-3 bg-cinema-850 border border-cinema-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-cinema-950 font-bold rounded-xl"
                    >
                      Lưu Chương Này
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: TẢI LÊN FILE .TXT HOẶC DÁN HÀNG LOẠT */}
              {chapterTab === 'bulk' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-300">
                      ⚡ Tính Năng Nhập Hàng Loạt Siêu Tốc:
                    </p>
                    <p>
                      • Hệ thống sẽ tự động quét các từ khóa như: <strong>"Chương 1: ..."</strong>, <strong>"Chương 2: ..."</strong> hoặc <strong>"Chapter 1: ..."</strong> trong văn bản để tự động cắt thành từng chương riêng biệt!
                    </p>
                    <p>• Bạn có thể <strong>chọn file .txt</strong> từ máy tính/điện thoại hoặc <strong>copy dán văn bản</strong> vào ô dưới đây.</p>
                  </div>

                  {/* Nút upload file .txt */}
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cinema-800 hover:bg-cinema-700 text-white font-semibold transition border border-cinema-700">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>Chọn File .TXT Từ Máy Tính</span>
                      <input
                        type="file"
                        accept=".txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {bulkText && (
                      <span className="text-[11px] text-green-400">
                        ✓ Đã đọc văn bản ({Math.round(bulkText.length / 1024)} KB)
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      Hoặc dán toàn bộ nội dung truyện vào đây:
                    </label>
                    <textarea
                      rows={8}
                      value={bulkText}
                      onChange={(e) => {
                        setBulkText(e.target.value);
                        setParsedChapters(parseBulkTextIntoChapters(e.target.value));
                      }}
                      placeholder={`Chương 1: Tên chương 1...\nNội dung chương 1...\n\nChương 2: Tên chương 2...\nNội dung chương 2...`}
                      className="w-full p-3 bg-cinema-850 border border-cinema-700 rounded-xl text-white placeholder-gray-500 font-mono text-xs leading-relaxed"
                    />
                  </div>

                  {/* Kết quả nhận diện */}
                  {parsedChapters.length > 0 && (
                    <div className="p-4 rounded-xl bg-cinema-950 border border-cinema-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-green-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Đã tự động nhận diện {parsedChapters.length} chương:
                        </span>
                        <button
                          type="button"
                          disabled={importing}
                          onClick={handleImportParsedChapters}
                          className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-green-950/40 disabled:opacity-50"
                        >
                          {importing ? 'Đang nhập dữ liệu...' : `Lưu Toàn Bộ ${parsedChapters.length} Chương Vào Database`}
                        </button>
                      </div>

                      <div className="max-h-40 overflow-y-auto space-y-1 text-gray-400 pr-1">
                        {parsedChapters.map((pc) => (
                          <div key={pc.chapterNumber} className="text-[11px] flex justify-between py-0.5 border-b border-cinema-900">
                            <span className="text-gray-200 font-medium">{pc.title}</span>
                            <span>{(pc.content || '').length} ký tự</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Cào Truyện Tự Động Từ Webnovel.vn */}
      {crawlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-cinema-900 border border-cinema-700 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-cinema-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Cào Truyện Từ Webnovel.vn & MeTruyenHot</h3>
                  <p className="text-[11px] text-gray-400">Tự động lấy tên truyện, ảnh bìa, tác giả và nội dung các chương tiếng Việt</p>
                </div>
              </div>
              <button
                disabled={crawling}
                onClick={() => setCrawlModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-cinema-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartCrawl} className="mt-5 space-y-4 text-xs">
              {crawlError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{crawlError}</span>
                </div>
              )}

              <div>
                <label className="block text-gray-300 font-semibold mb-1.5">
                  Đường dẫn truyện (Webnovel.vn hoặc MeTruyenHotvn.com) <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={crawlUrl}
                  onChange={(e) => setCrawlUrl(e.target.value)}
                  placeholder="VD: https://metruyenhotvn.com/huyen-lenh-de-su/ hoặc webnovel.vn"
                  className="w-full px-3.5 py-2.5 bg-cinema-850 border border-cinema-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Hỗ trợ link truyện từ <a href="https://metruyenhotvn.com/" target="_blank" rel="noreferrer" className="text-emerald-400 underline">metruyenhotvn.com</a> và <a href="https://webnovel.vn/xuyen-khong/" target="_blank" rel="noreferrer" className="text-emerald-400 underline">webnovel.vn</a>
                </p>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1.5">
                  Số lượng chương muốn lấy
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCrawlLimit('all')}
                    className={`col-span-3 py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      crawlLimit === 'all'
                        ? 'bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 border-amber-300 text-cinema-950 shadow-lg shadow-amber-500/20'
                        : 'bg-cinema-850 border-amber-500/40 text-amber-300 hover:bg-cinema-800'
                    }`}
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>🔥 Full bộ (Cào tất cả chương đến khi hết truyện)</span>
                  </button>
                  {[
                    { num: 20, label: '20 chương' },
                    { num: 50, label: '50 chương' },
                    { num: 100, label: '100 chương' },
                    { num: 200, label: '200 chương' },
                    { num: 500, label: '500 chương' },
                    { num: 1000, label: '1000 chương' },
                    { num: 2000, label: '2000 chương' },
                    { num: 3000, label: '3000 chương' },
                  ].map((item) => (
                    <button
                      key={item.num}
                      type="button"
                      onClick={() => setCrawlLimit(item.num)}
                      className={`py-2 rounded-xl border text-xs font-bold transition ${
                        crawlLimit === item.num
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-cinema-850 border-cinema-700 text-gray-300 hover:bg-cinema-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1.5">
                  Bắt đầu cào từ chương số
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={crawlStartChapter}
                    onChange={(e) => setCrawlStartChapter(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-28 px-3 py-2 bg-cinema-850 border border-cinema-700 rounded-xl text-white font-bold text-center focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[11px] text-gray-400">
                    (Mặc định 1. Nếu cào tiếp truyện cũ, điền chương tiếp theo để cào nối)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300/90 leading-relaxed space-y-1">
                <p>
                  💡 <strong>Cào Full bộ siêu tốc:</strong> Hệ thống tự động tải song song nhiều chương cùng lúc. Kho truyện trên <strong>metruyenhotvn.com</strong> không có VIP, cào được 100% full bộ!
                </p>
                <p>
                  🔄 <strong>Tự động ghép nối:</strong> Nếu bộ truyện này đã có trong danh sách, hệ thống sẽ tự động ghép thêm các chương mới mà không làm mất các chương cũ.
                </p>
              </div>

              {crawlProgress && (
                <div className="p-3.5 rounded-xl bg-cinema-850 border border-emerald-500/40 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-400 flex items-center gap-1.5 truncate">
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span>{crawlProgress.text}</span>
                    </span>
                    {crawlProgress.total > 0 && (
                      <span className="text-white shrink-0 ml-2 font-mono">
                        {Math.min(100, Math.round((crawlProgress.current / crawlProgress.total) * 100))}%
                      </span>
                    )}
                  </div>
                  <div className="w-full h-2 bg-cinema-900 rounded-full overflow-hidden border border-cinema-700">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                      style={{
                        width:
                          crawlProgress.total > 0
                            ? `${Math.min(100, Math.max(5, (crawlProgress.current / crawlProgress.total) * 100))}%`
                            : '100%',
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400">
                    ⚡ Hệ thống đang cào theo từng đợt 50 chương an toàn, không làm quá tải server.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-cinema-800">
                <button
                  type="button"
                  disabled={crawling}
                  onClick={() => setCrawlModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-cinema-800 hover:bg-cinema-700 text-gray-300 font-medium transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={crawling || !crawlUrl.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition shadow-lg shadow-emerald-950/40 disabled:opacity-50 flex items-center gap-2"
                >
                  {crawling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang cào truyện... (vui lòng chờ trong giây lát)</span>
                    </>
                  ) : (
                    <>
                      <DownloadCloud className="w-4 h-4" />
                      <span>Bắt Đầu Cào & Lưu Vào Tủ Sách</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
