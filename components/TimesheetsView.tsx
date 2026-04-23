
import * as React from 'react';
import { Timesheet, TimesheetStatus, TimesheetDay, Mission, User } from '../types';
import { useTranslation } from '../i18n';
import { Icon } from './icons';

interface TimesheetsViewProps {
    timesheets: Timesheet[];
    onUpdateStatus: (id: string, status: TimesheetStatus) => void;
    onSaveTimesheet: (timesheet: Timesheet) => void;
    missions?: Mission[];
    currentUser?: User | null;
}

export const TimesheetsView: React.FC<TimesheetsViewProps> = ({ timesheets, onUpdateStatus, onSaveTimesheet, missions = [], currentUser }) => {
    const { t } = useTranslation();
    const [selectedTimesheet, setSelectedTimesheet] = React.useState<Timesheet | null>(null);
    const [isCreatorOpen, setIsCreatorOpen] = React.useState(false);
    const [editingTimesheet, setEditingTimesheet] = React.useState<Partial<Timesheet>>({});
    const [animateSidebar, setAnimateSidebar] = React.useState(false);

    // Active missions only
    const activeMissions = React.useMemo(() => missions.filter(m => m.status === 'Active'), [missions]);

    React.useEffect(() => {
        if (isCreatorOpen) {
            setAnimateSidebar(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setAnimateSidebar(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isCreatorOpen]);

    const getStatusBadge = (status: TimesheetStatus) => {
        const styles = {
            'Draft': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            'Submitted': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
            'Validated': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        };
        const labels = {
            'Draft': 'Brouillon',
            'Submitted': 'En attente',
            'Validated': 'Validé',
            'Rejected': 'Refusé'
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${styles[status]}`}>{labels[status] || status}</span>;
    };

    const handleCreateNew = () => {
        setEditingTimesheet({
            missionId: '',
            consultantName: '',
            clientName: '',
            periodStart: getMonday(new Date()).toISOString().split('T')[0],
            status: 'Draft',
            days: []
        });
        setIsCreatorOpen(true);
    };

    const handleEdit = (ts: Timesheet) => {
        setEditingTimesheet({ ...ts });
        setIsCreatorOpen(true);
    };

    const getMonday = (d: Date) => {
        d = new Date(d);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const generateDays = (startDateStr: string) => {
        const start = new Date(startDateStr);
        const days: TimesheetDay[] = [];
        for (let i = 0; i < 7; i++) { // Default to 7 days
            const current = new Date(start);
            current.setDate(start.getDate() + i);
            const dateStr = current.toISOString().split('T')[0];
            
            // Check if it's weekend
            const isWeekend = current.getDay() === 0 || current.getDay() === 6;
            
            days.push({
                date: dateStr,
                hours: isWeekend ? 0 : 8, // Default 8h for weekdays
                type: isWeekend ? 'Weekend' : 'Production',
                note: ''
            });
        }
        return days;
    };

    const handleMissionChange = (missionId: string) => {
        const mission = activeMissions.find(m => m.id === missionId);
        if (mission) {
            setEditingTimesheet(prev => ({
                ...prev,
                missionId: mission.id,
                consultantName: mission.candidateName,
                clientName: mission.client,
                // Generate days if not present or if explicit reset needed
                days: prev.days && prev.days.length > 0 ? prev.days : generateDays(prev.periodStart || new Date().toISOString().split('T')[0])
            }));
        }
    };

    const handlePeriodChange = (dateStr: string) => {
        // Assume weekly for now, snap to Monday
        const selectedDate = new Date(dateStr);
        const monday = getMonday(selectedDate).toISOString().split('T')[0];
        
        setEditingTimesheet(prev => ({
            ...prev,
            periodStart: monday,
            periodEnd: new Date(new Date(monday).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            days: generateDays(monday)
        }));
    };

    const updateDay = (index: number, field: keyof TimesheetDay, value: any) => {
        setEditingTimesheet(prev => {
            if (!prev.days) return prev;
            const newDays = [...prev.days];
            newDays[index] = { ...newDays[index], [field]: value };
            
            // Auto-zero hours if Absence or Weekend
            if (field === 'type' && (value === 'Absence' || value === 'Weekend' || value === 'Holiday')) {
                newDays[index].hours = 0;
            }
            // Auto-8h if switching back to Production from Absence (UX nicety)
            if (field === 'type' && value === 'Production' && newDays[index].hours === 0) {
                newDays[index].hours = 8;
            }

            return { ...prev, days: newDays };
        });
    };

    const calculateTotal = () => {
        return editingTimesheet.days?.reduce((sum, day) => sum + (Number(day.hours) || 0), 0) || 0;
    };

    const saveTimesheet = (status: TimesheetStatus) => {
        if (!editingTimesheet.missionId) {
            alert("Veuillez sélectionner une mission.");
            return;
        }

        const totalHours = calculateTotal();
        const totalDays = editingTimesheet.days?.filter(d => d.hours > 0).length || 0;
        
        const historyEntry = {
            date: new Date().toISOString(),
            action: status === 'Draft' ? 'Brouillon sauvegardé' : 'Soumis pour validation',
            user: currentUser?.email || 'Moi'
        };

        const finalTimesheet: Timesheet = {
            id: editingTimesheet.id || `ts-${Date.now()}`,
            missionId: editingTimesheet.missionId!,
            consultantName: editingTimesheet.consultantName || 'Unknown',
            clientName: editingTimesheet.clientName || 'Unknown',
            periodStart: editingTimesheet.periodStart!,
            periodEnd: editingTimesheet.periodEnd || new Date(new Date(editingTimesheet.periodStart!).getTime() + 6*86400000).toISOString().split('T')[0],
            totalHours,
            totalDays,
            status: status,
            days: editingTimesheet.days || [],
            rejectionReason: status === 'Submitted' ? undefined : editingTimesheet.rejectionReason, // Clear rejection reason on resubmit
            history: [...(editingTimesheet.history || []), historyEntry]
        };

        onSaveTimesheet(finalTimesheet);
        setIsCreatorOpen(false);
    };

    const exportToCsv = () => {
        if (!window.XLSX) return;
        const data = timesheets.flatMap(ts => ts.days.map(d => ({
            Consultant: ts.consultantName,
            Client: ts.clientName,
            Date: d.date,
            Heures: d.hours,
            Type: d.type,
            Note: d.note || ''
        })));
        const ws = window.XLSX.utils.json_to_sheet(data);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Timesheets");
        window.XLSX.writeFile(wb, `ParseLIQ_Timesheets.xlsx`);
    };

    const exportToPdf = (ts: Timesheet) => {
        if (!window.jspdf) return;
        const doc = new window.jspdf.jsPDF();
        doc.setFontSize(18);
        doc.text("Feuille de Temps", 14, 22);
        doc.setFontSize(11);
        doc.text(`Consultant: ${ts.consultantName}`, 14, 32);
        doc.text(`Client: ${ts.clientName}`, 14, 38);
        doc.text(`Période: ${ts.periodStart} au ${ts.periodEnd}`, 14, 44);
        
        doc.autoTable({
            startY: 50,
            head: [['Date', 'Heures', 'Type', 'Note']],
            body: ts.days.map(d => [d.date, d.hours, d.type, d.note || '']),
        });
        
        doc.save(`Timesheet_${ts.consultantName}.pdf`);
    };

    const selectedMission = activeMissions.find(m => m.id === editingTimesheet.missionId);

    return (
        <div className="p-4 sm:p-8 space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-gray-100">{t('sidebar.timesheets')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Suivi et validation des heures.</p>
                </div>
                <div className="flex gap-2">
                     <button 
                        onClick={exportToCsv}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-full flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                        <Icon name="download" className="w-5 h-5"/>
                        <span className="hidden sm:inline">Export Global</span>
                    </button>
                    <button 
                        onClick={handleCreateNew}
                        className="bg-gradient-button text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <Icon name="plus" className="w-5 h-5"/>
                        <span>Saisir Heures</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden">
                {/* List - Left Panel */}
                <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden flex flex-col shadow-sm">
                    <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200">Mes Feuilles</h3>
                        <div className="flex gap-1">
                             <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full" title="En attente">
                                {timesheets.filter(t => t.status === 'Submitted').length}
                            </span>
                             <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full" title="Refusé">
                                {timesheets.filter(t => t.status === 'Rejected').length}
                            </span>
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {timesheets.length === 0 && (
                            <div className="p-8 text-center text-gray-400 text-sm">Aucune feuille de temps.</div>
                        )}
                        {timesheets.map(ts => (
                            <div 
                                key={ts.id} 
                                onClick={() => setSelectedTimesheet(ts)}
                                className={`p-4 border-b dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedTimesheet?.id === ts.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-sm text-gray-900 dark:text-white truncate">{ts.consultantName}</span>
                                    <span className="text-xs font-mono font-semibold text-gray-500">{ts.totalHours}h</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 truncate max-w-[120px]">{ts.clientName}</span>
                                        <span className="text-[10px] text-gray-400">{ts.periodStart}</span>
                                    </div>
                                    {getStatusBadge(ts.status)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail - Right Panel */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 flex flex-col shadow-sm overflow-hidden">
                    {selectedTimesheet ? (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white">{selectedTimesheet.consultantName}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                        <Icon name="briefcase" className="w-4 h-4" />
                                        <span>{selectedTimesheet.clientName}</span>
                                        <span className="mx-1">•</span>
                                        <span>{selectedTimesheet.periodStart} - {selectedTimesheet.periodEnd}</span>
                                    </div>
                                    {selectedTimesheet.status === 'Rejected' && selectedTimesheet.rejectionReason && (
                                        <div className="mt-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-md border border-red-200 dark:border-red-800">
                                            <strong>Refusé : </strong> {selectedTimesheet.rejectionReason}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex gap-2 mb-2">
                                        {(selectedTimesheet.status === 'Draft' || selectedTimesheet.status === 'Rejected') && (
                                            <button onClick={() => handleEdit(selectedTimesheet)} className="text-primary-600 hover:text-primary-800 flex items-center gap-1 text-sm font-semibold mr-2">
                                                <Icon name="code" className="w-4 h-4"/> Modifier
                                            </button>
                                        )}
                                        <button onClick={() => exportToPdf(selectedTimesheet)} className="text-gray-500 hover:text-gray-700" title="PDF">
                                            <Icon name="download" className="w-5 h-5"/>
                                        </button>
                                    </div>
                                    <div className="text-3xl font-bold font-mono text-primary-600 dark:text-primary-400">
                                        {selectedTimesheet.totalHours}<span className="text-sm font-sans text-gray-500 ml-1">h</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Grid Body */}
                            <div className="p-6 flex-1 overflow-y-auto">
                                <div className="border dark:border-gray-700 rounded-lg overflow-hidden mb-6">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 uppercase text-xs font-bold">
                                            <tr>
                                                <th className="p-3">Date</th>
                                                <th className="p-3">Type</th>
                                                <th className="p-3 text-center">Heures</th>
                                                <th className="p-3">Note</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-gray-700">
                                            {selectedTimesheet.days.map((day, i) => (
                                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="p-3 font-medium text-gray-900 dark:text-gray-100">
                                                        {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                            day.type === 'Production' ? 'bg-blue-100 text-blue-800' :
                                                            day.type === 'Absence' ? 'bg-red-100 text-red-800' :
                                                            day.type === 'Weekend' ? 'bg-gray-200 text-gray-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {day.type}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center font-mono font-bold">
                                                        {day.hours}
                                                    </td>
                                                    <td className="p-3 text-gray-500 italic max-w-xs truncate">
                                                        {day.note || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {selectedTimesheet.history && selectedTimesheet.history.length > 0 && (
                                    <div className="border-t dark:border-gray-700 pt-4">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Historique des modifications</h4>
                                        <div className="space-y-3">
                                            {selectedTimesheet.history.map((entry, idx) => (
                                                <div key={idx} className="flex items-start gap-3 text-sm">
                                                    <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-gray-900 dark:text-gray-200">
                                                            <span className="font-semibold">{entry.user}</span> a effectué : {entry.action}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(entry.date).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions Footer */}
                            <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/20">
                                {(selectedTimesheet.status === 'Submitted') ? (
                                    <>
                                        <button 
                                            onClick={() => onUpdateStatus(selectedTimesheet.id, 'Rejected')}
                                            className="px-6 py-2.5 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-bold transition-colors flex items-center gap-2"
                                        >
                                            <Icon name="close" className="w-4 h-4" />
                                            Refuser
                                        </button>
                                        <button 
                                            onClick={() => onUpdateStatus(selectedTimesheet.id, 'Validated')}
                                            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md font-bold transition-transform active:scale-95 flex items-center gap-2"
                                        >
                                            <Icon name="check" className="w-4 h-4" />
                                            Valider
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-sm text-gray-500 italic flex items-center gap-2">
                                        <Icon name="info" className="w-4 h-4" />
                                        Statut actuel : {getStatusBadge(selectedTimesheet.status)}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <Icon name="clock" className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300">Aucune feuille sélectionnée</h3>
                            <p className="text-sm">Cliquez sur une feuille de temps à gauche pour voir les détails et valider.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Creation/Edit Drawer */}
            {(isCreatorOpen || animateSidebar) && (
                <div className={`fixed inset-0 z-[60] flex justify-end transition-opacity duration-300 ${isCreatorOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCreatorOpen(false)} />
                    <div className={`relative w-full md:w-[600px] h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${isCreatorOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="flex justify-between items-center p-6 border-b dark:border-gray-800">
                            <div>
                                <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white">
                                    {editingTimesheet.id ? "Modifier Feuille" : "Nouvelle Feuille"}
                                </h3>
                                <p className="text-sm text-gray-500">Saisissez vos heures pour la période.</p>
                            </div>
                            <button onClick={() => setIsCreatorOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                <Icon name="close" className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Mission & Period */}
                            <div className="grid gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Mission</label>
                                    <select 
                                        value={editingTimesheet.missionId} 
                                        onChange={e => handleMissionChange(e.target.value)}
                                        className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                                        disabled={!!editingTimesheet.id} // Lock mission on edit
                                    >
                                        <option value="">-- Sélectionner --</option>
                                        {activeMissions.map(m => (
                                            <option key={m.id} value={m.id}>{m.candidateName} - {m.title} ({m.client})</option>
                                        ))}
                                    </select>
                                    {selectedMission && (
                                        <div className="mt-2 text-sm text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20 p-2 rounded border border-primary-200 dark:border-primary-800">
                                            <span className="font-bold">{selectedMission.remunerationType === 'Daily' ? 'TJM' : 'Salaire Mensuel'} :</span> {selectedMission.remuneration} {selectedMission.currency}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Début Période (Lundi)</label>
                                    <input 
                                        type="date" 
                                        value={editingTimesheet.periodStart} 
                                        onChange={e => handlePeriodChange(e.target.value)}
                                        className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                                    />
                                </div>
                            </div>

                            {/* Grid */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-end pb-2 border-b dark:border-gray-700">
                                    <h4 className="font-bold">Détail Journalier</h4>
                                    <span className="text-lg font-mono font-bold text-primary-600">Total: {calculateTotal()}h</span>
                                </div>
                                {editingTimesheet.days?.map((day, idx) => (
                                    <div key={idx} className="flex gap-2 items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <div className="w-24 text-xs font-semibold text-gray-500">
                                            {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                                        </div>
                                        <input 
                                            type="number" 
                                            value={day.hours}
                                            onChange={e => updateDay(idx, 'hours', parseFloat(e.target.value))}
                                            className="w-16 p-1 text-center font-mono border rounded dark:bg-gray-800 dark:border-gray-600"
                                            min="0" max="24"
                                            disabled={day.type === 'Absence' || day.type === 'Holiday' || day.type === 'Weekend'}
                                        />
                                        <select 
                                            value={day.type}
                                            onChange={e => updateDay(idx, 'type', e.target.value)}
                                            className="w-28 p-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600"
                                        >
                                            <option value="Production">Normal</option>
                                            <option value="Overtime">Sup.</option>
                                            <option value="Weekend">Week-end</option>
                                            <option value="Absence">Absence</option>
                                            <option value="Holiday">Férié</option>
                                        </select>
                                        <input 
                                            type="text" 
                                            value={day.note || ''}
                                            onChange={e => updateDay(idx, 'note', e.target.value)}
                                            placeholder="Note..."
                                            className="flex-1 p-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex gap-3">
                            <button 
                                onClick={() => saveTimesheet('Draft')}
                                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Brouillon
                            </button>
                            <button 
                                onClick={() => saveTimesheet('Submitted')}
                                className="flex-1 py-3 bg-gradient-button text-white font-bold rounded-xl shadow-lg hover:opacity-95"
                            >
                                Soumettre
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
