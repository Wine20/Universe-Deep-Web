import React, { useState, useEffect } from 'react';
import type { PCBuild } from '../types';
import { getAIResponse } from '../services/geminiService';
import { PCBuilderIcon, ProcessingIcon } from './Icons';
import type { Chat } from '@google/genai';

interface PCBuilderViewProps {
    initialBuild: PCBuild | null;
    chat: Chat | null;
}

const componentIcons: Record<string, string> = {
    CPU: "🧠", GPU: "🎮", Motherboard: "🔧", RAM: "💾", Storage: "💽", PSU: "⚡", Case: "📦"
};

export const PCBuilderView: React.FC<PCBuilderViewProps> = ({ initialBuild, chat }) => {
    const [build, setBuild] = useState<PCBuild | null>(initialBuild);
    const [isLoading, setIsLoading] = useState(false);
    const [budgetInput, setBudgetInput] = useState('');
    const [purposeInput, setPurposeInput] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setBuild(initialBuild);
        if (initialBuild) {
            setBudgetInput(initialBuild.totalPrice);
            setPurposeInput(initialBuild.purpose);
        }
    }, [initialBuild]);

    const handleGenerate = async () => {
        if (!chat) {
            setError("A sessão de chat não está ativa. Tente novamente.");
            return;
        }
        if (!budgetInput.trim() || !purposeInput.trim()) {
            setError("Por favor, preencha o orçamento e a finalidade.");
            return;
        }
        setIsLoading(true);
        setBuild(null);
        setError(null);
        try {
            const prompt = `Sugira uma build de PC com um orçamento de "${budgetInput}" para a finalidade de "${purposeInput}". Retorne o resultado como uma chamada de função 'suggestPCBuild'.`;
            const aiResult = await getAIResponse(chat, prompt);
            
            const createBuildCall = aiResult.functionCalls?.find(fc => fc.name === 'suggestPCBuild');
            if (createBuildCall && createBuildCall.args.buildData) {
                 const buildData = JSON.parse(createBuildCall.args.buildData);
                 setBuild(buildData);
            } else {
                throw new Error("A IA não conseguiu gerar a build. Tente ser mais específico.");
            }
        } catch (e: any) {
            setError(e.message || "Ocorreu um erro ao gerar a build.");
            console.error(e);
        }
        setIsLoading(false);
    };

    const renderInitialState = () => (
        <div className="text-center">
            <PCBuilderIcon className="h-16 w-16 mx-auto text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">PC Builder</h3>
            <p className="text-gray-400">Informe um orçamento e uma finalidade (ex: jogos, edição de vídeo), e o Blue montará a configuração perfeita para você.</p>
        </div>
    );
    
    const renderLoadingState = () => (
        <div className="text-center">
            <div className="flex justify-center"><ProcessingIcon /></div>
            <h3 className="text-xl font-semibold mt-4">Montando sua configuração...</h3>
            <p className="text-gray-400">O Blue está pesquisando as melhores peças para o seu novo PC.</p>
        </div>
    );

    const renderBuild = () => {
        if (!build) return null;
        return (
            <div className="animate-fade-in w-full h-full max-w-3xl mx-auto overflow-y-auto pr-2">
                <header className="bg-gray-900/50 p-4 rounded-lg border border-blue-500/30 mb-4">
                    <h3 className="text-3xl font-bold text-blue-300">{build.title}</h3>
                    <p className="text-lg text-gray-300 mt-1">Finalidade: <span className="font-semibold">{build.purpose}</span></p>
                    <p className="text-2xl font-bold text-green-400 mt-2">~{build.totalPrice}</p>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {build.components.map((component, index) => (
                        <div key={index} className="bg-black/20 p-4 rounded-lg border-l-4 border-blue-500">
                             <h4 className="font-semibold text-lg text-blue-300 mb-2 flex items-center">
                                <span className="text-2xl mr-2">{componentIcons[component.type as keyof typeof componentIcons] || '⚙️'}</span>
                                {component.type}
                            </h4>
                             <p className="text-gray-200 font-bold">{component.name}</p>
                             <p className="text-gray-400 text-xs italic mt-1">{component.reasoning}</p>
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
                    <PCBuilderIcon className="h-7 w-7 mr-3" />Monte seu PC
                </h2>
                <div className="space-y-3">
                    <input 
                        type="text"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                        placeholder="Orçamento (ex: R$ 5000, $1500 USD)"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                     <input
                        type="text"
                        value={purposeInput}
                        onChange={(e) => setPurposeInput(e.target.value)}
                        placeholder="Finalidade Principal (ex: Jogos 4K, Edição de Vídeo, Programação)"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleGenerate} disabled={isLoading || !chat} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-wait rounded-lg px-6 py-3 font-semibold transition-colors">
                        {isLoading ? 'Gerando...' : 'Gerar Configuração'}
                    </button>
                </div>
                {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
            </div>
            <div className="flex-grow flex items-center justify-center overflow-y-auto p-2 min-h-0">
                {isLoading ? renderLoadingState() : build ? renderBuild() : renderInitialState()}
            </div>
        </div>
    );
};