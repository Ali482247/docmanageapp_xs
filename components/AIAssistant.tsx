// C:\Users\aliak\Desktop\Док-оборот\docmanageapp\components\AIAssistant.tsx

import React, { useState, useEffect } from 'react';
// --- ИЗМЕНЕНО: Убрали все импорты из 'antd' ---
import { RobotOutlined, LoadingOutlined } from '@ant-design/icons';

interface AIAssistantProps {
    content: string;
    title: string;
    source?: string;
}

interface AISuggestion {
    mainSuggestion: string;
    additionalInfo?: string;
    urgency: 'high' | 'medium' | 'low';
    deadline?: string;
    department?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ content, title, source }) => {
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState<AISuggestion | null>(null);

    const mockAnalyzeContent = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        let suggestion: AISuggestion = {
            mainSuggestion: "",
            urgency: 'medium',
            additionalInfo: ""
        };
        
        const lowerContent = content.toLowerCase();

        if (lowerContent.includes('muammo') || lowerContent.includes('notekis') || lowerContent.includes('tezkor')) {
            suggestion.mainSuggestion = 'Hujjatda muammo qayd etilgan. Tezkor javob talab qilinadi.';
            suggestion.urgency = 'high';
            suggestion.additionalInfo = 'Tezkor choralar ko\'rish talab etiladi';
            suggestion.deadline = '24 soat';
            if (lowerContent.includes('suv')) {
                suggestion.department = 'Kommunal xo\'jalik';
                suggestion.mainSuggestion = 'Kommunal xo\'jalik bo\'limiga muammo yuzasidan tezkor yo\'naltirish kerak.';
            }
        } 
        else if (lowerContent.includes('suv')) {
            suggestion.department = 'Kommunal xo\'jalik';
            suggestion.mainSuggestion = 'Bu hujjat Kommunal xo\'jalik bo\'limiga yo\'naltirilishi kerak';
            suggestion.urgency = 'high';
            suggestion.deadline = '2 kun';
        }
        else {
            suggestion.mainSuggestion = 'Ushbu hujjatni texnik bo\'limga yo\'naltirish tavsiya etiladi';
            suggestion.urgency = 'medium';
            suggestion.deadline = '3 kun';
        }

        setSuggestions(suggestion);
        setLoading(false);
    };

    useEffect(() => {
        mockAnalyzeContent();
    }, [content, title]);

    // --- ИЗМЕНЕНО: Весь компонент переписан на Tailwind CSS, как и другие блоки ---
    return (
        <div className="p-4 border border-white/20 rounded-lg bg-black/20 text-white">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <RobotOutlined />
                <span>AI Yordamchi</span>
            </h3>
            
            {loading && (
                <div className="flex flex-col items-center justify-center py-5">
                    <LoadingOutlined className="text-2xl text-white/70 animate-spin" />
                    <p className="mt-2 text-sm text-white/60">Hujjat tahlil qilinmoqda...</p>
                </div>
            )}

            {!loading && suggestions && (
                <div className="space-y-3 text-sm">
                    <div>
                        <strong className="block text-white/80">Asosiy tavsiya:</strong>
                        <p className="text-white/90">{suggestions.mainSuggestion}</p>
                    </div>

                    <div>
                        <strong className="text-white/80">Muhimlik darajasi: </strong>
                        <span className={suggestions.urgency === 'high' ? 'text-red-400 font-bold' : 'text-amber-400'}>
                            {suggestions.urgency === 'high' ? 'Yuqori' : 
                             suggestions.urgency === 'medium' ? "O'rta" : 'Past'}
                        </span>
                    </div>

                    {suggestions.deadline && (
                        <div>
                            <strong className="text-white/80">Tavsiya etilgan muddat: </strong>
                            <span className="text-white/90">{suggestions.deadline}</span>
                        </div>
                    )}

                    {suggestions.department && (
                        <div>
                            <strong className="text-white/80">Tavsiya etilgan bo'lim: </strong>
                            <span className="text-white/90">{suggestions.department}</span>
                        </div>
                    )}

                    {suggestions.additionalInfo && (
                        <div>
                            <strong className="block text-white/80">Qo'shimcha ma'lumot: </strong>
                            <p className="text-white/90">{suggestions.additionalInfo}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AIAssistant;