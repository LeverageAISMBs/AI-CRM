import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AIPersona, ChatMessage, UniqueID, GeminiModel } from '../types';
import { mockPersonas } from '../constants';
import { createChatSession, connectLiveSession } from '../services/geminiService';
import PersonaManager from './PersonaManager';
import ChatInterface from './ChatInterface';
import PersonaFormModal from './PersonaFormModal';
import { Chat, LiveServerMessage } from '@google/genai';
import { createPcmBlob, decode, decodeAudioData } from '../utils/audioUtils';

const CrossBrowserAudioContext = window.AudioContext || (window as any).webkitAudioContext;

const SalesTrainerPage: React.FC = () => {
  const [personas, setPersonas] = useState<AIPersona[]>(mockPersonas);
  const [activePersona, setActivePersona] = useState<AIPersona | null>(mockPersonas[0] || null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personaToEdit, setPersonaToEdit] = useState<AIPersona | undefined>(undefined);
  
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(GeminiModel.Pro);

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

  useEffect(() => {
    if (activePersona) {
      setIsLoading(true);
      const newChat = createChatSession(activePersona.systemPrompt, selectedModel);
      setChatSession(newChat);
      setMessages([]);
      setIsLoading(false);
    }
  }, [activePersona, selectedModel]);

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
    if (!activePersona) return;
    setIsConnecting(true);

    if (!CrossBrowserAudioContext) {
        stopLiveSession("Your browser does not support the Web Audio API.");
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const inputAudioContext = new CrossBrowserAudioContext({ sampleRate: 16000 });
        const outputAudioContext = new CrossBrowserAudioContext({ sampleRate: 24000 });
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
        }, activePersona.systemPrompt);

        sessionPromiseRef.current = sessionPromise;
        setIsConnecting(false);
        setIsLiveSession(true);

    } catch (err) {
        console.error("Failed to start live session:", err);
        stopLiveSession(err instanceof Error ? err.message : 'Could not start microphone.');
    }
  }, [activePersona, stopLiveSession]);

  const handleMicClick = () => {
      if (isLiveSession || isConnecting) {
          stopLiveSession();
      } else {
          startLiveSession();
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
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        isLiveSession={isLiveSession}
        isConnecting={isConnecting}
        onMicClick={handleMicClick}
        liveTranscript={liveTranscript}
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