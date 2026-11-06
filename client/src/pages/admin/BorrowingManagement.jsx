import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/Badge';
import TransactionLink from '../../components/TransactionLink';
import {
  Clock,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
} from 'lucide-react';

const BorrowingManagement = ({ initialStudentFilter = '' }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState('all');
  const [studentId, setStudentId] = useState(initialStudentFilter);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.getAllBorrowRecords({
        status: status === 'all' ? '' : status,
        studentId: studentId.trim(),
        page,
        limit: 15,
      });

      if (res.success) {
        setRecords(res.data);
        setPages(res.pages);
        setTotal(res.total);
      }
    } catch (err) {
      console.error('Failed to load borrow records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [status, page]);

  const handleStudentFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecords();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Institutional Circulation Records
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit borrowing timestamps, 14-day deadlines, return timestamps, and Sepolia transaction proofs.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-forest-50 text-forest-800 border border-forest-200 self-start sm:self-auto">
          {total} Total Circulation Records
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-xl border border-gray-200/90 p-4 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'borrowed', label: 'Active Loans' },
            { id: 'returned', label: 'Returned' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'late', label: 'Late Returns' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setStatus(item.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                status === item.id
                  ? 'bg-forest-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Student ID Search */}
        <form onSubmit={handleStudentFilterSubmit} className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Filter by Student ID (e.g. STU-2026-001)..."
            className="w-full pl-9 pr-16 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-forest-800 text-xs"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-forest-800 animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-subtle">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-gray-800">
            No circulation records found
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            No records matched the selected status or student filter.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/90 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Borrow ID</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Borrowed At</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Returned At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Borrow Tx</th>
                  <th className="py-3 px-4">Return Tx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((r) => {
                  return (
                    <tr key={r._id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Borrow ID */}
                      <td className="py-3 px-4 font-mono font-medium text-gray-800 whitespace-nowrap">
                        {r.borrowId}
                      </td>

                      {/* Student */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">
                          {r.user?.name || 'Unknown Student'}
                        </div>
                        <div className="text-gray-400 text-[11px] font-mono">
                          {r.user?.studentId || 'N/A'}
                        </div>
                      </td>

                      {/* Book */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900 line-clamp-1 max-w-xs">
                          {r.book?.title || `Book #${r.bookId}`}
                        </div>
                        <div className="text-gray-500 text-[11px]">
                          {r.book?.author} • <span className="font-mono text-gray-400">{r.book?.customId || `LIB-${r.bookId}`}</span>
                        </div>
                      </td>

                      {/* Borrowed Date */}
                      <td className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                        {new Date(r.borrowedAt).toLocaleDateString()}
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                        {new Date(r.dueDate).toLocaleDateString()}
                      </td>

                      {/* Returned Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {r.returnedAt ? (
                          <span className="font-medium text-gray-800">
                            {new Date(r.returnedAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Active Loan</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {r.status === 'returned' ? (
                          r.isLate ? (
                            <Badge variant="late" size="xs">
                              Returned Late
                            </Badge>
                          ) : (
                            <Badge variant="returned" size="xs">
                              Returned On-Time
                            </Badge>
                          )
                        ) : r.status === 'overdue' ? (
                          <Badge variant="overdue" size="xs">
                            Overdue
                          </Badge>
                        ) : (
                          <Badge variant="borrowed" size="xs">
                            Active Loan
                          </Badge>
                        )}
                      </td>

                      {/* Borrow Tx */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <TransactionLink hash={r.transactionHash} />
                      </td>

                      {/* Return Tx */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <TransactionLink hash={r.returnTransactionHash} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200 text-xs">
          <div className="text-gray-500">
            Page <span className="font-semibold text-gray-900">{page}</span> of{' '}
            <span className="font-semibold text-gray-900">{pages}</span> (Total {total} records)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono font-medium bg-forest-50 text-forest-900 rounded-md">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowingManagement;
