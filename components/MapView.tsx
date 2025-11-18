import React from 'react';
import type { MapResult } from '../types';
import { MapPinIcon, LinkIcon, BotIcon } from './Icons';

interface MapViewProps {
  result: MapResult | null;
  isLoading: boolean;
  error: string | null;
}

export const MapView: React.FC<MapViewProps> = ({ result, isLoading, error }) => {
    
    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center animate-fade-in space-y-4">
                <MapPinIcon className="h-16 w-16 text-blue-400 animate-bounce" />
                <h2 className="text-xl font-semibold text-gray-200">Buscando no mapa...</h2>
                <p className="text-gray-400">Aguarde enquanto procuro os melhores lugares para você.</p>
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center animate-fade-in space-y-4 p-4">
                <MapPinIcon className="h-16 w-16 text-red-400" />
                <h2 className="text-xl font-semibold text-red-300">Erro na Busca</h2>
                <p className="text-gray-400 max-w-md">{error}</p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center animate-fade-in space-y-4">
                <MapPinIcon className="h-16 w-16 text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-200">Explorador de Mapas</h2>
                <p className="text-gray-400">Use a conversa por voz para encontrar lugares perto de você.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col animate-fade-in space-y-4">
            <h2 className="text-2xl font-bold text-gray-200 flex items-center flex-shrink-0">
                <MapPinIcon className="h-7 w-7 mr-3" />
                Resultados do Mapa
            </h2>
            
            <div className="flex-grow flex flex-col space-y-4 overflow-y-auto pr-2">
                {/* AI Response Text */}
                {result.text && (
                     <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center self-start">
                            <BotIcon />
                        </div>
                        <div className="bg-gray-700 rounded-xl rounded-bl-none px-4 py-3">
                            <p className="text-white whitespace-pre-wrap">{result.text}</p>
                        </div>
                    </div>
                )}
                
                {/* Places List */}
                {result.places && result.places.length > 0 && (
                     <div>
                        <h3 className="text-lg font-semibold text-blue-300 mb-3 border-b border-gray-700 pb-2">Lugares Encontrados</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {result.places.map((place, index) => (
                                <a
                                    key={index}
                                    href={place.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-gray-800/70 p-3 rounded-lg flex items-center justify-between space-x-3 hover:bg-gray-700/90 transition-colors"
                                >
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        <MapPinIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                                        <span className="font-semibold text-gray-200 truncate">{place.title}</span>
                                    </div>
                                    <LinkIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};