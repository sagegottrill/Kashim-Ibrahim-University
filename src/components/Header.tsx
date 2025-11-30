import { useState, useEffect } from 'react';
import { Home, Briefcase, Phone, LayoutDashboard, Menu, X, Clock, LogOut, Shield, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { isAdmin } from '../config/admins';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const { user, logout } = useAuth();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      if (user?.uid) {
        const { data } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.uid)
          .single();
        if (data?.full_name) {
          setUserName(data.full_name);
        }
      }
    };
    fetchUserName();
  }, [user]);

  useEffect(() => {
    // Set deadline to 6 weeks + 1 day from Nov 29, 2025 -> Jan 11, 2026
    const targetDate = new Date('2026-01-11T00:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Home', page: 'home', icon: Home },
    { name: 'Jobs', page: 'jobs', icon: Briefcase },
    { name: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
    { name: 'Contact', page: 'contact', icon: Phone }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 flex flex-col font-sans">
      {/* Top Bar Timer */}
      <div className="bg-[#1e3a5f] text-white py-1.5 px-4 text-center border-b border-[#2a4a7f]">
        <div className="max-w-7xl mx-auto flex justify-center items-center gap-3 text-sm">
          <div className="flex items-center gap-2 opacity-90">
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs uppercase font-semibold tracking-wider">Application Deadline</span>
          </div>
          <div className="flex items-center gap-2 font-mono bg-[#162d4a] px-3 py-0.5 rounded-full border border-[#2a4a7f] shadow-inner">
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-[#4a9d7e]">{String(timeLeft.days).padStart(2, '0')}</span>
              <span className="text-[10px] text-gray-400">d</span>
            </div>
            <span className="text-gray-500 text-xs">:</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-[#4a9d7e]">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[10px] text-gray-400">h</span>
            </div>
            <span className="text-gray-500 text-xs">:</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-[#4a9d7e]">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[10px] text-gray-400">m</span>
            </div>
            <span className="text-gray-500 text-xs">:</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-[#4a9d7e]">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[10px] text-gray-400">s</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center py-4">

          {/* Mobile Logo (Left) */}
          <div className="flex md:hidden items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <img src="/logo.png" alt="KIUTH Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-brand-blue">KIUTH</h1>
            </div>
          </div>

          {/* Desktop Logo (Left) */}
          <div className="hidden md:flex items-center gap-4 cursor-pointer group" onClick={() => onNavigate('home')}>
            <div className="relative">
              <div className="absolute inset-0 bg-brand-teal/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img src="/logo.png" alt="KIUTH Logo" className="w-12 h-12 object-contain relative z-10 transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="text-left transition-transform duration-300 group-hover:translate-x-1">
              <h1 className="text-xl font-bold text-brand-blue leading-tight tracking-tight">KIUTH</h1>
              <p className="text-xs text-gray-500 font-medium tracking-wide">Recruitment Portal</p>
            </div>
          </div>

          {/* Desktop Navigation + Admin (Right) */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-2 bg-gray-50/50 p-1 rounded-full border border-gray-100">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.page}
                    onClick={() => onNavigate(item.page)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                      ? 'bg-white text-brand-blue shadow-sm ring-1 ring-gray-200'
                      : 'text-gray-600 hover:text-brand-blue hover:bg-white/50'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-teal' : 'text-gray-400 group-hover:text-brand-teal'}`} />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* User Profile / Admin Link */}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-200">
                  <User className="w-4 h-4 text-brand-blue" />
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                    {userName || user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    onNavigate('home');
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('auth')} // Assuming 'auth' is handled in AppLayout or we redirect
                className="px-6 py-2.5 bg-brand-blue text-white rounded-full text-sm font-semibold shadow-md hover:bg-[#162c4b] transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button (Right) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2 animate-fade-in-down">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.page}
                  onClick={() => {
                    onNavigate(item.page);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-colors duration-300 ${currentPage === item.page
                    ? 'bg-brand-blue/5 text-brand-blue font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${currentPage === item.page ? 'text-brand-teal' : 'text-gray-400'}`} />
                  {item.name}
                </button>
              );
            })}
            {isAdmin(user?.email) && (
              <div className="pt-2 border-t border-gray-100 mt-2">
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-colors duration-300 ${currentPage === 'admin'
                    ? 'bg-brand-blue text-white shadow-md'
                    : 'text-brand-blue font-medium hover:bg-brand-blue/5'
                    }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  Admin Portal
                </button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
