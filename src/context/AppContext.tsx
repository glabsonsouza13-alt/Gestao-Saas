/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Transaction, 
  Account, 
  CompanySettings, 
  TeamMember, 
  ActivityLog, 
  UserSession, 
  UserRole 
} from '../types';
import { 
  isSupabaseConfigured, 
  supabase, 
  handleSupabaseError 
} from '../supabase';

interface AppContextType {
  // Authentication & Perms
  user: UserSession | null;
  loginDemo: (role: UserRole, name: string, email: string) => void;
  loginWithGoogleReal: () => Promise<void>;
  logout: () => Promise<void>;
  
  // App states
  companySettings: CompanySettings;
  transactions: Transaction[];
  accounts: Account[];
  teamMembers: TeamMember[];
  activityLogs: ActivityLog[];
  
  // Loading & Toasts
  loading: boolean;
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  // Real-time operations
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'authorId' | 'authorName'>) => Promise<void>;
  editTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  addAccount: (data: Omit<Account, 'id' | 'createdAt' | 'authorId' | 'authorName'>) => Promise<void>;
  editAccount: (id: string, data: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  payAccount: (id: string, payStatus: 'pago' | 'pendente') => Promise<void>;
  
  updateCompanySettings: (data: Partial<CompanySettings>) => Promise<void>;
  simulateTeamAction: () => void;
  
  // Onboarding
  onboardingCompleted: boolean;
  completeOnboarding: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Core Mock/Initial Seed Data for instant visual excellence
const DEFAULT_CATEGORIES = [
  'Venda de Software',
  'Consultoria ERP',
  'Suporte Técnico',
  'Treinamentos',
  'Servidores Cloud (Saída)',
  'Assinaturas SaaS (Saída)',
  'Marketing e Ads (Saída)',
  'Contabilidade (Saída)',
  'Pró-Labore (Saída)',
  'Infraestrutura (Saída)'
];

const DEFAULT_SETTINGS: CompanySettings = {
  name: 'Inovação Digital SaaS',
  businessType: 'Tecnologia & Serviços',
  monthlyGoal: 15000,
  logoUrl: '⚡',
  categories: DEFAULT_CATEGORIES
};

const INITIAL_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Rodrigo Boss (Você)', email: 'admin@gestaosaas.com.br', role: 'admin', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120', active: true },
  { id: 'sim_worker_1', name: 'Ana Silva', email: 'ana.silva@gestaosaas.com.br', role: 'funcionario', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', active: true },
  { id: 'sim_worker_2', name: 'Carlos Santos', email: 'carlos.s@gestaosaas.com.br', role: 'funcionario', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120', active: true }
];

const getPastDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const INITIAL_TRANSACTIONS = (): Transaction[] => [
  {
    id: 't1',
    date: getPastDate(2),
    type: 'entrada',
    category: 'Venda de Software',
    clientProject: 'Projeto Fintech Alpha',
    value: 6500,
    paymentMethod: 'Pix',
    notes: 'Primeira parcela do desenvolvimento do dashboard admin.',
    authorId: '1',
    authorName: 'Rodrigo Boss',
    createdAt: new Date(getPastDate(2) + 'T10:00:00Z').toISOString()
  },
  {
    id: 't2',
    date: getPastDate(5),
    type: 'saida',
    category: 'Servidores Cloud (Saída)',
    clientProject: 'Fatura AWS Amazon',
    value: 1250,
    paymentMethod: 'Cartão de Crédito',
    notes: 'Servidores do ambiente de produção e homologação.',
    authorId: 'sim_worker_1',
    authorName: 'Ana Silva',
    createdAt: new Date(getPastDate(5) + 'T14:30:00Z').toISOString()
  },
  {
    id: 't3',
    date: getPastDate(10),
    type: 'entrada',
    category: 'Consultoria ERP',
    clientProject: 'Integração Distribuidora Sul',
    value: 4800,
    paymentMethod: 'Boleto Bancário',
    notes: 'Serviço concluído com homologação e treinamento da equipe.',
    authorId: '1',
    authorName: 'Rodrigo Boss',
    createdAt: new Date(getPastDate(10) + 'T09:15:05Z').toISOString()
  },
  {
    id: 't4',
    date: getPastDate(12),
    type: 'saida',
    category: 'Marketing e Ads (Saída)',
    clientProject: 'Campanha Google Ads',
    value: 800,
    paymentMethod: 'Pix',
    notes: 'Geração de leads no setor industrial.',
    authorId: 'sim_worker_2',
    authorName: 'Carlos Santos',
    createdAt: new Date(getPastDate(12) + 'T17:00:00Z').toISOString()
  },
  {
    id: 't5',
    date: getPastDate(15),
    type: 'entrada',
    category: 'Suporte Técnico',
    clientProject: 'Contrato Mensal - Vilar S/A',
    value: 1500,
    paymentMethod: 'Pix',
    notes: 'Mensalidade suporte nível 1 e 2.',
    authorId: 'sim_worker_1',
    authorName: 'Ana Silva',
    createdAt: new Date(getPastDate(15) + 'T11:00:00Z').toISOString()
  },
  {
    id: 't6',
    date: getPastDate(20),
    type: 'entrada',
    category: 'Treinamentos',
    clientProject: 'Bootcamp Interno TechStart',
    value: 3200,
    paymentMethod: 'Boleto Bancário',
    notes: 'Treinamento de React e TypeScript para equipe júnior.',
    authorId: '1',
    authorName: 'Rodrigo Boss',
    createdAt: new Date(getPastDate(20) + 'T08:00:00Z').toISOString()
  },
  {
    id: 't7',
    date: getPastDate(25),
    type: 'saida',
    category: 'Contabilidade (Saída)',
    clientProject: 'Mensalidade Escritório Real',
    value: 650,
    paymentMethod: 'Boleto Bancário',
    notes: 'Contabilidade e envio das guias de impostos mensais.',
    authorId: 'sim_worker_2',
    authorName: 'Carlos Santos',
    createdAt: new Date(getPastDate(25) + 'T15:00:00Z').toISOString()
  },
  {
    id: 't8',
    date: getPastDate(28),
    type: 'saida',
    category: 'Pró-Labore (Saída)',
    clientProject: 'Retirada Rodrigo Boss',
    value: 3000,
    paymentMethod: 'Transferência',
    notes: 'Pró-labore mensal padrão sócio fundador.',
    authorId: '1',
    authorName: 'Rodrigo Boss',
    createdAt: new Date(getPastDate(28) + 'T18:00:00Z').toISOString()
  }
];

const INITIAL_ACCOUNTS = (): Account[] => [
  {
    id: 'a1',
    name: 'Licenças Adobe Creative Cloud',
    value: 450,
    dueDate: getPastDate(-1), // Ontem! (Atrasada)
    status: 'pendente',
    recurrence: 'mensal',
    authorId: 'sim_worker_1',
    authorName: 'Ana Silva',
    createdAt: new Date().toISOString()
  },
  {
    id: 'a2',
    name: 'Contabilidade Mensal Consultoria',
    value: 850,
    dueDate: getPastDate(-4), // Em 4 dias no futuro!
    status: 'pendente',
    recurrence: 'mensal',
    authorId: 'sim_worker_2',
    authorName: 'Carlos Santos',
    createdAt: new Date().toISOString()
  },
  {
    id: 'a3',
    name: 'Aluguel Escritório Coworking',
    value: 2300,
    dueDate: getPastDate(-12), // Em 12 dias no futuro!
    status: 'pago',
    recurrence: 'mensal',
    authorId: '1',
    authorName: 'Rodrigo Boss',
    createdAt: new Date().toISOString()
  },
  {
    id: 'a4',
    name: 'Domínios e Hospedagem HostGator (Anual)',
    value: 240,
    dueDate: getPastDate(-18), // Próximos dias!
    status: 'pendente',
    recurrence: 'anual',
    authorId: '1',
    authorName: 'Rodrigo Boss',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_LOGS = (): ActivityLog[] => [
  { id: 'l1', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), userName: 'Rodrigo Boss', userEmail: 'admin@gestaosaas.com.br', userRole: 'admin', actionType: 'login', details: 'Acessou o painel administrativo' },
  { id: 'l2', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), userName: 'Ana Silva', userEmail: 'ana.silva@gestaosaas.com.br', userRole: 'funcionario', actionType: 'add_transaction', details: 'Registrou saída AWS Cloud de R$ 1.250,00' },
  { id: 'l3', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), userName: 'Carlos Santos', userEmail: 'carlos.s@gestaosaas.com.br', userRole: 'funcionario', actionType: 'add_transaction', details: 'Registrou despesa Google Ads de R$ 800,00' },
  { id: 'l4', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), userName: 'Rodrigo Boss', userEmail: 'admin@gestaosaas.com.br', userRole: 'admin', actionType: 'add_account', details: 'Cadastrou nova conta a pagar: Aluguel Coworking R$ 2.300,00' }
];

