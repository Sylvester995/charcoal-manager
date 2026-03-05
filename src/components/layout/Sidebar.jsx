import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Flame, LayoutDashboard, PackagePlus,User,
  ShoppingBag, ClipboardList, TrendingUp, ShieldCheck, PiggyBank, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();

  const navItems = [
    { to: '/',            icon: LayoutDashboard, label: 'Dashboard',    roles: ['superadmin','admin','manager','viewer'] },
    { to: '/batch',       icon: PackagePlus,     label: 'Record Batch', roles: ['superadmin','admin','manager']          },
    { to: '/sales',       icon: ShoppingBag,     label: 'Record Sales', roles: ['superadmin','admin','manager']          },
    { to: '/history',     icon: ClipboardList,   label: 'History',      roles: ['superadmin','admin','manager','viewer'] },
    { to: '/projections', icon: TrendingUp,      label: 'Projections',  roles: ['superadmin','admin','manager','viewer'] },
    { to: '/reinvestment', icon: PiggyBank,      label: 'Reinvestment',  roles: ['superadmin','admin','manager','viewer'] },
    { to: '/reports',    icon: FileText,            label: 'Reports',   roles: ['superadmin','admin','manager','viewer'] },
    { to: '/account',    icon: User,            label: 'My Account',   roles: ['superadmin','admin','manager','viewer'] },
    { to: '/admin',       icon: ShieldCheck,     label: 'Admin Panel',  roles: ['superadmin']                            },

  ];

  const visible = navItems.filter(n => n.roles.includes(user?.role));

  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <aside className={`
      ${isOpen ? 'w-60' : 'w-0 overflow-hidden'}
      transition-all duration-300 bg-[#161410] border-r border-[#302b22]
      flex flex-col min-h-screen flex-shrink-0
    `}>

      {/* Brand */}
      <div className="px-6 py-7 border-b border-[#302b22]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center
            justify-center flex-shrink-0">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div className="text-white font-black text-sm leading-tight tracking-wide">
            CHARCOAL<br />MANAGER
          </div>
        </div>
        <div className="mt-3 text-[10px] text-stone-600 uppercase tracking-widest">
          Liberia Business Tracker
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        {visible.map(({ to, icon: Icon, label }) => {
          const isAdminLink = to === '/admin';
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-6 py-3 text-sm font-medium
                border-l-[3px] transition-all duration-150
                ${isActive
                  ? isAdminLink
                    ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                    : 'border-orange-500 text-orange-400 bg-orange-500/10'
                  : isAdminLink
                    ? 'border-transparent text-stone-500 hover:text-yellow-300 hover:bg-yellow-500/5'
                    : 'border-transparent text-stone-500 hover:text-stone-200 hover:bg-orange-500/5'
                }
              `}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${
                isAdminLink ? 'text-yellow-500' : ''
              }`} />
              <span className="whitespace-nowrap">{label}</span>
              {isAdminLink && (
                <span className="ml-auto text-[8px] font-bold uppercase
                  tracking-wider bg-yellow-500/15 text-yellow-400
                  border border-yellow-500/25 px-1.5 py-0.5 rounded-full">
                  SA
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-6 py-5 border-t border-[#302b22]">
        <div className="text-[10px] text-stone-600 uppercase tracking-widest mb-1">
          Logged in as
        </div>
        <div className="text-white text-sm font-semibold">{user?.name}</div>
        <div className="text-stone-500 text-xs font-mono mt-0.5">{user?.email}</div>

        {/* Role badge — yellow for superadmin, orange for others */}
        <div className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px]
          font-bold uppercase tracking-wider border ${
          isSuperAdmin
            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
        }`}>
          {user?.role}
        </div>

        {/* Super admin indicator */}
        {isSuperAdmin && (
          <div className="flex items-center gap-1.5 mt-2">
            <ShieldCheck className="w-3 h-3 text-yellow-500" />
            <span className="text-[10px] text-yellow-500 font-medium">
              Full system access
            </span>
          </div>
        )}

        <div className="mt-3 text-[10px] text-stone-600 uppercase tracking-widest">
          Currency
        </div>
        <div className="mt-1 text-xs font-mono text-yellow-500">
          Liberian Dollar (L$)
        </div>
        <div className="mt-1 text-[11px] text-stone-500 leading-relaxed">
          Wholesale: <span className="text-orange-400 font-mono">L$650/bag</span><br />
          Retail: <span className="text-green-400 font-mono">L$900/bag</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;