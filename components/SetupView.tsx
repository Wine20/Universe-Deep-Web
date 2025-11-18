import React, { useState, useEffect } from 'react';
import { getSystemInfo } from '../services/systemHardwareService';
import type { HardwareComponent } from '../types';
import { SetupIcon, DriverIcon, OptimizeIcon } from './Icons';

const SkeletonLoader: React.FC = () => (
    <div className="w-full h-6 bg-gray-700 rounded-md animate-pulse"></div>
);

export const SetupView: React.FC = () => {
    const [systemInfo, setSystemInfo] = useState<HardwareComponent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getSystemInfo().then(data => {
            setSystemInfo(data);
            setIsLoading(false);
        });
    }, []);

    const getComponent = (type: HardwareComponent['type']) => {
        return systemInfo.find(c => c.type === type)?.name || 'Não detectado';
    };
    
    const outdatedDriversCount = systemInfo.filter(c => c.driver.status === 'outdated').length;

    return (
        <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-200 flex items-center mb-6">
                <SetupIcon className="h-7 w-7 mr-3" />Setup e Informações do Sistema
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* System Specs */}
                <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-300 mb-3 border-b border-gray-700 pb-2">Especificações do Hardware</h3>
                    {isLoading ? (
                        <ul className="space-y-3 text-sm">
                           {Array.from({length: 5}).map((_, i) => <li key={i}><SkeletonLoader /></li>)}
                        </ul>
                    ) : (
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between"><span className="text-gray-400">CPU:</span> <span className="font-mono">{getComponent('CPU')}</span></li>
                            <li className="flex justify-between"><span className="text-gray-400">Placa de Vídeo:</span> <span className="font-mono">{getComponent('GPU')}</span></li>
                            <li className="flex justify-between"><span className="text-gray-400">Placa-mãe:</span> <span className="font-mono">{getComponent('Motherboard')}</span></li>
                            <li className="flex justify-between"><span className="text-gray-400">Áudio:</span> <span className="font-mono">{getComponent('Audio')}</span></li>
                            <li className="flex justify-between"><span className="text-gray-400">Rede:</span> <span className="font-mono">{getComponent('Network')}</span></li>
                        </ul>
                    )}
                </div>

                {/* System Actions */}
                <div className="bg-gray-900/50 p-4 rounded-lg">
                     <h3 className="text-lg font-semibold text-blue-300 mb-3 border-b border-gray-700 pb-2">Ações do Sistema</h3>
                     <div className="space-y-3">
                        <button className="w-full bg-blue-600/80 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                            <DriverIcon className="h-5 w-5"/>
                            <span>Verificar Drivers</span>
                        </button>
                        <button className="w-full bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                            <OptimizeIcon />
                            <span>Otimizar Sistema</span>
                        </button>
                         <button className="w-full bg-gray-700/80 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-not-allowed opacity-60">
                            <span>Instalar Software Essencial</span>
                        </button>
                     </div>
                </div>
            </div>

            <div className="mt-6 bg-gray-900/50 p-4 rounded-lg text-center">
                 <h3 className="text-lg font-semibold text-blue-300 mb-2">Status Geral</h3>
                 {isLoading ? (
                     <div className="w-3/4 h-5 mx-auto bg-gray-700 rounded-md animate-pulse"></div>
                 ) : (
                    <p className="text-gray-300">
                        Sistema operando normalmente. 
                        <span className={outdatedDriversCount > 0 ? 'text-yellow-400 font-bold' : 'text-green-400'}>
                            {` ${outdatedDriversCount} driver(s) `}
                        </span> 
                        precisa(m) de atenção.
                    </p>
                 )}
            </div>
        </div>
    );
};