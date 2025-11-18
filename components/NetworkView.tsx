import React, { useState, useEffect } from 'react';
import { NetworkIcon, ProcessingIcon } from './Icons';

type ConnectionStatus = 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'failed';

const SERVERS_DATA = [
    { name: 'Rede Pública Gratuita', signal: 95 },
    { name: 'Wi-Fi do Café Central', signal: 82 },
    { name: 'Internet da Biblioteca', signal: 75 },
    { name: 'Sinal Aberto Vizinho', signal: 45 },
];
const BLUE_RELAY = { name: 'Bluewhite Private Relay', signal: 100 };

const SignalStrength: React.FC<{ strength: number }> = ({ strength }) => {
    const bars = 4;
    const activeBars = Math.round((strength / 100) * bars);
    return (
        <div className="flex items-end space-x-0.5 h-4">
            {Array.from({ length: bars }).map((_, i) => (
                <div 
                    key={i} 
                    className={`w-1 ${i < activeBars ? 'bg-blue-400' : 'bg-gray-600'}`}
                    style={{ height: `${(i + 1) * 25}%` }}
                ></div>
            ))}
        </div>
    );
};

export const NetworkView: React.FC = () => {
    const [servers, setServers] = useState<(typeof SERVERS_DATA[0])[]>([]);
    const [selectedServer, setSelectedServer] = useState<string | null>(null);
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (status === 'disconnected') {
            setStatus('scanning');
            // Simulate scanning for networks
            setTimeout(() => {
                setServers([BLUE_RELAY, ...SERVERS_DATA]);
                setStatus('disconnected'); // Back to idle but with servers loaded
            }, 2500);
        }
    }, []);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (status === 'connecting') {
            setProgress(0);
            timer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(timer);
                        setStatus('connected');
                        return 100;
                    }
                    return prev + Math.random() * 10;
                });
            }, 300);
        }
        return () => clearInterval(timer);
    }, [status]);

    const handleConnect = (serverName: string) => {
        setSelectedServer(serverName);
        setStatus('connecting');
    };
    
    const handleDisconnect = () => {
        setSelectedServer(null);
        setStatus('disconnected');
        setProgress(0);
    }
    
    const renderScanningView = () => (
        <div className="flex flex-col items-center justify-center h-full text-center">
             <div className="relative flex items-center justify-center mb-6">
                <div className="absolute w-24 h-24 bg-blue-500/20 rounded-full animate-ping"></div>
                <NetworkIcon className="h-16 w-16 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Procurando redes...</h3>
            <p className="text-gray-400">O Blue está escaneando por pontos de acesso à internet.</p>
        </div>
    );

    const renderContent = () => {
        if (status === 'scanning') {
            return renderScanningView();
        }
        
        if (status === 'connecting' || status === 'connected') {
            const isBlueRelay = selectedServer === BLUE_RELAY.name;
            return (
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">
                        {status === 'connecting' ? 'Conectando a' : 'Conectado a'} <span className="text-blue-400">{selectedServer}</span>
                    </h3>
                    <p className="text-gray-400 mb-6">
                        {isBlueRelay
                            ? "Conexão segura estabelecida através dos servidores privados do Blue."
                            : (status === 'connecting' ? 'Estabelecendo conexão segura...' : 'Conexão estabelecida com sucesso!')
                        }
                    </p>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                        <div 
                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-linear" 
                            style={{ width: `${progress}%` }}>
                        </div>
                    </div>
                    <p className="text-lg font-mono text-blue-300 mb-6">{Math.round(progress)}%</p>
                    {status === 'connected' && (
                        <div className="animate-fade-in text-left bg-black/20 p-4 rounded-lg">
                            <p><span className="font-semibold text-gray-300">Status:</span> <span className="text-green-400">Ativo</span></p>
                            <p><span className="font-semibold text-gray-300">Endereço IP:</span> {isBlueRelay ? '10.0.8.1' : '192.168.0.104'}</p>
                            <p><span className="font-semibold text-gray-300">Velocidade:</span> {isBlueRelay ? '1.8 Gbps' : '78.5 Mbps'}</p>
                        </div>
                    )}
                     <button onClick={handleDisconnect} className="mt-6 bg-red-600 hover:bg-red-500 rounded-md px-4 py-2 text-sm font-semibold">
                        Desconectar
                    </button>
                </div>
            );
        }

        return (
            <>
                <h3 className="text-xl font-semibold mb-4 text-center">Servidores de Internet Encontrados</h3>
                <ul className="space-y-2">
                    {servers.map(server => (
                        <li key={server.name} className={`p-3 rounded-lg flex justify-between items-center ${server.name === BLUE_RELAY.name ? 'bg-blue-900/50 border border-blue-500/50' : 'bg-gray-800/50'}`}>
                            <div className="flex items-center space-x-3">
                                <NetworkIcon className={`h-5 w-5 ${server.name === BLUE_RELAY.name ? 'text-blue-300' : 'text-blue-400'}`} />
                                <span className={server.name === BLUE_RELAY.name ? 'font-bold text-blue-300' : ''}>{server.name}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <SignalStrength strength={server.signal} />
                                <button onClick={() => handleConnect(server.name)} className="bg-blue-600 hover:bg-blue-500 rounded-md px-3 py-1 text-sm font-semibold">
                                    Conectar
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </>
        );
    }

    return (
        <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col animate-fade-in">
            <div className="flex-grow">
                {renderContent()}
            </div>
        </div>
    );
};