import React, { useState, useEffect } from 'react';
import { ContactRecord } from '../types';
import { IconX } from './Icons';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: ContactRecord) => void;
  contactToEdit?: ContactRecord | null;
}

const DEFAULT_CONTACT: Partial<ContactRecord> = {
    name: '',
    company: '',
    website: '',
    email: '',
    phone: '',
    city: '',
    lastContacted: new Date().toISOString(),
};

const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose, onSave, contactToEdit }) => {
  const [contact, setContact] = useState<Partial<ContactRecord>>(DEFAULT_CONTACT);

  useEffect(() => {
    if (isOpen) {
        setContact(contactToEdit ? contactToEdit : DEFAULT_CONTACT);
    }
  }, [contactToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContact(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.name || !contact.email) {
      // Basic validation
      alert('Name and Email are required.');
      return;
    }
    const finalContact: ContactRecord = {
      ...contact,
      id: contact.id || `rec-${Date.now()}`,
      name: contact.name,
      email: contact.email,
    };
    onSave(finalContact);
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">{contactToEdit ? 'Edit Contact' : 'Add New Contact'}</h2>
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
              <IconX />
            </button>
          </header>
          <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input type="text" id="name" name="name" value={contact.name || ''} onChange={handleChange} required className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
             <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input type="email" id="email" name="email" value={contact.email || ''} onChange={handleChange} required className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
             <div className="md:col-span-2">
              <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">Company</label>
              <input type="text" id="company" name="company" value={contact.company || ''} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
             <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
              <input type="tel" id="phone" name="phone" value={contact.phone || ''} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
             <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">City</label>
              <input type="text" id="city" name="city" value={contact.city || ''} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
             <div className="md:col-span-2">
              <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-1">Website URL</label>
              <input type="text" id="website" name="website" value={contact.website || ''} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </main>
          <footer className="flex justify-end p-4 border-t border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 ml-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Save Contact</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ContactFormModal;
