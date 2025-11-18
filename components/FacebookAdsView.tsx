import React from 'react';
import { FacebookIcon } from './Icons';

const FACEBOOK_DOCS_URL = 'https://developers.facebook.com/docs/business-management-apis/business-manager/get-started#business';

export const FacebookAdsView: React.FC = () => {
    return (
        <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col items-center justify-center text-center animate-fade-in space-y-4">
            <FacebookIcon className="h-16 w-16 text-[#1877F2]" />
            <h2 className="text-2xl font-bold text-gray-200">Facebook Business Manager</h2>
            <p className="text-gray-400 max-w-md">
                Conecte-se à sua conta do Facebook Business para gerenciar campanhas de anúncios, analisar o desempenho e acessar seus ativos de negócios.
            </p>
            <p className="text-xs text-yellow-400/80 max-w-md bg-yellow-900/20 border border-yellow-500/30 p-2 rounded-md">
                Esta é uma visualização de espaço reservado. A integração completa com a API do Facebook Business Manager está em desenvolvimento.
            </p>
            <a
                href={FACEBOOK_DOCS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 rounded-lg px-6 py-3 font-semibold text-lg transition-colors mt-4"
            >
                <span>Acessar Documentação</span>
            </a>
        </div>
    );
};
