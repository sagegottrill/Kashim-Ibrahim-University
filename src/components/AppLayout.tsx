import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import HomePage from '../pages/HomePage';
import JobsPage from '../pages/JobsPage';
import ApplyPage from '../pages/ApplyPage';
import DashboardPage from '../pages/DashboardPage';
import AdminPage from '../pages/AdminPage';
import ContactPage from '../pages/ContactPage';

const AppLayout = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'jobs':
        return <JobsPage onNavigate={handleNavigate} />;
      case 'apply':
        return <ApplyPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'admin':
        return <AdminPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

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
