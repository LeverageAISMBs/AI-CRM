
import React, { useState, useRef, useEffect } from 'react';
import { GeminiModel, ChatMessage } from '../types';
import { IconX, IconSend } from './Icons';
import { generateChatResponse } from '../services/geminiService';

interface AIAssistantProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, setIsOpen }) => {
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(GeminiModel.Flash);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await generateChatResponse(input, selectedModel);
      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Gemini API error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-gray-800/90 backdrop-blur-md border-l border-gray-700/50 flex flex-col z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } w-full md:w-1/3 lg:w-1/4`}
    >
      <header className="flex items-center justify-between p-4 border-b border-gray-700/50">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-gray-700">
          <IconX />
        </button>
      </header>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-sm p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-700'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start">
             <div className="max-w-xs md:max-w-sm p-3 rounded-lg bg-gray-700">
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

      <footer className="p-4 border-t border-gray-700/50">
        <div className="mb-2">
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value as GeminiModel)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={GeminiModel.Flash}>Gemini 2.5 Flash (Fast)</option>
            <option value={GeminiModel.Pro}>Gemini 2.5 Pro (Advanced)</option>
            <option value={GeminiModel.FlashLite}>Gemini Flash Lite (Lite)</option>
          </select>
        </div>
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything..."
            className="w-full p-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:text-white hover:bg-indigo-600 disabled:hover:bg-transparent disabled:text-gray-500 transition-colors"
          >
            <IconSend />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AIAssistant;
