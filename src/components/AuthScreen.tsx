/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { Shield, Sparkles, Building2, TrendingUp, Users, ArrowRight, UserCheck, Lock, Mail, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AuthScreen() {
  const { 
    loginDemo, 
    loginWithGoogleReal, 
    onboardingCompleted, 
    completeOnboarding, 
    updateCompanySettings 
  } = useAppStore();

  const [onboardingStep, setOnboardingStep] = useState<number>(3);
  const [role, setRole] = useState<'admin' | 'funcionario'>('admin');
  const [userName, setUserName] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [businessType, setBusinessType] = useState<string>('Tecnologia');
  const [loginEmail, setLoginEmail] = useState<string>('admin@gestaosaas.com.br');
  const [loginPassword, setLoginPassword] = useState<string>('123456');

  const handleNextStep = () => {
    if (onboardingStep === 0) {
      if (!userName.trim()) {
        alert('Por favor, informe seu nome.');
        return;
      }
      setOnboardingStep(1);
    } else if (onboardingStep === 1) {
      if (!companyName.trim()) {
        alert('Por favor, digite o nome de sua empresa.');
        return;
      }
      // Apply configured settings to app
      updateCompanySettings({
        name: companyName,
        businessType: businessType
      });
      setOnboardingStep(2);
    } else if (onboardingStep === 2) {
      setOnboardingStep(3);
    } else if (onboardingStep === 3) {
      loginDemo(role, userName, userName.toLowerCase().replace(/ /g, '') + '@gestaosaas.com.br');
      completeOnboarding();
    }
  };

  const skipOnboardingDirectly = () => {
    loginDemo('admin', 'Rodrigo Boss', 'admin@gestaosaas.com.br');
    completeOnboarding();
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans text-zinc-100 w-full">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full filter blur-3xl" />
      
      {/* Main card */}
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-801 shadow-2xl rounded-3xl overflow-hidden relative z-10 flex flex-col min-h-[580px]">
        
        {/* Onboarding Slider Frame */}
        <div className="p-8 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            
            {/* STEP 0: WHO ARE YOU */}
            {onboardingStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-center mb-6">
                    <span className="p-3 bg-indigo-955/40 border border-indigo-900/30 text-indigo-400 rounded-2xl">
                      <Sparkles className="h-8 w-8" />
                    </span>
                  </div>
                  <h1 className="text-3xl font-sans font-semibold text-white text-center tracking-tight mb-2">
                    Controle tudo na sua empresa
                  </h1>
                  <p className="text-sm font-sans text-zinc-400 text-center mb-8">
                    Gestão SaaS é a central financeira moderna mais leve, fluida e intuitiva de usar.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest mb-1.5" htmlFor="user-name">
                        Seu nome completo
                      </label>
                      <input
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Ex: Rodrigo Albuquerque"
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:bg-zinc-950 focus:outline-none transition-all rounded-xl text-sm font-sans text-white placeholder-zinc-650"
                        id="user-name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest mb-1.5" id="user-role-label">
                        Como deseja entrar hoje?
                      </label>
                      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-labelledby="user-role-label">
                        <button
                          type="button"
                          onClick={() => setRole('admin')}
                          className={`p-4 border rounded-xl flex flex-col items-center gap-1.5 group cursor-pointer transition-all ${
                            role === 'admin'
                              ? 'border-indigo-500 bg-indigo-950/30 text-indigo-400 font-semibold'
                              : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'
                          }`}
                          aria-checked={role === 'admin'}
                          role="radio"
                        >
                          <Shield className={`h-5 w-5 ${role === 'admin' ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-450'}`} />
                          <span className="text-xs">Patrão / Admin</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRole('funcionario')}
                          className={`p-4 border rounded-xl flex flex-col items-center gap-1.5 group cursor-pointer transition-all ${
                            role === 'funcionario'
                              ? 'border-indigo-500 bg-indigo-950/30 text-indigo-400 font-semibold'
                              : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'
                          }`}
                          aria-checked={role === 'funcionario'}
                          role="radio"
                        >
                          <Users className={`h-5 w-5 ${role === 'funcionario' ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-450'}`} />
                          <span className="text-xs">Funcionário</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={skipOnboardingDirectly}
                    className="text-xs text-zinc-550 hover:text-zinc-400 cursor-pointer transition-colors font-semibold"
                  >
                    Ignorar Onboarding
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-505 text-white font-medium text-sm flex items-center gap-1.5 rounded-xl cursor-pointer transition-colors"
                  >
                    Próximo <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 1: DEFINE COMPANY */}
            {onboardingStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-center mb-6">
                    <span className="p-3 bg-indigo-955/40 border border-indigo-900/30 text-indigo-400 rounded-2xl">
                      <Building2 className="h-8 w-8" />
                    </span>
                  </div>
                  <h1 className="text-3xl font-sans font-semibold text-white text-center tracking-tight mb-2">
                    Sobre seu Negócio
                  </h1>
                  <p className="text-sm font-sans text-zinc-400 text-center mb-8">
                    Personalize o nome corporativo e área operacional da sua central de hoje.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest mb-1.5" htmlFor="company-name">
                        Nome de sua Empresa / Razão Social
                      </label>
                      <input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ex: Alfa Soluções Digitais"
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-indigo-505 focus:bg-zinc-950 focus:outline-none transition-all rounded-xl text-sm font-sans text-white text-white placeholder-zinc-650"
                        id="company-name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest mb-1.5" htmlFor="business-type">
                        Ramo de Atuação
                      </label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-indigo-550 focus:bg-zinc-950 focus:outline-none transition-all rounded-xl text-sm font-sans cursor-pointer text-zinc-200"
                        id="business-type"
                      >
                        <option value="Tecnologia & Programação" className="bg-zinc-900">Tecnologia, SaaS ou TI</option>
                        <option value="Consultoria Comercial" className="bg-zinc-900">Consultoria ou Coach</option>
                        <option value="Comércio / Varejo" className="bg-zinc-900">Comércio ou Loja</option>
                        <option value="Serviços Gerais" className="bg-zinc-900">Serviços Gerais</option>
                        <option value="Saúde & Bem Estar" className="bg-zinc-900">Saúde ou Odonto</option>
                        <option value="Alimentação & Gastronomia" className="bg-zinc-900">Alimentação ou Delivery</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={() => setOnboardingStep(0)}
                    className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors cursor-pointer font-bold"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-550 text-white font-medium text-sm flex items-center gap-1.5 rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    Próximo <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: TUTORIAL INTERACTIVE REVELATION */}
            {onboardingStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-center mb-6">
                    <span className="p-3 bg-indigo-955/40 border border-indigo-900/30 text-indigo-400 rounded-2xl">
                      <TrendingUp className="h-8 w-8" />
                    </span>
                  </div>
                  <h1 className="text-3xl font-sans font-semibold text-white text-center tracking-tight mb-2">
                    Painel Financeiro Limpo
                  </h1>
                  <p className="text-sm font-sans text-zinc-400 text-center mb-6">
                    Veja como simplificamos sua vida em 3 frentes automáticas:
                  </p>

                  <div className="space-y-3">
                    <div className="flex gap-4 p-3 bg-zinc-955/40 border border-zinc-850 rounded-xl items-center">
                      <span className="p-2.5 bg-indigo-950/50 text-indigo-400 rounded-xl font-bold font-sans text-sm">
                        01
                      </span>
                      <div>
                        <h4 className="text-sm font-sans font-semibold text-white">Cálculo de Lucro Líquido</h4>
                        <p className="text-xs text-zinc-400">O sistema liquida entradas e saídas e já compara com a meta mensal de progresso.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-3 bg-zinc-955/40 border border-zinc-850 rounded-xl items-center">
                      <span className="p-2.5 bg-rose-955/20 text-rose-450 rounded-xl font-bold font-sans text-sm">
                        02
                      </span>
                      <div>
                        <h4 className="text-sm font-sans font-semibold text-white">Alertas Vermelhos Ativos</h4>
                        <p className="text-xs text-zinc-400">Contas atrasadas brilham em vermelho piscante para evitar juros e cortes na empresa.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-3 bg-zinc-955/40 border border-zinc-850 rounded-xl items-center">
                      <span className="p-2.5 bg-sky-955/20 text-sky-400 rounded-xl font-bold font-sans text-sm">
                        03
                      </span>
                      <div>
                        <h4 className="text-sm font-sans font-semibold text-white">Simulador de Trabalho ao Vivo</h4>
                        <p className="text-xs text-zinc-400">Teste como seria ter funcionários lançando PIX em real-time pela central de equipe.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors cursor-pointer font-semibold"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-505 text-white font-medium text-sm flex items-center gap-1.5 rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    Próximo <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: LOGIN / ACCESS TRIGGERS */}
            {onboardingStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-center mb-6">
                    <span className="p-3 bg-indigo-950/40 border border-indigo-900/30 text-indigo-400 rounded-2xl">
                      <UserCheck className="h-8 w-8" />
                    </span>
                  </div>
                  <h1 className="text-3xl font-sans font-semibold text-white text-center tracking-tight mb-2">
                    Entrar no Sistema
                  </h1>
                  <p className="text-sm font-sans text-zinc-400 text-center mb-6">
                    Digite suas credenciais para acessar a central administrativa da empresa.
                  </p>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const prefix = loginEmail.includes('@') ? loginEmail.split('@')[0] : 'Administrador';
                      const cleanName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
                      const isFunc = loginEmail.toLowerCase().includes('func') || loginEmail.toLowerCase().includes('worker') || loginEmail.toLowerCase().includes('colab');
                      const resolvedRole = isFunc ? 'funcionario' : 'admin';
                      
                      loginDemo(resolvedRole, cleanName, loginEmail);
                      completeOnboarding();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-[11px] font-sans font-bold text-zinc-400 uppercase tracking-widest mb-1.5" htmlFor="login-email">
                        E-mail de acesso
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="rodrigo@gestaosaas.com.br"
                          className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:bg-zinc-950 focus:outline-none transition-all rounded-xl text-sm font-sans text-white placeholder-zinc-650"
                          id="login-email"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-sans font-bold text-zinc-400 uppercase tracking-widest mb-1.5" htmlFor="login-password">
                        Senha
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Sua senha secreta"
                          className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:bg-zinc-950 focus:outline-none transition-all rounded-xl text-sm font-sans text-white placeholder-zinc-650"
                          id="login-password"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-505 text-white font-semibold text-sm transition-all rounded-xl shadow-md cursor-pointer text-center hover:bg-indigo-500"
                    >
                      <LogIn className="h-4.5 w-4.5" />
                      Entrar na Central
                    </button>

                    <div className="relative flex items-center justify-center my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-850"></div>
                      </div>
                      <span className="relative bg-zinc-900 px-3 text-[10px] text-zinc-550 font-sans tracking-uppercase font-bold">OU ENTRAR COM CONTAS CONECTADAS</span>
                    </div>

                    {/* Google standard login button simulation/real */}
                    <button
                      onClick={loginWithGoogleReal}
                      type="button"
                      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-200 text-sm font-semibold transition-all rounded-xl cursor-pointer hover:border-zinc-700"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 0, 0)">
                          <path d="M21.35,11.1H12v2.7h5.38C16.88,16.22,14.63,18,12,18a6,6,0,1,1,6-6,5.81,5.81,0,0,1-.5,2.3l2.06,1.48C20.67,14.33,21.35,12.75,21.35,11.1Z" fill="#4285F4"/>
                          <path d="M12,18a5.94,5.94,0,0,1-3.6-1.2L6.34,18.28C8,19.9,10,20.7,12,20.7a8.7,8.7,0,0,0,8-5.22l-2.06-1.48A6,6,0,0,1,12,18Z" fill="#34A853"/>
                          <path d="M6,12a5.9,5.9,0,0,1,.8-3l-2.06-1.48A8.7,8.7,0,0,0,3.3,12a8.7,8.7,0,0,0,1.44,4.48L6.8,15A5.9,5.9,0,0,1,6,12Z" fill="#FBBC05"/>
                          <path d="M12,6A5.91,5.91,0,0,1,15.65,7.2l2.06-1.48A8.7,8.7,0,0,0,12,3.3a8.7,8.7,0,0,0-7.26,3.72L6.8,8.5A5.91,5.91,0,0,1,12,6Z" fill="#EA4335"/>
                        </g>
                      </svg>
                      Entrar com o Google
                    </button>

                    <button
                      onClick={() => {
                        setOnboardingStep(0);
                      }}
                      type="button"
                      className="w-full py-2.5 px-4 text-xs bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-300 font-medium transition-all rounded-xl cursor-pointer text-center block"
                    >
                      Criar Outra Empresa do Zero (Tutorial)
                    </button>
                  </form>
                </div>

                <div className="mt-8 flex items-center justify-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Gestão SaaS • Controle Absoluto</span>
                </div>
              </motion.div>
            )}
            
          </AnimatePresence>
        </div>
        
        {/* Onboarding bottom tracker links */}
        <div className="bg-zinc-950/20 border-t border-zinc-850 p-6 flex justify-center items-center gap-2">
          {[0, 1, 2, 3].map((stepIdx) => (
            <span 
              key={stepIdx} 
              className={`h-2 rounded-full transition-all ${
                onboardingStep === stepIdx ? 'w-6 bg-indigo-500' : 'w-2 bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
