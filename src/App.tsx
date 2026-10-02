import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Layouts
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';
import { LiveChatWidget } from './components/common/LiveChatWidget';
import { QuickSubmitMovieWidget } from './components/common/QuickSubmitMovieWidget';

// Public Pages
import { HomePage } from './pages/HomePage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { WatchPage } from './pages/WatchPage';
import { CategoryPage } from './pages/CategoryPage';
import { SearchPage } from './pages/SearchPage';
import { MemberMoviesPage } from './pages/MemberMoviesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { NovelListPage } from './pages/NovelListPage';
import { NovelDetailPage } from './pages/NovelDetailPage';
import { ChapterReadingPage } from './pages/ChapterReadingPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { DMCAPage } from './pages/DMCAPage';

// Admin Pages
import { LoginPage } from './pages/admin/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { MovieListPage } from './pages/admin/MovieListPage';
import { MovieEditPage } from './pages/admin/MovieEditPage';
import { EpisodeListPage } from './pages/admin/EpisodeListPage';
import { CategoryManagePage } from './pages/admin/CategoryManagePage';
import { MemberMoviesAdminPage } from './pages/admin/MemberMoviesAdminPage';
import { FeedbackAdminPage } from './pages/admin/FeedbackAdminPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { NovelManagePage } from './pages/admin/NovelManagePage';

// Public Shell
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-cinema-950 text-gray-100 selection:bg-red-600 selection:text-white">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      {/* Kênh Chat Trực Tiếp Cộng Đồng & Báo Lỗi (Bên Phải) */}
      <LiveChatWidget />
      {/* Nút Nổi Thêm Phim Hội Viên (Bên Trái) */}
      <QuickSubmitMovieWidget />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/phim-hoi-vien" element={<MemberMoviesPage />} />
            <Route path="/phim/:slug" element={<MovieDetailPage />} />
            {/* Hỗ trợ URL tập dạng /phim/:slug/:episodeNumber (ví dụ /phim/luu-ly-kiem-tong/tap-22) */}
            <Route path="/phim/:slug/:episodeNumber" element={<WatchPage />} />
            <Route path="/the-loai/:slug" element={<CategoryPage />} />
            <Route path="/tim-kiem" element={<SearchPage />} />

            {/* Mục Truyện Chữ (Novel) */}
            <Route path="/truyen" element={<NovelListPage />} />
            <Route path="/truyen/:slug" element={<NovelDetailPage />} />
            <Route path="/truyen/:slug/chuong-:chapterNumber" element={<ChapterReadingPage />} />

            {/* Các trang chính sách chuẩn Google AdSense */}
            <Route path="/gioi-thieu" element={<AboutPage />} />
            <Route path="/lien-he" element={<ContactPage />} />
            <Route path="/chinh-sach-bao-mat" element={<PrivacyPolicyPage />} />
            <Route path="/dieu-khoan" element={<TermsPage />} />
            <Route path="/dmca" element={<DMCAPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin Login */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="movies" element={<MovieListPage />} />
            <Route path="movies/new" element={<MovieEditPage />} />
            <Route path="movies/:id/edit" element={<MovieEditPage />} />
            <Route path="movies/:id/episodes" element={<EpisodeListPage />} />
            <Route path="novels" element={<NovelManagePage />} />
            <Route path="member-movies" element={<MemberMoviesAdminPage />} />
            <Route path="feedback" element={<FeedbackAdminPage />} />
            <Route path="categories" element={<CategoryManagePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default App;
