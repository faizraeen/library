import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/Badge';
import TransactionLink from '../../components/TransactionLink';
import { History, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';

const MyHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getMyBorrowHistory();
      if (res.success) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch borrowing history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (filter === 'returned') return item.status === 'returned';
    if (filter === 'active') return item.status === 'borrowed' || item.status === 'overdue';
    if (filter === 'late') return item.isLate === true;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Borrowing History & Blockchain Ledger
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Immutable audit trail of your academic checkouts and returns on Ethereum Sepolia.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-gray-200 text-xs self-start sm:self-auto">
          {['all', 'returned', 'active', 'late'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-forest-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {f === 'late' ? 'Late Returns' : f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-forest-800 animate-spin" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-subtle">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">
            No history records found
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            No borrowings match the selected filter.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/90 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Book Details</th>
                  <th className="py-3 px-4">Borrowed At</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Returned At</th>
                  <th className="py-3 px-4">Loan Status</th>
                  <th className="py-3 px-4">Borrow Tx (Sepolia)</th>
                  <th className="py-3 px-4">Return Tx (Sepolia)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHistory.map((item) => {
                  return (
                    <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Book Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">
                          {item.book?.title || `Book #${item.bookId}`}
                        </div>
                        <div className="text-gray-500 text-[11px]">
                          {item.book?.author} • <span className="font-mono text-gray-400">{item.book?.customId || `LIB-${item.bookId}`}</span>
                        </div>
                      </td>

                      {/* Borrowed Date */}
                      <td className="py-3.5 px-4 font-medium text-gray-700 whitespace-nowrap">
                        {new Date(item.borrowedAt).toLocaleDateString()}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 font-medium text-gray-700 whitespace-nowrap">
                        {new Date(item.dueDate).toLocaleDateString()}
                      </td>

                      {/* Returned Date */}
                      <td className="py-3.5 px-4 font-medium text-gray-700 whitespace-nowrap">
                        {item.returnedAt ? (
                          new Date(item.returnedAt).toLocaleDateString()
                        ) : (
                          <span className="text-gray-400 italic">Not Returned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.status === 'returned' ? (
                          item.isLate ? (
                            <Badge variant="late" size="xs">
                              Returned Late
                            </Badge>
                          ) : (
                            <Badge variant="returned" size="xs">
                              Returned On-Time
                            </Badge>
                          )
                        ) : item.status === 'overdue' ? (
                          <Badge variant="overdue" size="xs">
                            Active Overdue
                          </Badge>
                        ) : (
                          <Badge variant="borrowed" size="xs">
                            Active Loan
                          </Badge>
                        )}
                      </td>

                      {/* Borrow Tx */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <TransactionLink hash={item.transactionHash} />
                      </td>

                      {/* Return Tx */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <TransactionLink hash={item.returnTransactionHash} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyHistory;
