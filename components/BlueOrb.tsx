
import React from 'react';
import type { AppStatus } from '../types';
import { MicIcon, ProcessingIcon } from './Icons';

interface BlueOrbProps {
  status: AppStatus;
  onClick: () => void;
}

export const BlueOrb: React.FC<BlueOrbProps> = ({ status, onClick }) => {
  const isIdle = status === 'idle' || status === 'speaking' || status === 'acting';
  const isListening = status === 'listening';
  const isProcessing = status === 'processing';
  const isDisabled = status !== 'idle' && status !== 'listening';

  const orbBaseClasses = "relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/50";
  
  const getStatusClasses = () => {
    if (isListening) return "bg-blue-500 shadow-blue-500/50 scale-110";
    if (isProcessing) return "bg-indigo-600 shadow-indigo-500/50 animate-pulse";
    return "bg-blue-600 hover:bg-blue-500 shadow-blue-600/40";
  };

  return (
    <div className="relative flex items-center justify-center">
      {(isListening || isProcessing) && (
        <div className={`absolute w-40 h-40 ${isListening ? 'bg-blue-500/30' : 'bg-indigo-500/30'} rounded-full animate-ping`}></div>
      )}
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`${orbBaseClasses} ${getStatusClasses()}`}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
        {isProcessing ? (
          <ProcessingIcon />
        ) : (
          <MicIcon isListening={isListening} />
        )}
      </button>
    </div>
  );
};
