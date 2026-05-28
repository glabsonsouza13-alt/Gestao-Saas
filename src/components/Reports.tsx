/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAppStore } from '../context/AppContext';
import { Transaction } from '../types';
import { 
  BarChart, 
  Download, 
  Printer, 
  Calendar, 
  Briefcase, 
  Tag, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock,
  SlidersHorizontal
} from 'lucide-react';

type ReportType = 'mensal' | 'cliente' | 'categoria' | 'anual' | 'customizado';

export default function Reports() {
  const { transactions, user, companySettings } = useAppStore();
  const [reportType, setReportType] = useState<ReportType>('mensal');

  // Filter selection state
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  // Custom filter and report state for PDF Totalizer
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); // Default to first day of current month
    return d.toISOString().substring(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().substring(0, 10));
  const [customTitle, setCustomTitle] = useState<string>('Balanço Geral de Totais Consolidados');
  const [customDescription, setCustomDescription] = useState<string>('Compilação executiva de receitas e despesas operacionais para fins de auditoria local e fechamento de caixa.');
  const [customCategory, setCustomCategory] = useState<string>('all');
  const [customClient, setCustomClient] = useState<string>('all');
  const [includeTransactionsTable, setIncludeTransactionsTable] = useState<boolean>(true);
  const [auditName, setAuditName] = useState<string>('');

  // Sincronizar nome padrão com usuário ativo ao carregar
  useEffect(() => {
    if (user?.name) {
      setAuditName(user.name);
    }
  }, [user]);

  // -------------------------------------------------------------
  // RETRIEVE AVAILABLE GROUPS FOR SELECT OPTIONS
  // -------------------------------------------------------------
  // Unique months in format YYYY-MM
  const uniqueMonths = Array.from(new Set(transactions.map((t) => t.date.substring(0, 7)))).sort().reverse();
  
  // Unique clients
  const uniqueClients = Array.from(new Set(transactions.map((t) => {
    const s = t.clientProject;
    if (s.includes(' - ')) return s.split(' - ')[1].trim();
    return s.trim();
  }))).sort();

  // Unique categories
  const uniqueCategories = Array.from(new Set(transactions.map((t) => t.category))).sort();

  // Unique years
  const uniqueYears = Array.from(new Set(transactions.map((t) => t.date.substring(0, 4)))).sort().reverse();

  // -------------------------------------------------------------
  // COMPILE TRANSACTIONS BASED ON SELECTED REPORT FILTERS
  // -------------------------------------------------------------
  let compiledTransactions: Transaction[] = [];
  let titleLabel = '';

  if (reportType === 'mensal') {
    compiledTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
    const [yr, mn] = selectedMonth.split('-');
    titleLabel = `Relatório Mensal de Caixa - Ref. ${mn}/${yr}`;
  } else if (reportType === 'cliente') {
    compiledTransactions = transactions.filter(t => {
      const matchText = t.clientProject.toLowerCase();
      const matchClient = selectedClient.toLowerCase();
      return selectedClient ? matchText.includes(matchClient) : true;
    });
    titleLabel = selectedClient ? `Dossiê Financeiro por Fornecedor/Cliente - "${selectedClient}"` : 'Relatório por Cliente - Todos os Parceiros';
  } else if (reportType === 'categoria') {
    compiledTransactions = /all/i.test(selectedCategory) || !selectedCategory
      ? transactions
      : transactions.filter(t => t.category === selectedCategory);
    titleLabel = selectedCategory ? `Balanço Geral de Categoria - "${selectedCategory}"` : 'Relatório Consolidado por Categoria';
  } else if (reportType === 'anual') {
    compiledTransactions = transactions.filter(t => t.date.startsWith(selectedYear));
    titleLabel = `Relatório de Auditoria Anual - Ano Base ${selectedYear}`;
  } else if (reportType === 'customizado') {
    compiledTransactions = transactions.filter(t => {
      const isWithinDate = t.date >= startDate && t.date <= endDate;
      const isCategoryMatch = customCategory === 'all' || t.category === customCategory;
      const isClientMatch = customClient === 'all' || t.clientProject.toLowerCase().includes(customClient.toLowerCase());
      return isWithinDate && isCategoryMatch && isClientMatch;
    });
    titleLabel = customTitle.trim() || 'Balanço Geral de Totais Consolidados';
  }

  // Margins calculation
  let totalEntries = 0;
  let totalExits = 0;
  
  compiledTransactions.forEach((tx) => {
    if (tx.type === 'entrada') totalEntries += tx.value;
    else totalExits += tx.value;
  });

  const liquidBalance = totalEntries - totalExits;
  const profitabilityMargin = totalEntries > 0 ? (liquidBalance / totalEntries) * 100 : 0;

  // Compile Category distribution summary
  const categorySummary: { [key: string]: { entries: number, exits: number, total: number } } = {};
  compiledTransactions.forEach((t) => {
    if (!categorySummary[t.category]) {
      categorySummary[t.category] = { entries: 0, exits: 0, total: 0 };
    }
    if (t.type === 'entrada') {
      categorySummary[t.category].entries += t.value;
      categorySummary[t.category].total += t.value;
    } else {
      categorySummary[t.category].exits += t.value;
      categorySummary[t.category].total -= t.value;
    }
  });

  // -------------------------------------------------------------
  // EXCEL / CSV INTEGRATED EXPORTER (Browser Native)
  // -------------------------------------------------------------
  const handleExportCSV = () => {
    if (compiledTransactions.length === 0) {
      alert("Nenhum registro para exportação.");
      return;
    }

    // CSV headers in Portuguese
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID;Data;Tipo;Categoria;Descricao;Valor;Metodo de Pagamento;Autor\r\n";

    compiledTransactions.forEach((tx) => {
      const formattedDate = `${tx.date.substring(8,10)}/${tx.date.substring(5,7)}/${tx.date.substring(0,4)}`;
      const row = [
        tx.id,
        formattedDate,
        tx.type === 'entrada' ? 'RECEITA/ENTRADA' : 'DESPESA/SAIDA',
        tx.category.replace(/;/g, ','),
        tx.clientProject.replace(/;/g, ','),
        tx.value.toFixed(2),
        tx.paymentMethod,
        tx.authorName
      ].join(";");
      csvContent += row + "\r\n";
    });

    // Create click downloader element
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Relatorio_${reportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -------------------------------------------------------------
  // NATIVE PRINT SHTEES EMULATION (PDF Generator)
  // -------------------------------------------------------------
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-zinc-950 text-zinc-100 font-sans print:bg-white print:text-zinc-900 print:p-0" id="reports-tab">
      
      {/* Top dashboard panel - Hidden in prints */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Relatórios Financeiros</h1>
          <p className="text-xs text-zinc-400 font-medium">Balanço de faturamento bruto municipal, relatórios de clientes corporativos e metas.</p>
        </div>

        <div className="flex items-center gap-2">
          {reportType === 'customizado' && (
            <div className="hidden sm:flex text-indigo-400 font-medium text-xs bg-indigo-950/20 px-3 py-2 border border-indigo-900/30 rounded-xl items-center gap-1">
              💡 DICA: Escolha "Salvar como PDF" nas opções de impressora
            </div>
          )}

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-805 text-zinc-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            Planilha (CSV)
          </button>
          
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/10 active:scale-95"
          >
            <Printer className="h-4 w-4 text-white" />
            Baixar PDF / Imprimir
          </button>
        </div>
      </div>

      {/* DIGEST FILTER TYPE CARD SELECTORS - Hidden in prints */}
      <section className="bg-zinc-900 border border-zinc-801 rounded-2xl p-4 mb-6 shadow-sm flex flex-col gap-4 print:hidden" role="tablist" aria-label="Menu de Relatórios">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          <button
            onClick={() => setReportType('mensal')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
              reportType === 'mensal'
                ? 'border-indigo-500 bg-indigo-950/30 text-indigo-400'
                : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400'
            }`}
            role="tab"
            aria-selected={reportType === 'mensal'}
            id="tab-monthly-report"
          >
            <Calendar className="h-4 w-4" />
            Mensal
          </button>

          <button
            onClick={() => setReportType('cliente')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
              reportType === 'cliente'
                ? 'border-indigo-500 bg-indigo-950/30 text-indigo-400'
                : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-905 text-zinc-400'
            }`}
            role="tab"
            aria-selected={reportType === 'cliente'}
            id="tab-client-report"
          >
            <Briefcase className="h-4 w-4" />
            Por Parceiro
          </button>

          <button
            onClick={() => setReportType('categoria')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
              reportType === 'categoria'
                ? 'border-indigo-500 bg-indigo-950/30 text-indigo-400'
                : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-905 text-zinc-400'
            }`}
            role="tab"
            aria-selected={reportType === 'categoria'}
            id="tab-category-report"
          >
            <Tag className="h-4 w-4" />
            Por Categoria
          </button>

          <button
            onClick={() => setReportType('anual')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
              reportType === 'anual'
                ? 'border-indigo-500 bg-indigo-950/30 text-indigo-400'
                : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-905 text-zinc-400'
            }`}
            role="tab"
            aria-selected={reportType === 'anual'}
            id="tab-annual-report"
          >
            <BarChart className="h-4 w-4" />
            Anual
          </button>

          <button
            onClick={() => setReportType('customizado')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
              reportType === 'customizado'
                ? 'border-indigo-500 bg-indigo-955/40 text-indigo-400 shadow-inner'
                : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-905 text-zinc-400'
            }`}
            role="tab"
            aria-selected={reportType === 'customizado'}
            id="tab-custom-report"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Totalizador & PDF
          </button>
        </div>

        {/* COMPILER CONFIGURATION INPUTS SENSORS */}
        <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl">
          <h4 className="text-[10.5px] uppercase font-bold text-zinc-505 tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-zinc-400" /> Foco de Compilação
          </h4>
          
          {reportType === 'mensal' && (
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-sans cursor-pointer focus:outline-none focus:border-indigo-500 text-white"
              >
                {uniqueMonths.map((m: any, idx) => {
                  const [yr, mn] = (m as string).split('-');
                  return <option key={idx} value={m}>{mn}/{yr}</option>;
                })}
              </select>
              <span className="text-xs text-zinc-500 self-center font-medium">Lançamentos consolidados pelo mês escolhido.</span>
            </div>
          )}

          {reportType === 'cliente' && (
            <div className="flex gap-2">
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-sans cursor-pointer focus:outline-none focus:border-indigo-500 text-white"
              >
                <option value="">Todos os clientes/projetos</option>
                {uniqueClients.map((client, idx) => (
                  <option key={idx} value={client}>{client}</option>
                ))}
              </select>
              <span className="text-xs text-zinc-500 self-center font-medium">Balanço de recebimento e custos pelo nome do parceiro comercial.</span>
            </div>
          )}

          {reportType === 'categoria' && (
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-sans cursor-pointer focus:outline-none focus:border-indigo-500 text-white"
              >
                <option value="all">Todas as categorias</option>
                {uniqueCategories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
              <span className="text-xs text-zinc-500 self-center font-medium">Classifique e some os volumes de gastos por área operacional.</span>
            </div>
          )}

          {reportType === 'anual' && (
            <div className="flex gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-sans cursor-pointer focus:outline-none focus:border-indigo-500 text-white"
              >
                {uniqueYears.map((yr, idx) => (
                  <option key={idx} value={yr}>{yr}</option>
                ))}
              </select>
              <span className="text-xs text-zinc-500 self-center font-medium">Balanço anual de resultados estatísticos corporativos do exercício.</span>
            </div>
          )}

          {reportType === 'customizado' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Data Inicial */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Data Inicial</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-lg text-xs font-mono text-white"
                  />
                </div>

                {/* Data Final */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Data Final</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-lg text-xs font-mono text-white"
                  />
                </div>

                {/* Filtro por Categoria */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Categoria</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-lg text-xs cursor-pointer text-white"
                  >
                    <option value="all">Todas as Categorias</option>
                    {uniqueCategories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Parceiro */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Parceiro Comercial</label>
                  <select
                    value={customClient}
                    onChange={(e) => setCustomClient(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-lg text-xs cursor-pointer text-white"
                  >
                    <option value="all">Todos os Parceiros</option>
                    {uniqueClients.map((client, idx) => (
                      <option key={idx} value={client}>{client}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
                {/* Título Personalizado */}
                <div className="md:col-span-8">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Título Customizado do PDF</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Ex: Demonstrativo de Fechamento Financeiro"
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-lg text-xs text-white"
                  />
                </div>

                {/* Responsável pela Assinatura */}
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Nome para Assinatura</label>
                  <input
                    type="text"
                    value={auditName}
                    onChange={(e) => setAuditName(e.target.value)}
                    placeholder="Sua assinatura"
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-lg text-xs text-white font-semibold"
                  />
                </div>
              </div>

              {/* Descrição do Relatório */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Notas / Observações no PDF</label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Instruções e observações adicionais para este faturamento..."
                  rows={2}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-lg text-xs text-white"
                />
              </div>

              {/* Visual Table Toggles */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-900">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTransactionsTable}
                    onChange={(e) => setIncludeTransactionsTable(e.target.checked)}
                    className="h-4 w-4 rounded bg-zinc-900 border-zinc-800 text-indigo-500 accent-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Incluir demonstrativo detalhado com cada lançamento individual no PDF</span>
                </label>
                
                <span className="text-[11px] font-bold text-indigo-400 bg-indigo-950/20 py-1 px-2.5 rounded-md border border-indigo-900/30">
                  {includeTransactionsTable ? "✓ PDF Completo: Totais + Todas as transações" : "⚠ PDF Compacto: Baixar apenas os totais calculados"}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CONSOLIDATED PHYSICAL REPORT BOARD SHEET - OPTIMIZED FOR PRINTERS */}
      <section className="bg-zinc-900 border border-zinc-800 shadow-xl rounded-2xl p-8 max-w-4xl mx-auto font-sans print:border-none print:shadow-none print:p-0 print:bg-white print:text-zinc-900">
        
        {/* Print Brand header */}
        <div className="flex items-center justify-between border-b border-zinc-800 print:border-zinc-300 pb-6 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white print:text-zinc-900 tracking-tight">{titleLabel}</h2>
            <p className="text-xs text-zinc-400 print:text-zinc-500 font-medium mt-0.5">
              {reportType === 'customizado' 
                ? `${companySettings?.name || 'Gestão SaaS'} - Demonstrativo Consolidado de Totais`
                : 'Gestão SaaS - Central de Demonstrações Contábeis de Resultados (DRE)'}
            </p>
          </div>
          
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-indigo-400 print:text-indigo-650 block">CONTA AUDITADA</span>
            <span className="text-xs text-zinc-505 print:text-zinc-400 font-mono">Processamento: {new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* Custom description in custom reports */}
        {reportType === 'customizado' && customDescription.trim() && (
          <div className="mb-6 p-4 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-350 print:bg-zinc-50 print:text-zinc-700 print:border-zinc-200">
            <h4 className="text-[10px] uppercase font-bold text-indigo-400 print:text-indigo-500 mb-1">Notas do Demonstrativo / Memorial Descritivo</h4>
            <p className="font-sans font-medium whitespace-pre-line leading-relaxed">{customDescription}</p>
          </div>
        )}

        {/* METRICS RESULTS COLUMN SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 bg-zinc-950/40 p-5 rounded-2xl border border-zinc-850 print:bg-zinc-50 print:border-zinc-200 print:-mx-0">
          
          {/* Total entries */}
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 print:text-zinc-550 tracking-wider flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-emerald-400 print:text-emerald-650" /> Total Receitas
            </span>
            <div className="text-xl font-bold font-mono text-emerald-400 print:text-emerald-700 mt-1">
              R$ {totalEntries.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-500 print:text-zinc-400">Transações de entradas liquidadas</span>
          </div>

          {/* Total Exits */}
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 print:text-zinc-550 tracking-wider flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-rose-400 print:text-rose-650" /> Total Despesas
            </span>
            <div className="text-xl font-bold font-mono text-zinc-300 print:text-zinc-800 mt-1">
              R$ {totalExits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-500 print:text-zinc-400">Custos operacionais liquidados</span>
          </div>

          {/* Liquid margin */}
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 print:text-zinc-550 tracking-wider flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-indigo-400 print:text-indigo-650" /> Saldo Líquido
            </span>
            <div className={`text-xl font-bold font-mono mt-1 ${liquidBalance >= 0 ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700'}`}>
              R$ {liquidBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-500 print:text-zinc-400">
              {profitabilityMargin !== 0 ? `Margem operativa: ${profitabilityMargin.toFixed(1)}%` : 'Ativo circulante em caixa'}
            </span>
          </div>
        </div>

        {/* BREAKDOWN LEDGERS LIST OR CATEGORY SUMMARIZATION */}
        {reportType === 'customizado' && !includeTransactionsTable ? (
          <div>
            <h3 className="text-sm font-bold text-white print:text-zinc-800 uppercase tracking-wider mb-4 border-l-2 border-indigo-500 pl-2">
              Consolidado de Distribuição por Categoria
            </h3>
            
            {Object.keys(categorySummary).length === 0 ? (
              <div className="p-8 border border-zinc-850 print:border-zinc-200 rounded-xl bg-zinc-950/20 text-center text-zinc-500 print:text-zinc-450 text-xs">
                Nenhum lançamento gravado responde a este escopo de datas e filtros.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 print:border-zinc-200 text-zinc-500 print:text-zinc-450 font-bold uppercase text-[9.5px]">
                      <th className="py-2.5">Categoria</th>
                      <th className="py-2.5 text-right">Receitas (+)</th>
                      <th className="py-2.5 text-right">Despesas (-)</th>
                      <th className="py-2.5 text-right">Saldo por Categoria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850 print:divide-zinc-150 text-zinc-400 print:text-zinc-650 font-medium">
                    {Object.entries(categorySummary).map(([cat, val]) => (
                      <tr key={cat} className="hover:bg-zinc-800/20 print:hover:bg-slate-50/40">
                        <td className="py-3 font-semibold text-white print:text-zinc-800">{cat}</td>
                        <td className="py-3 text-right text-emerald-400 print:text-emerald-700 font-mono">
                          R$ {val.entries.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right text-rose-400 print:text-rose-700 font-mono">
                          R$ {val.exits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`py-3 text-right font-bold font-mono ${val.total >= 0 ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-450 print:text-rose-650'}`}>
                          R$ {val.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-bold text-white print:text-zinc-800 uppercase tracking-wider mb-4 border-l-2 border-indigo-500 pl-2">
              Demonstrativo Detalhado de Operações
            </h3>
            
            {compiledTransactions.length === 0 ? (
              <div className="p-8 border border-zinc-850 print:border-zinc-200 rounded-xl bg-zinc-950/20 text-center text-zinc-500 print:text-zinc-455 text-xs">
                Nenhum lançamento gravado responde a este escopo de datas e filtros.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 print:border-zinc-200 text-zinc-500 print:text-zinc-455 font-bold uppercase text-[9.5px]">
                      <th className="py-2.5">Data</th>
                      <th className="py-2.5">Tipo</th>
                      <th className="py-2.5">Parceiro / Descrição</th>
                      <th className="py-2.5">Categoria</th>
                      <th className="py-2.5">Lançado por</th>
                      <th className="py-2.5 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850 print:divide-zinc-150 text-zinc-400 print:text-zinc-650 font-medium">
                    {compiledTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-zinc-800/20 print:hover:bg-slate-50/40">
                        <td className="py-3 font-mono text-zinc-500 print:text-zinc-400">
                          {tx.date.substring(8,10)}/{tx.date.substring(5,7)}/{tx.date.substring(0,4)}
                        </td>
                        <td className={`py-3 font-bold uppercase text-[10px] ${tx.type === 'entrada' ? 'text-emerald-400 print:text-emerald-650' : 'text-rose-450 print:text-rose-605'}`}>
                          {tx.type === 'entrada' ? 'RECEITA' : 'DESPESA'}
                        </td>
                        <td className="py-3">
                          <div className="font-semibold text-white print:text-zinc-800">{tx.clientProject}</div>
                          {tx.notes && <div className="text-[10px] text-zinc-500 print:text-zinc-500 line-clamp-1">{tx.notes}</div>}
                        </td>
                        <td className="py-3 font-sans italic text-[11px] text-zinc-300 print:text-zinc-650">{tx.category}</td>
                        <td className="py-3 text-zinc-500 print:text-zinc-400 text-[10.5px]">{tx.authorName}</td>
                        <td className={`py-3 text-right font-bold font-mono ${tx.type === 'entrada' ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-450 print:text-zinc-800'}`}>
                          R$ {tx.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PRINT SIGN OFF AREA */}
        <div className="hidden print:block mt-16 pt-8 border-t border-zinc-200 flex justify-between items-center text-[10px] font-sans">
          <div>
            <div className="border-b border-zinc-350 w-44 mb-1"></div>
            <strong>{reportType === 'customizado' && auditName ? auditName : (user?.name || 'Diretor Responsável')}</strong><br />
            Assinatura do Responsável
          </div>
          <div className="text-right text-zinc-500 font-medium max-w-sm">
            Balanço computado instantaneamente via sistema Gestão SaaS. Salvamento off-line auditado e assinado no faturamento organizacional.
          </div>
        </div>
      </section>
    </div>
  );
}
