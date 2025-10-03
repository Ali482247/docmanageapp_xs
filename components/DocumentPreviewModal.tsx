import React from 'react';
import { Correspondence } from '../types';
import DocumentEditorPreview from './DocumentEditorPreview';

interface DocumentPreviewModalProps {
  document: Correspondence;
  onClose: () => void;
  onViewFull: () => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ document, onClose, onViewFull }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" 
      onClick={onClose}
      role="dialog" 
      aria-modal="true"
      aria-labelledby="document-preview-title"
    >
      <div 
        className="w-full max-w-3xl p-4 text-white bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex-shrink-0 pb-4 border-b border-white/20">
            <h2 id="document-preview-title" className="text-2xl font-bold">{document.title}</h2>
            <div className="flex items-center gap-4 text-sm text-white/70 mt-1">
                <span><strong>Manba:</strong> {document.source}</span>
                <span><strong>Departament:</strong> {document.department}</span>
                <span><strong>Status:</strong> {document.status}</span>
            </div>
        </div>
        
        <div className="flex-grow my-4 overflow-y-auto pr-2">
            <DocumentEditorPreview content={document.content} />
        </div>

        <div className="flex-shrink-0 flex justify-end gap-4 pt-4 border-t border-white/20">
          <button onClick={onClose} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">Yopish</button>
          <button onClick={onViewFull} className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary-dark">Batafsil ko'rish</button>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;