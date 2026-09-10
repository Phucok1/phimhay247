import { WatchHistoryItem } from '../types';

const HISTORY_KEY = 'phimhay247_watch_history';
const MAX_HISTORY_ITEMS = 12;

export const getWatchHistory = (): WatchHistoryItem[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Lỗi đọc lịch sử xem:', err);
    return [];
  }
};

export const saveWatchHistory = (item: {
  movieId: string;
  movieTitle: string;
  movieSlug: string;
  posterUrl: string;
  episodeNumber: number;
  episodeTitle: string;
}): void => {
  try {
    let history = getWatchHistory();
    // Loại bỏ mục cũ cùng phim nếu đã tồn tại
    history = history.filter((h) => h.movieId !== item.movieId);

    // Thêm mục mới lên đầu
    history.unshift({
      ...item,
      watchedAt: Date.now(),
    });

    // Giới hạn số lượng
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('Lỗi lưu lịch sử xem:', err);
  }
};

export const clearWatchHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
};

export const removeWatchHistoryItem = (movieId: string): WatchHistoryItem[] => {
  const history = getWatchHistory().filter((h) => h.movieId !== movieId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return history;
};
