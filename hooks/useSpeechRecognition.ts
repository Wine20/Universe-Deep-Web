import { useState, useEffect, useRef, useCallback } from 'react';

// Added for specific error event typing
interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}

// TypeScript definitions for SpeechRecognition API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: (this: SpeechRecognition, ev: Event) => any;
  onaudioend: (this: SpeechRecognition, ev: Event) => any;
  onend: (this: SpeechRecognition, ev: Event) => any;
  onerror: (this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any;
  onnomatch: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => any;
  onresult: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => any;
  onsoundstart: (this: SpeechRecognition, ev: Event) => any;
  onsoundend: (this: SpeechRecognition, ev: Event) => any;
  onspeechstart: (this: SpeechRecognition, ev: Event) => any;
  onspeechend: (this: SpeechRecognition, ev: Event) => any;
  onstart: (this: SpeechRecognition, ev: Event) => any;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const browserSupportsSpeechRecognition =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.warn('Speech recognition not supported by this browser.');
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setFinalTranscript('');
    };
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let currentFinal = '';
        for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                currentFinal += result[0].transcript + ' ';
            } else {
                interimTranscript += result[0].transcript;
            }
        }
        setTranscript(interimTranscript);
        // We set the final transcript here to get live feedback, but the "final" one is triggered on stop
        setFinalTranscript(currentFinal.trim());
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error(`Speech recognition error: ${event.error}`, event.message);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setPermissionError('Microfone bloqueado. Por favor, habilite o acesso nas configurações do navegador.');
      } else if (event.error === 'no-speech') {
        // This is a common, non-critical error, so we can ignore it.
      } else {
        setPermissionError(`Ocorreu um erro com o reconhecimento de voz: ${event.error}`);
      }
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;

    return () => {
        recognition.abort();
    };

  }, [browserSupportsSpeechRecognition]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setPermissionError(null); // Reset error state on a new attempt
      setFinalTranscript('');
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return { isListening, transcript, finalTranscript, startListening, stopListening, browserSupportsSpeechRecognition, permissionError };
};