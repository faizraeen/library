const Book = require('../models/Book');
const BorrowRecord = require('../models/BorrowRecord');

// @desc    Get all books with search, filter, sort & pagination
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res) => {
  try {
    const {
      search,
      category,
      availability,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // 1. Search filter
    if (search && search.trim() !== '') {
      const cleanSearch = search.trim();
      const regex = new RegExp(cleanSearch, 'i');

      const numericSearch = Number(cleanSearch);
      const orConditions = [
        { title: regex },
        { author: regex },
        { isbn: regex },
        { publisher: regex },
        { customId: regex },
      ];

      if (!isNaN(numericSearch)) {
        orConditions.push({ bookId: numericSearch });
      }

      query.$or = orConditions;
    }

    // 2. Category filter
    if (category && category !== 'All Categories' && category !== 'all') {
      query.category = category;
    }

    // 3. Availability filter
    if (availability === 'available') {
      query.availableCopies = { $gt: 0 };
    } else if (availability === 'borrowed') {
      query.availableCopies = 0;
    }

    // Sort order
    const sortField = {};
    const sortDirection = order === 'asc' ? 1 : -1;

    if (sortBy === 'title') {
      sortField.title = sortDirection;
    } else if (sortBy === 'author') {
      sortField.author = sortDirection;
    } else if (sortBy === 'publicationYear') {
      sortField.publicationYear = sortDirection;
    } else if (sortBy === 'bookId') {
      sortField.bookId = sortDirection;
    } else {
      sortField.createdAt = sortDirection;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortField)
      .skip(skip)
      .limit(limitNum);

    // Get list of categories for filter dropdown
    const categories = await Book.distinct('category');

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum,
      categories: categories.sort(),
      data: books,
    });
  } catch (err) {
    console.error('getBooks error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve books from database',
      error: err.message,
    });
  }
};

// @desc    Get single book details
// @route   GET /api/books/:id
// @access  Public
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    let book;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      book = await Book.findById(id);
    } else if (!isNaN(Number(id))) {
      book = await Book.findOne({ bookId: Number(id) });
    } else {
      book = await Book.findOne({ customId: id.toUpperCase() });
    }

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found in library catalogue',
      });
    }

    // Retrieve active borrow count or records
    const recentBorrows = await BorrowRecord.find({ book: book._id })
      .populate('user', 'name email studentId')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: book,
      recentBorrows,
    });
  } catch (err) {
    console.error('getBookById error:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching book details',
    });
  }
};

// @desc    Add new book
// @route   POST /api/books
// @access  Private (Admin)
exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      publisher,
      publicationYear,
      category,
      description,
      coverImage,
      totalCopies = 3,
    } = req.body;

    if (!title || !author || !isbn || !publisher || !publicationYear || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, Author, ISBN, Publisher, Publication Year, and Category are required',
      });
    }

    const existingIsbn = await Book.findOne({ isbn: isbn.trim() });
    if (existingIsbn) {
      return res.status(400).json({
        success: false,
        message: `A book with ISBN ${isbn} already exists in the catalogue`,
      });
    }

    // Auto-generate numeric bookId
    const highestBook = await Book.findOne().sort({ bookId: -1 });
    const nextBookId = highestBook && highestBook.bookId ? highestBook.bookId + 1 : 1001;

    const copies = parseInt(totalCopies, 10) || 3;

    const book = await Book.create({
      bookId: nextBookId,
      customId: `LIB-${String(nextBookId).padStart(4, '0')}`,
      isbn: isbn.trim(),
      title: title.trim(),
      author: author.trim(),
      publisher: publisher.trim(),
      publicationYear: parseInt(publicationYear, 10),
      category: category.trim(),
      description: description || 'No description provided.',
      coverImage: coverImage ? coverImage.trim() : '',
      totalCopies: copies,
      availableCopies: copies,
      borrowedCopies: 0,
      status: 'available',
      onChainRegistered: true,
    });

    res.status(201).json({
      success: true,
      message: 'Book successfully registered to library catalogue',
      data: book,
    });
  } catch (err) {
    console.error('createBook error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Error creating book record',
    });
  }
};

// @desc    Update book details
// @route   PUT /api/books/:id
// @access  Private (Admin)
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    let book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    const {
      title,
      author,
      publisher,
      publicationYear,
      category,
      description,
      coverImage,
      totalCopies,
    } = req.body;

    if (title) book.title = title.trim();
    if (author) book.author = author.trim();
    if (publisher) book.publisher = publisher.trim();
    if (publicationYear) book.publicationYear = parseInt(publicationYear, 10);
    if (category) book.category = category.trim();
    if (description) book.description = description;
    if (coverImage !== undefined) book.coverImage = coverImage;

    if (totalCopies !== undefined) {
      const newTotal = parseInt(totalCopies, 10);
      if (newTotal < book.borrowedCopies) {
        return res.status(400).json({
          success: false,
          message: `Cannot decrease total copies below currently borrowed count (${book.borrowedCopies})`,
        });
      }
      book.totalCopies = newTotal;
      book.availableCopies = newTotal - book.borrowedCopies;
      book.status = book.availableCopies > 0 ? 'available' : 'borrowed';
    }

    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book details updated successfully',
      data: book,
    });
  } catch (err) {
    console.error('updateBook error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Error updating book',
    });
  }
};

// @desc    Delete book from catalogue
// @route   DELETE /api/books/:id
// @access  Private (Admin)
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    // Verify if there are active loans
    const activeBorrows = await BorrowRecord.countDocuments({
      book: book._id,
      status: { $in: ['borrowed', 'overdue'] },
    });

    if (activeBorrows > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot remove book: ${activeBorrows} active loan(s) pending return.`,
      });
    }

    await Book.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Book successfully removed from active catalogue',
    });
  } catch (err) {
    console.error('deleteBook error:', err);
    res.status(500).json({
      success: false,
      message: 'Error removing book',
    });
  }
};
