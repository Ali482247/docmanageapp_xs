// C:\Users\aliak\Desktop\Док-оборот\docmanageapp\components\CorrespondenceView.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Correspondence, User } from '../types';
import { 
    getCorrespondenceById, getUsers, assignInternalEmployee, 
    submitForReview, approveReview, rejectReview, signDocument, dispatchDocument,
    holdCorrespondence, cancelCorrespondence, updateDeadline, updateExecutors
} from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { UserRole, CorrespondenceStage, getStageDisplayName } from '../constants';
import { 
    ArrowLeftIcon, UserGroupIcon, PaperAirplaneIcon, CheckBadgeIcon, CheckIcon, 
    ClockIcon, XMarkIcon, XCircleIcon, PencilIcon, CheckCircleIcon, UsersIcon,
    PauseIcon, ArchiveBoxXMarkIcon, CalendarDaysIcon
} from './icons/IconComponents';
import DocumentEditorPreview from './DocumentEditorPreview';
import AIAssistant from './AIAssistant';

// Вспомогательный компонент для отображения статуса
const StatusBadge: React.FC<{ status?: 'PENDING' | 'APPROVED' | 'REJECTED' }> = ({ status }) => {
    if (status === 'APPROVED') return <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckIcon className="w-4 h-4" /> Tasdiqlangan</span>;
    if (status === 'REJECTED') return <span className="flex items-center gap-1 text-xs text-red-400"><XMarkIcon className="w-4 h-4" /> Rad etilgan</span>;
    return <span className="flex items-center gap-1 text-xs text-amber-400"><ClockIcon className="w-4 h-4" /> Kutilmoqda</span>;
};

