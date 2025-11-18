import React, { useState, useEffect, useRef, useCallback } from 'react';
import { startSession, stopSession } from '../services/liveService';
import type { VoiceSessionStatus, TranscriptionTurn } from '../types';
import { VoiceChatIcon, UserIcon, BotIcon } from './Icons';

export const VoiceChatView: React.FC = () => {
    const [status, setStatus] = useState<VoiceSessionStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [currentUserText, setCurrentUserText] = useState('');
    const [currentModelText, setCurrentModelText] = useState('');
    const [history, setHistory] = useState<TranscriptionTurn[]>([]);
    const historyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to bottom when history changes
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [history, currentUserText, currentModelText]);

    const handleTranscriptionUpdate = useCallback((isFinal: boolean, userText: string, modelText: string) => {
        if (isFinal) {
            if (userText || modelText) {
                 setHistory(prev => [...prev, { user: userText, model: modelText, timestamp: Date.now() }]);
            }
            setCurrentUserText('');
            setCurrentModelText('');
        } else {
            setCurrentUserText(userText);
            setCurrentModelText(modelText);
        }
    }, []);

    const handleStart = () => {
        setError(null);
        setHistory([]);
        setCurrentUserText('');
        setCurrentModelText('');
        startSession({
            onStatusChange: setStatus,
            onTranscriptionUpdate: handleTranscriptionUpdate,
            onFunctionCall: (func) => console.log('Function call received in VoiceChatView:', func),
            onError: setError,
        });
    };
    
    const handleStop = () => {
        stopSession();
        setStatus('stopped');
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopSession();
        };
    }, []);

    const renderStatusIndicator = () => {
        switch (status) {
            case 'connecting':
                return <p className="text-yellow-400">Conectando ao servidor de voz...</p>;
            case 'active':
                return <p className="text-green-400 flex items-center"><span className="relative flex h-3 w-3 mr-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>Sessão de voz ativa. Fale agora.</p>;
            case 'error':
                return <p className="text-red-400">{error || "Ocorreu um erro."}</p>;
            case 'stopped':
                return <p className="text-gray-400">Sessão encerrada.</p>;
            default:
                return <p className="text-gray-400">Clique em "Iniciar Sessão" para começar a conversar.</p>;
        }
    };
    
    return (
        <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col animate-fade-in space-y-4">
            <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h2 className="text-2xl font-bold text-gray-200 flex items-center">
                    <VoiceChatIcon className="h-7 w-7 mr-3" />Conversa por Voz em Tempo Real
                </h2>
                 {status !== 'active' && status !== 'connecting' ? (
                     <button onClick={handleStart} className="bg-blue-600 hover:bg-blue-500 rounded-md px-4 py-2 text-sm font-semibold transition-colors">
                        Iniciar Sessão
                    </button>
                 ) : (
                    <button onClick={handleStop} className="bg-red-600 hover:bg-red-500 rounded-md px-4 py-2 text-sm font-semibold transition-colors">
                        Encerrar Sessão
                    </button>
                 )}
            </div>
            
            <div className="text-center text-sm mb-2">{renderStatusIndicator()}</div>

            <div ref={historyRef} className="flex-grow bg-gray-900/50 rounded-lg p-4 border border-gray-700 overflow-y-auto min-h-0">
                {history.length === 0 && !currentUserText && !currentModelText && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        O histórico da conversa aparecerá aqui.
                    </div>
                )}
                <div className="space-y-4">
                    {history.map(turn => (
                        <div key={turn.timestamp}>
                            {turn.user && <div className="flex justify-end items-start gap-2">
                                <p className="bg-indigo-600 text-white rounded-lg px-3 py-2 max-w-sm">{turn.user}</p>
                                <UserIcon />
                            </div>}
                             {turn.model && <div className="flex justify-start items-start gap-2 mt-2">
                                 <BotIcon />
                                <p className="bg-gray-700 text-white rounded-lg px-3 py-2 max-w-sm">{turn.model}</p>
                            </div>}
                        </div>
                    ))}
                    {/* Live transcriptions */}
                    {currentUserText && <div className="flex justify-end items-start gap-2 opacity-70">
                         <p className="bg-indigo-600 text-white rounded-lg px-3 py-2 max-w-sm">{currentUserText}</p>
                         <UserIcon />
                    </div>}
                     {currentModelText && <div className="flex justify-start items-start gap-2 mt-2 opacity-70">
                         <BotIcon />
                        <p className="bg-gray-700 text-white rounded-lg px-3 py-2 max-w-sm">{currentModelText}</p>
                    </div>}
                </div>
            </div>
        </div>
    );
};