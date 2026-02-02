import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

function LoginPageInline({ onLoginSuccess }) {
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
      // Check if user exists in database
      const response = await fetch(`http://localhost:5000/users?email=${encodeURIComponent(normalizedEmail)}`);
      const users = await response.json();

      if (isLogin) {
        // Login mode - user must exist
        if (users.length === 0) {
          setError('Email not found. Please sign up first.');
          setLoading(false);
          return;
        }

        const dbUser = users[0];

        const user = {
          name: dbUser.name,
          email: dbUser.email
        };
        localStorage.setItem('user', JSON.stringify(user));
        onLoginSuccess('Login successful! Welcome back.');
      } else {
        // Signup mode - user must not exist
        if (users.length > 0) {
          setError('Email already registered. Please login instead.');
          setLoading(false);
          return;
        }

        // Create new user
        const newUser = {
          name: name || email.split('@')[0],
          email: normalizedEmail,
          password: password,
          createdAt: new Date().toISOString()
        };

        const createResponse = await fetch('http://localhost:5000/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });

        const savedUser = await createResponse.json();

        const user = {
          name: savedUser.name,
          email: savedUser.email
        };
        localStorage.setItem('user', JSON.stringify(user));
        onLoginSuccess('Registration successful! Welcome to Book Finder.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 relative bg-slate-800">
        <img
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80"
          alt="Library"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">📚 Book Finder</h1>
          <p className="text-xl drop-shadow-md">Discover, organize, and manage your personal library</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600 mb-8">
            {isLogin ? 'Login to access your library' : 'Sign up to get started'}
          </p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
              <p className="font-semibold">⚠️ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength="6"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-300"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-blue-500 font-semibold cursor-pointer hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function SearchPageInline({ userEmail, onNotification, onStatsUpdate }) {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const searchBooks = async (searchQuery) => {
    setLoading(true);
    setError('');
    setHasSearched(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=20`
      );
      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        setBooks([]);
        setLoading(false);
        return;
      }

      const formattedBooks = data.items.map(item => {
        const imageLinks = item.volumeInfo?.imageLinks;
        let thumbnail = null;

        if (imageLinks) {
          // Try different image sizes
          let originalUrl = imageLinks.thumbnail || imageLinks.smallThumbnail || imageLinks.medium || imageLinks.large;

          // Ensure HTTPS
          if (originalUrl && originalUrl.startsWith('http:')) {
            originalUrl = originalUrl.replace('http:', 'https:');
          }

          // Use proxy to bypass CORS
          if (originalUrl) {
            thumbnail = `http://localhost:5000/proxy-image?url=${encodeURIComponent(originalUrl)}`;
          }
        }

        return {
          googleId: item.id,
          title: item.volumeInfo?.title || 'No Title',
          authors: item.volumeInfo?.authors || ['Unknown Author'],
          thumbnail: thumbnail,
          originalThumbnail: imageLinks?.thumbnail || imageLinks?.smallThumbnail,
          description: item.volumeInfo?.description || 'No description available.',
          publishedDate: item.volumeInfo?.publishedDate || '',
          pageCount: item.volumeInfo?.pageCount || 0,
        };
      });

      setBooks(formattedBooks);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      searchBooks(query);
    }
  };

  const addToLibrary = async (book) => {
    try {
      const newBook = {
        ...book,
        userEmail: userEmail.toLowerCase().trim(), // Normalize email
        status: 'to-read',
        favourite: false,
        notes: '',
        addedAt: new Date().toISOString()
      };
      const response = await fetch('http://localhost:5000/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook)
      });
      await response.json();
      onNotification(`"${book.title}" added to your library!`);
      if (onStatsUpdate) onStatsUpdate();
    } catch (err) {
      console.error('Error adding book:', err);
      alert('Failed to add book to library.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-16 px-8 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 flex items-center gap-3">
            🔍 Discover Your Next Great Read
          </h1>
          <p className="text-xl text-emerald-100 mb-8">
            Search millions of books and build your personal library
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, author, ISBN, or keyword..."
                  className="w-full px-6 py-4 text-lg text-gray-800 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-300 transition"
                  disabled={loading}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-white text-emerald-600 font-bold text-lg rounded-xl shadow-lg hover:bg-emerald-50 transition disabled:bg-gray-300 disabled:text-gray-500"
                disabled={loading || !query.trim()}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {!hasSearched && !loading && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">📚</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Start Your Book Discovery Journey</h2>
            <p className="text-xl text-gray-600 mb-8">Search for books by title, author, or any keyword</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Harry Potter', 'JavaScript', 'Psychology', 'Science Fiction'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    searchBooks(suggestion);
                  }}
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-md hover:shadow-lg hover:bg-blue-50 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-16 w-16 text-blue-600 mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl text-gray-600">Searching for books...</p>
          </div>
        )}

        {books.length > 0 && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Found {books.length} {books.length === 1 ? 'book' : 'books'}
              </h2>
              <p className="text-gray-600">Showing results for "{query}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book, index) => (
                <div
                  key={book.googleId}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Book Cover */}
                  <div className="relative h-64 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center overflow-hidden p-4">
                    {book.thumbnail && (
                      <img
                        src={book.thumbnail}
                        alt={book.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                        onLoad={(e) => {
                          e.target.nextElementSibling.style.display = 'none';
                        }}
                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300 z-10"
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
                      <span className="text-6xl mb-2">📚</span>
                      <span className="text-sm font-semibold text-center px-2">{book.title.substring(0, 30)}</span>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 flex items-center gap-2">
                      <span className="text-blue-500">✍️</span>
                      {book.authors.join(', ')}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      {book.publishedDate && (
                        <span className="flex items-center gap-1">
                          📅 {book.publishedDate.split('-')[0]}
                        </span>
                      )}
                      {book.pageCount > 0 && (
                        <span className="flex items-center gap-1">
                          📄 {book.pageCount} pages
                        </span>
                      )}
                    </div>

                    <p className="text-gray-500 text-sm line-clamp-3 mb-4 leading-relaxed">
                      {book.description}
                    </p>

                    <button
                      onClick={() => addToLibrary(book)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <span className="text-xl">+</span>
                      Add to Library
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && books.length === 0 && hasSearched && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🔍</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No Books Found</h2>
            <p className="text-xl text-gray-600 mb-8">
              We couldn't find any books matching "{query}"
            </p>
            <button
              onClick={() => {
                setQuery('');
                setHasSearched(false);
                setBooks([]);
              }}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Try Another Search
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <span className="font-bold text-gray-800">Book Finder</span>
              </div>
              <p className="text-gray-600 text-sm">
                Powered by Google Books API • Built with React & Tailwind CSS
              </p>
              <p className="text-gray-500 text-sm">
                © 2025 Book Finder. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function LibraryPageInline({ userEmail, onNotification, onStatsUpdate }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    loadLibrary();
  }, [userEmail]);

  const loadLibrary = async () => {
    try {
      const response = await fetch(`http://localhost:5000/books?userEmail=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      console.error('Error loading library:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBook = async (id, updates) => {
    try {
      await fetch(`http://localhost:5000/books/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      await loadLibrary();
      setEditingId(null);
      if (updates.favourite !== undefined) {
        onNotification(updates.favourite ? 'Added to favourites! ⭐' : 'Removed from favourites');
      } else {
        onNotification('Book updated successfully!');
      }
      if (onStatsUpdate) onStatsUpdate();
    } catch (err) {
      alert('Failed to update book.');
    }
  };

  const deleteBook = async (id, title) => {
    if (confirm('Remove this book from your library?')) {
      try {
        await fetch(`http://localhost:5000/books/${id}`, { method: 'DELETE' });
        await loadLibrary();
        onNotification(`"${title}" removed from library`);
        if (onStatsUpdate) onStatsUpdate();
      } catch (err) {
        alert('Failed to delete book.');
      }
    }
  };

  const startEdit = (book) => {
    setEditingId(book.id);
    setEditStatus(book.status);
    setEditNotes(book.notes || '');
  };

  const saveEdit = (id) => {
    updateBook(id, { status: editStatus, notes: editNotes });
  };

  if (loading) return <div className="p-8"><p>Loading library...</p></div>;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 My Library</h1>
      <p className="text-gray-600 mb-8">{books.length} {books.length === 1 ? 'book' : 'books'} in your library</p>

      {books.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-8xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your library is empty</h2>
          <p className="text-gray-600">Start adding books from the Search page!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map(book => (
            <div key={book.id} className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition ${book.favourite ? 'ring-2 ring-yellow-400' : ''}`}>
              <div className="relative h-64 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
                <img
                  src={book.thumbnail}
                  alt={book.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                  className="max-h-full max-w-full object-contain z-10"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
                  <span className="text-6xl mb-2">📚</span>
                  <span className="text-sm font-semibold text-center px-2">{book.title.substring(0, 30)}</span>
                </div>
                {book.favourite && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-white p-2 rounded-full text-xl shadow-lg z-20">⭐</div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2">{book.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{book.authors.join(', ')}</p>

                {editingId === book.id ? (
                  <div className="space-y-3">
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="to-read">To Read</option>
                      <option value="reading">Reading</option>
                      <option value="finished">Finished</option>
                    </select>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add notes..."
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                      rows="3"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(book.id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition">
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${book.status === 'to-read' ? 'bg-blue-100 text-blue-700' :
                        book.status === 'reading' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                      }`}>
                      {book.status === 'to-read' && '📖 To Read'}
                      {book.status === 'reading' && '📚 Reading'}
                      {book.status === 'finished' && '✅ Finished'}
                    </div>
                    {book.notes && <p className="text-sm italic text-gray-600 mb-3">"{book.notes}"</p>}

                    <div className="flex gap-2">
                      <button onClick={() => startEdit(book)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition text-sm">
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => updateBook(book.id, { favourite: !book.favourite })}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition text-sm"
                      >
                        {book.favourite ? '💔' : '❤️'}
                      </button>
                      <button onClick={() => deleteBook(book.id, book.title)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition text-sm">
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <span className="font-bold text-gray-800">Book Finder</span>
            </div>
            <p className="text-gray-600 text-sm">
              Manage your personal library with ease
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 Book Finder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Notification({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 z-50 animate-slide-in-right min-w-[250px]">
      <span>✓ {message}</span>
      <button onClick={onClose} className="text-2xl leading-none hover:opacity-75">×</button>
    </div>
  );
}

function AppTailwind() {
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({ finished: 0, reading: 0, total: 0 });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const normalizedEmail = user.email.toLowerCase().trim();
      const response = await fetch(`http://localhost:5000/books?userEmail=${encodeURIComponent(normalizedEmail)}`);
      const books = await response.json();

      const finished = books.filter(b => b.status === 'finished').length;
      const reading = books.filter(b => b.status === 'reading').length;

      setStats({
        finished,
        reading,
        total: books.length
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleLoginSuccess = (message) => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setNotification(message);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setNotification('Logged out successfully.');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {notification && (
          <Notification
            message={notification}
            onClose={() => setNotification('')}
          />
        )}

        {user ? (
          <div className="flex h-screen">
            {/* Sidebar */}
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
                      onClick={handleLogout}
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
                </div>
              )}
            </aside>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<SearchPageInline userEmail={user.email} onNotification={setNotification} onStatsUpdate={loadStats} />} />
                <Route path="/library" element={<LibraryPageInline userEmail={user.email} onNotification={setNotification} onStatsUpdate={loadStats} />} />
                <Route path="/login" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPageInline onLoginSuccess={handleLoginSuccess} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default AppTailwind;
