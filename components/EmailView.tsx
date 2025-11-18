import React, { useState, useEffect } from 'react';
import { getEmails } from '../services/emailService';
import type { Email } from '../types';
import { EmailIcon } from './Icons';

interface EmailViewProps {
  activeEmailId: string | null;
}

export const EmailView: React.FC<EmailViewProps> = ({ activeEmailId }) => {
    const [emails, setEmails] = useState<Email[]>([]);

    useEffect(() => {
        setEmails(getEmails());
    }, []);

    return (
        <div className="w-full h-full bg-black/20 rounded-lg p-4 flex flex-col animate-fade-in space-y-3">
            <h2 className="text-2xl font-bold text-gray-200 flex items-center flex-shrink-0">
                <EmailIcon className="h-7 w-7 mr-3" />Caixa de Entrada
            </h2>
            <div className="flex-grow border border-gray-700 rounded-md overflow-y-auto bg-gray-900/30">
                <ul className="divide-y divide-gray-700/50">
                    {emails.map(email => (
                        <li key={email.id} className={`p-4 cursor-pointer transition-colors flex items-start space-x-3
                            ${activeEmailId === email.id ? 'bg-blue-500/30' : 'hover:bg-gray-700/50'}`
                        }>
                            <div className="flex-shrink-0 mt-1">
                                {email.unread ? (
                                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full" title="Não lido"></div>
                                ) : (
                                    <div className="w-2.5 h-2.5 bg-transparent rounded-full"></div>
                                )}
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <div className="flex justify-between items-baseline">
                                     <p className={`truncate font-semibold ${email.unread ? 'text-blue-200' : 'text-gray-300'}`}>
                                        {email.sender}
                                    </p>
                                    <p className="text-xs text-gray-500 flex-shrink-0 ml-2">{email.timestamp}</p>
                                </div>
                                <p className="truncate text-sm text-gray-300">{email.subject}</p>
                                <p className="truncate text-xs text-gray-500">{email.snippet}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
             <p className="text-xs text-gray-500 text-center flex-shrink-0">
                Peça para o Blue "ler o email sobre [assunto]" para ouvir o conteúdo.
            </p>
        </div>
    );
};