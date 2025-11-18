import React, { useState, useEffect } from 'react';
import type { Action } from '../types';
import { CleanIcon, OptimizeIcon, ShieldIcon, AppIcon, DocumentIcon, DownloadIcon } from './Icons';

interface ActionPanelProps {
  action: Action;
  onComplete: () => void;
}

const actionConfig = {
    CLEAN: {
        title: "Limpando Sistema (Simulação)",
        description: "Removendo arquivos temporários e lixo digital...",
        icon: <CleanIcon />,
        duration: 8000,
         logs: [
            "Analisando cache do navegador...",
            "Identificando 1500 arquivos temporários...",
            "Limpando registros de aplicativos...",
            "Removendo 1.2 GB de dados inúteis...",
            "Limpando cookies de rastreamento...",
            "Limpeza concluída com sucesso!",
        ],
    },
    SCAN_VIRUS: {
        title: "Verificando Ameaças (Simulação)",
        description: "Analisando arquivos em busca de vírus e malware...",
        icon: <ShieldIcon />,
        duration: 10000,
         logs: [
            "Iniciando motor de verificação v3.2...",
            "Atualizando banco de dados de assinaturas...",
            "Verificando arquivos de sistema em C:/Windows/System32...",
            "[OK] Nenhum problema encontrado.",
            "Analisando processos em memória...",
            "[OK] Nenhuma atividade suspeita detectada.",
            "Verificação heurística completa.",
            "Nenhuma ameaça encontrada. Seu sistema está seguro.",
        ],
    },
    OPTIMIZE: {
        title: "Otimizando Desempenho (Simulação)",
        description: "Liberando memória RAM e melhorando a velocidade...",
        icon: <OptimizeIcon />,
        duration: 8000,
         logs: [
            "Analisando uso de memória RAM...",
            "Liberando 2.1 GB de RAM em cache...",
            "Desfragmentando registros do sistema...",
            "Ajustando prioridades de processos em segundo plano...",
            "Finalizando serviços não essenciais...",
            "Otimização concluída. Desempenho melhorado.",
        ],
    },
    OPEN_APP: {
        title: "Abrindo Aplicativo",
        description: "Iniciando o aplicativo solicitado...",
        icon: <AppIcon />,
        duration: 3000,
    },
    INSTALL_APP: {
        title: "Instalando Aplicativo",
        description: "Baixando e preparando o instalador...",
        icon: <DownloadIcon />,
        duration: 10000,
    },
    WRITE_DOCUMENT: {
        title: "Criando Documento",
        description: "Preparando editor e escrevendo seu conteúdo...",
        icon: <DocumentIcon />,
        duration: 4000,
    }
};

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-linear" 
            style={{ width: `${progress}%` }}>
        </div>
    </div>
);

const DocumentWriter: React.FC<{ content: string }> = ({ content }) => {
    const [typedContent, setTypedContent] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        setIsTyping(true);
        setTypedContent('');
    }, [content]);

    useEffect(() => {
        if(isTyping && typedContent.length < content.length) {
            const timeoutId = setTimeout(() => {
                setTypedContent(content.slice(0, typedContent.length + 1));
            }, 50); // Adjusted typing speed
            return () => clearTimeout(timeoutId);
        } else if (isTyping) {
            // Finished typing
            setIsTyping(false);
        }
    }, [typedContent, content, isTyping]);
    
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        // Allow user to edit freely after AI finishes typing
        if (!isTyping) {
            setTypedContent(event.target.value);
        }
    };


    return (
        <textarea 
            className="w-full h-full bg-gray-800 rounded-lg p-4 font-mono text-gray-200 text-sm border border-gray-700 shadow-inner overflow-y-auto resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={typedContent + (isTyping ? '▋' : '')}
            onChange={handleChange}
            readOnly={isTyping}
            placeholder="Aguardando conteúdo..."
        />
    );
};


export const ActionPanel: React.FC<ActionPanelProps> = ({ action, onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);
    const config = actionConfig[action.intent] as (typeof actionConfig)[keyof typeof actionConfig] & { logs?: string[] };
    const isSimulation = ['CLEAN', 'SCAN_VIRUS', 'OPTIMIZE'].includes(action.intent);
    
    useEffect(() => {
        if (action.intent === 'WRITE_DOCUMENT') return;

        setProgress(0);
        setDisplayedLogs([]);

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    setTimeout(onComplete, 1500);
                    return 100;
                }
                return prev + 100 / (config.duration / 100);
            });
        }, 100);
        
        let logInterval: number;
        if (isSimulation && config.logs) {
            let logIndex = 0;
            logInterval = window.setInterval(() => {
                if (logIndex < config.logs!.length) {
                    setDisplayedLogs(prev => [...prev, config.logs![logIndex]]);
                    logIndex++;
                } else {
                    clearInterval(logInterval);
                }
            }, config.duration / config.logs.length);
        }

        return () => {
            clearInterval(progressInterval);
            if (logInterval) clearInterval(logInterval);
        };
    }, [action, config, onComplete, isSimulation]);

    if (action.intent === 'WRITE_DOCUMENT') {
        return (
             <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col animate-fade-in space-y-4">
                <div className="flex items-center space-x-3">
                    <div className="text-blue-400">{config.icon}</div>
                    <h2 className="text-xl font-bold text-gray-200">{action.appName || config.title}</h2>
                </div>
                <DocumentWriter content={action.content || ''} />
                <p className="text-xs text-gray-400 text-center">Você pode editar o texto. Diga "pode fechar" quando terminar.</p>
             </div>
        );
    }

     if (isSimulation) {
        return (
            <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col animate-fade-in space-y-4">
                <div className="flex items-center space-x-3">
                    <div className="text-blue-400">{config.icon}</div>
                    <h2 className="text-xl font-bold text-gray-200">{config.title}</h2>
                </div>
                <div className="flex-grow bg-gray-900/70 rounded-lg p-3 font-mono text-xs text-green-400 overflow-y-auto border border-gray-700 h-0">
                    {displayedLogs.map((log, index) => (
                        <p key={index} className="animate-fade-in whitespace-pre-wrap">{`> ${log}`}</p>
                    ))}
                </div>
                <div className="w-full max-w-full">
                    <ProgressBar progress={progress} />
                    <p className="text-center text-sm font-mono text-blue-300 mt-2">{Math.round(progress)}%</p>
                </div>
            </div>
        );
    }


    let description = config.description;
    if (action.intent === 'OPEN_APP' || action.intent === 'INSTALL_APP') {
        description = `${config.description.split('...')[0]} '${action.appName || 'solicitado'}'...`;
    }

    return (
        <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col items-center justify-center animate-fade-in space-y-6">
            <div className="text-blue-400">
                {config.icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-200">{config.title}</h2>
            <p className="text-gray-400">{description}</p>
            <div className="w-full max-w-sm">
                <ProgressBar progress={progress} />
            </div>
            <p className="text-lg font-mono text-blue-300">{Math.round(progress)}%</p>
        </div>
    );
};