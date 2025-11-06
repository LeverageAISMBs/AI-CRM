
import React, { useState, useMemo } from 'react';
import { CalendarEvent } from '../types';

interface CalendarPageProps {
    events: CalendarEvent[];
}

const CalendarPage: React.FC<CalendarPageProps> = ({ events }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const daysInMonth = useMemo(() => {
        const days = [];
        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - startDate.getDay());

        const endDate = new Date(lastDayOfMonth);
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

        let currentDatePointer = new Date(startDate);
        while (currentDatePointer <= endDate) {
            days.push(new Date(currentDatePointer));
            currentDatePointer.setDate(currentDatePointer.getDate() + 1);
        }
        return days;
    }, [currentDate]);
    
    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        events.forEach(event => {
            const dateKey = new Date(event.start).toDateString();
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)?.push(event);
        });
        return map;
    }, [events]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };
    
    const eventColors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500'];

    return (
        <div className="flex flex-col h-full w-full p-4 md:p-6 text-gray-200">
            <header className="flex-shrink-0 mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <button onClick={handlePrevMonth} className="px-3 py-1.5 rounded-lg bg-gray-700/80 hover:bg-gray-700 transition-colors">&lt;</button>
                    <button onClick={handleToday} className="px-4 py-1.5 rounded-lg bg-gray-700/80 hover:bg-gray-700 transition-colors">Today</button>
                    <button onClick={handleNextMonth} className="px-3 py-1.5 rounded-lg bg-gray-700/80 hover:bg-gray-700 transition-colors">&gt;</button>
                </div>
                <h2 className="text-xl md:text-2xl font-semibold">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="w-28"></div>
            </header>

            <div className="flex-1 grid grid-cols-7 grid-rows-[auto,1fr] gap-px bg-gray-700/50 rounded-lg overflow-hidden border border-gray-700/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-medium text-xs sm:text-sm p-2 bg-gray-800/70 text-gray-400">
                        {day}
                    </div>
                ))}

                {daysInMonth.map((day, index) => {
                    const dayEvents = eventsByDate.get(day.toDateString()) || [];
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    return (
                        <div
                            key={index}
                            className={`p-2 bg-gray-800 flex flex-col relative transition-colors ${!isCurrentMonth ? 'bg-gray-900/50' : ''} ${isToday(day) ? 'border-2 border-indigo-500' : ''}`}
                        >
                            <span className={`text-xs sm:text-sm font-semibold ${isCurrentMonth ? 'text-gray-200' : 'text-gray-600'}`}>
                                {day.getDate()}
                            </span>
                             <div className="mt-1 flex-1 overflow-y-auto space-y-1">
                                {dayEvents.map((event, eventIndex) => (
                                    <div 
                                      key={event.id}
                                      className={`p-1 rounded-md text-xs text-white truncate ${eventColors[eventIndex % eventColors.length]}`}
                                    >
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarPage;
