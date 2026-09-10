import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Layouts
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { HomePage } from './pages/HomePage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { WatchPage } from './pages/WatchPage';
import { CategoryPage } from './pages/CategoryPage';
import { SearchPage } from './pages/SearchPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { LoginPage } from './pages/admin/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { MovieListPage } from './pages/admin/MovieListPage';
import { MovieEditPage } from './pages/admin/MovieEditPage';
import { EpisodeListPage } from './pages/admin/EpisodeListPage';
import { CategoryManagePage } from './pages/admin/CategoryManagePage';
import { SettingsPage } from './pages/admin/SettingsPage';

// Public Shell
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-cinema-950 text-gray-100 selection:bg-red-600 selection:text-white">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
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
            <Route path="/phim/:slug" element={<MovieDetailPage />} />
            {/* Hỗ trợ URL tập dạng /phim/:slug/:episodeNumber (ví dụ /phim/luu-ly-kiem-tong/tap-22) */}
            <Route path="/phim/:slug/:episodeNumber" element={<WatchPage />} />
            <Route path="/the-loai/:slug" element={<CategoryPage />} />
            <Route path="/tim-kiem" element={<SearchPage />} />
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
            <Route path="categories" element={<CategoryManagePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default App;
