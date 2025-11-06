import React, { useState } from 'react';
import { ContactRecord, ViewMode, Column } from '../types';
import { IconUserPlus, IconPlus, IconTable, IconGrid, IconList } from './Icons';
import ContactsTableView from './ContactsTableView';
import ContactsGridView from './ContactsGridView';
import ContactsListView from './ContactsListView';

interface ContactsPageProps {
    contacts: ContactRecord[];
    columns: Column[];
    onAddContact: () => void;
    onEditContact: (contact: ContactRecord) => void;
    onDeleteContact: (contactId: string) => void;
    onAddColumn: (newColumn: Column) => void;
    onOpenImportModal: () => void;
}


const ContactsPage: React.FC<ContactsPageProps> = ({ contacts, columns, onAddContact, onEditContact, onDeleteContact, onAddColumn, onOpenImportModal }) => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Table);

  const handleAddColumn = () => {
    const newColumnName = window.prompt("Enter new column name:");
    if (newColumnName) {
      const newColumnKey = newColumnName.toLowerCase().replace(/\s+/g, '_');
      onAddColumn({ key: newColumnKey, label: newColumnName });
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case ViewMode.Grid:
        return <ContactsGridView contacts={contacts} onEdit={onEditContact} onDelete={onDeleteContact} />;
      case ViewMode.List:
        return <ContactsListView contacts={contacts} onEdit={onEditContact} onDelete={onDeleteContact} />;
      case ViewMode.Table:
      default:
        return <ContactsTableView contacts={contacts} columns={columns} onEdit={onEditContact} onDelete={onDeleteContact} />;
    }
  };
  
  const viewOptions = [
      { mode: ViewMode.Table, icon: <IconTable className="w-5 h-5" /> },
      { mode: ViewMode.Grid, icon: <IconGrid className="w-5 h-5" /> },
      { mode: ViewMode.List, icon: <IconList className="w-5 h-5" /> },
  ]

  return (
    <div className="flex flex-col h-full w-full p-4 md:p-6">
      <header className="flex-shrink-0 mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
             <div className="bg-gray-700/50 rounded-lg flex items-center p-1 space-x-1">
                 {viewOptions.map(option => (
                     <button
                        key={option.mode}
                        onClick={() => setViewMode(option.mode)}
                        className={`p-2 rounded-md transition-colors ${viewMode === option.mode ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-600/50 hover:text-white'}`}
                        aria-label={`Switch to ${option.mode} view`}
                    >
                        {option.icon}
                    </button>
                 ))}
             </div>
             {viewMode === ViewMode.Table && (
                 <button onClick={handleAddColumn} className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                    <IconPlus className="w-4 h-4" />
                    <span>Add Column</span>
                </button>
             )}
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={onOpenImportModal} className="px-3 py-2 text-sm text-gray-300 bg-gray-700/80 hover:bg-gray-700 rounded-lg transition-colors">
            Import Contacts
          </button>
          <button onClick={onAddContact} className="flex items-center space-x-2 px-3 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors">
            <IconUserPlus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default ContactsPage;