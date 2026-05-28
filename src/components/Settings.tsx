/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { 
  Settings2, 
  Building2, 
  Target, 
  Sparkles, 
  Trash2, 
  Plus, 
  Save, 
  BadgeHelp,
  Lock,
  Database,
  HardDrive
} from 'lucide-react';
import { isSupabaseConfigured } from '../supabase';

const STATIC_LOGOS = ['⚡', '💎', '📈', '🚀', '💼', '🦄', '🛒', '🎨', '🛠️', '🍇', '🏥', '💡'];

export default function Settings() {
  const { user, companySettings, updateCompanySettings, addToast, resetAllData } = useAppStore();

  const [name, setName] = useState(companySettings.name);
  const [businessType, setBusinessType] = useState(companySettings.businessType);
  const [monthlyGoal, setMonthlyGoal] = useState<string>(companySettings.monthlyGoal.toString());
  const [selectedLogo, setSelectedLogo] = useState(companySettings.logoUrl || '⚡');
  const [categories, setCategories] = useState<string[]>(companySettings.categories);

  // New category state
  const [newCatName, setNewCatName] = useState('');

  // Add tag
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (categories.includes(newCatName.trim())) {
      addToast('Esta categoria já existe no seu catálogo!', 'error');
      return;
    }

    setCategories([...categories, newCatName.trim()]);
    setNewCatName('');
  };

  // Remove tag
  const handleRemoveCategory = (catName: string) => {
    // Keep at least 1 category
    if (categories.length <= 1) {
      addToast('A empresa deve possuir no mínimo 1 categoria para transações.', 'error');
      return;
    }
    setCategories(categories.filter((c) => c !== catName));
  };

  // Submit company modifications
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'admin') {
      addToast('Apenas o Administrador/Patrão possui permissão para mudar as configurações da empresa.', 'error');
      return;
    }

    if (!name.trim()) {
      alert('Favor preencher o nome da empresa.');
      return;
    }

    await updateCompanySettings({
      name,
      businessType,
      monthlyGoal: parseFloat(monthlyGoal) || 0,
      logoUrl: selectedLogo,
      categories: categories
    });
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-zinc-950 text-zinc-100 font-sans" id="settings-tab">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Preferências da Corporação</h1>
          <p className="text-xs text-zinc-400 font-medium">Configure a identidade visual da empresa, orçamentos, metas mensais e categorias financeiras.</p>
        </div>
      </div>

      {/* CORE CONFIGS FORM FRAME */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* EDIT METADATA PANEL */}
        <div className="lg:col-span-2 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg text-zinc-100">
          <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2 border-b border-zinc-805 pb-3">
            <Building2 className="h-4.5 w-4.5 text-indigo-400" />
            Metadados do Negócio
          </h3>

          <form onSubmit={handleSaveChanges} className="space-y-6">
            {/* ONLY ADMIN WARNING */}
            {user?.role !== 'admin' && (
              <div className="p-3 bg-zinc-950 border border-zinc-850 text-zinc-500 rounded-xl text-xs font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-zinc-400" />
                Apenas o Administrador/Patrão pode modificar as configurações do negócio.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-2" htmlFor="settings-name">Nome Comercial da Empresa</label>
                <input
                  type="text"
                  disabled={user?.role !== 'admin'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:bg-zinc-950 focus:outline-none transition-all rounded-xl text-xs font-semibold text-white disabled:opacity-50"
                  id="settings-name"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-2" htmlFor="settings-business">Área Governamental / Ramo</label>
                <input
                  type="text"
                  disabled={user?.role !== 'admin'}
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="Ex: Consultoria Agrícola"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:bg-zinc-950 focus:outline-none transition-all rounded-xl text-xs font-semibold text-white disabled:opacity-50"
                  id="settings-business"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-2" htmlFor="settings-goal">Meta Faturamento Mensal (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 py-2.5 text-xs font-bold text-zinc-500">R$</span>
                  <input
                    type="number"
                    disabled={user?.role !== 'admin'}
                    value={monthlyGoal}
                    onChange={(e) => setMonthlyGoal(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:bg-zinc-950 focus:outline-none transition-all rounded-xl text-xs font-bold text-white disabled:opacity-50 font-mono"
                    id="settings-goal"
                  />
                </div>
              </div>

              {/* LOGO GRID SELECTOR */}
              <div>
                <label id="logo-sec-label" className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mb-2">Simbolo Logotipo Representativo</label>
                <div role="radiogroup" aria-labelledby="logo-sec-label" className="grid grid-cols-6 gap-2 p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
                  {STATIC_LOGOS.map((logo) => (
                    <button
                      key={logo}
                      type="button"
                      disabled={user?.role !== 'admin'}
                      onClick={() => setSelectedLogo(logo)}
                      className={`py-2 text-base rounded-lg transition-all cursor-pointer ${
                        selectedLogo === logo
                          ? 'bg-indigo-600 shadow-md scale-110 text-white border border-indigo-500'
                          : 'bg-zinc-900 hover:bg-zinc-850 border border-zinc-801 text-zinc-400 disabled:opacity-50'
                      }`}
                      aria-checked={selectedLogo === logo}
                      role="radio"
                    >
                      {logo}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SAVE TRIGGER BUTTON */}
            <div className="pt-4 border-t border-zinc-850 flex justify-end">
              <button
                type="submit"
                disabled={user?.role !== 'admin'}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-505 active:scale-98 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Salvar Alterações e Logomarca
              </button>
            </div>
          </form>
        </div>

        {/* FINANCIAL CATEGORY TAILOR PANEL */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg text-zinc-100">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 border-b border-zinc-805 pb-3">
            <Settings2 className="h-4.5 w-4.5 text-indigo-400" />
            Controle de Classificações
          </h3>

          <p className="text-xs text-zinc-400 font-medium mb-6 leading-relaxed">
            Personalize quais categorias estão disponíveis nas telas de lançamentos e agendamento de faturas.
          </p>

          {/* Quick inline insertion form */}
          <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
            <input
              type="text"
              disabled={user?.role !== 'admin'}
              placeholder="Criar categoria..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:outline-none transition-all rounded-xl text-xs text-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={user?.role !== 'admin' || !newCatName.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-505 hover:scale-105 rounded-xl cursor-pointer disabled:opacity-50 text-white shrink-0 transition-all font-bold"
              aria-label="Adicionar Categoria"
            >
              <Plus className="h-4.5 w-4.5" />
            </button>
          </form>

          {/* Slices representation display */}
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div 
                key={cat} 
                className="flex items-center justify-between p-2.5 bg-zinc-955/40 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 rounded-xl transition-all"
              >
                <span className="text-xs font-semibold text-zinc-350 truncate mr-2">{cat}</span>
                <button
                  type="button"
                  disabled={user?.role !== 'admin'}
                  onClick={() => handleRemoveCategory(cat)}
                  className="p-1.5 hover:bg-rose-950/20 text-zinc-500 hover:text-rose-450 rounded-lg cursor-pointer disabled:opacity-30 transition-all"
                  title="Apagar categoria"
                  aria-label="Apagar categoria"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SUPABASE CLOUD STATUS & SQL SCHEMA SECTION */}
      <div className="mt-8 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg text-zinc-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isSupabaseConfigured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Integração do Banco em Nuvem: Supabase</h3>
              <p className="text-xs text-zinc-400 font-medium">Instruções para conexão em tempo real com seu próprio servidor Supabase.</p>
            </div>
          </div>
          <div>
            {isSupabaseConfigured ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Conectado (Cloud Active)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Offline (Armazenamento Local)
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs leading-relaxed">
          <div className="space-y-4 text-zinc-400">
            <p className="font-medium">
              O aplicativo foi migrado com sucesso de Firebase para o <strong className="text-white">Supabase</strong>. Toda a camada de segurança, transações em tempo real e Sincronização de dados agora opera sob o cliente oficial Postgres da Supabase.
            </p>
            <div>
              <h4 className="font-bold text-white mb-2 uppercase tracking-wider text-[10px]">Como Ativar a Nuvem?</h4>
              <ol className="list-decimal list-inside space-y-2 font-medium">
                <li>Crie um projeto gratuito na plataforma <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">Supabase.com</a>.</li>
                <li>No painel do projeto, vá em <strong className="text-zinc-300">Project Settings &gt; API</strong> e pegue a URL e a Anon key.</li>
                <li>Vá no painel de segredos (Secrets/Settings) do seu ambiente AI Studio Build.</li>
                <li>Adicione as variáveis de ambiente: <code className="text-indigo-400 bg-zinc-950 px-1.5 py-0.5 rounded">VITE_SUPABASE_URL</code> e <code className="text-indigo-400 bg-zinc-950 px-1.5 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>.</li>
                <li>O sistema identificará as credenciais na hora e migrará o fluxo de dados em tempo real automaticamente!</li>
              </ol>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-indigo-400" />
              SQL Schema das Tabelas (SQL Editor do Supabase)
            </h4>
            <div className="relative font-sans text-zinc-300">
              <pre className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl overflow-x-auto text-[10px] font-mono text-indigo-300 leading-normal max-h-[190px]">
{`-- 1. Tabela de Configurações
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "businessType" TEXT NOT NULL,
  "monthlyGoal" NUMERIC NOT NULL,
  "logoUrl" TEXT,
  categories TEXT[]
);

-- 2. Tabela de Transações
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  "clientProject" TEXT NOT NULL,
  value NUMERIC NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  notes TEXT,
  "authorId" TEXT,
  "authorName" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Contas / Bills
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  "dueDate" DATE NOT NULL,
  status TEXT NOT NULL,
  recurrence TEXT NOT NULL,
  "authorId" TEXT,
  "authorName" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  category TEXT
);

-- 4. Tabela de Logs de Atividade
CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  "userName" TEXT,
  "userEmail" TEXT,
  "userRole" TEXT,
  "actionType" TEXT,
  details TEXT
);`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* DANGER FACTORY RESET SECTION */}
      <div className="mt-8 p-6 bg-zinc-900 border border-rose-950/45 rounded-2xl shadow-lg text-zinc-100">
        <h3 className="text-sm font-semibold text-rose-450 mb-2 flex items-center gap-2">
          <Trash2 className="h-4.5 w-4.5 text-rose-500" />
          Área de Risco: Resetar Todo o App
        </h3>
        <p className="text-xs text-zinc-400 font-medium mb-6">
          Remover permanentemente todos os registros de transações, faturas a pagar, histórico de atividades e configurações desta empresa para iniciar do zero. Esta operação não pode ser desfeita.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm('Tem certeza absoluta de que deseja ZERAR todo o aplicativo? Todas as suas transações, faturas e registros de atividades serão excluídos definitivamente.')) {
              resetAllData();
            }
          }}
          className="px-5 py-3 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-600 text-rose-450 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 active:scale-98"
        >
          <Trash2 className="h-4 w-4 text-rose-500 group-hover:text-white" />
          Zerar Todo o Aplicativo (Reset Geral)
        </button>
      </div>
    </div>
  );
}
