const express = require('express');
const router = express.Router();
const {
  borrowBook,
  returnBook,
  getMyBorrowedBooks,
  getMyBorrowHistory,
  getAllBorrowRecords,
} = require('../controllers/borrowController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, borrowBook);
router.post('/return', protect, returnBook);
router.get('/my-books', protect, getMyBorrowedBooks);
router.get('/history', protect, getMyBorrowHistory);
router.get('/all', protect, authorize('admin'), getAllBorrowRecords);

module.exports = router;
