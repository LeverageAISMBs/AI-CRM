
import { Deal, DealStage, Contact, Tag } from './types';

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
