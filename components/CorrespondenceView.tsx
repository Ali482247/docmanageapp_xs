import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Correspondence, User } from '../types';
import { getCorrespondenceById, getUsers, assignExecutor, assignInternalEmployee, submitForReview, approveReview, rejectReview, signDocument, dispatchDocument } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { UserRole, CorrespondenceStage, getStageDisplayName } from '../constants';
import { ArrowLeftIcon, UserGroupIcon, PaperAirplaneIcon, CheckBadgeIcon, CheckIcon, ClockIcon, XMarkIcon, XCircleIcon, PencilIcon, CheckCircleIcon } from './icons/IconComponents';
import DocumentEditorPreview from './DocumentEditorPreview';

// Вспомогательный компонент для отображения статуса
const StatusBadge: React.FC<{ status?: 'PENDING' | 'APPROVED' | 'REJECTED' }> = ({ status }) => {
    if (status === 'APPROVED') {
        return <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckIcon className="w-4 h-4" /> Tasdiqlangan</span>;
    }
    if (status === 'REJECTED') {
        return <span className="flex items-center gap-1 text-xs text-red-400"><XMarkIcon className="w-4 h-4" /> Rad etilgan</span>;
    }
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
    
    // --- WORKFLOW ФУНКЦИИ ---
    const handleAssignExecutors = async () => {
        if (correspondence && selectedMainExecutor) {
            setLoading(true);
            try {
                const updatedDoc = await assignExecutor(correspondence.id, selectedMainExecutor);
                setCorrespondence(updatedDoc);
            } catch (err: any) { alert(`Xatolik: ${err.message}`); }
            finally {
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
            } catch (err: any) { alert(`Xatolik: ${err.message}`); }
            finally { setLoading(false); }
        }
    };

    const handleSubmitForReview = async () => {
        if (correspondence) {
            setLoading(true);
            try {
                await submitForReview(correspondence.id);
                fetchData(); // Перезагружаем данные, чтобы получить список согласующих
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

    if (loading) return <div className="text-center p-10">Hujjat yuklanmoqda...</div>;
    if (error) return <div className="text-center p-10 text-red-300">{error}</div>;
    if (!correspondence || !currentUser) return null;
    
    // --- ЛОГИКА ОТОБРАЖЕНИЯ КНОПОК ---
    const canAssign = currentUser.role === UserRole.Boshqaruv && correspondence.stage === CorrespondenceStage.ASSIGNMENT;
    const canDelegateInternal = currentUser.role === UserRole.Tarmoq && correspondence.mainExecutor?.id === currentUser.id && correspondence.stage === CorrespondenceStage.EXECUTION;
    const canSubmitForReview = (currentUser.id === correspondence.mainExecutor?.id || currentUser.id === correspondence.author.id) && (correspondence.stage === CorrespondenceStage.DRAFTING || correspondence.stage === 'REVISION_REQUESTED');
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
                        <div className="p-4 border border-white/20 rounded-lg bg-black/20">
                            <h3 className="text-lg font-semibold">Ma'lumotlar</h3>
                            <ul className="mt-2 space-y-2 text-sm">
                                <li><strong>Joriy Bosqich:</strong> {getStageDisplayName(correspondence.stage)}</li>
                                <li><strong>Yaratildi:</strong> {new Date(correspondence.createdAt).toLocaleString()}</li>
                                <li><strong>Muallif:</strong> {correspondence.author?.name || 'Noma\'lum'}</li>
                                <li><strong>Asosiy Ijrochi:</strong> {correspondence.mainExecutor?.name || 'Tayinlanmagan'}</li>
                                <li><strong>Ichki Ijrochi:</strong> {correspondence.internalAssignee?.name || 'Tayinlanmagan'}</li>
                            </ul>
                        </div>

                        {correspondence.reviewers && correspondence.reviewers.length > 0 && (
                            <div className="p-4 border border-white/20 rounded-lg bg-black/20">
                                <h3 className="text-lg font-semibold">Kelishuvchilar</h3>
                                <ul className="mt-3 space-y-3">
                                    {correspondence.reviewers.map(reviewer => (
                                        <li key={reviewer.user.id} className="flex justify-between items-center text-sm">
                                            <span className="text-white/80">{reviewer.user.name}</span>
                                            <StatusBadge status={reviewer.status as any} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        <div className="p-4 border border-white/20 rounded-lg bg-black/20">
                            <h3 className="text-lg font-semibold">Harakatlar</h3>
                            <div className="mt-2 space-y-2">
                                {canAssign && ( <button onClick={() => setShowAssignModal(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"> <UserGroupIcon className="w-5 h-5" /> Ijrochini tayinlash </button> )}
                                {canSubmitForReview && ( <button onClick={handleSubmitForReview} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"> <PaperAirplaneIcon className="w-5 h-5" /> Kelishuvga yuborish </button> )}
                                {canApproveOrReject && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={handleRejectReview} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"> <XCircleIcon className="w-5 h-5" /> Rad etish </button>
                                        <button onClick={handleApproveReview} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"> <CheckBadgeIcon className="w-5 h-5" /> Tasdiqlash </button>
                                    </div>
                                )}
                                {canSign && ( <button onClick={handleSignDocument} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"> <PencilIcon className="w-5 h-5" /> Imzolash </button> )}
                                {canDispatch && (
                                    <button onClick={handleDispatchDocument} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-sky-600 rounded-lg hover:bg-sky-700">
                                        <CheckCircleIcon className="w-5 h-5" /> Jo'natish / Yakunlash
                                    </button>
                                )}
                                {canDelegateInternal && (
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

            {/* Модальное окно для назначения исполнителя (без изменений) */}
        </>
    );
};

export default CorrespondenceView;