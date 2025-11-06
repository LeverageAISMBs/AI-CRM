
import { Deal, DealStage, Contact, Tag, AIPersona, ContactRecord, Column, CalendarEvent } from './types';

const tags: { [key: string]: Tag } = {
  enterprise: { id: 'tag-1', name: 'Enterprise', color: 'bg-red-500' },
  smb: { id: 'tag-2', name: 'SMB', color: 'bg-blue-500' },
  new_logo: { id: 'tag-3', name: 'New Logo', color: 'bg-green-500' },
  saas: { id: 'tag-4', name: 'SaaS', color: 'bg-yellow-500' },
};

const contacts: { [key: string]: Contact } = {
  jane: { id: 'contact-1', name: 'Jane Doe', email: 'jane.d@acmecorp.com', company: 'Acme Corp', avatarUrl: `https://i.pravatar.cc/150?u=contact-1`, lastContacted: new Date().toISOString() },
  john: { id: 'contact-2', name: 'John Smith', email: 'john.s@techsolutions.io', company: 'Tech Solutions', avatarUrl: `https://i.pravatar.cc/150?u=contact-2`, lastContacted: new Date().toISOString() },
  emily: { id: 'contact-3', name: 'Emily White', email: 'emily.w@innovate.co', company: 'Innovate Co', avatarUrl: `https://i.pravatar.cc/150?u=contact-3`, lastContacted: new Date().toISOString() },
  michael: { id: 'contact-4', name: 'Michael Brown', email: 'michael.b@webify.com', company: 'Webify Ltd.', avatarUrl: `https://i.pravatar.cc/150?u=contact-4`, lastContacted: new Date().toISOString() },
  sarah: { id: 'contact-5', name: 'Sarah Green', email: 'sarah.g@cloudnine.com', company: 'CloudNine Inc.', avatarUrl: `https://i.pravatar.cc/150?u=contact-5`, lastContacted: new Date().toISOString() },
};

export const mockContacts: ContactRecord[] = [
  { id: 'rec-1', name: 'Jane Doe', company: 'Acme Corp', website: 'acmecorp.com', email: 'jane.d@acmecorp.com', phone: '123-456-7890', city: 'San Francisco', lastContacted: '2024-07-20T10:00:00Z', avatarUrl: `https://i.pravatar.cc/150?u=contact-1` },
  { id: 'rec-2', name: 'John Smith', company: 'Tech Solutions', website: 'techsolutions.io', email: 'john.s@techsolutions.io', phone: '234-567-8901', city: 'New York', lastContacted: '2024-07-18T14:30:00Z', avatarUrl: `https://i.pravatar.cc/150?u=contact-2` },
  { id: 'rec-3', name: 'Emily White', company: 'Innovate Co', website: 'innovate.co', email: 'emily.w@innovate.co', phone: '345-678-9012', city: 'Chicago', lastContacted: '2024-07-21T09:00:00Z', avatarUrl: `https://i.pravatar.cc/150?u=contact-3` },
  { id: 'rec-4', name: 'Michael Brown', company: 'Webify Ltd.', website: 'webify.com', email: 'michael.b@webify.com', phone: '456-789-0123', city: 'Austin', lastContacted: '2024-06-30T11:45:00Z', avatarUrl: `https://i.pravatar.cc/150?u=contact-4` },
  { id: 'rec-5', name: 'Sarah Green', company: 'CloudNine Inc.', website: 'cloudnine.com', email: 'sarah.g@cloudnine.com', phone: '567-890-1234', city: 'Seattle', lastContacted: '2024-07-15T16:20:00Z', avatarUrl: `https://i.pravatar.cc/150?u=contact-5` },
  { id: 'rec-6', name: 'David Chen', company: 'Global Dynamics', website: 'globaldynamics.com', email: 'david.c@globaldynamics.com', phone: '678-901-2345', city: 'Boston', lastContacted: '2024-07-19T08:00:00Z', avatarUrl: `https://i.pravatar.cc/150?u=contact-6` },
  { id: 'rec-7', name: 'Linda Kim', company: 'Pioneer Ventures', website: 'pioneerventures.net', email: 'linda.k@pioneerventures.net', phone: '789-012-3456', city: 'Los Angeles', lastContacted: '2024-07-05T13:10:00Z', avatarUrl: `https://i.pravatar.cc/150?u=contact-7` }
];

