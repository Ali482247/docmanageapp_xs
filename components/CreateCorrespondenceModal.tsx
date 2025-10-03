import React, { useState } from 'react';
import { createCorrespondence } from '../services/mockApi';
import { useAuth } from '../hooks/useAuth';

interface CreateCorrespondenceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCorrespondenceModal: React.FC<CreateCorrespondenceModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Foydalanuvchi topilmadi.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createCorrespondence(title, content, user);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Hujjatni yaratishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" 
      onClick={onClose}
      role="dialog" 
      aria-modal="true"
    >
      <div 
        className="w-full max-w-2xl p-6 text-white bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Yangi Chiquvchi Hujjat Yaratish</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block mb-1 text-sm font-medium text-white/80">Sarlavha</label>
            <input 
              type="text" 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required 
              className="w-full p-2 bg-white/10 border border-white/20 rounded-md focus:ring-primary focus:border-primary" 
            />
          </div>
          <div>
            <label htmlFor="content" className="block mb-1 text-sm font-medium text-white/80">Matn</label>
            <textarea 
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required 
              rows={10}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <div className="flex justify-end gap-4 pt-4 border-t border-white/20">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
              Bekor qilish
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary-dark disabled:bg-opacity-50">
              {loading ? 'Yaratilmoqda...' : 'Yaratish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCorrespondenceModal;
