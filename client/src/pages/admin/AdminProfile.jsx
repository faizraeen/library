import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import Badge from '../../components/Badge';
import {
  Shield,
  ShieldCheck,
  Mail,
  Wallet,
  Copy,
  Check,
  KeyRound,
  QrCode,
  Award,
  Layers,
  BookOpen,
  CheckCircle2,
  Lock,
} from 'lucide-react';

const AdminProfile = () => {
  const { user, updateWalletAddress } = useAuth();
  const { account, balance, isSepolia, contractAddress } = useWeb3();

  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const handleCopy = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Librarian ID Pass & System Credentials
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Official digital identity pass, system access credentials, and smart contract administrator keys.
        </p>
      </div>

      {/* Physical Digital ID Pass Card */}
      <div className="bg-gradient-to-br from-forest-950 via-forest-900 to-[#0A2619] text-white rounded-2xl p-6 sm:p-8 shadow-elevation border border-forest-800 relative overflow-hidden">
        {/* Holographic Watermark Effect */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-emerald-500/10 pointer-events-none blur-2xl" />
        <div className="absolute right-4 top-4 opacity-15">
          <Shield className="w-32 h-32 text-white" />
        </div>

        {/* Top Header of the Pass */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
                LibraChain Academic Consortium
              </span>
              <p className="text-[10px] text-white/60">
                Official Staff & Administrator Digital Pass
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Verified Admin
          </span>
        </div>

        {/* Card Body */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 my-6 relative z-10">
          {/* Avatar and Pass ID */}
          <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-forest-700 flex items-center justify-center text-white text-3xl font-extrabold shadow-md mb-3 border border-emerald-400/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
            </div>
            <span className="text-xs font-mono font-bold text-emerald-300 bg-white/10 px-3 py-1 rounded-md">
              {user?.studentId || 'LIB-ADMIN-01'}
            </span>
            <span className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">
              Employee ID
            </span>
          </div>

          {/* Details */}
          <div className="sm:col-span-8 flex flex-col justify-between space-y-3">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {user?.name || 'Prof. Eleanor Vance'}
              </h2>
              <p className="text-xs text-emerald-300/90 font-medium">
                Chief University Librarian & Smart Contract Administrator
              </p>
              <p className="text-xs text-white/70 mt-1">
                Department of Library & Information Systems • Division of Academic Technology
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
              <div>
                <span className="text-[10px] text-white/50 uppercase tracking-wider block">
                  Access Level
                </span>
                <span className="font-semibold text-white">Full Superuser (Tier 1)</span>
              </div>
              <div>
                <span className="text-[10px] text-white/50 uppercase tracking-wider block">
                  On-Chain Status
                </span>
                <span className="font-semibold text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Contract Owner
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pass Footer with Verification Barcode / Hash */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/60 relative z-10">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px]">AUTH_HASH: 0x7099...79C8</span>
            <span className="text-white/30">•</span>
            <span>Sepolia Network (11155111)</span>
          </div>
          <div className="font-mono text-[10px] tracking-widest text-emerald-400">
            |||| || | |||| ||||| || |||||| |
          </div>
        </div>
      </div>

      {/* Admin Login Credentials Quick-Copy Box */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-forest-50 text-forest-800 flex items-center justify-center">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">
              Librarian Login Credentials (ID & Password)
            </h3>
            <p className="text-xs text-gray-500">
              Use these credentials to authenticate into the LibraChain Admin portal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Email / User ID */}
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                Admin User ID / Email
              </span>
              <button
                onClick={() => handleCopy('admin@librachain.edu', setCopiedWallet)}
                className="text-forest-700 hover:text-forest-900 font-medium flex items-center gap-1 text-[11px]"
              >
                {copiedWallet ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedWallet ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="font-mono font-bold text-gray-900 text-sm">
              admin@librachain.edu
            </p>
          </div>

          {/* Password */}
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                Admin Password
              </span>
              <button
                onClick={() => handleCopy('Admin@123456', setCopiedPass)}
                className="text-forest-700 hover:text-forest-900 font-medium flex items-center gap-1 text-[11px]"
              >
                {copiedPass ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPass ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="font-mono font-bold text-gray-900 text-sm">
              Admin@123456
            </p>
          </div>
        </div>
      </div>

      {/* Smart Contract Administrative Privileges */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-subtle space-y-4">
        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-forest-700" />
          Smart Contract On-Chain Permissions (LibraryManagement.sol)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/60 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-800">addBook()</p>
              <p className="text-gray-500 text-[11px]">Authorized to mint new book IDs and register physical volumes on Sepolia.</p>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/60 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-800">removeBook()</p>
              <p className="text-gray-500 text-[11px]">Authorized to deactivate and retire books from active circulation.</p>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/60 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-800">transferLibrarianship()</p>
              <p className="text-gray-500 text-[11px]">Authorized to transfer smart contract administration to another faculty wallet.</p>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/60 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-800">Audit & Overdue Log Access</p>
              <p className="text-gray-500 text-[11px]">Full access to read on-chain student loan events and timestamps.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
