import React from 'react';
import { BoldIcon, ItalicIcon, UnderlineIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon } from './icons/IconComponents';

interface DocumentEditorPreviewProps {
  content: string;
}

const DocumentEditorPreview: React.FC<DocumentEditorPreviewProps> = ({ content }) => {
  return (
    <div className="bg-slate-700/50 rounded-lg p-2 sm:p-4">
      <div className="bg-slate-800/60 rounded-t-md p-2 flex items-center gap-2 border-b border-white/10">
        <button className="p-2 text-white/50 rounded hover:bg-white/10" disabled><BoldIcon className="w-5 h-5"/></button>
        <button className="p-2 text-white/50 rounded hover:bg-white/10" disabled><ItalicIcon className="w-5 h-5"/></button>
        <button className="p-2 text-white/50 rounded hover:bg-white/10" disabled><UnderlineIcon className="w-5 h-5"/></button>
        <div className="w-px h-6 bg-white/10 mx-2"></div>
        <button className="p-2 text-white/50 rounded hover:bg-white/10" disabled><AlignLeftIcon className="w-5 h-5"/></button>
        <button className="p-2 text-white/50 rounded hover:bg-white/10" disabled><AlignCenterIcon className="w-5 h-5"/></button>
        <button className="p-2 text-white/50 rounded hover:bg-white/10" disabled><AlignRightIcon className="w-5 h-5"/></button>
      </div>
      <div className="bg-white text-slate-800 p-6 sm:p-8 md:p-10 rounded-b-md min-h-[300px] max-h-[50vh] overflow-y-auto">
        <p className="whitespace-pre-wrap font-serif leading-relaxed">
            {content}
        </p>
      </div>
    </div>
  );
};

export default DocumentEditorPreview;