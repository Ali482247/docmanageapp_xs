import React, { useEffect, useState } from 'react';
import { User, Role, Department } from '../types';
// --- ИЗМЕНЕНИЕ 1: Импортируем из реального api.ts ---
import { getUsers, addUser, updateUser, deleteUser, getRoles, getDepartments } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../constants';
import { Navigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon } from './icons/IconComponents';

const UserManagement: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]); // Состояние для департаментов
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // --- ИЗМЕНЕНИЕ 2: Добавляем поле для пароля ---
    const emptyForm = { name: '', email: '', password: '', role: '', department: '' };
    const [formData, setFormData] = useState<any>(emptyForm);

    const fetchData = () => {
        setLoading(true);
        Promise.all([getUsers(), getRoles(), getDepartments()]).then(([userData, roleData, deptData]) => {
            setUsers(userData);
            setRoles(roleData);
            setDepartments(deptData);
            if (roleData.length > 0) emptyForm.role = roleData[0].name;
            if (deptData.length > 0) emptyForm.department = deptData[0].name;
            setFormData(emptyForm);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (userToEdit: User | null) => {
        setEditingUser(userToEdit);
        if (userToEdit) {
            setFormData({ name: userToEdit.name, email: userToEdit.email, role: userToEdit.role, department: userToEdit.department });
        } else {
            setFormData(emptyForm);
        }
        setIsModalOpen(true);
    };
    
    // ... (handleCloseModal и handleChange остаются без изменений)
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData(emptyForm);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ... (handleSubmit и handleDelete остаются почти без изменений, только вызовы)
     const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // При редактировании пароль не отправляем
        const dataToSend = { ...formData };
        if (editingUser) {
            delete dataToSend.password;
            await updateUser(editingUser.id, dataToSend);
        } else {
            await addUser(dataToSend);
        }
        fetchData();
        handleCloseModal();
    };

    const handleDelete = async (userId: number) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            setLoading(true);
            await deleteUser(userId);
            fetchData();
        }
    };
    
    if (user?.role !== UserRole.Admin) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="space-y-6 text-white">
            {/* ... (заголовок и кнопка без изменений) */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">User Management</h1>
                <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 px-4 py-2 text-white bg-primary rounded-lg shadow hover:bg-primary-dark transition-colors">
                    <PlusIcon className="w-5 h-5" />
                    <span>Add User</span>
                </button>
            </div>
            {/* ... (таблица без изменений) */}
            <div className="overflow-hidden rounded-2xl shadow-lg backdrop-blur-md bg-white/10 border border-white/20">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-white/80">
                         <thead className="text-xs text-white/90 uppercase bg-white/10">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3">Department</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center p-5">Loading users...</td></tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.id} className="border-b border-white/10 hover:bg-white/20">
                                        <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                                        <td className="px-6 py-4">{u.email}</td>
                                        <td className="px-6 py-4">{u.role}</td>
                                        <td className="px-6 py-4">{u.department}</td>
                                        <td className="px-6 py-4 space-x-2 text-center">
                                            <button onClick={() => handleOpenModal(u)} className="p-2 text-cyan-300 rounded-full hover:bg-cyan-500/30 transition-colors" aria-label="Edit user"><PencilIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDelete(u.id)} className="p-2 text-red-400 rounded-full hover:bg-red-500/30 transition-colors" aria-label="Delete user"><TrashIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" role="dialog" aria-modal="true">
                    <div className="w-full max-w-md p-6 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl text-white">
                        <h2 className="mb-4 text-2xl font-bold">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block mb-1 text-sm font-medium text-white/80">Full Name</label>
                                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-white/10 border border-white/20 rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block mb-1 text-sm font-medium text-white/80">Email Address</label>
                                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="w-full p-2 bg-white/10 border border-white/20 rounded-md" />
                                </div>
                                {/* --- ИЗМЕНЕНИЕ 3: Добавляем поле пароля только для НОВЫХ пользователей --- */}
                                {!editingUser && (
                                    <div>
                                        <label htmlFor="password" className="block mb-1 text-sm font-medium text-white/80">Password</label>
                                        <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required className="w-full p-2 bg-white/10 border border-white/20 rounded-md" />
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="role" className="block mb-1 text-sm font-medium text-white/80">Role</label>
                                    <select name="role" id="role" value={formData.role} onChange={handleChange} required className="w-full p-2 bg-white/10 border border-white/20 rounded-md">
                                        {roles.map(role => <option key={role.id} value={role.name} className="text-black">{role.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="department" className="block mb-1 text-sm font-medium text-white/80">Department</label>
                                    <select name="department" id="department" value={formData.department} onChange={handleChange} required className="w-full p-2 bg-white/10 border border-white/20 rounded-md">
                                        {departments.map(dept => <option key={dept.id} value={dept.name} className="text-black">{dept.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary-dark">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;