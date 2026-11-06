import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import {
  User,
  Mail,
  CreditCard,
  Wallet,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  BookOpen,
  Clock,
  AlertTriangle,
} from 'lucide-react';

const StudentProfile = () => {
  const { user, updateWalletAddress } = useAuth();
  const { account, balance, isSepolia, connectWallet } = useWeb3();

  const [copied, setCopied] = useState(false);
  const [syncingWallet, setSyncingWallet] = useState(false);

  const handleCopyWallet = () => {
    if (!user?.walletAddress && !account) return;
    navigator.clipboard.writeText(user?.walletAddress || account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSyncWallet = async () => {
    if (!account) {
      await connectWallet();
      return;
    }
    setSyncingWallet(true);
    await updateWalletAddress(account);
    setSyncingWallet(false);
  };

  const stats = user?.stats || {
    activeBorrows: 0,
    overdueBorrows: 0,
    returnedCount: 0,
    totalLoans: 0,
  };

  const onTimeReturns = Math.max(0, stats.returnedCount - stats.overdueBorrows);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Student Profile & Identity
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          View your academic credential details, linked MetaMask wallet, and on-chain circulation rating.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-forest-900 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
                <Badge variant="forest" size="xs">
                  {user?.role?.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {user?.email}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200/80 text-right">
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
              Student ID
            </span>
            <span className="font-mono text-sm font-bold text-forest-900">
              {user?.studentId || 'N/A'}
            </span>
          </div>
        </div>

        {/* Blockchain Wallet Association */}
        <div className="pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-forest-700" />
            <span>Associated Ethereum Wallet (Sepolia Testnet)</span>
          </h3>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-gray-500 block text-[11px]">
                Configured Address for Smart Contract Loans:
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-gray-800 break-all">
                  {user?.walletAddress || account || 'No wallet registered yet'}
                </span>
                {(user?.walletAddress || account) && (
                  <button
                    onClick={handleCopyWallet}
                    className="p-1 text-gray-400 hover:text-gray-700"
                    title="Copy wallet address"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {account && account.toLowerCase() !== user?.walletAddress?.toLowerCase() ? (
                <button
                  onClick={handleSyncWallet}
                  disabled={syncingWallet}
                  className="px-3 py-1.5 rounded-lg bg-forest-900 text-white font-semibold hover:bg-forest-950 text-xs shadow-2xs"
                >
                  {syncingWallet ? 'Syncing...' : 'Link Connected MetaMask'}
                </button>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Wallet Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Circulation Statistics */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Academic Circulation Standing
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Active Loans"
            value={stats.activeBorrows}
            subtitle="Currently held"
            icon={BookOpen}
          />
          <StatCard
            title="Lifetime Returns"
            value={stats.returnedCount}
            subtitle="Successful checkouts"
            icon={Clock}
          />
          <StatCard
            title="Overdue Notices"
            value={stats.overdueBorrows}
            subtitle="Past 14-day limit"
            icon={AlertTriangle}
            className={stats.overdueBorrows > 0 ? 'border-rose-300' : ''}
          />
          <StatCard
            title="Total Checkouts"
            value={stats.totalLoans}
            subtitle="Full ledger history"
            icon={ShieldCheck}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
