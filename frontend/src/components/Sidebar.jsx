import { Link } from 'react-router-dom';

export default function Sidebar({ user, stats, sidebarOpen, setSidebarOpen, onLogout }) {
  return (
    <>
      <aside className={`bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-20'} flex flex-col shadow-2xl`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-2xl hover:bg-slate-700/50 p-2 rounded-lg transition-all duration-300 hover:scale-110"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <span className="text-3xl">📚</span>
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Book Finder
              </h2>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <>
            {/* User Profile */}
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl shadow-lg ring-4 ring-slate-700/50">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg truncate">{user.name}</p>
                  <p className="text-sm text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <Link
                to="/"
                className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-cyan-600/20 transition-all duration-300 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🔍</span>
                <span className="font-semibold">Search Books</span>
              </Link>
              <Link
                to="/library"
                className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-cyan-600/20 transition-all duration-300 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">📚</span>
                <span className="font-semibold">My Library</span>
              </Link>
              <Link
                to="/favourites"
                className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-cyan-600/20 transition-all duration-300 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">❤️</span>
                <span className="font-semibold">Favourites</span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-cyan-600/20 transition-all duration-300 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">⚙️</span>
                <span className="font-semibold">Profile</span>
              </Link>
            </nav>

            {/* Stats Section */}
            <div className="p-6 border-t border-slate-700/50">
              <div className="bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 rounded-xl p-4 mb-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Quick Stats</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✅</span>
                      <span className="text-sm text-slate-300">Finished</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{stats.finished}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📚</span>
                      <span className="text-sm text-slate-300">Reading</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-400">{stats.reading}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                    <span className="text-sm text-slate-400">Total Books</span>
                    <p className="text-xl font-bold text-cyan-400">{stats.total}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                <span className="text-xl">🚪</span>
                Logout
              </button>
            </div>
          </>
        )}

        {/* Collapsed State Icons */}
        {!sidebarOpen && (
          <div className="flex-1 flex flex-col items-center py-6 space-y-6">
            <Link to="/" className="text-3xl hover:scale-125 transition-transform" title="Search Books">
              🔍
            </Link>
            <Link to="/library" className="text-3xl hover:scale-125 transition-transform" title="My Library">
              📚
            </Link>
            <Link to="/favourites" className="text-3xl hover:scale-125 transition-transform" title="Favourites">
              ❤️
            </Link>
            <Link to="/profile" className="text-3xl hover:scale-125 transition-transform" title="Profile">
              ⚙️
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
