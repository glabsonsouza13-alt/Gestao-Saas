/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { Account, AccountRecurrence, AccountStatus } from '../types';
import { 
  CalendarClock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Hourglass, 
  AlertTriangle, 
  CalendarCheck, 
  X, 
  Info,
  BadgeAlert,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Accounts() {
  const { 
    user, 
    companySettings, 
    accounts, 
    addAccount, 
    deleteAccount, 
    payAccount,
    addToast 
  } = useAppStore();

  const [filter, setFilter] = useState<'all' | 'pendente' | 'pago'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [recurrence, setRecurrence] = useState<AccountRecurrence>('mensal');
  const [category, setCategory] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Accounts categorization & sorting
  const filteredAccounts = accounts.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate)); // Chronological sorting

  // Calculate totals
  const totalAmountPendente = accounts
    .filter(a => a.status === 'pendente')
    .reduce((sum, a) => sum + a.value, 0);

  const totalAmountOverdue = accounts
    .filter(a => a.status === 'pendente' && a.dueDate < todayStr)
    .reduce((sum, a) => sum + a.value, 0);

  // Form Submissions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'admin') {
      addToast("Apenas administradores podem agendar novas faturas.", "error");
      return;
    }

    if (!name.trim() || !value || !dueDate) {
      alert("Por favor preencha todos os campos obrigatórios");
      return;
    }

    await addAccount({
      name,
      value: parseFloat(value),
      dueDate,
      status: 'pendente',
      recurrence,
      category: category || 'Infraestrutura (Saída)'
    });

    // Reset Form
    setName('');
    setValue('');
    setDueDate('');
    setCategory('');
    setIsFormOpen(false);
  };

  const getStatusBadge = (ac: Account) => {
    const isOverdue = ac.status === 'pendente' && ac.dueDate < todayStr;
    
    if (ac.status === 'pago') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-teal-950/30 text-teal-400 border border-teal-900/30">
          <CheckCircle2 className="h-3 w-3 text-teal-405" />
          Quitada
        </span>
      );
    }

    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-rose-955/20 text-rose-450 border border-rose-900/20 animate-pulse">
          <BadgeAlert className="h-3 w-3 text-rose-400" />
          ATRASADA
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-amber-955/20 text-amber-450 border border-amber-900/20">
        <Hourglass className="h-3 w-3 text-amber-400" />
        Pagar em breve
      </span>
    );
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-zinc-950 text-zinc-100 font-sans" id="accounts-tab">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Cronograma de Faturas</h1>
          <p className="text-xs text-zinc-400 font-medium">Contas recorrentes da empresa, controle de prazos e alertas de pagamentos futuros.</p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Agendar Nova Conta
        </button>
      </div>

      {/* CORE ADVISORY STATS CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               {/* Total Pending bills amount */}
        <div className="p-5 bg-zinc-900 border border-zinc-800 shadow-lg rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Pendente</span>
          <div className="text-xl font-bold font-mono text-zinc-100 mt-1">
            R$ {totalAmountPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Soma de todas as faturas em aberto</p>
        </div>

        {/* Total OVERDUE bills amount */}
        <div className={`p-5 border shadow-lg rounded-2xl transition-all ${
          totalAmountOverdue > 0 
            ? 'bg-rose-950/20 border-rose-900/40' 
            : 'bg-zinc-900 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Atrasado</span>
            {totalAmountOverdue > 0 && <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>}
          </div>
          <div className={`text-xl font-bold font-mono mt-1 ${totalAmountOverdue > 0 ? 'text-rose-400' : 'text-zinc-200'}`}>
            R$ {totalAmountOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Faturas vencidas sem quitação</p>
        </div>

        {/* Auto cash info */}
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-4">
          <span className="p-2 bg-indigo-950/50 text-indigo-400 border border-indigo-900/40 rounded-xl">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-zinc-200">Baixa Digital Integrada</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">Ao quitar faturas, uma saída correspondente será automaticamente gerada pelo caixa corporativo local.</p>
          </div>
        </div>
      </section>

      {/* FILTER CONTROL PILLS */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 p-1 max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl" role="tablist" aria-label="Status da Fatura">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg cursor-pointer transition-all ${
            filter === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          role="tab"
          aria-selected={filter === 'all'}
          id="tab-all"
        >
          Todas ({accounts.length})
        </button>
        <button
          onClick={() => setFilter('pendente')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg cursor-pointer transition-all ${
            filter === 'pendente' ? 'bg-zinc-800 text-rose-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          role="tab"
          aria-selected={filter === 'pendente'}
          id="tab-pending"
        >
          Pendentes ({accounts.filter(a => a.status === 'pendente').length})
        </button>
        <button
          onClick={() => setFilter('pago')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg cursor-pointer transition-all ${
            filter === 'pago' ? 'bg-zinc-800 text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          role="tab"
          aria-selected={filter === 'pago'}
          id="tab-paid"
        >
          Quitadas ({accounts.filter(a => a.status === 'pago').length})
        </button>
      </div>

      {/* BILL LISTING - FLEX GRID OF CARDS */}
      {filteredAccounts.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <CalendarCheck className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-350">Nenhuma conta localizada</h3>
          <p className="text-xs text-zinc-505">Excelente! Não há despesas registradas nesta visualização.</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((ac) => {
            const isOverdue = ac.status === 'pendente' && ac.dueDate < todayStr;
            const formattedDueDate = `${ac.dueDate.substring(8, 10)}/${ac.dueDate.substring(5, 7)}/${ac.dueDate.substring(0, 4)}`;

            return (
              <div 
                key={ac.id} 
                className={`bg-zinc-900 rounded-2xl border p-5 flex flex-col justify-between shadow-xs hover:border-zinc-750 transition-all relative ${
                  isOverdue 
                    ? 'border-rose-900 bg-rose-950/10' 
                    : 'border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5 mb-3.5">
                    {getStatusBadge(ac)}
                    <span className="text-[10px] bg-zinc-950 border border-zinc-800 py-0.5 px-2 rounded-md font-sans text-zinc-500 uppercase font-extrabold tracking-wider">
                      {ac.recurrence}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug tracking-tight" title={ac.name}>
                    {ac.name}
                  </h3>
                  
                  {ac.category && (
                    <span className="inline-block text-[10px] text-zinc-500 mt-1 font-medium italic">
                      Categoria: {ac.category}
                    </span>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Valor</span>
                    <div className="text-lg font-bold font-mono text-white">
                      R$ {ac.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block text-right">Prazo</span>
                    <span className={`text-[11.5px] font-bold font-mono text-right block ${isOverdue ? 'text-rose-455 animate-pulse' : 'text-zinc-400'}`}>
                      {formattedDueDate}
                    </span>
                  </div>
                </div>

                {/* Switch Pay action triggers */}
                <div className="mt-5 flex gap-2">
                  {ac.status === 'pendente' ? (
                    <button
                      onClick={() => payAccount(ac.id, 'pago')}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      Pagar Fatura <ArrowRight className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => payAccount(ac.id, 'pendente')}
                      className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700/50 rounded-xl text-xs font-bold cursor-pointer transition-all text-center"
                    >
                      Estornar Quitação
                    </button>
                  )}

                  <button
                    onClick={() => deleteAccount(ac.id)}
                    className="p-2 hover:bg-rose-955/20 border border-zinc-800 hover:border-rose-900/50 text-zinc-550 hover:text-rose-400 rounded-xl cursor-pointer transition-all"
                    title="Excluir da listagem"
                    aria-label="Excluir da listagem"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* DETAILED CREATE FORM MODAL PANEL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 max-w-md w-full overflow-hidden font-sans"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-indigo-400" />
                  Agendar Despesa / Conta Futura
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-zinc-500 hover:text-zinc-200 transition-colors p-1 cursor-pointer"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {user?.role !== 'admin' && (
                  <div className="p-3 bg-rose-950/20 border border-rose-900/40 text-rose-300 rounded-xl text-xs font-medium flex items-center gap-1.5 mb-2">
                    <Info className="h-4 w-4 text-rose-400 shrink-0" />
                    Apenas administradores podem agendar saídas de contas corporativas.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="ac-form-name">Nome do Fornecedor / Fatura</label>
                  <input
                    type="text"
                    required
                    disabled={user?.role !== 'admin'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Aluguel Escritório Central"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-505 focus:outline-none rounded-lg text-sm disabled:opacity-50 text-white"
                    id="ac-form-name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="ac-form-val">Valor Fatura (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      disabled={user?.role !== 'admin'}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-505 focus:outline-none rounded-lg text-sm disabled:opacity-50 text-white"
                      id="ac-form-val"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="ac-form-due-date">Data Vencimento</label>
                    <input
                      type="date"
                      required
                      disabled={user?.role !== 'admin'}
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-505 focus:outline-none rounded-lg text-sm disabled:opacity-50 font-mono text-white"
                      id="ac-form-due-date"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="ac-form-recurrence">Recorrência</label>
                    <select
                      disabled={user?.role !== 'admin'}
                      value={recurrence}
                      onChange={(e: any) => setRecurrence(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-505 focus:outline-none rounded-lg text-xs cursor-pointer disabled:opacity-50 text-white"
                      id="ac-form-recurrence"
                    >
                      <option value="avulso">Avulso / Única</option>
                      <option value="mensal">Mensal</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="ac-form-cat">Categoria</label>
                    <select
                      disabled={user?.role !== 'admin'}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-805 focus:border-indigo-505 focus:outline-none rounded-lg text-xs cursor-pointer disabled:opacity-50 text-white animate-fade-in"
                      id="ac-form-cat"
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
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 hover:bg-zinc-805 text-zinc-400 font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    Mudar de ideia
                  </button>
                  <button
                    type="submit"
                    disabled={user?.role !== 'admin'}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    Agendar Contratação
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
