import { useState } from 'react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', page: 'home' },
    { name: 'Jobs', page: 'jobs' },
    { name: 'Apply', page: 'apply' },
    { name: 'Dashboard', page: 'dashboard' },
    { name: 'Contact', page: 'contact' }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <img src="/logo.png" alt="KIUTH Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-brand-blue">KIUTH</h1>
              <p className="text-xs text-gray-500">Recruitment Portal</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              {navItems.map(item => (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className={`font-medium transition-colors duration-300 ${currentPage === item.page
                    ? 'text-brand-teal'
                    : 'text-gray-600 hover:text-brand-teal'
                    }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Admin Link */}
            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${currentPage === 'admin'
                ? 'bg-brand-blue text-white'
                : 'bg-gray-100 text-brand-blue hover:bg-brand-blue hover:text-white'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-medium">Admin</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            {navItems.map(item => (
              <button
                key={item.page}
                onClick={() => {
                  onNavigate(item.page);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg transition-colors duration-300 ${currentPage === item.page
                  ? 'bg-brand-teal text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 rounded-lg transition-colors duration-300 ${currentPage === 'admin'
                ? 'bg-brand-blue text-white'
                : 'text-brand-blue font-medium hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Admin Portal
              </div>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
