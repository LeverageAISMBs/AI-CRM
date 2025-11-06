import React, { useState, useEffect } from 'react';
import { AIPersona } from '../types';
import { IconX } from './Icons';

interface PersonaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (persona: AIPersona) => void;
  personaToEdit?: AIPersona;
}

const PersonaFormModal: React.FC<PersonaFormModalProps> = ({ isOpen, onClose, onSave, personaToEdit }) => {
  const [persona, setPersona] = useState<Omit<AIPersona, 'id' | 'style'> & { id?: string; style?: string }>({
    name: '',
    description: '',
    systemPrompt: '',
    style: 'default',
  });

  useEffect(() => {
    if (personaToEdit) {
      setPersona(personaToEdit);
    } else {
      setPersona({ name: '', description: '', systemPrompt: '', style: 'default' });
    }
  }, [personaToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersona(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPersona: AIPersona = {
      ...persona,
      id: persona.id || `persona-${Date.now()}`,
      style: persona.style || 'default',
    };
    onSave(finalPersona);
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">{personaToEdit ? 'Edit Persona' : 'Create New Persona'}</h2>
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
              <IconX />
            </button>
          </header>
          <main className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input type="text" id="name" name="name" value={persona.name} onChange={handleChange} required className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <input type="text" id="description" name="description" value={persona.description} onChange={handleChange} required className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
             <div>
              <label htmlFor="style" className="block text-sm font-medium text-gray-300 mb-1">Icon Style</label>
              <select name="style" id="style" value={persona.style} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="default">Default (Sparkles)</option>
                  <option value="shield">Negotiator (Shield)</option>
                  <option value="help">Curious (Help)</option>
                  <option value="coach">Coach (Check)</option>
              </select>
            </div>
            <div>
              <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-300 mb-1">System Prompt</label>
              <textarea id="systemPrompt" name="systemPrompt" value={persona.systemPrompt} onChange={handleChange} required rows={8} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"></textarea>
               <p className="text-xs text-gray-400 mt-1">Define the AI's core behavior and personality for the role-play.</p>
            </div>
          </main>
          <footer className="flex justify-end p-4 border-t border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 ml-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Save Persona</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default PersonaFormModal;
