import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { isDark } = useTheme();
  
  return (
    <footer className={`border-t mt-20 transition-colors duration-300 ${
      isDark ? 'glass border-white/5' : 'bg-white border-gray-200'
    }`}>
      <div className="w-full px-12 py-16">
        <div className="grid grid-cols-4 gap-16 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg neon-glow">
                <span className="text-4xl">📖</span>
              </div>
              <div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  BookFinder
                </h3>
                <p className="text-base text-gray-500">Discover & Organize</p>
              </div>
            </div>
            <p className="text-lg text-gray-400 leading-relaxed">
              Your personal library manager. Discover millions of books, organize your reading journey, and track your progress.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 text-2xl">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-gray-400 hover:text-emerald-400 transition-colors text-lg flex items-center gap-2">
                  <span className="text-xl">🏡</span> Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-400 hover:text-emerald-400 transition-colors text-lg flex items-center gap-2">
                  <span className="text-xl">🔎</span> Search Books
                </Link>
              </li>
              <li>
                <Link to="/library" className="text-gray-400 hover:text-emerald-400 transition-colors text-lg flex items-center gap-2">
                  <span className="text-xl">📚</span> My Library
                </Link>
              </li>
              <li>
                <Link to="/favourites" className="text-gray-400 hover:text-emerald-400 transition-colors text-lg flex items-center gap-2">
                  <span className="text-xl">💖</span> Favourites
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-bold mb-6 text-2xl">Features</h4>
            <ul className="space-y-4 text-lg text-gray-400">
              <li className="flex items-center gap-3">
                <span className="text-emerald-400 text-2xl">✅</span> Search Millions of Books
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-400 text-2xl">📊</span> Track Reading Progress
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-400 text-2xl">🗂️</span> Organize Your Library
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-400 text-2xl">💖</span> Save Favourites
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-400 text-2xl">📝</span> Add Personal Notes
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div>
            <h4 className="text-white font-bold mb-6 text-2xl">Platform Stats</h4>
            <div className="space-y-5">
              <div className="glass rounded-2xl p-6 border border-emerald-500/20 hover-glow">
                <p className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  📚 10M+
                </p>
                <p className="text-base text-gray-400 mt-2">Books Available</p>
              </div>
              <div className="glass rounded-2xl p-6 border border-violet-500/20 hover-glow">
                <p className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                  🎉 100%
                </p>
                <p className="text-base text-gray-400 mt-2">Free to Use</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex items-center justify-between">
          <p className="text-lg text-gray-500">
            © 2024 BookFinder. Built with ❤️ for book lovers.
          </p>
          <div className="flex items-center gap-10">
            <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-lg font-medium">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-lg font-medium">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-lg font-medium">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
