const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    bookId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    customId: {
      type: String,
      unique: true,
      index: true,
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    publisher: {
      type: String,
      required: true,
      trim: true,
    },
    publicationYear: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    totalCopies: {
      type: Number,
      required: true,
      min: [1, 'Total copies must be at least 1'],
      default: 3,
    },
    availableCopies: {
      type: Number,
      required: true,
      min: 0,
      default: 3,
    },
    borrowedCopies: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['available', 'borrowed', 'maintenance'],
      default: 'available',
    },
    onChainRegistered: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Full text search indexes for title, author, isbn, category, description
bookSchema.index({
  title: 'text',
  author: 'text',
  isbn: 'text',
  category: 'text',
  description: 'text',
});

// Middleware to keep status and copies consistent
bookSchema.pre('save', function (next) {
  if (this.availableCopies === undefined) {
    this.availableCopies = this.totalCopies - (this.borrowedCopies || 0);
  }
  if (this.availableCopies <= 0) {
    this.status = 'borrowed';
  } else {
    this.status = 'available';
  }
  if (!this.customId) {
    this.customId = `LIB-${String(this.bookId).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
