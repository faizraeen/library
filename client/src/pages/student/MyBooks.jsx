import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import BookCover from '../../components/BookCover';
import Badge from '../../components/Badge';
import TransactionLink from '../../components/TransactionLink';
import ReturnModal from '../../components/ReturnModal';
import {
  BookMarked,
  RotateCcw,
  Calendar,
  AlertTriangle,
  Loader2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const MyBooks = ({ onNavigate }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningRecord, setReturningRecord] = useState(null);

  const fetchMyBooks = async () => {
    try {
      setLoading(true);
      const res = await api.getMyBorrowedBooks();
      if (res.success) {
        setRecords(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch borrowed books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBooks();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            My Borrowed Books
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your currently active physical book loans and smart contract deadlines.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-forest-50 text-forest-800 border border-forest-200 self-start sm:self-auto">
          {records.length} Active Loan{records.length === 1 ? '' : 's'}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-forest-800 animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-subtle">
          <BookMarked className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">
            No active book loans
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            You do not currently have any borrowed books. Browse the catalogue to borrow a volume using MetaMask.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('catalog')}
            className="mt-4 px-4 py-2 rounded-lg bg-forest-900 text-white text-xs font-semibold hover:bg-forest-950 flex items-center gap-1.5 mx-auto"
          >
            <span>Browse Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {records.map((rec) => {
            const isLate = new Date() > new Date(rec.dueDate);
            const daysLeft = Math.ceil(
              (new Date(rec.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={rec._id}
                className={`bg-white rounded-xl border p-5 shadow-subtle flex flex-col justify-between ${
                  isLate ? 'border-rose-300 ring-1 ring-rose-200' : 'border-gray-200/90'
                }`}
              >
                <div>
                  <div className="flex gap-4">
                    <BookCover
                      src={rec.book?.coverImage}
                      title={rec.book?.title}
                      author={rec.book?.author}
                      category={rec.book?.category}
                      className="w-20 h-28 shrink-0 rounded-lg shadow-xs"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[10px] text-gray-400">
                          {rec.book?.customId || `LIB-${rec.bookId}`}
                        </span>
                        <Badge variant={isLate ? 'overdue' : 'borrowed'} size="xs">
                          {isLate ? 'OVERDUE' : `${daysLeft} days remaining`}
                        </Badge>
                      </div>

                      <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2">
                        {rec.book?.title || `Book #${rec.bookId}`}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {rec.book?.author}
                      </p>
                      <p className="text-[11px] text-forest-800 font-medium mt-1">
                        {rec.book?.category}
                      </p>
                    </div>
                  </div>

                  {/* Loan Details Grid */}
                  <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 text-[10px] block">Borrowed Date</span>
                      <span className="font-medium text-gray-800">
                        {new Date(rec.borrowedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 text-[10px] block">Due Date (14 Days)</span>
                      <span className={`font-semibold ${isLate ? 'text-rose-600' : 'text-gray-800'}`}>
                        {new Date(rec.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Blockchain Reference */}
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-400 text-[10px]">On-Chain Loan Tx:</span>
                    <TransactionLink hash={rec.transactionHash} />
                  </div>
                </div>

                {/* Return CTA */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
                    Sepolia Verified
                  </span>

                  <button
                    onClick={() => setReturningRecord(rec)}
                    className="px-4 py-1.5 rounded-lg bg-forest-900 text-white font-semibold text-xs hover:bg-forest-950 flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Return Book</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {returningRecord && (
        <ReturnModal
          record={returningRecord}
          onClose={() => setReturningRecord(null)}
          onSuccess={fetchMyBooks}
        />
      )}
    </div>
  );
};

export default MyBooks;
