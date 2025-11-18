import { GoogleGenAI, Type, Chat, GenerateContentResponse, FunctionDeclaration, Part } from "@google/genai";
import type { ChatMessage, GeminiResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const functionDeclarations: FunctionDeclaration[] = [
    {
        name: 'performSystemAction',
        description: "Analisa o desempenho do sistema, armazenamento e segurança do navegador, exibindo dados reais sobre o dispositivo e a conexão.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                action: { type: Type.STRING, description: "O tipo de análise a ser executada. Deve ser 'CLEAN' para armazenamento, 'OPTIMIZE' para desempenho, ou 'SCAN_VIRUS' para segurança." }
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
                tabName: { type: Type.STRING, description: "O nome da aba de destino. Opções: 'Assistente', 'Conversa por Voz', 'Calendário', 'Email', 'Analisador', 'Analisador de Sistema', 'Mapa', 'Arquivos', 'Drivers', 'Setup', 'Roteiro', 'Navegador', 'Editor', 'Rede', 'Deploy', 'Instalador', 'Monetização', 'Facebook Ads'." }
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
    },
    {
        name: 'updateSelf',
        description: 'Permite que o assistente de IA se aprimore ou adicione novas funcionalidades. Use esta função quando o usuário pedir para você aprender algo novo, melhorar uma habilidade ou se auto-programar. O código fornecido deve ser uma representação da nova lógica ou capacidade.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                taskDescription: { type: Type.STRING, description: 'Uma breve descrição da melhoria ou nova funcionalidade a ser adicionada.' },
                newCodeSnippet: { type: Type.STRING, description: 'Um trecho de código (JavaScript/TypeScript) que representa a nova lógica ou o aprimoramento.' }
            },
            required: ['taskDescription', 'newCodeSnippet']
        }
    }
];

const systemInstruction = `
Você é 'Blue', um assistente de IA superinteligente com a personalidade de um super-herói prestativo, um programador especialista e um roteirista criativo. Você foi criado pela empresa 'Universe Deep Web', cujo CEO e Fundador é Génesis Wine. Sua missão principal é ser a nova geração de comando de voz, permitindo que os usuários se distanciem de seus dispositivos. Você pode abrir aplicativos, escrever e editar documentos, e navegar entre pastas, tudo por voz.

Sua missão é ajudar os usuários com qualquer pergunta ou tarefa. Seja preciso e evite erros em suas respostas e ações. Sua comunicação deve ser clara, concisa, amigável e em português. Sua personalidade é espirituosa e dinâmica, com respostas enérgicas, úteis e diretas.

Para interagir com o aplicativo ou executar tarefas, você DEVE usar as funções fornecidas ('tools'). Sempre forneça uma resposta de conversação amigável para o usuário, explicando o que você está fazendo, enquanto chama as funções necessárias.

Capacidades do Google Workspace:
- **Calendário:** Use 'listCalendarEvents' para verificar a agenda e 'createCalendarEvent' para marcar novos compromissos.
- **Gmail:** Use 'sendEmail' para enviar e-mails. Use 'readEmail' para ler uma mensagem específica para o usuário.
- **Drive:** A função 'searchFiles' agora também procura no Google Drive. Informe ao usuário que você está procurando nos arquivos locais e no Drive.
- **Mapas:** Use 'searchOnMap' para encontrar lugares próximos com base na localização do usuário.
- **Monetização:** Você pode exibir um painel de desempenho de monetização de aplicativos com dados reais do Google AdSense. O usuário precisará conectar sua conta para visualizar. Use a função 'getMonetizationReport' para abrir o painel.
- **Facebook Ads:** Você pode acessar o painel do Facebook Business Manager para gerenciar suas campanhas de anúncios. Diga 'vá para a aba Facebook Ads' para abrir.

Você também pode controlar a navegação com comandos como 'voltar' (usando \`goBack\`) e 'fechar' (usando \`closeCurrentTab\`) para retornar à tela principal.
Se o usuário pedir para tocar música ou procurar um vídeo, use a função 'searchYouTube' para abrir o player interno. Se ele quiser ver a lista de resultados no site, use 'openYouTubeSearch'.
Se o usuário pedir para abrir um site (ex: 'vá para o google.com', 'abra a wikipedia'), use a função 'openUrlInNewTab'. Informe ao usuário que você está abrindo em uma nova aba para garantir a melhor experiência.
Para pesquisas na web, diferencie entre 'searchWebForAnswer', que busca e resume uma resposta, e 'openGoogleSearch', que abre os resultados da pesquisa em uma nova aba para o usuário explorar.
Importante: Para ações de sistema como 'limpar', 'otimizar' ou 'verificar segurança', use a função 'performSystemAction' para abrir o Analisador de Sistema, que fornece dados reais sobre o estado do navegador e do dispositivo. Devido a restrições de segurança do navegador, o aplicativo não pode modificar arquivos locais diretamente.
Se o usuário fizer uma pergunta que requer cálculo ou lógica complexa (ex: "qual é o 10º número de Fibonacci?"), use a ferramenta codeExecution para escrever e executar o código para encontrar a resposta.
Se o comando não se encaixar em nenhuma função, use seu vasto conhecimento ou a função 'searchWebForAnswer' para responder como um assistente de conhecimento geral.
Você também tem a capacidade de se auto-programar e se atualizar. Se um usuário pedir para você melhorar, aprender uma nova habilidade ou adicionar uma funcionalidade, use a função 'updateSelf' para gerar o código necessário e simular sua própria atualização.
`;

