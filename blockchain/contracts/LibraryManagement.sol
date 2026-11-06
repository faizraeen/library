// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title LibraryManagement
 * @dev Decentralized Library Management Smart Contract for LibraChain
 * Supports book registration, multi-copy availability tracking, borrowing, returning,
 * due date calculation (14-day loan period), overdue detection, and audit trail.
 */
contract LibraryManagement {
    // 14-day loan period in seconds (14 * 24 * 60 * 60)
    uint256 public constant LOAN_DURATION = 14 days;

    address public librarian; // Contract administrator / head librarian

    struct Book {
        uint256 bookId;
        string isbn;
        string title;
        uint256 totalCopies;
        uint256 availableCopies;
        bool exists;
        bool isActive;
        uint256 addedAt;
    }

    struct BorrowRecord {
        uint256 bookId;
        address student;
        uint256 borrowedAt;
        uint256 dueDate;
        uint256 returnedAt;
        bool isReturned;
        bool isLate;
    }

    // Mapping: bookId => Book struct
    mapping(uint256 => Book) public books;

    // Mapping: bookId => array of BorrowRecords
    mapping(uint256 => BorrowRecord[]) private bookBorrowHistory;

    // Mapping: student address => array of BorrowRecords
    mapping(address => BorrowRecord[]) private studentBorrowHistory;

    // Mapping: bookId => mapping(student address => has active borrow)
    mapping(uint256 => mapping(address => bool)) public hasActiveBorrow;

    // Mapping: bookId => mapping(student address => active borrow record index in student history)
    mapping(uint256 => mapping(address => uint256)) private activeStudentHistoryIndex;

    // Mapping: bookId => mapping(student address => active borrow record index in book history)
    mapping(uint256 => mapping(address => uint256)) private activeBookHistoryIndex;

    // All registered book IDs
    uint256[] public allBookIds;

    // Events
    event BookAdded(
        uint256 indexed bookId,
        string isbn,
        string title,
        uint256 totalCopies,
        uint256 timestamp
    );

    event BookRemoved(
        uint256 indexed bookId,
        uint256 timestamp
    );

    event BookBorrowed(
        uint256 indexed bookId,
        address indexed student,
        uint256 borrowedAt,
        uint256 dueDate
    );

    event BookReturned(
        uint256 indexed bookId,
        address indexed student,
        uint256 returnedAt,
        bool isLate
    );

    event LibrarianTransferred(
        address indexed previousLibrarian,
        address indexed newLibrarian
    );

    modifier onlyLibrarian() {
        require(msg.sender == librarian, "LibraChain: Caller is not the librarian");
        _;
    }

    constructor() {
        librarian = msg.sender;
    }

    /**
     * @dev Transfer librarian role to another address
     */
    function transferLibrarianship(address newLibrarian) external onlyLibrarian {
        require(newLibrarian != address(0), "LibraChain: Invalid address");
        address prev = librarian;
        librarian = newLibrarian;
        emit LibrarianTransferred(prev, newLibrarian);
    }

    /**
     * @dev Add a new book to the library catalogue
     */
    function addBook(
        uint256 _bookId,
        string memory _isbn,
        string memory _title,
        uint256 _copies
    ) external onlyLibrarian {
        require(_bookId > 0, "LibraChain: Book ID must be greater than zero");
        require(bytes(_isbn).length > 0, "LibraChain: ISBN cannot be empty");
        require(bytes(_title).length > 0, "LibraChain: Title cannot be empty");
        require(_copies > 0, "LibraChain: Copies must be at least 1");

        if (books[_bookId].exists) {
            // If already exists, must have been deactivated
            require(!books[_bookId].isActive, "LibraChain: Book already active in catalogue");
            books[_bookId].isActive = true;
            books[_bookId].totalCopies = _copies;
            books[_bookId].availableCopies = _copies;
            books[_bookId].title = _title;
            books[_bookId].isbn = _isbn;
        } else {
            books[_bookId] = Book({
                bookId: _bookId,
                isbn: _isbn,
                title: _title,
                totalCopies: _copies,
                availableCopies: _copies,
                exists: true,
                isActive: true,
                addedAt: block.timestamp
            });
            allBookIds.push(_bookId);
        }

        emit BookAdded(_bookId, _isbn, _title, _copies, block.timestamp);
    }

    /**
     * @dev Deactivate / remove a book from the active catalogue
     */
    function removeBook(uint256 _bookId) external onlyLibrarian {
        require(books[_bookId].exists, "LibraChain: Book does not exist");
        require(books[_bookId].isActive, "LibraChain: Book is already inactive");

        books[_bookId].isActive = false;

        emit BookRemoved(_bookId, block.timestamp);
    }

    /**
     * @dev Borrow a book
     */
    function borrowBook(uint256 _bookId) external {
        require(books[_bookId].exists, "LibraChain: Book does not exist");
        require(books[_bookId].isActive, "LibraChain: Book is not active in catalogue");
        require(books[_bookId].availableCopies > 0, "LibraChain: No available copies for this book");
        require(!hasActiveBorrow[_bookId][msg.sender], "LibraChain: You already have an active loan for this book");

        uint256 borrowTime = block.timestamp;
        uint256 dueTime = borrowTime + LOAN_DURATION;

        // Deduct available copy
        books[_bookId].availableCopies -= 1;
        hasActiveBorrow[_bookId][msg.sender] = true;

        BorrowRecord memory record = BorrowRecord({
            bookId: _bookId,
            student: msg.sender,
            borrowedAt: borrowTime,
            dueDate: dueTime,
            returnedAt: 0,
            isReturned: false,
            isLate: false
        });

        // Store index in history
        uint256 bookHistIdx = bookBorrowHistory[_bookId].length;
        bookBorrowHistory[_bookId].push(record);
        activeBookHistoryIndex[_bookId][msg.sender] = bookHistIdx;

        uint256 studentHistIdx = studentBorrowHistory[msg.sender].length;
        studentBorrowHistory[msg.sender].push(record);
        activeStudentHistoryIndex[_bookId][msg.sender] = studentHistIdx;

        emit BookBorrowed(_bookId, msg.sender, borrowTime, dueTime);
    }

    /**
     * @dev Return a borrowed book
     */
    function returnBook(uint256 _bookId) external {
        require(books[_bookId].exists, "LibraChain: Book does not exist");
        require(hasActiveBorrow[_bookId][msg.sender], "LibraChain: No active loan for this book by caller");

        uint256 returnTime = block.timestamp;
        uint256 bookHistIdx = activeBookHistoryIndex[_bookId][msg.sender];
        uint256 studentHistIdx = activeStudentHistoryIndex[_bookId][msg.sender];

        BorrowRecord storage bookRecord = bookBorrowHistory[_bookId][bookHistIdx];
        BorrowRecord storage studentRecord = studentBorrowHistory[msg.sender][studentHistIdx];

        bool late = returnTime > bookRecord.dueDate;

        // Update book history record
        bookRecord.returnedAt = returnTime;
        bookRecord.isReturned = true;
        bookRecord.isLate = late;

        // Update student history record
        studentRecord.returnedAt = returnTime;
        studentRecord.isReturned = true;
        studentRecord.isLate = late;

        // Restore availability
        books[_bookId].availableCopies += 1;
        hasActiveBorrow[_bookId][msg.sender] = false;

        emit BookReturned(_bookId, msg.sender, returnTime, late);
    }

    /**
     * @dev Get book details
     */
    function getBookDetails(uint256 _bookId)
        external
        view
        returns (
            uint256 bookId,
            string memory isbn,
            string memory title,
            uint256 totalCopies,
            uint256 availableCopies,
            bool isActive,
            uint256 addedAt
        )
    {
        require(books[_bookId].exists, "LibraChain: Book does not exist");
        Book memory b = books[_bookId];
        return (
            b.bookId,
            b.isbn,
            b.title,
            b.totalCopies,
            b.availableCopies,
            b.isActive,
            b.addedAt
        );
    }

    /**
     * @dev Get borrowing history for a specific book
     */
    function getBorrowingHistory(uint256 _bookId)
        external
        view
        returns (BorrowRecord[] memory)
    {
        require(books[_bookId].exists, "LibraChain: Book does not exist");
        return bookBorrowHistory[_bookId];
    }

    /**
     * @dev Get borrowing history for a specific student
     */
    function getStudentBorrowings(address _student)
        external
        view
        returns (BorrowRecord[] memory)
    {
        return studentBorrowHistory[_student];
    }

    /**
     * @dev Check if a student's active loan for a book is currently overdue
     */
    function isOverdue(uint256 _bookId, address _borrower)
        external
        view
        returns (bool)
    {
        if (!hasActiveBorrow[_bookId][_borrower]) {
            return false;
        }
        uint256 bookHistIdx = activeBookHistoryIndex[_bookId][_borrower];
        BorrowRecord memory record = bookBorrowHistory[_bookId][bookHistIdx];
        return block.timestamp > record.dueDate;
    }

    /**
     * @dev Get total count of registered books
     */
    function getTotalBooksCount() external view returns (uint256) {
        return allBookIds.length;
    }
}
