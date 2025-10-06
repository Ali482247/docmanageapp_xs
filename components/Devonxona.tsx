// components/Devonxona.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Correspondence } from '../types';
import { getCorrespondences } from '../services/api';
import { UserRole } from '../constants';
import RoleSpecificDashboard from './RoleSpecificDashboard';
import DocumentCard from './DocumentCard';
import CreateCorrespondenceModal from './CreateCorrespondenceModal';
import { PlusIcon, SearchIcon } from './icons/IconComponents';

const KARTOTEKA_ITEMS = [
    "Barchasi", "Markaziy Bank", "Murojaatlar", "Prezident Administratsiyasi",
    "Vazirlar Mahkamasi", "Xizmat yozishmalari", "Nazoratdagi",
];

const Devonxona: React.FC = () => {
    const { user } = useAuth();
    const [correspondences, setCorrespondences] = useState<Correspondence[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [activeTab, setActiveTab] = useState<'kiruvchi' | 'chiquvchi'>('kiruvchi');
    const [activeKartoteka, setActiveKartoteka] = useState('Barchasi');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    const fetchData = () => {
        if (!user) return;
        setLoading(true);
        setError('');
        getCorrespondences()
            .then(data => {
                setCorrespondences(data || []); // Гарантируем, что всегда будет массив
            })
            .catch((err) => {
                console.error(err);
                setError('Hujjatlarni yuklashda xatolik yuz berdi.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (user && ![UserRole.Resepshn, UserRole.BankKengashiKotibi, UserRole.KollegialOrganKotibi].includes(user.role as UserRole)) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const filteredCorrespondences = useMemo(() => {
        if (!Array.isArray(correspondences)) return [];

        return correspondences
            .filter(c => (c.type || '').toLowerCase() === activeTab)
            .filter(c => {
                 if (activeKartoteka === 'Barchasi') return true;
                 return c.kartoteka === activeKartoteka;
            })
            .filter(c => {
                const search = searchTerm.toLowerCase();
                if (!search) return true;
                const titleMatch = (c.title || '').toLowerCase().includes(search);
                const contentMatch = (c.content || '').toLowerCase().includes(search);
                const executorMatch = (c.mainExecutor?.name || '').toLowerCase().includes(search);
                return titleMatch || contentMatch || executorMatch;
            });
    }, [correspondences, activeTab, activeKartoteka, searchTerm]);

    if (!user) return null;

    if ([UserRole.Resepshn, UserRole.BankKengashiKotibi, UserRole.KollegialOrganKotibi].includes(user.role as UserRole)) {
        return <RoleSpecificDashboard user={user} />;
    }

    return (
        <>
            <div className="flex flex-col h-full text-white">
                <header className="flex-shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-wider">DEVONXONA</h1>
                        <p className="text-white/60">Sizda {filteredCorrespondences.length} ta hujjat mavjud</p>
                    </div>
                    <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-full sm:w-64">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="text"
                                placeholder="Hujjatni qidirish..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-black/20 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <button 
                            onClick={() => setCreateModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-white bg-primary rounded-full shadow hover:bg-primary-dark transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Yangi hujjat</span>
                        </button>
                    </div>
                </header>

                <div className="flex-grow flex gap-8 mt-4 overflow-hidden">
                    <aside className="w-60 flex-shrink-0 pr-4 border-r border-white/10 overflow-y-auto">
                        <h2 className="text-sm font-semibold uppercase text-white/50 mb-4">Hujjat turi</h2>
                        <ul className="space-y-2 mb-8">
                            <li>
                                <button
                                    onClick={() => setActiveTab('kiruvchi')}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors text-base font-medium ${activeTab === 'kiruvchi' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10'}`}
                                >
                                    Kiruvchi
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('chiquvchi')}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors text-base font-medium ${activeTab === 'chiquvchi' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10'}`}
                                >
                                    Chiquvchi
                                </button>
                            </li>
                        </ul>
                        <h2 className="text-sm font-semibold uppercase text-white/50 mb-4">Kartoteka</h2>
                        <ul className="space-y-1">
                            {KARTOTEKA_ITEMS.map(item => (
                                <li key={item}>
                                    <button
                                        onClick={() => setActiveKartoteka(item)}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${activeKartoteka === item ? 'bg-white/5 text-cyan-300' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        {item}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <main className="flex-grow overflow-y-auto">
                        {loading && <p className="text-center pt-10">Hujjatlar yuklanmoqda...</p>}
                        {error && <p className="text-center pt-10 text-red-400">{error}</p>}
                        {!loading && !error && (
                            <>
                                {filteredCorrespondences.length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                                        {filteredCorrespondences.map(doc => (
                                            <DocumentCard key={doc.id} document={doc} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-white/60">
                                        <p className="text-lg">Hujjatlar topilmadi</p>
                                        <p className="text-sm">Filterlarni o'zgartirib ko'ring.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
            {isCreateModalOpen && (
                <CreateCorrespondenceModal 
                    onClose={() => setCreateModalOpen(false)}
                    onSuccess={fetchData}
                />
            )}
        </>
    );
};

export default Devonxona;