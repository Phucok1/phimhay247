import axios from 'axios';
import { Movie, Episode, Category, SiteSettings, DashboardStats } from '../types';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm auth token nếu có trong localStorage
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('phimhay247_admin_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// --- Movies ---
export const fetchMovies = async (params?: {
  category?: string;
  status?: string;
  search?: string;
  sort?: 'updated' | 'views' | 'az' | 'newest' | 'episodes';
  limit?: number;
  featured?: boolean;
  includeHidden?: boolean;
}): Promise<Movie[]> => {
  const res = await client.get('/movies', { params });
  return res.data.data;
};

export const fetchMovieBySlug = async (slug: string): Promise<Movie & { episodes: Episode[]; related: Movie[] }> => {
  const res = await client.get(`/movies/${slug}`);
  return res.data.data;
};

export const createMovie = async (data: Partial<Movie>): Promise<Movie> => {
  const res = await client.post('/movies', data);
  return res.data.data;
};

export const updateMovie = async (id: string, data: Partial<Movie>): Promise<Movie> => {
  const res = await client.put(`/movies/${id}`, data);
  return res.data.data;
};

export const deleteMovie = async (id: string): Promise<void> => {
  await client.delete(`/movies/${id}`);
};

export const toggleMovieHidden = async (id: string): Promise<Movie> => {
  const res = await client.patch(`/movies/${id}/toggle-hidden`);
  return res.data.data;
};

// --- Episodes ---
export const fetchEpisodes = async (movieId: string): Promise<Episode[]> => {
  const res = await client.get('/episodes', { params: { movieId } });
  return res.data.data;
};

export const fetchEpisodeDetail = async (
  movieId: string,
  episodeNumber: number
): Promise<{
  episode: Episode;
  movie: Movie;
  allEpisodes: Episode[];
  prevEpisode: Episode | null;
  nextEpisode: Episode | null;
}> => {
  const res = await client.get(`/episodes/${movieId}/${episodeNumber}`);
  return res.data.data;
};

export const parseYouTubeLink = async (url: string): Promise<{
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string;
  watchUrl: string;
}> => {
  const res = await client.post('/episodes/parse-url', { url });
  return res.data.data;
};

export const createEpisode = async (data: {
  movieId: string;
  episodeNumber: number;
  title: string;
  youtubeUrl: string;
  customThumbnail?: string;
}): Promise<Episode> => {
  const res = await client.post('/episodes', data);
  return res.data.data;
};

export const createBulkEpisodes = async (
  movieId: string,
  episodes: Array<{ episodeNumber: number; title: string; youtubeUrl: string }>
): Promise<{ importedCount: number; errors?: string[] }> => {
  const res = await client.post('/episodes/bulk', { movieId, episodes });
  return res.data;
};

export const updateEpisode = async (id: string, data: Partial<Episode>): Promise<Episode> => {
  const res = await client.put(`/episodes/${id}`, data);
  return res.data.data;
};

export const deleteEpisode = async (id: string): Promise<void> => {
  await client.delete(`/episodes/${id}`);
};

// --- Playlist Import ---
export const fetchYouTubePlaylist = async (playlistUrl: string): Promise<{
  success: boolean;
  needApiKey?: boolean;
  playlistId?: string;
  error?: string;
  data?: {
    playlistId: string;
    totalItems: number;
    episodes: Array<{
      selected: boolean;
      episodeNumber: number;
      title: string;
      youtubeUrl: string;
      youtubeVideoId: string;
      youtubeEmbedUrl: string;
      thumbnailUrl: string;
    }>;
  };
}> => {
  const res = await client.post('/playlist/fetch', { playlistUrl });
  return res.data;
};

// --- Categories ---
export const fetchCategories = async (): Promise<Category[]> => {
  const res = await client.get('/categories');
  return res.data.data;
};

export const createCategory = async (name: string): Promise<Category> => {
  const res = await client.post('/categories', { name });
  return res.data.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await client.delete(`/categories/${id}`);
};

// --- Stats & View Counter ---
export const recordView = async (movieId: string, episodeId: string): Promise<void> => {
  let clientToken = localStorage.getItem('phimhay247_view_token');
  if (!clientToken) {
    clientToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('phimhay247_view_token', clientToken);
  }

  try {
    await client.post('/stats/view', { movieId, episodeId, clientToken });
  } catch (err) {
    // Không gián đoạn trải nghiệm người xem nếu lỗi gửi view
    console.debug('View count ping ignored:', err);
  }
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const res = await client.get('/stats/dashboard');
  return res.data.data;
};

// --- Settings & Auth ---
export const fetchPublicSettings = async (): Promise<SiteSettings> => {
  const res = await client.get('/settings');
  return res.data.data;
};

export const fetchAdminSettings = async (): Promise<SiteSettings> => {
  const res = await client.get('/settings/admin');
  return res.data.data;
};

export const updateSettings = async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
  const res = await client.put('/settings', data);
  return res.data.data;
};

export const loginAdmin = async (password: string): Promise<{ success: boolean; token: string }> => {
  const res = await client.post('/settings/verify-admin', { password });
  return res.data;
};

// --- Database Backup & Restore ---
export const downloadDatabaseBackup = async (): Promise<any> => {
  const res = await client.get('/settings/export-db');
  return res.data;
};

export const restoreDatabaseBackup = async (data: any): Promise<{ success: boolean; message: string }> => {
  const res = await client.post('/settings/import-db', data);
  return res.data;
};

