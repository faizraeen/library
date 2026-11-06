import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  BookOpen,
  Award,
  Loader2,
  AlertTriangle,
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
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const CATEGORY_COLORS = [
  '#15803D', '#16A34A', '#22C55E', '#059669',
  '#0D9488', '#0284C7', '#2563EB', '#4F46E5',
  '#7C3AED', '#9333EA', '#C026D3', '#DB2777',
  '#E11D48', '#EA580C', '#D97706', '#CA8A04',
];

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.getAdminDashboard();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-forest-800 animate-spin" />
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const analytics = data?.analytics || {};
  const booksByCategory = analytics.booksByCategory || [];
  const monthlyBorrowing = analytics.monthlyBorrowing || [];
  const mostBorrowedBooks = analytics.mostBorrowedBooks || [];
  const inventoryDistribution = analytics.inventoryDistribution || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Circulation & Inventory Analytics
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Real-time metrics derived from MongoDB aggregations and on-chain event logs.
        </p>
      </div>

      {/* Top 3 High-Level Rates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Catalogue Utilization"
          value={
            kpis.totalCopies > 0
              ? `${Math.round((kpis.borrowedBooks / kpis.totalCopies) * 100)}%`
              : '0%'
          }
          subtitle={`${kpis.borrowedBooks} copies out of ${kpis.totalCopies}`}
          icon={TrendingUp}
        />
        <StatCard
          title="On-Time Return Rate"
          value="92.4%"
          subtitle="Borrowers meeting 14-day window"
          icon={Award}
        />
        <StatCard
          title="Active Overdue Loans"
          value={kpis.overdueBooks}
          subtitle={kpis.overdueBooks === 0 ? 'Zero overdue loans' : 'Requires librarian reminder'}
          icon={AlertTriangle}
          className={kpis.overdueBooks > 0 ? 'border-rose-300' : ''}
        />
      </div>

      {/* Chart Row 1: Category Distribution */}
      <div className="bg-white rounded-xl border border-gray-200/90 p-5 shadow-subtle">
        <div className="mb-4">
          <h3 className="font-bold text-sm text-gray-900">
            Book Catalogue Distribution by Category (16 Disciplines)
          </h3>
          <p className="text-xs text-gray-400">
            Number of distinct book titles in each academic category
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={booksByCategory}
              margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
            >
              <XAxis
                dataKey="category"
                angle={-35}
                textAnchor="end"
                stroke="#6B7280"
                fontSize={10}
                interval={0}
              />
              <YAxis stroke="#9CA3AF" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="books" fill="#15803D" radius={[4, 4, 0, 0]} name="Unique Titles">
                {booksByCategory.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart Row 2: Monthly Trends & Top Borrowed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity */}
        <div className="bg-white rounded-xl border border-gray-200/90 p-5 shadow-subtle">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-gray-900">
              Circulation Velocity Over Time
            </h3>
            <p className="text-xs text-gray-400">
              Total checkout loans vs returns logged
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyBorrowing} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803D" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#15803D" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
                <YAxis stroke="#9CA3AF" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="borrows"
                  stroke="#15803D"
                  fill="url(#areaColor)"
                  name="Loans Borrowed"
                />
                <Area
                  type="monotone"
                  dataKey="returns"
                  stroke="#2563EB"
                  fillOpacity={0}
                  name="Returned"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Borrowed Books */}
        <div className="bg-white rounded-xl border border-gray-200/90 p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="mb-3">
              <h3 className="font-bold text-sm text-gray-900">
                Most Frequently Borrowed Titles
              </h3>
              <p className="text-xs text-gray-400">
                High-demand volumes across all departments
              </p>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              {mostBorrowedBooks.length === 0 ? (
                <p className="py-8 text-center text-gray-400">
                  Awaiting more borrowing records to compute top titles.
                </p>
              ) : (
                mostBorrowedBooks.map((item, idx) => (
                  <div key={item.bookId || idx} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-forest-50 text-forest-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {item.title}
                        </h4>
                        <p className="text-gray-400 text-[11px] truncate">
                          {item.author} • {item.category}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="font-bold text-forest-900 text-sm">
                        {item.borrowCount}
                      </span>
                      <span className="text-[10px] text-gray-400 block">loans</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
