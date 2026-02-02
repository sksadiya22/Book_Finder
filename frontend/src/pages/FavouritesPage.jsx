import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useTheme } from '../context/ThemeContext';

function FavouritesPage({ userEmail, onNotification, onStatsUpdate }) {
  const { isDark } = useTheme();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavouriteBooks();
  }, [userEmail]);

  const loadFavouriteBooks = async () => {
    try {
      setLoading(true);
      const normalizedEmail = userEmail.toLowerCase().trim();
      const response = await fetch(`${API_URL}/books?userEmail=${encodeURIComponent(normalizedEmail)}&favourite=true`);
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      onNotification('Error loading favourite books.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavourite = async (book) => {
    try {
      await fetch(`${API_URL}/books/${book.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favourite: false })
      });
      
      setBooks(books.filter(b => b.id !== book.id));
      onNotification(`"${book.title}" removed from favourites.`);
      onStatsUpdate();
    } catch (err) {
      onNotification('Error removing from favourites.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-white">
        <div className="inline-block animate-spin text-6xl mb-4">❤️</div>
        <p className="text-xl text-gray-400">Loading your favourites...</p>
      </div>
    );
  }

  return (
    <div className={isDark ? 'text-white' : 'text-gray-900'}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
          ❤️ My Favourites
        </h1>
        <p className="text-gray-400">Your most loved books ({books.length})</p>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💔</div>
          <h3 className="text-2xl font-bold mb-2">No favourites yet</h3>
          <p className="text-gray-400">Mark books as favourites from your library to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {books.map((book) => (
            <div
              key={book.id}
              className="group bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-lg rounded-xl p-5 hover:from-pink-500/20 hover:to-purple-500/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-pink-500/20"
            >
              <div className="relative mb-4">
                <img
                  src={book.thumbnail || `https://via.placeholder.com/400x600/1a1a1a/ec4899?text=${encodeURIComponent(book.title.substring(0, 20))}`}
                  alt={book.title}
                  className="w-full h-80 object-cover rounded-xl shadow-2xl"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400x600/1a1a1a/8b5cf6?text=${encodeURIComponent(book.title.substring(0, 20))}`;
                  }}
                />
                
                <button
                  onClick={() => toggleFavourite(book)}
                  className="absolute top-2 right-2 w-12 h-12 bg-red-500 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                >
                  <span className="text-3xl">❤️</span>
                </button>

                <div className="absolute bottom-2 left-2">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                    book.status === 'finished' ? 'bg-green-500' :
                    book.status === 'reading' ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}>
                    {book.status === 'to-read' ? 'To Read' : 
                     book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-pink-400 transition-colors">
                {book.title}
              </h3>
              <p className="text-sm text-gray-400 mb-2 line-clamp-1">
                {book.authors?.join(', ')}
              </p>
              {book.notes && (
                <p className="text-sm text-gray-400 italic line-clamp-2">"{book.notes}"</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavouritesPage;
