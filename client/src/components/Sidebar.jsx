import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Clock,
  BarChart3,
  BookMarked,
  History,
  User,
  Shield,
  Layers,
  ExternalLink,
  X,
} from 'lucide-react';

const Sidebar = ({ activeTab, onSelectTab, mobileOpen, onCloseMobile }) => {
  const { isAdmin } = useAuth();
  const { contractAddress } = useWeb3();

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'Book Management', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'borrowings', label: 'Borrow Records', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Admin ID Pass', icon: User },
  ];

  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'catalog', label: 'Book Catalogue', icon: BookOpen },
    { id: 'my-books', label: 'My Books', icon: BookMarked },
    { id: 'history', label: 'Borrow History', icon: History },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  const truncate = (str) => {
    if (!str || str.length <= 12) return str;
    return `${str.slice(0, 6)}...${str.slice(-4)}`;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 bg-white border-r border-gray-200">
      <div>
        {/* Portal Header */}
        <div className="flex items-center justify-between px-2 py-3 mb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${isAdmin ? 'bg-forest-100 text-forest-800' : 'bg-blue-100 text-blue-800'}`}>
              {isAdmin ? <Shield className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {isAdmin ? 'Librarian Portal' : 'Student Portal'}
              </p>
              <p className="text-[11px] text-gray-400">
                {isAdmin ? 'Library Administration' : 'Academic Circulation'}
              </p>
            </div>
          </div>

          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-forest-900 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sepolia Smart Contract Info Box */}
      <div className="pt-4 mt-4 border-t border-gray-100">
        <div className="bg-forest-50/60 rounded-xl p-3 border border-forest-100 text-xs">
          <div className="flex items-center justify-between text-forest-900 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sepolia Testnet
            </span>
            <span className="text-[10px] text-forest-700 font-mono">11155111</span>
          </div>

          <p className="text-[11px] text-forest-800/80 mb-2">
            Smart contract verified for tamper-resistant loan timestamps.
          </p>

          <div className="flex items-center justify-between text-[11px] text-forest-700 pt-1.5 border-t border-forest-200/50">
            <span className="font-mono">{truncate(contractAddress)}</span>
            <a
              href={`https://sepolia.etherscan.io/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-0.5"
              title="View Contract on Sepolia Etherscan"
            >
              <span>Etherscan</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
