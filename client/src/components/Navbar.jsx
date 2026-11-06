import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import {
  BookOpen,
  Wallet,
  LogOut,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Menu,
} from 'lucide-react';

const Navbar = ({ onMobileMenuToggle }) => {
  const { user, logout, isAdmin } = useAuth();
  const {
    account,
    balance,
    isSepolia,
    hasMetaMask,
    connectWallet,
    switchToSepolia,
    connecting,
  } = useWeb3();

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/90 h-16 px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Left controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-forest-900 flex items-center justify-center text-white shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-base tracking-tight">
                LibraChain
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-forest-50 text-forest-800 border border-forest-200">
                v1.0 Sepolia
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              Decentralized Library Management
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: Web3 status + User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Network & Wallet Pill */}
        {hasMetaMask ? (
          account ? (
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg p-1 text-xs">
              {/* Sepolia Status */}
              {isSepolia ? (
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-white text-emerald-700 font-medium shadow-2xs"
                  title="Connected to Ethereum Sepolia Testnet"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden md:inline">Sepolia</span>
                  <span className="text-gray-400 hidden xl:inline">|</span>
                  <span className="text-gray-700 hidden xl:inline font-mono">
                    {balance} ETH
                  </span>
                </div>
              ) : (
                <button
                  onClick={switchToSepolia}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
                  title="Click to switch MetaMask to Ethereum Sepolia"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Switch Sepolia</span>
                </button>
              )}

              {/* Wallet Address */}
              <div
                className="px-2 py-1 font-mono font-medium text-gray-700 flex items-center gap-1 cursor-pointer hover:text-forest-800"
                onClick={() => navigator.clipboard.writeText(account)}
                title={`Connected MetaMask Account:\n${account}\n(Click to copy)`}
              >
                <Wallet className="w-3.5 h-3.5 text-forest-700" />
                <span>{truncateAddress(account)}</span>
              </div>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-forest-900 text-white hover:bg-forest-950 shadow-sm transition-all disabled:opacity-50"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{connecting ? 'Connecting...' : 'Connect MetaMask'}</span>
            </button>
          )
        ) : (
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
            title="Install MetaMask extension to execute on-chain library transactions"
          >
            <span>Get MetaMask</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {/* User Info & Role */}
        <div className="h-6 w-px bg-gray-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-gray-900 leading-tight">
              {user?.name || 'User'}
            </div>
            <div className="flex items-center justify-end gap-1 text-[11px] text-gray-500">
              {isAdmin ? (
                <span className="text-forest-700 font-medium flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-forest-600" /> Librarian
                </span>
              ) : (
                <span>ID: {user?.studentId || 'Student'}</span>
              )}
            </div>
          </div>

          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              isAdmin
                ? 'bg-forest-900 text-white'
                : 'bg-emerald-100 text-emerald-800'
            }`}
            title={`${user?.name} (${user?.role})`}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
            title="Sign out of LibraChain"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
