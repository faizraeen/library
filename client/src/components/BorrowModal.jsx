import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TransactionLink from './TransactionLink';
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Calendar,
  X,
  ExternalLink,
} from 'lucide-react';

const BorrowModal = ({ book, onClose, onSuccess }) => {
  const {
    account,
    connectWallet,
    borrowBookOnChain,
    isSepolia,
    switchToSepolia,
  } = useWeb3();
  const { user, refreshUser } = useAuth();

  const [step, setStep] = useState('initial'); // 'initial' | 'wallet_confirm' | 'mining' | 'syncing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [txResult, setTxResult] = useState(null);

  const handleStartBorrow = async () => {
    setErrorMessage('');

    try {
      // 1. Ensure wallet is connected
      let currentAccount = account;
      if (!currentAccount) {
        setStep('wallet_confirm');
        currentAccount = await connectWallet();
      }

      // 2. Check Sepolia Network
      if (!isSepolia) {
        setStep('wallet_confirm');
        await switchToSepolia();
      }

      // 3. Initiate Blockchain Transaction via MetaMask
      setStep('wallet_confirm');
      const onChainResult = await borrowBookOnChain(book.bookId);

      // 4. Update MongoDB borrowing record with real transaction hash
      setStep('syncing');
      const apiRes = await api.borrowBook(
        book.bookId,
        onChainResult.hash,
        currentAccount
      );

      setTxResult({
        hash: onChainResult.hash,
        blockNumber: onChainResult.blockNumber,
        borrowRecord: apiRes.data,
      });

      // Refresh student context metrics
      await refreshUser();

      setStep('success');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Borrow workflow error:', err);
      // User rejection code in MetaMask is 4001 or 'ACTION_REJECTED'
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        setErrorMessage('Transaction signature was cancelled in MetaMask.');
      } else {
        setErrorMessage(err.message || 'Transaction could not be confirmed on blockchain.');
      }
      setStep('error');
    }
  };

  const loanDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-elevation border border-gray-200">
        <button
          onClick={onClose}
          disabled={step === 'wallet_confirm' || step === 'mining' || step === 'syncing'}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Initial Overview */}
        {step === 'initial' && (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-full bg-forest-50 flex items-center justify-center text-forest-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Borrow Book via Sepolia
                </h3>
                <p className="text-xs text-gray-500">
                  On-chain Smart Contract Loan
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200/80 mb-4 text-xs">
              <p className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">
                {book.title}
              </p>
              <p className="text-gray-600 mb-3">{book.author}</p>

              <div className="flex items-center justify-between py-1.5 border-t border-gray-200/60 text-gray-600">
                <span>Loan Duration:</span>
                <span className="font-semibold text-gray-800">14 Days Standard</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-t border-gray-200/60 text-gray-600">
                <span>Calculated Due Date:</span>
                <span className="font-semibold text-forest-800 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {loanDueDate}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-t border-gray-200/60 text-gray-600">
                <span>Blockchain Network:</span>
                <span className="font-mono text-emerald-700 font-medium">
                  Ethereum Sepolia
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              MetaMask will prompt you to confirm the transaction. Once confirmed on Sepolia, the borrowing timestamp is immutably sealed and your library loan becomes active.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleStartBorrow}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-forest-900 text-white hover:bg-forest-950 shadow-sm flex items-center gap-1.5"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Confirm with MetaMask</span>
              </button>
            </div>
          </div>
        )}

        {/* Progress States */}
        {(step === 'wallet_confirm' || step === 'mining' || step === 'syncing') && (
          <div className="text-center py-6">
            <Loader2 className="w-10 h-10 text-forest-700 animate-spin mx-auto mb-4" />
            <h4 className="font-bold text-gray-900 text-base mb-1">
              {step === 'wallet_confirm' && 'Awaiting MetaMask Confirmation...'}
              {step === 'mining' && 'Mining on Sepolia Testnet...'}
              {step === 'syncing' && 'Registering Loan to Library Database...'}
            </h4>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              {step === 'wallet_confirm' && 'Please approve the transaction prompt in your MetaMask extension.'}
              {step === 'mining' && 'Waiting for Sepolia block confirmation. This usually takes 5-15 seconds.'}
              {step === 'syncing' && 'Reconciling on-chain receipt and updating catalogue inventory.'}
            </p>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-gray-900 text-lg mb-1">
              Loan Confirmed On-Chain!
            </h4>
            <p className="text-xs text-gray-600 mb-4 max-w-xs mx-auto">
              You have successfully borrowed <strong>{book.title}</strong>. Please return it by {loanDueDate}.
            </p>

            {txResult?.hash && (
              <div className="bg-forest-50/70 border border-forest-200 rounded-xl p-3 text-left mb-5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-forest-800 block mb-1">
                  Sepolia Transaction Verification
                </span>
                <TransactionLink hash={txResult.hash} blockNumber={txResult.blockNumber} />
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold rounded-lg bg-forest-900 text-white hover:bg-forest-950 shadow-sm"
            >
              Done & Return to Catalogue
            </button>
          </div>
        )}

        {/* Error */}
        {step === 'error' && (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-gray-900 text-base mb-1">
              Borrowing Operation Incomplete
            </h4>
            <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200/70 mb-4 text-left font-mono">
              {errorMessage}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
              <button
                onClick={handleStartBorrow}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-forest-900 text-white hover:bg-forest-950"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowModal;
