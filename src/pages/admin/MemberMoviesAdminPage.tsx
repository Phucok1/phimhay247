import React, { useEffect, useState } from 'react';
import {
  Crown,
  CheckCircle,
  XCircle,
  Trash2,
  ExternalLink,
  Loader2,
  Clock,
  Film,
  AlertCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  fetchMemberSubmissions,
  approveMemberMovie,
  rejectMemberMovie,
  deleteMemberSubmission,
} from '../../services/api';
import { MemberMovieSubmission } from '../../types';

export const MemberMoviesAdminPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<MemberMovieSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchMemberSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error('Lỗi tải danh sách phim hội viên:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string, title: string) => {
    if (!confirm(`Xác nhận duyệt bộ phim "${title}" vào mục Phim Hội Viên?`)) return;

    try {
      setActionLoadingId(id);
      const res = await approveMemberMovie(id);
      alert(res.message || 'Đã duyệt phim thành công!');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Có lỗi xảy ra khi duyệt phim.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModalId) return;

    try {
      setActionLoadingId(rejectModalId);
      const res = await rejectMemberMovie(rejectModalId, rejectReason.trim());
      alert(res.message || 'Đã từ chối phim.');
      setRejectModalId(null);
      setRejectReason('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Có lỗi xảy ra khi từ chối phim.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa bản ghi đóng góp "${title}" không?`)) return;

    try {
      await deleteMemberSubmission(id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert('Lỗi khi xóa bản ghi.');
    }
  };

  const filtered = submissions.filter((s) => {
    if (activeTab === 'all') return true;
    return s.status === activeTab;
  });

  const pendingCount = submissions.filter((s) => s.status === 'Chờ duyệt').length;
  const approvedCount = submissions.filter((s) => s.status === 'Đã duyệt').length;
  const rejectedCount = submissions.filter((s) => s.status === 'Từ chối').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Crown className="w-7 h-7 text-amber-400" />
            <span>Quản Lý Phim Hội Viên Đóng Góp</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Kiểm duyệt phim do khán giả gửi lên từ YouTube, Ok.ru, Facebook Reels, Drive...
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-cinema-800 hover:bg-cinema-700 text-gray-200 rounded-xl text-sm transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-cinema-900 border border-cinema-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Chờ kiểm duyệt</p>
            <h3 className="text-2xl font-extrabold text-white">{pendingCount}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-cinema-900 border border-cinema-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Đã duyệt xuất bản</p>
            <h3 className="text-2xl font-extrabold text-white">{approvedCount}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-cinema-900 border border-cinema-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Đã từ chối</p>
            <h3 className="text-2xl font-extrabold text-white">{rejectedCount}</h3>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-cinema-800 pb-3">
        {[
          { id: 'all', label: `Tất cả (${submissions.length})` },
          { id: 'Chờ duyệt', label: `Chờ duyệt (${pendingCount})` },
          { id: 'Đã duyệt', label: `Đã duyệt (${approvedCount})` },
          { id: 'Từ chối', label: `Đã từ chối (${rejectedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-amber-500 text-black shadow'
                : 'text-gray-400 hover:text-white hover:bg-cinema-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-sm">Đang tải danh sách...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-cinema-900 border border-cinema-800 rounded-2xl text-gray-400 space-y-2">
          <Film className="w-10 h-10 mx-auto text-cinema-700" />
          <p className="text-sm">Không có dữ liệu trong mục này.</p>
        </div>
      ) : (
        <div className="bg-cinema-900 border border-cinema-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-cinema-950 text-xs text-gray-400 uppercase tracking-wider border-b border-cinema-800">
                <tr>
                  <th className="py-3.5 px-4">Tên Phim</th>
                  <th className="py-3.5 px-4">Người Đóng Góp</th>
                  <th className="py-3.5 px-4">Nguồn Video</th>
                  <th className="py-3.5 px-4">Ngày Gửi</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-800">
                {filtered.map((item) => {
                  const isPending = item.status === 'Chờ duyệt';
                  const isApproved = item.status === 'Đã duyệt';
                  const isRejected = item.status === 'Từ chối';

                  return (
                    <tr key={item.id} className="hover:bg-cinema-850/50 transition">
                      {/* Tên phim & Poster */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.posterUrl ||
                              'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200'
                            }
                            alt={item.title}
                            className="w-12 h-16 object-cover rounded-lg bg-cinema-800 flex-shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-white line-clamp-1">{item.title}</h4>
                            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                              {item.category?.join(', ')}
                            </p>
                            {item.description && (
                              <p className="text-[11px] text-gray-500 line-clamp-1 mt-1 italic">
                                "{item.description}"
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Người đóng góp */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-amber-300">{item.contributorName}</div>
                        {item.contributorContact && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            LH: {item.contributorContact}
                          </div>
                        )}
                      </td>

                      {/* Nguồn Video */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400">
                            {item.parsedPlatform || 'Video'}
                          </span>
                          <a
                            href={item.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-white truncate max-w-[180px]"
                            title={item.videoUrl}
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{item.videoUrl}</span>
                          </a>
                        </div>
                      </td>

                      {/* Ngày gửi */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isPending && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Chờ duyệt
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                            Đã duyệt
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                            Đã từ chối
                          </span>
                        )}
                        {item.rejectionReason && (
                          <p className="text-[11px] text-red-400 mt-1 max-w-[150px] truncate" title={item.rejectionReason}>
                            Lý do: {item.rejectionReason}
                          </p>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(item.id, item.title)}
                                disabled={actionLoadingId === item.id}
                                className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold text-xs transition flex items-center gap-1 shadow disabled:opacity-50"
                                title="Duyệt phim đưa lên mục Phim Hội Viên"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Duyệt</span>
                              </button>
                              <button
                                onClick={() => setRejectModalId(item.id)}
                                disabled={actionLoadingId === item.id}
                                className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-semibold text-xs transition flex items-center gap-1 disabled:opacity-50"
                                title="Từ chối phim"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Từ chối</span>
                              </button>
                            </>
                          )}

                          <a
                            href={item.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-cinema-800 transition"
                            title="Mở xem video gốc"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-cinema-800 transition"
                            title="Xóa yêu cầu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal từ chối phim */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-cinema-900 border border-cinema-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>Từ chối phim đóng góp</span>
            </h3>
            <p className="text-xs text-gray-300">
              Nhập lý do từ chối (vd: link bị lỗi, nội dung không phù hợp...):
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do..."
              rows={3}
              className="w-full px-3 py-2 bg-cinema-950 border border-cinema-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRejectModalId(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
