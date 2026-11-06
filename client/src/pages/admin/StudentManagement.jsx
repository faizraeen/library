import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/Badge';
import {
  Users,
  Search,
  Mail,
  Wallet,
  AlertTriangle,
  BookOpen,
  Loader2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

const StudentManagement = ({ onSelectStudentHistory }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.getRegisteredStudents();
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query) ||
      s.studentId?.toLowerCase().includes(query) ||
      s.walletAddress?.toLowerCase().includes(query)
    );
  });

  const truncateWallet = (addr) => {
    if (!addr) return 'Not Linked';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Registered Student Directory
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            View student borrowing standings, smart contract wallet references, and overdue loans.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-forest-50 text-forest-800 border border-forest-200 self-start sm:self-auto">
          {students.length} Registered Student{students.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-xl border border-gray-200/90 p-4 shadow-subtle">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, Student ID (e.g. STU-2026-001), email, or wallet..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-800 text-xs bg-gray-50/50"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-forest-800 animate-spin" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-subtle">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-gray-800">No students found</h3>
          <p className="text-xs text-gray-500 mt-1">
            No student records match the search keyword.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/90 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Ethereum Wallet (Sepolia)</th>
                  <th className="py-3 px-4">Active Loans</th>
                  <th className="py-3 px-4">Overdue Loans</th>
                  <th className="py-3 px-4">Total Checkouts</th>
                  <th className="py-3 px-4 text-right">Circulation History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Student Name & Email */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{s.name}</div>
                      <div className="text-gray-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {s.email}
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="py-3.5 px-4 font-mono font-medium text-gray-800 whitespace-nowrap">
                      {s.studentId || 'N/A'}
                    </td>

                    {/* Wallet */}
                    <td className="py-3.5 px-4 font-mono text-gray-600 whitespace-nowrap">
                      {s.walletAddress ? (
                        <a
                          href={`https://sepolia.etherscan.io/address/${s.walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-forest-700 flex items-center gap-1"
                          title={`View wallet on Sepolia Etherscan:\n${s.walletAddress}`}
                        >
                          <Wallet className="w-3 h-3 text-forest-600" />
                          <span>{truncateWallet(s.walletAddress)}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Not Connected</span>
                      )}
                    </td>

                    {/* Active Loans */}
                    <td className="py-3.5 px-4 font-semibold text-gray-900 whitespace-nowrap">
                      {s.activeLoansCount || 0}
                    </td>

                    {/* Overdue */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {(s.overdueCount || 0) > 0 ? (
                        <Badge variant="overdue" size="xs">
                          {s.overdueCount} Overdue
                        </Badge>
                      ) : (
                        <span className="text-emerald-700 font-medium">None</span>
                      )}
                    </td>

                    {/* Total Checkouts */}
                    <td className="py-3.5 px-4 font-medium text-gray-700 whitespace-nowrap">
                      {s.totalLoansCount || 0}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectStudentHistory && onSelectStudentHistory(s.studentId)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-gray-100 hover:bg-forest-50 hover:text-forest-800 text-gray-700 transition-colors"
                      >
                        Inspect Loans
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
