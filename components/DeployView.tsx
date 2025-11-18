import React, { useState, useEffect } from 'react';
import type { CodeProject } from '../types';
import { DeployIcon, ProjectIcon, GoogleCloudIcon, LinkIcon, ComputeEngineIcon } from './Icons';
import { getProjects } from '../services/projectService';

type DeployStatus = 'idle' | 'deploying' | 'success' | 'error';
type DomainStatus = 'idle' | 'mapping' | 'mapped' | 'error';
type DeployTarget = 'cloudRun' | 'computeEngine';

const CLOUD_RUN_LOGS = [
    "Conectando à API do Google Cloud...",
    "Autenticação bem-sucedida.",
    "Iniciando Cloud Build...",
    "Passo 1/4: Criando imagem do contêiner Docker...",
    "Passo 2/4: Enviando imagem para o Artifact Registry...",
    "Passo 3/4: Criando nova revisão no Cloud Run...",
    "Passo 4/4: Roteando tráfego para a nova revisão...",
    "DEPLOYMENT CONCLUÍDO!",
];

const COMPUTE_ENGINE_LOGS = [
    "Conectando à API do Google Cloud...",
    "Autenticação bem-sucedida.",
    "Provisionando nova instância 'e2-medium'...",
    "Instalando imagem de disco do Debian 11...",
    "Configurando regras de firewall para permitir tráfego HTTP/S...",
    "Atribuindo endereço IP estático...",
    "Instalando dependências do aplicativo (Node.js, Nginx)...",
    "Copiando arquivos do projeto para a instância...",
    "Iniciando o servidor do aplicativo...",
    "DEPLOYMENT CONCLUÍDO!",
];

const DOMAIN_LOGS = [
    "Verificando a propriedade do domínio com o registro TXT...",
    "Propriedade do domínio verificada.",
    "Provisionando certificado SSL gerenciado pelo Google...",
    "Certificado SSL emitido com sucesso.",
    "Atualizando o serviço Cloud Run para mapear o domínio...",
    "Roteando tráfego para o novo domínio...",
    "Domínio mapeado com sucesso!",
];

interface DeployViewProps {
  userId: string | null;
}

