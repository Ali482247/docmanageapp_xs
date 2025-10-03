// docmanageapp/components/Devonxona.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Correspondence } from '../types';
import { getCorrespondences } from '../services/api';
import CorrespondenceList from './CorrespondenceList';
import { UserRole } from '../constants';
import RoleSpecificDashboard from './RoleSpecificDashboard';

const Devonxona: React.FC = () => {
    const { user } = useAuth();
    const [correspondences, setCorrespondences] = useState<Correspondence[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'kiruvchi' | 'chiquvchi' | 'hisobot'>('kiruvchi');

    useEffect(() => {
        if (user && user.role !== UserRole.Resepshn) { // У Resepshn нет списка
            setLoading(true);
            getCorrespondences()
                .then(data => setCorrespondences(data))
                .catch(() => setError('Hujjatlarni yuklashda xatolik.'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user]);

    if (!user) return null; // Ожидаем загрузку пользователя

    // Для ролей с особым дашбордом
    if (user.role === UserRole.Resepshn || user.role === UserRole.BankKengashiKotibi || user.role === UserRole.KollegialOrganKotibi) {
        return <RoleSpecificDashboard user={user} />;
    }

    const filteredCorrespondences = correspondences.filter(c => {
        if (activeTab === 'kiruvchi') return c.type === 'Kiruvchi';
        if (activeTab === 'chiquvchi') return c.type === 'Chiquvchi';
        return false;
    });

    return (
        <div className="h-full flex flex-col text-white">
            {/* Header */}
            <header className="flex-shrink-0 flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-wider">DEVONXONA</h1>
                    <div className="flex items-center gap-2 text-white/50">
                        <button className="p-1 rounded-full hover:bg-white/10">&lt;</button>
                        <button className="p-1 rounded-full hover:bg-white/10">&gt;</button>
                    </div>
                </div>
                <div className="w-full max-w-xs">
                    <input 
                        type="text"
                        placeholder="Qidirish..."
                        className="w-full px-4 py-2 bg-black/20 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-grow flex gap-6 mt-6">
                {/* Sidebar */}
                <nav className="w-48 flex-shrink-0">
                    <ul className="space-y-2">
                        <li>
                            <button 
                                onClick={() => setActiveTab('kiruvchi')}
                                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'kiruvchi' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                            >
                                Kiruvchi
                            </button>
                        </li>
                        <li>
                             <button 
                                onClick={() => setActiveTab('chiquvchi')}
                                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'chiquvchi' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                            >
                                Chiquvchi
                            </button>
                        </li>
                        <li>
                             <button 
                                onClick={() => setActiveTab('hisobot')}
                                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'hisobot' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                            >
                                Hisobot
                            </button>
                        </li>
                    </ul>
                </nav>

                {/* Document List */}
                <div className="flex-grow">
                    {loading && <p>Yuklanmoqda...</p>}
                    {error && <p className="text-red-400">{error}</p>}
                    {!loading && !error && (
                        <CorrespondenceList correspondences={filteredCorrespondences} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Devonxona;