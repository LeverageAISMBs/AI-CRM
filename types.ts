export type UniqueID = string;

export enum Page {
  Dashboard = 'Dashboard',
  Deals = 'Deals',
  Contacts = 'Contacts',
  Calendar = 'Calendar',
  Email = 'Email',
  KnowledgeBase = 'Knowledge Base',
  Trainer = 'Sales Trainer',
  Notes = 'Notes',
  Map = 'Map Search',
  Settings = 'Settings',
}

export enum DealStage {
  ColdLead = 'Cold Lead',
  Prospect = 'Prospect',
  Opportunity = 'Opportunity',
  ClosedWon = 'Closed (Won)',
  ClosedLost = 'Closed (Lost)',
}

export interface Tag {
  id: UniqueID;
  name: string;
  color: string; // Tailwind color class e.g., 'bg-blue-500'
}

export interface Contact {
  id: UniqueID;
  name: string;
  email: string;
  phone?: string;
  company: string;
  title?: string;
  avatarUrl?: string;
  lastContacted: string; // ISO date string
}

export interface Deal {
  id: UniqueID;
  title: string;
  value: number;
  stage: DealStage;
  expectedCloseDate: string; // ISO date string
  contact: Contact;
  tags: Tag[];
  priority: 'Low' | 'Medium' | 'High';
}

export interface Task {
  id: UniqueID;
  title: string;
  dueDate: string; // ISO date string
  completed: boolean;
  relatedDeal?: UniqueID;
  assignedTo: Contact;
  tags: Tag[];
}

export interface CalendarEvent {
  id: UniqueID;
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
  attendees: Contact[];
  relatedDeal?: UniqueID;
}

export interface AIPersona {
  id: UniqueID;
  name: string;
  style: string;
  knowledgeBaseUrl?: string;
  systemPrompt: string;
}

export interface KnowledgeBaseFile {
  id: UniqueID;
  name: string;
  type: 'text/plain' | 'text/markdown';
  size: number; // in bytes
  content: string;
}

export interface KnowledgeBase {
  id: UniqueID;
  name: string;
  files: KnowledgeBaseFile[];
}

export enum GeminiModel {
  Flash = 'gemini-2.5-flash',
  Pro = 'gemini-2.5-pro',
  FlashLite = 'gemini-flash-lite-latest',
  FlashWithSearch = 'gemini-2.5-flash-with-search', // Custom identifier
  LiveAudio = 'gemini-2.5-flash-native-audio-preview-09-2025'
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ChatMessage {
  id: UniqueID;
  role: 'user' | 'model';
  text: string;
  timestamp: string; // ISO date string
  sources?: GroundingSource[];
}

export interface DraggableItem {
  id: UniqueID;
  fromStage: DealStage;
}