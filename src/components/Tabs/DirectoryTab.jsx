import React, { useState, useEffect, useContext, createContext } from 'react';
import { 
  Calendar as CalendarIcon, Users, LayoutList, Search, Clock, Award, 
  PartyPopper, Hand, X, ChevronRight, CheckCircle2, AlertCircle, 
  ChevronDown, ChevronUp, CheckSquare, MessageSquare, FileText, Send, 
  Plus, ExternalLink, Trophy, Medal, Phone, Video, Link as LinkIcon, 
  Receipt, Landmark, Download, ImageIcon, Check, XCircle
} from 'lucide-react';
import { MOCK_USERS, MOCK_EVENTS } from '../../data/mockData';

export function DirectoryTab() {
  const [filterRole, setFilterRole] = useState('All');
  const [filterLevel, setFilterLevel] = useState('All');
  const [freeNow, setFreeNow] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const roles = ['All', 'Networking', 'Design', 'Operations', 'Media'];
  const levels = ['All', 'Coordinators', 'Reps'];

  const filteredUsers = MOCK_USERS.filter(user => {
    if (filterRole !== 'All' && user.role !== filterRole) return false;
    if (filterLevel !== 'All') {
      if (filterLevel === 'Coordinators' && user.level !== 'Coordinator') return false;
      if (filterLevel === 'Reps' && user.level !== 'Representative') return false;
    }
    if (freeNow && !user.isFreeNow) return false;
    return true;
  });

  return (
    <div className="flex flex-col animate-in fade-in duration-300">
      {/* Header & Filters */}
      <div className="bg-white p-5 border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Team Directory</h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search team members..."
            className="w-full bg-gray-100 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Level Filters (Coordinators vs Reps) */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
          {levels.map(level => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all
                ${filterLevel === level ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Scrollable Role Filters */}
        <div className="flex overflow-x-auto hide-scrollbar space-x-2 pb-2">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                ${filterRole === role ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Free Now Toggle */}
        <div className="flex items-center justify-between mt-3 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
          <div className="flex items-center">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-semibold text-green-800">Free Now (No Class)</span>
          </div>
          <button
            onClick={() => setFreeNow(!freeNow)}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${freeNow ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute transition-transform ${freeNow ? 'translate-x-6' : 'translate-x-1'}`}></div>
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="p-4 space-y-3">
        {filteredUsers.map(user => (
          <div
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center cursor-pointer hover:border-blue-300 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="relative">
              <img src={user.image} alt={user.name} className={`w-12 h-12 rounded-full border-2 ${user.level === 'Coordinator' ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}`} />
              {user.isFreeNow && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-semibold text-gray-800">{user.name}</h3>
              <p className="text-xs text-gray-500">
                {user.role} <span className={user.level === 'Coordinator' ? 'font-semibold text-blue-600' : ''}>{user.level === 'Coordinator' ? 'Coordinator' : 'Rep'}</span>
              </p>
            </div>

            <ChevronRight className="text-gray-300" size={20} />
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            No members match this filter.
          </div>
        )}
      </div>

      {/* User Profile / Class Grid Modal */}
      {selectedUser && (
        <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
