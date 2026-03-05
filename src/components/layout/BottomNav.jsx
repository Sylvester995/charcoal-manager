import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PackagePlus, ShoppingBag,
  ClipboardList, TrendingUp, MoreHorizontal,
  User, ShieldCheck, X, LogOut, PiggyBank, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


const mainNav = [
  { to: '/',        icon: LayoutDashboard, label: 'Home'    },
  { to: '/batch',   icon: PackagePlus,     label: 'Batch'   },
  { to: '/sales',   icon: ShoppingBag,     label: 'Sales'   },
  { to: '/history', icon: ClipboardList,   label: 'History' },
];

const BottomNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* More drawer overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More drawer */}
      {moreOpen && (
        <div className="fixed bottom-20 left-4 right-4 z-50
          bg-[#161410] border border-[#302b22] rounded-2xl p-4 shadow-2xl">

          {/* User info */}
          <div className="flex items-center gap-3 pb-4 mb-4
            border-b border-[#302b22]">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center
              justify-center text-white font-black">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <div className="text-white font-bold text-sm">{user?.name}</div>
              <div className="text-stone-500 text-xs">{user?.email}</div>
            </div>
            <button
              onClick={() => setMoreOpen(false)}
              className="ml-auto text-stone-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Extra nav items */}
          <div className="space-y-1">
            <NavLink
              to="/projections"
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-colors
                ${isActive
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-stone-400 hover:text-white hover:bg-orange-500/10'
                }
              `}
            >
              <TrendingUp className="w-5 h-5" />
              Projections
            </NavLink>

            
            <NavLink
               to="/reinvestment"
               onClick={() => setMoreOpen(false)}
               className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
              transition-colors
               ${isActive
                   ? 'bg-orange-500/15 text-orange-400'
                 : 'text-stone-400 hover:text-white hover:bg-orange-500/10'
                }
              `}
             >
              <PiggyBank className="w-5 h-5" />
                 Reinvestment
           </NavLink>

           <NavLink
              to="/reports"
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-colors
                 ${isActive
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-stone-400 hover:text-white hover:bg-orange-500/10'
                 }
             `}
            >
                <FileText className="w-5 h-5" />
                    Reports
             </NavLink>

            <NavLink
              to="/account"
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-colors
                ${isActive
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-stone-400 hover:text-white hover:bg-orange-500/10'
                }
              `}
            >
              <User className="w-5 h-5" />
              My Account
            </NavLink>

            {user?.role === 'superadmin' && (
              <NavLink
                to="/admin"
                onClick={() => setMoreOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-colors
                  ${isActive
                    ? 'bg-yellow-500/15 text-yellow-400'
                    : 'text-stone-400 hover:text-yellow-300 hover:bg-yellow-500/10'
                  }
                `}
              >
                <ShieldCheck className="w-5 h-5" />
                Admin Panel
                <span className="ml-auto text-[9px] font-bold uppercase
                  tracking-wider bg-yellow-500/15 text-yellow-400
                  border border-yellow-500/25 px-1.5 py-0.5 rounded-full">
                  SA
                </span>
              </NavLink>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 mt-3
              rounded-xl text-sm font-medium text-red-400
              hover:bg-red-500/10 transition-colors border-t
              border-[#302b22] pt-4"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40
        bg-[#161410] border-t border-[#302b22]
        flex items-center justify-around px-2 py-2 safe-area-pb">

        {mainNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 px-3 py-2 rounded-xl
              transition-all text-xs font-medium min-w-[60px]
              ${isActive
                ? 'text-orange-400 bg-orange-500/10'
                : 'text-stone-500 hover:text-stone-300'
              }
            `}
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}

        {/* More button */}
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl
            transition-all text-xs font-medium min-w-[60px]
            ${moreOpen
              ? 'text-orange-400 bg-orange-500/10'
              : 'text-stone-500 hover:text-stone-300'
            }
          `}
        >
          <MoreHorizontal className="w-5 h-5" />
          More
        </button>
      </nav>
    </>
  );
};

export default BottomNav;