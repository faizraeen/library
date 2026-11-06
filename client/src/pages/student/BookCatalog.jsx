import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import BookCard from '../../components/BookCard';
import BookDetailModal from '../../components/BookDetailModal';
import BorrowModal from '../../components/BorrowModal';
import {
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from 'lucide-react';

const BookCatalog = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowingBook, setBorrowingBook] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.getBooks({
        search,
        category: category === 'all' ? '' : category,
        availability: availability === 'all' ? '' : availability,
        sortBy,
        order,
        page,
        limit: 12,
      });

      if (res.success) {
        setBooks(res.data);
        setPages(res.pages);
        setTotal(res.total);
        if (res.categories && res.categories.length > 0) {
          setCategories(res.categories);
        }
      }
    } catch (err) {
      console.error('Failed to fetch books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [category, availability, sortBy, order, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Academic Book Catalogue
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Explore 100+ vetted engineering, computer science, and academic volumes.
          </p>
        </div>

        <div className="text-xs text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200 self-start sm:self-auto font-medium">
          Showing <span className="font-bold text-forest-900">{books.length}</span> of{' '}
          <span className="font-bold text-gray-900">{total}</span> volumes
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200/90 p-4 shadow-subtle space-y-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by book title, author, ISBN (e.g. 9780132350884), or Book ID (e.g. LIB-1008)..."
            className="w-full pl-10 pr-20 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-800 text-xs sm:text-sm bg-gray-50/50"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-forest-900 text-white text-xs font-semibold hover:bg-forest-950"
          >
            Search
          </button>
        </form>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white font-medium text-gray-700 focus:ring-1 focus:ring-forest-800"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs shrink-0">Status:</span>
            <select
              value={availability}
              onChange={(e) => {
                setAvailability(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white font-medium text-gray-700 focus:ring-1 focus:ring-forest-800"
            >
              <option value="all">All Inventory</option>
              <option value="available">Available Now</option>
              <option value="borrowed">Fully Borrowed</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                setSortBy(sb);
                setOrder(ord);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white font-medium text-gray-700 focus:ring-1 focus:ring-forest-800"
            >
              <option value="createdAt-desc">Newest In Catalogue</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
              <option value="publicationYear-desc">Publication Year (Latest)</option>
              <option value="publicationYear-asc">Publication Year (Oldest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-forest-800 animate-spin" />
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">
            No matching books found
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing categories, or reset filters to view all 100+ volumes.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('all');
              setAvailability('all');
              setPage(1);
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-forest-900 text-white text-xs font-semibold hover:bg-forest-950"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {books.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onSelect={() => setSelectedBook(book)}
              onBorrow={() => setBorrowingBook(book)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200 text-xs">
          <div className="text-gray-500">
            Page <span className="font-semibold text-gray-900">{page}</span> of{' '}
            <span className="font-semibold text-gray-900">{pages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>

            <span className="px-3 py-1 font-mono font-medium bg-forest-50 text-forest-900 rounded-md">
              {page}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onBorrow={() => {
            setBorrowingBook(selectedBook);
            setSelectedBook(null);
          }}
        />
      )}

      {borrowingBook && (
        <BorrowModal
          book={borrowingBook}
          onClose={() => setBorrowingBook(null)}
          onSuccess={fetchBooks}
        />
      )}
    </div>
  );
};

export default BookCatalog;
