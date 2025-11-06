import React, { useState, useRef, useEffect } from 'react';
import { AIPersona, ChatMessage } from '../types';
import { IconSend, IconSparkles } from './Icons';

interface ChatInterfaceProps {
  activePersona: AIPersona | null;
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (input: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ activePersona, messages, isLoading, onSendMessage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  if (!activePersona) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <IconSparkles className="w-12 h-12 text-gray-500 mb-4" />
        <h2 className="text-2xl font-bold">Select a Persona</h2>
        <p className="text-gray-400">Choose a persona from the left to start your training session.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <header className="p-4 border-b border-gray-700/50 bg-gray-900/50">
        <h2 className="text-xl font-bold">{activePersona.name}</h2>
        <p className="text-sm text-gray-400">{activePersona.description}</p>
      </header>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-700'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && messages.length > 0 && (
           <div className="flex justify-start">
             <div className="max-w-xs p-3 rounded-lg bg-gray-700">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-4 border-t border-gray-700/50 bg-gray-900/50">
         <div className="relative flex items-center">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            }}
            placeholder={`Practice with ${activePersona.name}...`}
            className="w-full p-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:text-white hover:bg-indigo-600 disabled:hover:bg-transparent disabled:text-gray-500 transition-colors"
          >
            <IconSend />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;
