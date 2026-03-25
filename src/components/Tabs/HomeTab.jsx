import React, { useState, useEffect, useContext, createContext } from 'react';
import { 
  Calendar as CalendarIcon, Users, LayoutList, Search, Clock, Award, 
  PartyPopper, Hand, X, ChevronRight, CheckCircle2, AlertCircle, 
  ChevronDown, ChevronUp, CheckSquare, MessageSquare, FileText, Send, 
  Plus, ExternalLink, Trophy, Medal, Phone, Video, Link as LinkIcon, 
  Receipt, Landmark, Download, ImageIcon, Check, XCircle
} from 'lucide-react';
import { MOCK_USERS, MOCK_EVENTS } from '../../data/mockData';

export function HomeTab({ activityLog = [], currentUserRole }) {
  const upcomingEvents = MOCK_EVENTS.filter(e => e.status === 'upcoming' || e.status === 'ongoing');
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [selectedDate, setSelectedDate] = useState(19);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="bg-blue-600 p-6 text-white rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-1">Alumni Relations</h1>
        <p className="text-blue-100 text-sm opacity-90">Overview & Schedule</p>
      </div>

      <div className="p-5 space-y-6">
        {/* Mock Calendar UI */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">March 2026</h2>
            <div className="flex space-x-2">
              <button className="p-1 rounded bg-gray-50 text-gray-600">&lt;</button>
              <button className="p-1 rounded bg-gray-50 text-gray-600">&gt;</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-2">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            <div className="p-2 text-gray-300">1</div><div className="p-2 text-gray-300">2</div>
            {[...Array(29)].map((_, i) => {
              const day = i + 3;
              const hasEvent = day === 20 || day === 25;
              const isToday = day === 19;
              const isSelected = day === selectedDate;
              return (
                <div 
                  key={day} 
                  onClick={() => setSelectedDate(day)}
                  className={`
                    p-2 rounded-full flex items-center justify-center h-8 w-8 mx-auto cursor-pointer transition-all active:scale-95
                    ${isSelected ? 'bg-blue-600 text-white font-bold ring-4 ring-blue-100' : ''}
                    ${isToday && !isSelected ? 'text-blue-600 font-bold border border-blue-600' : ''}
                    ${hasEvent && !isSelected ? 'bg-blue-50 text-blue-700 font-bold relative' : ''}
                    ${!isToday && !hasEvent && !isSelected ? 'text-gray-700 hover:bg-gray-100' : ''}
                  `}>
                  {day}
                  {hasEvent && !isSelected && <span className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full"></span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events List */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <CalendarIcon size={18} className="mr-2 text-blue-600" />
            Up Next
          </h3>
          <div className="space-y-3">
            {upcomingEvents.map(event => {
              const eventDate = new Date(event.date);
              const isSelected = eventDate.getMonth() === 2 && eventDate.getDate() === selectedDate; 
              return (
              <div key={event.id} className={`bg-white p-4 rounded-xl shadow-sm border ${isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100'} flex items-start transition-all duration-300`}>
                <div className={`${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'} p-3 rounded-lg text-center min-w-[60px] mr-4 transition-colors`}>

                  <div className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                  <div className="text-xl font-bold leading-none mt-1">{new Date(event.date).getDate()}</div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-800">{event.title}</h4>
                    {event.status === 'ongoing' && (
                      <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse">Live</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    <Clock size={14} className="mr-1" /> {event.time}
                  </p>
                  <div className="flex -space-x-2 mt-3 overflow-hidden">
                    {event.team.map(userId => {
                      const user = MOCK_USERS.find(u => u.id === userId);
                      return user ? (
                        <img key={userId} src={user.image} alt={user.name} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-200" title={user.name} />
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

        {/* Team Leader Activity Dashboard */}
        {currentUserRole === 'Team Leader' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Award size={18} className="mr-2 text-indigo-600" />
                Hours & Feedback Log
              </h3>
              <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{activityLog.length} entries</span>
            </div>
            {activityLog.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No activity yet. Log hours or send feedback from the Events tab.
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-50">
                  {activityLog.slice(0, 3).map(entry => (
                    <ActivityLogEntry key={entry.id} entry={entry} />
                  ))}
                </div>
                {activityLog.length > 3 && (
                  <button
                    onClick={() => setShowAllLogs(true)}
                    className="w-full py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center border-t border-gray-100"
                  >
                    View All {activityLog.length} Entries →
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {showAllLogs && (
        <ActivityLogModal activityLog={activityLog} onClose={() => setShowAllLogs(false)} />
      )}
    </div>
  );
}

function ActivityLogEntry({ entry }) {
  let icon, borderColor, bgColor, label;
  if (entry.actionType === 'hours') {
    icon = <Clock size={14} className="text-blue-500" />;
    borderColor = 'border-blue-200';
    bgColor = 'bg-blue-50';
    label = <span className="font-bold text-blue-600">+{entry.hours} hr{entry.hours > 1 ? 's' : ''}</span>;
  } else if (entry.actionType === 'appreciate') {
    icon = <PartyPopper size={14} className="text-green-500" />;
    borderColor = 'border-green-200';
    bgColor = 'bg-green-50';
    label = <span className="font-bold text-green-600">Appreciation</span>;
  } else {
    icon = <Hand size={14} className="text-red-500" />;
    borderColor = 'border-red-200';
    bgColor = 'bg-red-50';
    label = <span className="font-bold text-red-600">Slap</span>;
  }
  return (
    <div className={`flex items-center px-4 py-3 ${bgColor}/30`}>
      <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center mr-3 shrink-0 border ${borderColor}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm">
          {label} → <span className="font-semibold text-gray-800">{entry.targetName}</span>
        </div>
        <div className="text-[10px] text-gray-400 flex items-center mt-0.5">
          <span className="truncate">{entry.eventTitle}</span>
          <span className="mx-1">·</span>
          <span className="font-medium text-gray-500">{entry.giverName || entry.giverRole}</span>
        </div>
      </div>
      <div className="text-[10px] text-gray-400 shrink-0 ml-2">{entry.timestamp}</div>
    </div>
  );
}
