
import React, { useEffect, useState } from 'react';
import { User, Violation, Correspondence } from '../types';
import { getUsers, getAllViolations, MOCK_CORRESPONDENCES } from '../services/mockApi';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../constants';
import { Navigate, Link } from 'react-router-dom';

const DisciplineManagement: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [violations, setViolations] = useState<Violation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userData, violationData] = await Promise.all([getUsers(), getAllViolations()]);
                setUsers(userData);
                setViolations(violationData);
            } catch (err) {
                setError('Ma`lumotlarni yuklashda xatolik.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getViolationsForUser = (userId: number) => {
        return violations.filter(v => v.userId === userId);
    };

    const getRecommendedAction = (violationCount: number): Violation['type'] | 'Ma`qul' => {
        switch (violationCount) {
            case 0: return 'Ma`qul';
            case 1: return 'Ogohlantirish';
            case 2: return 'Hayfsan';
            case 3: return 'Oylikning 30% ushlab qolish';
            case 4: return 'Oylikning 50% ushlab qolish';
            default: return 'Shartnomani bekor qilish';
        }
    };

    const getCorrespondenceTitle = (correspondenceId?: number) => {
        if (!correspondenceId) return 'Noma`lum hujjat';
        return MOCK_CORRESPONDENCES.find(c => c.id === correspondenceId)?.title || `Hujjat #${correspondenceId}`;
    }

    if (!user || ![UserRole.Admin, UserRole.BankApparati, UserRole.Boshqaruv].includes(user.role as UserRole)) {
        return <Navigate to="/dashboard" />;
    }

    if (loading) return <div className="text-center p-10">Yuklanmoqda...</div>;
    if (error) return <div className="text-center p-10 text-red-300">{error}</div>;

    return (
        <div className="space-y-6 text-white">
            <h1 className="text-3xl font-bold">Ijro Intizomi Nazorati</h1>
            <div className="overflow-hidden rounded-2xl shadow-lg backdrop-blur-md bg-white/10 border border-white/20">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-white/80">
                        <thead className="text-xs text-white/90 uppercase bg-white/10">
                            <tr>
                                <th scope="col" className="px-6 py-3">Xodim</th>
                                <th scope="col" className="px-6 py-3">Departament</th>
                                <th scope="col" className="px-6 py-3 text-center">Qoidabuzarliklar soni</th>
                                <th scope="col" className="px-6 py-3">Tavsiya etilgan chora</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.filter(u => u.role !== UserRole.Admin).map(u => {
                                const userViolations = getViolationsForUser(u.id);
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
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${userViolations.length > 2 ? 'bg-red-500/50 text-red-100' : 'bg-green-500/50 text-green-100'}`}>
                                                    {getRecommendedAction(userViolations.length + 1)}
                                                </span>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-slate-900/30">
                                                <td colSpan={4} className="p-4">
                                                    <h4 className="font-bold mb-2">{u.name} - Qoidabuzarliklar tarixi</h4>
                                                    {userViolations.length > 0 ? (
                                                        <ul className="space-y-2 list-disc list-inside text-sm">
                                                            {userViolations.map(v => (
                                                                <li key={v.id}>
                                                                    <span className="font-semibold">{new Date(v.date).toLocaleDateString()}:</span> 
                                                                    <span className="mx-2 text-red-300">({v.type})</span>
                                                                    <span>{v.reason}</span>
                                                                    <Link to={`/correspondence/${v.correspondenceId}`} className="ml-2 text-cyan-400 hover:underline">(Hujjatni ko'rish)</Link>
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
    );
};

export default DisciplineManagement;
