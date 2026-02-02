import { useState } from 'react';
import { API_URL } from '../config';

export default function LoginPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const normalizedEmail = email.toLowerCase().trim();

    try {
      const response = await fetch(`${API_URL}/users?email=${encodeURIComponent(normalizedEmail)}`);
      const users = await response.json();

      if (isLogin) {
        if (users.length === 0) {
          setError('Email not found. Please sign up first.');
          setLoading(false);
          return;
        }

        const dbUser = users[0];
        const user = { name: dbUser.name, email: dbUser.email };
        localStorage.setItem('user', JSON.stringify(user));
        onLoginSuccess('Login successful! Welcome back.');
      } else {
        if (users.length > 0) {
          setError('Email already registered. Please login instead.');
          setLoading(false);
          return;
        }

        const newUser = {
          name: name || email.split('@')[0],
          email: normalizedEmail,
          password: password,
          createdAt: new Date().toISOString()
        };

        const createResponse = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });

        const savedUser = await createResponse.json();
        const user = { name: savedUser.name, email: savedUser.email };
        localStorage.setItem('user', JSON.stringify(user));
        onLoginSuccess('Registration successful! Welcome to BookFinder.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-white space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-4xl">📚</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                BookFinder
              </h1>
              <p className="text-gray-400">Your Personal Library</p>
            </div>
          </div>

          <h2 className="text-6xl font-bold leading-tight">
            Discover, Organize & Track Your Reading Journey
          </h2>
          
          <p className="text-2xl text-gray-300">
            Join thousands of readers managing their book collections with ease
          </p>

          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-3xl">🔎</span>
              </div>
              <div>
                <h3 className="font-bold text-xl">Search Millions of Books</h3>
                <p className="text-gray-400 text-base">Access Google Books library instantly</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center">
                <span className="text-3xl">📚</span>
              </div>
              <div>
                <h3 className="font-bold text-xl">Organize Your Library</h3>
                <p className="text-gray-400 text-base">Track reading status and add notes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-3xl">💖</span>
              </div>
              <div>
                <h3 className="font-bold text-xl">Save Your Favorites</h3>
                <p className="text-gray-400 text-base">Create your personal collection</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-10">
            <h3 className="text-4xl font-bold text-white mb-3">
              {isLogin ? 'Welcome Back!' : 'Get Started'}
            </h3>
            <p className="text-lg text-gray-300">
              {isLogin ? 'Login to continue your reading journey' : 'Create your account in seconds'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-5 rounded-xl mb-8 backdrop-blur-sm">
              <p className="font-semibold text-lg">⚠️ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-base font-semibold text-gray-200 mb-3">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-base font-semibold text-gray-200 mb-3">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-200 mb-3">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength="6"
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-lg py-5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin text-xl">⏳</span> Please wait...
                </span>
              ) : (
                <span className="text-xl">{isLogin ? '🔐 Login' : '✨ Create Account'}</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-lg text-gray-300">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-purple-400 font-bold text-lg hover:text-purple-300 underline"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>

          {/* Demo Account */}
          <div className="mt-8 p-5 bg-blue-500/20 border border-blue-500/30 rounded-xl backdrop-blur-sm">
            <p className="text-base text-blue-200 text-center">
              🎯 <strong>Demo Account:</strong> demo@bookfinder.com / demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
