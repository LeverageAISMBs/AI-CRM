import React from 'react';
import { AIPersona, UniqueID } from '../types';
// FIX: Import IconSparkles to be used in personaIcons map.
import { IconPlus, IconShield, IconHelpCircle, IconUserCheck, IconEdit, IconTrash, IconSparkles } from './Icons';

interface PersonaManagerProps {
  personas: AIPersona[];
  activePersonaId?: UniqueID;
  onSelectPersona: (id: UniqueID) => void;
  onNewPersona: () => void;
  onEditPersona: (id: UniqueID) => void;
  onDeletePersona: (id: UniqueID) => void;
}

const personaIcons: { [key: string]: React.ReactNode } = {
  shield: <IconShield className="w-6 h-6 text-red-400" />,
  help: <IconHelpCircle className="w-6 h-6 text-blue-400" />,
  coach: <IconUserCheck className="w-6 h-6 text-green-400" />,
  default: <IconSparkles className="w-6 h-6 text-yellow-400" />,
};

const PersonaManager: React.FC<PersonaManagerProps> = ({
  personas,
  activePersonaId,
  onSelectPersona,
  onNewPersona,
  onEditPersona,
  onDeletePersona,
}) => {
  return (
    <aside className="w-1/3 max-w-sm h-full flex flex-col bg-gray-900/70 border-r border-gray-700/50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Personas</h2>
        <button
          onClick={onNewPersona}
          className="p-2 rounded-full text-gray-300 hover:bg-indigo-600 hover:text-white transition-colors"
          aria-label="Create new persona"
        >
          <IconPlus className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
        {personas.map(persona => (
          <div
            key={persona.id}
            onClick={() => onSelectPersona(persona.id)}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 group relative ${
              activePersonaId === persona.id
                ? 'bg-indigo-600/30 ring-2 ring-indigo-500'
                : 'bg-gray-800 hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                {personaIcons[persona.style] || personaIcons.default}
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-white">{persona.name}</h3>
                <p className="text-sm text-gray-400">{persona.description}</p>
              </div>
            </div>
            <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button
                  onClick={(e) => { e.stopPropagation(); onEditPersona(persona.id); }}
                  className="p-1 rounded text-gray-400 hover:bg-gray-600 hover:text-white"
                  aria-label={`Edit ${persona.name}`}
                >
                  <IconEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeletePersona(persona.id); }}
                  className="p-1 rounded text-gray-400 hover:bg-gray-600 hover:text-red-400"
                  aria-label={`Delete ${persona.name}`}
                >
                  <IconTrash className="w-4 h-4" />
                </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default PersonaManager;