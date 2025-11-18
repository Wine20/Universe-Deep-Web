import React, { useState, useEffect } from 'react';
import type { Script } from '../types';
import { getAIResponse } from '../services/geminiService';
import { ScriptIcon, ProcessingIcon } from './Icons';
import type { Chat } from '@google/genai';

interface ScriptWriterViewProps {
    initialScript: Script | null;
    chat: Chat | null;
}

export const ScriptWriterView: React.FC<ScriptWriterViewProps> = ({ initialScript, chat }) => {
    const [script, setScript] = useState<Script | null>(initialScript);
    const [isLoading, setIsLoading] = useState(false);
    const [titleInput, setTitleInput] = useState('');
    const [loglineInput, setLoglineInput] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setScript(initialScript);
        if (initialScript) {
            setTitleInput(initialScript.title);
            setLoglineInput(initialScript.logline);
        }
    }, [initialScript]);

    const handleGenerate = async () => {
        if (!chat) {
            setError("A sessão de chat não está ativa. Tente novamente.");
            return;
        }
        if (!titleInput.trim() || !loglineInput.trim()) {
            setError("Por favor, preencha o título e a descrição da história.");
            return;
        }
        setIsLoading(true);
        setScript(null);
        setError(null);
        try {
            const prompt = `Crie um roteiro com o título "${titleInput}" e a seguinte descrição: "${loglineInput}"`;
            const aiResult = await getAIResponse(chat, prompt);
            
            const createScriptCall = aiResult.functionCalls?.find(fc => fc.name === 'createScript');
            if (createScriptCall && createScriptCall.args.scriptData) {
                 const scriptData = JSON.parse(createScriptCall.args.scriptData);
                 setScript(scriptData);
            } else {
                throw new Error("A IA não conseguiu gerar um roteiro. Tente ser mais específico.");
            }
        } catch (e: any) {
            setError(e.message || "Ocorreu um erro ao gerar o roteiro.");
            console.error(e);
        }
        setIsLoading(false);
    };

    const renderInitialState = () => (
        <div className="text-center">
            <ScriptIcon className="h-16 w-16 mx-auto text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Gerador de Roteiros</h3>
            <p className="text-gray-400">Dê ao Blue um título e uma ideia, e ele criará uma história original para você, dividida em tópicos.</p>
        </div>
    );
    
    const renderLoadingState = () => (
        <div className="text-center">
            <div className="flex justify-center"><ProcessingIcon /></div>
            <h3 className="text-xl font-semibold mt-4">Escrevendo sua história...</h3>
            <p className="text-gray-400">A criatividade do Blue está a todo vapor, transformando sua ideia em um roteiro.</p>
        </div>
    );

    const renderScript = () => {
        if (!script) return null;
        return (
            <div className="animate-fade-in w-full h-full max-w-3xl mx-auto overflow-y-auto pr-2">
                <header className="bg-gray-900/50 p-4 rounded-lg border border-blue-500/30 mb-4">
                    <h3 className="text-3xl font-bold text-blue-300">{script.title}</h3>
                    <p className="text-sm text-gray-300 italic mt-1">"{script.logline}"</p>
                </header>
                
                <div className="space-y-4">
                    {script.scenes.map((scene, index) => (
                        <div key={index} className="bg-black/20 p-4 rounded-lg border-l-4 border-blue-500">
                             <h4 className="font-semibold text-lg text-blue-300 mb-2">{`${index + 1}. ${scene.title}`}</h4>
                             <p className="text-gray-300 text-sm">{scene.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col animate-fade-in space-y-4">
            <div className="flex-shrink-0">
                 <h2 className="text-2xl font-bold text-gray-200 flex items-center mb-4">
                    <ScriptIcon className="h-7 w-7 mr-3" />Criar Roteiro
                </h2>
                <div className="space-y-3">
                    <input 
                        type="text"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        placeholder="Título da História"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                     <textarea
                        value={loglineInput}
                        onChange={(e) => setLoglineInput(e.target.value)}
                        placeholder="Descrição curta (logline). Ex: Um detetive robô precisa resolver o mistério de sua própria criação."
                        rows={2}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <button onClick={handleGenerate} disabled={isLoading || !chat} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-wait rounded-lg px-6 py-3 font-semibold transition-colors">
                        {isLoading ? 'Gerando...' : 'Gerar Roteiro'}
                    </button>
                </div>
                {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
            </div>
            <div className="flex-grow flex items-center justify-center overflow-y-auto p-2 min-h-0">
                {isLoading ? renderLoadingState() : script ? renderScript() : renderInitialState()}
            </div>
        </div>
    );
};