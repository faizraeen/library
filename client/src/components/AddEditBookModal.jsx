import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, BookPlus, Edit3, Loader2 } from 'lucide-react';

const CATEGORIES = [
  'Computer Science',
  'Programming',
  'Web Development',
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Database Management',
  'Operating Systems',
  'Networking',
  'Cyber Security',
  'Blockchain',
  'Mathematics',
  'Science',
  'Fiction',
  'Self Development',
  'Business',
];

const AddEditBookModal = ({ book, onClose, onSuccess }) => {
  const isEditing = Boolean(book);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    category: 'Computer Science',
    description: '',
    coverImage: '',
    totalCopies: 3,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        publisher: book.publisher || '',
        publicationYear: book.publicationYear || new Date().getFullYear(),
        category: book.category || 'Computer Science',
        description: book.description || '',
        coverImage: book.coverImage || '',
        totalCopies: book.totalCopies || 3,
      });
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.author || !formData.isbn) {
      setError('Title, Author, and ISBN are required.');
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        await api.updateBook(book._id, formData);
      } else {
        await api.createBook(formData);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving book:', err);
      setError(err.message || 'Failed to save book record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 shadow-elevation border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-lg bg-forest-900 text-white flex items-center justify-center">
            {isEditing ? <Edit3 className="w-4 h-4" /> : <BookPlus className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">
              {isEditing ? 'Edit Book Information' : 'Add New Book to Catalogue'}
            </h3>
            <p className="text-xs text-gray-500">
              {isEditing
                ? `Updating catalogue record for ${book.customId || `LIB-${book.bookId}`}`
                : 'Auto-generates unique Book ID and creates on-chain reference'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Book Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. Clean Code"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-800 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Author(s) *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                placeholder="e.g. Robert C. Martin"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">ISBN (Unique) *</label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                required
                disabled={isEditing}
                placeholder="e.g. 9780132350884"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-800 font-mono disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Publisher</label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                placeholder="e.g. Prentice Hall"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                name="publicationYear"
                value={formData.publicationYear}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Total Copies</label>
              <input
                type="number"
                name="totalCopies"
                min={isEditing ? (book.borrowedCopies || 1) : 1}
                value={formData.totalCopies}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-800 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Cover Image URL (Optional)</label>
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="https://...jpg (auto fallback provided)"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Synopsis / Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the book content and syllabus relevance..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-forest-900 text-white font-semibold hover:bg-forest-950 disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEditing ? 'Save Changes' : 'Create Book Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditBookModal;
