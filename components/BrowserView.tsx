import React, { useState } from 'react';
import { BrowserIcon, InstallerIcon } from './Icons';
import { usePwaInstall } from '../hooks/usePwaInstall';

interface BrowserViewProps {
  onSearch: (query: string) => void;
}

export const BrowserView: React.FC<BrowserViewProps> = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { isInstallable, triggerInstall } = usePwaInstall();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearch(searchQuery.trim());
        }
    };

    return (
        <div className="w-full h-full bg-black/20 rounded-lg p-4 flex flex-col items-center justify-center text-center animate-fade-in space-y-4">
            <BrowserIcon className="h-20 w-20 text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-200">Navegador Web</h2>
            <p className="text-gray-400 max-w-md">
                Peça-me para pesquisar algo ou abrir um site. <br />
                Abrirei sites em uma <span className="font-semibold text-blue-300">nova aba</span> para garantir a melhor compatibilidade.
            </p>
            <form onSubmit={handleSearch} className="w-full max-w-lg flex items-center space-x-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Pesquise com o Blue ou diga 'abrir google.com'"
                    aria-label="Campo de pesquisa"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 rounded-md px-5 py-2 text-sm font-semibold">
                    Pesquisar
                </button>
            </form>
            <div className="mt-6">
                {isInstallable && (
                    <button
                        onClick={triggerInstall}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-500 rounded-lg px-5 py-3 text-sm font-semibold transition-colors animate-fade-in"
                    >
                        <InstallerIcon className="h-5 w-5" />
                        <span>Instalar Blue no seu Desktop</span>
                    </button>
                )}
            </div>
        </div>
    );
};