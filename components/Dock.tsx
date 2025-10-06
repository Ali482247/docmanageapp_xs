// docmanageapp/components/Dock.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../constants';
// Update the import to match the actual exports from IconComponents
import { UsersIcon, KeyIcon, ScaleIcon } from './icons/IconComponents';
// import { HomeIcon } from './icons/HomeIcon';

const Dock: React.FC = () => {
    const { user } = useAuth();
    
    const navItems = [
        // { path: '/dashboard', label: 'Bosh sahifa', icon: <HomeIcon />, roles: Object.values(UserRole) },
        { path: '/users', label: 'Foydalanuvchilar', icon: <UsersIcon />, roles: [UserRole.Admin] },
        { path: '/roles', label: 'Rollar', icon: <KeyIcon />, roles: [UserRole.Admin] },
        { path: '/discipline', label: 'Intizom', icon: <ScaleIcon />, roles: [UserRole.Admin] },
        // { path: '/api-docs', label: 'API', icon: <CommandLineIcon />, roles: [UserRole.Admin] },
    ];
    
    const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role as UserRole));

    return (
        <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-end justify-center gap-2 h-16 px-4 py-2 bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                {filteredNavItems.map(item => (
                    <div key={item.path} className="relative group">
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 transform-gpu group-hover:-translate-y-2 ${
                                isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            {React.cloneElement(item.icon, { className: 'w-7 h-7' })}
                        </NavLink>
                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-2 text-sm font-medium text-gray-900 bg-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                            {item.label}
                            <div className="absolute top-full left-1/2 -ml-1 w-2 h-2 bg-white transform rotate-45"></div>
                        </div>
                    </div>
                ))}
            </div>
        </footer>
    );
};

export default Dock;