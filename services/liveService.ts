

import { GoogleGenAI, LiveServerMessage, Modality, Blob, FunctionDeclaration, Type } from "@google/genai";
import type { VoiceSessionStatus } from '../types';

declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const liveFunctionDeclarations: FunctionDeclaration[] = [
    {
        name: 'performSystemAction',
        description: "Executa uma SIMULAÇÃO de uma ação de manutenção do sistema, como limpeza, verificação de vírus ou otimização. Use para demonstrar o processo ao usuário.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                action: { type: Type.STRING, description: "A ação a ser executada. Deve ser 'CLEAN', 'SCAN_VIRUS' ou 'OPTIMIZE'." }
            },
            required: ['action']
        }
    },
    {
        name: 'switchTab',
        description: 'Navega para uma aba ou seção principal do aplicativo.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                tabName: { type: Type.STRING, description: "O nome da aba de destino. Opções: 'Assistente', 'Conversa por Voz', 'Calendário', 'Email', 'Analisador', 'Mapa', 'Arquivos', 'Drivers', 'Setup', 'Roteiro', 'Navegador', 'Editor', 'Rede', 'Deploy', 'Instalador', 'Monetização', 'Facebook Ads'." }
            },
            required: ['tabName']
        }
    },
     {
        name: 'getMonetizationReport',
        description: 'Mostra o painel de monetização com o desempenho dos aplicativos (ganhos, impressões, etc.) usando dados reais do Google AdSense.',
        parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: 'searchYouTube',
        description: 'Procura por um vídeo no YouTube (música, tutorial, etc.) e o exibe no player de vídeo do aplicativo. Use para qualquer pedido relacionado a assistir ou ouvir algo do YouTube.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: "O tópico, nome da música ou nome do vídeo a ser pesquisado (ex: 'como fazer um bolo', 'Queen Bohemian Rhapsody')." }
            },
            required: ['query']
        }
    },
    {
        name: 'searchOnMap',
        description: 'Procura por lugares, como restaurantes, parques ou lojas, no Google Maps, com base na localização atual do usuário.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: 'O que procurar (ex: "cafeterias", "parques", "restaurantes italianos perto de mim").' }
            },
            required: ['query']
        }
    },
    {
        name: 'listCalendarEvents',
        description: 'Lista os eventos da agenda do Google Calendar para um determinado período.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                timePeriod: { type: Type.STRING, description: "O período para buscar eventos, como 'hoje', 'amanhã' ou 'esta semana'." }
            },
            required: ['timePeriod']
        }
    },
    {
        name: 'createCalendarEvent',
        description: 'Cria um novo evento na agenda do Google Calendar.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: 'O título ou nome do evento.' },
                startTime: { type: Type.STRING, description: 'A data e hora de início no formato ISO 8601 (ex: 2024-08-15T10:00:00Z).' },
                description: { type: Type.STRING, description: 'Uma breve descrição ou detalhes do evento.' },
                attendees: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Uma lista de endereços de e-mail dos convidados.' }
            },
            required: ['title', 'startTime']
        }
    },
    {
        name: 'sendEmail',
        description: 'Envia um e-mail através do Gmail.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                recipient: { type: Type.STRING, description: 'O endereço de e-mail do destinatário.' },
                subject: { type: Type.STRING, description: 'O assunto do e-mail.' },
                body: { type: Type.STRING, description: 'O conteúdo do corpo do e-mail.' }
            },
            required: ['recipient', 'subject', 'body']
        }
    },
    {
        name: 'clickElement',
        description: 'Clica em um elemento da UI, como um botão ou link, identificado pelo seu texto ou rótulo de acessibilidade.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                elementDescription: { type: Type.STRING, description: "O texto visível ou rótulo de acessibilidade do elemento a ser clicado (ex: 'Executar', 'Salvar', 'Conectar')." }
            },
            required: ['elementDescription']
        }
    },
    {
        name: 'typeInElement',
        description: 'Digita um texto em um campo de entrada de texto ou área de texto.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                targetDescription: { type: Type.STRING, description: "A descrição do campo de entrada, como o texto do placeholder ou do rótulo associado (ex: 'Título da História', 'https://...')." },
                textToType: { type: Type.STRING, description: "O texto a ser digitado no campo." }
            },
            required: ['targetDescription', 'textToType']
        }
    },
    {
        name: 'scrollPage',
        description: 'Rola a visualização principal da página para cima ou para baixo.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                direction: { type: Type.STRING, description: "A direção da rolagem. Deve ser 'up' ou 'down'." }
            },
            required: ['direction']
        }
    },
    {
        name: 'searchWebForAnswer',
        description: 'Pesquisa na web usando o Google por informações atuais ou em tempo real e retorna la resposta.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: 'A pergunta ou termo a ser pesquisado na web.' }
            },
            required: ['query']
        }
    },
    {
        name: 'openUrlInNewTab',
        description: "Abre uma URL em uma nova aba do navegador. Use para sites complexos ou quando o usuário pedir para 'abrir' ou 'ir para' um site, como 'google.com' ou 'wikipedia.org'.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                url: { type: Type.STRING, description: "A URL completa para visitar. Se o usuário não fornecer um protocolo, assuma 'https://'." }
            },
            required: ['url']
        }
    },
    {
        name: 'openGoogleSearch',
        description: 'Realiza uma pesquisa no site do Google e abre os resultados em uma nova aba do navegador. Use quando o usuário pedir explicitamente para "pesquisar no Google" ou "procurar no Google".',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: 'O termo a ser pesquisado no Google.' }
            },
            required: ['query']
        }
    },
    {
        name: 'openYouTubeSearch',
        description: 'Pesquisa no site do YouTube e abre a página de resultados em uma nova aba. Use quando a busca interna por um vídeo específico falhar ou quando o usuário pedir para ver os resultados da busca no YouTube.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: 'O termo a ser pesquisado no YouTube.' }
            },
            required: ['query']
        }
    },
    {
        name: 'createScript',
        description: 'Gera um roteiro de história com base em um título e uma logline.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                scriptData: { type: Type.STRING, description: "Uma string JSON contendo o título, logline e cenas do roteiro." }
            },
            required: ['scriptData']
        }
    },
    {
        name: 'searchFiles',
        description: 'Procura por um arquivo no sistema de arquivos virtual local ou no Google Drive (simulado).',
        parameters: {
            type: Type.OBJECT,
            properties: {
                fileName: { type: Type.STRING, description: "O nome do arquivo a ser procurado." }
            },
            required: ['fileName']
        }
    },
    {
        name: 'generateCode',
        description: 'Gera um único arquivo de código no editor.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                codeContent: { type: Type.STRING, description: "O conteúdo do código a ser gerado." }
            },
            required: ['codeContent']
        }
    },
    {
        name: 'createProject',
        description: 'Cria um projeto de desenvolvimento com múltiplos arquivos.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                projectName: { type: Type.STRING, description: 'O nome do projeto.' },
                files: { type: Type.STRING, description: 'Uma string JSON de um array de objetos, onde cada objeto tem "name" e "content".' }
            },
            required: ['projectName', 'files']
        }
    },
    {
        name: 'writeDocument',
        description: 'Cria um documento de texto simples na aba do assistente.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                documentType: { type: Type.STRING, description: "O tipo ou título do documento." },
                content: { type: Type.STRING, description: "O conteúdo do texto do documento." }
            },
            required: ['documentType', 'content']
        }
    },
    {
        name: 'openEmail',
        description: 'Abre a caixa de entrada de e-mails simulada para visualização.',
        parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: 'readEmail',
        description: 'Lê em voz alta o conteúdo de um e-mail específico com base em seu remetente ou assunto.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: "Palavras-chave do remetente ou assunto do e-mail a ser lido (ex: 'alerta de segurança', 'equipe bluewhite')." }
            },
            required: ['query']
        }
    },
    {
        name: 'switchToAnalyzer',
        description: 'Abre a ferramenta de análise de documentos e imagens, onde o usuário pode enviar um arquivo.',
        parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: 'switchToVoiceChat',
        description: 'Inicia uma conversa de voz em tempo real para uma interação mais fluida.',
        parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: 'switchToInstallerCreator',
        description: 'Abre a ferramenta para criar um instalador de desktop ou instalar o aplicativo como um PWA.',
        parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: 'goBack',
        description: 'Volta para a tela ou aba anterior no aplicativo.',
        parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: 'closeCurrentTab',
        description: 'Fecha a visualização atual e retorna para a tela principal do assistente.',
        parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: 'closeAction',
        description: 'Cancela a tarefa atualmente em execução na visualização do assistente.',
        parameters: { type: Type.OBJECT, properties: {} }
    }
];

