const mongoose = require('mongoose');

const blockchainTransactionSchema = new mongoose.Schema(
  {
    transactionHash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    walletAddress: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    bookId: {
      type: Number,
      index: true,
    },
    action: {
      type: String,
      enum: ['borrow', 'return', 'add_book', 'remove_book'],
      required: true,
      index: true,
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    transactionStatus: {
      type: String,
      enum: ['confirmed', 'pending', 'failed'],
      default: 'confirmed',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BlockchainTransaction', blockchainTransactionSchema);
