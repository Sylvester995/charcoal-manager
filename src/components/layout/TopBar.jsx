import React from 'react';
import { Menu, LogOut, Bell, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '../notifications/NotificationCenter';

const TopBar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening';

  return (
    <header className="h-14 md:h-16 bg-[#161410] border-b border-[#302b22]
      flex items-center justify-between px-4 md:px-6 flex-shrink-0">

      {/* Left */}
      <div className="flex items-center gap-3">

        {/* Sidebar toggle — desktop only */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:block text-stone-500 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile brand */}
        <div className="flex md:hidden items-center gap-2">
          <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center
            justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-black text-sm tracking-wide">
            CHARCOAL
          </span>
        </div>

        {/* Desktop greeting */}
        <div className="hidden md:block">
          <span className="text-stone-500 text-sm">{greeting}, </span>
          <span className="text-white font-bold text-sm">{firstName}</span>
          <span className="text-stone-600 text-sm"> — {today}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-4">

        {/* Mobile greeting */}
        <div className="flex md:hidden flex-col items-end">
          <span className="text-white font-bold text-sm leading-tight">
            {greeting}, {firstName}
          </span>
          <span className="text-stone-600 text-[10px]">
            {new Date().toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </span>
        </div>

        {/* Bell */}
        <button className="text-stone-500 hover:text-white transition-colors">
          <NotificationCenter/>
        </button>

        {/* User badge — desktop only */}
        <div className="hidden md:flex items-center gap-2 bg-[#1e1b16]
          border border-[#302b22] rounded-lg px-3 py-1.5">
          <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center
            justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0)}
          </div>
          <span className="text-stone-300 text-sm font-medium">{user?.name}</span>
        </div>

        {/* Logout — desktop only */}
        <button
          onClick={handleLogout}
          className="hidden md:flex items-center gap-2 text-stone-500
            hover:text-red-400 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>

      </div>
    </header>
  );
};

export default TopBar;