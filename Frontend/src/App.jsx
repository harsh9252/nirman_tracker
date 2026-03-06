import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import TopNavbar from './components/TopNavbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import MobileBottomNavbar from './components/MobileBottomNavbar.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LeadsPage from './pages/LeadsPage.jsx';
import ClientsPage from './pages/ClientsPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import LoginSignupPage from './pages/LoginSignupPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import EmployeesPage from './pages/EmployeesPage.jsx';
import ChangePasswordPopup from './components/ChangePasswordPopup.jsx';
import { useTranslation } from './services/translationService.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// AuthBootstrap - Blocks ALL route rendering until auth is resolved
function AuthBootstrap({ children }) {
  const { loading } = useAuth();

  // Block ALL rendering until auth is resolved
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
}



function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Get current page from URL path (for HashRouter)
  const getCurrentPageFromPath = (path) => {
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path === '/lead-management') return 'lead-management';
    if (path === '/clients-management') return 'clients-management';
    if (path === '/my-tasks' || path.startsWith('/task/')) return 'my-tasks';
    if (path === '/notifications') return 'notifications';
    if (path === '/projects-management') return 'projects-management';
    if (path === '/users-management') return 'users-management';
    if (path === '/profile') return 'profile';
    if (path === '/employee-management') return 'employee-management';
    if (path === '/site-expenses') return 'site-expenses';
    if (path === '/site-received') return 'site-received';
    if (path === '/reports') return 'reports';
    if (path === '/settings') return 'settings';
    if (path === '/help-support') return 'help-support';
    return 'dashboard';
  };

  const [currentPage, setCurrentPage] = useState(getCurrentPageFromPath(location.pathname));

  // Update currentPage when location changes
  useEffect(() => {
    setCurrentPage(getCurrentPageFromPath(location.pathname));
  }, [location.pathname]);

  const handleNavigate = (path) => {
    setCurrentPage(path);
    navigate(`/${path}`);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard';
      case 'lead-management':
        return 'Leads';
      case 'clients-management':
        return 'Clients';
      case 'my-tasks':
        return 'Tasks';
      case 'projects-management':
        return 'Projects';
      case 'users-management':
        return 'Users';
      case 'profile':
        return 'Profile';
      case 'employee-management':
        return 'Employees';
      case 'site-expenses':
        return 'Site Expenses';
      case 'site-received':
        return 'Site Received';
      case 'reports':
        return 'Reports';
      case 'settings':
        return 'Settings';
      case 'help-support':
        return 'Help & Support';
      default:
        return 'Dashboard';
    }
  };

  const getPageSubtitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return t('Manage Everything from a single place');
      case 'lead-management':
        return t('Track and manage your potential clients');
      case 'clients-management':
        return t('Manage your client relationships');
      case 'my-tasks':
        return t('Manage and track your tasks effectively');
      case 'projects-management':
        return t('Oversee all your projects');
      case 'users-management':
        return t('Manage system users');
      case 'profile':
        return t('View and manage your profile information');
      case 'employee-management':
        return t('Manage your team effectively');
      case 'site-expenses':
        return t('Track construction expenses');
      case 'site-received':
        return t('Monitor received payments');
      case 'reports':
        return t('View detailed analytics and reports');
      case 'settings':
        return t('Configure your preferences');
      case 'help-support':
        return t('Get assistance and support');
      default:
        return t('Manage Everything from a single place');
    }
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-gray-700">
      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-semibold">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              {/* Mobile menu items would go here */}
              <div className="space-y-4">
                <button
                  onClick={() => { handleNavigate('dashboard'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-gray-100"
                >
                  <span className="text-primary">📊</span>
                  <span className="text-gray-700 font-medium">Dashboard</span>
                </button>
                <button
                  onClick={() => { handleNavigate('lead-management'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-gray-100"
                >
                  <span className="text-primary">👥</span>
                  <span className="text-gray-700 font-medium">Leads</span>
                </button>
                <button
                  onClick={() => { handleNavigate('clients-management'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-gray-100"
                >
                  <span className="text-primary">🤝</span>
                  <span className="text-gray-700 font-medium">Clients</span>
                </button>

                <button
                  onClick={() => { handleNavigate('projects-management'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-gray-100"
                >
                  <span className="text-primary">📁</span>
                  <span className="text-gray-700 font-medium">Projects</span>
                </button>
                <button
                  onClick={() => { handleNavigate('users-management'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-gray-100"
                >
                  <span className="text-primary">👤</span>
                  <span className="text-gray-700 font-medium">Users</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen max-h-screen overflow-hidden">
        {/* SIDEBAR - HIDDEN ON MOBILE */}
        <Sidebar activeItem={currentPage} onNavigate={handleNavigate} />

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto">
          <div>
            <TopNavbar
              title={getPageTitle()}
              subtitle={getPageSubtitle()}
              onMobileMenuToggle={handleMobileMenuToggle}
              onSearch={setSearchTerm}
            />
          </div>

          {/* PAGE CONTENT */}
          <div className="pt-16 md:pt-14" style={{ minHeight: '100vh' }}>
            <Routes>
              <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/lead-management" element={<ProtectedRoute><LeadsPage searchTerm={searchTerm} /></ProtectedRoute>} />
              {/* Placeholder routes for other pages */}
              <Route path="/clients-management" element={<ProtectedRoute><ClientsPage searchTerm={searchTerm} /></ProtectedRoute>} />
              <Route path="/my-tasks" element={<ProtectedRoute><TasksPage searchTerm={searchTerm} /></ProtectedRoute>} />
              <Route path="/task/:taskId" element={<ProtectedRoute><TasksPage searchTerm={searchTerm} /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/projects-management" element={<ProtectedRoute><ProjectsPage searchTerm={searchTerm} /></ProtectedRoute>} />
              <Route path="/users-management" element={<ProtectedRoute><UsersPage searchTerm={searchTerm} /></ProtectedRoute>} />
              <Route path="/employee-management" element={<ProtectedRoute><EmployeesPage searchTerm={searchTerm} /></ProtectedRoute>} />
              <Route path="/site-expenses" element={
                <ProtectedRoute>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 flex overflow-hidden">
                      <main className="flex-1 overflow-auto px-4 sm:px-6 py-4">
                        <div className="text-center py-20">
                          <h2 className="text-2xl font-bold text-gray-800 mb-4">Site Expenses</h2>
                          <p className="text-gray-600">This page is under development.</p>
                        </div>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/site-received" element={
                <ProtectedRoute>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 flex overflow-hidden">
                      <main className="flex-1 overflow-auto px-4 sm:px-6 py-4">
                        <div className="text-center py-20">
                          <h2 className="text-2xl font-bold text-gray-800 mb-4">Site Received</h2>
                          <p className="text-gray-600">This page is under development.</p>
                        </div>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 flex overflow-hidden">
                      <main className="flex-1 overflow-auto px-4 sm:px-6 py-4">
                        <div className="text-center py-20">
                          <h2 className="text-2xl font-bold text-gray-800 mb-4">Reports</h2>
                          <p className="text-gray-600">This page is under development.</p>
                        </div>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 flex overflow-hidden">
                      <main className="flex-1 overflow-auto px-4 sm:px-6 py-4">
                        <div className="text-center py-20">
                          <h2 className="text-2xl font-bold text-gray-800 mb-4">Settings</h2>
                          <p className="text-gray-600">This page is under development.</p>
                        </div>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/help-support" element={
                <ProtectedRoute>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 flex overflow-hidden">
                      <main className="flex-1 overflow-auto px-4 sm:px-6 py-4">
                        <div className="text-center py-20">
                          <h2 className="text-2xl font-bold text-gray-800 mb-4">Help & Support</h2>
                          <p className="text-gray-600">This page is under development.</p>
                        </div>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </div>

          {/* MOBILE BOTTOM NAVIGATION */}
          <MobileBottomNavbar
            activePage={currentPage}
            onNavigate={handleNavigate}
            onMenuToggle={() => setMobileMenuOpen(true)}
          />
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Prevent early render - return null while checking auth
  if (loading) return null;

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent() {
  const { isAuthenticated, loading, user, showPasswordChange, hidePasswordChange, requiresPasswordChange } = useAuth();

  // Handle password change completion - just hide popup
  const handlePasswordChanged = () => {
    hidePasswordChange();
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login or public pages
  if (!isAuthenticated()) {
    return (
      <Routes>
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="*" element={<LoginSignupPage />} />
      </Routes>
    );
  }

  // If authenticated, show the main app with password change popup if needed
  return (
    <>
      <Routes>
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="*" element={<AppLayout />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
      {requiresPasswordChange() && showPasswordChange && (
        <ChangePasswordPopup
          user={user}
          onPasswordChanged={handlePasswordChanged}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthBootstrap>
          <AppContent />
        </AuthBootstrap>
      </Router>
    </AuthProvider>
  );
}
