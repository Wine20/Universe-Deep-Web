import { useState, useEffect, useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    setSupported(isSupported);
    if (isSupported) {
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      // Voices might load asynchronously.
      if (window.speechSynthesis.getVoices().length > 0) {
        updateVoices();
      } else {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!supported || !text) return;
    
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    const ptVoices = voices.filter(voice => voice.lang === 'pt-BR');
    
    let selectedVoice: SpeechSynthesisVoice | null = null;

    // 1. Try to find high-quality, known male voices by name
    const knownMaleVoices = [
        "Google português do Brasil", // Common on Chrome/Android
        "Microsoft Daniel - Portuguese (Brazil)", // Common on Windows
    ];
    selectedVoice = ptVoices.find(voice => knownMaleVoices.includes(voice.name)) || null;

    // 2. If not found, use heuristic search for a male voice
    if (!selectedVoice) {
      selectedVoice = ptVoices.find(voice => 
          /male|homem|masculino/i.test(voice.name) || 
          /ricardo|felipe/i.test(voice.name) 
      ) || null;
    }
    
    // 3. Fallback to the first available Portuguese voice
    utterance.voice = selectedVoice || ptVoices[0] || null;
    utterance.lang = 'pt-BR';
    utterance.pitch = 1.05; // Adjusted for a clearer, more professional tone.
    utterance.rate = 1.0; // Adjusted for a more deliberate, clear pace.
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
        // The 'interrupted' error is expected when we cancel speech to start a new one.
        // We don't need to log it as a critical error.
        if (e.error !== 'interrupted') {
          console.error("SpeechSynthesis Error:", e.error);
        }
        setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  }, [supported, voices]);

  const cancelSpeaking = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [supported]);

  return { speak, isSpeaking, supported, cancelSpeaking };
};