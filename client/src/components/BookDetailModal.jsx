import React from 'react';
import BookCover from './BookCover';
import Badge from './Badge';
import {
  X,
  Calendar,
  Building2,
  Barcode,
  Layers,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

const BookDetailModal = ({
  book,
  onClose,
  onBorrow,
  isAdmin,
  onEdit,
}) => {
  if (!book) return null;

  const isAvailable = book.availableCopies > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 shadow-elevation border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
          {/* Left: Cover */}
          <div className="sm:col-span-5 flex flex-col items-center">
            <BookCover
              src={book.coverImage}
              title={book.title}
              author={book.author}
              category={book.category}
              className="w-48 h-64 shadow-md rounded-xl"
            />
            <div className="mt-4 w-full text-center">
              <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                {book.customId || `LIB-${book.bookId}`}
              </span>
            </div>
          </div>

          {/* Right: Info */}
          <div className="sm:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant={isAvailable ? 'available' : 'borrowed'}>
                  {isAvailable ? 'Available for Loan' : 'Currently Out of Stock'}
                </Badge>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-forest-50 text-forest-800 border border-forest-200">
                  {book.category}
                </span>
              </div>

              <h2 className="text-xl font-bold text-gray-900 leading-snug">
                {book.title}
              </h2>
              <p className="text-sm font-medium text-gray-600 mt-1">
                by {book.author}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 my-4 py-3 border-y border-gray-100 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <Barcode className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-400 text-[10px]">ISBN</p>
                    <p className="font-mono font-medium text-gray-800">{book.isbn}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-400 text-[10px]">Publisher</p>
                    <p className="font-medium text-gray-800 line-clamp-1">{book.publisher}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-400 text-[10px]">Publication Year</p>
                    <p className="font-medium text-gray-800">{book.publicationYear}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Layers className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-400 text-[10px]">Inventory</p>
                    <p className="font-medium text-gray-800">
                      {book.availableCopies} of {book.totalCopies} copies free
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Synopsis
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed max-h-32 overflow-y-auto pr-1">
                  {book.description || 'No synopsis provided.'}
                </p>
              </div>
            </div>

            {/* Smart Contract Policy Info & CTA */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100 rounded-lg p-2.5 mb-3 text-[11px] text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>14-Day Smart Contract Loan:</strong> Recorded on Ethereum Sepolia. Late returns automatically flagged by consensus.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>

                {isAdmin ? (
                  <button
                    onClick={() => {
                      onClose();
                      if (onEdit) onEdit(book);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-forest-900 text-white hover:bg-forest-950 transition-colors"
                  >
                    Edit Book Record
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      if (onBorrow) onBorrow(book);
                    }}
                    disabled={!isAvailable}
                    className="px-5 py-2 text-xs font-semibold rounded-lg bg-forest-900 text-white hover:bg-forest-950 disabled:opacity-50 shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <span>{isAvailable ? 'Borrow with MetaMask' : 'Unavailable'}</span>
                    {isAvailable && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;
