import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ user, onLogout }) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 border-b shadow-xl transition-colors duration-300 ${
      isDark ? 'bg-[#121212] border-white/10' : 'bg-white border-gray-200'
    }`}>
      <div className="w-full px-8 py-5">
        <div className={`flex items-center justify-between ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform neon-glow">
              <span className="text-3xl">📖</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                BookFinder
              </h1>
              <p className="text-sm text-gray-400">Discover & Organize</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className={`px-6 py-3 rounded-full font-semibold text-lg transition-all ${
                isActive('/') 
                  ? 'bg-gradient-to-r from-emerald-500 to-violet-600 text-white shadow-lg shadow-violet-500/50' 
                  : isDark 
                    ? 'hover:bg-white/5 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">🏡</span> Home
            </Link>
            <Link
              to="/search"
              className={`px-6 py-3 rounded-full font-semibold text-lg transition-all ${
                isActive('/search') 
                  ? 'bg-gradient-to-r from-emerald-500 to-violet-600 text-white shadow-lg shadow-violet-500/50' 
                  : isDark 
                    ? 'hover:bg-white/5 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">🔎</span> Search
            </Link>
            <Link
              to="/library"
              className={`px-6 py-3 rounded-full font-semibold text-lg transition-all ${
                isActive('/library') 
                  ? 'bg-gradient-to-r from-emerald-500 to-violet-600 text-white shadow-lg shadow-violet-500/50' 
                  : isDark 
                    ? 'hover:bg-white/5 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">📚</span> Library
            </Link>
            <Link
              to="/favourites"
              className={`px-6 py-3 rounded-full font-semibold text-lg transition-all ${
                isActive('/favourites') 
                  ? 'bg-gradient-to-r from-emerald-500 to-violet-600 text-white shadow-lg shadow-violet-500/50' 
                  : isDark 
                    ? 'hover:bg-white/5 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">💖</span> Favourites
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-full transition-all hover:scale-110 ${
                isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="text-2xl">{isDark ? '☀️' : '🌙'}</span>
            </button>

            <Link
              to="/profile"
              className={`flex items-center gap-3 px-5 py-3 rounded-full transition-all group ${
                isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'
              }`}
            >
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-violet-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-xl">👨‍💼</span>
              </div>
              <span className={`font-semibold text-lg ${
                isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'
              }`}>{user.name}</span>
            </Link>
            <button
              onClick={onLogout}
              className={`px-6 py-3 border rounded-full font-semibold text-lg transition-all ${
                isDark 
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white'
                  : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">🚪</span> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
