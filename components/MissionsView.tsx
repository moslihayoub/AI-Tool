
import * as React from 'react';
import { Mission, CandidateProfile, MissionStatus, ContractType, WorkMode, Periodicity } from '../types';
import { useTranslation } from '../i18n';
import { Icon } from './icons';
import { useToast } from './Toast';

interface MissionsViewProps {
    missions: Mission[];
    candidates: CandidateProfile[];
    onUpdateMission: (mission: Mission) => void;
    onCreateMission: (mission: Mission) => void;
    prefillData?: Partial<Mission> | null;
}

export const MissionsView: React.FC<MissionsViewProps> = ({ missions, candidates, onUpdateMission, onCreateMission, prefillData }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [animateSidebar, setAnimateSidebar] = React.useState(false);
    const [editingMission, setEditingMission] = React.useState<Partial<Mission>>({});
    
    // Form State
    const [selectedCandidateId, setSelectedCandidateId] = React.useState('');
    const [client, setClient] = React.useState('');
    const [title, setTitle] = React.useState('');
    
    // Contract & Loc
    const [contractType, setContractType] = React.useState<ContractType>('FREELANCE');
    const [workMode, setWorkMode] = React.useState<WorkMode>('Hybrid');
    const [city, setCity] = React.useState('');
    const [country, setCountry] = React.useState('');
    
    // Dates & Status
    const [status, setStatus] = React.useState<MissionStatus>('Draft');
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    
    // Remuneration
    const [remuneration, setRemuneration] = React.useState(0);
    const [currency, setCurrency] = React.useState('EUR');
    
    // Time Tracking
    const [ttEnabled, setTtEnabled] = React.useState(true);
    const [ttPeriodicity, setTtPeriodicity] = React.useState<Periodicity>('Monthly');
    const [ttApprover, setTtApprover] = React.useState('');

    // Handle Animation
    React.useEffect(() => {
        if (isSidebarOpen) {
            setAnimateSidebar(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setAnimateSidebar(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isSidebarOpen]);

    // Handle Prefill
    React.useEffect(() => {
        if (prefillData) {
            resetForm();
            setSelectedCandidateId(prefillData.candidateId || '');
            setTitle(prefillData.title || '');
            setCity(prefillData.city || '');
            setCountry(prefillData.country || '');
            setContractType(prefillData.contractType || 'FREELANCE');
            setWorkMode(prefillData.workMode || 'Hybrid');
            setIsSidebarOpen(true);
        }
    }, [prefillData]);

    // Derived State
    const isSalaried = ['CDI', 'CDD', 'STAGE'].includes(contractType);
    const remunerationLabel = isSalaried ? "Salaire Mensuel Brut" : "TJM (Tarif Journalier)";

    const resetForm = () => {
        setEditingMission({});
        setSelectedCandidateId('');
        setClient('');
        setTitle('');
        setContractType('FREELANCE');
        setWorkMode('Hybrid');
        setCity('');
        setCountry('');
        setStatus('Draft');
        setStartDate('');
        setEndDate('');
        setRemuneration(0);
        setCurrency('EUR');
        setTtEnabled(true);
        setTtPeriodicity('Monthly');
        setTtApprover('');
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsSidebarOpen(true);
    };

    const handleEdit = (mission: Mission) => {
        setEditingMission(mission);
        setSelectedCandidateId(mission.candidateId);
        setClient(mission.client);
        setTitle(mission.title);
        setContractType(mission.contractType);
        setWorkMode(mission.workMode);
        setCity(mission.city);
        setCountry(mission.country);
        setStatus(mission.status);
        setStartDate(mission.startDate);
        setEndDate(mission.endDate || '');
        setRemuneration(mission.remuneration);
        setCurrency(mission.currency);
        
        setTtEnabled(mission.timeTracking.enabled);
        setTtPeriodicity(mission.timeTracking.periodicity);
        setTtApprover(mission.timeTracking.approverEmail || '');
        
        setIsSidebarOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const candidate = candidates.find(c => c.id === selectedCandidateId);
        
        const missionData: Mission = {
            id: editingMission.id || `mission-${Date.now()}`,
            candidateId: selectedCandidateId,
            candidateName: candidate?.name || 'Unknown',
            client,
            title,
            contractType,
            workMode,
            city,
            country,
            startDate,
            endDate,
            status,
            remuneration,
            currency,
            remunerationType: isSalaried ? 'Monthly' : 'Daily',
            timeTracking: {
                enabled: ttEnabled,
                periodicity: ttPeriodicity,
                approverEmail: ttApprover,
                standardHoursPerDay: 8
            }
        };

        if (editingMission.id) {
            onUpdateMission(missionData);
        } else {
            onCreateMission(missionData);
        }
        setIsSidebarOpen(false);
    };

    const exportToCsv = () => {
        if (!window.XLSX) {
            showToast('Export library loading...', 'info');
            return;
        }
        const data = missions.map(m => ({
            Consultant: m.candidateName,
            Client: m.client,
            Titre: m.title,
            Contrat: m.contractType,
            Lieu: `${m.city}, ${m.country}`,
            Remuneration: m.remuneration,
            Devise: m.currency,
            Debut: m.startDate,
            Fin: m.endDate,
            Statut: m.status
        }));
        const ws = window.XLSX.utils.json_to_sheet(data);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Missions");
        window.XLSX.writeFile(wb, `ParseLIQ_Missions_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const getStatusColor = (status: MissionStatus) => {
        switch(status) {
            case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'Draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
            case 'Upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'Ended': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'Paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            default: return 'bg-gray-100';
        }
    };

    return (
        <div className="p-4 sm:p-8 space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-gray-100">{t('sidebar.missions')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez vos consultants et projets en cours.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={exportToCsv}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-full flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                        <Icon name="download" className="w-5 h-5"/>
                        <span className="hidden sm:inline">Export CSV</span>
                    </button>
                    <button 
                        onClick={handleOpenCreate} 
                        className="bg-gradient-button text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <Icon name="plus" className="w-5 h-5"/>
                        <span>Nouvelle Mission</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {missions.map(mission => (
                    <div key={mission.id} onClick={() => handleEdit(mission)} className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                             <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(mission.status)}`}>
                                {mission.status}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-4 mt-2">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg">
                                {mission.candidateName.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{mission.candidateName}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{mission.contractType}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Mission</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{mission.title}</p>
                                <p className="text-xs text-gray-500">{mission.client}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold">Lieu</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{mission.city}, {mission.country}</p>
                                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">{mission.workMode}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold">{mission.remunerationType === 'Daily' ? 'TJM' : 'Salaire'}</p>
                                    <p className="text-sm font-mono font-bold text-gray-800 dark:text-gray-200">{mission.remuneration} {mission.currency}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t dark:border-gray-700 flex items-center text-xs text-gray-500 dark:text-gray-400 gap-1">
                            <Icon name="calendar" className="w-3 h-3" />
                            <span>{mission.startDate}</span>
                            <Icon name="arrow-right" className="w-3 h-3 mx-1" />
                            <span>{mission.endDate || '...'}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Right Sidebar (50% width) */}
            {(isSidebarOpen || animateSidebar) && (
                <div className={`fixed inset-0 z-[60] flex justify-end transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                    
                    {/* Sidebar Panel */}
                    <div 
                        className={`relative w-full md:w-1/2 h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    >
                        <div className="flex justify-between items-center p-6 border-b dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
                            <div>
                                <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white">
                                    {editingMission.id ? "Modifier la Mission" : "Nouvelle Mission"}
                                </h3>
                                <p className="text-sm text-gray-500">Définissez le cadre contractuel et opérationnel.</p>
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <Icon name="close" className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6">
                            <form id="missionForm" onSubmit={handleSubmit} className="space-y-8">
                                
                                {/* Section 1: Informations Générales */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-primary-100 text-primary-600 flex items-center justify-center text-xs">1</div>
                                        Informations Générales
                                    </h4>
                                    <div className="grid gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Titre de la mission / Rôle</label>
                                            <input 
                                                type="text" 
                                                value={title} 
                                                onChange={e => setTitle(e.target.value)}
                                                className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                                placeholder="ex: Développeur React Senior"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Client / Projet</label>
                                                <input 
                                                    type="text" 
                                                    value={client} 
                                                    onChange={e => setClient(e.target.value)}
                                                    className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                                                    placeholder="Nom du client"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Consultant</label>
                                                <select 
                                                    value={selectedCandidateId} 
                                                    onChange={e => setSelectedCandidateId(e.target.value)}
                                                    className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                                                    required
                                                >
                                                    <option value="">Sélectionner...</option>
                                                    {candidates.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Contrat & Lieu */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-primary-100 text-primary-600 flex items-center justify-center text-xs">2</div>
                                        Contrat & Lieu
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Type de contrat</label>
                                            <select 
                                                value={contractType} 
                                                onChange={e => setContractType(e.target.value as ContractType)}
                                                className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                                            >
                                                <option value="FREELANCE">Freelance</option>
                                                <option value="CDI">CDI</option>
                                                <option value="CDD">CDD</option>
                                                <option value="INTERIM">Intérim</option>
                                                <option value="STAGE">Stage</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Statut</label>
                                            <select 
                                                value={status} 
                                                onChange={e => setStatus(e.target.value as MissionStatus)}
                                                className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                                            >
                                                <option value="Draft">Brouillon</option>
                                                <option value="Upcoming">À démarrer</option>
                                                <option value="Active">Active</option>
                                                <option value="Paused">En pause</option>
                                                <option value="Ended">Terminée</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Mode</label>
                                            <select 
                                                value={workMode} 
                                                onChange={e => setWorkMode(e.target.value as WorkMode)}
                                                className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600 text-sm"
                                            >
                                                <option value="OnSite">Sur site</option>
                                                <option value="Remote">Remote</option>
                                                <option value="Hybrid">Hybride</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Ville</label>
                                            <input 
                                                type="text" 
                                                value={city} 
                                                onChange={e => setCity(e.target.value)}
                                                className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600 text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Pays</label>
                                            <input 
                                                type="text" 
                                                value={country} 
                                                onChange={e => setCountry(e.target.value)}
                                                className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600 text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Date de début</label>
                                            <input 
                                                type="date" 
                                                value={startDate} 
                                                onChange={e => setStartDate(e.target.value)}
                                                className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Date de fin (opt.)</label>
                                            <input 
                                                type="date" 
                                                value={endDate} 
                                                onChange={e => setEndDate(e.target.value)}
                                                className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Rémunération */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-primary-100 text-primary-600 flex items-center justify-center text-xs">3</div>
                                        Rémunération
                                    </h4>
                                    <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl border border-primary-100 dark:border-primary-800/50">
                                        <label className="block text-sm font-bold text-primary-800 dark:text-primary-300 mb-2">
                                            {remunerationLabel}
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={remuneration} 
                                                onChange={e => setRemuneration(Number(e.target.value))}
                                                className="w-full p-3 pl-4 pr-16 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none font-mono text-lg font-semibold"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                                                {currency}
                                            </div>
                                        </div>
                                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-2">
                                            {isSalaried ? "Montant brut mensuel hors primes." : "Tarif journalier hors taxes."}
                                        </p>
                                    </div>
                                </div>

                                {/* Section 4: Suivi des Temps */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-primary-100 text-primary-600 flex items-center justify-center text-xs">4</div>
                                        Suivi des temps
                                    </h4>
                                    <div className="border dark:border-gray-700 rounded-xl p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium">Activer les feuilles de temps</label>
                                            <button 
                                                type="button" 
                                                onClick={() => setTtEnabled(!ttEnabled)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${ttEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ttEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                        
                                        {ttEnabled && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-fade-in">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Périodicité</label>
                                                    <select 
                                                        value={ttPeriodicity} 
                                                        onChange={e => setTtPeriodicity(e.target.value as Periodicity)}
                                                        className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600 text-sm"
                                                    >
                                                        <option value="Weekly">Hebdomadaire</option>
                                                        <option value="Monthly">Mensuel</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Email Approbateur</label>
                                                    <input 
                                                        type="email" 
                                                        value={ttApprover} 
                                                        onChange={e => setTtApprover(e.target.value)}
                                                        placeholder="manager@client.com"
                                                        className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </form>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                            <button 
                                type="submit"
                                form="missionForm"
                                className="w-full bg-gradient-button text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 text-lg"
                            >
                                <Icon name={editingMission.id ? "save" : "check"} className="w-6 h-6" />
                                <span>{editingMission.id ? "Mettre à jour la mission" : "Créer la mission"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