const normalizeLog = (item: any): ActivityLog => {
  return {
    id: item.id || 'log_' + Date.now() + Math.random().toString(36).substring(2, 5),
    timestamp: item.timestamp || new Date().toISOString(),
    userName: item.userName || item.username || item.user_name || 'Usuário',
    userEmail: item.userEmail || item.useremail || item.user_email || '',
    userRole: (item.userRole || item.userrole || item.user_role || 'funcionario') as ActivityLog['userRole'],
    actionType: (item.actionType || item.actiontype || item.action_type || 'simulate_worker') as ActivityLog['actionType'],
    details: item.details || ''
  };
};

export function AppProvider({ children }: { children: ReactNode }) {
  // Toast notifications state
  const [toasts, setToasts] = useState<AppContextType['toasts']>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  
  // App core states (prefilled with sample data or loaded from localStorage)
  const [user, setUser] = useState<UserSession | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(DEFAULT_SETTINGS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Toast Helpers
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Onboarding Complete helper
  const completeOnboarding = () => {
    localStorage.setItem('gestao_onboarding_done', 'true');
    setOnboardingCompleted(true);
    addToast('Bem-vindo à sua nova central de controle financeiro!', 'success');
  };

  // -------------------------------------------------------------
  // INITIAL DATA & PERSISTENCE LOAD
  // -------------------------------------------------------------
  useEffect(() => {
    let active = true;
    let liveChannel: any = null;
    let authSubscription: any = null;

    const loadData = async () => {
      setLoading(true);
      
      // Load onboarding status
      const onboardingDone = localStorage.getItem('gestao_onboarding_done');
      if (onboardingDone === 'true') {
        setOnboardingCompleted(true);
      }

      if (isSupabaseConfigured && supabase) {
        // Real Supabase Live Synchronizations
        addToast("Conectando ao banco de dados em nuvem Supabase...", "info");
        
        try {
          // Supabase Auth listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!active) return;
            if (session?.user) {
              const uSession: UserSession = {
                uid: session.user.id,
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
                email: session.user.email || '',
                role: session.user.email === 'admin@gestaosaas.com.br' ? 'admin' : 'funcionario',
                isSimulated: false
              };
              setUser(uSession);
              addToast(`Sessão ativa via Supabase: ${uSession.name}`, "success");
            } else {
              // Read cached local user
              const cachedUser = localStorage.getItem('gestao_cached_user');
              if (cachedUser) {
                setUser(JSON.parse(cachedUser));
              }
            }
          });
          authSubscription = subscription;

          // Fetch Company Settings
          const { data: settingsData, error: settingsError } = await supabase
            .from('settings')
            .select('*')
            .eq('id', 'current')
            .maybeSingle();

          if (!active) return;

          if (settingsError) {
            console.warn("Erro ao buscar configurações no Supabase:", settingsError);
          } else if (settingsData) {
            setCompanySettings(settingsData as CompanySettings);
            saveToLocal('gestao_settings', settingsData);
          } else {
            // Setup initial settings in Supabase
            await supabase.from('settings').insert([{ id: 'current', ...DEFAULT_SETTINGS }]);
          }

          // Fetch Transactions
          const { data: transData, error: transError } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false })
            .limit(100);

          if (!active) return;

          if (transError) {
            console.warn("Erro ao buscar transações no Supabase:", transError);
          } else if (transData && transData.length > 0) {
            setTransactions(transData as Transaction[]);
            saveToLocal('gestao_transactions', transData);
          }

          // Fetch Accounts
          const { data: accountsData, error: acError } = await supabase
            .from('accounts')
            .select('*')
            .order('dueDate', { ascending: true });

          if (!active) return;

          if (acError) {
            console.warn("Erro ao buscar contas no Supabase:", acError);
          } else if (accountsData && accountsData.length > 0) {
            setAccounts(accountsData as Account[]);
            saveToLocal('gestao_accounts', accountsData);
          }

          // Fetch Logs
          const { data: logsData, error: logsError } = await supabase
            .from('logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(20);

          if (!active) return;

          if (logsError) {
            console.warn("Erro ao buscar logs no Supabase:", logsError);
          } else if (logsData && logsData.length > 0) {
            const mappedLogs = logsData.map(normalizeLog);
            setActivityLogs(mappedLogs);
            saveToLocal('gestao_logs', mappedLogs);
          }

          // Real-time channel subscriptions for live multi-user features
          // Using a random suffix ensures no collisions with active/cached channels
          const channelName = `realtime_changes_${Math.random().toString(36).substring(2, 9)}`;
          liveChannel = supabase
            .channel(channelName)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, async () => {
              if (!active) return;
              const { data } = await supabase.from('transactions').select('*').order('date', { ascending: false }).limit(100);
              if (data && active) setTransactions(data as Transaction[]);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts' }, async () => {
              if (!active) return;
              const { data } = await supabase.from('accounts').select('*').order('dueDate', { ascending: true });
              if (data && active) setAccounts(data as Account[]);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, async () => {
              if (!active) return;
              const { data } = await supabase.from('settings').select('*').eq('id', 'current').maybeSingle();
              if (data && active) setCompanySettings(data as CompanySettings);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, async () => {
              if (!active) return;
              const { data } = await supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(20);
              if (data && active) setActivityLogs(data.map(normalizeLog));
            });

          liveChannel.subscribe();

        } catch (sbInitError) {
          console.error("Erro na inicialização em tempo real do Supabase:", sbInitError);
        }
      }

      // Check LocalStorage defaults
      const localSettings = localStorage.getItem('gestao_settings');
      const localTrans = localStorage.getItem('gestao_transactions');
      const localAccounts = localStorage.getItem('gestao_accounts');
      const localLogs = localStorage.getItem('gestao_logs');
      const localUser = localStorage.getItem('gestao_cached_user');

      if (localSettings) setCompanySettings(JSON.parse(localSettings));
      else localStorage.setItem('gestao_settings', JSON.stringify(DEFAULT_SETTINGS));

      if (localTrans) {
        setTransactions(JSON.parse(localTrans));
      } else {
        const preTransactions = INITIAL_TRANSACTIONS();
        setTransactions(preTransactions);
        localStorage.setItem('gestao_transactions', JSON.stringify(preTransactions));
      }

      if (localAccounts) {
        setAccounts(JSON.parse(localAccounts));
      } else {
        const preAccounts = INITIAL_ACCOUNTS();
        setAccounts(preAccounts);
        localStorage.setItem('gestao_accounts', JSON.stringify(preAccounts));
      }

      if (localLogs) {
        setActivityLogs(JSON.parse(localLogs));
      } else {
        const preLogs = INITIAL_LOGS();
        setActivityLogs(preLogs);
        localStorage.setItem('gestao_logs', JSON.stringify(preLogs));
      }

      if (localUser) {
        setUser(JSON.parse(localUser));
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    loadData();

    return () => {
      active = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      if (liveChannel && supabase) {
        supabase.removeChannel(liveChannel);
      }
    };
  }, []);

  // Sync state modifications to disk
  const saveToLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Helper to add Activity Log
  const logActivity = async (actionType: ActivityLog['actionType'], details: string, activeUser?: UserSession | null) => {
    const fallbackUser: UserSession = {
      uid: 'sistema',
      name: 'Sistema',
      email: 'sistema@gestaosaas.com.br',
      role: 'admin',
      isSimulated: false
    };
    const finalUser = activeUser || user || fallbackUser;

    const newLog: ActivityLog = {
      id: 'log_' + Date.now() + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toISOString(),
      userName: finalUser.name,
      userEmail: finalUser.email,
      userRole: finalUser.role,
      actionType,
      details
    };

    const updatedLogs = [newLog, ...activityLogs].slice(0, 50); // limit 50 logs
    setActivityLogs(updatedLogs);
    saveToLocal('gestao_logs', updatedLogs);

    if (isSupabaseConfigured && supabase) {
      try {
        // Try camelCase insertion first (as defined in our schema)
        const { error } = await supabase.from('logs').insert([newLog]);
        if (error) {
          console.warn("[Supabase Logs] Falha com chaves camelCase, tentando lowercase...", error.message);
          
          // Fallback 1: lowercase keys (username, useremail, userrole, actiontype)
          const lowercaseLog = {
            id: newLog.id,
            timestamp: newLog.timestamp,
            username: newLog.userName,
            useremail: newLog.userEmail,
            userrole: newLog.userRole,
            actiontype: newLog.actionType,
            details: newLog.details
          };
          
          const { error: err2 } = await supabase.from('logs').insert([lowercaseLog]);
          if (err2) {
            console.warn("[Supabase Logs] Falha com chaves lowercase, tentando snake_case...", err2.message);
            
            // Fallback 2: snake_case keys (user_name, user_email, user_role, action_type)
            const snakeCaseLog = {
              id: newLog.id,
              timestamp: newLog.timestamp,
              user_name: newLog.userName,
              user_email: newLog.userEmail,
              user_role: newLog.userRole,
              action_type: newLog.actionType,
              details: newLog.details
            };
            const { error: err3 } = await supabase.from('logs').insert([snakeCaseLog]);
            if (err3) {
              console.error("[Supabase Logs] Falha definitiva ao salvar log:", err3.message);
            }
          }
        }
      } catch (err) {
        console.warn("Não foi possível persistir log no Supabase:", err);
      }
    }
  };

  // -------------------------------------------------------------
  // SIMULATORS & AUTHENTICATION
  // -------------------------------------------------------------
  const loginDemo = (role: UserRole, name: string, email: string) => {
    const freshUser: UserSession = {
      uid: role === 'admin' ? '1' : 'worker_' + Date.now(),
      name,
      email,
      role,
      isSimulated: true
    };
    setUser(freshUser);
    saveToLocal('gestao_cached_user', freshUser);
    addToast(`Acesso efetuado como ${role === 'admin' ? 'Patrão/Admin (Total)' : 'Funcionário (Leitura/Edição)'}!`, 'success');
    logActivity('login', `Acessou aplicativo como ${role === 'admin' ? 'Administrador' : 'Funcionário'}`, freshUser);
  };

  const loginWithGoogleReal = async () => {
    if (!isSupabaseConfigured || !supabase) {
      // Simulate Google Login if not initialized
      loginDemo('admin', 'Diretor Inovação', 'diretor@gmail.com');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      addToast(`Sucesso! Google Login ativo. Redirecionando...`, 'success');
    } catch (e: any) {
      addToast(`Falha na autenticação Google: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Erro ao fazer signout no Supabase:", e);
      }
    }
    setUser(null);
    localStorage.removeItem('gestao_cached_user');
    addToast('Sessão encerrada com sucesso.', 'info');
  };

  // -------------------------------------------------------------
  // TRANSACTION CRUD (Realtime Local + Supabase mirror)
  // -------------------------------------------------------------
  const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'authorId' | 'authorName'>) => {
    if (!user) throw new Error("Usuário não autenticado.");
    
    const id = 'tr_' + Date.now() + Math.random().toString(36).substring(2, 5);
    const newTrans: Transaction = {
      id,
      ...data,
      authorId: user.uid,
      authorName: user.name,
      createdAt: new Date().toISOString()
    };

    const list = [newTrans, ...transactions];
    setTransactions(list);
    saveToLocal('gestao_transactions', list);

    addToast(`Lançamento de ${newTrans.type === 'entrada' ? 'entrada' : 'saída'} registrado!`, 'success');
    logActivity('add_transaction', `Registrou ${newTrans.type}: ${newTrans.clientProject} - R$ ${newTrans.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, user);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('transactions').insert([newTrans]);
        if (error) throw error;
      } catch (err) {
        handleSupabaseError(err, 'insert transaction');
      }
    }
  };

  const editTransaction = async (id: string, data: Partial<Transaction>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const list = transactions.map((t) => {
      if (t.id === id) {
        return { ...t, ...data };
      }
      return t;
    });

    setTransactions(list);
    saveToLocal('gestao_transactions', list);

    addToast('Lançamento financeiro atualizado com sucesso!', 'success');
    logActivity('edit_transaction', `Editou lançamento financeiro #${id}`, user);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('transactions').update(data).eq('id', id);
        if (error) throw error;
      } catch (err) {
        handleSupabaseError(err, 'update transaction');
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado.");
    
    if (user.role !== 'admin') {
      addToast("Apenas o Administrador (Patrão) possui permissão para deletar históricos lançados.", "error");
      return;
    }

    const tToDelete = transactions.find((t) => t.id === id);
    const list = transactions.filter((t) => t.id !== id);
    setTransactions(list);
    saveToLocal('gestao_transactions', list);

    addToast('Lançamento financeiro removido definitivamente.', 'success');
    if (tToDelete) {
      logActivity('delete_transaction', `Removeu lançamento: ${tToDelete.clientProject} (R$ ${tToDelete.value})`, user);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        handleSupabaseError(err, 'delete transaction');
      }
    }
  };

  // -------------------------------------------------------------
  // CONTAS / BILLS CRUD
  // -------------------------------------------------------------
  const addAccount = async (data: Omit<Account, 'id' | 'createdAt' | 'authorId' | 'authorName'>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const id = 'ac_' + Date.now() + Math.random().toString(36).substring(2, 5);
    const newAc: Account = {
      id,
      ...data,
      authorId: user.uid,
      authorName: user.name,
      createdAt: new Date().toISOString()
    };

    const list = [newAc, ...accounts];
    setAccounts(list);
    saveToLocal('gestao_accounts', list);

    addToast(`Conta a pagar cadastrada com sucesso: "${getShortTitle(newAc.name)}"`, 'success');
    logActivity('add_account', `Cadastrou conta a pagar: ${newAc.name} - Vencimento ${newAc.dueDate}`, user);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('accounts').insert([newAc]);
        if (error) throw error;
      } catch (err) {
        handleSupabaseError(err, 'insert account');
      }
    }
  };

  const editAccount = async (id: string, data: Partial<Account>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const list = accounts.map((a) => {
      if (a.id === id) {
        return { ...a, ...data };
      }
      return a;
    });

    setAccounts(list);
    saveToLocal('gestao_accounts', list);

    addToast('Cadastro da conta atualizado com sucesso.', 'success');
    logActivity('edit_transaction', `Modificou cadastro da conta #${id}`, user);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('accounts').update(data).eq('id', id);
        if (error) throw error;
      } catch (err) {
        handleSupabaseError(err, 'update account');
      }
    }
  };

  const deleteAccount = async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado.");

    if (user.role !== 'admin') {
      addToast("Apenas administradores podem remover contas agendadas.", "error");
      return;
    }

    const aToDelete = accounts.find((a) => a.id === id);
    const list = accounts.filter((a) => a.id !== id);
    setAccounts(list);
    saveToLocal('gestao_accounts', list);

    addToast('Conta removida do cronograma de vencimentos.', 'success');
    if (aToDelete) {
      logActivity('delete_account', `Excluiu conta agendada: ${aToDelete.name} (R$ ${aToDelete.value})`, user);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('accounts').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        handleSupabaseError(err, 'delete account');
      }
    }
  };

  const payAccount = async (id: string, payStatus: 'pago' | 'pendente') => {
    if (!user) throw new Error("Usuário não autenticado.");

    const targetAc = accounts.find(a => a.id === id);
    if (!targetAc) return;

    // Mutate state
    const list = accounts.map((a) => {
      if (a.id === id) {
        return { ...a, status: payStatus };
      }
      return a;
    });

    setAccounts(list);
    saveToLocal('gestao_accounts', list);

    // If status is changed to "pago", automatically record an corresponding "Saída" record inside ledger!
    if (payStatus === 'pago') {
      const idTrans = 'tr_auto_' + Date.now();
      const relativeTrans: Transaction = {
        id: idTrans,
        date: new Date().toISOString().split('T')[0],
        type: 'saida',
        category: targetAc.category || 'Infraestrutura (Saída)',
        clientProject: `Quitado: ${targetAc.name}`,
        value: targetAc.value,
        paymentMethod: 'Pix',
        notes: `Lançamento automático de pagamento da fatura com vencimento em ${targetAc.dueDate}.`,
        authorId: user.uid,
        authorName: user.name,
        createdAt: new Date().toISOString()
      };

      const updatedTrans = [relativeTrans, ...transactions];
      setTransactions(updatedTrans);
      saveToLocal('gestao_transactions', updatedTrans);

      addToast(`Conta quitada! Saída lançada no livro: R$ ${targetAc.value.toFixed(2)}`, 'success');
      logActivity('pay_account', `Efetuou baixa da conta: ${targetAc.name} e gerou seu recibo automático`, user);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('accounts').update({ status: 'pago' }).eq('id', id);
          await supabase.from('transactions').insert([relativeTrans]);
        } catch (err) {
          console.warn("Falha ao registrar recibo no Supabase:", err);
        }
      }
    } else {
      addToast('Status da conta alterado para Pendente.', 'info');
      logActivity('pay_account', `Estornou pagamento da conta ${targetAc.name}`, user);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('accounts').update({ status: 'pendente' }).eq('id', id);
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  // -------------------------------------------------------------
  // METADATA SETTINGS
  // -------------------------------------------------------------
  const updateCompanySettings = async (data: Partial<CompanySettings>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    if (user.role !== 'admin') {
      addToast("Apenas Administradores (Patrão) possuem nível de acesso para alterar configurações da empresa.", "error");
      return;
    }

    const nextSettings = { ...companySettings, ...data };
    setCompanySettings(nextSettings);
    saveToLocal('gestao_settings', nextSettings);

    addToast('Parâmetros e configurações da empresa salvo.', 'success');
    logActivity('update_settings', `Atualizou perfil da empresa para: ${nextSettings.name}`, user);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('settings').update(data).eq('id', 'current');
        if (error) throw error;
      } catch (err: any) {
        handleSupabaseError(err, 'update settings');
      }
    }
  };

  // -------------------------------------------------------------
  // INTELLIGENT MULTI-USER TEAM SIMULATOR
  // -------------------------------------------------------------
  const simulateTeamAction = () => {
    // Pick random simulated user (Ana or Carlos)
    const workers = teamMembers.filter(m => m.id !== '1' && m.id !== user?.uid);
    if (workers.length === 0) return;
    
    const randomWorker = workers[Math.floor(Math.random() * workers.length)];
    const simulatedSession: UserSession = {
      uid: randomWorker.id,
      name: randomWorker.name,
      email: randomWorker.email,
      role: randomWorker.role,
      isSimulated: true
    };

    // Actions list
    const simActions = [
      () => {
        // Option 1: Record a random Sale (entrada)
        const clients = ['Padaria Pão Quente', 'Clínica Sorriso', 'Academia Alpha Fit', 'Restaurante Sabor', 'Sacolão Frutas'];
        const projects = ['Manutenção de Website', 'Suporte Técnico Emergencial', 'Treinamento de Equipe', 'Campanha de Tráfego Orgânico'];
        const randomVal = Math.floor(Math.random() * 450) + 150; // Between 150 and 600
        const randClient = clients[Math.floor(Math.random() * clients.length)];
        const randProj = projects[Math.floor(Math.random() * projects.length)];

        const id = 'tr_sim_' + Date.now() + Math.random().toString(36).substring(2, 5);
        const newTrans: Transaction = {
          id,
          date: new Date().toISOString().split('T')[0],
          type: 'entrada',
          category: 'Suporte Técnico',
          clientProject: `${randProj} - ${randClient}`,
          value: randomVal,
          paymentMethod: 'Pix',
          notes: 'Registrado via Console de Equipe em tempo real.',
          authorId: simulatedSession.uid,
          authorName: simulatedSession.name,
          createdAt: new Date().toISOString()
        };

        setTransactions(prev => {
          const l = [newTrans, ...prev];
          saveToLocal('gestao_transactions', l);
          return l;
        });

        addToast(`[Tempo Real] Funcionário(a) ${randomWorker.name} acabou de registrar PIX recebido de R$ ${randomVal.toFixed(2)} por "${randProj}"!`, 'info');
        logActivity('simulate_worker', `Lançou venda PIX de R$ ${randomVal.toFixed(2)}: ${randProj}`, simulatedSession);
      },
      () => {
        // Option 2: Create a future Bill/Account (saiba)
        const billNames = ['Fatura Telefonia TIM Corp', 'Recarga Cartuchos Impressora', 'Compra de Café e Snacks', 'Assinatura Canva Pro'];
        const categories = ['Infraestrutura (Saída)', 'SaaS e Ferramentas (Saída)', 'Consumo Escritório (Saída)'];
        const randomVal = Math.floor(Math.random() * 150) + 50; 
        const randName = billNames[Math.floor(Math.random() * billNames.length)];

        const id = 'ac_sim_' + Date.now() + Math.random().toString(36).substring(2, 5);
        const newAc: Account = {
          id,
          name: randName,
          value: randomVal,
          dueDate: getPastDate(-7), // 7 days ahead
          status: 'pendente',
          recurrence: 'avulso',
          authorId: simulatedSession.uid,
          authorName: simulatedSession.name,
          createdAt: new Date().toISOString(),
          category: categories[Math.floor(Math.random() * categories.length)]
        };

        setAccounts(prev => {
          const l = [newAc, ...prev];
          saveToLocal('gestao_accounts', l);
          return l;
        });

        addToast(`[Tempo Real] Colaborador ${randomWorker.name} agendou vencimento: "${randName}" no valor de R$ ${randomVal.toFixed(2)}!`, 'info');
        logActivity('simulate_worker', `Cadastrou boleto a pagar R$ ${randomVal.toFixed(2)}: ${randName}`, simulatedSession);
      }
    ];

    // Pick & execute random action
    const randomAction = simActions[Math.floor(Math.random() * simActions.length)];
    randomAction();
  };

  const getShortTitle = (name: string) => {
    return name.length > 25 ? name.substring(0, 22) + '...' : name;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loginDemo,
        loginWithGoogleReal,
        logout,
        companySettings,
        transactions,
        accounts,
        teamMembers,
        activityLogs,
        loading,
        toasts,
        addToast,
        removeToast,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addAccount,
        editAccount,
        deleteAccount,
        payAccount,
        updateCompanySettings,
        simulateTeamAction,
        onboardingCompleted,
        completeOnboarding
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore deve ser usado dentro de um AppProvider');
  }
  return context;
}
