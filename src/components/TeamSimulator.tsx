/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAppStore } from '../context/AppContext';
import { 
  Users2, 
  Activity, 
  Tv, 
  Zap, 
  UserCheck, 
  ShieldCheck, 
  Briefcase, 
  Sparkles,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function TeamSimulator() {
  const { teamMembers, activityLogs, simulateTeamAction, user } = useAppStore();

  const getLogColor = (action: string) => {
    switch (action) {
      case 'login': return 'bg-sky-950/20 text-sky-400 border-sky-900/30';
      case 'add_transaction': return 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30';
      case 'pay_account': return 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30';
      case 'delete_transaction': return 'bg-rose-950/25 text-rose-450 border-rose-900/30';
      case 'simulate_worker': return 'bg-amber-955/20 text-amber-400 border-amber-900/30';
      default: return 'bg-zinc-950 text-zinc-400 border-zinc-800';
    }
  };

  const getLogLabel = (action: string) => {
    switch (action) {
      case 'login': return 'Entrada';
      case 'add_transaction': return 'Faturamento/Saída';
      case 'pay_account': return 'Baixa';
      case 'delete_transaction': return 'Exclusão';
      case 'simulate_worker': return 'Real-time';
      default: return 'Sistema';
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-zinc-950 text-zinc-100 font-sans" id="team-tab">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Equipe & Auditoria</h1>
          <p className="text-xs text-zinc-400 font-medium">Controle de logins ativos, simulação de atividades em tempo real e trilha de auditoria.</p>
        </div>
        
        {/* Live Simulator Trigger Button */}
        <button
          onClick={simulateTeamAction}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-505 active:scale-97 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
        >
          <Zap className="h-4 w-4 text-amber-300 fill-amber-300 animate-bounce" />
          Simular Venda/Serviço da Equipe
        </button>
      </div>

      {/* CORE COLUMNS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* TEAM MEMEBRS CARD TABLE */}
        <div className="p-6 bg-zinc-900 border border-zinc-801 rounded-2xl shadow-lg text-zinc-100">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-805 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Users2 className="h-4 w-4 text-indigo-400" />
              Quadro de Colaboradores
            </h3>
            <span className="text-[10px] bg-zinc-950 py-0.5 px-2 rounded-full font-bold font-mono text-zinc-400">
              {teamMembers.length} Inscritos
            </span>
          </div>

          <p className="text-xs text-zinc-400 font-medium mb-6 leading-relaxed">
            Profissionais cadastrados no painel administrativo. Você pode simular o envio de dados por qualquer um deles usando o painel azul.
          </p>

          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-3.5 bg-zinc-955/40 border border-zinc-850 hover:border-zinc-800 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="h-10 w-10 rounded-full border border-zinc-800 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{member.name}</h4>
                    <span className="text-[10px] text-zinc-500 block">{member.email}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block text-[9px] font-sans font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                    member.role === 'admin' 
                      ? 'bg-indigo-950/30 text-indigo-400 border border-indigo-900/40' 
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}>
                    {member.role === 'admin' ? 'Administrador' : 'Funcionário'}
                  </span>
                  
                  <span className="text-[10px] text-emerald-450 font-bold block mt-1 tracking-tight">
                    ● Online
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* SIMULATOR QUICK INFO */}
          <div className="mt-6 border-t border-zinc-850 pt-4">
            <h4 className="text-xs font-bold text-zinc-300 mb-1 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Sincronia SaaS
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
              Ao simular atividades, faturas de boleto, entradas e PIX adicionados aparecem de imediato no livro de lançamentos, modificando os relatórios tributários e o monitor principal.
            </p>
          </div>
        </div>

        {/* COMPREHENSIVE LIVE AUDIT ACTIVITY FEED */}
        <div className="lg:col-span-2 p-6 bg-zinc-900 border border-zinc-801 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-805 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-404" />
              Fila de Auditoria em Tempo Real
            </h3>
            <span className="text-[10px] bg-zinc-950 py-0.5 px-2 rounded-full font-bold font-mono text-zinc-350">
              Histórico de Ações
            </span>
          </div>

          <p className="text-xs text-zinc-400 font-medium mb-6 leading-relaxed">
            Registros de ocorrências contáveis, modulações de privilégio e sessões ativas. Uma ferramenta que impede fraudes e perdas na empresa.
          </p>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {activityLogs.length === 0 ? (
              <div className="p-8 border border-zinc-850 rounded-xl bg-zinc-950 text-center text-zinc-500 text-xs">
                Nenhum log gravado até o momento.
              </div>
            ) : (
              activityLogs.map((log) => {
                const formattedTime = new Date(log.timestamp).toLocaleTimeString('pt-BR');

                return (
                  <div 
                    key={log.id} 
                    className="p-3.5 bg-zinc-955/40 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 rounded-xl transition-all flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`shrink-0 border py-0.5 px-2 rounded-md text-[9px] font-extrabold uppercase font-sans tracking-wide mt-1 sm:mt-0 ${getLogColor(log.actionType)}`}>
                        {getLogLabel(log.actionType)}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-zinc-200 leading-snug">
                          {log.details}
                        </p>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                          <strong>{log.userName}</strong> ({log.userRole === 'admin' ? 'Administrador' : 'Colaborador'})
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono bg-zinc-950 p-1 text-zinc-400 rounded-md font-bold">
                        {formattedTime}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