const CorrespondenceView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [correspondence, setCorrespondence] = useState<Correspondence | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [users, setUsers] = useState<User[]>([]);

    const [isExecutorsModalOpen, setIsExecutorsModalOpen] = useState(false);
    const [selectedMainExecutor, setSelectedMainExecutor] = useState<number | undefined>(undefined);
    const [selectedCoExecutors, setSelectedCoExecutors] = useState<number[]>([]);
    const [selectedContributors, setSelectedContributors] = useState<number[]>([]);
    
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
    
    // --- WORKFLOW ФУНКЦИИ ---
    const handleAssignInternal = async () => {
        if (correspondence && selectedInternalAssignee) {
            setLoading(true);
            try {
                const updatedDoc = await assignInternalEmployee(correspondence.id, selectedInternalAssignee);
                setCorrespondence(updatedDoc);
            } catch (err: any) { alert(`Xatolik: ${err.message}`); }
            finally { setLoading(false); }
        }
    };

    const handleSubmitForReview = async () => {
        if (correspondence) {
            setLoading(true);
            try {
                await submitForReview(correspondence.id);
                fetchData();
            } catch(err: any) { alert(`Xatolik: ${err.message}`); }
            finally { setLoading(false); }
        }
    };

    const handleApproveReview = async () => {
        if (correspondence) {
            setLoading(true);
            try {
                const result = await approveReview(correspondence.id);
                if (result.id) {
                    setCorrespondence(result);
                } else {
                    fetchData(); 
                }
            } catch(err: any) { alert(`Xatolik: ${err.message}`); }
            finally { setLoading(false); }
        }
    }

    const handleRejectReview = async () => {
        if (correspondence) {
            const comment = prompt("Rad etish sababini kiriting:");
            if (comment) { 
                setLoading(true);
                try {
                    const updatedDoc = await rejectReview(correspondence.id, comment);
                    setCorrespondence(updatedDoc);
                } catch(err: any) {
                    alert(`Xatolik: ${err.message}`);
                } finally {
                    setLoading(false);
                }
            }
        }
    };
    
    const handleSignDocument = async () => {
        if (correspondence) {
            setLoading(true);
            try {
                const updatedDoc = await signDocument(correspondence.id);
                setCorrespondence(updatedDoc);
            } catch (err: any) {
                alert(`Xatolik: ${err.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDispatchDocument = async () => {
        if (correspondence) {
            setLoading(true);
            try {
                const updatedDoc = await dispatchDocument(correspondence.id);
                setCorrespondence(updatedDoc);
            } catch (err: any) {
                alert(`Xatolik: ${err.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleHold = async () => {
        if (correspondence && window.confirm("Haqiqatan ham ushbu hujjatni 'Pauza' holatiga o'tkazmoqchimisiz?")) {
            setLoading(true);
            try {
                const updatedDoc = await holdCorrespondence(correspondence.id);
                setCorrespondence(updatedDoc);
            } catch (err: any) { alert(`Xatolik: ${err.message}`); }
            finally { setLoading(false); }
        }
    };

    const handleCancel = async () => {
        const reason = prompt("Hujjatni bekor qilish sababini kiriting:");
        if (correspondence && reason) {
            setLoading(true);
            try {
                const updatedDoc = await cancelCorrespondence(correspondence.id);
                setCorrespondence(updatedDoc);
            } catch (err: any) { alert(`Xatolik: ${err.message}`); }
            finally { setLoading(false); }
        }
    };

    const handleUpdateDeadline = async () => {
        const newDeadline = prompt("Yangi muddatni kiriting (YYYY-MM-DD):", correspondence?.deadline?.split('T')[0] || '');
        if (correspondence && newDeadline) {
            setLoading(true);
            try {
                const updatedDoc = await updateDeadline(correspondence.id, { deadline: newDeadline });
                setCorrespondence(updatedDoc);
            } catch (err: any) { alert(`Xatolik: ${err.message}`); }
            finally { setLoading(false); }
        }
    };

    const handleOpenExecutorsModal = () => {
        if (!correspondence) return;
        setSelectedMainExecutor(correspondence.mainExecutorId);
        setSelectedCoExecutors(correspondence.coExecutors?.map(u => u.user.id) || []);
        setSelectedContributors(correspondence.contributors?.map(u => u.user.id) || []);
        setIsExecutorsModalOpen(true);
    };

    const handleUpdateExecutors = async () => {
        if (!correspondence || !selectedMainExecutor) {
            alert("Asosiy ijrochini tanlang!");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                mainExecutorId: selectedMainExecutor,
                coExecutorIds: selectedCoExecutors,
                contributorIds: selectedContributors,
            };
            const updatedDoc = await updateExecutors(correspondence.id, payload);
            setCorrespondence(updatedDoc);
        } catch (err: any) { alert(`Xatolik: ${err.message}`); }
        finally {
            setIsExecutorsModalOpen(false);
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-10">Hujjat yuklanmoqda...</div>;
    if (error) return <div className="text-center p-10 text-red-300">{error}</div>;
    if (!correspondence || !currentUser) return null;
    
    // --- ЛОГИКА ОТОБРАЖЕНИЯ КНОПОК ---
    const isDocActive = ![CorrespondenceStage.COMPLETED, CorrespondenceStage.CANCELLED, CorrespondenceStage.ON_HOLD].includes(correspondence.stage as CorrespondenceStage);
    const canManage = [UserRole.Admin, UserRole.Boshqaruv, UserRole.BankApparati].includes(currentUser.role as UserRole);
    const canDelegateInternal = currentUser.role === UserRole.Tarmoq && correspondence.mainExecutor?.id === currentUser.id && correspondence.stage === CorrespondenceStage.EXECUTION;
    const isOwnerOrExecutor = currentUser.id === correspondence.mainExecutor?.id || currentUser.id === correspondence.author.id;
    const canSubmitForReview = isOwnerOrExecutor && [CorrespondenceStage.DRAFTING, CorrespondenceStage.REVISION_REQUESTED, CorrespondenceStage.EXECUTION].includes(correspondence.stage as CorrespondenceStage);
    const isUserAReviewer = correspondence.reviewers?.some(r => r.user.id === currentUser.id && r.status === 'PENDING');
    const canApproveOrReject = correspondence.stage === CorrespondenceStage.FINAL_REVIEW && isUserAReviewer;
    const canSign = currentUser.role === UserRole.Boshqaruv && correspondence.stage === CorrespondenceStage.SIGNATURE;
    const canDispatch = currentUser.role === UserRole.BankApparati && correspondence.stage === CorrespondenceStage.DISPATCH;
    
    return (
        <>
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 z-10 flex items-center justify-center w-10 h-10 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
                <ArrowLeftIcon className="w-6 h-6" />
            </button>

            <div className="p-6 rounded-2xl shadow-lg bg-white/5 border border-white/10 text-white">
                <div className="grid grid-cols-1 gap-8 mt-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <h1 className="text-3xl font-bold">{correspondence.title}</h1>
                        <p className="text-white/70">Manba: {correspondence.source || 'Noma\'lum'}</p>
                        <h2 className="mt-6 mb-4 text-xl font-semibold">Hujjat matni</h2>
                        <DocumentEditorPreview content={correspondence.content || ''} />
                    </div>
                    <div className="space-y-6">
                        <AIAssistant 
                            content={correspondence.content || ''}
                            title={correspondence.title}
                            source={correspondence.source || ''}
                        />
                        <div className="p-4 border border-white/20 rounded-lg bg-black/20">
                            <h3 className="text-lg font-semibold mb-4">Ma'lumotlar</h3>
                            <div className="space-y-4 text-sm">
                                <div className="pb-3 border-b border-white/10">
                                    <p className="text-xs uppercase text-white/50 tracking-wider">Joriy Bosqich</p>
                                    <p className="font-medium text-white/90">{getStageDisplayName(correspondence.stage)}</p>
                                </div>
                                <div className="pb-3 border-b border-white/10">
                                    <p className="text-xs uppercase text-white/50 tracking-wider">Yaratildi</p>
                                    <p className="font-medium text-white/90">{new Date(correspondence.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="pb-3 border-b border-white/10">
                                    <p className="text-xs uppercase text-white/50 tracking-wider">Muallif</p>
                                    <p className="font-medium text-white/90">{correspondence.author?.name || 'Noma\'lum'}</p>
                                </div>
                                <div className="pb-3 border-b border-white/10">
                                    <p className="text-xs uppercase text-white/50 tracking-wider">Asosiy Ijrochi</p>
                                    <p className="font-medium text-white/90">{correspondence.mainExecutor?.name || 'Tayinlanmagan'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-white/50 tracking-wider">Ichki Ijrochi</p>
                                    <p className="font-medium text-white/90">{correspondence.internalAssignee?.name || 'Tayinlanmagan'}</p>
                                </div>
                            </div>
                        </div>
                        
                        {correspondence.reviewers && correspondence.reviewers.length > 0 && (
                            <div className="p-4 border border-white/20 rounded-lg bg-black/20">
                                <h3 className="text-lg font-semibold">Kelishuvchilar</h3>
                                <ul className="mt-3 space-y-3">
                                    {correspondence.reviewers.map(reviewer => (
                                        <li key={reviewer.user.id} className="flex justify-between items-center text-sm">
                                            <span className="text-white/80">{reviewer.user.name}</span>
                                            <StatusBadge status={reviewer.status} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        <div className="p-4 border border-white/20 rounded-lg bg-black/20">
                            <h3 className="text-lg font-semibold">Harakatlar</h3>
                            <div className="mt-2 space-y-2">
                                {canSubmitForReview && isDocActive && ( <button onClick={handleSubmitForReview} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"> <PaperAirplaneIcon className="w-5 h-5" /> Kelishuvga yuborish </button> )}
                                {canApproveOrReject && isDocActive && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={handleRejectReview} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"> <XCircleIcon className="w-5 h-5" /> Rad etish </button>
                                        <button onClick={handleApproveReview} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"> <CheckBadgeIcon className="w-5 h-5" /> Tasdiqlash </button>
                                    </div>
                                )}
                                {canSign && isDocActive && ( <button onClick={handleSignDocument} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"> <PencilIcon className="w-5 h-5" /> Imzolash </button> )}
                                {canDispatch && isDocActive && ( <button onClick={handleDispatchDocument} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-sky-600 rounded-lg hover:bg-sky-700"> <CheckCircleIcon className="w-5 h-5" /> Jo'natish / Yakunlash </button> )}
                                {canManage && isDocActive && (
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                                        <button onClick={handleOpenExecutorsModal} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"> <UsersIcon className="w-5 h-5" /> Ijrochilar </button>
                                        <button onClick={handleUpdateDeadline} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-amber-600 rounded-lg hover:bg-amber-700"> <CalendarDaysIcon className="w-5 h-5" /> Muddat </button>
                                        <button onClick={handleHold} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-slate-600 rounded-lg hover:bg-slate-700"> <PauseIcon className="w-5 h-5" /> Pauza </button>
                                        <button onClick={handleCancel} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-rose-600 rounded-lg hover:bg-rose-700"> <ArchiveBoxXMarkIcon className="w-5 h-5" /> Bekor qilish </button>
                                    </div>
                                )}
                                {canDelegateInternal && isDocActive && (
                                    <>
                                        <h4 className="text-md font-semibold pt-2">Ichki ijrochini tayinlash</h4>
                                        <select onChange={(e) => setSelectedInternalAssignee(Number(e.target.value))} value={selectedInternalAssignee || ""} className="w-full p-2 border rounded-md bg-white/10 border-white/20 text-white">
                                            <option value="" disabled>Xodimni tanlang...</option>
                                            {users.filter(u => u.department === currentUser.department && u.role === UserRole.Reviewer).map(u => (
                                                <option key={u.id} value={u.id}>{u.name}</option>
                                            ))}
                                        </select>
                                        <button onClick={handleAssignInternal} disabled={!selectedInternalAssignee} className="w-full px-4 py-2 mt-2 text-white bg-primary rounded-lg hover:bg-primary-dark disabled:bg-white/20">Tasdiqlash</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isExecutorsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setIsExecutorsModalOpen(false)}>
                    <div className="w-full max-w-2xl p-6 text-white bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-4">Ijrochilarni Tahrirlash</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-white/80">Asosiy Ijrochi (Majburiy)</label>
                                <select value={selectedMainExecutor} onChange={(e) => setSelectedMainExecutor(Number(e.target.value))} className="w-full p-2 bg-white/10 border border-white/20 rounded-md">
                                    <option value="" disabled>Tanlang...</option>
                                    {users.filter(u => u.role === UserRole.Tarmoq).map(u => <option key={u.id} value={u.id} className="text-black">{u.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-white/80">Qo'shimcha Ijrochilar</label>
                                <select multiple value={selectedCoExecutors.map(String)} onChange={(e) => setSelectedCoExecutors(Array.from(e.target.selectedOptions, option => Number(option.value)))} className="w-full p-2 h-32 bg-white/10 border border-white/20 rounded-md">
                                    {users.filter(u => u.role === UserRole.Tarmoq).map(u => <option key={u.id} value={u.id} className="text-black p-1">{u.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-white/80">Ishtirokchilar</label>
                                <select multiple value={selectedContributors.map(String)} onChange={(e) => setSelectedContributors(Array.from(e.target.selectedOptions, option => Number(option.value)))} className="w-full p-2 h-32 bg-white/10 border border-white/20 rounded-md">
                                    {users.map(u => <option key={u.id} value={u.id} className="text-black p-1">{u.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-white/20">
                            <button type="button" onClick={() => setIsExecutorsModalOpen(false)} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">Bekor qilish</button>
                            <button type="button" onClick={handleUpdateExecutors} disabled={loading} className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary-dark">Saqlash</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CorrespondenceView;