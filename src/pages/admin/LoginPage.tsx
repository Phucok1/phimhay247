import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, ArrowLeft, Key, AlertCircle, Loader2 } from 'lucide-react';
import { loginAdmin } from '../../services/api';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export const LoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [useFirebase, setUseFirebase] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (useFirebase && auth) {
        // Đăng nhập bằng Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('phimhay247_admin_token', token);
        navigate('/admin');
      } else {
        // Đăng nhập bằng Mật khẩu quản trị an toàn (Server verified)
        const res = await loginAdmin(password);
        if (res.success) {
          localStorage.setItem('phimhay247_admin_token', res.token);
          navigate('/admin');
        } else {
          setError('Mật khẩu quản trị không chính xác.');
        }
      }
    } catch (err: any) {
      console.error('Lỗi đăng nhập:', err);
      setError(err.response?.data?.error || err.message || 'Đăng nhập không thành công.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cinema-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center shadow-xl shadow-red-950/50">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-white tracking-tight">
          Đăng Nhập Quản Trị
        </h2>
        <p className="mt-1 text-center text-xs text-gray-400">
          Khu vực quản lý phim & tập phim của <span className="text-red-400 font-semibold">PHIM HAY 247</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-cinema-900 py-8 px-6 sm:px-10 rounded-2xl border border-cinema-800 shadow-2xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-800/80 flex items-center gap-2.5 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {useFirebase && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Email Admin Firebase
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@phimhay247.vn"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                {useFirebase ? 'Mật khẩu' : 'Mật khẩu quản trị Admin'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={useFirebase ? 'Nhập mật khẩu...' : 'Mặc định: phucok1234'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-sm"
                />
                <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
              {!useFirebase && (
                <p className="mt-1.5 text-[11px] text-gray-500">
                  Mật khẩu mặc định hệ thống: <code className="text-amber-400 bg-black/40 px-1 py-0.5 rounded">phucok1234</code> (có thể đổi trong Cài đặt).
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white text-sm font-bold shadow-lg shadow-red-950 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                'Đăng nhập vào Dashboard'
              )}
            </button>
          </form>

          {/* Toggle phương thức đăng nhập */}
          <div className="mt-6 pt-5 border-t border-cinema-800 text-center">
            <button
              type="button"
              onClick={() => {
                setUseFirebase(!useFirebase);
                setError(null);
              }}
              className="text-xs text-gray-400 hover:text-white transition underline"
            >
              {useFirebase
                ? 'Đổi sang đăng nhập bằng Mật khẩu quản trị trực tiếp'
                : 'Đổi sang đăng nhập qua Firebase Authentication'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Về lại website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
