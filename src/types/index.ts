export interface Movie {
  id: string;
  title: string;
  slug: string;
  description: string;
  posterUrl: string;
  bannerUrl: string;
  category: string[];
  year: number;
  status: 'Đang cập nhật' | 'Hoàn thành' | 'Tạm dừng';
  keywords: string;
  seoTitle: string;
  seoDescription: string;
  episodeCount: number;
  latestEpisode: number;
  viewCount: number;
  hidden?: boolean;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EpisodeServer {
  id: string;
  name: string; // Tên hiển thị server, ví dụ "Server 1 (YouTube)", "Server 2 (Facebook)"
  url: string;
  videoId: string;
  embedUrl: string;
  platform?: string;
}

export interface Episode {
  id: string;
  movieId: string;
  episodeNumber: number;
  title: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  youtubeEmbedUrl: string;
  thumbnailUrl: string;
  viewCount: number;
  servers?: EpisodeServer[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface SiteSettings {
  siteName: string;
  channelUrl: string;
  channelName: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  hasYoutubeApiKey?: boolean;
  hasFirebaseConfig?: boolean;
  youtubeApiKey?: string;
  adminKey?: string;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

export interface WatchHistoryItem {
  movieId: string;
  movieTitle: string;
  movieSlug: string;
  posterUrl: string;
  episodeNumber: number;
  episodeTitle: string;
  watchedAt: number;
}

export interface DashboardStats {
  totalMovies: number;
  totalEpisodes: number;
  totalViews: number;
  recentMovies: Movie[];
  topMovies: Movie[];
}
