import React, { useState, useEffect } from 'react';
import type { CalendarEvent } from '../types';
import { getEvents } from '../services/calendarService';
import { CalendarIcon } from './Icons';

const EventCard: React.FC<{ event: CalendarEvent, isToday?: boolean }> = ({ event, isToday = false }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg flex space-x-4 border-l-4 border-blue-500 animate-fade-in">
        <div className="flex-shrink-0 text-center font-semibold">
            <p className="text-blue-300">{event.startTime}</p>
            <p className="text-xs text-gray-500">às</p>
            <p className="text-gray-400">{event.endTime}</p>
        </div>
        <div className="flex-grow">
            <h4 className="font-bold text-gray-200">{event.title}</h4>
            {event.description && <p className="text-sm text-gray-400 mt-1">{event.description}</p>}
        </div>
    </div>
);


export const CalendarView: React.FC = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    useEffect(() => {
        // Fetch events from the service when the component mounts
        setEvents(getEvents());
    }, []);

    // For demonstration, we'll split events into "Today" and "Tomorrow"
    // In a real app, this would involve date comparisons
    const todayEvents = events.slice(0, 3);
    const tomorrowEvents = events.slice(3);

    return (
        <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-200 flex items-center mb-6 flex-shrink-0">
                <CalendarIcon className="h-7 w-7 mr-3" />
                Calendário
            </h2>
            
            <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-blue-300 mb-3 border-b border-gray-700 pb-2">Hoje</h3>
                    <div className="space-y-3">
                        {todayEvents.length > 0 ? 
                            todayEvents.map(event => <EventCard key={event.id} event={event} isToday />) :
                            <p className="text-gray-500 text-sm">Nenhum compromisso para hoje.</p>
                        }
                    </div>
                </div>
                
                {tomorrowEvents.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-blue-300 mb-3 border-b border-gray-700 pb-2">Próximos</h3>
                        <div className="space-y-3">
                            {tomorrowEvents.map(event => <EventCard key={event.id} event={event} />)}
                        </div>
                    </div>
                )}
            </div>
             <p className="text-xs text-gray-500 text-center mt-4 flex-shrink-0">
                Peça ao Blue para "ver meus compromissos" ou "marcar uma reunião".
            </p>
        </div>
    );
};