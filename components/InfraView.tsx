
import * as React from 'react';
import { useTranslation } from '../i18n';
import { Icon } from './icons';

interface InfraViewProps {}

interface LogEntry {
    date: string;
    type: 'feat' | 'fix' | 'ui' | 'refactor' | 'logic';
    title: string;
    description: string;
}

const logs: LogEntry[] = [
    { date: '2025-02-24', type: 'feat', title: 'Infra Page', description: 'Added technical infrastructure documentation and changelog view for owners.' },
    { date: '2025-02-24', type: 'logic', title: 'Smart Pipeline Logic', description: 'Implemented automated status assignment (Hired/Approved) based on interview results and date validation.' },
    { date: '2025-02-24', type: 'ui', title: 'Mobile Drawers', description: 'Replaced native select dropdowns with touch-friendly bottom sheet Drawers for mobile devices.' },
    { date: '2025-02-24', type: 'ui', title: 'Mobile Card Layouts', description: 'Converted Pipeline and History tables to responsive Card views for better mobile readability.' },
    { date: '2025-02-24', type: 'refactor', title: 'Navigation Update', description: 'Implemented mobile bottom navigation bar and optimized sidebar responsive behavior.' },
    { date: '2025-02-23', type: 'feat', title: 'Pipeline History', description: 'Added snapshot functionality to save and view historical states of the recruitment pipeline.' },
    { date: '2025-02-23', type: 'feat', title: 'Recruitment Pipeline', description: 'Created the main Kanban-style pipeline view with tracking for Interviews, Tech Challenges, and Start Dates.' },
    { date: '2025-02-23', type: 'ui', title: 'Toast Notification System', description: 'Integrated a global Toast provider for user feedback on actions.' },
    { date: '2025-02-23', type: 'feat', title: 'Advanced Filtering', description: 'Replaced simple dashboard dropdowns with a comprehensive full-page Filter Modal (Skills, Location, Experience).' },
    { date: '2025-02-22', type: 'ui', title: 'Sidebar Redesign', description: 'Centered icons and improved visual hierarchy in the sidebar navigation.' },
    { date: '2025-02-22', type: 'fix', title: 'Type Definitions', description: 'Resolved widespread JSX Intrinsic Elements errors and standardized React imports.' },
    { date: '2025-02-21', type: 'feat', title: 'AI Assistant', description: 'Integrated Gemini Flash for contextual chat on specific candidate profiles and global dashboard queries.' },
    { date: '2025-02-20', type: 'feat', title: 'Comparators', description: 'Added side-by-side candidate comparison view with skill overlap highlighting.' },
    { date: '2025-02-19', type: 'ui', title: 'Dashboard Charts', description: 'Implemented Recharts for visualizing skills expertise, location distribution, and experience levels.' },
    { date: '2025-02-18', type: 'feat', title: 'CV Parsing Engine', description: 'Core functionality: Upload, OCR, and parse resume data to JSON using Gemini API.' },
    { date: '2025-02-18', type: 'feat', title: 'Project Init', description: 'Initial application setup with React 19, TypeScript, Tailwind CSS, and Vite.' },
];

const TechCard: React.FC<{ icon: string; title: string; desc: string; color: string }> = ({ icon, title, desc, color }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 flex flex-col gap-2 hover:shadow-md transition-shadow">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
            <Icon name={icon} className="w-6 h-6 text-white" />
        </div>
        <h4 className="font-bold text-gray-800 dark:text-gray-100">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
    </div>
);