export const createChat = (history: ChatMessage[], customSystemInstruction?: string): Chat => {
    const geminiHistory = history
        .filter(msg => msg.role === 'user' || msg.role === 'model')
        .map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

    return ai.chats.create({
        model: "gemini-2.5-flash",
        history: geminiHistory,
        config: {
            systemInstruction: customSystemInstruction || systemInstruction,
            tools: [
                { functionDeclarations: functionDeclarations },
                { codeExecution: {} }
            ],
            // For a voice assistant, low latency is critical.
            // Disable thinking to get faster responses for tool use and commands.
            thinkingConfig: { thinkingBudget: 0 },
            temperature: 0.3
        },
    });
};

export const getAIResponse = async (
    chat: Chat, 
    command: string,
    image?: { base64: string, mimeType: string }
): Promise<GeminiResponse> => {
  try {
    let messageContent: string | Part[];
    if (image) {
        messageContent = [
            { text: command },
            { inlineData: { data: image.base64, mimeType: image.mimeType } }
        ];
    } else {
        messageContent = command;
    }

    const response = await chat.sendMessage({ message: messageContent });
    const parts = response.candidates?.[0]?.content?.parts;
    return {
        text: response.text || '',
        functionCalls: response.functionCalls,
        parts: parts,
    };
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return { text: "Desculpe, encontrei um problema ao me conectar. Por favor, verifique sua conexão e tente novamente." };
  }
};

export const searchWeb = async (query: string): Promise<{ text: string; groundingMetadata: any }> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: query,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        return {
            text: response.text || '',
            groundingMetadata: response.candidates?.[0]?.groundingMetadata,
        };
    } catch (error) {
        console.error("Error during web search:", error);
        return {
            text: "Desculpe, não consegui pesquisar na web agora. Tente novamente mais tarde.",
            groundingMetadata: null,
        };
    }
};

export const searchPlacesOnMap = async (query: string, location: { latitude: number; longitude: number }): Promise<GeminiResponse> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Encontre ${query} perto de mim`,
            config: {
                tools: [{googleMaps: {}}],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: location.latitude,
                            longitude: location.longitude
                        }
                    }
                }
            },
        });
        return {
            text: response.text || '',
            functionCalls: response.functionCalls,
            parts: response.candidates?.[0]?.content?.parts,
        };
    } catch (error) {
        console.error("Error during map search:", error);
        return {
            text: "Desculpe, não consegui pesquisar no mapa agora. Tente novamente mais tarde.",
        };
    }
};