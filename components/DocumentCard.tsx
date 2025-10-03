// src/components/DocumentCard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Correspondence } from '../types';
import { getStageDisplayName } from '../constants';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, ClockIcon, UserIcon } from './icons/IconComponents';
import Deadline from './Deadline';

interface DocumentCardProps {
  document: Correspondence;
}

const stageStyles: { [key: string]: { bg: string; text: string; dot: string } } = {
  PENDING_REGISTRATION: { bg: 'bg-gray-500/10', text: 'text-gray-300', dot: 'bg-gray-400' },
  EXECUTION: { bg: 'bg-indigo-500/10', text: 'text-indigo-300', dot: 'bg-indigo-400' },
  COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  REJECTED: { bg: 'bg-red-500/10', text: 'text-red-300', dot: 'bg-red-400' },
  ON_HOLD: { bg: 'bg-amber-500/10', text: 'text-amber-300', dot: 'bg-amber-400' },
  // Добавьте другие стили по аналогии
  DEFAULT: { bg: 'bg-slate-500/10', text: 'text-slate-300', dot: 'bg-slate-400' },
};

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const navigate = useNavigate();
  const style = stageStyles[document.stage] || stageStyles.DEFAULT;

  const handleCardClick = () => {
    navigate(`/correspondence/${document.id}`);
  };

  const executorName = document.mainExecutor?.name || 'Tayinlanmagan';

  return (
    <div
      onClick={handleCardClick}
      className="flex flex-col justify-between p-5 bg-white/5 border border-white/10 rounded-2xl shadow-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
    >
      <div>
        <div className="flex justify-between items-start">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
            <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
            {getStageDisplayName(document.stage)}
          </span>
          {document.type === 'Kiruvchi' ? (
            <ArrowDownTrayIcon className="w-6 h-6 text-cyan-400/80" />
          ) : (
            <ArrowUpTrayIcon className="w-6 h-6 text-amber-400/80" />
          )}
        </div>
        <h3 className="mt-4 text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
          {document.title}
        </h3>
        <p className="mt-1 text-sm text-white/60 line-clamp-2">
          {document.content || "Hujjat matni mavjud emas..."}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-white/80">
          <UserIcon className="w-5 h-5 text-white/60" />
          <span>{executorName}</span>
        </div>
        <div className="w-full sm:w-auto">
           <Deadline deadline={document.deadline} stage={document.stage} />
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;