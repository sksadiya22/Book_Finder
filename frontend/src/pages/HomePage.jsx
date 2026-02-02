import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import BookDetailModal from '../components/BookDetailModal';
import { useTheme } from '../context/ThemeContext';

export default function HomePage({ userEmail, stats, onNotification, onStatsUpdate }) {
  const { isDark } = useTheme();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);
    try {
      // Fetch featured books from Google Books API
      const featuredResponse = await fetch(
        'https://www.googleapis.com/books/v1/volumes?q=bestseller&maxResults=10&orderBy=relevance'
      );
      const featuredData = await featuredResponse.json();
      
      const trendingResponse = await fetch(
        'https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=10&orderBy=newest'
      );
      const trendingData = await trendingResponse.json();

      setFeaturedBooks(formatBooks(featuredData.items || []));
      setTrendingBooks(formatBooks(trendingData.items || []));

      // Load user's recently added books
      if (userEmail) {
        const userBooksResponse = await fetch(
          `${API_URL}/books?userEmail=${encodeURIComponent(userEmail)}&_sort=addedAt&_order=desc&_limit=5`
        );
        const userBooks = await userBooksResponse.json();
        setRecentlyAdded(userBooks);
      }
    } catch (err) {
      console.error('Error loading home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatBooks = (items) => {
    return items.map((item) => {
      // Try to get the best quality image
      let thumbnail = '';
      const imageLinks = item.volumeInfo.imageLinks;
      
      if (imageLinks) {
        // Get the largest available image
        thumbnail = imageLinks.extraLarge || imageLinks.large || imageLinks.medium || imageLinks.thumbnail || imageLinks.smallThumbnail || '';
        
        if (thumbnail) {
          // Convert to HTTPS and get maximum quality
          thumbnail = thumbnail
            .replace('http://', 'https://')
            .replace('&edge=curl', '')
            .replace(/zoom=\d+/, 'zoom=0')  // zoom=0 gives original size
            .replace(/&w=\d+/, '')  // Remove width restriction
            .replace(/&h=\d+/, '');  // Remove height restriction
        }
      }
      
      // If no image, try to get ISBN and use Open Library cover
      if (!thumbnail && item.volumeInfo.industryIdentifiers) {
        const isbn = item.volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10');
        if (isbn) {
          thumbnail = `https://covers.openlibrary.org/b/isbn/${isbn.identifier}-L.jpg`;
        }
      }
      
      return {
        googleId: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || ['Unknown'],
        thumbnail,
        originalThumbnail: item.volumeInfo.imageLinks?.thumbnail || '',
        description: item.volumeInfo.description || 'No description available.',
        rating: item.volumeInfo.averageRating || 0,
        pageCount: item.volumeInfo.pageCount,
        publishedDate: item.volumeInfo.publishedDate,
        isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier || '',
      };
    });
  };

  const addToLibrary = async (book, status) => {
    try {
      const bookData = {
        ...book,
        userEmail: userEmail.toLowerCase().trim(),
        status,
        favourite: false,
        notes: '',
        addedAt: new Date().toISOString(),
      };

      await fetch(`${API_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });

      onNotification(`"${book.title}" added to ${status === 'to-read' ? 'To Read' : status}!`);
      onStatsUpdate();
    } catch (err) {
      onNotification('Error adding book to library.');
    }
  };

  if (loading) {
    return (
      <div className={`text-center py-20 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <div className="inline-block animate-spin text-6xl mb-4">📚</div>
        <p className="text-xl text-gray-400">Loading your personalized feed...</p>
      </div>
    );
  }

  return (
    <div className={isDark ? 'text-white' : 'text-gray-900'}>
      {/* Hero Section */}
      <div className={`relative mb-12 rounded-3xl overflow-hidden transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-r from-emerald-600/30 via-violet-600/30 to-cyan-600/30 backdrop-blur-xl border border-white/10' 
          : 'bg-gradient-to-r from-emerald-500 via-violet-500 to-cyan-500 shadow-2xl'
      }`}>
        <div className={`absolute inset-0 ${
          isDark ? 'bg-gradient-to-br from-black/40 to-transparent' : 'bg-gradient-to-br from-black/20 to-transparent'
        }`}></div>
        <div className="relative px-12 py-16">
          <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
            Welcome back, {userEmail.split('@')[0]}! 👋
          </h1>
          <p className="text-xl mb-8 text-white/95 drop-shadow-md">
            Discover your next favorite book from millions of titles
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl">
            <div className={`rounded-2xl p-5 hover-glow transition-colors duration-300 ${
              isDark ? 'glass' : 'bg-white border border-gray-200 shadow-lg'
            }`}>
              <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{stats.total}</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Books in Library</p>
            </div>
            <div className={`rounded-2xl p-5 hover-glow transition-colors duration-300 ${
              isDark ? 'glass' : 'bg-white border border-gray-200 shadow-lg'
            }`}>
              <p className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">{stats.reading}</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Currently Reading</p>
            </div>
            <div className={`rounded-2xl p-5 hover-glow transition-colors duration-300 ${
              isDark ? 'glass' : 'bg-white border border-gray-200 shadow-lg'
            }`}>
              <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{stats.finished}</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Added */}
      {recentlyAdded.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Continue Reading</h2>
            <Link to="/library" className="text-purple-400 hover:text-purple-300 font-semibold">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-8">
            {recentlyAdded.map((book) => (
              <Link
                key={book.id}
                to="/library"
                className={`group rounded-2xl p-5 hover-glow cursor-pointer animate-fade-in transition-colors duration-300 ${
                  isDark ? 'glass' : 'bg-white border border-gray-200 shadow-lg'
                }`}
              >
                <img
                  src={book.thumbnail || `https://via.placeholder.com/400x600/1a1a1a/06b6d4?text=${encodeURIComponent(book.title.substring(0, 20))}`}
                  alt={book.title}
                  className="w-full h-72 object-cover rounded-xl mb-4 shadow-2xl"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400x600/1a1a1a/8b5cf6?text=${encodeURIComponent(book.title.substring(0, 20))}`;
                  }}
                />
                <h3 className={`font-bold text-base line-clamp-2 ${
                  isDark ? 'group-hover:text-purple-400' : 'text-gray-900 group-hover:text-purple-600'
                }`}>
                  {book.title}
                </h3>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{book.authors?.join(', ')}</p>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    book.status === 'reading' ? 'bg-blue-500' : 'bg-gray-600'
                  }`}>
                    {book.status === 'reading' ? '📖 Reading' : '📚 In Library'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Books */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">🔥 Featured Bestsellers</h2>
            <p className="text-gray-400 mt-1">Handpicked popular books just for you</p>
          </div>
          <Link to="/search" className="text-purple-400 hover:text-purple-300 font-semibold">
            Explore More →
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-8">
          {featuredBooks.slice(0, 4).map((book) => (
            <div
              key={book.googleId}
              onClick={() => setSelectedBook(book)}
              className="group glass rounded-2xl p-5 hover-glow cursor-pointer border border-emerald-500/20 animate-fade-in"
            >
              <div className="relative mb-4">
                <img
                  src={book.thumbnail || `https://via.placeholder.com/400x600/1a1a1a/10b981?text=${encodeURIComponent(book.title.substring(0, 20))}`}
                  alt={book.title}
                  className="w-full h-72 object-cover rounded-xl shadow-2xl"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400x600/1a1a1a/8b5cf6?text=${encodeURIComponent(book.title.substring(0, 20))}`;
                  }}
                />
                {book.rating > 0 && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-black px-3 py-1.5 rounded-full text-sm font-bold">
                    ⭐ {book.rating}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  <span className="text-white font-bold text-base">👁️ View Details</span>
                </div>
              </div>
              <h3 className="font-bold text-base line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-violet-400 group-hover:bg-clip-text group-hover:text-transparent">
                {book.title}
              </h3>
              <p className="text-sm text-gray-500 mt-2 line-clamp-1">{book.authors.join(', ')}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">📈 Trending Now</h2>
            <p className="text-gray-400 mt-1">Latest releases everyone's talking about</p>
          </div>
          <Link to="/search" className="text-purple-400 hover:text-purple-300 font-semibold">
            See All →
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-8">
          {trendingBooks.slice(0, 4).map((book) => (
            <div
              key={book.googleId}
              onClick={() => setSelectedBook(book)}
              className={`group rounded-2xl p-5 hover-glow cursor-pointer animate-fade-in transition-colors duration-300 ${
                isDark ? 'glass border border-violet-500/20' : 'bg-white border border-gray-200 shadow-lg'
              }`}
            >
              <div className="relative mb-4">
                <img
                  src={book.thumbnail || `https://via.placeholder.com/400x600/1a1a1a/06b6d4?text=${encodeURIComponent(book.title.substring(0, 20))}`}
                  alt={book.title}
                  className="w-full h-72 object-cover rounded-xl shadow-2xl"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400x600/1a1a1a/8b5cf6?text=${encodeURIComponent(book.title.substring(0, 20))}`;
                  }}
                />
                <div className="absolute top-2 left-2 bg-gradient-to-r from-emerald-500 to-violet-600 text-white px-3 py-1.5 rounded-full text-sm font-bold neon-glow">
                  🔥 NEW
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  <span className="text-white font-bold text-base">👁️ View Details</span>
                </div>
              </div>
              <h3 className={`font-bold text-base line-clamp-2 ${
                isDark ? 'group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-violet-400 group-hover:bg-clip-text group-hover:text-transparent' : 'text-gray-900 group-hover:text-violet-600'
              }`}>
                {book.title}
              </h3>
              <p className={`text-sm mt-2 line-clamp-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{book.authors.join(', ')}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="glass rounded-3xl p-12 text-center border border-violet-500/20">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
          Ready to discover more?
        </h2>
        <p className="text-xl text-gray-400 mb-8">
          Search from millions of books and build your perfect library
        </p>
        <Link
          to="/search"
          className="inline-block px-8 py-4 bg-gradient-to-r from-emerald-500 to-violet-600 text-white rounded-full font-bold text-lg hover-glow shadow-xl shadow-violet-500/50"
        >
          🔍 Start Searching
        </Link>
      </section>

      {/* Book Detail Modal */}
      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onAddToLibrary={addToLibrary}
      />
    </div>
  );
}
