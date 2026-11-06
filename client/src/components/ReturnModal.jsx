import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TransactionLink from './TransactionLink';
import {
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  X,
  AlertTriangle,
} from 'lucide-react';

const ReturnModal = ({ record, onClose, onSuccess }) => {
  const {
    account,
    connectWallet,
    returnBookOnChain,
    isSepolia,
    switchToSepolia,
  } = useWeb3();
  const { refreshUser } = useAuth();

  const [step, setStep] = useState('initial');
  const [errorMessage, setErrorMessage] = useState('');
  const [returnResult, setReturnResult] = useState(null);

  const isOverdue = new Date() > new Date(record.dueDate);

  const handleStartReturn = async () => {
    setErrorMessage('');

    try {
      let currentAccount = account;
      if (!currentAccount) {
        setStep('wallet_confirm');
        currentAccount = await connectWallet();
      }

      if (!isSepolia) {
        setStep('wallet_confirm');
        await switchToSepolia();
      }

      setStep('wallet_confirm');
      // Execute on-chain returnBook(bookId)
      const onChainResult = await returnBookOnChain(record.bookId);

      setStep('syncing');
      // Update database record
      const apiRes = await api.returnBook(
        record.borrowId,
        record.bookId,
        onChainResult.hash,
        currentAccount
      );

      setReturnResult({
        hash: onChainResult.hash,
        blockNumber: onChainResult.blockNumber,
        isLate: apiRes.isLate,
      });

      await refreshUser();
      setStep('success');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Return workflow error:', err);
      if (err.code === 401 || err.code === 'ACTION_REJECTED') {
        setErrorMessage('Transaction was cancelled in MetaMask.');
      } else {
        setErrorMessage(err.message || 'Failed to submit return transaction.');
      }
      setStep('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-elevation border border-gray-200">
        <button
          onClick={onClose}
          disabled={step === 'wallet_confirm' || step === 'syncing'}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'initial' && (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-full bg-forest-50 flex items-center justify-center text-forest-700">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Return Physical Book
                </h3>
                <p className="text-xs text-gray-500">
                  On-chain Return Verification
                </p>
              </div>
            </div>

            {isOverdue && (
              <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4 text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Loan is Past Due Date</p>
                  <p className="text-rose-700 text-[11px] mt-0.5">
                    This book was due on {new Date(record.dueDate).toLocaleDateString()}. Returning now will mark this transaction as a Late Return on the blockchain.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200/80 mb-4 text-xs">
              <p className="font-semibold text-gray-900 text-sm mb-1">
                {record.book?.title || `Book #${record.bookId}`}
              </p>
              <p className="text-gray-600 mb-2">{record.book?.author}</p>

              <div className="flex items-center justify-between py-1.5 border-t border-gray-200/60 text-gray-600">
                <span>Borrowed Date:</span>
                <span className="font-medium text-gray-800">
                  {new Date(record.borrowedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-t border-gray-200/60 text-gray-600">
                <span>Due Date:</span>
                <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-gray-800'}`}>
                  {new Date(record.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-t border-gray-200/60 text-gray-600">
                <span>Original Borrow Tx:</span>
                <span className="font-mono text-gray-500 text-[11px]">
                  {record.transactionHash ? `${record.transactionHash.slice(0, 10)}...` : 'N/A'}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              MetaMask will prompt you to confirm the return transaction. After blockchain confirmation, 1 copy will be restored to the available library catalogue.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleStartReturn}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-forest-900 text-white hover:bg-forest-950 shadow-sm flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Confirm Return with MetaMask</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading Progress */}
        {(step === 'wallet_confirm' || step === 'syncing') && (
          <div className="text-center py-6">
            <Loader2 className="w-10 h-10 text-forest-700 animate-spin mx-auto mb-4" />
            <h4 className="font-bold text-gray-900 text-base mb-1">
              {step === 'wallet_confirm' ? 'Confirming Return on Sepolia...' : 'Restoring Catalogue Inventory...'}
            </h4>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              {step === 'wallet_confirm'
                ? 'Please approve the return transaction in MetaMask.'
                : 'Updating book availability in library database.'}
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
              Book Successfully Returned!
            </h4>
            <p className="text-xs text-gray-600 mb-4">
              {returnResult?.isLate
                ? 'Your return was completed and recorded as a late return.'
                : 'Thank you for returning the book on time!'}
            </p>

            {returnResult?.hash && (
              <div className="bg-forest-50/70 border border-forest-200 rounded-xl p-3 text-left mb-5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-forest-800 block mb-1">
                  Sepolia Return Tx Hash
                </span>
                <TransactionLink hash={returnResult.hash} blockNumber={returnResult.blockNumber} />
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold rounded-lg bg-forest-900 text-white hover:bg-forest-950 shadow-sm"
            >
              Done
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
              Return Failed
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
                onClick={handleStartReturn}
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

export default ReturnModal;
