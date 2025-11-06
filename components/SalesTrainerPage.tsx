import React, { useState, useEffect, useCallback } from 'react';
import { AIPersona, ChatMessage, UniqueID } from '../types';
import { mockPersonas } from '../constants';
import { createChatSession } from '../services/geminiService';
import PersonaManager from './PersonaManager';
import ChatInterface from './ChatInterface';
import PersonaFormModal from './PersonaFormModal';
import { Chat } from '@google/genai';

const SalesTrainerPage: React.FC = () => {
  const [personas, setPersonas] = useState<AIPersona[]>(mockPersonas);
  const [activePersona, setActivePersona] = useState<AIPersona | null>(mockPersonas[0] || null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personaToEdit, setPersonaToEdit] = useState<AIPersona | undefined>(undefined);

  useEffect(() => {
    if (activePersona) {
      setIsLoading(true);
      const newChat = createChatSession(activePersona.systemPrompt);
      setChatSession(newChat);
      setMessages([]);
      setIsLoading(false);
    }
  }, [activePersona]);

  const handleSendMessage = async (input: string) => {
    if (!input.trim() || !chatSession) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: input });
      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Gemini chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Sorry, an error occurred during the conversation. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPersona = (personaId: UniqueID) => {
    const selected = personas.find(p => p.id === personaId);
    if (selected) {
      setActivePersona(selected);
    }
  };
  
  const handleEditPersona = (personaId: UniqueID) => {
      const persona = personas.find(p => p.id === personaId);
      if (persona) {
          setPersonaToEdit(persona);
          setIsModalOpen(true);
      }
  };
  
  const handleDeletePersona = (personaId: UniqueID) => {
      setPersonas(prev => prev.filter(p => p.id !== personaId));
      if (activePersona?.id === personaId) {
          setActivePersona(personas[0] || null);
      }
  };

  const handleSavePersona = (persona: AIPersona) => {
    const exists = personas.some(p => p.id === persona.id);
    if (exists) {
      setPersonas(personas.map(p => p.id === persona.id ? persona : p));
      if (activePersona?.id === persona.id) {
          setActivePersona(persona);
      }
    } else {
      setPersonas([...personas, persona]);
      setActivePersona(persona);
    }
  };

  const openNewPersonaForm = () => {
    setPersonaToEdit(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-full w-full bg-gray-800/50">
      <PersonaManager
        personas={personas}
        activePersonaId={activePersona?.id}
        onSelectPersona={handleSelectPersona}
        onNewPersona={openNewPersonaForm}
        onEditPersona={handleEditPersona}
        onDeletePersona={handleDeletePersona}
      />
      <ChatInterface
        activePersona={activePersona}
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
      />
      <PersonaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePersona}
        personaToEdit={personaToEdit}
      />
    </div>
  );
};

export default SalesTrainerPage;
