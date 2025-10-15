// C:\Users\aliak\Desktop\Док-оборот\docmanageapp\components\CreateCorrespondenceModal.tsx

import React, { useState } from 'react';
import { createOutgoingCorrespondence, createIncomingTask } from '../services/api';

interface CreateCorrespondenceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const KARTOTEKA_OPTIONS = [
    "Markaziy Bank",
    "Murojaatlar",
    "Prezident Administratsiyasi",
    "Vazirlar Mahkamasi",
    "Xizmat yozishmalari",
    "Nazoratdagi",
];

const CreateCorrespondenceModal: React.FC<CreateCorrespondenceModalProps> = ({ onClose, onSuccess }) => {
  const [type, setType] = useState<'Kiruvchi' | 'Chiquvchi'>('Chiquvchi');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [kartoteka, setKartoteka] = useState(KARTOTEKA_OPTIONS[0]); // Изменено на первый элемент по умолчанию
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (type === 'Chiquvchi') {
        await createOutgoingCorrespondence({ title, content, kartoteka });
      } else {
        // --- ГЛАВНОЕ ИСПРАВЛЕНИЕ: Передаем 4 параметра вместо 3 ---
        // Теперь `kartoteka` отправляется и как source, и как kartoteka.
        await createIncomingTask(title, content, kartoteka, kartoteka);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Hujjatni yaratishda xatolik yuz berdi.');
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
        <h2 className="text-2xl font-bold mb-4">Yangi Hujjat Yaratish</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
              <label className="block mb-2 text-sm font-medium text-white/80">Hujjat Turi</label>
              <div className="flex items-center gap-6 p-2 bg-white/10 rounded-md">
                  <label className="flex items-center gap-2 cursor-pointer w-full justify-center">
                      <input
                          type="radio"
                          name="type"
                          value="Chiquvchi"
                          checked={type === 'Chiquvchi'}
                          onChange={() => setType('Chiquvchi')}
                          className="form-radio bg-transparent border-white/30 text-primary focus:ring-primary"
                      />
                      <span>Chiquvchi</span>
                  </label>
                  <div className="h-6 w-px bg-white/20"></div>
                  <label className="flex items-center gap-2 cursor-pointer w-full justify-center">
                      <input
                          type="radio"
                          name="type"
                          value="Kiruvchi"
                          checked={type === 'Kiruvchi'}
                          onChange={() => setType('Kiruvchi')}
                          className="form-radio bg-transparent border-white/30 text-primary focus:ring-primary"
                      />
                      <span>Kiruvchi</span>
                  </label>
              </div>
          </div>

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
            <label htmlFor="kartoteka" className="block mb-1 text-sm font-medium text-white/80">
                {type === 'Chiquvchi' ? 'Kartoteka' : 'Manba / Kartoteka'}
            </label>
            <select
                id="kartoteka"
                name="kartoteka"
                value={kartoteka}
                onChange={(e) => setKartoteka(e.target.value)}
                required
                className="w-full p-2 bg-white/10 border border-white/20 rounded-md"
            >
                {KARTOTEKA_OPTIONS.map(item => (
                    <option key={item} value={item} className="text-black">{item}</option>
                ))}
            </select>
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