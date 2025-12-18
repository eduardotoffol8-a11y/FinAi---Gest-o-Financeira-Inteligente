
export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  subCategory?: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'paid' | 'pending' | 'overdue';
  attachmentUrl?: string;
  source?: 'manual' | 'ai';
  supplier?: string;
  paymentMethod?: string;
  costCenter?: string;
}

export interface GeneratedReport {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'audit' | 'strategic' | 'executive';
  period: string;
}

export interface Contact {
  id: string;
  name: string;
  company?: string;
  taxId?: string; 
  type: 'client' | 'supplier' | 'both';
  email?: string;
  phone?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  paymentTerms?: string;
  totalTraded: number;
  lastInteraction?: string;
  reliabilityScore?: number;
  source?: 'manual' | 'ai';
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'admin' | 'leader' | 'member';
  status: 'online' | 'offline';
  avatar?: string;
}

export interface CorporateMessage {
  id: string;
  senderId: string;
  receiverId: string | 'all';
  text: string;
  timestamp: Date;
  isEdited?: boolean;
  isDeleted?: boolean;
  audioUrl?: string;
  fileAttachment?: {
    name: string;
    url: string;
    type: string;
  };
  sharedItem?: {
    type: 'transaction' | 'contact';
    data: any;
  };
}

export interface ScheduledItem {
  id: string;
  dueDate: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  recurrence: 'one-time' | 'monthly' | 'weekly' | 'yearly';
  autoPay: boolean;
  status: 'pending' | 'paid' | 'overdue';
  category?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachments?: {
    type: 'image';
    url: string;
    base64: string;
  }[];
  isDraft?: boolean;
  draftData?: Omit<Transaction, 'id'>;
}

export enum ViewState {
  DASHBOARD = 'PAINEL',
  TRANSACTIONS = 'LANÇAMENTOS',
  REPORTS = 'INTELIGÊNCIA',
  SCHEDULE = 'AGENDA',
  CONTACTS = 'PARCEIROS',
  TEAM_CHAT = 'CHAT_EQUIPE',
  SETTINGS = 'CONFIGURAÇÕES',
  DOCS = 'MANUAL_IA'
}
