import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import BookCover from '../../components/BookCover';
import Badge from '../../components/Badge';
import AddEditBookModal from '../../components/AddEditBookModal';
import BookDetailModal from '../../components/BookDetailModal';
import {
  Search,
  PlusCircle,
  Edit,
  Trash2,
  Filter,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  X,
  AlertCircle,
} from 'lucide-react';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [availability, setAvailability] = useState('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [viewingBook, setViewingBook] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.getBooks({
        search,
        category: category === 'all' ? '' : category,
        availability: availability === 'all' ? '' : availability,
        page,
        limit: 15,
        sortBy: 'bookId',
        order: 'desc',
      });

      if (res.success) {
        setBooks(res.data);
        setPages(res.pages);
        setTotal(res.total);
        if (res.categories) setCategories(res.categories);
      }
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [category, availability, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  const handleDeleteBook = async (book) => {
    if (!window.confirm(`Are you sure you want to remove "${book.title}" from the catalogue?`)) {
      return;
    }

    setDeleteError('');
    setDeletingId(book._id);

    try {
      await api.deleteBook(book._id);
      fetchBooks();
    } catch (err) {
      setDeleteError(err.message || 'Cannot remove book: check if active loans exist.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Book Inventory Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Add new academic titles, edit catalogue metadata, and audit circulation copies.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-auto px-4 py-2 rounded-lg bg-forest-900 text-white font-semibold text-xs hover:bg-forest-950 flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Book</span>
        </button>
      </div>

      {deleteError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{deleteError}</span>
          </div>
          <button onClick={() => setDeleteError('')} className="p-1 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200/90 p-4 shadow-subtle flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Title, Author, ISBN, or Book ID..."
            className="w-full pl-10 pr-20 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-800 text-xs bg-gray-50/50"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md bg-forest-900 text-white text-xs font-semibold hover:bg-forest-950"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-2 rounded-lg border border-gray-200 bg-white font-medium text-gray-700 text-xs focus:ring-1 focus:ring-forest-800"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={availability}
            onChange={(e) => {
              setAvailability(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-2 rounded-lg border border-gray-200 bg-white font-medium text-gray-700 text-xs focus:ring-1 focus:ring-forest-800"
          >
            <option value="all">All Inventory</option>
            <option value="available">Available Only</option>
            <option value="borrowed">Fully Loaned</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-forest-800 animate-spin" />
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-subtle">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-gray-800">No books found</h3>
          <p className="text-xs text-gray-500 mt-1">
            Try adjusting your search query or reset filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/90 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Book ID</th>
                  <th className="py-3 px-4">Title & Author</th>
                  <th className="py-3 px-4">ISBN</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Copies (Avail / Total)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {books.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Book ID */}
                    <td className="py-3 px-4 font-mono font-medium text-gray-900 whitespace-nowrap">
                      {b.customId || `LIB-${b.bookId}`}
                    </td>

                    {/* Title & Author */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900 line-clamp-1 max-w-xs">
                        {b.title}
                      </div>
                      <div className="text-gray-500 text-[11px] line-clamp-1">
                        {b.author} ({b.publicationYear})
                      </div>
                    </td>

                    {/* ISBN */}
                    <td className="py-3 px-4 font-mono text-gray-600 whitespace-nowrap">
                      {b.isbn}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                        {b.category}
                      </span>
                    </td>

                    {/* Copies */}
                    <td className="py-3 px-4 font-medium whitespace-nowrap">
                      <span className={b.availableCopies > 0 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                        {b.availableCopies}
                      </span>
                      <span className="text-gray-400"> / {b.totalCopies}</span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant={b.availableCopies > 0 ? 'available' : 'borrowed'} size="xs">
                        {b.availableCopies > 0 ? 'Available' : 'Fully Borrowed'}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingBook(b)}
                          className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingBook(b)}
                          className="p-1.5 text-gray-400 hover:text-forest-800 hover:bg-forest-50 rounded"
                          title="Edit Book Information"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(b)}
                          disabled={deletingId === b._id}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded disabled:opacity-40"
                          title="Remove Book from Catalogue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200 text-xs">
          <div className="text-gray-500">
            Page <span className="font-semibold text-gray-900">{page}</span> of{' '}
            <span className="font-semibold text-gray-900">{pages}</span> (Total {total} titles)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono font-medium bg-forest-50 text-forest-900 rounded-md">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddEditBookModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchBooks}
        />
      )}

      {editingBook && (
        <AddEditBookModal
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSuccess={fetchBooks}
        />
      )}

      {viewingBook && (
        <BookDetailModal
          book={viewingBook}
          isAdmin={true}
          onClose={() => setViewingBook(null)}
          onEdit={() => {
            setEditingBook(viewingBook);
            setViewingBook(null);
          }}
        />
      )}
    </div>
  );
};

export default BookManagement;