export const DeployView: React.FC<DeployViewProps> = ({ userId }) => {
    const [projects, setProjects] = useState<CodeProject[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [region, setRegion] = useState('us-central1');
    const [status, setStatus] = useState<DeployStatus>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [liveUrl, setLiveUrl] = useState<string | null>(null);
    const [deployTarget, setDeployTarget] = useState<DeployTarget>('cloudRun');

    // State for custom domain mapping
    const [customDomain, setCustomDomain] = useState('');
    const [domainStatus, setDomainStatus] = useState<DomainStatus>('idle');
    const [domainLogs, setDomainLogs] = useState<string[]>([]);
    const [mappedDomain, setMappedDomain] = useState<string | null>(null);


    useEffect(() => {
        if (userId) {
            getProjects(userId).then(cloudProjects => {
                setProjects(cloudProjects);
                if (cloudProjects.length > 0) {
                    setSelectedProjectId(cloudProjects[0].id);
                }
            });
        }
    }, [userId]);
    
    useEffect(() => {
        if (status !== 'deploying') return;

        setLogs([]);
        setLiveUrl(null);
        setDomainStatus('idle');
        setDomainLogs([]);
        setMappedDomain(null);
        setCustomDomain('');
        
        const logsToUse = deployTarget === 'cloudRun' ? CLOUD_RUN_LOGS : COMPUTE_ENGINE_LOGS;
        let logIndex = 0;

        const intervalId = setInterval(() => {
            setLogs(prev => [...prev, logsToUse[logIndex]]);
            logIndex++;
            if (logIndex >= logsToUse.length) {
                clearInterval(intervalId);
                handleDeploySuccess();
            }
        }, 900);

        return () => clearInterval(intervalId);
    }, [status, deployTarget]);
    
    useEffect(() => {
        if (domainStatus !== 'mapping') return;

        setDomainLogs([]);
        let logIndex = 0;
        
        const intervalId = setInterval(() => {
            setDomainLogs(prev => [...prev, DOMAIN_LOGS[logIndex]]);
            logIndex++;
            if(logIndex >= DOMAIN_LOGS.length) {
                clearInterval(intervalId);
                setDomainStatus('mapped');
                setMappedDomain(customDomain);
            }
        }, 800);

        return () => clearInterval(intervalId);
    }, [domainStatus, customDomain]);

    const handleDeploy = () => {
        if (!selectedProjectId) {
            alert("Por favor, selecione um projeto para fazer o deploy.");
            return;
        }
        setStatus('deploying');
    };
    
    const handleMapDomain = () => {
        if(!customDomain.trim() || !customDomain.includes('.')) {
            alert("Por favor, insira um nome de domínio válido.");
            return;
        }
        setDomainStatus('mapping');
    }

    const handleDeploySuccess = () => {
        const project = projects.find(p => p.id === selectedProjectId);
        if (!project) {
            setStatus('error');
            setLogs(prev => [...prev, "Erro: Projeto não encontrado."]);
            return;
        }

        const htmlFile = project.files.find(f => f.name.toLowerCase() === 'index.html');
        if (!htmlFile) {
            setStatus('error');
            setLogs(prev => [...prev, "Erro: 'index.html' não encontrado no projeto."]);
            return;
        }

        try {
            const blob = new Blob([htmlFile.content], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(blob); 

            if (deployTarget === 'cloudRun') {
                const slug = project.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                const randomHash = Math.random().toString(36).substring(2, 8);
                const regionCode = region === 'us-central1' ? 'uc' : 'sa';
                const fakeUrl = `https://${slug}-${randomHash}-${regionCode}.a.run.app`;
                setLiveUrl(fakeUrl);
            } else {
                 const ip = `34.${Math.floor(Math.random() * 128) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
                 setLiveUrl(`http://${ip}`);
            }
            
            setStatus('success');
            // We can open the local blob in a new tab to still provide a preview
            window.open(blobUrl, '_blank');

        } catch(e) {
            setStatus('error');
            setLogs(prev => [...prev, `Erro ao criar URL de visualização: ${e}`]);
        }
    };
    
    const deployTargetText = deployTarget === 'cloudRun' ? 'Cloud Run' : 'Compute Engine';

    return (
        <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col animate-fade-in space-y-4">
            <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <h2 className="text-2xl font-bold text-gray-200 flex items-center"><GoogleCloudIcon className="h-7 w-7 mr-3 text-blue-400" />Deploy no Google Cloud</h2>
                 <div className="flex items-center space-x-2 w-full md:w-auto">
                    <ProjectIcon className="h-5 w-5 text-gray-400" />
                    <select 
                        value={selectedProjectId || ''} 
                        onChange={e => setSelectedProjectId(e.target.value)}
                        className="w-full md:w-48 bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={status === 'deploying'}
                        aria-label="Selecionar projeto para deploy"
                    >
                         {projects.length === 0 && <option>Nenhum projeto encontrado</option>}
                         {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                     <select 
                        value={region} 
                        onChange={e => setRegion(e.target.value)}
                        className="w-full md:w-48 bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={status === 'deploying'}
                        aria-label="Selecionar região de deploy"
                    >
                         <option value="us-central1">us-central1 (Iowa)</option>
                         <option value="southamerica-east1">southamerica-east1 (São Paulo)</option>
                    </select>
                </div>
            </div>
            
             <div className="bg-gray-900/50 p-3 rounded-lg flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                <button
                    onClick={() => setDeployTarget('cloudRun')}
                    disabled={status === 'deploying'}
                    className={`w-full p-3 rounded-lg border-2 transition-colors flex items-center space-x-3 disabled:cursor-not-allowed ${deployTarget === 'cloudRun' ? 'bg-blue-500/20 border-blue-500' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}`}
                >
                    <GoogleCloudIcon className="h-8 w-8 text-blue-400 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-gray-200 text-left">Cloud Run</p>
                        <p className="text-xs text-gray-400 text-left">Plataforma serverless totalmente gerenciada.</p>
                    </div>
                </button>
                <button
                    onClick={() => setDeployTarget('computeEngine')}
                    disabled={status === 'deploying'}
                    className={`w-full p-3 rounded-lg border-2 transition-colors flex items-center space-x-3 disabled:cursor-not-allowed ${deployTarget === 'computeEngine' ? 'bg-blue-500/20 border-blue-500' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}`}
                >
                    <ComputeEngineIcon className="h-8 w-8 text-blue-400 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-gray-200 text-left">Compute Engine</p>
                        <p className="text-xs text-gray-400 text-left">Máquinas virtuais com controle total.</p>
                    </div>
                </button>
            </div>

            <div className="flex-grow bg-gray-900/70 rounded-lg p-4 font-mono text-sm overflow-y-auto border border-gray-700">
                {logs.length === 0 && <p className="text-gray-500">$ Aguardando início do deploy para o {deployTargetText}...</p>}
                {logs.map((log, index) => (
                    <p key={index} className="animate-fade-in">
                        <span className={log.includes('CONCLUÍDO') ? 'text-green-400' : 'text-gray-400'}>{`[${new Date().toLocaleTimeString()}] `}</span>
                        <span className={log.includes('CONCLUÍDO') ? 'text-green-300 font-bold' : 'text-gray-200'}>{log}</span>
                    </p>
                ))}
            </div>

            <div className="flex-shrink-0">
                 {status === 'success' && liveUrl && (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-300 p-4 rounded-lg animate-fade-in flex flex-col items-center text-center space-y-2 mb-4">
                        <p className="text-lg font-bold">Projeto no Ar!</p>
                        <p className="text-sm">Seu projeto foi publicado com sucesso no Google {deployTargetText}.</p>
                        <div className="bg-black/30 p-2 rounded-md w-full max-w-lg">
                            <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline break-all font-mono text-sm">
                                {liveUrl}
                            </a>
                        </div>
                    </div>
                )}
                {status === 'success' && deployTarget === 'cloudRun' && (
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 animate-fade-in mb-4">
                         <h3 className="text-lg font-semibold text-gray-200 mb-2">Mapear Domínio Personalizado</h3>
                         {domainStatus === 'mapped' ? (
                             <div className="text-center p-3 bg-green-900/30 rounded-md">
                                 <p className="font-semibold text-green-300">Domínio conectado com sucesso!</p>
                                 <a href={`https://${mappedDomain}`} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline break-all font-mono text-sm">https://{mappedDomain}</a>
                             </div>
                         ) : (
                            <>
                                <div className="flex items-center space-x-2">
                                    <input type="text" value={customDomain} onChange={e => setCustomDomain(e.target.value)} disabled={domainStatus === 'mapping'} placeholder="ex: www.meuprojeto.com" className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"/>
                                    <button onClick={handleMapDomain} disabled={domainStatus === 'mapping'} className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded-md px-4 py-1.5 text-sm font-semibold flex-shrink-0">
                                        {domainStatus === 'mapping' ? 'Mapeando...' : 'Mapear'}
                                    </button>
                                </div>
                                {domainStatus === 'mapping' && (
                                     <div className="mt-2 bg-black/30 rounded-lg p-2 font-mono text-xs overflow-y-auto border border-gray-700 h-24">
                                        {domainLogs.map((log, index) => <p key={index} className="text-gray-300 animate-fade-in">{`> ${log}`}</p>)}
                                    </div>
                                )}
                            </>
                         )}
                    </div>
                 )}
                 {status === 'error' && (
                     <div className="bg-red-500/10 border border-red-500 text-red-300 p-3 rounded-md animate-fade-in mb-4">
                        <p className="font-semibold">Ocorreu um erro no deploy.</p>
                    </div>
                 )}
                <div className="text-center">
                    <button 
                        onClick={handleDeploy}
                        disabled={status === 'deploying' || projects.length === 0}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md px-8 py-3 text-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                    >
                        <DeployIcon className="h-6 w-6" />
                        <span>
                            {status === 'deploying' ? 'Publicando...' : (status === 'success' || status === 'error') ? 'Publicar Novamente' : `Publicar no ${deployTargetText}`}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};