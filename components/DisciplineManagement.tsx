import React, { useEffect, useState } from 'react';
import { User, Violation, Correspondence } from '../types';
import { getUsers, getAllViolations, createViolation, getCorrespondences } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../constants';
import { Navigate, Link } from 'react-router-dom';
import { PlusIcon } from './icons/IconComponents';

// Типы нарушений для формы
const VIOLATION_TYPES = ['Ogohlantirish', 'Hayfsan', 'Oylikning 30% ushlab qolish', 'Oylikning 50% ushlab qolish', 'Shartnomani bekor qilish'];

const DisciplineManagement: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [violations, setViolations] = useState<Violation[]>([]);
    const [correspondences, setCorrespondences] = useState<Correspondence[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

    // Состояния для модального окна
    const [isModalOpen, setIsModalOpen] = useState(false);
    const emptyForm = {
        userId: '',
        date: new Date().toISOString().split('T')[0], // Сегодняшняя дата
        reason: '',
        type: VIOLATION_TYPES[0],
        correspondenceId: ''
    };
    const [formData, setFormData] = useState(emptyForm);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [userData, violationData, correspondenceData] = await Promise.all([
                getUsers(), 
                getAllViolations(),
                getCorrespondences() // Загружаем документы для привязки
            ]);
            setUsers(userData.filter((u: User) => u.role !== UserRole.Admin)); // Не показываем админа в списке
            setViolations(violationData);
            setCorrespondences(correspondenceData);
        } catch (err) {
            setError('Ma`lumotlarni yuklashda xatolik.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Группируем нарушения по ID пользователя для удобного доступа
    const violationsByUser = violations.reduce((acc, violation) => {
        (acc[violation.user.id] = acc[violation.user.id] || []).push(violation);
        return acc;
    }, {} as Record<number, Violation[]>);

    const handleOpenModal = () => {
        setFormData(emptyForm);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createViolation({
                ...formData,
                userId: Number(formData.userId),
                correspondenceId: formData.correspondenceId ? Number(formData.correspondenceId) : null,
            });
            handleCloseModal();
            fetchData(); // Обновляем данные после добавления
        } catch (err: any) {
            alert(`Xatolik: ${err.message}`);
        }
    };

    if (!currentUser || ![UserRole.Admin, UserRole.BankApparati, UserRole.Boshqaruv].includes(currentUser.role as UserRole)) {
        return <Navigate to="/dashboard" />;
    }

    if (loading) return <div className="text-center p-10">Yuklanmoqda...</div>;
    if (error) return <div className="text-center p-10 text-red-300">{error}</div>;

    return (
        <>
            <div className="space-y-6 text-white">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Ijro Intizomi Nazorati</h1>
                    {currentUser.role === UserRole.Admin && (
                        <button onClick={handleOpenModal} className="flex items-center gap-2 px-4 py-2 text-white bg-primary rounded-lg shadow hover:bg-primary-dark transition-colors">
                            <PlusIcon className="w-5 h-5" />
                            <span>Qo'shish</span>
                        </button>
                    )}
                </div>
                <div className="overflow-hidden rounded-2xl shadow-lg backdrop-blur-md bg-white/10 border border-white/20">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-white/80">
                            <thead className="text-xs text-white/90 uppercase bg-white/10">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Xodim</th>
                                    <th scope="col" className="px-6 py-3">Departament</th>
                                    <th scope="col" className="px-6 py-3 text-center">Qoidabuzarliklar soni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => {
                                    const userViolations = violationsByUser[u.id] || [];
                                    const isExpanded = expandedUserId === u.id;
                                    return (
                                        <React.Fragment key={u.id}>
                                            <tr 
                                                className="border-b border-white/10 hover:bg-white/20 cursor-pointer"
                                                onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                                            >
                                                <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                                                <td className="px-6 py-4">{u.department}</td>
                                                <td className={`px-6 py-4 text-center font-bold text-lg ${userViolations.length > 0 ? 'text-amber-400' : 'text-green-400'}`}>{userViolations.length}</td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="bg-slate-900/30">
                                                    <td colSpan={3} className="p-4">
                                                        <h4 className="font-bold mb-2">{u.name} - Qoidabuzarliklar tarixi</h4>
                                                        {userViolations.length > 0 ? (
                                                            <ul className="space-y-2 list-disc list-inside text-sm">
                                                                {userViolations.map(v => (
                                                                    <li key={v.id}>
                                                                        <span className="font-semibold">{new Date(v.date).toLocaleDateString()}:</span> 
                                                                        <span className="mx-2 text-red-300">({v.type})</span>
                                                                        <span>{v.reason}</span>
                                                                        {v.correspondence && (
                                                                            <Link to={`/correspondence/${v.correspondence.id}`} className="ml-2 text-cyan-400 hover:underline">
                                                                                (Hujjat: {v.correspondence.title})
                                                                            </Link>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-sm text-white/70">Bu xodim uchun qoidabuzarliklar qayd etilmagan.</p>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" role="dialog" aria-modal="true">
                    <div className="w-full max-w-lg p-6 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl text-white">
                        <h2 className="mb-6 text-2xl font-bold">Yangi qoidabuzarlik qo'shish</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="userId" className="block mb-1 text-sm font-medium text-white/80">Xodim</label>
                                    <select name="userId" id="userId" value={formData.userId} onChange={handleChange} required className="w-full p-2 bg-white/10 border border-white/20 rounded-md">
                                        <option value="" disabled>Xodimni tanlang...</option>
                                        {users.map(u => <option key={u.id} value={u.id} className="text-black">{u.name} ({u.department})</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="date" className="block mb-1 text-sm font-medium text-white/80">Sana</label>
                                        <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="w-full p-2 bg-white/10 border border-white/20 rounded-md" />
                                    </div>
                                    <div>
                                        <label htmlFor="type" className="block mb-1 text-sm font-medium text-white/80">Chora turi</label>
                                        <select name="type" id="type" value={formData.type} onChange={handleChange} required className="w-full p-2 bg-white/10 border border-white/20 rounded-md">
                                            {VIOLATION_TYPES.map(t => <option key={t} value={t} className="text-black">{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="correspondenceId" className="block mb-1 text-sm font-medium text-white/80">Aloqador hujjat (ixtiyoriy)</label>
                                    <select name="correspondenceId" id="correspondenceId" value={formData.correspondenceId} onChange={handleChange} className="w-full p-2 bg-white/10 border border-white/20 rounded-md">
                                        <option value="">Hujjatni tanlang...</option>
                                        {correspondences.map(c => <option key={c.id} value={c.id} className="text-black">#{c.id} - {c.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="reason" className="block mb-1 text-sm font-medium text-white/80">Sababi</label>
                                    <textarea name="reason" id="reason" value={formData.reason} onChange={handleChange} required rows={3} className="w-full p-2 bg-white/10 border border-white/20 rounded-md" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">Bekor qilish</button>
                                <button type="submit" className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary-dark">Saqlash</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default DisciplineManagement;