export const DEFAULT_CONTACT_COLUMNS: Column[] = [
  { key: 'name', label: 'Contact Name' },
  { key: 'company', label: 'Company' },
  { key: 'website', label: 'Website URL' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone Number' },
  { key: 'city', label: 'City' },
  { key: 'lastContacted', label: 'Last Contact Date' },
];


export const mockDeals: Deal[] = [
  {
    id: 'deal-1',
    title: 'Acme Corp Platform License',
    value: 75000,
    stage: DealStage.Prospect,
    expectedCloseDate: '2024-09-15T00:00:00Z',
    contact: contacts.jane,
    tags: [tags.enterprise, tags.saas],
    priority: 'High',
  },
  {
    id: 'deal-2',
    title: 'Tech Solutions Website Revamp',
    value: 22000,
    stage: DealStage.Opportunity,
    expectedCloseDate: '2024-08-20T00:00:00Z',
    contact: contacts.john,
    tags: [tags.smb],
    priority: 'Medium',
  },
  {
    id: 'deal-3',
    title: 'Innovate Co Marketing Automation',
    value: 48000,
    stage: DealStage.ColdLead,
    expectedCloseDate: '2024-10-01T00:00:00Z',
    contact: contacts.emily,
    tags: [tags.saas],
    priority: 'Low',
  },
  {
    id: 'deal-4',
    title: 'Webify Ltd. Cloud Migration',
    value: 120000,
    stage: DealStage.Opportunity,
    expectedCloseDate: '2024-08-30T00:00:00Z',
    contact: contacts.michael,
    tags: [tags.enterprise],
    priority: 'High',
  },
  {
    id: 'deal-5',
    title: 'CloudNine Inc. Annual Subscription',
    value: 15000,
    stage: DealStage.ClosedWon,
    expectedCloseDate: '2024-07-10T00:00:00Z',
    contact: contacts.sarah,
    tags: [tags.smb, tags.saas],
    priority: 'Medium',
  },
   {
    id: 'deal-6',
    title: 'Global Dynamics Q4 Integration',
    value: 95000,
    stage: DealStage.Prospect,
    expectedCloseDate: '2024-11-05T00:00:00Z',
    contact: { id: 'contact-6', name: 'David Chen', email: 'david.c@globaldynamics.com', company: 'Global Dynamics', avatarUrl: `https://i.pravatar.cc/150?u=contact-6`, lastContacted: new Date().toISOString() },
    tags: [tags.enterprise],
    priority: 'High',
  },
  {
    id: 'deal-7',
    title: 'Pioneer Ventures Consulting',
    value: 30000,
    stage: DealStage.ColdLead,
    expectedCloseDate: '2024-09-25T00:00:00Z',
    contact: { id: 'contact-7', name: 'Linda Kim', email: 'linda.k@pioneerventures.net', company: 'Pioneer Ventures', avatarUrl: `https://i.pravatar.cc/150?u=contact-7`, lastContacted: new Date().toISOString() },
    tags: [tags.smb],
    priority: 'Medium',
  },
];

export const DEAL_STAGES_ORDERED: DealStage[] = [
    DealStage.ColdLead,
    DealStage.Prospect,
    DealStage.Opportunity,
    DealStage.ClosedWon,
    DealStage.ClosedLost,
];

export const mockPersonas: AIPersona[] = [
  {
    id: 'persona-1',
    name: 'Tough Negotiator',
    description: 'A skeptical procurement officer focused on price and data.',
    style: 'shield',
    systemPrompt: 'You are a skeptical and experienced procurement officer for a large enterprise. Your goal is to get the best possible price and terms. Challenge the user on every point and ask for data to back up their claims. Be direct, analytical, and resistant to sales fluff.'
  },
  {
    id: 'persona-2',
    name: 'Curious SMB Owner',
    description: 'An interested but cautious small business owner.',
    style: 'help',
    systemPrompt: "You are the owner of a small but growing business. You are interested in the user's product but have a limited budget and technical knowledge. Ask simple, direct questions about value, ease of use, and return on investment. You are friendly but need to be convinced it's worth the cost."
  },
  {
    id: 'persona-3',
    name: 'Supportive Sales Coach',
    description: 'A friendly coach offering constructive feedback.',
    style: 'coach',
    systemPrompt: 'You are a supportive and experienced sales coach. Your goal is to help the user practice their pitch and improve their skills. Offer constructive feedback and encouragement. After they present, ask them what they thought went well and what they could improve. Frame your advice with positive reinforcement.'
  }
];

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Q3 Planning Session',
    start: new Date(currentYear, currentMonth, 2, 9, 0).toISOString(),
    end: new Date(currentYear, currentMonth, 2, 12, 0).toISOString(),
    attendees: [contacts.jane, contacts.john],
    relatedDeal: 'deal-1',
  },
  {
    id: 'event-2',
    title: 'Follow-up with Tech Solutions',
    start: new Date(currentYear, currentMonth, 5, 14, 0).toISOString(),
    end: new Date(currentYear, currentMonth, 5, 14, 30).toISOString(),
    attendees: [contacts.john],
    relatedDeal: 'deal-2',
  },
  {
    id: 'event-3',
    title: 'Product Demo for Innovate Co',
    start: new Date(currentYear, currentMonth, 15, 11, 0).toISOString(),
    end: new Date(currentYear, currentMonth, 15, 12, 0).toISOString(),
    attendees: [contacts.emily],
    relatedDeal: 'deal-3',
  },
  {
    id: 'event-4',
    title: 'Contract Negotiation - Webify',
    start: new Date(currentYear, currentMonth, 15, 16, 0).toISOString(),
    end: new Date(currentYear, currentMonth, 15, 17, 30).toISOString(),
    attendees: [contacts.michael],
    relatedDeal: 'deal-4',
  },
    {
    id: 'event-5',
    title: 'Lunch with David Chen',
    start: new Date(currentYear, currentMonth, 22, 12, 0).toISOString(),
    end: new Date(currentYear, currentMonth, 22, 13, 0).toISOString(),
    attendees: [mockDeals[5].contact],
    relatedDeal: 'deal-6',
  },
   {
    id: 'event-6',
    title: 'Team Standup',
    start: new Date(currentYear, currentMonth, today.getDate(), 9, 0).toISOString(),
    end: new Date(currentYear, currentMonth, today.getDate(), 9, 15).toISOString(),
    attendees: Object.values(contacts),
  },
];
