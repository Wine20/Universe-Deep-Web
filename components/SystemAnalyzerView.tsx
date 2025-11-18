import React, { useState, useEffect } from 'react';
import type { Intent } from '../types';
import { SystemAnalyzerIcon, CleanIcon, OptimizeIcon, ShieldIcon, ProcessingIcon, NetworkIcon, DownloadIcon } from './Icons';

type AnalysisType = 'STORAGE' | 'PERFORMANCE' | 'SECURITY';

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
        }`}
    >
        {children}
    </button>
);

const InfoCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-800/50 p-3 rounded-lg flex items-center space-x-3">
        <div className="text-blue-400">{icon}</div>
        <div>
            <p className="text-xs text-gray-400">{title}</p>
            <p className="font-semibold text-gray-200">{value}</p>
        </div>
    </div>
);

export const SystemAnalyzerView: React.FC<{ initialAnalysis: Intent | null }> = ({ initialAnalysis }) => {
    const [activeTab, setActiveTab] = useState<AnalysisType>('STORAGE');
    const [isLoading, setIsLoading] = useState(true);
    const [storageInfo, setStorageInfo] = useState<{ usage: number, quota: number } | null>(null);
    const [performanceInfo, setPerformanceInfo] = useState<any | null>(null);
    const [securityInfo, setSecurityInfo] = useState<any | null>(null);

    useEffect(() => {
        const intentMap: { [key in Intent]?: AnalysisType } = {
            CLEAN: 'STORAGE',
            OPTIMIZE: 'PERFORMANCE',
            SCAN_VIRUS: 'SECURITY'
        };
        if (initialAnalysis && intentMap[initialAnalysis]) {
            setActiveTab(intentMap[initialAnalysis]!);
        }
    }, [initialAnalysis]);
    
    useEffect(() => {
        const analyze = async () => {
            setIsLoading(true);

            // Storage Analysis
            if (navigator.storage && navigator.storage.estimate) {
                const estimate = await navigator.storage.estimate();
                setStorageInfo({ usage: estimate.usage || 0, quota: estimate.quota || 0 });
            }

            // Performance Analysis
            setPerformanceInfo({
                cpu: `${navigator.hardwareConcurrency || 'N/A'} núcleos`,
                // @ts-ignore
                ram: `${navigator.deviceMemory || 'N/A'} GB`,
                networkType: (navigator as any).connection?.effectiveType || 'N/A',
                networkSpeed: `${(navigator as any).connection?.downlink || 0} Mbps`,
            });
            
            // Security Analysis
            setSecurityInfo({
                isSecureContext: window.isSecureContext,
                userAgent: navigator.userAgent,
            });
            
            setIsLoading(false);
        };
        analyze();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <ProcessingIcon />
                    <p className="mt-4 text-gray-400">Analisando seu sistema...</p>
                </div>
            );
        }
        
        switch (activeTab) {
            case 'STORAGE':
                const usagePercent = storageInfo ? (storageInfo.usage / storageInfo.quota) * 100 : 0;
                return (
                    <div className="animate-fade-in p-4 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-200">Análise de Armazenamento do Navegador</h3>
                        {storageInfo ? (
                             <div className="text-center">
                                <p className="text-4xl font-bold text-blue-300">{formatBytes(storageInfo.usage)}</p>
                                <p className="text-gray-400">usados de {formatBytes(storageInfo.quota)}</p>
                                <div className="w-full bg-gray-700 rounded-full h-2.5 my-3">
                                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${usagePercent}%` }}></div>
                                </div>
                             </div>
                        ) : <p className="text-gray-500">A API de estimativa de armazenamento não é suportada neste navegador.</p>}
                        <div className="text-xs text-gray-500 text-center">
                           Isso inclui cache, cookies e outros dados que os sites armazenam para melhorar sua experiência.
                        </div>
                    </div>
                );
            case 'PERFORMANCE':
                 return (
                    <div className="animate-fade-in p-4 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-200">Informações de Desempenho</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <InfoCard title="Núcleos de CPU" value={performanceInfo.cpu} icon={<OptimizeIcon className="h-6 w-6"/>} />
                            <InfoCard title="Memória do Dispositivo" value={performanceInfo.ram} icon={<div className="h-6 w-6">💾</div>} />
                            <InfoCard title="Tipo de Rede" value={performanceInfo.networkType} icon={<NetworkIcon className="h-6 w-6"/>} />
                            <InfoCard title="Velocidade (Downlink)" value={performanceInfo.networkSpeed} icon={<DownloadIcon />} />
                        </div>
                         <div className="text-xs text-gray-500 text-center pt-2">
                           Estes dados são fornecidos pelo seu navegador e podem ser estimativas.
                        </div>
                    </div>
                );
            case 'SECURITY':
                return (
                    <div className="animate-fade-in p-4 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-200">Verificação de Segurança do Navegador</h3>
                        <div className="space-y-3">
                             <div className={`p-3 rounded-lg flex items-center space-x-3 ${securityInfo.isSecureContext ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                                <ShieldIcon className="h-6 w-6" />
                                <div>
                                    <p className="font-semibold">{securityInfo.isSecureContext ? 'Conexão Segura (HTTPS)' : 'Conexão Insegura (HTTP)'}</p>
                                    <p className="text-xs">{securityInfo.isSecureContext ? 'Sua conexão com este site é criptografada.' : 'Recursos como o microfone podem não funcionar.'}</p>
                                </div>
                            </div>
                             <div className="p-3 rounded-lg bg-gray-800/50">
                                <p className="text-xs text-gray-400">Seu Navegador (User Agent)</p>
                                <p className="text-xs font-mono text-gray-300 mt-1">{securityInfo.userAgent}</p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-200 flex items-center mb-4 flex-shrink-0">
                <SystemAnalyzerIcon className="h-7 w-7 mr-3" />
                Analisador de Sistema
            </h2>
            
            <div className="flex-shrink-0 flex items-center justify-center space-x-2 bg-gray-800/50 p-1 rounded-lg mb-4">
                <TabButton active={activeTab === 'STORAGE'} onClick={() => setActiveTab('STORAGE')}>Armazenamento</TabButton>
                <TabButton active={activeTab === 'PERFORMANCE'} onClick={() => setActiveTab('PERFORMANCE')}>Desempenho</TabButton>
                <TabButton active={activeTab === 'SECURITY'} onClick={() => setActiveTab('SECURITY')}>Segurança</TabButton>
            </div>
            
            <div className="flex-grow bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};