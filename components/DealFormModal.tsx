
import React, { useState, useEffect } from 'react';
import { Deal, DealStage, Contact } from '../types';
import { IconX } from './Icons';
import { mockDeals } from '../constants';

// A simple flat list of contacts for the dropdown. In a real app, this would come from state/API.
const availableContacts = Array.from(new Set(mockDeals.map(d => d.contact))).map(c => c);

interface DealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deal: Deal) => void;
  dealToEdit?: Deal | null;
  initialStage?: DealStage;
}

const DealFormModal: React.FC<DealFormModalProps> = ({ isOpen, onClose, onSave, dealToEdit, initialStage }) => {
  const [deal, setDeal] = useState<Partial<Deal>>({});

  useEffect(() => {
    if (dealToEdit) {
      setDeal(dealToEdit);
    } else {
      setDeal({
        title: '',
        value: 0,
        stage: initialStage,
        priority: 'Medium',
        expectedCloseDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        contact: availableContacts[0],
        tags: [],
      });
    }
  }, [dealToEdit, initialStage, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDeal(prev => ({ ...prev, [name]: name === 'value' ? Number(value) : value }));
  };
  
  const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const contact = availableContacts.find(c => c.id === e.target.value);
      if(contact) {
          setDeal(prev => ({...prev, contact}));
      }
  };

  const handleContactDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeal(prev => {
        if (!prev.contact) return prev;
        return {
            ...prev,
            contact: {
                ...prev.contact,
                [name]: value
            } as Contact
        };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal.title || !deal.stage || !deal.contact || !deal.priority || !deal.expectedCloseDate) {
      // Basic validation
      return;
    }
    const finalDeal: Deal = {
      ...deal,
      id: deal.id || `deal-${Date.now()}`,
      stage: deal.stage,
      title: deal.title,
      value: deal.value || 0,
      expectedCloseDate: new Date(deal.expectedCloseDate).toISOString(),
      contact: deal.contact,
      tags: deal.tags || [],
      priority: deal.priority,
    };
    onSave(finalDeal);
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">{dealToEdit ? 'Edit Deal' : 'Add New Lead'}</h2>
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
              <IconX />
            </button>
          </header>
          <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Deal Title</label>
              <input type="text" id="title" name="title" value={deal.title || ''} onChange={handleChange} required className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-300 mb-1">Value ($)</label>
              <input type="number" id="value" name="value" value={deal.value || 0} onChange={handleChange} required className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
             <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
              <select name="priority" id="priority" value={deal.priority} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="expectedCloseDate" className="block text-sm font-medium text-gray-300 mb-1">Expected Close Date</label>
              <input type="date" id="expectedCloseDate" name="expectedCloseDate" value={deal.expectedCloseDate?.split('T')[0] || ''} onChange={handleChange} required className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
             <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-300 mb-1">Contact</label>
              <select name="contact" id="contact" value={deal.contact?.id} onChange={handleContactChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                  {availableContacts.map(c => <option key={c.id} value={c.id}>{c.name} - {c.company}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Contact Email</label>
              <input type="email" id="email" name="email" value={deal.contact?.email || ''} onChange={handleContactDetailsChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Contact Phone</label>
              <input type="tel" id="phone" name="phone" value={deal.contact?.phone || ''} onChange={handleContactDetailsChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </main>
          <footer className="flex justify-end p-4 border-t border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 ml-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Save Deal</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default DealFormModal;
