import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GeminiModel, ChatMessage } from '../types';
import { IconX, IconSend, IconLink, IconMicrophone, IconStop } from './Icons';
import { generateChatResponse, connectLiveSession } from '../services/geminiService';
import { createPcmBlob, decode, decodeAudioData } from '../utils/audioUtils';
import { LiveServerMessage, Modality } from '@google/genai';


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

  // Live session state
  const [isLiveSession, setIsLiveSession] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState({ user: '', model: '' });
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  
  const audioInfrastructureRef = useRef<{
      inputAudioContext: AudioContext;
      outputAudioContext: AudioContext;
      stream: MediaStream;
      scriptProcessor: ScriptProcessorNode;
      sourceNode: MediaStreamAudioSourceNode;
      sources: Set<AudioBufferSourceNode>;
      nextStartTime: number;
  } | null>(null);

  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, liveTranscript]);

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
      const { text: responseText, sources } = await generateChatResponse(input, selectedModel);
      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date().toISOString(),
        sources: sources,
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

  const stopLiveSession = useCallback(async (error?: string) => {
    if (error) {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: `Live session error: ${error}`,
            timestamp: new Date().toISOString()
        }]);
    }
      
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session?.close());
        sessionPromiseRef.current = null;
    }

    if (audioInfrastructureRef.current) {
        audioInfrastructureRef.current.stream.getTracks().forEach(track => track.stop());
        audioInfrastructureRef.current.scriptProcessor.disconnect();
        audioInfrastructureRef.current.sourceNode.disconnect();
        audioInfrastructureRef.current.inputAudioContext.close();
        audioInfrastructureRef.current.outputAudioContext.close();
        audioInfrastructureRef.current = null;
    }

    setIsLiveSession(false);
    setIsConnecting(false);
    setLiveTranscript({ user: '', model: '' });
    currentInputTranscription.current = '';
    currentOutputTranscription.current = '';

  }, []);

  const startLiveSession = useCallback(async () => {
    setIsConnecting(true);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // FIX: Add `(window as any)` to support vendor-prefixed `webkitAudioContext`.
        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        // FIX: Add `(window as any)` to support vendor-prefixed `webkitAudioContext`.
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const sources = new Set<AudioBufferSourceNode>();

        audioInfrastructureRef.current = {
            stream,
            inputAudioContext,
            outputAudioContext,
            sources,
            nextStartTime: 0,
            scriptProcessor: inputAudioContext.createScriptProcessor(4096, 1, 1),
            sourceNode: inputAudioContext.createMediaStreamSource(stream),
        };
        
        const sessionPromise = connectLiveSession({
            onopen: () => {
                const { scriptProcessor, sourceNode, inputAudioContext } = audioInfrastructureRef.current!;
                scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const pcmBlob = createPcmBlob(inputData);
                    sessionPromiseRef.current?.then((session) => {
                      session.sendRealtimeInput({ media: pcmBlob });
                    });
                };
                sourceNode.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                if (message.serverContent?.inputTranscription) {
                    const text = message.serverContent.inputTranscription.text;
                    currentInputTranscription.current += text;
                    setLiveTranscript(prev => ({ ...prev, user: currentInputTranscription.current }));
                }
                
                if (message.serverContent?.outputTranscription) {
                    const text = message.serverContent.outputTranscription.text;
                    currentOutputTranscription.current += text;
                    setLiveTranscript(prev => ({ ...prev, model: currentOutputTranscription.current }));
                }

                if (message.serverContent?.turnComplete) {
                    if (currentInputTranscription.current) {
                         setMessages(prev => [...prev, {
                             id: Date.now().toString(),
                             role: 'user',
                             text: currentInputTranscription.current.trim(),
                             timestamp: new Date().toISOString()
                         }]);
                    }
                     if (currentOutputTranscription.current) {
                        setMessages(prev => [...prev, {
                            id: (Date.now() + 1).toString(),
                            role: 'model',
                            text: currentOutputTranscription.current.trim(),
                            timestamp: new Date().toISOString()
                        }]);
                    }
                    currentInputTranscription.current = '';
                    currentOutputTranscription.current = '';
                    setLiveTranscript({ user: '', model: '' });
                }

                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64Audio && audioInfrastructureRef.current) {
                    const { outputAudioContext, sources } = audioInfrastructureRef.current;
                    audioInfrastructureRef.current.nextStartTime = Math.max(audioInfrastructureRef.current.nextStartTime, outputAudioContext.currentTime);
                    const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                    const source = outputAudioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputAudioContext.destination);
                    source.addEventListener('ended', () => {
                        sources.delete(source);
                    });
                    source.start(audioInfrastructureRef.current.nextStartTime);
                    audioInfrastructureRef.current.nextStartTime += audioBuffer.duration;
                    sources.add(source);
                }
            },
            onerror: (e: ErrorEvent) => {
                console.error("Live session error:", e);
                stopLiveSession('Connection failed.');
            },
            onclose: (e: CloseEvent) => {
                stopLiveSession();
            }
        });

        sessionPromiseRef.current = sessionPromise;
        setIsConnecting(false);
        setIsLiveSession(true);

    } catch (err) {
        console.error("Failed to start live session:", err);
        stopLiveSession(err instanceof Error ? err.message : 'Could not start microphone.');
    }
  }, [stopLiveSession]);

  const handleMicClick = () => {
      if (isLiveSession || isConnecting) {
          stopLiveSession();
      } else {
          startLiveSession();
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
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-xs md:max-w-sm p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-700'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
             {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 text-xs text-gray-400 max-w-xs md:max-w-sm w-full">
                <p className="font-semibold mb-1">Sources:</p>
                <ul className="space-y-1">
                  {msg.sources.map((source, index) => (
                    source.web && (
                      <li key={index} className="flex items-start">
                        <IconLink className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 break-all">
                          {source.web.title || source.web.uri}
                        </a>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            )}
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
        
        {isLiveSession && (
          <div className="p-3 bg-gray-700/50 rounded-lg text-sm">
              <p className="font-semibold text-gray-300">Live Transcript:</p>
              {liveTranscript.user && <p><span className="font-bold text-indigo-400">You:</span> {liveTranscript.user}</p>}
              {liveTranscript.model && <p><span className="font-bold text-teal-400">AI:</span> {liveTranscript.model}</p>}
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
            disabled={isLiveSession || isConnecting}
          >
            <option value={GeminiModel.Flash}>Gemini 2.5 Flash (Fast)</option>
            <option value={GeminiModel.FlashWithSearch}>Gemini 2.5 Flash + Search</option>
            <option value={GeminiModel.Pro}>Gemini 2.5 Pro (Advanced)</option>
            <option value={GeminiModel.FlashLite}>Gemini Flash Lite (Lite)</option>
          </select>
        </div>
        <div className="relative flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder={isLiveSession ? "Live session active..." : "Ask anything..."}
            className="w-full p-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            disabled={isLoading || isLiveSession || isConnecting}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || isLiveSession || isConnecting}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:text-white hover:bg-indigo-600 disabled:hover:bg-transparent disabled:text-gray-500 transition-colors"
          >
            <IconSend />
          </button>
           <button
                onClick={handleMicClick}
                disabled={isLoading}
                className={`p-3 rounded-full transition-colors ${
                isLiveSession
                    ? 'bg-red-500 text-white animate-pulse'
                    : isConnecting
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-indigo-600 hover:text-white'
                }`}
            >
                {isLiveSession || isConnecting ? <IconStop /> : <IconMicrophone />}
            </button>
        </div>
      </footer>
    </div>
  );
};

export default AIAssistant;
