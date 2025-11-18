import React, { useState, useRef, useEffect } from 'react';
import { LogoutIcon, InstallerIcon } from './Icons';
import { usePwaInstall } from '../hooks/usePwaInstall';

interface UserMenuProps {
  onLogout: () => void;
  userName: string | null;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onLogout, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isInstallable, triggerInstall } = usePwaInstall();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadExtension = () => {
    alert("Simulação de Download\n\nEsta funcionalidade ainda está em desenvolvimento. No futuro, você poderá baixar uma extensão do Blue para acesso rápido diretamente do seu navegador!");
    setIsOpen(false);
  }

  const handleInstallClick = () => {
    triggerInstall();
    setIsOpen(false);
  };

  const getUserInitial = () => {
    if (!userName) return '?';
    const parts = userName.split(' ');
    if (parts.length > 1 && parts[parts.length - 1]) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  };


  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white font-bold text-lg">
        {userName ? getUserInitial() : (
            <img
            className="h-10 w-10 rounded-full"
            src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
            alt="User Avatar"
            />
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-gray-800 ring-1 ring-black ring-opacity-5 z-10 animate-fade-in">
           {userName && (
                <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm text-gray-300">Olá,</p>
                    <p className="text-sm font-medium text-white truncate">{userName}</p>
                </div>
            )}
            {isInstallable && (
                 <button
                    onClick={handleInstallClick}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-green-400 hover:bg-gray-700"
                  >
                    <InstallerIcon className="mr-2 h-5 w-5" />
                    Instalar Aplicativo
                </button>
            )}
          <button
            onClick={handleDownloadExtension}
            className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
          >
            Baixar Extensão
          </button>
          <button
            onClick={onLogout}
            className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
          >
            <LogoutIcon className="mr-2" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
};