// C:\Users\aliak\Desktop\Док-оборот\docmanageapp\components\DocumentEditorPreview.tsx

import React from "react";

interface DocumentEditorPreviewProps {
  content: string;
}

const DocumentEditorPreview: React.FC<DocumentEditorPreviewProps> = ({ content }) => {
  // --- НОВЫЙ БЛОК: Умный парсинг контента ---
  // Мы используем useMemo, чтобы эта логика не выполнялась при каждом рендере, а только когда меняется `content`.
  const parsedContent = React.useMemo(() => {
    if (!content) return [];

    // 1. Разбиваем весь текст на строки
    return content.split('\n')
      .map(line => {
        // 2. Ищем первое двоеточие в строке.
        // Это позволяет значениям после двоеточия самим содержать двоеточия.
        const parts = line.split(/:(.*)/s);
        
        // 3. Если двоеточие найдено и есть текст до и после, считаем это парой "ключ-значение"
        if (parts.length > 1 && parts[0].trim() !== '' && parts[1].trim() !== '') {
          return { type: 'kv', label: parts[0].trim(), value: parts[1].trim() };
        }
        
        // 4. Иначе, считаем это обычным параграфом
        return { type: 'p', value: line.trim() };
      })
      // 5. Убираем пустые строки из результата
      .filter(item => item.value !== '');
  }, [content]);

  return (
    // --- ИЗМЕНЕНО: Обновленный дизайн контейнера ---
    <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl shadow-lg">
      <div className="p-6 sm:p-8">
        <div className="space-y-6">

          {/* --- НОВЫЙ БЛОК: Рендерим каждую часть контента отдельно --- */}
          {parsedContent.map((item, index) => {
            // Если это пара "ключ-значение", рендерим ее в специальном стиле
            if (item.type === 'kv') {
              return (
                <div key={index} className="pb-4 border-b border-white/10">
                  <p className="text-xs font-semibold uppercase text-white/50 tracking-widest">{item.label}</p>
                  <p className="mt-1 font-medium text-white/90 whitespace-pre-wrap">{item.value}</p>
                </div>
              );
            }

            // Если это обычный параграф, рендерим как простой текст
            if (item.type === 'p') {
              return (
                <p key={index} className="text-white/80 leading-relaxed whitespace-pre-wrap">
                  {item.value}
                </p>
              );
            }
            
            return null;
          })}
        </div>
      </div>

      {/* Футер с версией документа */}
      <div className="border-t border-white/10 mt-6 px-6 py-3 text-xs text-white/40 text-right">
        <p>Document Viewer v2.0</p>
      </div>
    </div>
  );
};

export default DocumentEditorPreview;