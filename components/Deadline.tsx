// src/components/Deadline.tsx

import React, { useState, useEffect } from 'react';
import { CorrespondenceStage } from '../constants';
import { ClockIcon } from './icons/IconComponents';

interface DeadlineProps {
  deadline?: string | null; // Делаем deadline необязательным
  stage: string;
}

// Стили для разных состояний
const styles = {
  overdue:   { text: 'text-red-300',   bg: 'bg-red-500/10',   pulse: ' animate-pulse' },
  urgent:    { text: 'text-amber-300', bg: 'bg-amber-500/10', pulse: '' },
  normal:    { text: 'text-green-300', bg: 'bg-green-500/10', pulse: '' },
  completed: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', pulse: '' },
  on_hold:   { text: 'text-amber-400', bg: 'bg-amber-500/10', pulse: '' },
  cancelled: { text: 'text-rose-400', bg: 'bg-rose-500/10', pulse: '' },
  none:      { text: 'text-gray-300', bg: 'bg-gray-500/10', pulse: '' },
};


const Deadline: React.FC<DeadlineProps> = ({ deadline, stage }) => {
  const [displayText, setDisplayText] = useState('');
  const [activeStyle, setActiveStyle] = useState(styles.none);

  useEffect(() => {
    // Обрабатываем статичные статусы в первую очередь
    if (stage === CorrespondenceStage.COMPLETED || stage === CorrespondenceStage.ARCHIVED) {
      setDisplayText('Yakunlangan');
      setActiveStyle(styles.completed);
      return () => {}; // Выходим и отключаем таймер
    }
    if (stage === CorrespondenceStage.ON_HOLD) {
      setDisplayText(`To'xtatilgan`);
      setActiveStyle(styles.on_hold);
      return () => {};
    }
    if (stage === CorrespondenceStage.CANCELLED) {
      setDisplayText('Bekor qilingan');
      setActiveStyle(styles.cancelled);
      return () => {};
    }
    if (!deadline) {
        setDisplayText('Muddatsiz');
        setActiveStyle(styles.none);
        return () => {};
    }

    // Логика таймера для активных задач
    const calculateTimeLeft = () => {
      const difference = +new Date(deadline) - +new Date();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(difference / (1000 * 60 * 60));

        if (days > 1) {
            setDisplayText(`${days} kun qoldi`);
            setActiveStyle(styles.normal);
        } else if (hours > 0) {
            setDisplayText(`${hours} soat qoldi`);
            setActiveStyle(styles.urgent);
        } else {
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            setDisplayText(`${minutes} daqiqa qoldi`);
            setActiveStyle(styles.urgent);
        }
      } else {
        setDisplayText(`Muddati o'tgan`);
        setActiveStyle(styles.overdue);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Обновляем каждую минуту

    // Функция очистки для остановки таймера, когда компонент исчезает
    return () => clearInterval(timer);
  }, [deadline, stage]);

  return (
    <div className={`flex w-full items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${activeStyle.bg} ${activeStyle.text} ${activeStyle.pulse}`}>
      <ClockIcon className="w-4 h-4" />
      <span>{displayText}</span>
    </div>
  );
};

export default Deadline;