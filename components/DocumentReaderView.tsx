
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createChat, getAIResponse } from '../services/geminiService';
import type { Chat } from '@google/genai';
import type { ChatMessage } from '../types';
import { DocumentReaderIcon, ProcessingIcon, BotIcon, UserIcon } from './Icons';

const ChatLog: React.FC<{ messages: ChatMessage[] }> = ({ messages }) => {
    const chatEndRef = React.useRef<HTMLDivElement>(null);
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="w-full h-full p-2 overflow-y-auto flex flex-col space-y-2">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"><BotIcon /></div>}
                    <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                        <p className="text-white whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {msg.role === 'user' && <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center"><UserIcon /></div>}
                </div>
            ))}
            <div ref={chatEndRef} />
        </div>
    );
};

interface FileInfo {
    base64: string;
    mimeType: string;
    type: 'image' | 'text';
}

export const DocumentReaderView: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null); // dataURL for images, text content for text
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analyzerChat, setAnalyzerChat] = useState<Chat | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isAnswering, setIsAnswering] = useState(false);
    const dropzoneRef = useRef<HTMLLabelElement>(null);

    useEffect(() => {
        if (fileInfo && file) {
            let systemInstruction = '';
            if (fileInfo.type === 'image') {
                systemInstruction = `Você é um assistente de estudos e análise de imagens. O usuário enviou uma imagem chamada "${file.name}". Sua tarefa é ajudar o usuário a estudar ou entender o conteúdo desta imagem. Responda com clareza e precisão.`;
            } else {
                systemInstruction = `Você é 'Blue', um professor e assistente de estudos de IA. O usuário enviou um material de estudo (livro ou documento) chamado "${file.name}". O conteúdo de texto extraído é o seguinte:\n\n---\n${filePreview}\n---\n\nSua missão é ajudar o aluno a aprender este material. Você pode resumir, criar quizzes, explicar conceitos difíceis e "passar a matéria" de forma didática. Responda sempre com base no conteúdo fornecido, mas use seu conhecimento didático para explicar melhor. Seja encorajador e claro.`;
            }
            const initialHistory: ChatMessage[] = [
                { role: 'model', text: `Pronto! O material "${file.name}" foi carregado. Como posso ajudar nos seus estudos hoje? Posso resumir, criar um quiz ou explicar tópicos específicos.` }
            ];
            setChatHistory(initialHistory);
            setAnalyzerChat(createChat([], systemInstruction));
        }
    }, [fileInfo, file, filePreview]);
    
    const handleFileChange = (selectedFile: File | null) => {
        if (!selectedFile) return;
        setFile(selectedFile);
        setIsLoading(true);
        setFileInfo(null);
        setFilePreview(null);
        setAnalyzerChat(null);
        setChatHistory([]);

        const reader = new FileReader();
        
        if (selectedFile.type.startsWith('image/')) {
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                setFilePreview(dataUrl);
                const base64Data = dataUrl.split(',')[1];
                setFileInfo({ base64: base64Data, mimeType: selectedFile.type, type: 'image' });
                setIsLoading(false);
            };
            reader.onerror = () => {
                console.error("Erro ao ler o arquivo de imagem.");
                setIsLoading(false);
            };
            reader.readAsDataURL(selectedFile);
        } else { // Assume text-based file
            reader.onload = (e) => {
                let textContent = '';
                 if (selectedFile.type === 'text/plain') {
                    textContent = e.target?.result as string;
                } else if (selectedFile.name.endsWith('.pdf')) {
                    textContent = `[Simulação de Extração de Livro/PDF para '${selectedFile.name}']\n\nCONTEÚDO SIMULADO DO LIVRO:\n\nCapítulo 1: Fundamentos da Computação Quântica\n\nA computação quântica utiliza fenômenos da mecânica quântica, como superposição e entrelaçamento, para realizar computações. Diferente dos computadores clássicos que usam bits (0 ou 1), computadores quânticos usam qubits.\n\nPrincípios Chave:\n1. Superposição: Um qubit pode existir em múltiplos estados ao mesmo tempo.\n2. Entrelaçamento: Partículas podem estar correlacionadas de forma que o estado de uma depende instantaneamente da outra.\n\nAplicações:\n- Criptografia Avançada\n- Descoberta de Novos Materiais\n- Otimização de Sistemas Complexos\n\nDesafios:\n- Decoerência Quântica\n- Correção de Erros`;
                } else {
                    textContent = `[Simulação de Leitura de Livro para '${selectedFile.name}']\n\nEste é um conteúdo simulado para demonstrar a capacidade de leitura e estudo. O Blue usará este texto para ensinar a matéria.`;
                }
                setFilePreview(textContent);
                setFileInfo({ base64: '', mimeType: selectedFile.type, type: 'text' });
                setIsLoading(false);
            };
            reader.onerror = () => {
                console.error("Erro ao ler o arquivo.");
                setIsLoading(false);
            };
            reader.readAsText(selectedFile);
        }
    };
    
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneRef.current?.classList.add('border-blue-500', 'bg-blue-500/10');
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneRef.current?.classList.remove('border-blue-500', 'bg-blue-500/10');
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneRef.current?.classList.remove('border-blue-500', 'bg-blue-500/10');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    }, []);

    const handleQuickAction = (actionType: 'summary' | 'quiz' | 'explain') => {
        let prompt = '';
        switch(actionType) {
            case 'summary':
                prompt = "Faça um resumo detalhado e estruturado dos principais conceitos apresentados neste material, destacando os pontos chave para estudo.";
                break;
            case 'quiz':
                prompt = "Crie um quiz com 3 perguntas de múltipla escolha sobre este conteúdo para testar meu conhecimento. Inclua as respostas corretas no final.";
                break;
            case 'explain':
                prompt = "Aja como um professor e explique a matéria deste texto de forma didática e simples, usando analogias se possível, para que eu possa entender profundamente.";
                break;
        }
        handleSendMessage(prompt);
    };

    const handleSendMessage = async (messageText?: string) => {
        const textToSend = messageText || currentMessage;
        if (!textToSend.trim() || !analyzerChat || isAnswering) return;
        
        const newUserMessage: ChatMessage = { role: 'user', text: textToSend };
        setChatHistory(prev => [...prev, newUserMessage]);
        if (!messageText) setCurrentMessage('');
        setIsAnswering(true);

        try {
            const isFirstUserMessage = chatHistory.filter(m => m.role === 'user').length === 0;
            const imagePayload = (fileInfo?.type === 'image' && isFirstUserMessage)
                ? { base64: fileInfo.base64, mimeType: fileInfo.mimeType }
                : undefined;

            const response = await getAIResponse(analyzerChat, newUserMessage.text, imagePayload);
            const modelMessage: ChatMessage = { role: 'model', text: response.text.replace(/\*/g, '') };
            setChatHistory(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Erro ao obter resposta do documento:", error);
            const errorMessage: ChatMessage = { role: 'model', text: "Desculpe, tive um problema ao analisar sua pergunta." };
            setChatHistory(prev => [...prev, errorMessage]);
        }
        setIsAnswering(false);
    };

    if (!file) {
        return (
            <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col items-center justify-center text-center animate-fade-in space-y-4">
                <DocumentReaderIcon className="h-20 w-20 text-blue-400" />
                <h2 className="text-2xl font-bold text-gray-200">Leitor de Livros & Estudos</h2>
                <p className="text-gray-400 max-w-md">
                    Envie seu livro (PDF), apostila ou anotações. O Blue vai ler o conteúdo, gerar resumos, criar quizzes e te ajudar a estudar a matéria ("passar a matéria").
                </p>
                <input type="file" id="file-upload" className="hidden" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} accept="image/*,text/plain,.pdf,.doc,.docx" />
                <label 
                    htmlFor="file-upload"
                    ref={dropzoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className="w-full max-w-lg p-10 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer transition-colors duration-300 hover:border-blue-500 hover:bg-blue-500/10"
                >
                    <span className="text-gray-400">Clique para enviar ou arraste um arquivo aqui</span>
                </label>
            </div>
        );
    }
    
    if (isLoading) {
        return (
             <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col items-center justify-center text-center animate-fade-in space-y-4">
                <ProcessingIcon />
                <h2 className="text-xl font-semibold mt-4">Lendo {file.name}...</h2>
                <p className="text-gray-400">Estou absorvendo o conteúdo para poder te ensinar.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-black/20 rounded-lg p-4 flex flex-col md:flex-row animate-fade-in space-y-4 md:space-y-0 md:space-x-4">
            {/* File Preview */}
            <div className="w-full md:w-3/5 h-1/2 md:h-full flex flex-col">
                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-200 truncate">Estudando: <span className="text-blue-300">{file.name}</span></h3>
                    <button onClick={() => setFile(null)} className="text-xs text-gray-400 hover:text-white underline">Trocar Arquivo</button>
                </div>
                <div className="flex-grow bg-gray-900/50 rounded-lg p-3 text-sm text-gray-300 font-mono overflow-y-auto border border-gray-700 flex items-center justify-center">
                    {fileInfo?.type === 'image' ? (
                         <img src={filePreview || ''} alt="Preview" className="max-w-full max-h-full object-contain rounded-md" />
                    ) : (
                         <pre className="whitespace-pre-wrap w-full h-full">{filePreview}</pre>
                    )}
                </div>
            </div>
            {/* Chat & Tools */}
            <div className="w-full md:w-2/5 h-1/2 md:h-full flex flex-col bg-gray-900/50 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200 p-3 border-b border-gray-700 flex-shrink-0 bg-black/20 rounded-t-lg">Assistente de Estudos</h3>
                
                <div className="p-2 grid grid-cols-3 gap-2 border-b border-gray-700 flex-shrink-0">
                    <button onClick={() => handleQuickAction('summary')} disabled={isAnswering} className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white text-xs py-2 rounded-md font-semibold transition-colors">
                        📝 Resumir
                    </button>
                    <button onClick={() => handleQuickAction('quiz')} disabled={isAnswering} className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white text-xs py-2 rounded-md font-semibold transition-colors">
                        🧠 Criar Quiz
                    </button>
                    <button onClick={() => handleQuickAction('explain')} disabled={isAnswering} className="bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 text-white text-xs py-2 rounded-md font-semibold transition-colors">
                        👨‍🏫 Explicar
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto min-h-0">
                    <ChatLog messages={chatHistory} />
                </div>
                <div className="p-2 border-t border-gray-700 flex-shrink-0">
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-2">
                        <input 
                            type="text"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            placeholder={isAnswering ? "Blue está pensando..." : "Faça uma pergunta sobre a matéria..."}
                            disabled={isAnswering || !analyzerChat}
                            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button type="submit" disabled={isAnswering || !analyzerChat} className="bg-blue-600 hover:bg-blue-500 rounded-md px-4 py-2 text-sm font-semibold disabled:bg-gray-500">
                            Enviar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
