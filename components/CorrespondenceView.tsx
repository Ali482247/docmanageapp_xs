import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Correspondence, User } from '../types';
import { getCorrespondenceById, advanceStage, getUsers, assignExecutor, assignInternalEmployee } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../constants';
import { CorrespondenceStage } from '../constants';
import { ArrowLeftIcon, UserGroupIcon } from './icons/IconComponents';
import Deadline from './Deadline';
import DocumentEditorPreview from './DocumentEditorPreview';

const CorrespondenceView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [correspondence, setCorrespondence] = useState<Correspondence | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [users, setUsers] = useState<User[]>([]);

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedMainExecutor, setSelectedMainExecutor] = useState<number | undefined>(undefined);
    const [selectedInternalAssignee, setSelectedInternalAssignee] = useState<number | undefined>(undefined);


    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [docData, usersData] = await Promise.all([
                getCorrespondenceById(Number(id)),
                getUsers()
            ]);

            if (docData) {
                setCorrespondence(docData);
                setUsers(usersData);
                setSelectedInternalAssignee(docData.internalAssigneeId);
            } else {
                setError('Hujjat topilmadi.');
            }
        } catch (err) {
            setError('Hujjatni yuklashda xatolik yuz berdi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleAdvanceStage = async (nextStage: CorrespondenceStage) => {
        if (correspondence) {
            setLoading(true);
            try {
                const updatedDoc = await advanceStage(correspondence.id, nextStage);
                setCorrespondence(updatedDoc);
            } catch (err) {
                alert('Ошибка при изменении этапа!');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAssignExecutors = async () => {
        if (correspondence && selectedMainExecutor) {
            setLoading(true);
            try {
                const updatedDoc = await assignExecutor(correspondence.id, selectedMainExecutor);
                setCorrespondence(updatedDoc);
            } catch (err) {
                alert('Ошибка при назначении исполнителя!');
            } finally {
                setShowAssignModal(false);
                setLoading(false);
            }
        }
    };

    const handleAssignInternal = async () => {
        if (correspondence && selectedInternalAssignee) {
            setLoading(true);
            try {
                const updatedDoc = await assignInternalEmployee(correspondence.id, selectedInternalAssignee);
                setCorrespondence(updatedDoc);
            } catch (err) {
                alert('Ошибка при назначении внутреннего исполнителя!');
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) return <div className="text-center p-10">Hujjat yuklanmoqda...</div>;
    if (error) return <div className="text-center p-10 text-red-300">{error}</div>;
    if (!correspondence || !user) return null;

    const author = users.find(u => u.id === correspondence.authorId);
    const mainExecutor = users.find(u => u.id === correspondence.mainExecutorId);
    const internalAssignee = users.find(u => u.id === correspondence.internalAssigneeId);
    
    const canAssign = user.role === UserRole.Boshqaruv;
    // --- ИСПРАВЛЕНИЕ: Проверяем, что текущий пользователь - глава департамента (Tarmoq), ему назначена задача, и она на этапе исполнения ---
    const canDelegateInternal = user.role === UserRole.Tarmoq && correspondence.mainExecutorId === user.id && correspondence.stage === CorrespondenceStage.EXECUTION;

    return (
        <>
            <button
                onClick={() => navigate(-1)}
                className="fixed top-24 left-4 md:left-6 lg:left-8 z-40 flex items-center justify-center w-12 h-12 bg-black/30 backdrop-blur-xl border border-white/20 rounded-full shadow-lg text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 group"
            >
                <ArrowLeftIcon className="w-6 h-6" />
            </button>

            <div className="p-6 rounded-2xl shadow-lg backdrop-blur-md bg-white/10 border border-white/20 text-white">
                <div className="grid grid-cols-1 gap-8 mt-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <h1 className="text-3xl font-bold">{correspondence.title}</h1>
                        <p className="text-white/70">Manba: {correspondence.source || 'Noma\'lum'}</p>
                        <h2 className="mt-6 mb-4 text-xl font-semibold">Hujjat matni</h2>
                        <DocumentEditorPreview content={correspondence.content || ''} />
                    </div>
                    <div>
                        <div className="p-4 border border-white/20 rounded-lg bg-black/20">
                            <h3 className="text-lg font-semibold">Ma'lumotlar</h3>
                            <ul className="mt-2 space-y-2 text-sm">
                                <li><strong>Joriy Bosqich:</strong> {correspondence.stage}</li>
                                <li><strong>Yaratildi:</strong> {new Date(correspondence.createdAt).toLocaleString()}</li>
                                <li><strong>Muallif:</strong> {author?.name || 'Noma\'lum'}</li>
                                <li><strong>Asosiy Ijrochi:</strong> {mainExecutor?.name || 'Tayinlanmagan'}</li>
                                <li><strong>Ichki Ijrochi:</strong> {internalAssignee?.name || 'Tayinlanmagan'}</li>
                            </ul>
                        </div>
                        
                        {canAssign && (
                            <div className="p-4 mt-6 border border-white/20 rounded-lg bg-black/20">
                                <h3 className="text-lg font-semibold">Harakatlar</h3>
                                <button
                                    onClick={() => setShowAssignModal(true)}
                                    className="w-full mt-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <UserGroupIcon className="w-5 h-5" />
                                    Ijrochini tayinlash
                                </button>
                            </div>
                        )}
                        
                        {canDelegateInternal && (
                            <div className="p-4 mt-6 border border-white/20 rounded-lg bg-black/20">
                                <h3 className="text-lg font-semibold">Ichki ijrochini tayinlash</h3>
                                <div className="mt-2 space-y-2">
                                    <select onChange={(e) => setSelectedInternalAssignee(Number(e.target.value))} value={selectedInternalAssignee || ""} className="w-full p-2 border rounded-md bg-white/10 border-white/20 text-white">
                                        <option value="" disabled>Xodimni tanlang...</option>
                                        {users.filter(u => u.department === user.department && u.role === UserRole.Reviewer).map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                    <button onClick={handleAssignInternal} disabled={!selectedInternalAssignee} className="w-full px-4 py-2 mt-2 text-white bg-primary rounded-lg hover:bg-primary-dark disabled:bg-white/20">Tasdiqlash</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="p-6 text-white bg-black/20 border rounded-2xl shadow-xl backdrop-blur-xl border-white/20 w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-4">Asosiy ijrochini tayinlash</h2>
                        <select onChange={(e) => setSelectedMainExecutor(Number(e.target.value))} value={selectedMainExecutor || ""} className="w-full p-2 border rounded-md bg-white/10 border-white/20 text-white">
                            <option value="" disabled>Tanlang...</option>
                            {users.filter(u => u.role === UserRole.Tarmoq).map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.department})</option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">Bekor qilish</button>
                            <button onClick={handleAssignExecutors} disabled={!selectedMainExecutor} className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary-dark disabled:bg-white/20">Tasdiqlash</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CorrespondenceView;