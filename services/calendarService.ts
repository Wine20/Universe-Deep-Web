import type { CalendarEvent } from '../types';

// Mock data for the calendar, now managed by this service
const mockEvents: CalendarEvent[] = [
    { id: '1', title: 'Reunião de Sincronização do Projeto', startTime: '10:00', endTime: '11:00', description: 'Alinhamento semanal da equipe sobre o Projeto Phoenix.' },
    { id: '2', title: 'Alinhamento com a Equipe de Marketing', startTime: '14:00', endTime: '14:30', description: 'Discutir a próxima campanha de lançamento.' },
    { id: '3', title: 'Consulta Médica', startTime: '16:30', endTime: '17:00', description: 'Check-up anual.' },
    { id: '4', title: 'Entregar Relatório Financeiro', startTime: '09:00', endTime: '09:30', description: 'Enviar o Q3 para o financeiro.' },
];

export const getEvents = (): CalendarEvent[] => {
    // Return a copy sorted by start time
    return [...mockEvents].sort((a, b) => a.startTime.localeCompare(b.startTime));
}

interface NewEventData {
    title: string;
    startTime: string; // ISO string
    description?: string;
}

export const addEvent = (eventData: NewEventData): void => {
    const startDate = new Date(eventData.startTime);
    // Add 1 hour for a default duration
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const newEvent: CalendarEvent = {
        id: `evt-${Date.now()}`,
        title: eventData.title,
        startTime: startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        endTime: endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        description: eventData.description,
    };

    // Add the new event to the start of the array to make it visible
    mockEvents.unshift(newEvent);
    console.log("Event added:", newEvent);
    console.log("Current events:", mockEvents);
}
