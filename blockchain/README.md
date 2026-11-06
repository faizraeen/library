# LibraChain Smart Contracts

This directory contains the Solidity smart contract and artifacts for **LibraChain – Decentralized Library Management System**.

## Contract Details

- **File**: `contracts/LibraryManagement.sol`
- **Compiler Version**: `^0.8.24`
- **License**: MIT
- **Target Network**: Ethereum Sepolia Testnet (Chain ID: `11155111`)

---

## Smart Contract Functions

1. `addBook(uint256 bookId, string isbn, string title, uint256 copies)` – Only authorized librarian can add or restock books. Emits `BookAdded`.
2. `removeBook(uint256 bookId)` – Deactivates book in catalogue. Emits `BookRemoved`.
3. `borrowBook(uint256 bookId)` – Borrows 1 available copy for caller for 14 days. Emits `BookBorrowed`.
4. `returnBook(uint256 bookId)` – Current borrower returns book. Detects if return is late. Restores inventory. Emits `BookReturned`.
5. `getBookDetails(uint256 bookId)` – Returns title, ISBN, total/available copies, active status.
6. `getBorrowingHistory(uint256 bookId)` – Returns complete on-chain audit history for a book.
7. `getStudentBorrowings(address student)` – Returns all loan records for a specific wallet address.
8. `isOverdue(uint256 bookId, address borrower)` – Computes whether active loan exceeded the 14-day duration.

---

## Quick Deployment via Remix IDE (Recommended: ~2 Minutes)

1. Open **[Remix Ethereum IDE](https://remix.ethereum.org/)** in your browser.
2. Under the `contracts` folder, create a new file named `LibraryManagement.sol`.
3. Copy the entire contents of `blockchain/contracts/LibraryManagement.sol` and paste it into Remix.
4. On the left navigation, click **Solidity Compiler**:
   - Compiler version: `0.8.24` or higher
   - Click **Compile LibraryManagement.sol**
5. On the left navigation, click **Deploy & Run Transactions**:
   - Environment: Select **Injected Provider - MetaMask**
   - In MetaMask, make sure you are switched to **Sepolia Testnet**.
   - Ensure your account has Sepolia ETH (get free faucet ETH from [Alchemy Sepolia Faucet](https://sepoliafaucet.com) or [Google Cloud Web3 Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)).
   - Click **Deploy** (orange button) and confirm the transaction in MetaMask.
6. Once deployed, copy the **Deployed Contract Address** (e.g., `0x973a...`).
7. Paste this address into `.env` and `client/.env`:
   ```bash
   VITE_CONTRACT_ADDRESS=0xYourDeployedAddressHere
   ```
8. Restart or refresh your LibraChain web application.

---

## Verifying on Etherscan Sepolia

Once deployed, view your contract and transactions live at:
`https://sepolia.etherscan.io/address/0xYourDeployedAddressHere`
