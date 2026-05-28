/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useAppStore } from './context/AppContext';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Accounts from './components/Accounts';
import Reports from './components/Reports';
import TeamSimulator from './components/TeamSimulator';
import Settings from './components/Settings';
import NotificationToast from './components/NotificationToast';

export default function App() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // If user is not logged in / not onboarded, display auth screen
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <AuthScreen />
        <NotificationToast />
      </div>
    );
  }

  // Active view switcher
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'transactions':
        return <Transactions />;
      case 'accounts':
        return <Accounts />;
      case 'reports':
        return <Reports />;
      case 'team':
        return <TeamSimulator />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex bg-zinc-950 text-zinc-100 min-h-screen h-screen overflow-hidden font-sans">
      
      {/* Sidebar menu drawer navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main active sub-view */}
      <main className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden relative">
        {renderActiveTab()}
      </main>

      {/* Global interactive feedbacks */}
      <NotificationToast />
    </div>
  );
}
