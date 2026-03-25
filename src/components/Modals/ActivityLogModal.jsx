import React, { useState, useEffect, useContext, createContext } from 'react';
import { 
  Calendar as CalendarIcon, Users, LayoutList, Search, Clock, Award, 
  PartyPopper, Hand, X, ChevronRight, CheckCircle2, AlertCircle, 
  ChevronDown, ChevronUp, CheckSquare, MessageSquare, FileText, Send, 
  Plus, ExternalLink, Trophy, Medal, Phone, Video, Link as LinkIcon, 
  Receipt, Landmark, Download, ImageIcon, Check, XCircle
} from 'lucide-react';
import { MOCK_USERS, MOCK_EVENTS } from '../../data/mockData';

export function ActivityLogModal({ activityLog, onClose }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  const filtered = activityLog.filter(entry => {
    const matchesSearch = entry.targetName.toLowerCase().includes(search.toLowerCase()) ||
                          entry.eventTitle.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' ||
      (filterType === 'Hours' && entry.actionType === 'hours') ||
      (filterType === 'Appreciate' && entry.actionType === 'appreciate') ||
      (filterType === 'Slap' && entry.actionType === 'slap');
    return matchesSearch && matchesType;
  });

  const exportCSV = () => {
    const header = 'Action,Target,Event,Hours,Logged By,Designation,Timestamp';
    const rows = activityLog.map(e =>
      `"${e.actionType}","${e.targetName}","${e.eventTitle}","${e.hours || ''}","${e.giverName || ''}","${e.giverRole}","${e.timestamp}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_log_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Activity Log</h2>
              <p className="text-xs text-gray-500">{activityLog.length} total entries</p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
              <X size={20} />
            </button>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or event..."
              className="w-full bg-gray-100 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex bg-gray-100 p-0.5 rounded-lg">
            {['All', 'Hours', 'Appreciate', 'Slap'].map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all
                  ${filterType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* Entries */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 bg-gray-50/50">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">No entries match your filter.</div>
          ) : (
            filtered.map(entry => <ActivityLogEntry key={entry.id} entry={entry} />)
          )}
        </div>

        {/* Footer with Export */}
        <div className="p-3 border-t border-gray-100 bg-white flex space-x-2">
          <button
            onClick={exportCSV}
            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 shadow-sm transition-colors flex items-center justify-center"
          >
            <FileText size={16} className="mr-2" />
            Export CSV
          </button>
          <button
            onClick={exportCSV}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <Download size={16} className="mr-2" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
