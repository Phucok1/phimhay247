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
  contributorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderBadge?: string;
  avatarColor?: string;
  content: string;
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  name: string;
  contact?: string;
  type: 'Báo lỗi tập phim' | 'Yêu cầu phim mới' | 'Góp ý tính năng' | 'Khác';
  movieTitle?: string;
  episodeNumber?: number;
  content: string;
  status: 'Chờ xử lý' | 'Đã xử lý';
  createdAt: string;
}

export interface MemberMovieSubmission {
  id: string;
  title: string;
  slug: string;
  contributorName: string;
  contributorContact?: string;
  description: string;
  category: string[];
  videoUrl: string;
  parsedVideoId?: string;
  parsedEmbedUrl?: string;
  parsedPlatform?: string;
  posterUrl?: string;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối';
  rejectionReason?: string;
  approvedMovieId?: string;
  viewCount: number;
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
