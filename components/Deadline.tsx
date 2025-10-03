import React, { useState, useEffect } from 'react';
import { CorrespondenceStage } from '../constants';

interface DeadlineProps {
  deadline: string;
  stage: CorrespondenceStage;
}

const Deadline: React.FC<DeadlineProps> = ({ deadline, stage }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [colorClass, setColorClass] = useState('text-white');
  
  useEffect(() => {
    if (stage === CorrespondenceStage.ON_HOLD) {
      setTimeLeft(`To'xtatilgan`);
      setColorClass('text-amber-400');
      return;
    }
    if (stage === CorrespondenceStage.CANCELLED) {
      setTimeLeft('Bekor qilingan');
      setColorClass('text-rose-400');
      return;
    }
     if (stage === CorrespondenceStage.COMPLETED || stage === CorrespondenceStage.ARCHIVED) {
      setTimeLeft('Yakunlangan');
      setColorClass('text-emerald-400');
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(deadline) - +new Date();
      let timeLeftString = '';

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);

        if (days > 0) timeLeftString = `${days} kun ${hours} soat`;
        else if (hours > 0) timeLeftString = `${hours} soat ${minutes} daqiqa`;
        else timeLeftString = `${minutes} daqiqa`;

        if (difference < 24 * 60 * 60 * 1000) { // Less than 24 hours
          setColorClass('text-yellow-400 font-semibold');
        } else {
          setColorClass('text-white');
        }
      } else {
        timeLeftString = `Muddati o'tgan`;
        setColorClass('text-red-400 font-bold animate-pulse');
      }
      setTimeLeft(timeLeftString);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [deadline, stage]);

  return <span className={colorClass}>{timeLeft}</span>;
};

export default Deadline;