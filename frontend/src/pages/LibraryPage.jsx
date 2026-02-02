import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useTheme } from '../context/ThemeContext';

export default function LibraryPage({ userEmail, onNotification, onStatsUpdate, stats }) {
  const { isDark } = useTheme();
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', notes: '', favourite: false });

  useEffect(() => {
    loadLibrary();
  }, [userEmail]);

  const loadLibrary = async () => {
    try {
      const response = await fetch(`${API_URL}/books?userEmail=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      onNotification('Error loading library.');
    }
  };

  const filteredBooks = books.filter((book) => {
    if (filter === 'all') return true;
    return book.status === filter;
  });

  const updateBook = async (id, updates) => {
    try {
      await fetch(`${API_URL}/books/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      await loadLibrary();
      onStatsUpdate();
    } catch (err) {
      onNotification('Error updating book.');
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book.id);
    setEditForm({ status: book.status, notes: book.notes || '', favourite: book.favourite });
  };

  const handleSaveEdit = async (bookId) => {
    await updateBook(bookId, editForm);
    setEditingBook(null);
    onNotification('Book updated successfully!');
  };

  const deleteBook = async (id, title) => {
    if (!confirm(`Remove "${title}" from your library?`)) return;
    
    try {
      await fetch(`${API_URL}/books/${id}`, { method: 'DELETE' });
      await loadLibrary();
      onNotification(`"${title}" removed from library`);
      onStatsUpdate();
    } catch (err) {
      onNotification('Error deleting book.');
    }
  };

  const toggleFavourite = async (book) => {
    await updateBook(book.id, { favourite: !book.favourite });
    onNotification(book.favourite ? 'Removed from favourites' : 'Added to favourites!');
  };

  return (
    <div className={isDark ? 'text-white' : 'text-gray-900'}>
      {/* Header with Stats */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          My Library
        </h1>
        <p className="text-gray-400 mb-6">Manage and organize your book collection</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm">Total Books</p>
            <p className="text-3xl font-bold text-purple-400">{stats.total}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm">Finished</p>
            <p className="text-3xl font-bold text-green-400">{stats.finished}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm">Reading</p>
            <p className="text-3xl font-bold text-blue-400">{stats.reading}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm">To Read</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.total - stats.finished - stats.reading}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          {[
            { value: 'all', label: 'All Books', icon: '📚' },
            { value: 'to-read', label: 'To Read', icon: '📖' },
            { value: 'reading', label: 'Reading', icon: '📗' },
            { value: 'finished', label: 'Finished', icon: '✅' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                filter === f.value
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg scale-105'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold mb-2">No books here yet</h3>
          <p className="text-gray-400">Start adding books to your library!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="group bg-white/5 backdrop-blur-lg rounded-xl p-5 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/10"
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
                
                {/* Favourite Badge */}
                <button
                  onClick={() => toggleFavourite(book)}
                  className="absolute top-2 right-2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <span className="text-3xl">{book.favourite ? '❤️' : '🤍'}</span>
                </button>

                {/* Status Badge */}
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

              <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                {book.title}
              </h3>
              <p className="text-sm text-gray-400 mb-3 line-clamp-1">
                {book.authors?.join(', ')}
              </p>

              {editingBook === book.id ? (
                <div className="space-y-3">
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-base text-white"
                  >
                    <option value="to-read">To Read</option>
                    <option value="reading">Reading</option>
                    <option value="finished">Finished</option>
                  </select>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Notes..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-base text-white placeholder-gray-400"
                    rows="3"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSaveEdit(book.id)}
                      className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingBook(null)}
                      className="px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {book.notes && (
                    <p className="text-sm text-gray-400 line-clamp-2 italic">"{book.notes}"</p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleEdit(book)}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBook(book.id, book.title)}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
