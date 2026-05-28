/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  PlusCircle, 
  CalendarMinus, 
  X, 
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Transactions() {
  const { 
    user, 
    companySettings, 
    transactions, 
    addTransaction, 
    editTransaction, 
    deleteTransaction,
    addToast
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'entrada' | 'saida'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Pagination bounds
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form input states
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'entrada' as TransactionType,
    category: '',
    clientProject: '',
    value: '',
    paymentMethod: 'Pix',
    notes: ''
  });

  // -------------------------------------------------------------
  // LEDGER FILTER SYSTEM
  // -------------------------------------------------------------
  const filteredTransactions = transactions.filter((tx) => {
    const textToMatch = `${tx.clientProject} ${tx.category} ${tx.notes} ${tx.paymentMethod} ${tx.authorName}`.toLowerCase();
    const queryMatches = textToMatch.includes(searchQuery.toLowerCase());
    
    const typeMatches = typeFilter === 'all' ? true : tx.type === typeFilter;
    const categoryMatches = categoryFilter === 'all' ? true : tx.category === categoryFilter;

    return queryMatches && typeMatches && categoryMatches;
  });

  // Paginated slice
  const totalPages = Math.max(Math.ceil(filteredTransactions.length / itemsPerPage), 1);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Trigger modal for New Creation
  const openNewForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'entrada',
      category: companySettings.categories[0] || '',
      clientProject: '',
      value: '',
      paymentMethod: 'Pix',
      notes: ''
    });
    setEditingTx(null);
    setIsFormOpen(true);
  };

  // Trigger modal for Inline Edit
  const openEditForm = (tx: Transaction) => {
    setEditingTx(tx);
    setFormData({
      date: tx.date,
      type: tx.type,
      category: tx.category,
      clientProject: tx.clientProject,
      value: tx.value.toString(),
      paymentMethod: tx.paymentMethod,
      notes: tx.notes
    });
    setIsFormOpen(true);
  };

  // Submit operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientProject.trim() || !formData.value || !formData.category) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      if (editingTx) {
        // Edit flow
        await editTransaction(editingTx.id, {
          date: formData.date,
          type: formData.type,
          category: formData.category,
          clientProject: formData.clientProject,
          value: parseFloat(formData.value),
          paymentMethod: formData.paymentMethod,
          notes: formData.notes
        });
      } else {
        // Normal add flow
        await addTransaction({
          date: formData.date,
          type: formData.type,
          category: formData.category,
          clientProject: formData.clientProject,
          value: parseFloat(formData.value),
          paymentMethod: formData.paymentMethod,
          notes: formData.notes
        });
      }
      setIsFormOpen(false);
    } catch (e: any) {
      addToast(`Erro ao gravar lançamento: ${e.message}`, 'error');
    }
  };

  // Safe delete confirmations
  const triggerDelete = (id: string) => {
    if (user?.role !== 'admin') {
      addToast('Apenas o Administrador/Patrão possui permissão para deletar históricos lançados.', 'error');
      return;
    }
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteTransaction(deletingId);
      setDeletingId(null);
      // Recalibrate page position if current page is out of bounds
      if (paginatedTransactions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-zinc-950 text-zinc-100 font-sans" id="transactions-tab">
      
      {/* Top bar header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Livro de Lançamentos</h1>
          <p className="text-xs text-zinc-400 font-medium">Histórico geral de auditoria e controle de todas as entradas e saídas.</p>
        </div>
        
        <button
          onClick={openNewForm}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          Registrar Lançamento
        </button>
      </div>

      {/* SEARCH AND INTEGRATED FILTERS CONTROLS */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Quick search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Pesquisa rápida por cliente, projeto, detalhes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:bg-zinc-950 focus:outline-none transition-all rounded-xl text-xs text-white font-sans"
            />
          </div>

          {/* Quick Category filter selector */}
          <div className="w-full md:w-56 shrink-0 flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 focus:outline-none text-zinc-300 transition-all rounded-xl text-xs font-sans cursor-pointer"
            >
              <option value="all">Filtro por Categoria: Todas</option>
              {companySettings.categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Tab pills */}
        <div className="border-t border-zinc-800 pt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Tipo de Lançamento">
            <button
              onClick={() => { setTypeFilter('all'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                typeFilter === 'all'
                  ? 'bg-zinc-800 text-white'
                  : 'bg-zinc-950 hover:bg-zinc-900 border border-zinc-805 text-zinc-400'
              }`}
              aria-checked={typeFilter === 'all'}
              role="radio"
            >
              Todos ({transactions.length})
            </button>
            <button
              onClick={() => { setTypeFilter('entrada'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                typeFilter === 'entrada'
                  ? 'bg-emerald-600 font-bold text-white'
                  : 'bg-zinc-950 hover:bg-zinc-905 border border-zinc-805 text-emerald-400'
              }`}
              aria-checked={typeFilter === 'entrada'}
              role="radio"
            >
              📈 Entradas ({transactions.filter(t => t.type === 'entrada').length})
            </button>
            <button
              onClick={() => { setTypeFilter('saida'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                typeFilter === 'saida'
                  ? 'bg-rose-650 font-bold text-white'
                  : 'bg-zinc-950 hover:bg-zinc-905 border border-zinc-805 text-rose-400'
              }`}
              aria-checked={typeFilter === 'saida'}
              role="radio"
            >
              📉 Saídas ({transactions.filter(t => t.type === 'saida').length})
            </button>
          </div>

          <span className="text-[11px] font-sans font-medium text-zinc-505">
            Filtrados: <strong className="font-bold text-zinc-300">{filteredTransactions.length} registros</strong>
          </span>
        </div>
      </section>

      {/* CORE HISTORICAL TABLE */}
      <section className="bg-zinc-900 border border-zinc-802 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between min-h-[460px]">
        {filteredTransactions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <span className="p-4 bg-zinc-950 text-zinc-500 rounded-full mb-3 border border-zinc-850">
              <CalendarMinus className="h-8 w-8" />
            </span>
            <h3 className="text-sm font-semibold text-zinc-300">Nenhum lançamento localizado</h3>
            <p className="text-xs text-zinc-500 max-w-xs mt-1">
              Sua busca por filtros ou termos de pesquisa não retornou transações. Altere os campos acima.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="transactions-table">
              <thead>
                <tr className="bg-zinc-950/40 border-b border-zinc-800 text-[10px] font-sans font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Data</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Cliente / Projeto</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Pgto</th>
                  <th className="p-4">Lançado Por</th>
                  <th className="p-4 pr-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-805/60 text-xs font-sans font-medium text-zinc-400">
                {paginatedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-850/30 transition-colors">
                    <td className="p-4 pl-6 font-mono font-semibold text-zinc-400 whitespace-nowrap">
                      {tx.date.substring(8, 10)}/{tx.date.substring(5, 7)}/{tx.date.substring(0, 4)}
                    </td>
                    
                    {/* Entry/exit type Badge */}
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        tx.type === 'entrada'
                          ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30'
                          : 'bg-rose-955/20 text-rose-450 border border-rose-900/30'
                      }`}>
                        {tx.type === 'entrada' ? (
                          <>
                            <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                            Entrada
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="h-3 w-3 text-rose-400" />
                            Saída
                          </>
                        )}
                      </span>
                    </td>

                    {/* Client/Project and description */}
                    <td className="p-4 max-w-xs truncate">
                      <div>
                        <h4 className="font-semibold text-white text-[12.5px] truncate">{tx.clientProject}</h4>
                        {tx.notes && <p className="text-[10px] text-zinc-500 truncate mt-0.5">{tx.notes}</p>}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="p-1.5 bg-zinc-950 rounded-lg text-zinc-300 text-[11px] font-medium border border-zinc-805">
                        {tx.category}
                      </span>
                    </td>

                    {/* Monetary value */}
                    <td className={`p-4 font-bold font-mono whitespace-nowrap text-sm ${
                      tx.type === 'entrada' ? 'text-emerald-400' : 'text-rose-450'
                    }`}>
                      {tx.type === 'entrada' ? '+' : '-'} R$ {tx.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    {/* payment method */}
                    <td className="p-4 whitespace-nowrap font-medium text-zinc-400">{tx.paymentMethod}</td>
                    
                    {/* User session author */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[10.5px]">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-650" />
                        <span className="text-zinc-500">{tx.authorName}</span>
                      </div>
                    </td>

                    {/* Inline contextual actions */}
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEditForm(tx)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg cursor-pointer transition-all"
                          title="Fazer Edição"
                          aria-label="Fazer Edição"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        
                        <button
                          onClick={() => triggerDelete(tx.id)}
                          className="p-1.5 text-zinc-555 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg cursor-pointer transition-all"
                          title="Excluir Lançamento"
                          aria-label="Excluir Lançamento"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* INTEGRATED MODERN PAGINATION FOOTER */}
        {filteredTransactions.length > 0 && (
          <div className="p-4 border-t border-zinc-800 flex items-center justify-between font-sans">
            <span className="text-[11px] font-medium text-zinc-500">
              Registros {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTransactions.length)} a {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
                title="Página Anterior"
                aria-label="Página Anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-3 py-1 bg-zinc-850 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-200">
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 bg-zinc-950 hover:bg-zinc-905 border border-zinc-800 text-zinc-400 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
                title="Próxima Página"
                aria-label="Próxima Página"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* COMPREHENSIVE REUSABLE FORM MODAL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-zinc-955/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 max-w-md w-full overflow-hidden font-sans text-zinc-100"
            >
              <div className="p-6 border-b border-zinc-850 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">
                  {editingTx ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-zinc-500 hover:text-zinc-200 transition-colors p-1 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {/* Switch Type Selector */}
                <div>
                  <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1.5" id="form-tx-type-label">Tipo de Lançamento</label>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="form-tx-type-label">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'entrada' })}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        formData.type === 'entrada'
                          ? 'border-emerald-900 bg-emerald-905/20 text-emerald-400'
                          : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400'
                      }`}
                      aria-checked={formData.type === 'entrada'}
                      role="radio"
                    >
                      📈 Entrada / Receita
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'saida' })}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        formData.type === 'saida'
                          ? 'border-rose-909 bg-rose-955/20 text-rose-400'
                          : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400'
                      }`}
                      aria-checked={formData.type === 'saida'}
                      role="radio"
                    >
                      📉 Saída / Despesa
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="form-tx-val">Valor Real (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 text-white focus:border-indigo-500 focus:outline-none rounded-lg text-sm"
                      id="form-tx-val"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="form-tx-date">Data Registro</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 text-white focus:border-indigo-500 focus:outline-none rounded-lg text-sm font-mono text-zinc-300"
                      id="form-tx-date"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="form-tx-cat">Categoria</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-804 focus:border-indigo-500 text-white focus:outline-none rounded-lg text-xs cursor-pointer text-zinc-350"
                      id="form-tx-cat"
                    >
                      <option value="">Selecione categoria</option>
                      {companySettings.categories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="form-tx-method">Forma de Pagto</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-802 focus:border-indigo-505 text-white focus:outline-none rounded-lg text-xs cursor-pointer text-zinc-350"
                      id="form-tx-method"
                    >
                      <option value="Pix">Pix</option>
                      <option value="Boleto Bancário">Boleto Bancário</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Transferência">Transferência</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="form-tx-client">Cliente ou Projeto Vinculado</label>
                  <input
                    type="text"
                    required
                    value={formData.clientProject}
                    onChange={(e) => setFormData({ ...formData, clientProject: e.target.value })}
                    placeholder="Ex: Consultoria Techstart Inc"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 text-white focus:border-indigo-505 focus:outline-none rounded-lg text-sm"
                    id="form-tx-client"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-1" htmlFor="form-tx-notes">Anotações / Notas fiscais (Opcional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Contrato assinado em PDF, fatura enviada..."
                    rows={2}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-801 text-white focus:border-indigo-505 focus:outline-none rounded-lg text-sm"
                    id="form-tx-notes"
                  />
                </div>

                {editingTx && (
                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center gap-2 text-[10.5px] text-zinc-500">
                    <Info className="h-4 w-4 text-zinc-400 shrink-0" />
                    Este lançamento foi cadastrado originalmente por {editingTx.authorName}.
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 hover:bg-zinc-805 text-zinc-400 font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-505 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-sm"
                  >
                    {editingTx ? 'Confirmar Edição' : 'Salvar Lançamento'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION DELETION MODAL - PROTECTS HISTORY */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 bg-zinc-955/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 max-w-sm w-full p-6 text-center font-sans"
            >
              <span className="p-3.5 bg-rose-955/20 text-rose-450 border border-rose-900/30 rounded-full inline-block mb-4">
                <ShieldAlert className="h-7 w-7 text-rose-400" />
              </span>
              
              <h3 className="text-base font-semibold text-white">Remover Lançamento?</h3>
              <p className="text-xs text-zinc-400 mt-1.5 px-3">
                Esta ação é definitiva e removerá a entrada/saída de todos os cálculos corporativos, lucros e relatórios. Deseja mesmo prosseguir?
              </p>

              <div className="mt-6 flex gap-2 justify-center">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Não, voltar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-sm"
                >
                  Sim, Excluir definitivamente
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
