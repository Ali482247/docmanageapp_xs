import React, { useState } from 'react';
import { User } from '../types';
import { UserRole } from '../constants';
import { createIncomingTask } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { DocumentIcon } from './icons/IconComponents';

interface RoleSpecificDashboardProps {
    user: User;
}

const RoleSpecificDashboard: React.FC<RoleSpecificDashboardProps> = ({ user }) => {

    const renderReceptionDashboard = () => {
        const [title, setTitle] = useState('');
        const [content, setContent] = useState('');
        const [loading, setLoading] = useState(false);
        const [success, setSuccess] = useState('');
        
        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);
            setSuccess('');
            try {
                // --- ИЗМЕНЕНИЕ: Убираем 4-й аргумент 'authUser' ---
                await createIncomingTask(title, content, "Fuqaro murojaati (Resepshn)");
                setSuccess('Murojaat muvaffaqiyatli ro\'yxatga olindi va Bank apparatiga yuborildi.');
                setTitle('');
                setContent('');
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        return (
            <div className="max-w-2xl mx-auto">
                 <h1 className="text-3xl font-bold">Fuqaro Murojaatini Ro'yxatga Olish</h1>
                 <p className="text-white/80 mb-6">Yangi murojaat ma'lumotlarini kiriting.</p>
                 <div className="p-6 rounded-2xl shadow-lg backdrop-blur-md bg-white/10 border border-white/20">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block mb-1 text-sm font-medium text-white/80">Murojaat sarlavhasi / Mavzusi</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 bg-white/10 border border-white/20 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="content" className="block mb-1 text-sm font-medium text-white/80">Murojaatning qisqacha mazmuni</label>
                            <textarea id="content" value={content} onChange={e => setContent(e.target.value)} required rows={6} className="w-full p-2 bg-white/10 border border-white/20 rounded-md" />
                        </div>
                        {success && <p className="text-sm text-emerald-300">{success}</p>}
                        <div className="flex justify-end">
                            <button type="submit" disabled={loading} className="px-6 py-2 text-white bg-primary rounded-lg hover:bg-primary-dark disabled:bg-opacity-50">
                                {loading ? 'Yuborilmoqda...' : 'Yuborish'}
                            </button>
                        </div>
                    </form>
                 </div>
            </div>
        );
    }

    const renderSecretaryDashboard = (secretaryType: string) => {
         const [title, setTitle] = useState('');
         const [content, setContent] = useState('');
         const [loading, setLoading] = useState(false);
         const [success, setSuccess] = useState('');
         
         const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);
            setSuccess('');
            try {
                // --- ИЗМЕНЕНИЕ: Убираем 4-й аргумент 'authUser' ---
                await createIncomingTask(title, content, secretaryType);
                setSuccess('Topshiriq muvaffaqiyatli tizimga kiritildi va Bank apparatiga yuborildi.');
                setTitle('');
                setContent('');
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        return (
             <div className="max-w-2xl mx-auto">
                 <h1 className="text-3xl font-bold">{secretaryType} Topshirig'ini Kiritish</h1>
                 <p className="text-white/80 mb-6">Yig'ilish bayonnomasi yoki topshiriq ma'lumotlarini kiriting.</p>
                 <div className="p-6 rounded-2xl shadow-lg backdrop-blur-md bg-white/10 border border-white/20">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block mb-1 text-sm font-medium text-white/80">Bayonnoma / Topshiriq Sarlavhasi</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 bg-white/10 border border-white/20 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="content" className="block mb-1 text-sm font-medium text-white/80">Topshiriqning to'liq matni</label>
                            <textarea id="content" value={content} onChange={e => setContent(e.target.value)} required rows={10} className="w-full p-2 bg-white/10 border border-white/20 rounded-md" />
                        </div>
                        {success && <p className="text-sm text-emerald-300">{success}</p>}
                        <div className="flex justify-end">
                            <button type="submit" disabled={loading} className="px-6 py-2 text-white bg-primary rounded-lg hover:bg-primary-dark disabled:bg-opacity-50">
                                {loading ? 'Yuborilmoqda...' : 'Yuborish'}
                            </button>
                        </div>
                    </form>
                 </div>
            </div>
        )
    }

    const renderDefault = () => (
        <div className="text-center">
            <DocumentIcon className="w-24 h-24 mx-auto text-white/50" />
            <h1 className="mt-4 text-3xl font-bold">Xush kelibsiz, {user.name}</h1>
            <p className="text-white/80">Sizning rolingiz uchun maxsus boshqaruv paneli mavjud emas.</p>
        </div>
    );
    
    switch (user.role) {
        case UserRole.Resepshn:
            return renderReceptionDashboard();
        case UserRole.BankKengashiKotibi:
            return renderSecretaryDashboard("Bank Kengashi");
        case UserRole.KollegialOrganKotibi:
            return renderSecretaryDashboard("Kollegial Organ");
        default:
            return renderDefault();
    }
}

export default RoleSpecificDashboard;