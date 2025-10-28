
import React from 'react';
import { Page } from '../types';
import { IconChartBar, IconUsers, IconCalendar, IconMail, IconBook, IconSparkles, IconClipboard, IconMap, IconCog, IconLayoutDashboard } from './Icons';

interface SidebarProps {
  isOpen: boolean;
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const navItems = [
  { page: Page.Deals, icon: <IconChartBar /> },
  { page: Page.Contacts, icon: <IconUsers /> },
  { page: Page.Calendar, icon: <IconCalendar /> },
  { page: Page.Email, icon: <IconMail /> },
  { page: Page.KnowledgeBase, icon: <IconBook /> },
  { page: Page.Trainer, icon: <IconSparkles /> },
  { page: Page.Notes, icon: <IconClipboard /> },
  { page: Page.Map, icon: <IconMap /> },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activePage, setActivePage }) => {
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-gray-900 border-r border-gray-700/50 flex flex-col z-30 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-[72px]'
      }`}
    >
      <div className="flex items-center justify-center h-16 border-b border-gray-700/50">
        <IconLayoutDashboard className="h-8 w-8 text-indigo-400" />
        {isOpen && <h1 className="text-xl font-bold ml-2">IntelliCRM</h1>}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-2">
        {navItems.map(({ page, icon }) => (
          <button
            key={page}
            onClick={() => setActivePage(page)}
            className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 ${
              activePage === page
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="h-6 w-6">{icon}</div>
            {isOpen && <span className="ml-4 font-medium">{page}</span>}
          </button>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-700/50">
        <button className="flex items-center w-full p-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200">
          <IconCog />
          {isOpen && <span className="ml-4 font-medium">Settings</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
