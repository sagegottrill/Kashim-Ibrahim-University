import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import HomePage from '../pages/HomePage';
import JobsPage from '../pages/JobsPage';
import ApplyPage from '../pages/ApplyPage';
import DashboardPage from '../pages/DashboardPage';
import AdminPage from '../pages/AdminPage';
import ContactPage from '../pages/ContactPage';

import RecruitmentClosed from '../pages/RecruitmentClosed';

const AppLayout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialPage = searchParams.get('view') || 'home';
  const [currentPage, setCurrentPage] = useState(initialPage);

  // DEADLINE CONFIGURATION
  // Set to Jan 11, 2026 00:00:00
  const DEADLINE = new Date('2026-01-11T00:00:00').getTime();
  const [isRecruitmentClosed, setIsRecruitmentClosed] = useState(false);

  useEffect(() => {
    const checkDeadline = () => {
      const now = new Date().getTime();
      if (now > DEADLINE) {
        setIsRecruitmentClosed(true);
      }
    };

    checkDeadline();
    // Optional: Check every minute in case user keeps tab open
    const interval = setInterval(checkDeadline, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update currentPage if URL param changes (e.g. after redirect)
  useEffect(() => {
    const view = searchParams.get('view');
    if (view) {
      setCurrentPage(view);
    }
  }, [searchParams]);

  const handleNavigate = (page: string) => {
    if (page === 'auth') {
      navigate('/auth');
      return;
    }
    if (page === 'dashboard') {
      navigate('/dashboard');
      return;
    }
    if (page === 'apply') {
      navigate('/apply');
      return;
    }
    if (page === 'admin') {
      navigate('/admin');
      return;
    }

    // Update URL to persist state for internal layout pages
    navigate(`?view=${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'jobs':
        return <JobsPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  if (isRecruitmentClosed) {
    return <RecruitmentClosed />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default AppLayout;
