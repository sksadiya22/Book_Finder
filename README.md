# 📚 Book Finder & Personal Library Manager

A full-stack application that lets you search books from Google Books API and manage your personal library with full CRUD operations.

## 🚀 Features

- **Search Books**: Search books from Google Books API by title, author, or keyword
- **Add to Library**: Save selected books to your personal library (stored in `db.json`)
- **Full CRUD Operations**:
  - **Create**: Add books from search results
  - **Read**: View all books in your library
  - **Update**: Edit book status (to-read/reading/finished), mark as favourite, add notes
  - **Delete**: Remove books from your library
- **Clean UI**: Modern, responsive design with smooth interactions

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + React Router
- **Backend**: JSON Server (REST API)
- **API**: Google Books API
- **HTTP Client**: Axios

## 📦 Installation

### 1. Install Root Dependencies (JSON Server)
```bash
npm install
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

## 🎯 Running the Application

### Option 1: Run Both Servers Together (Recommended)
```bash
npm run dev
```

This will start:
- JSON Server on `http://localhost:5000`
- React app on `http://localhost:5173`

### Option 2: Run Servers Separately

**Terminal 1 - Backend (JSON Server):**
```bash
npm run backend
```

**Terminal 2 - Frontend (React):**
```bash
npm run frontend
```

## 📁 Project Structure

```
├── db.json                          # JSON Server database
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── googleBooks.js      # Google Books API calls
│   │   │   └── library.js          # JSON Server CRUD operations
│   │   ├── components/
│   │   │   ├── SearchBar.jsx       # Search input component
│   │   │   ├── SearchResults.jsx   # Display search results
│   │   │   ├── BookCard.jsx        # Book card for search results
│   │   │   ├── LibraryList.jsx     # Library books list
│   │   │   └── LibraryBookCard.jsx # Book card with edit/delete
│   │   ├── pages/
│   │   │   ├── SearchPage.jsx      # Search books page
│   │   │   └── LibraryPage.jsx     # My library page
│   │   ├── App.jsx                 # Main app with routing
│   │   ├── App.css                 # Styles
│   │   └── main.jsx                # Entry point
│   └── package.json
└── package.json                     # Root package with JSON Server
```

## 🔧 How CRUD Operations Work

### CREATE (POST)
When you click "Add to Library" on a search result:
```javascript
POST http://localhost:5000/books
Body: { title, authors, thumbnail, description, status, favourite, notes }
```

### READ (GET)
Loading your library:
```javascript
GET http://localhost:5000/books
```

### UPDATE (PATCH)
Editing book details (status, favourite, notes):
```javascript
PATCH http://localhost:5000/books/:id
Body: { status: "reading", favourite: true, notes: "Great book!" }
```

### DELETE
Removing a book from library:
```javascript
DELETE http://localhost:5000/books/:id
```

## 📝 db.json Structure

```json
{
  "books": [
    {
      "id": "1",
      "googleId": "unique-google-id",
      "title": "Book Title",
      "authors": ["Author Name"],
      "thumbnail": "image-url",
      "description": "Book description",
      "status": "to-read",
      "favourite": false,
      "notes": "",
      "addedAt": "2025-11-30T10:00:00.000Z"
    }
  ]
}
```

## 🎨 Features Breakdown

### Search Page
- Search books using Google Books API
- Display results with title, author, thumbnail, description
- "Add to Library" button (disabled if already in library)

### Library Page
- View all saved books
- Edit mode for each book:
  - Change status (to-read, reading, finished)
  - Toggle favourite
  - Add/edit notes
- Delete books with confirmation

## 🔑 Optional: Google Books API Key

The app works without an API key, but you can add one for higher rate limits:

1. Get a key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Add to `frontend/.env`:
```
VITE_GOOGLE_BOOKS_API_KEY=your_api_key_here
```

## 🎓 Learning Points

This project demonstrates:
- React hooks (useState, useEffect)
- React Router for navigation
- Axios for HTTP requests
- REST API integration (Google Books)
- Full CRUD operations with JSON Server
- Component composition and props
- Form handling and state management
- Conditional rendering

## 📌 Notes

- JSON Server automatically saves changes to `db.json`
- The app uses port 5000 for backend and 5173 for frontend
- All library data persists in `db.json`
- No authentication required (simple student project)
