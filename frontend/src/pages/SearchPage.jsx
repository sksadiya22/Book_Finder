import { useState } from 'react';
import { API_URL } from '../config';
import BookDetailModal from '../components/BookDetailModal';
import { useTheme } from '../context/ThemeContext';

export default function SearchPage({ userEmail, onNotification, onStatsUpdate, stats }) {
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const searchBooks = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`
      );
      const data = await response.json();

      const formattedBooks = (data.items || []).map((item) => {
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
          publishedDate: item.volumeInfo.publishedDate,
          pageCount: item.volumeInfo.pageCount,
          rating: item.volumeInfo.averageRating || 0,
          isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier || '',
        };
      });

      setBooks(formattedBooks);
    } catch (err) {
      onNotification('Error searching books. Please try again.');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className={isDark ? 'text-white' : 'text-gray-900'}>
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-2xl p-6 hover-glow border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Finished</p>
              <p className="text-4xl font-bold mt-1 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">{stats.finished}</p>
            </div>
            <div className="text-5xl opacity-30">✅</div>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-6 hover-glow border border-violet-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Reading</p>
              <p className="text-4xl font-bold mt-1 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">{stats.reading}</p>
            </div>
            <div className="text-5xl opacity-30">📖</div>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-6 hover-glow border border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Books</p>
              <p className="text-4xl font-bold mt-1 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{stats.total}</p>
            </div>
            <div className="text-5xl opacity-30">📚</div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
          Discover Books
        </h1>
        <p className="text-gray-500 mb-6">Search millions of books and add them to your library</p>
        
        <form onSubmit={searchBooks} className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for books, authors, or topics..."
            className="flex-1 px-6 py-4 glass rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-violet-600 hover-glow rounded-full font-semibold shadow-lg shadow-violet-500/50 disabled:opacity-50 transition-all"
          >
            {loading ? '🔍 Searching...' : '🔍 Search'}
          </button>
        </form>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-20">
          <div className="inline-block animate-spin text-6xl mb-4">🔍</div>
          <p className="text-xl text-gray-400">Searching for books...</p>
        </div>
      )}

      {!loading && hasSearched && books.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-xl text-gray-400">No books found. Try a different search!</p>
        </div>
      )}

      {!loading && books.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-8">Search Results ({books.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {books.map((book) => (
              <div
                key={book.googleId}
                className="group glass rounded-2xl p-5 hover-glow cursor-pointer animate-fade-in"
                onClick={() => setSelectedBook(book)}
              >
                <div className="relative mb-4">
                  <img
                    src={book.thumbnail || `https://via.placeholder.com/400x600/1a1a1a/8b5cf6?text=${encodeURIComponent(book.title.substring(0, 20))}`}
                    alt={book.title}
                    className="w-full h-80 object-cover rounded-xl shadow-2xl"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/400x600/1a1a1a/10b981?text=${encodeURIComponent(book.title.substring(0, 20))}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <span className="text-white font-bold text-base">👁️ View Details</span>
                  </div>
                </div>
                
                <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-violet-400 group-hover:bg-clip-text group-hover:text-transparent transition-colors">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                  {book.authors.join(', ')}
                </p>
                {book.rating > 0 && (
                  <div className="text-sm text-yellow-400 font-semibold flex items-center gap-1">
                    ⭐ {book.rating}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Book Detail Modal */}
          <BookDetailModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onAddToLibrary={addToLibrary}
          />
        </div>
      )}

      {!hasSearched && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold mb-2">Start Your Book Journey</h3>
          <p className="text-gray-400">Search for any book and build your personal library</p>
        </div>
      )}
    </div>
  );
}
