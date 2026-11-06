import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import TransactionLink from '../../components/TransactionLink';
import AddEditBookModal from '../../components/AddEditBookModal';
import {
  BookOpen,
  Users,
  Clock,
  Layers,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Activity,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#16A34A', '#F59E0B', '#2563EB', '#9333EA', '#0D9488'];

const AdminDashboard = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard metrics:', err);
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
    totalBooks: 0,
    totalCopies: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    totalStudents: 0,
    overdueBooks: 0,
    totalTransactions: 0,
  };

  const analytics = data?.analytics || {};
  const monthlyData = analytics.monthlyBorrowing || [];
  const categoryData = analytics.booksByCategory?.slice(0, 6) || [];
  const inventoryData = analytics.inventoryDistribution || [
    { name: 'Available', value: kpis.availableBooks },
    { name: 'Borrowed', value: kpis.borrowedBooks },
  ];
  const recentTransactions = data?.recentTransactions || [];
  const recentBorrows = data?.recentBorrowRecords || [];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/90 shadow-subtle">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-forest-700">
            Librarian Operations Console
          </span>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight mt-0.5">
            Decentralized Circulation & Catalog Overview
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Ethereum Sepolia smart contracts actively tracking physical academic inventory.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-forest-900 text-white font-semibold text-xs hover:bg-forest-950 flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
          <button
            onClick={() => onNavigate('borrowings')}
            className="px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium text-xs hover:bg-gray-50"
          >
            All Borrow Records
          </button>
        </div>
      </div>

      {/* 6 Core KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Books"
          value={kpis.totalBooks}
          subtitle={`${kpis.totalCopies} copies in system`}
          icon={BookOpen}
        />
        <StatCard
          title="Available"
          value={kpis.availableBooks}
          subtitle="On shelves"
          icon={Layers}
        />
        <StatCard
          title="Borrowed"
          value={kpis.borrowedBooks}
          subtitle="In circulation"
          icon={Clock}
        />
        <StatCard
          title="Students"
          value={kpis.totalStudents}
          subtitle="Registered accounts"
          icon={Users}
        />
        <StatCard
          title="Overdue"
          value={kpis.overdueBooks}
          subtitle="Past 14-day limit"
          icon={AlertTriangle}
          className={kpis.overdueBooks > 0 ? 'border-rose-300' : ''}
        />
        <StatCard
          title="On-Chain Txs"
          value={kpis.totalTransactions}
          subtitle="Sepolia verified"
          icon={Activity}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Circulation Velocity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200/90 p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-gray-900">
                Monthly Circulation Activity
              </h3>
              <p className="text-xs text-gray-400">
                Borrow vs Return volume trends
              </p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-forest-700 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64 w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
                  <YAxis stroke="#9CA3AF" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="borrows"
                    stroke="#16A34A"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBorrows)"
                    name="Loans Issued"
                  />
                  <Area
                    type="monotone"
                    dataKey="returns"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fillOpacity={0}
                    name="Returned"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Awaiting sufficient monthly loan transactions
              </div>
            )}
          </div>
        </div>

        {/* Inventory Ratio Donut Chart */}
        <div className="bg-white rounded-xl border border-gray-200/90 p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-gray-900">
              Inventory Availability Ratio
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Total physical copies status
            </p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell fill="#16A34A" />
                    <Cell fill="#F59E0B" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-around text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-gray-600">Available: {kpis.availableBooks}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-gray-600">Borrowed: {kpis.borrowedBooks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Blockchain Transactions & Recent Borrow Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sepolia Transactions */}
        <div className="bg-white rounded-xl border border-gray-200/90 p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-forest-700" />
              <h3 className="font-bold text-sm text-gray-900">
                Recent On-Chain Transactions (Sepolia)
              </h3>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-medium">
              Chain 11155111
            </span>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {recentTransactions.length === 0 ? (
              <p className="py-4 text-center text-gray-400">No blockchain transactions recorded yet.</p>
            ) : (
              recentTransactions.slice(0, 6).map((tx) => (
                <div key={tx._id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant={tx.action === 'borrow' ? 'borrowed' : 'returned'} size="xs">
                      {tx.action?.toUpperCase()}
                    </Badge>
                    <span className="font-mono text-gray-700 truncate">
                      Book #{tx.bookId}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <TransactionLink hash={tx.transactionHash} blockNumber={tx.blockNumber} />
                    <span className="text-[10px] text-gray-400">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Library Loans */}
        <div className="bg-white rounded-xl border border-gray-200/90 p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-forest-700" />
              <h3 className="font-bold text-sm text-gray-900">
                Latest Circulation Records
              </h3>
            </div>
            <button
              onClick={() => onNavigate('borrowings')}
              className="text-xs text-forest-700 font-semibold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {recentBorrows.length === 0 ? (
              <p className="py-4 text-center text-gray-400">No loan records yet.</p>
            ) : (
              recentBorrows.slice(0, 6).map((rec) => (
                <div key={rec._id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {rec.book?.title || `Book #${rec.bookId}`}
                    </h4>
                    <p className="text-gray-400 text-[11px]">
                      Student: {rec.user?.name || 'N/A'} ({rec.user?.studentId || 'STU'})
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <Badge variant={rec.status === 'overdue' ? 'overdue' : rec.status === 'returned' ? 'returned' : 'borrowed'} size="xs">
                      {rec.status}
                    </Badge>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {new Date(rec.borrowedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddEditBookModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchDashboard}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
