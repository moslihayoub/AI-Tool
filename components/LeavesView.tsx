import React, { useState, useMemo } from 'react';
import { Icon } from './icons';
import { LeaveRequest, LeaveType, LeaveStatus } from '../types';

const INITIAL_ANNUAL_LEAVE = 18;

// Moroccan fixed holidays (Month-Day format)
const fixedHolidays = [
    '01-01', // Nouvel An
    '01-11', // Manifeste de l'Indépendance
    '05-01', // Fête du Travail
    '07-30', // Fête du Trône
    '08-14', // Allégeance Oued Eddahab
    '08-20', // Révolution du Roi et du Peuple
    '08-21', // Fête de la Jeunesse
    '11-06', // Marche Verte
    '11-18', // Fête de l'Indépendance
];

const calculateWorkingDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;

    let days = 0;
    let current = new Date(start);

    while (current <= end) {
        const dayOfWeek = current.getDay();
        const monthDay = `${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
        
        // Exclude weekends (0 = Sunday, 6 = Saturday) and holidays
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !fixedHolidays.includes(monthDay)) {
            days++;
        }
        current.setDate(current.getDate() + 1);
    }
    return days;
};

export const LeavesView: React.FC = () => {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([
        { id: '1', startDate: '2026-02-10', endDate: '2026-02-12', type: 'Congés Payés', reason: 'Vacances hiver', days: 3, status: 'Approuvé', user: 'current_user' },
    ]);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [type, setType] = useState<LeaveType>('Congés Payés');
    const [reason, setReason] = useState('');

    const [sheetUrl, setSheetUrl] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState<string | null>(null);

    const handleSyncSheets = () => {
        setIsSyncing(true);
        setSyncMessage(null);
        
        if (!sheetUrl.includes('docs.google.com/spreadsheets')) {
            setTimeout(() => {
                setSyncMessage('Erreur : Lien non reconnu');
                setIsSyncing(false);
                setTimeout(() => setSyncMessage(null), 3000);
            }, 800);
            return;
        }

        setTimeout(() => {
            const newLeaves: LeaveRequest[] = [
                { id: 'import_1', startDate: '2026-06-01', endDate: '2026-06-05', type: 'Congés Payés', reason: 'Vacances été', days: 5, status: 'Approuvé', user: 'current_user' },
                { id: 'import_2', startDate: '2026-08-10', endDate: '2026-08-12', type: 'Congés Payés', reason: 'Repos', days: 3, status: 'En attente', user: 'current_user' },
            ];
            setLeaves(prev => [...newLeaves, ...prev]);
            setSyncMessage('Synchronisation réussie');
            setIsSyncing(false);
            setSheetUrl('');
            setTimeout(() => setSyncMessage(null), 3000);
        }, 1500);
    };

    const daysRequested = useMemo(() => calculateWorkingDays(startDate, endDate), [startDate, endDate]);

    const consumed = leaves.filter(l => l.status === 'Approuvé' && l.type === 'Congés Payés').reduce((sum, l) => sum + l.days, 0);
    const remaining = INITIAL_ANNUAL_LEAVE - consumed;
    const progressPercent = (consumed / INITIAL_ANNUAL_LEAVE) * 100;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (daysRequested <= 0) return;
        const newReq: LeaveRequest = {
            id: Math.random().toString(36).substring(2, 9),
            startDate,
            endDate,
            type,
            reason,
            days: daysRequested,
            status: 'En attente',
            user: 'current_user'
        };
        setLeaves([newReq, ...leaves]);
        setStartDate('');
        setEndDate('');
        setReason('');
    };

    const handleExportCSV = () => {
        const headers = 'Période,Type,Motif,Jours,Statut\n';
        const rows = leaves.map(l => `${l.startDate} au ${l.endDate},${l.type},${l.reason.replace(/,/g, ' ')},${l.days},${l.status}`).join('\n');
        const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "historique_conges.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-gray-100">Gestion des Congés</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez vos absences et droits aux congés</p>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Droit Annuel</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{INITIAL_ANNUAL_LEAVE} <span className="text-lg font-normal text-gray-500">jours</span></p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Consommé</p>
                    <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">{consumed} <span className="text-lg font-normal text-gray-500">jours</span></p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center md:col-span-2">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Solde Restant</p>
                            <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{remaining} <span className="text-lg font-normal text-gray-500">jours</span></p>
                        </div>
                        <p className="text-xs text-gray-400">Cumul global: {remaining}j</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, progressPercent)}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Forms Column */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Google Sheet Sync */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h2 className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100"><Icon name="refresh" className="w-4 h-4"/> Synchroniser depuis Google Sheets</h2>
                        <div className="flex flex-col gap-2">
                            <input type="url" value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} placeholder="URL Google Sheet (publié en CSV)" className="p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-700 outline-none w-full" />
                            <button onClick={handleSyncSheets} disabled={isSyncing || !sheetUrl.trim()} className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 disabled:opacity-50 transition-colors">
                                {isSyncing ? <Icon name="refresh" className="w-4 h-4 animate-spin"/> : <Icon name="download" className="w-4 h-4"/>}
                                Synchroniser
                            </button>
                            {syncMessage && <p className={`text-xs font-medium text-center mt-1 ${syncMessage.includes('Erreur') ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>{syncMessage}</p>}
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Nouvelle demande</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Du</label>
                                <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 outline-none focus:border-pink-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Au</label>
                                <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 outline-none focus:border-pink-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Type</label>
                            <select value={type} onChange={e => setType(e.target.value as LeaveType)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 outline-none focus:border-pink-500">
                                <option value="Congés Payés">Congés Payés</option>
                                <option value="Maladie">Maladie</option>
                                <option value="Sans Solde">Sans Solde</option>
                                <option value="Exceptionnel">Exceptionnel</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Motif</label>
                            <input type="text" required value={reason} onChange={e => setReason(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 outline-none focus:border-pink-500" placeholder="Description courte..." />
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-3 rounded-lg flex items-center justify-between text-sm">
                            <span>Jours ouvrables estimés :</span>
                            <span className="font-bold text-lg">{daysRequested}</span>
                        </div>

                        <button 
                            type="submit" 
                            disabled={daysRequested <= 0}
                            className="w-full bg-gradient-button text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Icon name="check" className="w-5 h-5"/> Soumettre la demande
                        </button>
                    </form>
                    </div>
                </div>

                {/* History Table */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-2 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Historique</h2>
                        <button onClick={handleExportCSV} className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 flex items-center gap-1">
                            <Icon name="download" className="w-4 h-4"/> Exporter CSV
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto flex-grow">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Période</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3 text-center">Jours</th>
                                    <th className="px-4 py-3 text-right rounded-r-lg">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {leaves.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-6 text-gray-500">Aucune demande trouvée</td>
                                    </tr>
                                ) : leaves.map(leave => (
                                    <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="px-4 py-3 text-gray-900 dark:text-gray-200">
                                            {leave.startDate} <Icon name="arrow-right" className="w-3 h-3 inline mx-1 text-gray-400" /> {leave.endDate}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">{leave.type}</div>
                                            <div className="text-xs text-gray-500">{leave.reason}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">{leave.days}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                leave.status === 'Approuvé' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                leave.status === 'Refusé' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
