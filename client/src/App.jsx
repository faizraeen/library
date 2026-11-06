import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import BookCatalog from './pages/student/BookCatalog';
import MyBooks from './pages/student/MyBooks';
import MyHistory from './pages/student/MyHistory';
import StudentProfile from './pages/student/StudentProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import BookManagement from './pages/admin/BookManagement';
import StudentManagement from './pages/admin/StudentManagement';
import BorrowingManagement from './pages/admin/BorrowingManagement';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AdminProfile from './pages/admin/AdminProfile';

import { Loader2 } from 'lucide-react';

const MainLayout = () => {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [studentFilter, setStudentFilter] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-forest-800 animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500 font-medium">
            Initializing LibraChain Decoupled Runtime...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authMode === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthMode('register')} />;
  }

  // Handler to navigate from one tab to another with optional state
  const handleNavigate = (tab, state = {}) => {
    if (state.studentId) {
      setStudentFilter(state.studentId);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col text-gray-900">
      <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setStudentFilter('');
            setActiveTab(tab);
          }}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {isAdmin ? (
            <>
              {activeTab === 'dashboard' && <AdminDashboard onNavigate={handleNavigate} />}
              {activeTab === 'books' && <BookManagement />}
              {activeTab === 'students' && (
                <StudentManagement
                  onSelectStudentHistory={(studentId) =>
                    handleNavigate('borrowings', { studentId })
                  }
                />
              )}
              {activeTab === 'borrowings' && (
                <BorrowingManagement initialStudentFilter={studentFilter} />
              )}
              {activeTab === 'analytics' && <AnalyticsPage />}
              {activeTab === 'profile' && <AdminProfile />}
            </>
          ) : (
            <>
              {activeTab === 'dashboard' && <StudentDashboard onNavigate={handleNavigate} />}
              {activeTab === 'catalog' && <BookCatalog />}
              {activeTab === 'my-books' && <MyBooks onNavigate={handleNavigate} />}
              {activeTab === 'history' && <MyHistory />}
              {activeTab === 'profile' && <StudentProfile />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <MainLayout />
      </Web3Provider>
    </AuthProvider>
  );
}
