import React, { useState, useEffect } from 'react';
import { getSystemInfo, installDriver } from '../services/systemHardwareService';
import type { HardwareComponent } from '../types';
import { DriverIcon, ProcessingIcon } from './Icons';

type InstallationStatus = {
    [key: string]: 'installing' | 'success' | 'failed' | null;
}

const StatusBadge: React.FC<{ status: 'up_to_date' | 'outdated' }> = ({ status }) => {
    if (status === 'up_to_date') {
        return <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full bg-green-900 text-green-300">Atualizado</span>;
    }
    return <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full bg-yellow-900 text-yellow-300">Desatualizado</span>;
}

export const DriversView: React.FC = () => {
    const [hardware, setHardware] = useState<HardwareComponent[]>([]);
    const [isScanning, setIsScanning] = useState(true);
    const [installationStatus, setInstallationStatus] = useState<InstallationStatus>({});

    useEffect(() => {
        setIsScanning(true);
        getSystemInfo().then(data => {
            setHardware(data);
            setIsScanning(false);
        });
    }, []);

    const handleInstall = async (component: HardwareComponent) => {
        setInstallationStatus(prev => ({ ...prev, [component.id]: 'installing' }));
        try {
            const result = await installDriver(component.driver.id);
            if(result.success) {
                setInstallationStatus(prev => ({ ...prev, [component.id]: 'success' }));
                // Update the local state to reflect the "update"
                setHardware(prevHardware => prevHardware.map(hw => 
                    hw.id === component.id 
                        ? { ...hw, driver: { ...hw.driver, status: 'up_to_date', version: result.newVersion || hw.driver.version } } 
                        : hw
                ));
            } else {
                 setInstallationStatus(prev => ({ ...prev, [component.id]: 'failed' }));
            }
        } catch (error) {
            setInstallationStatus(prev => ({ ...prev, [component.id]: 'failed' }));
        }
    }


    return (
        <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col animate-fade-in">
            <div className="flex-shrink-0 flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-200 flex items-center">
                    <DriverIcon className="h-7 w-7 mr-3" />Gerenciador de Drivers
                </h2>
                {isScanning && (
                    <div className="flex items-center space-x-2 text-blue-300 animate-pulse">
                        <ProcessingIcon />
                        <span className="text-sm">Analisando...</span>
                    </div>
                )}
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
                 {isScanning && hardware.length === 0 ? (
                     <div className="w-full h-full flex flex-col items-center justify-center text-center">
                        <p className="text-gray-400">O Blue está identificando os componentes do seu sistema em segundo plano.</p>
                    </div>
                 ) : (
                    <ul className="space-y-3">
                        {hardware.map(component => (
                            <li key={component.id} className="bg-gray-900/50 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div>
                                    <h3 className="font-bold text-lg text-blue-300">{component.name}</h3>
                                    <p className="text-sm text-gray-400">Driver: {component.driver.name}</p>
                                    <p className="text-xs text-gray-500">Versão: {component.driver.version} | Data: {component.driver.releaseDate}</p>
                                </div>
                                <div className="flex items-center space-x-4 mt-3 md:mt-0">
                                    <StatusBadge status={component.driver.status} />
                                    {component.driver.status === 'outdated' && (
                                        <button 
                                            onClick={() => handleInstall(component)}
                                            disabled={installationStatus[component.id] === 'installing'}
                                            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md px-4 py-1.5 text-sm font-semibold transition-colors"
                                        >
                                            {installationStatus[component.id] === 'installing' && <ProcessingIcon />}
                                            {installationStatus[component.id] !== 'installing' && 'Instalar'}
                                        </button>
                                    )}
                                    {installationStatus[component.id] === 'success' && (
                                        <span className="text-sm text-green-400">Instalado!</span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                 )}
            </div>
        </div>
    );
};