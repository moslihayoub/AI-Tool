// FIX: Changed React import to namespace import `* as React` to resolve widespread JSX intrinsic element type errors, which likely stem from a project configuration that requires this import style.
import * as React from 'react';
import { Icon } from './icons';
import { useTranslation } from '../i18n';

interface AnalysisLoaderProps {
  progress: number;
  total: number;
  startTime: number | null;
}

export const AnalysisLoader: React.FC<AnalysisLoaderProps> = ({ progress, total, startTime }) => {
  const { t } = useTranslation();
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  React.useEffect(() => {
    if (startTime === null) return;
    
    const timer = setInterval(() => {
      setElapsedTime((Date.now() - startTime) / 1000);
    }, 100);

    return () => clearInterval(timer);
  }, [startTime]);


  return (
    <div className="fixed inset-0 z-50 text-white">
      <div className="absolute inset-0 bg-white dark:bg-black" aria-hidden="true" />
      <div className="absolute inset-0 bg-gray-900 opacity-70" aria-hidden="true" />
      <div className="relative flex flex-col items-center justify-center h-full w-full">
        {/* FIX: Changed autoPlay to autoplay to align with web component standards. */}
        <dotlottie-wc src="https://lottie.host/f65b0508-f3b0-46d1-9a76-2974759efcb3/uA68bKWt6J.lottie" style={{ width: '300px', height: '300px' }} autoplay loop></dotlottie-wc>
        <h2 className="text-3xl font-bold font-display mt-4">{t('analysis.title')}</h2>
        <p className="text-gray-300 mt-2">{t('analysis.subtitle')}</p>
        
        <div className="w-full max-w-md mt-8 px-4">
          <div className="flex justify-between items-center mb-2 text-lg">
              <span className="font-bold">{t('analysis.progress_cvs', { progress, total })}</span>
              <span className="font-bold bg-clip-text text-transparent bg-gradient-button">{percentage}%</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-4">
            <div 
              className="bg-gradient-button h-4 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
           <p className="text-center mt-4 text-gray-400 font-medium">
              {t('analysis.elapsed_time', { time: elapsedTime.toFixed(1) })}
          </p>
        </div>
      </div>
    </div>
  );
};