const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const User = require('../models/User');
const BlockchainTransaction = require('../models/BlockchainTransaction');

// 14-day borrowing duration in milliseconds
const LOAN_PERIOD_MS = 14 * 24 * 60 * 60 * 1000;

// @desc    Record a book borrowing after blockchain transaction confirmation
// @route   POST /api/borrow
// @access  Private (Student)
exports.borrowBook = async (req, res) => {
  try {
    const { bookId, transactionHash, walletAddress } = req.body;
    const userId = req.user._id;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required',
      });
    }

    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        message: 'Blockchain transaction hash is required to confirm loan',
      });
    }

    // 1. Locate book in MongoDB
    let book = null;
    if (typeof bookId === 'number' || !isNaN(Number(bookId))) {
      book = await Book.findOne({ bookId: Number(bookId) });
    }
    if (!book && String(bookId).match(/^[0-9a-fA-F]{24}$/)) {
      book = await Book.findById(bookId);
    }
    if (!book) {
      book = await Book.findOne({ customId: String(bookId).toUpperCase() });
    }

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found in database',
      });
    }

    // 2. Validate availability
    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No available copies left for this book',
      });
    }

    // 3. Prevent duplicate active borrowing by the same student
    const activeBorrow = await BorrowRecord.findOne({
      user: userId,
      book: book._id,
      status: { $in: ['borrowed', 'overdue'] },
    });

    if (activeBorrow) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active loan for this book. Please return it before borrowing again.',
      });
    }

    // Check for duplicate transaction hash
    const existingTx = await BlockchainTransaction.findOne({ transactionHash });
    if (existingTx) {
      return res.status(400).json({
        success: false,
        message: 'This blockchain transaction has already been registered in the system',
      });
    }

    const borrowedAt = new Date();
    const dueDate = new Date(borrowedAt.getTime() + LOAN_PERIOD_MS);
    const borrowId = `BOR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const userWallet = walletAddress || req.user.walletAddress || '0x0000000000000000000000000000000000000000';

    // 4. Create Borrow Record
    const record = await BorrowRecord.create({
      borrowId,
      user: userId,
      book: book._id,
      bookId: book.bookId,
      walletAddress: userWallet,
      borrowedAt,
      dueDate,
      status: 'borrowed',
      isLate: false,
      transactionHash,
    });

    // 5. Update book copies & availability
    book.availableCopies -= 1;
    book.borrowedCopies += 1;
    if (book.availableCopies <= 0) {
      book.status = 'borrowed';
    }
    await book.save();

    // 6. Record Blockchain Transaction log
    await BlockchainTransaction.create({
      transactionHash,
      walletAddress: userWallet,
      bookId: book.bookId,
      action: 'borrow',
      transactionStatus: 'confirmed',
      timestamp: borrowedAt,
    });

    // Update user's wallet address if empty
    if (walletAddress && !req.user.walletAddress) {
      await User.findByIdAndUpdate(userId, { walletAddress: walletAddress.trim() });
    }

    const populatedRecord = await BorrowRecord.findById(record._id)
      .populate('book')
      .populate('user', 'name email studentId');

    res.status(201).json({
      success: true,
      message: 'Book borrowed successfully and on-chain record validated!',
      data: populatedRecord,
    });
  } catch (err) {
    console.error('Borrow error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Error processing book borrowing',
    });
  }
};

// @desc    Record a book return after blockchain transaction confirmation
// @route   POST /api/return
// @access  Private
exports.returnBook = async (req, res) => {
  try {
    const { borrowId, bookId, transactionHash, walletAddress } = req.body;
    const userId = req.user._id;

    if (!borrowId && !bookId) {
      return res.status(400).json({
        success: false,
        message: 'Borrow ID or Book ID is required',
      });
    }

    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        message: 'Blockchain return transaction hash is required',
      });
    }

    // Query for active borrow record
    const query = { status: { $in: ['borrowed', 'overdue'] } };
    if (borrowId) {
      query.$or = [{ borrowId }, { _id: borrowId.match(/^[0-9a-fA-F]{24}$/) ? borrowId : null }];
    } else {
      query.bookId = Number(bookId);
    }

    // Unless admin, verify borrower is current user
    if (req.user.role !== 'admin') {
      query.user = userId;
    }

    const record = await BorrowRecord.findOne(query).populate('book');
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'No active loan found for this book and student',
      });
    }

    const returnedAt = new Date();
    const isLate = returnedAt > new Date(record.dueDate);

    // Update record
    record.returnedAt = returnedAt;
    record.status = 'returned';
    record.isLate = isLate;
    record.returnTransactionHash = transactionHash;
    await record.save();

    // Update Book copies
    const book = await Book.findById(record.book._id);
    if (book) {
      book.borrowedCopies = Math.max(0, book.borrowedCopies - 1);
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      book.status = book.availableCopies > 0 ? 'available' : 'borrowed';
      await book.save();
    }

    const userWallet = walletAddress || record.walletAddress || req.user.walletAddress || '0x0000000000000000000000000000000000000000';

    // Log Blockchain Transaction
    await BlockchainTransaction.create({
      transactionHash,
      walletAddress: userWallet,
      bookId: record.bookId,
      action: 'return',
      transactionStatus: 'confirmed',
      timestamp: returnedAt,
    });

    res.status(200).json({
      success: true,
      message: isLate
        ? 'Book returned successfully (Note: Return was completed past the 14-day due date).'
        : 'Book returned on time! On-chain confirmation saved.',
      data: record,
      isLate,
    });
  } catch (err) {
    console.error('Return error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Error processing book return',
    });
  }
};

// @desc    Get currently borrowed books for current user
// @route   GET /api/borrow/my-books
// @access  Private
exports.getMyBorrowedBooks = async (req, res) => {
  try {
    const records = await BorrowRecord.find({
      user: req.user._id,
      status: { $in: ['borrowed', 'overdue'] },
    })
      .populate('book')
      .sort({ borrowedAt: -1 });

    // Update any overdue records dynamically
    const now = new Date();
    for (const rec of records) {
      if (rec.status === 'borrowed' && now > rec.dueDate) {
        rec.status = 'overdue';
        await rec.save();
      }
    }

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (err) {
    console.error('getMyBorrowedBooks error:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching borrowed books',
    });
  }
};

// @desc    Get full borrowing history for current user
// @route   GET /api/borrow/history
// @access  Private
exports.getMyBorrowHistory = async (req, res) => {
  try {
    const records = await BorrowRecord.find({
      user: req.user._id,
    })
      .populate('book')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (err) {
    console.error('getMyBorrowHistory error:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching borrowing history',
    });
  }
};

// @desc    Get all borrowing records (Admin) with filtering
// @route   GET /api/borrow/all
// @access  Private (Admin)
exports.getAllBorrowRecords = async (req, res) => {
  try {
    const { status, studentId, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      if (status === 'late') {
        query.isLate = true;
      } else {
        query.status = status;
      }
    }

    if (studentId) {
      const user = await User.findOne({ studentId });
      if (user) {
        query.user = user._id;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Check overdue on active records
    const now = new Date();
    await BorrowRecord.updateMany(
      { status: 'borrowed', dueDate: { $lt: now } },
      { $set: { status: 'overdue' } }
    );

    const total = await BorrowRecord.countDocuments(query);
    const records = await BorrowRecord.find(query)
      .populate('user', 'name email studentId walletAddress')
      .populate('book', 'title author isbn coverImage customId bookId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      count: records.length,
      data: records,
    });
  } catch (err) {
    console.error('getAllBorrowRecords error:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching all borrow records',
    });
  }
};
