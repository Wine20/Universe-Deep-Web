import React, { useState, useEffect } from 'react';
import { ProcessingIcon, ChipIcon } from './Icons';

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
            className="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-linear" 
            style={{ width: `${progress}%` }}>
        </div>
    </div>
);

const CodeWriter: React.FC<{ code: string, onDone: () => void }> = ({ code, onDone }) => {
    const [typedCode, setTypedCode] = useState('');
    
    useEffect(() => {
        let timeoutId: number;
        if(typedCode.length < code.length) {
            timeoutId = window.setTimeout(() => {
                setTypedCode(code.slice(0, typedCode.length + 2)); // Type 2 chars at a time
            }, 10);
        } else {
            // Finished typing, wait a bit then call onDone
            timeoutId = window.setTimeout(onDone, 500);
        }
        return () => clearTimeout(timeoutId);
    }, [typedCode, code, onDone]);

    return (
        <pre className="font-mono text-cyan-300 overflow-x-auto text-xs sm:text-sm">
            <code>{typedCode}<span className="animate-ping">▋</span></code>
        </pre>
    );
};

interface SelfUpdateViewProps {
    taskDescription: string;
    newCodeSnippet: string;
    onComplete: () => void;
}

export const SelfUpdateView: React.FC<SelfUpdateViewProps> = ({ taskDescription, newCodeSnippet, onComplete }) => {
    const [status, setStatus] = useState<'analyzing' | 'writing' | 'integrating' | 'done'>('analyzing');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (status === 'integrating') {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setStatus('done');
                        setTimeout(onComplete, 2000); // Wait 2s before closing
                        return 100;
                    }
                    return prev + 2;
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [status, onComplete]);

    const getStatusText = () => {
        switch(status) {
            case 'analyzing': return 'Analisando a solicitação de atualização...';
            case 'writing': return 'Gerando novo código de funcionalidade...';
            case 'integrating': return 'Integrando novo módulo ao núcleo do sistema...';
            case 'done': return 'Atualização concluída! Reiniciando serviços...';
        }
    }
    
    useEffect(() => {
        if(status === 'analyzing') setTimeout(() => setStatus('writing'), 1500);
    }, [status]);


    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="w-full max-w-2xl bg-slate-900 border-2 border-green-500/50 rounded-lg shadow-2xl p-6 flex flex-col space-y-4">
                <div className="flex items-center space-x-3">
                    <div className="text-green-400"><ChipIcon className="h-10 w-10"/></div>
                    <h2 className="text-xl font-bold text-gray-200">Auto-Atualização em Progresso</h2>
                </div>

                <div>
                    <p className="text-sm text-gray-400">Tarefa:</p>
                    <p className="font-semibold text-gray-200">{taskDescription}</p>
                </div>

                <div className="flex-grow bg-gray-900/70 rounded-lg p-3 font-mono text-xs text-green-400 overflow-y-auto border border-gray-700 h-48">
                    {status === 'writing' || status === 'integrating' || status === 'done' ? (
                        <CodeWriter code={newCodeSnippet} onDone={() => {
                            if (status === 'writing') setStatus('integrating')
                        }}/>
                    ) : (
                        <div className="flex items-center space-x-2">
                             <ProcessingIcon />
                             <span>Analisando...</span>
                        </div>
                    )}
                </div>

                <div className="w-full">
                    <ProgressBar progress={progress} />
                    <p className="text-center text-sm font-mono text-green-300 mt-2">{getStatusText()}</p>
                </div>
            </div>
        </div>
    );
};
