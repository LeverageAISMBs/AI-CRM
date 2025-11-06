import React from 'react';
import { ContactRecord } from '../types';
import { IconEdit, IconTrash } from './Icons';

interface ContactsListViewProps {
  contacts: ContactRecord[];
  onEdit: (contact: ContactRecord) => void;
  onDelete: (contactId: string) => void;
}

const ContactsListView: React.FC<ContactsListViewProps> = ({ contacts, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg divide-y divide-gray-700/50">
      {contacts.map(contact => (
        <div key={contact.id} className="p-4 flex items-center justify-between group hover:bg-gray-700/50 transition-colors">
          <div className="flex items-center">
            <img className="h-10 w-10 rounded-full" src={contact.avatarUrl || `https://i.pravatar.cc/150?u=${contact.id}`} alt={contact.name} />
            <div className="ml-4">
              <div className="text-sm font-medium text-white">{contact.name}</div>
              <div className="text-sm text-gray-400">{contact.company}</div>
            </div>
          </div>
          <div className="text-sm text-gray-400 hidden md:block">{contact.email}</div>
          <div className="text-sm text-gray-400 hidden lg:block">{contact.phone}</div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={() => onEdit(contact)} className="p-1.5 rounded-md text-gray-400 hover:bg-gray-600 hover:text-white">
                <IconEdit className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(contact.id)} className="p-1.5 rounded-md text-gray-400 hover:bg-gray-600 hover:text-red-400">
                <IconTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactsListView;
