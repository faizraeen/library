const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema(
  {
    borrowId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
      index: true,
    },
    bookId: {
      type: Number,
      required: true,
      index: true,
    },
    walletAddress: {
      type: String,
      trim: true,
      index: true,
    },
    borrowedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['borrowed', 'returned', 'overdue'],
      default: 'borrowed',
      index: true,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    transactionHash: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    returnTransactionHash: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual or method to check if overdue
borrowRecordSchema.methods.checkOverdue = function () {
  if (this.status === 'borrowed' && new Date() > this.dueDate) {
    this.status = 'overdue';
    return true;
  }
  return false;
};

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
