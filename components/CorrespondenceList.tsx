import React, { useState } from 'react';
import { Correspondence } from '../types';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from './icons/IconComponents';
import DocumentPreviewModal from './DocumentPreviewModal';
import { MOCK_USERS } from '../services/mockApi';
import Deadline from './Deadline';

interface CorrespondenceListProps {
  correspondences: Correspondence[];
}

const stageColors: { [key: string]: string } = {
  'Registratsiya kutilmoqda': 'bg-gray-500/50 text-gray-100',
  Registratsiya: 'bg-cyan-500/50 text-cyan-100',
  Rezolyutsiya: 'bg-blue-500/50 text-blue-100',
  'Ijrochiga yo`naltirish': 'bg-purple-500/50 text-purple-100',
  Ijro: 'bg-indigo-500/50 text-indigo-100',
  Loyihalash: 'bg-gray-500/50 text-gray-100',
  'Qayta ishlashga yuborildi': 'bg-pink-500/50 text-pink-100',
  'Yakuniy kelishuv': 'bg-yellow-500/50 text-yellow-100',
  Imzolash: 'bg-orange-500/50 text-orange-100',
  'Jo`natish': 'bg-teal-500/50 text-teal-100',
  Yakunlangan: 'bg-emerald-500/50 text-emerald-100',
  'Rad etilgan': 'bg-red-500/50 text-red-100',
  Arxivlangan: 'bg-slate-600/50 text-slate-200',
  'To`xtatilgan': 'bg-amber-600/50 text-amber-100',
  'Bekor qilingan': 'bg-rose-700/50 text-rose-100',
};

const CorrespondenceList: React.FC<CorrespondenceListProps> = ({ correspondences }) => {
  const navigate = useNavigate();
  const [selectedDoc, setSelectedDoc] = useState<Correspondence | null>(null);

  const handleRowClick = (id: number) => {
    navigate(`/correspondence/${id}`);
  };

  const handlePreviewClick = (e: React.MouseEvent, doc: Correspondence) => {
    e.stopPropagation(); // Prevent row click from firing
    setSelectedDoc(doc);
  };
  
  const handleClosePreview = () => {
    setSelectedDoc(null);
  };

  const getMainExecutorName = (doc: Correspondence) => {
    if (doc.mainExecutorId) {
      return MOCK_USERS.find(u => u.id === doc.mainExecutorId)?.name || 'Noma`lum';
    }
    return 'Tayinlanmagan';
  }

  return (
    <>
    <div className="overflow-hidden rounded-2xl shadow-lg backdrop-blur-md bg-white/10 border border-white/20">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-white/80">
          <thead className="text-xs text-white/90 uppercase bg-white/10">
            <tr>
              <th scope="col" className="px-6 py-3 w-12 text-center">Turi</th>
              <th scope="col" className="px-6 py-3">Sarlavha</th>
              <th scope="col" className="px-6 py-3">Joriy Bosqich</th>
              <th scope="col" className="px-6 py-3">Asosiy Ijrochi</th>
              <th scope="col" className="px-6 py-3">Muddati (Bosqich)</th>
              <th scope="col" className="px-6 py-3 text-center">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {correspondences.map(doc => (
              <tr key={doc.id} className="border-b border-white/10 hover:bg-white/20 cursor-pointer" onClick={() => handleRowClick(doc.id)}>
                <td className="px-6 py-4 text-center">
                    {/* FIX: Replaced the invalid `title` prop with a nested <title> element for SVG accessibility. */}
                    {doc.type === 'Kiruvchi' ? 
                        <ArrowDownTrayIcon className="w-6 h-6 mx-auto text-cyan-300"><title>Kiruvchi hujjat</title></ArrowDownTrayIcon> : 
                        <ArrowUpTrayIcon className="w-6 h-6 mx-auto text-amber-300"><title>Chiquvchi hujjat</title></ArrowUpTrayIcon>
                    }
                </td>
                <td className="px-6 py-4 font-medium text-white">{doc.title}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${stageColors[doc.stage] || 'bg-gray-500/50 text-gray-100'}`}>
                    {doc.stage}
                  </span>
                </td>
                <td className="px-6 py-4">{getMainExecutorName(doc)}</td>
                <td className="px-6 py-4">
                  <Deadline deadline={doc.stageDeadline} stage={doc.stage} />
                </td>
                <td className="px-6 py-4 text-center">
                    <button 
                        onClick={(e) => handlePreviewClick(e, doc)} 
                        className="p-2 text-white/70 rounded-full hover:bg-white/20 hover:text-white transition-colors"
                        aria-label="Preview document"
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                </td>
              </tr>
            ))}
             {correspondences.length === 0 && (
                <tr>
                    <td colSpan={6} className="py-8 text-center text-white/70">Topshiriqlar topilmadi.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    {selectedDoc && (
        <DocumentPreviewModal 
            document={selectedDoc} 
            onClose={handleClosePreview}
            onViewFull={() => navigate(`/correspondence/${selectedDoc.id}`)}
        />
    )}
    </>
  );
};

export default CorrespondenceList;