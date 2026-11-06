import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import BookCard from '../../components/BookCard';
import Badge from '../../components/Badge';
import TransactionLink from '../../components/TransactionLink';
import BookDetailModal from '../../components/BookDetailModal';
import BorrowModal from '../../components/BorrowModal';
import ReturnModal from '../../components/ReturnModal';
import {
  BookOpen,
  BookMarked,
  AlertTriangle,
  History,
  ArrowRight,
  Clock,
  Sparkles,
  Loader2,
  Calendar,
} from 'lucide-react';

const StudentDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowingBook, setBorrowingBook] = useState(null);
  const [returningRecord, setReturningRecord] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getStudentDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-forest-800 animate-spin" />
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalAvailableBooks: 0,
    currentlyBorrowed: 0,
    overdueCount: 0,
    totalHistory: 0,
  };

  const activeLoans = data?.activeLoans || [];
  const recommendedBooks = data?.recommendedBooks || [];
  const recentAdditions = data?.recentAdditions || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-forest-900 to-forest-800 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-forest-200">
            Student Circulation Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-xs text-forest-100/80 mt-1">
            Student ID: <span className="font-mono font-medium text-white">{user?.studentId}</span> • 14-Day decentralized loans secured on Ethereum Sepolia.
          </p>
        </div>

        <button
          onClick={() => onNavigate('catalog')}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white text-forest-900 hover:bg-forest-50 text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <span>Browse Library Catalogue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Overdue Alert Banner if overdue > 0 */}
      {kpis.overdueCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-rose-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-rose-800">
                Action Required: You have {kpis.overdueCount} overdue book(s)!
              </p>
              <p className="text-rose-700 mt-0.5">
                Smart contract loan deadline has lapsed. Please return to restore availability and prevent disciplinary hold.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('my-books')}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 shrink-0"
          >
            Review Loans
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Books"
          value={kpis.totalAvailableBooks}
          subtitle="Ready for checkout"
          icon={BookOpen}
        />
        <StatCard
          title="Active Loans"
          value={kpis.currentlyBorrowed}
          subtitle="Currently with you"
          icon={BookMarked}
        />
        <StatCard
          title="Overdue Books"
          value={kpis.overdueCount}
          subtitle={kpis.overdueCount > 0 ? 'Requires immediate return' : 'All loans in good standing'}
          icon={AlertTriangle}
          className={kpis.overdueCount > 0 ? 'border-rose-300' : ''}
        />
        <StatCard
          title="Total Borrowed"
          value={kpis.totalHistory}
          subtitle="Lifetime loan history"
          icon={History}
        />
      </div>

      {/* Active Borrowed Books Quick View */}
      {activeLoans.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200/90 p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-forest-700" />
              <h2 className="text-sm font-bold text-gray-900">
                Your Currently Borrowed Books ({activeLoans.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigate('my-books')}
              className="text-xs text-forest-700 font-semibold hover:underline flex items-center gap-1"
            >
              <span>View All My Books</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {activeLoans.map((rec) => {
              const isLate = new Date() > new Date(rec.dueDate);
              const daysLeft = Math.ceil(
                (new Date(rec.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={rec._id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-10 bg-forest-900 rounded flex items-center justify-center text-white shrink-0 font-bold text-[10px]">
                      {rec.book?.category?.slice(0, 2).toUpperCase() || 'BK'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                        {rec.book?.title || `Book ID #${rec.bookId}`}
                      </h4>
                      <p className="text-gray-500 text-xs">
                        {rec.book?.author} • Due: {new Date(rec.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <Badge variant={isLate ? 'overdue' : 'borrowed'} size="xs">
                      {isLate ? 'Overdue!' : `${daysLeft} days remaining`}
                    </Badge>

                    <TransactionLink hash={rec.transactionHash} />

                    <button
                      onClick={() => setReturningRecord(rec)}
                      className="px-3 py-1 rounded-md bg-forest-900 text-white font-medium hover:bg-forest-950 transition-colors"
                    >
                      Return
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommended Books Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-forest-700" />
            <h2 className="text-base font-bold text-gray-900">
              Recommended for Your Curriculum
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs text-forest-700 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Explore Full Catalog (100+ Books)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {recommendedBooks.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onSelect={() => setSelectedBook(book)}
              onBorrow={() => setBorrowingBook(book)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onBorrow={() => {
            setBorrowingBook(selectedBook);
            setSelectedBook(null);
          }}
        />
      )}

      {borrowingBook && (
        <BorrowModal
          book={borrowingBook}
          onClose={() => setBorrowingBook(null)}
          onSuccess={fetchDashboard}
        />
      )}

      {returningRecord && (
        <ReturnModal
          record={returningRecord}
          onClose={() => setReturningRecord(null)}
          onSuccess={fetchDashboard}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
