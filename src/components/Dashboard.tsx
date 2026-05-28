/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  AlertOctagon, 
  AlertCircle, 
  PlusCircle, 
  RefreshCw, 
  FileSpreadsheet, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  UserCheck2,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuickModalState {
  isOpen: boolean;
  type: 'tx' | 'ac' | null;
}

export default function Dashboard({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { 
    user, 
    companySettings, 
    transactions, 
    accounts, 
    addTransaction, 
    addAccount, 
    simulateTeamAction,
    addToast
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState<QuickModalState>({ isOpen: false, type: null });

  // Quick form state
  const [txType, setTxType] = useState<'entrada' | 'saida'>('entrada');
  const [txVal, setTxVal] = useState('');
  const [txCat, setTxCat] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txClient, setTxClient] = useState('');
  const [txMethod, setTxMethod] = useState('Pix');

  const [acName, setAcName] = useState('');
  const [acVal, setAcVal] = useState('');
  const [acDueDate, setAcDueDate] = useState('');
  const [acRecurrence, setAcRecurrence] = useState<'avulso' | 'mensal' | 'trimestral' | 'anual'>('mensal');
  const [acCat, setAcCat] = useState('');

  // -------------------------------------------------------------
  // CALCULATIONS / ANALYTICS ENGINE
  // -------------------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];

  // Last 30 Days entries
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const entries30Days = transactions
    .filter(t => t.type === 'entrada' && new Date(t.date) >= thirtyDaysAgo)
    .reduce((sum, t) => sum + t.value, 0);

  const exits30Days = transactions
    .filter(t => t.type === 'saida' && new Date(t.date) >= thirtyDaysAgo)
    .reduce((sum, t) => sum + t.value, 0);

  const netProfit = entries30Days - exits30Days;

  // Caixa do dia (Today's net)
  const entriesToday = transactions
    .filter(t => t.type === 'entrada' && t.date === todayStr)
    .reduce((sum, t) => sum + t.value, 0);

  const exitsToday = transactions
    .filter(t => t.type === 'saida' && t.date === todayStr)
    .reduce((sum, t) => sum + t.value, 0);

  const todayCash = entriesToday - exitsToday;

  // Progress to Monthly Goal
  const goalProgressPercent = Math.min(Math.round((entries30Days / companySettings.monthlyGoal) * 100), 100);

  // Accounts alerts
  const overdueAccounts = accounts.filter(a => a.status === 'pendente' && a.dueDate < todayStr);
  const upcomingAccounts = accounts.filter(a => {
    const nextFiveDays = new Date();
    nextFiveDays.setDate(nextFiveDays.getDate() + 5);
    const extremeDate = nextFiveDays.toISOString().split('T')[0];
    return a.status === 'pendente' && a.dueDate >= todayStr && a.dueDate <= extremeDate;
  });

  const totalOverdueAmount = overdueAccounts.reduce((sum, a) => sum + a.value, 0);

  // Trigger brief visual reload simulation
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      addToast('Indicadores financeiros atualizados com sucesso.', 'success');
    }, 850);
  };

  // Quick adding transaction submissions
  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txVal || !txCat || !txClient) {
      alert('Favor preencher todos os campos obrigatórios.');
      return;
    }
    await addTransaction({
      date: todayStr,
      type: txType,
      category: txCat,
      clientProject: txClient,
      value: parseFloat(txVal),
      paymentMethod: txMethod,
      notes: txDesc
    });
    setModal({ isOpen: false, type: null });
    // Reset fields
    setTxVal('');
    setTxCat('');
    setTxDesc('');
    setTxClient('');
  };

  // Quick adding account submissions
  const handleAcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acName || !acVal || !acDueDate) {
      alert('Favor preencher todos os campos obrigatórios.');
      return;
    }
    await addAccount({
      name: acName,
      value: parseFloat(acVal),
      dueDate: acDueDate,
      status: 'pendente',
      recurrence: acRecurrence,
      category: acCat || 'Infraestrutura (Saída)'
    });
    setModal({ isOpen: false, type: null });
    // Reset
    setAcName('');
    setAcVal('');
    setAcDueDate('');
    setAcCat('');
  };

  // -------------------------------------------------------------
  // ANIMATED SVG BEZIER CHART PRE-PROCESSING
  // -------------------------------------------------------------
  // Let's build a timeline of the last 10 days for inputs vs outputs
  const chartDaysCount = 10;
  const chartDays = Array.from({ length: chartDaysCount }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (chartDaysCount - 1 - idx));
    return d.toISOString().split('T')[0];
  }).reverse(); // Latest is index 0

  const chartData = chartDays.map(day => {
    const entries = transactions
      .filter(t => t.type === 'entrada' && t.date === day)
      .reduce((sum, t) => sum + t.value, 0);

    const exits = transactions
      .filter(t => t.type === 'saida' && t.date === day)
      .reduce((sum, t) => sum + t.value, 0);

    return { 
      dayLabel: day.substring(8, 10) + '/' + day.substring(5, 7), 
      entries, 
      exits 
    };
  }).reverse(); // Re-reverse so chronological order left-to-right

  // SVG dimensions
  const svgWidth = 560;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 20;

  const maxVal = Math.max(
    ...chartData.map(d => Math.max(d.entries, d.exits)),
    2000 // Minimum top bounds
  );

  const getCoordinates = (index: number, val: number) => {
    const segmentWidth = (svgWidth - paddingX * 2) / (chartDaysCount - 1);
    const x = paddingX + index * segmentWidth;
    const y = svgHeight - paddingY - (val / maxVal) * (svgHeight - paddingY * 2);
    return { x, y };
  };

  // Generate Entries Path
  let entriesPoints = '';
  chartData.forEach((d, idx) => {
    const { x, y } = getCoordinates(idx, d.entries);
    entriesPoints += `${idx === 0 ? 'M' : 'L'} ${x} ${y} `;
  });

  // Generate Entries Fill Area Path
  let entriesFillPoints = `${entriesPoints} L ${paddingX + (chartDaysCount - 1) * ((svgWidth - paddingX * 2) / (chartDaysCount - 1))} ${svgHeight - paddingY} L ${paddingX} ${svgHeight - paddingY} Z`;

  // Generate Spendings Path
  let exitsPoints = '';
  chartData.forEach((d, idx) => {
    const { x, y } = getCoordinates(idx, d.exits);
    exitsPoints += `${idx === 0 ? 'M' : 'L'} ${x} ${y} `;
  });

  // Generate Spendings Fill Area Path
  let exitsFillPoints = `${exitsPoints} L ${paddingX + (chartDaysCount - 1) * ((svgWidth - paddingX * 2) / (chartDaysCount - 1))} ${svgHeight - paddingY} L ${paddingX} ${svgHeight - paddingY} Z`;

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-zinc-950 text-zinc-100 font-sans" id="dashboard-tab">
      
      {/* Header with smart buttons */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Monitor Empresarial</h1>
          <p className="text-xs text-zinc-400 font-medium">Balanço geral da empresa, lucros líquidos liquidados e cronograma de despesas ativas.</p>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className={`px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-805 text-zinc-350 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm ${
              refreshing ? 'opacity-80' : ''
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 text-zinc-400 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar Dashboard
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-indigo-650 hover:from-teal-500 hover:to-indigo-550 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-indigo-650/10 active:scale-95"
            title="Acessar painel de fechamento e baixar totalizador em PDF"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-teal-300" />
            Totalizador & PDF
          </button>

          <button
            onClick={() => setModal({ isOpen: true, type: 'tx' })}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-950/20"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Adicionar Lançamento
          </button>
          
          <button
            onClick={() => setModal({ isOpen: true, type: 'ac' })}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 border border-zinc-700/60 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Calendar className="h-3.5 w-3.5 text-indigo-400" />
            Agendar Conta
          </button>
        </div>
      </div>

      <AnimatePresence>
        {refreshing && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 text-xs font-semibold flex items-center gap-2 justify-center"
          >
            <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
            Sincronizando fluxo com real-time...
          </motion.div>
        )}
      </AnimatePresence>

      {/* AUTOMATIC URGENT SYSTEM ALERTS BANNER - OVERDUE OR DUE BILLS */}
      {(overdueAccounts.length > 0 || upcomingAccounts.length > 0) && (
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Overdue Alert banner */}
          {overdueAccounts.length > 0 && (
            <div className="flex gap-4 p-4 bg-rose-950/10 border border-rose-900/30 rounded-2xl animate-pulse">
              <span className="shrink-0 p-2.5 bg-rose-950/30 text-rose-450 rounded-xl flex items-center justify-center border border-rose-900/40">
                <AlertOctagon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-rose-200 flex items-center gap-2">
                  Contas Vencidas detectadas!
                  <span className="inline-block h-2 w-2 rounded-full bg-rose-500"></span>
                </h4>
                <p className="text-xs text-rose-400/90 font-medium mt-0.5">
                  Você possui <strong className="font-bold">{overdueAccounts.length} faturas atrasadas</strong> totalizando <strong className="font-bold">R$ {totalOverdueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>. Pague agora para evitar juros.
                </p>
                <button 
                  onClick={() => setActiveTab('accounts')}
                  className="mt-2.5 text-xs font-bold text-rose-400 hover:text-rose-300 underline transition-colors cursor-pointer"
                >
                  Ir para contas e quitar despesas
                </button>
              </div>
            </div>
          )}

          {/* Upcoming Due Alert banner */}
          {upcomingAccounts.length > 0 && (
            <div className="flex gap-4 p-4 bg-amber-950/10 border border-amber-900/30 rounded-2xl">
              <span className="shrink-0 p-2.5 bg-amber-950/30 text-amber-450 rounded-xl flex items-center justify-center border border-amber-900/45">
                <AlertCircle className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-200">Vencendo nos próximos 5 dias</h4>
                <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                  Há <strong className="font-bold">{upcomingAccounts.length} faturas</strong> agendadas perto do vencimento. Monitore o caixa disponível do dia.
                </p>
                <button 
                  onClick={() => setActiveTab('accounts')}
                  className="mt-2.5 text-xs font-bold text-amber-400 hover:text-amber-300 underline transition-colors cursor-pointer"
                >
                  Checar vencimentos agendados
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* CORE FINANCIAL INDICATORS CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* ENTRADAS */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 shadow-lg hover:border-zinc-700/60 rounded-2xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 rounded-bl-3xl group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Entradas (Últimos 30d)</span>
            <span className="p-2 bg-indigo-950/50 text-indigo-400 rounded-lg border border-indigo-900/30">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-sans text-white">
            R$ {entries30Days.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3 text-indigo-400" />
            Faturamento bruto do mês
          </p>
        </div>

        {/* SAÍDAS */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 shadow-lg hover:border-zinc-700/60 rounded-2xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-16 w-16 bg-rose-500/5 rounded-bl-3xl group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Saídas (Últimos 30d)</span>
            <span className="p-2 bg-rose-950/50 text-rose-400 rounded-lg border border-rose-900/30">
              <TrendingDown className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-sans text-white">
            R$ {exits30Days.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
            <ArrowDownRight className="h-3 w-3 text-rose-450" />
            Despesas e custos liquidados
          </p>
        </div>

        {/* LUCRO LÍQUIDO */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 shadow-lg hover:border-zinc-700/60 rounded-2xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-bl-3xl group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Lucro Líquido Real</span>
            <span className="p-2 bg-emerald-950/50 text-emerald-400 rounded-lg border border-emerald-900/30">
              <Wallet className="h-4 w-4" />
            </span>
          </div>
          <div className={`text-2xl font-bold font-sans ${netProfit >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
            R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-zinc-550 mt-1">
            Sobrou de caixa real após despesas
          </p>
        </div>

        {/* CAIXA DO DIA */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 shadow-lg hover:border-zinc-700/60 rounded-2xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 rounded-bl-3xl group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Caixa do dia</span>
            <span className="p-2 bg-indigo-950/50 text-indigo-400 rounded-lg border border-indigo-900/30">
              <PlusCircle className="h-4 w-4" />
            </span>
          </div>
          <div className={`text-2xl font-bold font-sans ${todayCash >= 0 ? 'text-white' : 'text-rose-400'}`}>
            R$ {todayCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-zinc-450 mt-1">
            Balanço das operações de hoje
          </p>
        </div>
      </section>

      {/* CHARTS CONTAINER GRID AND TARGET GOAL SUMMARY */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* PREMIUM RESPONSIVE SVG BEZIER CHART */}
        <div className="lg:col-span-2 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white font-sans">Evolução Diária (Entradas vs Saídas)</h3>
              <p className="text-[10.5px] text-zinc-500 font-medium">Histórico acumulado diário dos últimos 10 dias úteis de atividade.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px] font-sans font-bold text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-indigo-400 inline-block"></span>
                Receitas
              </span>
              <span className="flex items-center gap-1 text-[10px] font-sans font-bold text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-rose-500 inline-block"></span>
                Despesas
              </span>
            </div>
          </div>

          {/* SVG Canvas wrapper with responsive height */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[560px]">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                  const y = paddingY + ratio * (svgHeight - paddingY * 2);
                  const gridVal = maxVal * (1 - ratio);
                  return (
                    <g key={index} opacity="0.3">
                      <line 
                        x1={paddingX} 
                        y1={y} 
                        x2={svgWidth - paddingX} 
                        y2={y} 
                        stroke="#94a3b8" 
                        strokeDasharray="4 4" 
                        strokeWidth="1" 
                      />
                      <text 
                        x={paddingX - 10} 
                        y={y + 4} 
                        fill="#64748b" 
                        fontSize="8 font-sans" 
                        textAnchor="end"
                      >
                        {gridVal >= 1000 ? `${(gridVal / 1000).toFixed(1)}k` : Math.round(gridVal)}
                      </text>
                    </g>
                  );
                })}

                {/* Day Node Columns */}
                {chartData.map((d, idx) => {
                  const segmentWidth = (svgWidth - paddingX * 2) / (chartDaysCount - 1);
                  const x = paddingX + idx * segmentWidth;
                  return (
                    <text 
                      key={idx} 
                      x={x} 
                      y={svgHeight - 4} 
                      fill="#94a3b8" 
                      fontSize="9" 
                      textAnchor="middle"
                      className="font-mono"
                    >
                      {d.dayLabel}
                    </text>
                  );
                })}

                {/* AREA UNDER RECEITAS LINE */}
                <path 
                  d={entriesFillPoints} 
                  fill="url(#gradEntries)" 
                  opacity="0.12" 
                />

                {/* LINE CHARTS FOR RECEITAS */}
                <path 
                  d={entriesPoints} 
                  fill="none" 
                  stroke="#818cf8" 
                  strokeWidth="3.2" 
                  strokeLinecap="round" 
                />

                {/* AREA UNDER DESPESAS LINE */}
                <path 
                  d={exitsFillPoints} 
                  fill="url(#gradExits)" 
                  opacity="0.12" 
                />

                {/* LINE CHARTS FOR DESPESAS */}
                <path 
                  d={exitsPoints} 
                  fill="none" 
                  stroke="#f43f5e" 
                  strokeWidth="3.2" 
                  strokeLinecap="round" 
                />

                {/* INTERACTIVE DATA DECORATIVE DOTS */}
                {chartData.map((d, idx) => {
                  const coordEnt = getCoordinates(idx, d.entries);
                  const coordEx = getCoordinates(idx, d.exits);
                  return (
                    <g key={idx}>
                      {d.entries > 0 && (
                        <circle 
                          cx={coordEnt.x} 
                          cy={coordEnt.y} 
                          r="4" 
                          fill="#818cf8" 
                          stroke="#18181b" 
                          strokeWidth="1.5" 
                        />
                      )}
                      {d.exits > 0 && (
                        <circle 
                          cx={coordEx.x} 
                          cy={coordEx.y} 
                          r="4" 
                          fill="#f43f5e" 
                          stroke="#18181b" 
                          strokeWidth="1.5" 
                        />
                      )}
                    </g>
                  );
                })}

                {/* Vector Gradients Definitions */}
                <defs>
                  <linearGradient id="gradEntries" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#18181b" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="gradExits" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#18181b" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {/* TARGET MONTHLY PROGRESS PANEL */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-white font-sans">Meta de Faturamento</h3>
              <span className="p-2 bg-indigo-950/50 text-indigo-400 border border-indigo-900/30 rounded-lg">
                <Target className="h-4.5 w-4.5" />
              </span>
            </div>

            <div className="space-y-4 mb-2">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold font-mono text-indigo-400 tracking-tight">{goalProgressPercent}%</span>
                <span className="text-xs text-zinc-500">da meta mensal</span>
              </div>
              
              {/* Progressive Goal bar frame */}
              <div className="w-full h-3.5 bg-zinc-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-gradient bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${goalProgressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] font-sans font-medium text-zinc-400">
                <span>Realizado: R$ {entries30Days.toFixed(2)}</span>
                <span>Objetivo: R$ {companySettings.monthlyGoal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-805 bg-zinc-950/40 -mx-6 -mb-6 p-6 rounded-b-2xl">
            <h4 className="text-xs font-bold text-zinc-355 uppercase tracking-widest flex items-center gap-1.5 mb-1 bg-zinc-950/80 p-1.5 rounded-lg border border-zinc-800">
              <UserCheck2 className="h-3.5 w-3.5 text-indigo-400" />
              EQUIPE ATIVA
            </h4>
            <p className="text-[11px] text-zinc-500 font-medium">As entradas automáticas dos funcionários estão ativas e atualizam em tempo real no dashboard.</p>
          </div>
        </div>
          </div>
        </div>
      </section>

      {/* QUICK ADD MODAL SCREEN */}
      <AnimatePresence>
        {modal.isOpen && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 max-w-md w-full overflow-hidden font-sans text-zinc-105"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">
                  {modal.type === 'tx' ? 'Novo Lançamento Financeiro' : 'Agendar Nova Conta/Despesa'}
                </h3>
                <button
                  onClick={() => setModal({ isOpen: false, type: null })}
                  className="text-zinc-550 hover:text-zinc-200 transition-colors p-1 rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* MODAL FORM CONTAINER */}
              {modal.type === 'tx' ? (
                <form onSubmit={handleTxSubmit} className="p-6 space-y-4">
                  {/* Ledger Type Select */}
                  <div>
                    <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1.5" id="tx-type-label">Tipo de Lançamento</label>
                    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="tx-type-label">
                      <button
                        type="button"
                        onClick={() => setTxType('entrada')}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          txType === 'entrada'
                            ? 'border-indigo-500 bg-indigo-950/40 text-indigo-400 font-bold'
                            : 'border-zinc-800 hover:bg-zinc-800 text-zinc-400'
                        }`}
                        aria-checked={txType === 'entrada'}
                        role="radio"
                      >
                        📈 Entrada / Receita
                      </button>
                      <button
                        type="button"
                        onClick={() => setTxType('saida')}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          txType === 'saida'
                            ? 'border-rose-500 bg-rose-950/40 text-rose-450 font-bold'
                            : 'border-zinc-800 hover:bg-zinc-800 text-zinc-400'
                        }`}
                        aria-checked={txType === 'saida'}
                        role="radio"
                      >
                        📉 Saída / Despesa
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="tx-val">Valor (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={txVal}
                        onChange={(e) => setTxVal(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-505 focus:outline-none rounded-lg text-sm text-white"
                        id="tx-val"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="tx-method">Forma de Pagto</label>
                      <select
                        value={txMethod}
                        onChange={(e) => setTxMethod(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-505 focus:outline-none rounded-lg text-sm cursor-pointer text-white"
                        id="tx-method"
                      >
                        <option value="Pix">Pix</option>
                        <option value="Boleto Bancário">Boleto Bancário</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Transferência">Transferência</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="tx-client">Cliente ou Projeto</label>
                    <input
                      type="text"
                      required
                      value={txClient}
                      onChange={(e) => setTxClient(e.target.value)}
                      placeholder="Ex: Padaria Bela Vista"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-505 focus:outline-none rounded-lg text-sm text-white"
                      id="tx-client"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="tx-cat">Categoria Financeira</label>
                    <select
                      required
                      value={txCat}
                      onChange={(e) => setTxCat(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-505 focus:outline-none rounded-lg text-sm cursor-pointer text-white"
                      id="tx-cat"
                    >
                      <option value="">Selecione categoria</option>
                      {companySettings.categories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="tx-desc">Anotações / Descrição (Opcional)</label>
                    <textarea
                      value={txDesc}
                      onChange={(e) => setTxDesc(e.target.value)}
                      placeholder="Alguma nota importante sobre a venda..."
                      rows={2}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-550 focus:outline-none rounded-lg text-sm text-white"
                      id="tx-desc"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setModal({ isOpen: false, type: null })}
                      className="px-4 py-2 hover:bg-zinc-805 text-zinc-400 font-semibold text-xs rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-sm"
                    >
                      Gravar Lançamento
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAcSubmit} className="p-6 space-y-4">
                  {/* ONLY ADMIN CAN CREATE RECURRING BILLS IF MULTIUSER COOP IS ON */}
                  {user?.role !== 'admin' && (
                    <div className="p-3 bg-rose-950/20 border border-rose-900/40 text-rose-400 rounded-xl text-xs font-medium flex items-center gap-1.5 animate-pulse">
                      <Lock className="h-4 w-4" />
                      Apenas Administrador/Patrão pode registrar contas a pagar da empresa.
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="ac-name">Descrição do Serviço / Conta</label>
                    <input
                      type="text"
                      required
                      disabled={user?.role !== 'admin'}
                      value={acName}
                      onChange={(e) => setAcName(e.target.value)}
                      placeholder="Ex: Assinatura Google Space"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-505 focus:outline-none rounded-lg text-sm disabled:opacity-50 text-white"
                      id="ac-name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="ac-val">Valor Fatura (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        disabled={user?.role !== 'admin'}
                        value={acVal}
                        onChange={(e) => setAcVal(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-505 focus:outline-none rounded-lg text-sm disabled:opacity-50 text-white"
                        id="ac-val"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="ac-due-date">Vencimento</label>
                      <input
                        type="date"
                        required
                        disabled={user?.role !== 'admin'}
                        value={acDueDate}
                        onChange={(e) => setAcDueDate(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 focus:border-indigo-505 focus:outline-none rounded-lg text-sm disabled:opacity-50 text-white font-mono"
                        id="ac-due-date"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="ac-recurrence">Recorrência</label>
                      <select
                        disabled={user?.role !== 'admin'}
                        value={acRecurrence}
                        onChange={(e: any) => setAcRecurrence(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-510 focus:outline-none rounded-lg text-sm cursor-pointer disabled:opacity-50 text-white"
                        id="ac-recurrence"
                      >
                        <option value="avulso">Avulso / Única</option>
                        <option value="mensal">Mensal</option>
                        <option value="trimestral">Trimestral</option>
                        <option value="anual">Anual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="ac-cat">Categoria</label>
                      <select
                        disabled={user?.role !== 'admin'}
                        value={acCat}
                        onChange={(e) => setAcCat(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-510 focus:outline-none rounded-lg text-sm cursor-pointer disabled:opacity-50 text-white"
                        id="ac-cat"
                      >
                        <option value="">Selecione categoria</option>
                        {companySettings.categories.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setModal({ isOpen: false, type: null })}
                      className="px-4 py-2 hover:bg-zinc-805 text-zinc-450 font-semibold text-xs rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={user?.role !== 'admin'}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-540 text-white font-semibold text-xs rounded-xl cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      Sintonizar Conta
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
