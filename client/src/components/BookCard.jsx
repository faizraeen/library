import React from 'react';
import BookCover from './BookCover';
import Badge from './Badge';
import { BookOpen, Layers, CheckCircle, ArrowRight } from 'lucide-react';

const BookCard = ({ book, onSelect, onBorrow, onEdit, isAdmin }) => {
  const isAvailable = book.availableCopies > 0;

  return (
    <div
      onClick={() => onSelect && onSelect(book)}
      className="bg-white rounded-xl border border-gray-200/90 hover:border-forest-300 p-4 shadow-subtle hover:shadow-card transition-all duration-200 cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Book Cover */}
        <div className="relative mb-3 overflow-hidden rounded-lg">
          <BookCover
            src={book.coverImage}
            title={book.title}
            author={book.author}
            category={book.category}
            className="w-full h-48 sm:h-52"
          />

          {/* Availability Floating Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant={isAvailable ? 'available' : 'borrowed'} size="xs">
              {isAvailable ? `${book.availableCopies} Available` : 'All Borrowed'}
            </Badge>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
          <span className="font-mono text-gray-400">
            {book.customId || `LIB-${book.bookId}`}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
            {book.category}
          </span>
        </div>

        <h3 className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2 group-hover:text-forest-900 transition-colors">
          {book.title}
        </h3>

        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
          {book.author}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="text-[11px] text-gray-500">
          <span>Year: </span>
          <span className="font-medium text-gray-700">{book.publicationYear}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {isAdmin ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit(book);
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 hover:bg-forest-50 hover:text-forest-800 text-gray-700 transition-colors"
            >
              Edit
            </button>
          ) : (
            isAvailable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onBorrow) onBorrow(book);
                }}
                className="px-3 py-1 text-xs font-semibold rounded-md bg-forest-900 hover:bg-forest-950 text-white shadow-2xs flex items-center gap-1 transition-all"
              >
                <span>Borrow</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
