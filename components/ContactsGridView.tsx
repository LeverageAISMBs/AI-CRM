import React from 'react';
import { ContactRecord } from '../types';
import { IconMail, IconPhone, IconEdit, IconTrash } from './Icons';

interface ContactsGridViewProps {
  contacts: ContactRecord[];
  onEdit: (contact: ContactRecord) => void;
  onDelete: (contactId: string) => void;
}

const ContactsGridView: React.FC<ContactsGridViewProps> = ({ contacts, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {contacts.map(contact => (
        <div key={contact.id} className="bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center text-center group relative hover:shadow-indigo-500/20 hover:scale-105 transition-all duration-200">
            <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => onEdit(contact)} className="p-1.5 rounded-md text-gray-400 bg-gray-900/50 hover:bg-gray-700 hover:text-white" aria-label={`Edit ${contact.name}`}>
                    <IconEdit className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(contact.id)} className="p-1.5 rounded-md text-gray-400 bg-gray-900/50 hover:bg-gray-700 hover:text-red-400" aria-label={`Delete ${contact.name}`}>
                    <IconTrash className="w-4 h-4" />
                </button>
            </div>

          <img className="w-24 h-24 rounded-full mb-4" src={contact.avatarUrl || `https://i.pravatar.cc/150?u=${contact.id}`} alt={contact.name} />
          <h3 className="text-lg font-bold text-white">{contact.name}</h3>
          <p className="text-sm text-gray-400">{contact.company}</p>
          <div className="mt-4 pt-4 border-t border-gray-700/50 w-full space-y-2">
            <div className="flex items-center justify-center text-sm text-gray-300">
              <IconMail className="w-4 h-4 mr-2 text-gray-500" />
              <a href={`mailto:${contact.email}`} className="hover:text-indigo-400">{contact.email}</a>
            </div>
             {contact.phone && (
                <div className="flex items-center justify-center text-sm text-gray-300">
                    <IconPhone className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{contact.phone}</span>
                </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactsGridView;
