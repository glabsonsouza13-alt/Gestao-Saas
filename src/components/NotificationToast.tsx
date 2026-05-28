/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAppStore } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NotificationToast() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgColor = 'bg-slate-900 text-white';
          let Icon = Info;

          if (toast.type === 'success') {
            bgColor = 'bg-teal-50 border border-teal-200 text-teal-800 shadow-sm';
            Icon = CheckCircle2;
          } else if (toast.type === 'error') {
            bgColor = 'bg-rose-50 border border-rose-200 text-rose-800 shadow-sm';
            Icon = AlertCircle;
          } else if (toast.type === 'info') {
            bgColor = 'bg-sky-50 border border-sky-200 text-sky-800 shadow-sm';
            Icon = Info;
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`flex items-start gap-3 p-4 rounded-xl shadow-lg pointer-events-auto ${bgColor}`}
              id={`toast-${toast.id}`}
            >
              <div className="shrink-0 mt-0.5">
                <Icon className={`h-5 w-5 ${
                  toast.type === 'success' ? 'text-teal-600' : 
                  toast.type === 'error' ? 'text-rose-600' : 'text-sky-600'
                }`} />
              </div>
              
              <div className="flex-1 text-sm font-sans font-medium">
                {toast.message}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
