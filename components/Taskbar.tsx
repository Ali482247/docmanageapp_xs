


import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../constants';
import { DashboardIcon, UsersIcon, KeyIcon, LogoutIcon, ScaleIcon, ServerStackIcon } from './icons/IconComponents';

const Taskbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon />, roles: Object.values(UserRole) },
    { path: '/users', label: 'Foydalanuvchilar', icon: <UsersIcon />, roles: [UserRole.Admin] },
    { path: '/roles', label: 'Rollar', icon: <KeyIcon />, roles: [UserRole.Admin] },
    { path: '/api-docs', label: 'API', icon: <ServerStackIcon />, roles: [UserRole.Admin] },
    { path: '/discipline', label: 'Intizom', icon: <ScaleIcon />, roles: [UserRole.Admin, UserRole.BankApparati, UserRole.Boshqaruv] },
  ];

  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role as UserRole));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsUserMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center justify-center gap-4 h-16 px-6 bg-black/30 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl">
        <nav className="flex items-center gap-2">
          {filteredNavItems.map(item => (
            <div key={item.path} className="relative group">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 ${
                    isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {React.cloneElement(item.icon, { className: 'w-6 h-6' })}
              </NavLink>
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-2 text-sm font-medium text-gray-900 bg-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                  {item.label}
                  <div className="absolute top-full left-1/2 -ml-1 w-2 h-2 bg-white transform rotate-45"></div>
              </div>
            </div>
          ))}
        </nav>

        <div className="w-px h-8 bg-white/20"></div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center"
            aria-haspopup="true"
            aria-expanded={isUserMenuOpen}
          >
            <img
              className="w-10 h-10 rounded-full border-2 border-white/50"
              src={`https://i.pravatar.cc/150?u=${user?.email}`}
              alt="User avatar"
            />
          </button>
          
          {isUserMenuOpen && (
            <div 
              className="absolute right-0 bottom-full mb-3 w-56 origin-bottom-right rounded-lg shadow-lg bg-slate-800/80 backdrop-blur-xl border border-white/20 ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button"
            >
              <div className="py-1" role="none">
                <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                    <p className="text-xs text-white/70 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                  role="menuitem"
                >
                  <LogoutIcon className="w-5 h-5" />
                  <span>Chiqish</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Taskbar;