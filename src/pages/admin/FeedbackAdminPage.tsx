import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Loader2,
  Film,
  RefreshCw,
  Mail,
  User,
} from 'lucide-react';
import { fetchFeedbacks, updateFeedbackStatus, deleteFeedback } from '../../services/api';
import { FeedbackItem } from '../../types';

export const FeedbackAdminPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await fetchFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      console.error('Lỗi tải danh sách phản hồi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleStatusChange = async (id: string, status: 'Chờ xử lý' | 'Đã xử lý') => {
    try {
      setUpdatingId(id);
      await updateFeedbackStatus(id, status);
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status } : f))
      );
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa phản hồi này?')) return;
    try {
      await deleteFeedback(id);
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      alert('Lỗi khi xóa phản hồi.');
    }
  };

  const filtered = feedbacks.filter((f) => {
    if (activeTab === 'all') return true;
    return f.status === activeTab;
  });

  const pendingCount = feedbacks.filter((f) => f.status === 'Chờ xử lý').length;
  const resolvedCount = feedbacks.filter((f) => f.status === 'Đã xử lý').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-red-500" />
            <span>Góp Ý & Báo Lỗi Từ Khán Giả</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Theo dõi các báo lỗi tập phim, yêu cầu cập nhật phim mới và đóng góp cải tiến website.
          </p>
        </div>

        <button
          onClick={loadFeedbacks}
          className="flex items-center gap-2 px-4 py-2 bg-cinema-800 hover:bg-cinema-700 text-gray-200 rounded-xl text-sm transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-cinema-900 border border-cinema-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Chờ xử lý</p>
            <h3 className="text-2xl font-extrabold text-white">{pendingCount}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-cinema-900 border border-cinema-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Đã giải quyết xong</p>
            <h3 className="text-2xl font-extrabold text-white">{resolvedCount}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-cinema-800 pb-3">
        {[
          { id: 'all', label: `Tất cả (${feedbacks.length})` },
          { id: 'Chờ xử lý', label: `Chờ xử lý (${pendingCount})` },
          { id: 'Đã xử lý', label: `Đã xử lý (${resolvedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-red-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-cinema-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <p className="text-sm">Đang tải phản hồi...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-cinema-900 border border-cinema-800 rounded-2xl text-gray-400 space-y-2">
          <MessageSquare className="w-10 h-10 mx-auto text-cinema-700" />
          <p className="text-sm">Không có phản hồi nào trong mục này.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isPending = item.status === 'Chờ xử lý';
            const isResolved = item.status === 'Đã xử lý';

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-cinema-900 border border-cinema-800 hover:border-cinema-700 transition space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30">
                      {item.type}
                    </span>

                    {item.movieTitle && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-200 bg-cinema-950 px-2.5 py-0.5 rounded-lg border border-cinema-800">
                        <Film className="w-3.5 h-3.5 text-red-400" />
                        <span>{item.movieTitle}</span>
                        {item.episodeNumber && (
                          <span className="text-amber-400 font-bold ml-0.5">
                            - Tập {item.episodeNumber}
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-gray-500 hover:text-red-400 rounded-lg hover:bg-cinema-800 transition"
                      title="Xóa phản hồi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-gray-200 bg-cinema-950/60 p-3.5 rounded-xl border border-cinema-800/80 leading-relaxed break-words">
                  {item.content}
                </p>

                {/* Sender info & status selector */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-3 text-gray-400">
                    <span className="flex items-center gap-1 font-medium text-gray-300">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {item.name || 'Khán giả ẩn danh'}
                    </span>
                    {item.contact && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Mail className="w-3.5 h-3.5" />
                        LH: {item.contact}
                      </span>
                    )}
                  </div>

                  {/* Status buttons */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 text-[11px] mr-1">Trạng thái:</span>
                    <button
                      onClick={() => handleStatusChange(item.id, 'Chờ xử lý')}
                      disabled={updatingId === item.id || isPending}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isPending
                          ? 'bg-amber-500 text-black shadow'
                          : 'bg-cinema-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      Chờ xử lý
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, 'Đã xử lý')}
                      disabled={updatingId === item.id || isResolved}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isResolved
                          ? 'bg-green-600 text-white shadow'
                          : 'bg-cinema-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      Đã giải quyết xong
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
