import { useState, useEffect } from 'react';

// Define the BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export const usePwaInstall = () => {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);
    
    const triggerInstall = async () => {
        if (!installPrompt) {
            console.log("A aplicação não pode ser instalada no momento.");
            return;
        }
        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        console.log(`PWA install prompt outcome: ${outcome}`);
        setInstallPrompt(null); // The prompt can only be used once.
    };

    return { isInstallable: !!installPrompt, triggerInstall };
};
