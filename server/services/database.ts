import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  contributorName?: string; // Tên hội viên chia sẻ (nếu có)
  createdAt: string;
  updatedAt: string;
}

export interface EpisodeServer {
  id: string;
  name: string; // Tên hiển thị: "Server 1 (YouTube)", "Server 2 (Facebook)", v.v.
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

export interface ChatMessage {
  id: string;
  senderName: string;
  senderBadge?: string; // 'Hội viên VIP' | 'Quản trị viên' | 'Thành viên'
  avatarColor?: string;
  content: string;
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  name: string;
  contact?: string; // SĐT, Email hoặc Zalo
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
  contributorName: string; // Tên hội viên
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

export interface SiteSettings {
  siteName: string;
  channelUrl: string;
  channelName: string;
  youtubeApiKey?: string;
  adminKey?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  donateBankName?: string;
  donateAccountNumber?: string;
  donateAccountName?: string;
  donateMomo?: string;
  donateQrUrl?: string;
  donateNote?: string;
}

export interface DatabaseSchema {
  movies: Movie[];
  episodes: Episode[];
  categories: Category[];
  settings: SiteSettings;
  chatMessages: ChatMessage[];
  feedbacks: FeedbackItem[];
  memberSubmissions: MemberMovieSubmission[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Hàm tạo slug tiếng Việt chuẩn SEO
export function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-member', name: 'Phim Hội Viên', slug: 'phim-hoi-vien' },
  { id: 'cat-1', name: 'Kiếm Hiệp', slug: 'kiem-hiep' },
  { id: 'cat-2', name: 'Tiên Hiệp', slug: 'tien-hiep' },
  { id: 'cat-3', name: 'Cổ Trang', slug: 'co-trang' },
  { id: 'cat-4', name: 'Hành Động', slug: 'hanh-dong' },
  { id: 'cat-5', name: 'Huyền Huyễn', slug: 'huyen-huyen' },
  { id: 'cat-6', name: 'Ngôn Tình', slug: 'ngon-tinh' },
  { id: 'cat-7', name: 'Xuyên Không', slug: 'xuyen-khong' },
  { id: 'cat-8', name: 'Hoạt Hình 3D', slug: 'hoat-hinh-3d' },
];

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'PHIM HAY 247',
  channelUrl: 'https://www.youtube.com/@phimhay.momtiti',
  channelName: '@phimhay.momtiti',
  seoTitle: 'PHIM HAY 247 - Xem Phim Hay Tuyển Chọn Mới Nhất',
  seoDescription: 'PHIM HAY 247 - Website xem phim tuyển chọn, tổng hợp các bộ phim kiếm hiệp, cổ trang, ngôn tình phát trực tiếp từ YouTube.',
  seoKeywords: 'phim hay, phim moi, phim youtube, xem phim 247, phim kiem hiep, phim co trang',
  adminKey: 'admin123',
  donateBankName: 'Vietcombank',
  donateAccountNumber: '',
  donateAccountName: 'NGUYỄN THIỆN PHÚC',
  donateMomo: '',
  donateQrUrl: '/images/donate-qr.png',
  donateNote: 'Ủng hộ duy trì server và phát triển kênh Phim Hay 247',
};

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadData();
    this.cleanExpiredChatMessages();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          movies: parsed.movies || [],
          episodes: parsed.episodes || [],
          categories: parsed.categories || DEFAULT_CATEGORIES,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          chatMessages: parsed.chatMessages || [],
          feedbacks: parsed.feedbacks || [],
          memberSubmissions: parsed.memberSubmissions || [],
        };
      } catch (err) {
        console.error('Lỗi khi đọc file db.json, khởi tạo lại dữ liệu mặc định:', err);
      }
    }

    // Khởi tạo mới nếu chưa có
    const initialData: DatabaseSchema = {
      movies: [],
      episodes: [],
      categories: DEFAULT_CATEGORIES,
      settings: DEFAULT_SETTINGS,
      chatMessages: [],
      feedbacks: [],
      memberSubmissions: [],
    };
    this.saveDataDirect(initialData);
    return initialData;
  }

  private saveDataDirect(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Lỗi khi ghi dữ liệu ra db.json:', err);
    }
  }

  public save() {
    this.saveDataDirect(this.data);
  }

  // --- MOVIES ---
  public getMovies(options?: {
    includeHidden?: boolean;
    categorySlug?: string;
    search?: string;
    sort?: 'updated' | 'views' | 'az' | 'newest' | 'episodes';
    status?: string;
    limit?: number;
    featured?: boolean;
  }): Movie[] {
    let list = [...this.data.movies];

    if (!options?.includeHidden) {
      list = list.filter((m) => !m.hidden);
    }

    if (options?.categorySlug) {
      const targetCat = this.data.categories.find((c) => c.slug === options.categorySlug);
      if (targetCat) {
        list = list.filter((m) => m.category.includes(targetCat.name));
      }
    }

    if (options?.status) {
      list = list.filter((m) => m.status === options.status);
    }

    if (options?.featured !== undefined) {
      list = list.filter((m) => !!m.featured === options.featured);
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.keywords.toLowerCase().includes(q) ||
          m.category.some((c) => c.toLowerCase().includes(q))
      );
    }

    // Sắp xếp
    const sortMode = options?.sort || 'updated';
    switch (sortMode) {
      case 'views':
        list.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'az':
        list.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'episodes':
        list.sort((a, b) => b.episodeCount - a.episodeCount);
        break;
      case 'updated':
      default:
        list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }

    if (options?.limit && options.limit > 0) {
      return list.slice(0, options.limit);
    }

    return list;
  }

  public getMovieById(id: string): Movie | undefined {
    return this.data.movies.find((m) => m.id === id);
  }

  public getMovieBySlug(slug: string): Movie | undefined {
    return this.data.movies.find((m) => m.slug === slug);
  }

  public createMovie(payload: Omit<Movie, 'id' | 'createdAt' | 'updatedAt' | 'episodeCount' | 'latestEpisode' | 'viewCount'>): Movie {
    let slug = payload.slug ? generateSlug(payload.slug) : generateSlug(payload.title);
    // Kiểm tra trùng slug
    let uniqueSlug = slug;
    let counter = 1;
    while (this.data.movies.some((m) => m.slug === uniqueSlug)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const now = new Date().toISOString();
    const movie: Movie = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: payload.title.trim(),
      slug: uniqueSlug,
      description: payload.description?.trim() || '',
      posterUrl: payload.posterUrl?.trim() || '',
      bannerUrl: payload.bannerUrl?.trim() || payload.posterUrl?.trim() || '',
      category: Array.isArray(payload.category) ? payload.category : [payload.category].filter(Boolean),
      year: Number(payload.year) || new Date().getFullYear(),
      status: payload.status || 'Đang cập nhật',
      keywords: payload.keywords?.trim() || payload.title.trim(),
      seoTitle: payload.seoTitle?.trim() || `${payload.title.trim()} - Xem Phim Trọn Bộ`,
      seoDescription: payload.seoDescription?.trim() || payload.description?.slice(0, 160) || '',
      episodeCount: 0,
      latestEpisode: 0,
      viewCount: 0,
      hidden: payload.hidden || false,
      featured: payload.featured || false,
      createdAt: now,
      updatedAt: now,
    };

    this.data.movies.unshift(movie);
    this.save();
    return movie;
  }

  public updateMovie(id: string, payload: Partial<Movie>): Movie | null {
    const idx = this.data.movies.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    const current = this.data.movies[idx];
    let newSlug = current.slug;
    if (payload.slug && payload.slug !== current.slug) {
      newSlug = generateSlug(payload.slug);
      let counter = 1;
      let checkSlug = newSlug;
      while (this.data.movies.some((m) => m.slug === checkSlug && m.id !== id)) {
        checkSlug = `${newSlug}-${counter}`;
        counter++;
      }
      newSlug = checkSlug;
    }

    this.data.movies[idx] = {
      ...current,
      ...payload,
      slug: newSlug,
      updatedAt: new Date().toISOString(),
    };

    this.save();
    return this.data.movies[idx];
  }

  public deleteMovie(id: string): boolean {
    const idx = this.data.movies.findIndex((m) => m.id === id);
    if (idx === -1) return false;

    this.data.movies.splice(idx, 1);
    // Xóa toàn bộ tập của phim
    this.data.episodes = this.data.episodes.filter((ep) => ep.movieId !== id);
    this.save();
    return true;
  }

  public incrementMovieView(movieId: string): void {
    const movie = this.data.movies.find((m) => m.id === movieId);
    if (movie) {
      movie.viewCount = (movie.viewCount || 0) + 1;
      this.save();
    }
  }

  // --- EPISODES ---
  public getEpisodesByMovieId(movieId: string): Episode[] {
    return this.data.episodes
      .filter((ep) => ep.movieId === movieId)
      .sort((a, b) => a.episodeNumber - b.episodeNumber);
  }

  public getEpisodeByNumber(movieId: string, episodeNumber: number): Episode | undefined {
    return this.data.episodes.find((ep) => ep.movieId === movieId && ep.episodeNumber === episodeNumber);
  }

  public createEpisode(payload: Omit<Episode, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): Episode {
    const now = new Date().toISOString();
    const episode: Episode = {
      id: `ep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      movieId: payload.movieId,
      episodeNumber: Number(payload.episodeNumber),
      title: payload.title.trim() || `Tập ${payload.episodeNumber}`,
      youtubeUrl: payload.youtubeUrl.trim(),
      youtubeVideoId: payload.youtubeVideoId.trim(),
      youtubeEmbedUrl: payload.youtubeEmbedUrl.trim(),
      thumbnailUrl: payload.thumbnailUrl.trim() || `https://i.ytimg.com/vi/${payload.youtubeVideoId.trim()}/hqdefault.jpg`,
      viewCount: 0,
      servers: Array.isArray(payload.servers) ? payload.servers : [],
      createdAt: now,
      updatedAt: now,
    };

    // Kiểm tra xem đã có tập này chưa, nếu có thì ghi đè
    const existingIdx = this.data.episodes.findIndex(
      (ep) => ep.movieId === payload.movieId && ep.episodeNumber === episode.episodeNumber
    );
    if (existingIdx !== -1) {
      this.data.episodes[existingIdx] = episode;
    } else {
      this.data.episodes.push(episode);
    }

    this.syncMovieEpisodeStats(payload.movieId);
    this.save();
    return episode;
  }

  public createBulkEpisodes(
    movieId: string,
    episodesPayload: Array<{
      episodeNumber: number;
      title: string;
      youtubeUrl: string;
      youtubeVideoId: string;
      youtubeEmbedUrl: string;
      thumbnailUrl: string;
    }>
  ): Episode[] {
    const now = new Date().toISOString();
    const created: Episode[] = [];

    for (const item of episodesPayload) {
      const episode: Episode = {
        id: `ep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        movieId,
        episodeNumber: Number(item.episodeNumber),
        title: item.title.trim() || `Tập ${item.episodeNumber}`,
        youtubeUrl: item.youtubeUrl.trim(),
        youtubeVideoId: item.youtubeVideoId.trim(),
        youtubeEmbedUrl: item.youtubeEmbedUrl.trim(),
        thumbnailUrl: item.thumbnailUrl.trim() || `https://i.ytimg.com/vi/${item.youtubeVideoId.trim()}/hqdefault.jpg`,
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      const existingIdx = this.data.episodes.findIndex(
        (ep) => ep.movieId === movieId && ep.episodeNumber === episode.episodeNumber
      );
      if (existingIdx !== -1) {
        this.data.episodes[existingIdx] = episode;
      } else {
        this.data.episodes.push(episode);
      }
      created.push(episode);
    }

    this.syncMovieEpisodeStats(movieId);
    this.save();
    return created;
  }

  public updateEpisode(id: string, payload: Partial<Episode>): Episode | null {
    const idx = this.data.episodes.findIndex((ep) => ep.id === id);
    if (idx === -1) return null;

    const current = this.data.episodes[idx];
    this.data.episodes[idx] = {
      ...current,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    this.syncMovieEpisodeStats(current.movieId);
    this.save();
    return this.data.episodes[idx];
  }

  public deleteEpisode(id: string): boolean {
    const idx = this.data.episodes.findIndex((ep) => ep.id === id);
    if (idx === -1) return false;

    const movieId = this.data.episodes[idx].movieId;
    this.data.episodes.splice(idx, 1);
    this.syncMovieEpisodeStats(movieId);
    this.save();
    return true;
  }

  public incrementEpisodeView(episodeId: string): void {
    const ep = this.data.episodes.find((e) => e.id === episodeId);
    if (ep) {
      ep.viewCount = (ep.viewCount || 0) + 1;
      this.incrementMovieView(ep.movieId);
      this.save();
    }
  }

  private syncMovieEpisodeStats(movieId: string) {
    const movie = this.data.movies.find((m) => m.id === movieId);
    if (!movie) return;

    const movieEpisodes = this.data.episodes.filter((ep) => ep.movieId === movieId);
    movie.episodeCount = movieEpisodes.length;
    if (movieEpisodes.length > 0) {
      const maxEp = Math.max(...movieEpisodes.map((ep) => ep.episodeNumber));
      movie.latestEpisode = maxEp;
    } else {
      movie.latestEpisode = 0;
    }
    movie.updatedAt = new Date().toISOString();
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return this.data.categories;
  }

  public createCategory(name: string): Category {
    const cat: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      slug: generateSlug(name),
    };
    this.data.categories.push(cat);
    this.save();
    return cat;
  }

  public deleteCategory(id: string): boolean {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.save();
    return true;
  }

  // --- SETTINGS ---
  public getSettings(): SiteSettings {
    return this.data.settings;
  }

  public updateSettings(payload: Partial<SiteSettings>): SiteSettings {
    this.data.settings = {
      ...this.data.settings,
      ...payload,
    };
    this.save();
    return this.data.settings;
  }

  // --- STATS ---
  public getStats() {
    const totalMovies = this.data.movies.length;
    const totalEpisodes = this.data.episodes.length;
    const totalViews = this.data.movies.reduce((acc, m) => acc + (m.viewCount || 0), 0);
    const recentMovies = this.getMovies({ limit: 5, sort: 'newest', includeHidden: true });
    const topMovies = this.getMovies({ limit: 5, sort: 'views', includeHidden: true });

    return {
      totalMovies,
      totalEpisodes,
      totalViews,
      recentMovies,
      topMovies,
    };
  }

  // --- BACKUP & RESTORE ---
  public exportDatabase(): DatabaseSchema {
    return this.data;
  }

  public importDatabase(newData: any): boolean {
    if (!newData || !Array.isArray(newData.movies) || !Array.isArray(newData.episodes)) {
      return false;
    }
    this.data = {
      movies: newData.movies,
      episodes: newData.episodes,
      categories: Array.isArray(newData.categories) ? newData.categories : DEFAULT_CATEGORIES,
      settings: { ...DEFAULT_SETTINGS, ...(newData.settings || {}) },
      chatMessages: Array.isArray(newData.chatMessages) ? newData.chatMessages : (this.data.chatMessages || []),
      feedbacks: Array.isArray(newData.feedbacks) ? newData.feedbacks : (this.data.feedbacks || []),
      memberSubmissions: Array.isArray(newData.memberSubmissions) ? newData.memberSubmissions : (this.data.memberSubmissions || []),
    };
    this.save();
    return true;
  }

  // --- CHAT MESSAGES (Tự động xóa sau 7 ngày) ---
  private cleanExpiredChatMessages(): void {
    if (!this.data || !this.data.chatMessages) return;
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày = 604.800.000 ms
    const now = Date.now();
    const originalLength = this.data.chatMessages.length;
    this.data.chatMessages = this.data.chatMessages.filter((msg) => {
      const msgTime = new Date(msg.createdAt).getTime();
      return !isNaN(msgTime) && (now - msgTime < SEVEN_DAYS_MS);
    });
    if (this.data.chatMessages.length !== originalLength) {
      this.save();
    }
  }

  public getChatMessages(limit = 60): ChatMessage[] {
    this.cleanExpiredChatMessages();
    const messages = this.data.chatMessages || [];
    return messages.slice(-limit);
  }

  public addChatMessage(payload: { senderName: string; content: string; senderBadge?: string; avatarColor?: string; avatar?: string }): ChatMessage {
    this.cleanExpiredChatMessages();
    if (!this.data.chatMessages) this.data.chatMessages = [];
    const msg: ChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderName: payload.senderName.trim().slice(0, 30) || 'Thành viên',
      senderBadge: payload.senderBadge || 'Thành viên',
      avatarColor: payload.avatarColor || '#2563eb',
      avatar: payload.avatar || '🦁',
      content: payload.content.trim().slice(0, 500),
      createdAt: new Date().toISOString(),
    };
    this.data.chatMessages.push(msg);
    // Giữ tối đa 300 tin nhắn gần nhất trong vòng 7 ngày
    if (this.data.chatMessages.length > 300) {
      this.data.chatMessages = this.data.chatMessages.slice(-300);
    }
    this.save();
    return msg;
  }

  public deleteChatMessage(id: string): boolean {
    if (!this.data.chatMessages) return false;
    const idx = this.data.chatMessages.findIndex(m => m.id === id);
    if (idx === -1) return false;
    this.data.chatMessages.splice(idx, 1);
    this.save();
    return true;
  }

  // --- FEEDBACK & BUG REPORT ---
  public getFeedbacks(): FeedbackItem[] {
    return (this.data.feedbacks || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createFeedback(payload: Omit<FeedbackItem, 'id' | 'status' | 'createdAt'>): FeedbackItem {
    if (!this.data.feedbacks) this.data.feedbacks = [];
    const item: FeedbackItem = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: payload.name?.trim() || 'Khán giả ẩn danh',
      contact: payload.contact?.trim() || '',
      type: payload.type || 'Góp ý tính năng',
      movieTitle: payload.movieTitle?.trim() || '',
      episodeNumber: payload.episodeNumber ? Number(payload.episodeNumber) : undefined,
      content: payload.content.trim(),
      status: 'Chờ xử lý',
      createdAt: new Date().toISOString(),
    };
    this.data.feedbacks.unshift(item);
    this.save();
    return item;
  }

  public updateFeedbackStatus(id: string, status: 'Chờ xử lý' | 'Đã xử lý'): boolean {
    if (!this.data.feedbacks) return false;
    const item = this.data.feedbacks.find(f => f.id === id);
    if (!item) return false;
    item.status = status;
    this.save();
    return true;
  }

  public deleteFeedback(id: string): boolean {
    if (!this.data.feedbacks) return false;
    const idx = this.data.feedbacks.findIndex(f => f.id === id);
    if (idx === -1) return false;
    this.data.feedbacks.splice(idx, 1);
    this.save();
    return true;
  }

  // --- MEMBER MOVIE SUBMISSIONS ---
  public getMemberSubmissions(status?: string): MemberMovieSubmission[] {
    let list = this.data.memberSubmissions || [];
    if (status) {
      list = list.filter(s => s.status === status);
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createMemberSubmission(payload: Omit<MemberMovieSubmission, 'id' | 'status' | 'viewCount' | 'createdAt' | 'updatedAt'>): MemberMovieSubmission {
    if (!this.data.memberSubmissions) this.data.memberSubmissions = [];
    const now = new Date().toISOString();
    const submission: MemberMovieSubmission = {
      ...payload,
      id: `mmsub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: payload.title.trim(),
      slug: generateSlug(payload.title),
      contributorName: payload.contributorName?.trim() || 'Hội viên ẩn danh',
      status: 'Chờ duyệt',
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.data.memberSubmissions.unshift(submission);
    this.save();
    return submission;
  }

  public approveMemberSubmission(id: string, parsedVideo: any): { success: boolean; movie?: Movie; error?: string } {
    if (!this.data.memberSubmissions) return { success: false, error: 'Không tìm thấy dữ liệu đóng góp.' };
    const sub = this.data.memberSubmissions.find(s => s.id === id);
    if (!sub) return { success: false, error: 'Không tìm thấy phim đóng góp này.' };

    const categories = Array.from(new Set(['Phim Hội Viên', ...(sub.category || [])]));
    const movie = this.createMovie({
      title: sub.title,
      slug: sub.slug,
      description: `${sub.description || ''}\n\n[ Phim do Hội viên "${sub.contributorName}" đóng góp cho cộng đồng PHIM HAY 247 ]`,
      posterUrl: sub.posterUrl || parsedVideo?.thumbnailUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
      bannerUrl: sub.posterUrl || parsedVideo?.thumbnailUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200',
      category: categories,
      year: new Date().getFullYear(),
      status: 'Hoàn thành',
      keywords: `${sub.title}, phim hoi vien, ${sub.contributorName}`,
      seoTitle: `${sub.title} - Phim Hội Viên Đóng Góp`,
      seoDescription: sub.description || `${sub.title} do thành viên ${sub.contributorName} chia sẻ trên PHIM HAY 247.`,
      featured: true,
      hidden: false,
    });

    movie.contributorName = sub.contributorName;

    this.createEpisode({
      movieId: movie.id,
      episodeNumber: 1,
      title: 'Tập 1',
      youtubeUrl: parsedVideo.watchUrl,
      youtubeVideoId: parsedVideo.videoId,
      youtubeEmbedUrl: parsedVideo.embedUrl,
      thumbnailUrl: parsedVideo.thumbnailUrl,
      servers: [
        {
          id: `srv-${Date.now()}`,
          name: `Server 1 (${parsedVideo.platformName})`,
          url: parsedVideo.watchUrl,
          videoId: parsedVideo.videoId,
          embedUrl: parsedVideo.embedUrl,
          platform: parsedVideo.videoType,
        },
      ],
    });

    sub.status = 'Đã duyệt';
    sub.approvedMovieId = movie.id;
    sub.updatedAt = new Date().toISOString();
    this.save();

    return { success: true, movie };
  }

  public rejectMemberSubmission(id: string, reason?: string): boolean {
    if (!this.data.memberSubmissions) return false;
    const sub = this.data.memberSubmissions.find(s => s.id === id);
    if (!sub) return false;
    sub.status = 'Từ chối';
    if (reason) {
      sub.rejectionReason = reason;
    }
    sub.updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  public deleteMemberSubmission(id: string): boolean {
    if (!this.data.memberSubmissions) return false;
    const idx = this.data.memberSubmissions.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.data.memberSubmissions.splice(idx, 1);
    this.save();
    return true;
  }
}

export const db = new DatabaseService();
