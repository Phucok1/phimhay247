import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  FolderTree,
  Settings,
  Globe,
  LogOut,
  Menu,
  X,
  Play,
  Shield,
  ExternalLink,
  Crown,
  MessageSquare,
  BookOpen,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra token xác thực admin
    const token = localStorage.getItem('phimhay247_admin_token');
    if (!token && location.pathname !== '/admin/login') {
      navigate('/admin/login');
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('phimhay247_admin_token');
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Quản lý Phim', path: '/admin/movies', icon: Film },
    { label: 'Tủ Sách Truyện Chữ', path: '/admin/novels', icon: BookOpen },
    { label: 'Phim Hội Viên', path: '/admin/member-movies', icon: Crown },
    { label: 'Góp ý & Báo lỗi', path: '/admin/feedback', icon: MessageSquare },
    { label: 'Thể loại', path: '/admin/categories', icon: FolderTree },
    { label: 'Cài đặt & API', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-cinema-950 flex flex-col md:flex-row text-gray-100">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-cinema-900 border-b border-cinema-800">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">PHIM HAY 247 ADMIN</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-cinema-800 text-gray-300"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-cinema-900 border-r border-cinema-800 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:flex-shrink-0`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-cinema-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center shadow-md">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-wide">PHIM HAY 247</h2>
              <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">Admin Panel</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 flex-grow">
          {navItems.map((item) => {
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                    : 'text-gray-300 hover:bg-cinema-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-cinema-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-gray-300 hover:bg-cinema-800 hover:text-white transition"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              Xem Website
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/40 transition"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
