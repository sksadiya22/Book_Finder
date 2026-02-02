export default function BookDetailModal({ book, onClose, onAddToLibrary }) {
  if (!book) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20" onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="float-right w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
          >
            ✕
          </button>

          <div className="grid grid-cols-3 gap-8">
            {/* Book Cover */}
            <div className="col-span-1">
              <img
                src={book.thumbnail || 'https://via.placeholder.com/300x450?text=No+Cover'}
                alt={book.title}
                className="w-full rounded-2xl shadow-2xl"
              />
              {book.rating > 0 && (
                <div className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded-full text-center font-bold">
                  ⭐ {book.rating} / 5
                </div>
              )}
            </div>

            {/* Book Details */}
            <div className="col-span-2 text-white">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {book.title}
              </h1>
              <p className="text-xl text-gray-300 mb-4">by {book.authors.join(', ')}</p>

              <div className="flex gap-4 mb-6">
                {book.publishedDate && (
                  <div className="bg-white/10 px-4 py-2 rounded-full">
                    📅 {new Date(book.publishedDate).getFullYear()}
                  </div>
                )}
                {book.pageCount && (
                  <div className="bg-white/10 px-4 py-2 rounded-full">
                    📖 {book.pageCount} pages
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Description</h3>
                <p className="text-gray-300 leading-relaxed max-h-48 overflow-y-auto">
                  {book.description}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-bold mb-3">Add to Your Library</h3>
                <button
                  onClick={() => {
                    onAddToLibrary(book, 'to-read');
                    onClose();
                  }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold text-lg transition-all shadow-lg"
                >
                  📚 Add to To Read
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      onAddToLibrary(book, 'reading');
                      onClose();
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all"
                  >
                    📖 Currently Reading
                  </button>
                  <button
                    onClick={() => {
                      onAddToLibrary(book, 'finished');
                      onClose();
                    }}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold transition-all"
                  >
                    ✅ Finished
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
