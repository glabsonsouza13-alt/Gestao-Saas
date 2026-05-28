/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAppStore } from '../context/AppContext';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  CalendarClock, 
  BarChart3, 
  Users2, 
  Settings2, 
  LogOut, 
  ShieldCheck, 
  Users, 
  Zap 
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user, companySettings, logout, loginDemo, addToast, simulateTeamAction } = useAppStore();

  const menuItems = [
    { id: 'dashboard', label: 'Monitor', icon: LayoutDashboard },
    { id: 'transactions', label: 'Lançamentos', icon: ArrowLeftRight },
    { id: 'accounts', label: 'Contas da Empresa', icon: CalendarClock },
    { id: 'reports', label: 'Relatórios Inteligentes', icon: BarChart3 },
    { id: 'team', label: 'Equipe ao Vivo', icon: Users2 },
    { id: 'settings', label: 'Configurações', icon: Settings2 },
  ];

  const handleRoleToggle = (newRole: UserRole) => {
    if (!user) return;
    if (newRole === 'admin') {
      loginDemo('admin', 'Rodrigo Boss', 'admin@gestaosaas.com.br');
    } else {
      loginDemo('funcionario', 'Ana Silva', 'ana.silva@gestaosaas.com.br');
    }
    addToast(`Perfil de permissões sintonizado para: ${newRole === 'admin' ? 'Administrador' : 'Colaborador'}`, 'info');
  };

  return (
    <aside className="w-68 bg-zinc-950/70 backdrop-blur-md text-zinc-300 flex flex-col h-screen border-r border-zinc-800 shrink-0 font-sans select-none relative z-20">
      
      {/* Brand Profile Header */}
      <div className="p-5 border-b border-zinc-800 flex items-center gap-3">
        <span className="h-10 w-10 text-xl font-bold bg-indigo-500/20 text-indigo-400 flex items-center justify-center rounded-xl border border-indigo-500/30">
          {companySettings.logoUrl || '⚡'}
        </span>
        <div className="overflow-hidden">
          <h2 className="text-sm font-sans font-semibold text-white tracking-tight truncate">
            {companySettings.name}
          </h2>
          <span className="text-[10px] uppercase font-sans font-extrabold text-indigo-400 tracking-wider block">
            {companySettings.businessType}
          </span>
        </div>
      </div>

      {/* Navigation Modules list */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-2">
          CENTRAL GERAL
        </span>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-sm font-medium border border-transparent ${
                isActive
                  ? 'bg-indigo-600/15 border-indigo-500/30 font-semibold text-indigo-400 shadow-md shadow-indigo-950/20 shadow-inner'
                  : 'hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <IconComponent className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Permission Switch Drawer Panel */}
      {user && (
        <div className="m-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl relative z-10">
          <span className="block text-[9px] font-sans font-bold text-zinc-500 uppercase tracking-widest text-center mb-1.5">
            SELETOR DE PERMISSÃO (TESTE)
          </span>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-950 rounded-lg">
            <button
              onClick={() => handleRoleToggle('admin')}
              className={`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1 border border-transparent ${
                user.role === 'admin'
                  ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
                  : 'text-zinc-400 hover:text-zinc-250'
              }`}
            >
              <ShieldCheck className="h-3 w-3" />
              Patrão
            </button>
            <button
              onClick={() => handleRoleToggle('funcionario')}
              className={`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1 border border-transparent ${
                user.role === 'funcionario'
                  ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
                  : 'text-zinc-400 hover:text-zinc-250'
              }`}
            >
              <Users className="h-3 w-3" />
              Func.
            </button>
          </div>
          <button
            onClick={simulateTeamAction}
            className="w-full mt-3 py-1.5 px-3 bg-zinc-800 hover:bg-zinc-750 active:scale-98 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1 border border-zinc-700/60"
          >
            <Zap className="h-3 w-3 text-amber-400 fill-amber-400" />
            Inserir Venda ao Vivo
          </button>
        </div>
      )}

      {/* User Badge Footer */}
      {user && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 overflow-hidden">
            <img
              src={
                user.uid === '1'
                  ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
                  : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120'
              }
              alt="Avatar do usuário"
              className="h-8 w-8 rounded-full border border-zinc-700 object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold text-zinc-200 truncate">{user.name}</h4>
              <span className={`text-[9px] font-sans font-bold uppercase px-1.5 py-0.5 rounded-md ${
                user.role === 'admin' 
                  ? 'bg-indigo-950/50 text-indigo-400 border border-indigo-900/30' 
                  : 'bg-zinc-950/50 text-zinc-400 border border-zinc-800/30'
              }`}>
                {user.role === 'admin' ? 'Patrão/Admin' : 'Funcionário'}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-zinc-500 hover:text-rose-450 hover:bg-rose-500/10 rounded-xl cursor-pointer transition-all shrink-0"
            title="Encerrar Sessão"
            aria-label="Encerrar Sessão"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      )}
    </aside>
  );
}
