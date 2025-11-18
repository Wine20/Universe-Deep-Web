import type { Email } from '../types';

const mockEmails: Email[] = [
    {
        id: 'email-1',
        sender: 'Equipe Bluewhite',
        subject: 'Bem-vindo ao Bluewhite AI!',
        snippet: 'Estamos felizes em ter você a bordo. Aqui estão algumas dicas...',
        body: 'Olá! Seja bem-vindo ao Bluewhite AI, seu novo assistente pessoal. Você pode me pedir para realizar tarefas do sistema, escrever roteiros, criar projetos de código e muito mais. Basta usar sua voz. Experimente dizer "Otimize meu sistema".',
        unread: true,
        timestamp: '09:30'
    },
    {
        id: 'email-2',
        sender: 'Alerta de Segurança',
        subject: 'Atividade de login suspeita detectada',
        snippet: 'Detectamos um novo login em sua conta a partir de um dispositivo desconhecido.',
        body: 'Prezado usuário, um novo login na sua conta Bluewhite AI foi detectado a partir de um dispositivo "Chrome no Windows" em São Paulo, Brasil. Se foi você, pode ignorar esta mensagem. Se não foi você, por favor, proteja sua conta imediatamente.',
        unread: true,
        timestamp: 'Ontem'
    },
    {
        id: 'email-3',
        sender: 'Notícias de Tecnologia',
        subject: 'Lançamento do novo Quantum Processor X',
        snippet: 'A próxima geração de processamento de IA está aqui e promete revolucionar...',
        body: 'A TechCorp anunciou hoje o lançamento do Quantum Processor X, um chip que promete velocidades de computação 100x mais rápidas para tarefas de inteligência artificial. Analistas preveem um grande impacto no desenvolvimento de modelos de linguagem e computação em nuvem.',
        unread: false,
        timestamp: 'Sexta-feira'
    },
    {
        id: 'email-4',
        sender: 'Lembrete de Projeto',
        subject: 'Prazo final para o "Projeto Fênix" se aproximando',
        snippet: 'Lembrete amigável de que o prazo para a entrega do projeto é esta semana.',
        body: 'Olá, este é um lembrete de que o prazo final para o "Projeto Fênix" é nesta sexta-feira. Por favor, certifique-se de que todos os seus commits foram enviados para o repositório principal.',
        unread: false,
        timestamp: 'Quinta-feira'
    }
];

export const getEmails = (): Email[] => {
    // Return a copy to avoid direct mutation from outside
    return [...mockEmails];
}

export const findEmail = (query: string): Email | null => {
    const lowerQuery = query.toLowerCase();
    const email = mockEmails.find(e => 
        e.sender.toLowerCase().includes(lowerQuery) || 
        e.subject.toLowerCase().includes(lowerQuery)
    );
    return email || null;
}

export const addSentEmail = (subject: string, body: string, recipient: string): void => {
    const newEmail: Email = {
        id: `email-${Date.now()}`,
        sender: 'Eu', // From the user's perspective
        subject: subject,
        snippet: body.substring(0, 50) + '...',
        body: `Para: ${recipient}\n\n${body}`,
        unread: false,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    mockEmails.unshift(newEmail); // Add to the top of the list
}
