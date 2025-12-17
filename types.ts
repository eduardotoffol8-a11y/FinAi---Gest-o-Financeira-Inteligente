
export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'paid' | 'pending' | 'overdue';
  attachmentUrl?: string;
  source?: 'manual' | 'ai';
  supplier?: string;
}

export interface Contact {
  id: string;
  name: string;
  cnpj?: string;
  type: 'client' | 'supplier' | 'both';
  email?: string;
  phone?: string;
  totalTraded: number;
  lastInteraction?: string;
  reliabilityScore?: number;
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
  SETTINGS = 'CONFIGURAÇÕES'
}
