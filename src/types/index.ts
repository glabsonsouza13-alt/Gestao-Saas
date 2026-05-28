/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'entrada' | 'saida';

export interface Transaction {
  id: string;
  date: string; // ISO Date String YYYY-MM-DD
  type: TransactionType;
  category: string;
  clientProject: string;
  value: number;
  paymentMethod: string;
  notes: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export type AccountStatus = 'pago' | 'pendente';
export type AccountRecurrence = 'avulso' | 'mensal' | 'trimestral' | 'anual';

export interface Account {
  id: string;
  name: string;
  value: number;
  dueDate: string; // ISO Date String YYYY-MM-DD
  status: AccountStatus;
  recurrence: AccountRecurrence;
  authorId: string;
  authorName: string;
  createdAt: string;
  category?: string;
}

export interface CompanySettings {
  name: string;
  businessType: string;
  monthlyGoal: number;
  logoUrl: string;
  categories: string[];
}

export type UserRole = 'admin' | 'funcionario';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  active: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string
  userName: string;
  userEmail: string;
  userRole: UserRole;
  actionType: 'login' | 'add_transaction' | 'delete_transaction' | 'edit_transaction' | 'add_account' | 'pay_account' | 'delete_account' | 'update_settings' | 'simulate_worker';
  details: string;
}

export interface UserSession {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  isSimulated: boolean;
}
