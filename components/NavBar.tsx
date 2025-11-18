import React, { useState, useRef, useEffect } from 'react';
import type { AppMode } from '../types';
import { AssistantIcon, BrowserIcon, CodeIcon, NetworkIcon, DeployIcon, FileExplorerIcon, DriverIcon, SetupIcon, ScriptIcon, MenuIcon, EmailIcon, DocumentReaderIcon, VoiceChatIcon, InstallerIcon, CalendarIcon, ChartBarIcon, FacebookIcon, SystemAnalyzerIcon, MapPinIcon } from './Icons';

interface NavBarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  disabled?: boolean;
}

interface MenuItem {
    mode: AppMode;
    label: string;
    icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
    { mode: 'ASSISTANT', label: 'Assistente', icon: <AssistantIcon className="h-5 w-5" /> },
    { mode: 'VOICE_CHAT', label: 'Conversa por Voz', icon: <VoiceChatIcon className="h-5 w-5" /> },
    { mode: 'CALENDAR', label: 'Calendário', icon: <CalendarIcon className="h-5 w-5" /> },
    { mode: 'EMAIL', label: 'Email', icon: <EmailIcon className="h-5 w-5" /> },
    { mode: 'ANALYZER', label: 'Analisador de Arquivos', icon: <DocumentReaderIcon className="h-5 w-5" /> },
    { mode: 'SYSTEM_ANALYZER', label: 'Analisador de Sistema', icon: <SystemAnalyzerIcon className="h-5 w-5" /> },
    { mode: 'MAP', label: 'Mapa', icon: <MapPinIcon className="h-5 w-5" /> },
    { mode: 'FILE_EXPLORER', label: 'Arquivos', icon: <FileExplorerIcon className="h-5 w-5" /> },
    { mode: 'DRIVERS', label: 'Drivers', icon: <DriverIcon className="h-5 w-5" /> },
    { mode: 'SETUP', label: 'Setup', icon: <SetupIcon className="h-5 w-5" /> },
    { mode: 'SCRIPT_WRITER', label: 'Roteiro', icon: <ScriptIcon className="h-5 w-5" /> },
    { mode: 'BROWSER', label: 'Navegador', icon: <BrowserIcon className="h-5 w-5" /> },
    { mode: 'CODE_EDITOR', label: 'Editor', icon: <CodeIcon className="h-5 w-5" /> },
    { mode: 'NETWORK', label: 'Rede', icon: <NetworkIcon className="h-5 w-5" /> },
    { mode: 'DEPLOY', label: 'Deploy', icon: <DeployIcon className="h-5 w-5" /> },
    { mode: 'ADMOB', label: 'Monetização', icon: <ChartBarIcon className="h-5 w-5" /> },
    { mode: 'FACEBOOK_ADS', label: 'Facebook Ads', icon: <FacebookIcon className="h-5 w-5" /> },
    { mode: 'INSTALLER_CREATOR', label: 'Instalador', icon: <InstallerIcon className="h-5 w-5" /> },
];

export const NavBar: React.FC<NavBarProps> = ({ currentMode, onModeChange, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const activeItem = menuItems.find(item => item.mode === currentMode);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleItemClick = (mode: AppMode) => {
        onModeChange(mode);
        setIsOpen(false);
    }
    
    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className="flex items-center justify-between w-full sm:w-64 space-x-2 p-2 rounded-lg transition-colors duration-200 bg-black/20 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:text-gray-500 disabled:cursor-not-allowed"
                aria-label="Abrir menu de navegação"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <div className="flex items-center space-x-2">
                    {activeItem?.icon}
                    <span className="font-medium text-sm text-blue-200">{activeItem?.label}</span>
                </div>
                <MenuIcon className="h-5 w-5 text-gray-400" />
            </button>
            
            {isOpen && (
                <div className="origin-top-right absolute right-0 sm:right-auto sm:left-0 mt-2 w-full sm:w-64 rounded-md shadow-lg py-1 bg-gray-800 ring-1 ring-black ring-opacity-5 z-20 animate-fade-in">
                    <div className="grid grid-cols-1 gap-1 p-1">
                        {menuItems.map(item => (
                             <button
                                key={item.mode}
                                onClick={() => handleItemClick(item.mode)}
                                className={`w-full text-left flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors
                                    ${currentMode === item.mode
                                        ? 'bg-blue-500/30 text-blue-200 font-semibold'
                                        : 'text-gray-300 hover:bg-gray-700/80 hover:text-white'
                                    }`
                                }
                             >
                                 {item.icon}
                                 <span>{item.label}</span>
                             </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};