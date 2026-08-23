import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Icon } from './icons';
import { Timesheet, Mission, PurchaseOrder, POStatus } from '../types';
import { toCents, formatCents } from '../utils/currency';

const SignatureBlock: React.FC<{ signature: string | undefined, onSave: (url: string | undefined) => void }> = ({ signature, onSave }) => {
    const [activeTab, setActiveTab] = useState<'upload' | 'draw'>('upload');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if (activeTab === 'draw' && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    }, [activeTab]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) ctx.beginPath();
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';

        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                onSave(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const clearSignature = () => {
        onSave(undefined);
        if (activeTab === 'draw' && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    };

    const saveCanvas = () => {
        if (canvasRef.current) {
            onSave(canvasRef.current.toDataURL('image/png'));
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm print:hidden">
            <h3 className="text-lg font-bold mb-4">Signature électronique</h3>
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                <button onClick={() => setActiveTab('upload')} className={`pb-2 text-sm font-semibold border-b-2 ${activeTab === 'upload' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500'}`}>Importer une signature</button>
                <button onClick={() => setActiveTab('draw')} className={`pb-2 text-sm font-semibold border-b-2 ${activeTab === 'draw' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500'}`}>Dessiner ma signature</button>
            </div>
            
            {activeTab === 'upload' && (
                <div className="space-y-4">
                    {signature ? (
                        <div className="flex items-end gap-4">
                            <div className="w-[200px] h-[80px] bg-white border border-gray-300 rounded overflow-hidden flex items-center justify-center p-2">
                                <img src={signature} alt="Signature" className="max-w-full max-h-full object-contain" />
                            </div>
                            <button onClick={clearSignature} className="text-sm text-red-500 font-semibold hover:underline">Effacer</button>
                        </div>
                    ) : (
                        <label className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm font-medium rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                            <input type="file" accept="image/png,image/jpeg" onChange={handleUpload} className="hidden" />
                            Importer une image...
                        </label>
                    )}
                </div>
            )}

            {activeTab === 'draw' && (
                <div className="space-y-4">
                    <div className="inline-block border border-gray-300 rounded overflow-hidden shadow-inner">
                        <canvas
                            ref={canvasRef}
                            width={400}
                            height={150}
                            className="bg-white cursor-crosshair touch-none"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={clearSignature} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold rounded shadow-sm hover:bg-gray-200 transition-colors">Effacer le canvas</button>
                        <button onClick={saveCanvas} className="px-4 py-2 bg-pink-500 text-white text-sm font-bold rounded shadow-sm hover:bg-pink-600 transition-colors">Valider la signature</button>
                    </div>
                    {signature && activeTab === 'draw' && <p className="text-xs text-green-600 mt-2 font-bold">✓ Signature validée</p>}
                </div>
            )}
        </div>
    );
};

interface PurchaseOrdersViewProps {
    timesheets: Timesheet[];
    missions: Mission[];
}

export const PurchaseOrdersView: React.FC<PurchaseOrdersViewProps> = ({ timesheets, missions }) => {
    const [orders, setOrders] = useState<PurchaseOrder[]>([
        {
            id: 'po1',
            number: 'BC-2026-001',
            consultantName: 'Kenza Alaoui',
            clientName: 'TechCorp SA',
            missionId: 'm1',
            timesheetId: 't1',
            period: 'Janvier 2026',
            days: 20,
            dailyRate: 45000,
            amountHT: 900000,
            amountTVA: 180000,
            amountTTC: 1080000,
            status: 'Payé',
            date: '2026-02-05'
        }
    ]);
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

    // Filter validated timesheets that don't have a PO yet
    const availableTimesheets = timesheets.filter(ts => ts.status === 'Validated' && !orders.some(o => o.timesheetId === ts.id));

    const handleGeneratePO = (ts: Timesheet) => {
        const mission = missions.find(m => m.id === ts.missionId);
        const dailyRateEuros = mission?.remunerationType === 'Daily' ? mission.remuneration : (mission?.remuneration || 0) / 20; // fallback est 20j
        const dailyRate = toCents(dailyRateEuros);
        const amountHT = Math.round(ts.totalDays * dailyRate);
        const amountTVA = Math.round(amountHT * 0.20);

        const newPO: PurchaseOrder = {
            id: Math.random().toString(36).substring(2, 9),
            number: `BC-${new Date().getFullYear()}-${String(orders.length + 2).padStart(3, '0')}`,
            consultantName: ts.consultantName,
            clientName: ts.clientName,
            missionId: ts.missionId,
            timesheetId: ts.id,
            period: new Date(ts.periodStart).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
            days: ts.totalDays,
            dailyRate,
            amountHT,
            amountTVA,
            amountTTC: amountHT + amountTVA,
            status: 'Brouillon',
            date: new Date().toISOString().split('T')[0]
        };
        setOrders([newPO, ...orders]);
    };

    const updateStatus = (id: string, newStatus: POStatus) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    };

    // KPI Calc
    const totalGenerated = orders.reduce((sum, o) => sum + o.amountHT, 0);
    const totalPaid = orders.filter(o => o.status === 'Payé').reduce((sum, o) => sum + o.amountHT, 0);
    const pendingPayment = orders.filter(o => o.status === 'Émis').reduce((sum, o) => sum + o.amountTTC, 0);

    const handlePrint = () => {
        window.print();
    };

    if (selectedPO) {
        return (
            <div className="p-6 max-w-4xl mx-auto print:p-0 print:m-0">
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <button onClick={() => setSelectedPO(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                        <Icon name="arrow-left" className="w-4 h-4"/> Retour aux bons
                    </button>
                    <div className="flex gap-2">
                        {selectedPO.status === 'Brouillon' && <button onClick={() => updateStatus(selectedPO.id, 'Émis')} className="bg-blue-600 text-white px-4 py-2 rounded shadow text-sm font-semibold hover:bg-blue-700">Marquer comme Émis</button>}
                        {selectedPO.status === 'Émis' && <button onClick={() => updateStatus(selectedPO.id, 'Payé')} className="bg-green-600 text-white px-4 py-2 rounded shadow text-sm font-semibold hover:bg-green-700">Marquer comme Payé</button>}
                        <button onClick={handlePrint} className="bg-gray-800 text-white px-4 py-2 rounded shadow text-sm font-semibold hover:bg-gray-900 flex items-center gap-2"><Icon name="download" className="w-4 h-4"/> Imprimer PDF</button>
                    </div>
                </div>

                <div className="mb-6">
                    <SignatureBlock 
                        signature={selectedPO.signatureUrl} 
                        onSave={(url) => {
                            const newPO = { ...selectedPO, signatureUrl: url };
                            setSelectedPO(newPO);
                            setOrders(orders.map(o => o.id === selectedPO.id ? newPO : o));
                        }} 
                    />
                </div>

                {/* Print Template (A4 format roughly) */}
                <div className="bg-white p-10 shadow-lg border border-gray-200 text-gray-900 min-h-[1000px] print:shadow-none print:border-none">
                    <div className="flex justify-between items-start border-b pb-8 mb-8">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">BON DE COMMANDE</h1>
                            <p className="text-gray-500 mt-2">N° {selectedPO.number}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="font-bold text-lg text-pink-600">ParseLIQ Consulting</h2>
                            <p className="text-sm text-gray-600">123 Business Ave, Tech Park<br/>contact@parseliq.com<br/>Tél: +212 500 000 000</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div>
                            <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-2">Facturé à :</h3>
                            <p className="font-bold text-lg">{selectedPO.clientName}</p>
                            <p className="text-gray-600 mt-1">Département IT / Achats</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-2">Détails Date :</h3>
                            <p><span className="text-gray-500 mr-2">Date du bon:</span> {new Date(selectedPO.date).toLocaleDateString('fr-FR')}</p>
                            <p className="mt-1"><span className="text-gray-500 mr-2">Période:</span> {selectedPO.period}</p>
                        </div>
                    </div>

                    <div className="mb-12">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-900">
                                    <th className="py-3 px-2 font-bold uppercase text-sm">Consultant & Prestation</th>
                                    <th className="py-3 px-2 font-bold uppercase text-sm text-center">Jours</th>
                                    <th className="py-3 px-2 font-bold uppercase text-sm text-right">TJM HT</th>
                                    <th className="py-3 px-2 font-bold uppercase text-sm text-right">Total HT</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-4 px-2">
                                        <p className="font-bold">{selectedPO.consultantName}</p>
                                        <p className="text-sm text-gray-600 text-balance">Prestation intellectuelle en régie</p>
                                    </td>
                                    <td className="py-4 px-2 text-center text-gray-800">{selectedPO.days}</td>
                                    <td className="py-4 px-2 text-right text-gray-800">{formatCents(selectedPO.dailyRate)} €</td>
                                    <td className="py-4 px-2 text-right font-semibold">{formatCents(selectedPO.amountHT)} €</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-1/2">
                            <div className="flex justify-between py-2 text-gray-600">
                                <span>Sous-total HT</span>
                                <span>{formatCents(selectedPO.amountHT)} €</span>
                            </div>
                            <div className="flex justify-between py-2 text-gray-600 border-b border-gray-300">
                                <span>TVA (20%)</span>
                                <span>{formatCents(selectedPO.amountTVA)} €</span>
                            </div>
                            <div className="flex justify-between py-4 text-xl font-black text-gray-900">
                                <span>TOTAL TTC</span>
                                <span>{formatCents(selectedPO.amountTTC)} €</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 pt-8 border-t border-gray-200 text-center text-sm text-gray-500 flex flex-col justify-center items-center gap-8">
                        <div>
                            Conditions de paiement : 30 jours fin de mois.<br/>En cas de retard de paiement, des pénalités seront appliquées.
                        </div>
                        {selectedPO.signatureUrl && (
                            <div className="text-center">
                                <p className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2">Signature Autorisée</p>
                                <div className="border-b border-gray-300 inline-block px-8 pb-2">
                                    <img src={selectedPO.signatureUrl} alt="Signature" className="h-16 object-contain mix-blend-multiply" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-gray-100">Bons de Commande</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Générez et gérez la facturation de vos missions</p>
            </header>

            {/* Dashboard CA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center border-l-4 border-l-blue-500">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Chiffre d'Affaires Généré (HT)</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{formatCents(totalGenerated)} €</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center border-l-4 border-l-green-500">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">CA Encaissé (HT)</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{formatCents(totalPaid)} €</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center border-l-4 border-l-pink-500">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">En Attente de Paiement (TTC)</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{formatCents(pendingPayment)} €</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Generation Panel */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-1">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">À Générer</h2>
                    {availableTimesheets.length === 0 ? (
                        <p className="text-gray-500 text-sm">Aucune feuille de temps validée disponible pour facturation.</p>
                    ) : (
                        <div className="space-y-3">
                            {availableTimesheets.map(ts => (
                                <div key={ts.id} className="p-3 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col gap-2">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{ts.clientName}</p>
                                        <p className="text-xs text-gray-500">{ts.consultantName} - {new Date(ts.periodStart).toLocaleDateString('fr-FR', { month: 'short' })}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-sm font-medium">{ts.totalDays}j</span>
                                        <button 
                                            onClick={() => handleGeneratePO(ts)}
                                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs px-3 py-1.5 rounded shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Générer BC
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Orders Table */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Bons de Commande Émis</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Numéro</th>
                                    <th className="px-4 py-3">Client / Consultant</th>
                                    <th className="px-4 py-3 text-right">Montant HT</th>
                                    <th className="px-4 py-3 text-center">Statut</th>
                                    <th className="px-4 py-3 text-center rounded-r-lg">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {orders.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-6 text-gray-500">Aucun bon de commande</td></tr>
                                ) : orders.map(po => (
                                    <tr key={po.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="px-4 py-3 text-gray-900 dark:text-gray-200 font-mono text-xs font-semibold">{po.number}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-gray-900 dark:text-gray-100">{po.clientName}</div>
                                            <div className="text-xs text-gray-500">{po.consultantName} ({po.period})</div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-100">{formatCents(po.amountHT)} €</td>
                                        <td className="px-4 py-3 text-center">
                                            <select 
                                                value={po.status}
                                                onChange={(e) => updateStatus(po.id, e.target.value as POStatus)}
                                                className={`text-xs font-bold rounded-full px-2 py-1 outline-none appearance-none cursor-pointer border-none text-center ${
                                                    po.status === 'Payé' ? 'bg-green-100 text-green-800 dark:bg-green-900/30' : 
                                                    po.status === 'Émis' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30' :
                                                    po.status === 'Archivé' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700' :
                                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30'
                                                }`}
                                            >
                                                <option value="Brouillon">Brouillon</option>
                                                <option value="Émis">Émis</option>
                                                <option value="Payé">Payé</option>
                                                <option value="Archivé">Archivé</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                             <button onClick={() => setSelectedPO(po)} className="text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300 font-semibold text-xs">
                                                Visualiser
                                            </button>
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
