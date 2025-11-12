// FIX: Changed to default react import and updated hooks usage to resolve JSX intrinsic element type errors.
import React from 'react';
import { CVFile } from '../types';
import { Icon } from './icons';
import { useTranslation } from '../i18n';

interface UploadViewProps {
  cvFiles: CVFile[];
  onAddFiles: (files: File[]) => void;
  onStartAnalysis: () => void;
  onClearFile: (fileId: string) => void;
  onClearAllFiles: () => void;
  isAnalyzing: boolean;
  storageError: string | null;
}

const FileStatusChip: React.FC<{ status: CVFile['status'] }> = ({ status }) => {
    const { t } = useTranslation();
    const statusMap = {
        pending: { text: t('upload.status.pending'), color: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
        parsing: { text: t('upload.status.parsing'), color: 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-300 animate-pulse' },
        success: { text: t('upload.status.success'), color: 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300' },
        error: { text: t('upload.status.error'), color: 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300' },
    };
    const { text, color } = statusMap[status];
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color}`}>{text}</span>;
};


export const UploadView: React.FC<UploadViewProps> = ({ cvFiles, onAddFiles, onStartAnalysis, onClearFile, onClearAllFiles, isAnalyzing, storageError }) => {
  const { t } = useTranslation();
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isUIDisabled = isAnalyzing || !!storageError;

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUIDisabled) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUIDisabled) return;
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles(Array.from(e.dataTransfer.files));
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(Array.from(e.target.files));
    }
  };

  const onButtonClick = () => {
    if (isUIDisabled) return;
    inputRef.current?.click();
  };

  const handleResetClick = () => {
      if (confirmReset) {
          onClearAllFiles();
          setConfirmReset(false);
      } else {
          setConfirmReset(true);
          setTimeout(() => setConfirmReset(false), 3000);
      }
  };

  const pendingFilesCount = cvFiles.filter(f => f.status === 'pending').length;

  return (
    <div className="p-4 sm:p-8 space-y-8">
        <header>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('upload.title')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('upload.subtitle')}</p>
        </header>

        <div className={`grid grid-cols-1 ${cvFiles.length > 0 ? 'lg:grid-cols-2 gap-8 items-start' : ''}`}>
             {cvFiles.length > 0 && (
                 <div className="space-y-4 lg:order-1">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <h3 className="text-xl font-bold">{t('upload.pending_files.title', { count: cvFiles.length })}</h3>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <button 
                                    onClick={handleResetClick}
                                    disabled={isAnalyzing}
                                    className={`font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 ${
                                        confirmReset 
                                        ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                                    aria-label={confirmReset ? t('common.reset_confirm_action') : t('common.reset')}
                                >
                                   <Icon name="refresh-cw" className="w-5 h-5"/>
                                   <span>{confirmReset ? t('common.reset_confirm_action') : t('common.reset')}</span>
                                </button>
                                {confirmReset && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-900 text-white text-xs rounded py-2 px-3 opacity-100 transition-opacity pointer-events-none z-10 shadow-lg text-center dark:bg-gray-700">
                                        {t('common.reset_confirm')}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={onStartAnalysis} 
                                disabled={pendingFilesCount === 0 || isAnalyzing}
                                className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                               {isAnalyzing ? <Icon name="spinner" className="w-5 h-5"/> : <Icon name="check" className="w-5 h-5"/>}
                               <span>{t('upload.pending_files.analyze_button', { count: pendingFilesCount })}</span>
                            </button>
                        </div>
                    </div>
                    <ul className="bg-white dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 divide-y dark:divide-gray-700 max-h-[450px] overflow-y-auto">
                        {cvFiles.map(cvFile => (
                            <li key={cvFile.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800">
                               <div className="flex items-center gap-4 truncate">
                                    <Icon name="google" className="w-6 h-6 text-gray-400 flex-shrink-0"/>
                                    <div className="truncate">
                                        <p className="font-semibold truncate">{cvFile.file.name}</p>
                                        <p className="text-sm text-gray-500">{(cvFile.file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                               </div>
                                <div className="flex items-center gap-4">
                                   <FileStatusChip status={cvFile.status} />
                                   <button onClick={() => onClearFile(cvFile.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-full">
                                       <Icon name="close" className="w-5 h-5" />
                                   </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div 
              onDragEnter={handleDrag} 
              onDragLeave={handleDrag} 
              onDragOver={handleDrag} 
              onDrop={handleDrop}
              onClick={onButtonClick}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[450px]
                ${cvFiles.length > 0 ? 'lg:order-2' : 'col-span-1'}
                ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600 bg-white/30 dark:bg-gray-800/30'}
                ${isUIDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-primary-400'}`}
            >
                <input ref={inputRef} type="file" multiple onChange={handleChange} className="hidden" accept=".pdf,.txt,.json,.md,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx" disabled={isUIDisabled} />
                
                <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <dotlottie-wc src="https://lottie.host/05f02365-02dd-4b23-8289-b8d119e5c961/9dwTt6kpl2.lottie" style={{ width: '220px', height: '220px' }} autoplay loop></dotlottie-wc>
                    <div className="text-center">
                        {isDragActive ? (
                            <p className="text-lg font-semibold text-primary-600">{t('upload.dropzone.release')}</p>
                        ) : (
                            <p className="text-lg font-semibold">{t('upload.dropzone.prompt')}</p>
                        )}
                        <p className="text-sm mt-1">{t('upload.dropzone.supported_files')}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};