let sessionPromise: Promise<any> | null = null;
let mediaStream: MediaStream | null = null;
let inputAudioContext: AudioContext | null = null;
let outputAudioContext: AudioContext | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;
let mediaStreamSource: MediaStreamAudioSourceNode | null = null;
let nextStartTime = 0;
const sources = new Set<AudioBufferSourceNode>();

// --- Audio Encoding/Decoding Utilities ---

function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

// --- Service Interface ---

interface SessionCallbacks {
    onStatusChange: (status: VoiceSessionStatus) => void;
    onTranscriptionUpdate: (isFinal: boolean, userText: string, modelText: string) => void;
    onFunctionCall: (func: { name: string; args: any; }) => void;
    onError: (error: string) => void;
}

export const startSession = async (callbacks: SessionCallbacks): Promise<void> => {
    if (sessionPromise) {
        console.warn("Session already active.");
        return;
    }

    callbacks.onStatusChange('connecting');

    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        
        let currentInputTranscription = '';
        let currentOutputTranscription = '';

        sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    callbacks.onStatusChange('active');
                    if (!inputAudioContext || !mediaStream) return;
                    
                    mediaStreamSource = inputAudioContext.createMediaStreamSource(mediaStream);
                    scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        if (sessionPromise) {
                           sessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        }
                    };
                    mediaStreamSource.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.toolCall) {
                        for (const fc of message.toolCall.functionCalls) {
                            if (fc.name && fc.id) {
                                callbacks.onFunctionCall(fc as { name: string; args: any; });
                                const result = "ok";
                                const functionResponse = {
                                    id: fc.id,
                                    name: fc.name,
                                    response: { result },
                                };
                                
                                if (sessionPromise) {
                                    sessionPromise.then((session) => {
                                        // The API expects a payload with a plural `functionResponses` key,
                                        // but the value is a single response object per call, not a batched array.
                                        session.sendToolResponse({ functionResponses: functionResponse });
                                    });
                                }
                            }
                        }
                    }

                    if (message.serverContent?.outputTranscription) {
                        currentOutputTranscription += message.serverContent.outputTranscription.text;
                    }
                    if (message.serverContent?.inputTranscription) {
                        currentInputTranscription += message.serverContent.inputTranscription.text;
                    }
                    
                    callbacks.onTranscriptionUpdate(false, currentInputTranscription, currentOutputTranscription);
                    
                    if (message.serverContent?.turnComplete) {
                        callbacks.onTranscriptionUpdate(true, currentInputTranscription, currentOutputTranscription);
                        currentInputTranscription = '';
                        currentOutputTranscription = '';
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio && outputAudioContext) {
                        nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContext.destination);
                        source.addEventListener('ended', () => {
                            sources.delete(source);
                        });
                        source.start(nextStartTime);
                        nextStartTime += audioBuffer.duration;
                        sources.add(source);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Session error:', e);
                    callbacks.onError(e.message || 'Ocorreu um erro desconhecido na sessão de voz.');
                    callbacks.onStatusChange('error');
                    stopSession();
                },
                onclose: (e: CloseEvent) => {
                     console.log('Session closed.');
                     callbacks.onStatusChange('stopped');
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                tools: [{ functionDeclarations: liveFunctionDeclarations }, { codeExecution: {} }],
                systemInstruction: `Você é 'Blue', um assistente de IA superinteligente. Sua missão é ajudar os usuários com qualquer pergunta ou tarefa. Você está integrado com as ferramentas do Google Workspace (simuladas) e outras ferramentas do aplicativo. Sua personalidade é espirituosa, enérgica e prestativa. Mantenha as respostas de voz concisas e conversacionais. Para interagir com o aplicativo ou executar tarefas, você DEVE usar as funções fornecidas ('tools'). Sempre que usar uma ferramenta, informe ao usuário o que você está fazendo. Você também pode abrir o painel de anúncios do Facebook. Se o usuário disser "Blue" no início, trate isso como um comando direto. Você também pode controlar a navegação com comandos como 'voltar' (usando \`goBack\`) e 'fechar' (usando \`closeCurrentTab\`) para retornar à tela principal.`,
            },
        });
    } catch (error) {
        console.error("Failed to start session:", error);
        callbacks.onError("Não foi possível obter permissão do microfone. Por favor, verifique as configurações do seu navegador e acesse o site via HTTPS.");
        callbacks.onStatusChange('error');
    }
};

export const stopSession = async (): Promise<void> => {
    if (sessionPromise) {
        try {
            const session = await sessionPromise;
            session.close();
        } catch (e) {
            console.error("Error closing session:", e);
        }
    }
    
    scriptProcessor?.disconnect();
    scriptProcessor = null;
    mediaStreamSource?.disconnect();
    mediaStreamSource = null;

    mediaStream?.getTracks().forEach(track => track.stop());
    mediaStream = null;

    if (inputAudioContext && inputAudioContext.state !== 'closed') {
        inputAudioContext.close();
    }
    inputAudioContext = null;
    
    if (outputAudioContext && outputAudioContext.state !== 'closed') {
        outputAudioContext.close();
    }
    outputAudioContext = null;
    
    sources.forEach(source => source.stop());
    sources.clear();
    nextStartTime = 0;

    sessionPromise = null;
};
