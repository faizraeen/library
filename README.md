# LibraChain – Decentralized Library Management System

[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![Ethereum](https://img.shields.io/badge/Network-Sepolia%20Testnet%20(11155111)-3C3C3D?logo=ethereum)](https://sepolia.etherscan.io/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/UI-Tailwind%20CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

**LibraChain** is a college-level, production-quality decentralized library management platform. It unites standard academic catalogue operations with the Ethereum Sepolia blockchain and MetaMask to provide transparent, tamper-resistant physical book borrowing, 14-day loan lifecycle tracking, and automatic late return detection.

---

## 1. System Architecture

```
                  ┌────────────────────────────────────────┐
                  │       LIBRACHAIN CLIENT (REACT)        │
                  │   Tailwind CSS • Recharts • Ethers v6   │
                  └──────────────┬──────────────────┬──────┘
                                 │                  │
                REST API (JWT)   │                  │ MetaMask Signer
                                 ▼                  ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│       EXPRESS BACKEND (PORT 5000)    │  │       ETHEREUM SEPOLIA TESTNET       │
│  - REST Endpoints                    │  │  - LibraryManagement.sol             │
│  - JWT & Role Middleware             │  │  - Immutable Timestamping            │
│  - Inventory State Engine            │  │  - 14-Day Loan Enforcement           │
└──────────────────┬───────────────────┘  │  - Late Return Classification        │
                   │                      └──────────────────┬───────────────────┘
                   ▼                                         │
┌──────────────────────────────────────┐                     │
│         MONGODB DATABASE             │                     │
│  - Users (Admin & Students)          │                     │
│  - Books (108 Real Books)            │                     │
│  - BorrowRecords (Timestamps, Due)   │                     │
│  - BlockchainTransactions (Audit)    │◄────────────────────┘
└──────────────────────────────────────┘     Tx Hash Reconciliation
```

---

## 2. Core Features

### A. Admin / Librarian Portal
- **Dashboard Overview**: Total Books (108), Available Copies, Borrowed Copies, Registered Students, Overdue Loans, and Total On-Chain Transactions.
- **Book Management**: Add new volumes, update metadata, manage total copies, remove titles from active circulation (with active loan safety check), auto-assigned unique Book IDs (`LIB-1001` to `LIB-1108`).
- **Student Management**: Student directory with university IDs, registered MetaMask wallets, active loan counts, and overdue indicators.
- **Circulation Records**: Complete audit trail showing borrow timestamps, 14-day deadlines, return timestamps, late badges, and direct links to Sepolia Etherscan.
- **Analytics & Visualizations**: Interactive Recharts graphs showing catalogue distribution across 16 disciplines, monthly circulation velocity, and inventory availability ratios.

### B. Student Portal
- **Dashboard Overview**: Active loans count, books available, overdue warning banners with deadline alerts, and personalized curriculum book recommendations.
- **Academic Book Catalogue**: Live search by title, author, ISBN, or Book ID; filtering by 16 academic categories; availability toggle; sorting by title or publication year; and pagination.
- **Book Details & On-Chain Borrowing**: Detailed book modal showing synopsis, publisher, and copies with one-click MetaMask Sepolia loan execution.
- **My Books**: Active physical book loans with remaining days countdown, overdue warnings, and one-click return with MetaMask.
- **Borrow History & Ledger**: Complete borrowing history with dual blockchain transaction verification links (Borrow Tx + Return Tx) on Sepolia Etherscan.
- **Student Profile**: Academic profile, Student ID, linked Ethereum wallet address with clipboard copy, and loan standing stats.

---

## 3. Real 100+ Book Database (16 Categories)

The system automatically seeds **108 real, well-known academic volumes** across 16 categories:
1. **Computer Science**: *Introduction to Algorithms (CLRS)*, *Structure and Interpretation of Computer Programs (SICP)*, *The C Programming Language*, *Algorithms (4th Ed)*, *The Art of Computer Programming*, *Effective Java*, *Code*.
2. **Programming**: *Clean Code*, *The Pragmatic Programmer*, *Design Patterns (GoF)*, *Refactoring*, *Test Driven Development*, *Clean Architecture*, *Head First Design Patterns*.
3. **Web Development**: *Eloquent JavaScript*, *You Don't Know JS*, *Learning React*, *JavaScript: The Definitive Guide*, *CSS: The Definitive Guide*, *Programming JavaScript Applications*.
4. **Artificial Intelligence**: *Artificial Intelligence: A Modern Approach*, *Deep Learning*, *Reinforcement Learning: An Introduction*, *Superintelligence*, *Speech and Language Processing*, *The Master Algorithm*, *Life 3.0*.
5. **Machine Learning**: *Hands-On Machine Learning*, *Pattern Recognition and Machine Learning*, *Python for Data Analysis*, *Deep Learning with Python*, *Machine Learning: A Probabilistic Perspective*.
6. **Data Science**: *Data Science from Scratch*, *Doing Data Science*, *R for Data Science*, *Storytelling with Data*, *Practical Statistics for Data Scientists*.
7. **Database Management**: *Database System Concepts*, *Designing Data-Intensive Applications (DDIA)*, *Fundamentals of Database Systems*, *MongoDB: The Definitive Guide*, *High Performance MySQL*, *Database Internals*.
8. **Operating Systems**: *Operating System Concepts*, *The Linux Programming Interface*, *Modern Operating Systems*, *How Linux Works*, *Operating Systems: Three Easy Pieces (OSTEP)*.
9. **Networking**: *Computer Networking: A Top-Down Approach*, *Computer Networks*, *TCP/IP Illustrated*, *High Performance Browser Networking*, *Practical Packet Analysis*.
10. **Cyber Security**: *The Web Application Hacker's Handbook*, *Black Hat Python*, *Practical Malware Analysis*, *Applied Cryptography*, *The Tangled Web*.
11. **Blockchain**: *Mastering Bitcoin*, *Mastering Ethereum*, *Blockchain Basics: 25 Steps*, *Bitcoin and Cryptocurrency Technologies*, *Building Ethereum DApps*.
12. **Mathematics**: *Linear Algebra and Its Applications*, *Convex Optimization*, *Discrete Mathematics and Its Applications*, *Calculus: Early Transcendentals*, *A First Course in Probability*.
13. **Science**: *A Brief History of Time*, *Cosmos*, *The Feynman Lectures on Physics*, *Sapiens*, *The Selfish Gene*, *What If?*.
14. **Fiction**: *The Alchemist*, *1984*, *Dune*, *To Kill a Mockingbird*, *The Great Gatsby*, *The Hitchhiker's Guide to the Galaxy*, *Animal Farm*.
15. **Self Development**: *Atomic Habits*, *The 7 Habits of Highly Effective People*, *Deep Work*, *Thinking, Fast and Slow*, *Principles: Life and Work*.
16. **Business**: *The Intelligent Investor*, *Rich Dad Poor Dad*, *The Lean Startup*, *Zero to One*, *Good to Great*, *Shoe Dog*, *Hooked*.

---

## 4. Pre-Configured Demo Accounts

Use these accounts to evaluate both portals immediately:

| Role | Name | Email | Password | Student ID |
| :--- | :--- | :--- | :--- | :--- |
| **Librarian (Admin)** | Prof. Eleanor Vance | `admin@librachain.edu` | `Admin@123456` | `LIB-ADMIN-01` |
| **Student** | Alex Mercer | `student@librachain.edu` | `Student@123456` | `STU-2026-001` |
| **Student** | Sophia Chen | `sophia.chen@librachain.edu` | `Student@123456` | `STU-2026-002` |

> *Tip: The Login page contains convenient **"One-Click Demo Credentials"** buttons to auto-fill these accounts instantly.*

---

## 5. Quick Start Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (tested on v24)
- [MetaMask](https://metamask.io/) browser extension

### Installation
From the root directory:
```bash
# 1. Install root dependencies
npm install

# 2. Install server dependencies
cd server && npm install && cd ..

# 3. Install client dependencies
cd client && npm install --legacy-peer-deps && cd ..
```

### Running the Application
To run both backend API (port 5000) and frontend client (port 5173) concurrently:
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

> **Zero-Configuration Embedded Database**: If you do not have a local MongoDB daemon or MongoDB Atlas URI running, the server automatically boots an isolated embedded in-memory MongoDB instance and auto-seeds all 108 books and default accounts!

---

## 6. Smart Contract Deployment (Ethereum Sepolia)

The smart contract is located at `blockchain/contracts/LibraryManagement.sol`.

### Deployment via Remix IDE in 2 Minutes:
1. Open [Remix Ethereum IDE](https://remix.ethereum.org/).
2. Create `LibraryManagement.sol` and paste the contents of `blockchain/contracts/LibraryManagement.sol`.
3. Select Solidity compiler `0.8.24` and compile.
4. In the **Deploy & Run** tab:
   - Environment: Select **Injected Provider - MetaMask**.
   - Ensure MetaMask is switched to **Sepolia Testnet**.
   - Click **Deploy** and confirm the transaction in MetaMask.
5. Copy the deployed contract address and set it in `.env` and `client/.env`:
   ```bash
   VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
   ```

### Sepolia Faucets (Free Testnet ETH):
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com)
- [Google Cloud Web3 Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
- [PoW Sepolia Faucet](https://sepolia-faucet.pk910.de/)

---

## 7. REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` – Register new student or admin.
- `POST /api/auth/login` – Authenticate user and receive JWT.
- `GET /api/auth/profile` – Current user profile with borrowing statistics.
- `PUT /api/auth/profile` – Update name or link MetaMask wallet address.

### Books (`/api/books`)
- `GET /api/books` – Public catalogue with search, category filtering, availability, sorting, and pagination.
- `GET /api/books/:id` – Detailed book metadata and recent loans.
- `POST /api/books` – Add new book (Admin only).
- `PUT /api/books/:id` – Update book record (Admin only).
- `DELETE /api/books/:id` – Remove book from catalogue (Admin only, requires 0 active loans).

### Borrowing (`/api/borrow`)
- `POST /api/borrow` – Record loan after MetaMask Sepolia confirmation.
- `POST /api/borrow/return` – Record return, evaluate late return status, and restore copy.
- `GET /api/borrow/my-books` – Current student's active loans.
- `GET /api/borrow/history` – Current student's complete loan history.
- `GET /api/borrow/all` – Institutional borrowing records with status & student filtering (Admin only).

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/admin` – 6 core KPIs, Recharts data arrays, and recent transactions.
- `GET /api/dashboard/student` – Student KPIs, active loans, and book recommendations.
- `GET /api/dashboard/students` – Registered students list with active and overdue metrics.

---

## 8. License
MIT License. Created for the LibraChain Decentralized Academic Library Management Initiative.
