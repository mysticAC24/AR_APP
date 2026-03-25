import React, { useState, useEffect, useContext, createContext } from 'react';
import { 
  Calendar as CalendarIcon, Users, LayoutList, Search, Clock, Award, 
  PartyPopper, Hand, X, ChevronRight, CheckCircle2, AlertCircle, 
  ChevronDown, ChevronUp, CheckSquare, MessageSquare, FileText, Send, 
  Plus, ExternalLink, Trophy, Medal, Phone, Video, Link as LinkIcon, 
  Receipt, Landmark, Download, ImageIcon, Check, XCircle
} from 'lucide-react';
import { MOCK_USERS, MOCK_EVENTS } from '../../data/mockData';

export function LeaderboardTab() {
  const [sortBy, setSortBy] = useState('hours');
  const [filterLevel, setFilterLevel] = useState('All');

  const sortFn = (a, b) => {
    if (sortBy === 'hours') {
      return b.hours - a.hours || b.badges.appreciate - a.badges.appreciate;
    } else {
      return b.badges.appreciate - a.badges.appreciate || b.hours - a.hours;
    }
  };

  const filteredUsers = [...MOCK_USERS]
    .filter(u => {
      if (filterLevel === 'Coordinators') return u.level === 'Coordinator';
      if (filterLevel === 'Reps') return u.level === 'Representative';
      return true;
    })
    .sort(sortFn);

  return (
    <div className="flex flex-col animate-in fade-in duration-300">
      <div className="bg-white p-5 border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Trophy className="text-yellow-500 mr-3" size={28} />
          Leaderboard
        </h1>

        {/* Level Filter: All / Coordinators / Reps */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-3">
          {['All', 'Coordinators', 'Reps'].map(level => (
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

        {/* Sort By: Most Hours / Most Appreciated */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setSortBy('hours')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all
              ${sortBy === 'hours' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
          >
            Most Hours
          </button>
          <button
            onClick={() => setSortBy('appreciations')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all
              ${sortBy === 'appreciations' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
          >
            Most Appreciated
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filteredUsers.map((user, index) => {
          const rank = index + 1;
          let rankStyles = "bg-white border-gray-100";
          let rankBadge = <span className="font-bold text-gray-500 w-6 text-center">{rank}</span>;

          if (rank === 1) {
            rankStyles = "bg-yellow-50 border-yellow-300 shadow-sm";
            rankBadge = <Trophy size={20} className="text-yellow-500 mx-1" />;
          } else if (rank === 2) {
            rankStyles = "bg-slate-50 border-slate-300 shadow-sm";
            rankBadge = <Medal size={20} className="text-slate-400 mx-1" />;
          } else if (rank === 3) {
            rankStyles = "bg-orange-50 border-orange-300 shadow-sm";
            rankBadge = <Medal size={20} className="text-orange-500 mx-1" />;
          }

          return (
            <div key={user.id} className={`p-4 rounded-xl border flex items-center ${rankStyles}`}>
              <div className="flex items-center justify-center w-8 mr-3">{rankBadge}</div>
              <div className="relative mr-4">
                <img src={user.image} alt={user.name} className={`w-12 h-12 rounded-full bg-white border-2 ${rank === 1 ? 'border-yellow-400' : 'border-transparent'}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{user.name}</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{user.vertical} {user.role === 'Coordinator' ? 'Coord.' : 'Rep'}</p>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold flex items-center justify-end ${sortBy === 'hours' ? 'text-blue-600' : 'text-gray-500'}`}>
                  {user.hours} <span className="text-[10px] font-medium ml-1">hrs</span>
                </div>
                <div className={`text-sm font-bold flex items-center justify-end ${sortBy === 'appreciations' ? 'text-green-600' : 'text-gray-500'}`}>
                  {user.badges.appreciate} <PartyPopper size={12} className="ml-1" />
                </div>
              </div>
            </div>
          );
        })}
        {filteredUsers.length === 0 && <div className="text-center py-10 text-gray-400">No members match this filter.</div>}
      </div>
    </div>
  );
}
