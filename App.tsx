
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createChat, getAIResponse, searchPlacesOnMap } from './services/geminiService';
import { searchFileVFS } from './services/virtualFileSystem';
import { onAuthStateChanged, logoutUser, type FirebaseUser } from './services/userService';
import { getChatHistory, saveChatMessage } from './services/chatService';
import { findEmail as findEmailService, addSentEmail } from './services/emailService';
import { addEvent as addCalendarEvent, getEvents as getCalendarEvents } from './services/calendarService';
import { startSession, stopSession } from './services/liveService';
import type { ChatMessage, Action, Intent, AppStatus, AppMode, Script, ExecutableCode, ToolCodeOutput, VoiceSessionStatus, MapResult } from './types';
import { BlueOrb } from './components/BlueOrb';
import { ChatLog } from './components/ChatLog';
import { ActionPanel } from './components/ActionPanel';
import { BlueLogoIcon, OfflineIcon } from './components/Icons';
import { NavBar } from './components/NavBar';
import { BrowserView } from './components/BrowserView';
import { CodeEditorView } from './components/CodeEditorView';
import { NetworkView } from './components/NetworkView';
import { AuthView } from './components/AuthView';
import { UserMenu } from './components/UserMenu';
import { DeployView } from './components/DeployView';
import { FileExplorerView } from './components/FileExplorerView';
import { DriversView } from './components/DriversView';
import { SetupView } from './components/SetupView';
import { ScriptWriterView } from './components/ScriptWriterView';
import { EmailView } from './components/EmailView';
import { DocumentReaderView } from './components/DocumentReaderView';
import { VoiceChatView } from './components/VoiceChatView';
import { MusicPlayerView } from './components/MusicPlayerView';
import { InstallerCreatorView } from './components/InstallerCreatorView';
import { CalendarView } from './components/CalendarView';
import { AdMobView } from './components/AdMobView';
import { FacebookAdsView } from './components/FacebookAdsView';
import { SystemAnalyzerView } from './components/SystemAnalyzerView';
import { SelfUpdateView } from './components/SelfUpdateView';
import { MapView } from './components/MapView';
import type { Chat } from '@google/genai';


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [mode, setMode] = useState<AppMode>('LOGIN');
  const [modeHistory, setModeHistory] = useState<AppMode[]>(['INSTALLER_CREATOR']);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [currentAction, setCurrentAction] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [codeContent, setCodeContent] = useState('');
  const [projectName, setProjectName] = useState('');
  const [initialFileExplorerPath, setInitialFileExplorerPath] = useState<string | undefined>(undefined);
  const [generatedScript, setGeneratedScript] = useState<Script | null>(null);
  const [activeEmailId, setActiveEmailId] = useState<string | null>(null);
  const [youtubeQuery, setYoutubeQuery] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isSecureContext, setIsSecureContext] = useState(true);
  const [initialSystemAnalysis, setInitialSystemAnalysis] = useState<Intent | null>(null);
  const [selfUpdateAction, setSelfUpdateAction] = useState<{ taskDescription: string; newCodeSnippet: string; } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // State for MapView
  const [mapResult, setMapResult] = useState<MapResult | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  
  // State for Live API
  const [liveStatus, setLiveStatus] = useState<VoiceSessionStatus>('idle');
  const [currentUserTranscript, setCurrentUserTranscript] = useState('');
  const [currentModelTranscript, setCurrentModelTranscript] = useState('');

  const mainViewRef = useRef<HTMLDivElement>(null);
  
  const addMessageToHistory = useCallback(async (message: ChatMessage) => {
    // Optimistically update UI and keep chat object in sync
    setChatHistory(prev => {
        const newHistory = [...prev, message];
        setChat(createChat(newHistory)); // Sync chat object
        return newHistory;
    });
    if (userId) {
        // Persist only the core parts of the message to Firestore
        await saveChatMessage(userId, { role: message.role, text: message.text });
    }
  }, [userId]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    setIsSecureContext(window.isSecureContext);
    const unsubscribe = onAuthStateChanged((user: FirebaseUser | null) => {
        if (user) {
            setIsAuthenticated(true);
            setUserId(user.uid);
            setCurrentUserName(user.displayName || user.email);
            // Set default mode to System Analyzer with Virus Scan as requested
            setInitialSystemAnalysis('SCAN_VIRUS');
            setMode('SYSTEM_ANALYZER');
            setModeHistory(['SYSTEM_ANALYZER']);
        } else {
            // Do not logout if we are in demo mode
            if (userId !== 'demo-user-id') {
                setIsAuthenticated(false);
                setUserId(null);
                setCurrentUserName(null);
                setChatHistory([]);
                setChat(null);
                setMode('LOGIN');
            }
        }
    });
    return () => unsubscribe();
  }, [userId]);
  
  useEffect(() => {
    if (userId) {
        const loadHistoryAndCreateChat = async () => {
            const history = await getChatHistory(userId);
            let finalHistory;
            if (history.length === 0) {
                 const welcomeMessage = { role: 'model' as const, text: 'Olá! Eu sou o Blue, seu assistente de IA. Como posso ajudar hoje?' };
                 finalHistory = [welcomeMessage];
            } else {
                 finalHistory = history;
            }
            setChatHistory(finalHistory);
            setChat(createChat(finalHistory));
        };
        
        // Reset state before loading new user data
        setChatHistory([]);
        setChat(null);
        loadHistoryAndCreateChat();
    }
  }, [userId]);


  const handleLogout = () => {
      stopSession();
      if (userId !== 'demo-user-id') {
        logoutUser();
      }
      // For demo user, just reset state
      setIsAuthenticated(false);
      setUserId(null);
      setCurrentUserName(null);
      setChatHistory([]);
      setChat(null);
      setMode('LOGIN');
  };
  
  const handleActionComplete = useCallback(() => {
    setCurrentAction(null);
    const completionMessage: ChatMessage = { role: 'model', text: 'Tarefa concluída! Pronto para o próximo comando.' };
    addMessageToHistory(completionMessage);
  }, [addMessageToHistory]);
  
  const handleModeChange = useCallback((newMode: AppMode) => {
    if (currentAction || !isAuthenticated) return;
    
    setModeHistory(prev => {
        if (prev[prev.length - 1] === newMode) return prev;
        return [...prev, newMode];
    });
    
    if (newMode !== 'SCRIPT_WRITER') {
        setGeneratedScript(null);
    }
    if (newMode !== 'EMAIL') {
        setActiveEmailId(null);
    }
    if (newMode !== 'YOUTUBE_VIEW') {
        setYoutubeQuery(null);
    }
    if (newMode !== 'MAP') {
        setMapResult(null);
        setMapError(null);
    }
    setMode(newMode);
  }, [currentAction, isAuthenticated]);
  
  const handleDemoLogin = () => {
    setIsAuthenticated(true);
    setUserId('demo-user-id');
    setCurrentUserName('Usuário Demo');
    setInitialSystemAnalysis('SCAN_VIRUS');
    setMode('SYSTEM_ANALYZER');
    setModeHistory(['SYSTEM_ANALYZER']);
  };

  const executeFunctionCall = useCallback(async (func: { name: string; args: any; }) => {
    const onlineRequiredFunctions = ['searchWebForAnswer', 'searchOnMap', 'openUrlInNewTab', 'openGoogleSearch', 'openYouTubeSearch', 'searchYouTube', 'getMonetizationReport'];
    if (onlineRequiredFunctions.includes(func.name) && !isOnline) {
        addMessageToHistory({
            role: 'model',
            text: 'Desculpe, esta ação requer uma conexão com a internet e você parece estar offline.'
        });
        return;
    }

    console.log("Executing function call:", func);
    switch (func.name) {
        case 'switchTab': {
            const modeMap: { [key: string]: AppMode } = {
                'Assistente': 'ASSISTANT', 'Conversa por Voz': 'VOICE_CHAT', 'Calendário': 'CALENDAR', 'Email': 'EMAIL', 'Arquivos': 'FILE_EXPLORER', 'Drivers': 'DRIVERS', 'Setup': 'SETUP',
                'Roteiro': 'SCRIPT_WRITER', 'Navegador': 'BROWSER', 'Editor': 'CODE_EDITOR', 'Rede': 'NETWORK', 'Deploy': 'DEPLOY', 
                'Analisador': 'ANALYZER', 'Analisador de Sistema': 'SYSTEM_ANALYZER', 'Mapa': 'MAP', 'Instalador': 'INSTALLER_CREATOR', 'Monetização': 'ADMOB', 'Facebook Ads': 'FACEBOOK_ADS'
            };
            const targetMode = modeMap[func.args.tabName];
            if (targetMode) handleModeChange(targetMode);
            else console.warn(`Unknown tab name: ${func.args.tabName}`);
            break;
        }
        case 'performSystemAction': {
            const intent = func.args.action.toUpperCase() as Intent;
            if (['CLEAN', 'SCAN_VIRUS', 'OPTIMIZE'].includes(intent)) {
                setInitialSystemAnalysis(intent);
                handleModeChange('SYSTEM_ANALYZER');
            }
            break;
        }
        case 'writeDocument': {
            setCurrentAction({
                intent: 'WRITE_DOCUMENT',
                appName: func.args.documentType,
                content: func.args.content
            });
            setMode('ASSISTANT');
            break;
        }
        case 'searchWebForAnswer': {
            setMode('ASSISTANT');
             const searchResponse = await getAIResponse(createChat([], `Você é um assistente de pesquisa. Responda à pergunta do usuário com base nos resultados da pesquisa do Google. Forneça uma resposta direta e útil. Pergunta: ${func.args.query}`), func.args.query);
            
            const sources = searchResponse.parts
                ?.flatMap((p: any) => p.groundingMetadata?.groundingChunks || [])
                ?.map((chunk: any) => chunk.web)
                .filter((web: any) => web?.uri && web.title);

            const cleanedText = searchResponse.text.replace(/\*/g, '');
            const searchMessage: ChatMessage = {
                role: 'model',
                text: cleanedText,
                sources: sources || []
            };
            addMessageToHistory(searchMessage);
            break;
        }
        case 'searchOnMap': {
            const query = func.args.query;
            handleModeChange('MAP');
            setIsMapLoading(true);
            setMapResult(null);
            setMapError(null);
            
            if (!navigator.geolocation) {
                setMapError("Geolocalização não é suportada pelo seu navegador.");
                setIsMapLoading(false);
                break;
            }
    
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const result = await searchPlacesOnMap(query, { latitude, longitude });
                    
                    const places = result.parts
                        ?.flatMap((p: any) => p.groundingMetadata?.groundingChunks || [])
                        ?.map((chunk: any) => chunk.maps)
                        .filter((map: any) => map?.uri && map.title) || [];
                    
                    const cleanedText = result.text.replace(/\*/g, '');
    
                    setMapResult({ text: cleanedText, places });
                    setIsMapLoading(false);
                },
                (error) => {
                    let errorMessage = "Ocorreu um erro ao obter sua localização.";
                    if (error.code === error.PERMISSION_DENIED) {
                        errorMessage = "Permissão de localização negada. Por favor, habilite o acesso à localização nas configurações do seu navegador para usar esta funcionalidade.";
                    }
                    setMapError(errorMessage);
                    setIsMapLoading(false);
                }
            );
            break;
        }
        case 'openUrlInNewTab': {
            let url = func.args.url || '';
            if (!/^https?:\/\//i.test(url)) {
                url = 'https://' + url;
            }
            window.open(url, '_blank', 'noopener,noreferrer');
            const openUrlMessage: ChatMessage = { role: 'model', text: `Abrindo ${func.args.url} em uma nova aba para você.` };
            addMessageToHistory(openUrlMessage);
            break;
        }
        case 'openGoogleSearch': {
            const query = encodeURIComponent(func.args.query);
            const url = `https://www.google.com/search?q=${query}`;
            window.open(url, '_blank', 'noopener,noreferrer');
            const searchMessage: ChatMessage = { role: 'model', text: `Ok, abrindo os resultados da pesquisa para "${func.args.query}" no Google.` };
            addMessageToHistory(searchMessage);
            break;
        }
        case 'openYouTubeSearch': {
            const query = encodeURIComponent(func.args.query);
            const url = `https://www.youtube.com/results?search_query=${query}`;
            window.open(url, '_blank', 'noopener,noreferrer');
            const searchMessage: ChatMessage = { role: 'model', text: `Ok, buscando por "${func.args.query}" no site do YouTube.` };
            addMessageToHistory(searchMessage);
            break;
        }
        case 'searchYouTube': {
            setYoutubeQuery(func.args.query);
            setMode('YOUTUBE_VIEW');
            const videoMessage: ChatMessage = { role: 'model', text: `Ok, buscando vídeos sobre "${func.args.query}" no YouTube para você.` };
            addMessageToHistory(videoMessage);
            break;
        }
        case 'listCalendarEvents': {
            const events = getCalendarEvents();
            const period = func.args.timePeriod || 'hoje';
            const eventList = events.map(e => `- ${e.startTime}: ${e.title}`);
            const responseText = `Claro, aqui estão seus compromissos para ${period}:\n${eventList.join('\n')}`;
            addMessageToHistory({ role: 'model', text: responseText });
            break;
        }
        case 'createCalendarEvent': {
            const { title, startTime, description } = func.args;
            addCalendarEvent({ title, startTime, description });
            const date = new Date(startTime);
            const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const responseText = `Ok, agendei "${title}" para ${formattedTime}. Você pode conferir na aba Calendário.`;
            addMessageToHistory({ role: 'model', text: responseText });
            break;
        }
        case 'getMonetizationReport': {
            handleModeChange('ADMOB');
            const reportMessage: ChatMessage = { role: 'model', text: `Claro, abrindo o painel de monetização para você.` };
            addMessageToHistory(reportMessage);
            break;
        }
        case 'sendEmail': {
            const { recipient, subject, body } = func.args;
            addSentEmail(subject, body, recipient);
            const responseText = `Pronto! Enviei o e-mail para ${recipient}. Estou abrindo sua caixa de entrada para você ver.`;
            addMessageToHistory({ role: 'model', text: responseText });
            handleModeChange('EMAIL');
            break;
        }
        case 'generateCode':
            setCodeContent(func.args.codeContent || '');
            setProjectName('');
            setMode('CODE_EDITOR');
            break;
        case 'createProject':
            setCodeContent(func.args.files || '[]');
            setProjectName(func.args.projectName || 'Novo Projeto');
            setMode('CODE_EDITOR');
            break;
        case 'createScript':
             try {
                const scriptData = JSON.parse(func.args.scriptData || '{}');
                setGeneratedScript(scriptData);
            } catch(e) {
                console.error("Failed to parse Script JSON:", e);
                setGeneratedScript(null);
            }
            setMode('SCRIPT_WRITER');
            break;
        case 'searchFiles': {
            const searchResponse = `Claro, posso ajudar com isso. Por favor, vá para a aba 'Arquivos', conecte-se a uma pasta local e você poderá navegar e encontrar o arquivo '${func.args.fileName}'.`;
            addMessageToHistory({ role: 'model', text: searchResponse });
            handleModeChange('FILE_EXPLORER');
            break;
        }
        case 'openEmail': {
            handleModeChange('EMAIL');
            break;
        }
        case 'readEmail': {
            const email = findEmailService(func.args.query);
            if (email) {
                const emailContent = `Lendo o e-mail de ${email.sender}. Assunto: ${email.subject}. Conteúdo: ${email.body}`;
                setActiveEmailId(email.id);
                addMessageToHistory({ role: 'model', text: emailContent });
            } else {
                const notFoundMessage = "Desculpe, não encontrei um e-mail correspondente a essa busca.";
                addMessageToHistory({ role: 'model', text: notFoundMessage });
            }
            break;
        }
        case 'goBack': {
            setModeHistory(prev => {
                if (prev.length <= 1) return prev;
                const newHistory = [...prev];
                newHistory.pop();
                const lastMode = newHistory[newHistory.length - 1];
                setMode(lastMode || 'ASSISTANT');
                return newHistory;
            });
            break;
        }
        case 'closeCurrentTab': {
            setMode('ASSISTANT');
            setModeHistory(['ASSISTANT']); // Reset history
            break;
        }
        case 'switchToAnalyzer': {
            handleModeChange('ANALYZER');
            break;
        }
         case 'switchToVoiceChat': {
            handleModeChange('VOICE_CHAT');
            break;
        }
        case 'switchToInstallerCreator': {
            handleModeChange('INSTALLER_CREATOR');
            break;
        }
        case 'updateSelf': {
            const { taskDescription, newCodeSnippet } = func.args;
            addMessageToHistory({ role: 'model', text: `Entendido! Iniciando meu processo de auto-atualização para: ${taskDescription}.` });
            setSelfUpdateAction({ taskDescription, newCodeSnippet });
            break;
        }
        case 'closeAction':
            setCurrentAction(null);
            break;
        case 'clickElement': {
            const desc = func.args.elementDescription.toLowerCase();
            const elements = Array.from(document.querySelectorAll<HTMLElement>('button, a, [role="button"], [aria-label]'));
            const target = elements.find(el => 
                el.textContent?.toLowerCase().trim() === desc ||
                el.ariaLabel?.toLowerCase().trim() === desc
            );
            if (target) target.click();
            else console.warn(`Could not find element to click: "${desc}"`);
            break;
        }
        case 'typeInElement': {
            const { targetDescription, textToType } = func.args;
            const desc = targetDescription.toLowerCase();
            const inputs = Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea'));
            let target: HTMLInputElement | HTMLTextAreaElement | null = null;
            
            target = inputs.find(el => 
                el.placeholder?.toLowerCase() === desc || 
                el.ariaLabel?.toLowerCase() === desc
            ) || null;

            if (!target) {
                const labels = Array.from(document.querySelectorAll<HTMLLabelElement>('label'));
                const targetLabel = labels.find(l => l.textContent?.toLowerCase().includes(desc));
                if (targetLabel?.htmlFor) {
                    target = document.getElementById(targetLabel.htmlFor) as HTMLInputElement | HTMLTextAreaElement;
                }
            }

            if (target) {
                target.value = textToType;
                target.dispatchEvent(new Event('input', { bubbles: true }));
                target.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                console.warn(`Could not find element to type in: "${desc}"`);
            }
            break;
        }
        case 'scrollPage': {
            if (mainViewRef.current) {
                const scrollAmount = mainViewRef.current.clientHeight * 0.8;
                mainViewRef.current.scrollBy({
                    top: func.args.direction === 'down' ? scrollAmount : -scrollAmount,
                    behavior: 'smooth'
                });
            }
            break;
        }
        default:
            console.warn(`Unknown function call received: ${func.name}`);
    }
  }, [handleModeChange, addMessageToHistory, isOnline]);
  
  const handleTranscriptionUpdate = useCallback((isFinal: boolean, userText: string, modelText: string) => {
    if (isFinal) {
        if (userText.trim()) {
            addMessageToHistory({ role: 'user', text: userText });
        }
        if (modelText.trim()) {
            addMessageToHistory({ role: 'model', text: modelText });
        }
        setCurrentUserTranscript('');
        setCurrentModelTranscript('');
    } else {
        setCurrentUserTranscript(userText);
        setCurrentModelTranscript(modelText);
    }
  }, [addMessageToHistory]);

  const toggleLiveSession = useCallback(() => {
    setError(null);
    if (!isOnline) {
        setError("Você está offline. A conversa por voz requer uma conexão com a internet.");
        return;
    }
    if (liveStatus === 'active' || liveStatus === 'connecting') {
        stopSession();
    } else {
        setCurrentUserTranscript('');
        setCurrentModelTranscript('');
        startSession({
            onStatusChange: setLiveStatus,
            onTranscriptionUpdate: handleTranscriptionUpdate,
            onFunctionCall: executeFunctionCall,
            onError: (err) => {
                setError(err);
                setLiveStatus('error');
            },
        });
    }
  }, [liveStatus, handleTranscriptionUpdate, executeFunctionCall, isOnline]);

  const handleBrowserSearch = async (query: string) => {
    if (!chat) return;
    addMessageToHistory({ role: 'user', text: `pesquise na web por: ${query}` });
    try {
        await executeFunctionCall({ name: 'searchWebForAnswer', args: { query } });
    } catch(err) {
        console.error("Browser search failed:", err);
        setError("Falha ao executar a pesquisa na web.");
    }
  };

  const renderCurrentView = () => {
    if (!isAuthenticated) {
        return <AuthView onDemoLogin={handleDemoLogin} />;
    }
    switch (mode) {
        case 'BROWSER': return <BrowserView onSearch={handleBrowserSearch} />;
        case 'CODE_EDITOR': return <CodeEditorView userId={userId} initialCode={codeContent} projectNameFromAI={projectName} />;
        case 'NETWORK': return <NetworkView />;
        case 'DEPLOY': return <DeployView userId={userId} />;
        case 'FILE_EXPLORER': return <FileExplorerView />;
        case 'DRIVERS': return <DriversView />;
        case 'SETUP': return <SetupView />;
        case 'SCRIPT_WRITER': return <ScriptWriterView initialScript={generatedScript} chat={chat} />;
        case 'EMAIL': return <EmailView activeEmailId={activeEmailId} />;
        case 'ANALYZER': return <DocumentReaderView />;
        case 'SYSTEM_ANALYZER': return <SystemAnalyzerView initialAnalysis={initialSystemAnalysis} />;
        case 'VOICE_CHAT': return <VoiceChatView />;
        case 'YOUTUBE_VIEW': return <MusicPlayerView query={youtubeQuery || ''} onClose={() => handleModeChange('ASSISTANT')} />;
        case 'INSTALLER_CREATOR': return <InstallerCreatorView />;
        case 'CALENDAR': return <CalendarView />;
        case 'ADMOB': return <AdMobView />;
        case 'FACEBOOK_ADS': return <FacebookAdsView />;
        case 'MAP': return <MapView result={mapResult} isLoading={isMapLoading} error={mapError} />;
        case 'ASSISTANT':
        default:
            return currentAction 
                ? <ActionPanel action={currentAction} onComplete={handleActionComplete} />
                : <ChatLog messages={chatHistory} />;
    }
  }
  
  if (!isAuthenticated && mode === 'LOGIN') {
      return <AuthView onDemoLogin={handleDemoLogin} />;
  }
  
  if (!isAuthenticated) {
      return null; // or a loading spinner
  }

  const getOrbStatus = (): AppStatus => {
    if (liveStatus === 'connecting') return 'processing';
    if (liveStatus === 'active') return 'listening';
    if (currentAction) return 'acting';
    return 'idle';
  };

  const getHelperText = () => {
    if (liveStatus === 'connecting') return 'Conectando ao servidor de voz...';
    if (liveStatus === 'active') return 'Sessão de voz ativa. Fale agora...';
    if (liveStatus === 'error') return error || 'Erro de conexão. Clique para tentar novamente.';
    if (currentAction) return 'Executando tarefa... (Diga "pode fechar" para cancelar)';
    if (liveStatus === 'stopped') return 'Sessão encerrada. Clique para iniciar novamente.';
    if (!isOnline) return 'Você está offline. Conecte-se para usar o bate-papo por voz.';
    return 'Clique no orbe para iniciar uma conversa por voz';
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl text-white h-screen w-screen flex flex-col items-center justify-center p-2 sm:p-4 font-sans">
         {selfUpdateAction && (
            <SelfUpdateView
                taskDescription={selfUpdateAction.taskDescription}
                newCodeSnippet={selfUpdateAction.newCodeSnippet}
                onComplete={() => {
                    setSelfUpdateAction(null);
                    addMessageToHistory({ role: 'model', text: 'Atualização concluída com sucesso! Estou pronto para o próximo comando com minhas novas habilidades.' });
                }}
            />
        )}
        <div className="w-full h-full bg-slate-900/10 border border-blue-500/20 rounded-none sm:rounded-3xl shadow-2xl flex flex-col relative p-2 sm:p-4">
            {!isSecureContext && window.location.hostname !== 'localhost' && (
                    <div className="absolute top-0 left-0 right-0 bg-yellow-600/80 text-white text-center p-1.5 text-xs z-50 rounded-t-none sm:rounded-t-3xl">
                        Atenção: O microfone pode não funcionar em conexões não seguras (HTTP). Por favor, acesse o site via HTTPS.
                    </div>
            )}
            <header className="flex items-center justify-between w-full max-w-6xl mx-auto mb-2 sm:mb-4 pt-4 sm:pt-2">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <BlueLogoIcon />
                    <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 tracking-wider">Bluewhite AI</h1>
                </div>
                <UserMenu onLogout={handleLogout} userName={currentUserName} />
            </header>
            
            {!isOnline && (
                <div className="w-full max-w-6xl mx-auto bg-yellow-900/50 border border-yellow-500/50 text-yellow-300 p-2 rounded-lg mb-2 sm:mb-4 text-center flex items-center justify-center space-x-2 text-sm animate-fade-in">
                    <OfflineIcon className="h-5 w-5" />
                    <span>Você está offline. Algumas funcionalidades estão desativadas.</span>
                </div>
            )}

            <div className="w-full max-w-6xl mx-auto mb-2 sm:mb-4">
                 <NavBar currentMode={mode} onModeChange={handleModeChange} disabled={!!currentAction || liveStatus === 'active' || liveStatus === 'connecting'} />
            </div>

            {error && liveStatus !== 'error' && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md mb-2 sm:mb-4 text-center w-full max-w-6xl mx-auto">{error}</div>}

            <div ref={mainViewRef} className="relative w-full max-w-6xl mx-auto flex-grow mb-2 sm:mb-4 h-0 overflow-y-auto">
                {renderCurrentView()}
            </div>
            
            {mode === 'ASSISTANT' && (
                <div className="flex flex-col items-center justify-center mt-auto">
                     <div className="h-12 text-center text-lg text-gray-300 px-4 overflow-hidden w-full max-w-2xl">
                        {currentUserTranscript && (
                            <p className="truncate animate-fade-in">
                                <span className="font-semibold text-white">Você: </span> 
                                {currentUserTranscript}
                            </p>
                        )}
                        {currentModelTranscript && (
                            <p className="truncate animate-fade-in">
                                <span className="font-semibold text-blue-300">Blue: </span>
                                {currentModelTranscript}
                            </p>
                        )}
                    </div>
                    <BlueOrb status={getOrbStatus()} onClick={toggleLiveSession} />

                    <p className="text-sm text-gray-400 mt-1 sm:mt-2 h-auto sm:h-6 text-center px-2">
                        {getHelperText()}
                    </p>
                    <p className="text-xs text-blue-400/70 mt-1">
                        ⚡️ Alimentado pela API Gemini Live
                    </p>
                </div>
            )}
        </div>
    </div>
  );
}
