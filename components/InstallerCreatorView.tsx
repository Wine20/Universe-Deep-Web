import React, { useState, useEffect } from 'react';
import type { CodeProject } from '../types';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { InstallerIcon, DeployIcon } from './Icons';

const STORAGE_KEY = 'bluewhite_code_projects';
const DEPLOY_LOGS = [
    "Iniciando processo de build...",
    "Validando manifestos do projeto...",
    "Compilando código-fonte para a plataforma de destino...",
    "Empacotando assets e recursos...",
    "Assinando digitalmente o executável...",
    "Compressão do pacote final...",
    "Instalador criado com sucesso!",
];

export const InstallerCreatorView: React.FC = () => {
    const [projects, setProjects] = useState<CodeProject[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [platforms, setPlatforms] = useState({ windows: true, macos: false, linux: false });
    const [status, setStatus] = useState<'idle' | 'building' | 'success'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    
    const { isInstallable, triggerInstall } = usePwaInstall();
    const [isPwaInstalled, setIsPwaInstalled] = useState(false);

    useEffect(() => {
        // Check if the app is already installed and running in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsPwaInstalled(true);
        }

        const savedProjects = localStorage.getItem(STORAGE_KEY);
        if (savedProjects) {
            const parsedProjects: CodeProject[] = JSON.parse(savedProjects);
            setProjects(parsedProjects);
            if (parsedProjects.length > 0) {
                setSelectedProjectId(parsedProjects[0].id);
            }
        }
    }, []);
    
    useEffect(() => {
        if (status !== 'building') return;

        setLogs([]);
        let logIndex = 0;

        const intervalId = setInterval(() => {
            setLogs(prev => [...prev, DEPLOY_LOGS[logIndex]]);
            logIndex++;
            if (logIndex >= DEPLOY_LOGS.length) {
                clearInterval(intervalId);
                setStatus('success');
            }
        }, 700);

        return () => clearInterval(intervalId);
    }, [status]);
    
    const handlePlatformChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setPlatforms(prev => ({ ...prev, [name]: checked }));
    };

    const handleCreateInstaller = () => {
        if (!selectedProjectId) {
            alert("Por favor, selecione um projeto.");
            return;
        }
        if (!platforms.windows && !platforms.macos && !platforms.linux) {
            alert("Por favor, selecione ao menos uma plataforma.");
            return;
        }
        setStatus('building');
    };
    
    const selectedProjectName = projects.find(p => p.id === selectedProjectId)?.name.replace(/\s+/g, '-') || 'projeto';

    return (
        <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col animate-fade-in space-y-4">
            <h2 className="text-2xl font-bold text-gray-200 flex items-center flex-shrink-0">
                <InstallerIcon className="h-7 w-7 mr-3" />Criador de Instalador & PWA
            </h2>
            
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                {/* Desktop Installer */}
                <div className="bg-gray-900/50 p-4 rounded-lg flex flex-col">
                    <h3 className="text-lg font-semibold text-blue-300 mb-3 border-b border-gray-700 pb-2">Instalador Desktop (Simulação)</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-400">Selecione o Projeto</label>
                            <select 
                                value={selectedProjectId || ''} 
                                onChange={e => setSelectedProjectId(e.target.value)}
                                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={status === 'building'}
                            >
                                {projects.length === 0 && <option>Nenhum projeto encontrado</option>}
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-400">Plataformas de Destino</label>
                            <div className="mt-2 space-y-2">
                                {['windows', 'macos', 'linux'].map(p => (
                                    <label key={p} className="flex items-center">
                                        <input type="checkbox" name={p} checked={platforms[p as keyof typeof platforms]} onChange={handlePlatformChange} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500" />
                                        <span className="ml-2 text-sm text-gray-300 capitalize">{p} ({p === 'windows' ? '.exe' : p === 'macos' ? '.dmg' : '.deb'})</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleCreateInstaller}
                        disabled={status === 'building' || projects.length === 0}
                        className="mt-auto w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg py-3 font-semibold transition-colors"
                    >
                        {status === 'building' ? 'Criando...' : 'Criar Instalador'}
                    </button>
                </div>
                
                {/* Logs & PWA */}
                <div className="bg-gray-900/50 p-4 rounded-lg flex flex-col">
                     {status === 'idle' ? (
                        <>
                             <h3 className="text-lg font-semibold text-blue-300 mb-3 border-b border-gray-700 pb-2">Progressive Web App (PWA)</h3>
                            <div className="text-center flex flex-col items-center justify-center flex-grow">
                                <DeployIcon className="h-12 w-12 text-blue-400 mb-3" />
                                <p className="text-sm text-gray-400 mb-4">
                                    Instale o Bluewhite AI como um aplicativo no seu dispositivo para acesso rápido e uma experiência integrada.
                                </p>
                                {isPwaInstalled ? (
                                    <p className="font-semibold text-green-400">Aplicativo já instalado!</p>
                                ) : isInstallable ? (
                                    <button onClick={triggerInstall} className="bg-green-600 hover:bg-green-500 rounded-lg px-6 py-3 font-semibold">Instalar Aplicativo</button>
                                ) : (
                                    <p className="text-sm text-gray-500">A instalação não está disponível neste navegador ou já foi dispensada.</p>
                                )}
                            </div>
                        </>
                    ) : (
                         <>
                            <h3 className="text-lg font-semibold text-blue-300 mb-3 border-b border-gray-700 pb-2">Log de Build</h3>
                            <div className="flex-grow bg-black/30 rounded-lg p-2 font-mono text-xs overflow-y-auto border border-gray-700">
                                {logs.map((log, index) => (
                                    <p key={index} className="animate-fade-in text-gray-300">{`> ${log}`}</p>
                                ))}
                                {status === 'success' && <p className="font-bold text-green-400 animate-fade-in">> BUILD COMPLETO</p>}
                            </div>
                            {status === 'success' && (
                                <div className="mt-3 animate-fade-in">
                                    <h4 className="text-sm font-semibold text-gray-300">Downloads:</h4>
                                    <ul className="text-sm mt-1 space-y-1">
                                        {platforms.windows && <li><a href="#" onClick={e=>e.preventDefault()} className="text-blue-400 hover:underline">{selectedProjectName}-setup.exe</a></li>}
                                        {platforms.macos && <li><a href="#" onClick={e=>e.preventDefault()} className="text-blue-400 hover:underline">{selectedProjectName}.dmg</a></li>}
                                        {platforms.linux && <li><a href="#" onClick={e=>e.preventDefault()} className="text-blue-400 hover:underline">{selectedProjectName}.deb</a></li>}
                                    </ul>
                                </div>
                            )}
                         </>
                    )}
                </div>
            </div>
        </div>
    );
};