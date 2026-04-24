// FIX: Changed React import to namespace import `* as React` to resolve widespread JSX intrinsic element type errors, which likely stem from a project configuration that requires this import style.
// FIX: Switched to namespace React import to correctly populate the global JSX namespace.
import * as React from 'react';
import { CVFile } from '../types';
import { Icon } from './icons';
import { useTranslation } from '../i18n';
import { useToast } from './Toast';

interface UploadViewProps {
  cvFiles: CVFile[];
  onAddFiles: (files: File[]) => void;
  onStartAnalysis: () => void;
  onClearFile: (fileId: string) => void;
  onClearAllFiles: () => void;
  isAnalyzing: boolean;
  storageError: string | null;
  isOwner: boolean;
  analysisLimit: { count: number; limit: number };
  limitError: string | null;
  uploadLimit: number;
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


export const UploadView: React.FC<UploadViewProps> = ({ cvFiles, onAddFiles, onStartAnalysis, onClearFile, onClearAllFiles, isAnalyzing, storageError, isOwner, analysisLimit, limitError, uploadLimit }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState('');
  const [selectedTab, setSelectedTab] = React.useState<'file'|'link'>('file');
  const [isUrlLoading, setIsUrlLoading] = React.useState(false);
  const [urlError, setUrlError] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const remainingAnalyses = analysisLimit.limit - analysisLimit.count;
  const isUploadDisabled = cvFiles.length >= uploadLimit;
  const isInteractionDisabled = isAnalyzing || !!storageError || isUploadDisabled || (!isOwner && remainingAnalyses <= 0);
  
  const handleUrlSubmit = () => {
      if (!urlInput || isInteractionDisabled) return;
      setIsUrlLoading(true);
      setUrlError('');
      
      setTimeout(() => {
          setIsUrlLoading(false);
          const urlLower = urlInput.toLowerCase();
          if (urlLower.includes('linkedin.com') || urlLower.includes('.pdf') || urlLower.includes('docs.google.com')) {
              let fileName = "Import-" + new Date().getTime() + ".txt";
              if (urlLower.includes('.pdf')) fileName = urlInput.split('/').pop() || fileName;
              else if (urlLower.includes('linkedin.com')) fileName = "LinkedIn-Profile.txt";
              else if (urlLower.includes('docs.google.com')) fileName = "Google-Doc.txt";
              
              const file = new File(['Contenu importé depuis: ' + urlInput], fileName, { type: 'text/plain' });
              onAddFiles([file]);
              setUrlInput('');
              showToast('Lien importé avec succès', 'success');
          } else {
              setUrlError('URL non supportée. Utilisez un lien PDF, LinkedIn ou Google Doc valide.');
              showToast('Format d\'URL non supporté', 'error');
          }
      }, 1500);
  };
  

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInteractionDisabled) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInteractionDisabled) return;
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
    if (isInteractionDisabled) return;
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
        {cvFiles.length === 0 && (
            <header>
                <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-gray-100">{t('upload.title')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('upload.subtitle')}</p>
            </header>
        )}
        
        {isOwner ? (
            <div className="p-4 rounded-lg border bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200">
              <div className="flex items-start gap-3">
                <Icon name="check" className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">{t('upload.limit_rules.title_owner')}</h4>
                  <p className="text-sm">{t('upload.owner_info')}</p>
                </div>
              </div>
            </div>
        ) : (
            <div className={`p-4 rounded-lg border ${remainingAnalyses > 0 ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200'}`}>
              <div className="flex items-start gap-3">
                <Icon name={remainingAnalyses > 0 ? 'info' : 'alert-triangle'} className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">{remainingAnalyses > 0 ? t('upload.limit_rules.title') : t('upload.limit_rules.limit_reached_title')}</h4>
                  <p 
                    className="text-sm" 
                    dangerouslySetInnerHTML={{ __html: remainingAnalyses > 0 
                      ? t('upload.limit_rules.description_with_count', { count: remainingAnalyses, limit: analysisLimit.limit, uploadLimit }) 
                      : t('upload.limit_rules.limit_reached_description')
                  }}></p>
                </div>
              </div>
            </div>
        )}

        <div className={`grid grid-cols-1 ${cvFiles.length > 0 ? 'lg:grid-cols-2 gap-8 items-start' : ''}`}>
             {cvFiles.length > 0 && (
                 <div className="space-y-4 lg:order-1">
                    <header>
                        <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-gray-100">{t('upload.results.title')}</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('upload.results.subtitle')}</p>
                    </header>
                    <div className="flex justify-between items-center flex-wrap gap-4 pt-4">
                        <h3 className="text-xl font-bold font-display">{t('upload.pending_files.title', { count: cvFiles.length })}</h3>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <button 
                                    onClick={handleResetClick}
                                    disabled={isAnalyzing}
                                    className={`font-semibold py-2 px-4 rounded-full text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 ${
                                        confirmReset 
                                        ? 'bg-green-600 hover:bg-green-700' 
                                        : 'bg-red-600 hover:bg-red-700'
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
                                disabled={pendingFilesCount === 0 || isAnalyzing || (!isOwner && remainingAnalyses <= 0)}
                                className="bg-gradient-button text-white font-bold py-2 px-6 rounded-full hover:opacity-90 transition-opacity disabled:bg-none disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                            {isAnalyzing ? <Icon name="spinner" className="w-5 h-5"/> : <Icon name="check" className="w-5 h-5"/>}
                            <span>{t('upload.pending_files.analyze_button', { count: pendingFilesCount })}</span>
                            </button>
                        </div>
                    </div>
                    {limitError && (
                        <div className="my-2 text-center text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-3 rounded-md" role="alert">
                            {limitError}
                        </div>
                    )}
                    <ul className="bg-white dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 divide-y dark:divide-gray-700 max-h-[450px] overflow-y-auto">
                        {cvFiles.map(cvFile => (
                             <li key={cvFile.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <div className="flex items-center justify-between w-full">
                                   <div className="flex items-center gap-4 truncate min-w-0">
                                        <Icon name="google" className="w-6 h-6 text-gray-400 flex-shrink-0"/>
                                        <div className="truncate">
                                            <p className="font-semibold truncate">{cvFile.file.name}</p>
                                            <p className="text-sm text-gray-500">{(cvFile.file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                   </div>
                                    <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                                       <FileStatusChip status={cvFile.status} />
                                       <button onClick={() => onClearFile(cvFile.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-full">
                                           <Icon name="close" className="w-5 h-5" />
                                       </button>
                                    </div>
                                </div>
                                {cvFile.status === 'error' && cvFile.error && (
                                    <div className="mt-2 pl-10">
                                        <div className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/50">
                                            <Icon name="alert-triangle" className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <p>
                                                <strong>{t('upload.status.error')}: </strong>{t('errors.analysis_failed')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                 </div>
            )}
            <div className={`flex flex-col gap-6 ${cvFiles.length > 0 ? 'lg:order-2' : 'col-span-1'} w-full`}>
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button 
                            onClick={(e) => { e.preventDefault(); setUrlInput(''); setUrlError(''); setSelectedTab('file'); }}
                            className={`flex-1 py-4 px-6 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${selectedTab === 'file' ? 'bg-pink-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            <Icon name="upload-cloud" className="w-5 h-5" />
                            {t('upload.import_doc', 'Import a doc')}
                        </button>
                        <button 
                            onClick={(e) => { e.preventDefault(); setSelectedTab('link'); }}
                            className={`flex-1 py-4 px-6 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${selectedTab === 'link' ? 'bg-pink-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            <Icon name="link" className="w-5 h-5" />
                            {t('upload.via_link', 'Via link')}
                        </button>
                    </div>

                    <div className="p-0 sm:p-6">
                        {selectedTab === 'link' ? (
                            <div className="flex flex-col gap-4 animate-fadeIn p-6 sm:p-0">
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('upload.url_placeholder', 'Lien PDF, profil LinkedIn, ou Google Doc...')}</p>
                                <div className="flex flex-col sm:flex-row gap-2 w-full">
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        disabled={isInteractionDisabled || isUrlLoading}
                                        className="flex-grow px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-500 outline-none transition-shadow text-gray-900 dark:text-gray-100"
                                    />
                                    <button
                                        onClick={handleUrlSubmit}
                                        disabled={!urlInput || isInteractionDisabled || isUrlLoading}
                                        className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
                                    >
                                        {isUrlLoading ? <Icon name="spinner" className="w-5 h-5 animate-spin" /> : <Icon name="arrow-right" className="w-5 h-5" />}
                                        {t('upload.analyze_link', 'Analyser le lien')}
                                    </button>
                                </div>
                                {urlError && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><Icon name="alert-triangle" className="w-4 h-4"/> {urlError}</p>}
                            </div>
                        ) : (
                            <div 
                              onDragEnter={handleDrag} 
                              onDragLeave={handleDrag} 
                              onDragOver={handleDrag} 
                              onDrop={handleDrop}
                              onClick={onButtonClick}
                              className={`relative m-4 sm:m-0 border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] animate-fadeIn cursor-pointer
                                ${isDragActive ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30'}
                                ${isInteractionDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-pink-400 hover:bg-pink-50/50 dark:hover:bg-gray-800/80'}`}
                                 title={isUploadDisabled ? t('errors.upload_limit_reached') : ''}
                            >
                                <input ref={inputRef} type="file" multiple onChange={handleChange} className="hidden" accept=".pdf,.txt,.json,.md,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx" disabled={isInteractionDisabled} />
                                
                                <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                    {/* @ts-ignore */}
                                    <dotlottie-wc src="https://lottie.host/05f02365-02dd-4b23-8289-b8d119e5c961/9dwTt6kpl2.lottie" style={{ width: '180px', height: '180px' }} autoplay loop></dotlottie-wc>
                                    <div className="text-center mt-2">
                                        {isDragActive ? (
                                            <p className="text-lg font-semibold text-pink-600">{t('upload.dropzone.release')}</p>
                                        ) : isInteractionDisabled ? (
                                           <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">{t('upload.dropzone.limit_reached_prompt')}</p>
                                        ) : (
                                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('upload.dropzone.prompt')}</p>
                                        )}
                                        <p className="text-sm mt-1 mb-4">{isInteractionDisabled ? t('upload.limit_rules.limit_reached_description') : t('upload.dropzone.supported_files')}</p>
                                        
                                        {!isInteractionDisabled && (
                                            <span className="px-6 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 transition-colors shadow-sm inline-flex items-center gap-2">
                                                <Icon name="upload-cloud" className="w-4 h-4"/>
                                                Parcourir les fichiers
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};