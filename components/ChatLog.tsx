import React from 'react';
import type { ChatMessage, ExecutableCode, ToolCodeOutput } from '../types';
import { UserIcon, BotIcon, LinkIcon } from './Icons';

interface ChatLogProps {
  messages: ChatMessage[];
}

const CodeExecutionBlock: React.FC<{ executableCode: ExecutableCode, toolCodeOutput?: ToolCodeOutput }> = ({ executableCode, toolCodeOutput }) => {
    return (
        <div className="bg-gray-800/80 rounded-lg my-1 text-sm border border-gray-700/50 shadow-md w-full">
            <div className="bg-black/40 p-3 rounded-t-lg">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-gray-400 font-sans">{executableCode.language}</p>
                </div>
                <pre className="font-mono text-cyan-300 overflow-x-auto text-xs sm:text-sm">
                    <code>{executableCode.code}</code>
                </pre>
            </div>
            {toolCodeOutput && (
                <div className="p-3 border-t border-gray-700/50">
                    <p className="text-xs text-gray-400 font-sans mb-1 font-semibold">OUTPUT</p>
                    <pre className="font-mono text-gray-200 whitespace-pre-wrap text-xs sm:text-sm">
                        {toolCodeOutput.outputs.map(o => o.stdout || '').join('')}
                    </pre>
                </div>
            )}
        </div>
    );
};


export const ChatLog: React.FC<ChatLogProps> = ({ messages }) => {
    const chatEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

  return (
    <div className="w-full h-full bg-black/20 rounded-lg p-4 overflow-y-auto flex flex-col space-y-1">
      {messages.map((msg, index) => (
        <div key={index} className="flex-shrink-0">
            <div
            className={`flex items-start gap-3 animate-fade-in ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
            >
            {msg.role === 'model' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center self-start">
                <BotIcon />
                </div>
            )}

            <div className="max-w-md">
                {msg.text && (
                    <div
                        className={`px-4 py-2 rounded-xl ${
                        msg.role === 'user'
                            ? 'bg-indigo-600 rounded-br-none'
                            : 'bg-gray-700 rounded-bl-none'
                        }`}
                    >
                        <p className="text-white whitespace-pre-wrap">{msg.text}</p>
                    </div>
                )}
                {msg.executableCode && (
                    <CodeExecutionBlock 
                        executableCode={msg.executableCode} 
                        toolCodeOutput={msg.toolCodeOutput}
                    />
                )}
            </div>

            {msg.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                    <UserIcon />
                </div>
            )}
            </div>
            {msg.sources && msg.sources.length > 0 && (
                <div className={`max-w-md mt-2 pb-3 ${msg.role === 'user' ? 'ml-auto' : 'ml-11'}`}>
                    <h4 className="text-xs font-bold text-gray-400 mb-1">Fontes:</h4>
                    <ul className="space-y-1">
                        {msg.sources.map((source, i) => (
                            <li key={i}>
                                <a
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center space-x-1.5 p-1 bg-gray-800/50 rounded-md"
                                >
                                    <LinkIcon className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{source.title}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
  );
};