export const InfraView: React.FC<InfraViewProps> = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = React.useState<'log' | 'conception'>('log');

    return (
        <div className="p-4 sm:p-8 space-y-6 h-full flex flex-col">
            <div>
                <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-gray-100">{t('infra.title')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('infra.subtitle')}</p>
            </div>

            <div className="flex gap-4 border-b dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('log')}
                    className={`pb-3 px-2 font-semibold transition-colors ${activeTab === 'log' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    {t('infra.tabs.log')}
                </button>
                <button
                    onClick={() => setActiveTab('conception')}
                    className={`pb-3 px-2 font-semibold transition-colors ${activeTab === 'conception' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    {t('infra.tabs.conception')}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === 'log' ? (
                    <div className="max-w-3xl mx-auto py-4">
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent dark:before:via-slate-700">
                            {logs.map((log, idx) => (
                                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-gray-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
                                        log.type === 'feat' ? 'bg-green-500' : 
                                        log.type === 'fix' ? 'bg-red-500' : 
                                        log.type === 'ui' ? 'bg-purple-500' : 
                                        'bg-blue-500'
                                    }`}>
                                        <Icon 
                                            name={log.type === 'feat' ? 'plus' : log.type === 'fix' ? 'check' : log.type === 'ui' ? 'sparkles' : 'refresh-cw'} 
                                            className="w-5 h-5 text-white" 
                                        />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-gray-900 dark:text-white">{log.title}</span>
                                            <time className="font-mono font-medium text-gray-400 text-xs">{log.date}</time>
                                        </div>
                                        <div className="mb-2">
                                             <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                log.type === 'feat' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                log.type === 'fix' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                log.type === 'ui' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                            }`}>
                                                {log.type === 'logic' ? 'Logic' : t(`infra.log.${log.type}`)}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{log.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 pb-12">
                         {/* Tech Stack Section */}
                        <section>
                            <h3 className="text-xl font-bold font-display text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Icon name="layers" className="w-6 h-6 text-primary-500" />
                                {t('infra.conception.tech_stack')}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <TechCard icon="code" title="React 19" desc={t('infra.conception.frontend')} color="bg-blue-500" />
                                <TechCard icon="code" title="TypeScript" desc="Static Typing" color="bg-blue-700" />
                                <TechCard icon="sparkles" title="Tailwind CSS" desc={t('infra.conception.styling')} color="bg-cyan-500" />
                                <TechCard icon="bot" title="Gemini 2.5 Flash" desc={t('infra.conception.ai')} color="bg-purple-600" />
                                <TechCard icon="database" title="LocalStorage" desc={t('infra.conception.storage')} color="bg-orange-500" />
                            </div>
                        </section>

                        {/* Architecture Flow Section */}
                        <section>
                            <h3 className="text-xl font-bold font-display text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Icon name="activity" className="w-6 h-6 text-primary-500" />
                                {t('infra.conception.architecture')}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">{t('infra.conception.flow_desc')}</p>
                            <div className="bg-slate-50 dark:bg-gray-900 p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 overflow-x-auto">
                                <div className="flex items-center justify-between min-w-[600px] gap-4">
                                    {/* Nodes */}
                                    <div className="flex flex-col items-center gap-2 w-32">
                                        <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center shadow-sm">
                                            <Icon name="upload" className="w-8 h-8 text-gray-500" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">User Upload</span>
                                    </div>
                                    <Icon name="arrow-right" className="w-6 h-6 text-gray-400" />
                                    
                                    <div className="flex flex-col items-center gap-2 w-32">
                                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700 flex items-center justify-center shadow-sm">
                                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">Base64</span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">File Processing</span>
                                    </div>
                                    <Icon name="arrow-right" className="w-6 h-6 text-gray-400" />
                                    
                                    <div className="flex flex-col items-center gap-2 w-32">
                                        <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700 flex items-center justify-center shadow-sm animate-pulse">
                                            <Icon name="bot" className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Gemini API</span>
                                    </div>
                                    <Icon name="arrow-right" className="w-6 h-6 text-gray-400" />
                                    
                                    <div className="flex flex-col items-center gap-2 w-32">
                                        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-700 flex items-center justify-center shadow-sm">
                                            <span className="font-mono text-xs font-bold text-green-600 dark:text-green-400">JSON</span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Parsing</span>
                                    </div>
                                    <Icon name="arrow-right" className="w-6 h-6 text-gray-400" />
                                    
                                    <div className="flex flex-col items-center gap-2 w-32">
                                        <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center shadow-sm">
                                            <Icon name="dashboard" className="w-8 h-8 text-primary-500" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">UI / State</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Data Models Section */}
                         <section>
                            <h3 className="text-xl font-bold font-display text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Icon name="database" className="w-6 h-6 text-primary-500" />
                                {t('infra.conception.data_models')}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-green-400 overflow-x-auto">
                                    <div className="text-gray-400 mb-2">// CandidateProfile Interface</div>
                                    <pre>{`interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  location: string;
  skills: {
    hard: string[];
    soft: string[];
  };
  experience: Experience[];
  education: Education[];
  performanceScore: number;
  jobCategory: string;
}`}</pre>
                                </div>
                                <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-blue-400 overflow-x-auto">
                                    <div className="text-gray-400 mb-2">// RecruitmentData Interface</div>
                                    <pre>{`interface RecruitmentData {
  candidateId: string;
  status: 'Application' | 'Interview' ...;
  interview1Date: string;
  interview1Result: 'Excellent' | 'Good'...;
  challengeDone: boolean;
  startDate: string;
}`}</pre>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};
