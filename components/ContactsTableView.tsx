import React from 'react';
import { ContactRecord } from '../types';
import { IconEdit, IconTrash } from './Icons';

interface Column {
  key: string;
  label: string;
}

interface ContactsTableViewProps {
  contacts: ContactRecord[];
  columns: Column[];
  onEdit: (contact: ContactRecord) => void;
  onDelete: (contactId: string) => void;
}

const ContactsTableView: React.FC<ContactsTableViewProps> = ({ contacts, columns, onEdit, onDelete }) => {

  const formatDate = (dateString: string) => {
      try {
          return new Date(dateString).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
          });
      } catch (e) {
          return dateString;
      }
  }

  const renderCellContent = (contact: ContactRecord, columnKey: string) => {
    const value = contact[columnKey];
    if (columnKey === 'lastContacted' && typeof value === 'string') {
      return formatDate(value);
    }
    if (columnKey === 'website' && typeof value === 'string') {
        return <a href={`//${value}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{value}</a>
    }
    return value || <span className="text-gray-500">-</span>;
  };

  return (
    <div className="overflow-x-auto bg-gray-900/50 rounded-lg">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            {columns.map(col => (
              <th key={col.key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800/50 divide-y divide-gray-700/50">
          {contacts.map(contact => (
            <tr key={contact.id} className="hover:bg-gray-700/50 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                   {col.key === 'name' ? (
                       <div className="flex items-center">
                           <div className="flex-shrink-0 h-10 w-10">
                               <img className="h-10 w-10 rounded-full" src={contact.avatarUrl || `https://i.pravatar.cc/150?u=${contact.id}`} alt="" />
                           </div>
                           <div className="ml-4">
                               <div className="font-medium text-white">{contact.name}</div>
                               <div className="text-gray-400">{contact.email}</div>
                           </div>
                       </div>
                   ) : (
                       renderCellContent(contact, col.key)
                   )}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                 <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => onEdit(contact)} className="p-1.5 rounded-md text-gray-400 hover:bg-gray-600 hover:text-white">
                        <IconEdit className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(contact.id)} className="p-1.5 rounded-md text-gray-400 hover:bg-gray-600 hover:text-red-400">
                        <IconTrash className="w-4 h-4" />
                    </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactsTableView;
