const Book = require('../models/Book');
const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');
const BlockchainTransaction = require('../models/BlockchainTransaction');

// @desc    Get Admin Dashboard Stats & Analytics
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
exports.getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();

    // 1. Core KPIs
    const totalBooks = await Book.countDocuments();
    const booksAgg = await Book.aggregate([
      {
        $group: {
          _id: null,
          totalCopies: { $sum: '$totalCopies' },
          availableCopies: { $sum: '$availableCopies' },
          borrowedCopies: { $sum: '$borrowedCopies' },
        },
      },
    ]);

    const totalCopies = booksAgg[0]?.totalCopies || 0;
    const availableBooks = booksAgg[0]?.availableCopies || 0;
    const borrowedBooks = booksAgg[0]?.borrowedCopies || 0;

    const totalStudents = await User.countDocuments({ role: 'student' });

    // Ensure overdue status is refreshed
    await BorrowRecord.updateMany(
      { status: 'borrowed', dueDate: { $lt: now } },
      { $set: { status: 'overdue' } }
    );

    const overdueBooks = await BorrowRecord.countDocuments({
      status: 'overdue',
    });

    const totalTransactions = await BlockchainTransaction.countDocuments();

    // 2. Books by Category
    const categoryStats = await Book.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalCopies: { $sum: '$totalCopies' },
          borrowedCopies: { $sum: '$borrowedCopies' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const booksByCategory = categoryStats.map((item) => ({
      category: item._id,
      books: item.count,
      copies: item.totalCopies,
      borrowed: item.borrowedCopies,
    }));

    // 3. Monthly Borrowing Statistics (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyStatsAgg = await BorrowRecord.aggregate([
      {
        $match: {
          borrowedAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$borrowedAt' },
            month: { $month: '$borrowedAt' },
          },
          borrows: { $sum: 1 },
          returns: {
            $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] },
          },
          late: {
            $sum: { $cond: ['$isLate', 1, 0] },
          },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const monthlyBorrowing = monthlyStatsAgg.map((item) => {
      const monthLabel = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      return {
        month: monthLabel,
        borrows: item.borrows,
        returns: item.returns,
        late: item.late,
      };
    });

    // 4. Most Borrowed Books
    const mostBorrowedAgg = await BorrowRecord.aggregate([
      {
        $group: {
          _id: '$book',
          borrowCount: { $sum: 1 },
        },
      },
      { $sort: { borrowCount: -1 } },
      { $limit: 6 },
    ]);

    const populatedMostBorrowed = await Book.populate(mostBorrowedAgg, {
      path: '_id',
      select: 'title author category coverImage customId isbn availableCopies',
    });

    const mostBorrowedBooks = populatedMostBorrowed
      .filter((item) => item._id)
      .map((item) => ({
        bookId: item._id._id,
        customId: item._id.customId,
        title: item._id.title,
        author: item._id.author,
        category: item._id.category,
        coverImage: item._id.coverImage,
        availableCopies: item._id.availableCopies,
        borrowCount: item.borrowCount,
      }));

    // 5. Available vs Borrowed Copies
    const inventoryDistribution = [
      { name: 'Available Copies', value: availableBooks, color: '#16A34A' },
      { name: 'Currently Borrowed', value: borrowedBooks, color: '#F59E0B' },
    ];

    // 6. Recent Blockchain Transactions
    const recentTransactions = await BlockchainTransaction.find()
      .sort({ timestamp: -1 })
      .limit(10);

    // 7. Recent Borrow Records with Student and Book details
    const recentBorrowRecords = await BorrowRecord.find()
      .populate('user', 'name email studentId')
      .populate('book', 'title author coverImage customId')
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      kpis: {
        totalBooks,
        totalCopies,
        availableBooks,
        borrowedBooks,
        totalStudents,
        overdueBooks,
        totalTransactions,
      },
      analytics: {
        booksByCategory,
        monthlyBorrowing,
        mostBorrowedBooks,
        inventoryDistribution,
        overdueCount: overdueBooks,
      },
      recentTransactions,
      recentBorrowRecords,
    });
  } catch (err) {
    console.error('getAdminDashboard error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to compute admin dashboard metrics',
      error: err.message,
    });
  }
};

// @desc    Get Student Dashboard Stats & Recommended Books
// @route   GET /api/dashboard/student
// @access  Private (Student)
exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Check student overdue records
    await BorrowRecord.updateMany(
      { user: userId, status: 'borrowed', dueDate: { $lt: now } },
      { $set: { status: 'overdue' } }
    );

    // 1. Total available books in library
    const totalAvailableBooks = await Book.countDocuments({
      availableCopies: { $gt: 0 },
    });

    // 2. Currently borrowed by this student
    const currentlyBorrowed = await BorrowRecord.countDocuments({
      user: userId,
      status: { $in: ['borrowed', 'overdue'] },
    });

    // 3. Overdue books by this student
    const overdueCount = await BorrowRecord.countDocuments({
      user: userId,
      status: 'overdue',
    });

    // 4. Total borrowing history count
    const totalHistory = await BorrowRecord.countDocuments({
      user: userId,
    });

    // 5. Active loans list
    const activeLoans = await BorrowRecord.find({
      user: userId,
      status: { $in: ['borrowed', 'overdue'] },
    })
      .populate('book')
      .sort({ dueDate: 1 });

    // 6. Recommended books (top rated / popular books student hasn't borrowed yet)
    const borrowedBookIds = await BorrowRecord.find({ user: userId }).distinct('book');

    const recommendedBooks = await Book.find({
      _id: { $nin: borrowedBookIds },
      availableCopies: { $gt: 0 },
    })
      .sort({ publicationYear: -1, availableCopies: -1 })
      .limit(6);

    // 7. Recent library additions
    const recentAdditions = await Book.find({ availableCopies: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      kpis: {
        totalAvailableBooks,
        currentlyBorrowed,
        overdueCount,
        totalHistory,
      },
      activeLoans,
      recommendedBooks,
      recentAdditions,
    });
  } catch (err) {
    console.error('getStudentDashboard error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to compute student dashboard metrics',
      error: err.message,
    });
  }
};

// @desc    Get All Registered Students (Admin)
// @route   GET /api/dashboard/students
// @access  Private (Admin)
exports.getRegisteredStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    const now = new Date();

    // Augment with active loans and overdue count for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const activeLoansCount = await BorrowRecord.countDocuments({
          user: student._id,
          status: { $in: ['borrowed', 'overdue'] },
        });

        const overdueCount = await BorrowRecord.countDocuments({
          user: student._id,
          status: 'overdue',
        });

        const totalLoansCount = await BorrowRecord.countDocuments({
          user: student._id,
        });

        return {
          ...student.toObject(),
          activeLoansCount,
          overdueCount,
          totalLoansCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: studentsWithStats.length,
      data: studentsWithStats,
    });
  } catch (err) {
    console.error('getRegisteredStudents error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve students list',
    });
  }
};
