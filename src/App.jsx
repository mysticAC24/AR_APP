import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from './lib/context.jsx';
import { db, storage } from './lib/firebase';
import {
  collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, runTransaction, increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  Calendar as CalendarIcon, Users, LayoutList, Search, Clock, Award,
  PartyPopper, Hand, X, ChevronRight, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, CheckSquare, MessageSquare, FileText, Send,
  Plus, ExternalLink, Trophy, Medal, Phone, Video, Link as LinkIcon,
  Receipt, Check, XCircle, User, UserCircle, Wallet, Landmark,
  Image as ImageIcon, Edit2, Camera, Download, LogOut,
} from 'lucide-react';

import LoginPage from './pages/LoginPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import ProfileTab from './components/ProfileTab.jsx';

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TAB_ORDER = ['home', 'directory', 'events', 'leaderboard', 'profile'];

export default function App() {
  const { firebaseUser, userProfile, authLoading, profileLoading, isOnboarded, toast, showToast } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('home');
  const touchStartX = React.useRef(null);
  const touchStartY = React.useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
    touchStartY.current = e.changedTouches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    // Only trigger if horizontal swipe is dominant and long enough
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    const idx = TAB_ORDER.indexOf(activeTab);
    if (deltaX < 0 && idx < TAB_ORDER.length - 1) setActiveTab(TAB_ORDER[idx + 1]);
    if (deltaX > 0 && idx > 0) setActiveTab(TAB_ORDER[idx - 1]);
  };

  // Auth state machine
  if (authLoading || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) return <LoginPage />;
  if (!isOnboarded) return <OnboardingPage />;

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen font-sans">
      <div className="w-full max-w-md bg-white h-screen flex flex-col shadow-2xl overflow-hidden"
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

        {/* Global Toast */}
        {toast && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-lg text-sm font-semibold max-w-xs text-center animate-in fade-in slide-in-from-top-2 duration-300
            ${toast.type === 'error' ? 'bg-red-600 text-white' : toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-gray-900 text-white'}`}>
            {toast.message}
          </div>
        )}

        {/* App Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'directory' && <DirectoryTab />}
          {activeTab === 'events' && <EventsTab />}
          {activeTab === 'leaderboard' && <LeaderboardTab />}
          {activeTab === 'profile' && <ProfileTab />}
        </div>

        {/* Bottom Navigation — flex child, always at bottom, never overlaps content */}
        <div className="w-full bg-white border-t border-gray-200 flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-[60] flex-shrink-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex justify-around items-center h-16 px-1">
            <NavButton icon={<CalendarIcon size={24} />} label="Home" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <NavButton icon={<Users size={24} />} label="Team" isActive={activeTab === 'directory'} onClick={() => setActiveTab('directory')} />
            <NavButton icon={<LayoutList size={24} />} label="Events" isActive={activeTab === 'events'} onClick={() => setActiveTab('events')} />
            <NavButton icon={<Trophy size={24} />} label="Rankings" isActive={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} />
            <NavButton icon={<User size={24} />} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 1: HOME ──────────────────────────────────────────────────────────────
function HomeTab() {
  const { events, users, currentUserRole, userProfile } = useContext(AppContext);
  const busyDays = new Set((userProfile?.schedule || []).map(s => s.day));
  const [activityLog, setActivityLog] = useState([]);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const q = query(collection(db, 'activity_log'), orderBy('createdAt', 'desc'), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      setActivityLog(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const upcomingEvents = events.filter(e => e.status === 'upcoming' || e.status === 'ongoing');

  const eventDays = new Set(
    events
      .filter(e => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map(e => new Date(e.date).getDate())
  );

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="animate-in fade-in duration-300">
      <div className="bg-blue-600 p-6 text-white rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-1">Alumni Relations</h1>
        <p className="text-blue-100 text-sm opacity-90">Overview & Schedule</p>
      </div>

      <div className="p-5 space-y-6">
        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">{monthName}</h2>
            <div className="flex space-x-2">
              <button
                className="p-1 rounded bg-gray-50 text-gray-600 hover:bg-gray-100"
                onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              >&lt;</button>
              <button
                className="p-1 rounded bg-gray-50 text-gray-600 hover:bg-gray-100"
                onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              >&gt;</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-2">
            {['S','M','T','W','T','F','S'].map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} className="p-2 text-gray-300" />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const hasEvent = eventDays.has(day);
              const isToday = isCurrentMonth && day === today.getDate();
              const isSelected = day === selectedDate && isCurrentMonth;
              const dayOfWeek = new Date(year, month, day).getDay();
              const isBusy = busyDays.has(dayOfWeek);
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`p-2 rounded-full flex items-center justify-center h-8 w-8 mx-auto cursor-pointer transition-all active:scale-95 relative
                    ${isSelected ? 'bg-blue-600 text-white font-bold ring-4 ring-blue-100' : ''}
                    ${isToday && !isSelected ? 'text-blue-600 font-bold border border-blue-600' : ''}
                    ${hasEvent && !isSelected ? 'bg-blue-50 text-blue-700 font-bold' : ''}
                    ${!isToday && !hasEvent && !isSelected ? 'text-gray-700 hover:bg-gray-100' : ''}`}
                >
                  {day}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 flex space-x-0.5">
                    {hasEvent && !isSelected && <span className="w-1 h-1 bg-blue-600 rounded-full"></span>}
                    {isBusy && !isSelected && <span className="w-1 h-1 bg-purple-400 rounded-full"></span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <CalendarIcon size={18} className="mr-2 text-blue-600" /> Up Next
          </h3>
          <div className="space-y-3">
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No upcoming events.</p>
            )}
            {upcomingEvents.map(event => {
              const eventDate = event.date ? new Date(event.date) : null;
              const isSelected = eventDate && eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === selectedDate;
              const allIds = [...(event.coordinatorIds || []), ...(event.representativeIds || [])];
              return (
                <div key={event.id} className={`bg-white p-4 rounded-xl shadow-sm border ${isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100'} flex items-start transition-all duration-300`}>
                  <div className={`${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'} p-3 rounded-lg text-center min-w-[60px] mr-4 transition-colors`}>
                    {eventDate && <>
                      <div className="text-xs font-bold uppercase">{eventDate.toLocaleString('default', { month: 'short' })}</div>
                      <div className="text-xl font-bold leading-none mt-1">{eventDate.getDate()}</div>
                    </>}
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
                      {allIds.slice(0, 5).map(uid => {
                        const u = users.find(u => u.id === uid);
                        return u ? (
                          <img key={uid} src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.fullName}`}
                            alt={u.fullName} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-200" title={u.fullName} />
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Log — all roles can see their relevant entries, TL sees all */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <Award size={18} className="mr-2 text-indigo-600" />
              {currentUserRole === 'Team Leader' ? 'Team Activity' : 'My Activity'}
            </h3>
            <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{activityLog.length} entries</span>
          </div>
          {activityLog.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              No activity yet. Hours and badges appear here.
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
      </div>

      {showAllLogs && <ActivityLogModal activityLog={activityLog} onClose={() => setShowAllLogs(false)} />}
    </div>
  );
}

function ActivityLogEntry({ entry }) {
  let icon, borderColor, bgColor, label;
  const type = entry.type || entry.actionType;
  if (type === 'hours_logged' || type === 'hours') {
    icon = <Clock size={14} className="text-blue-500" />;
    borderColor = 'border-blue-200'; bgColor = 'bg-blue-50';
    label = <span className="font-bold text-blue-600">+{entry.metadata?.hours || entry.hours} hr{(entry.metadata?.hours || entry.hours) > 1 ? 's' : ''}</span>;
  } else if ((type === 'badge_awarded' && entry.metadata?.badge === 'appreciate') || type === 'appreciate') {
    icon = <PartyPopper size={14} className="text-green-500" />;
    borderColor = 'border-green-200'; bgColor = 'bg-green-50';
    label = <span className="font-bold text-green-600">Appreciation</span>;
  } else if ((type === 'badge_awarded' && entry.metadata?.badge === 'slap') || type === 'slap') {
    icon = <Hand size={14} className="text-red-500" />;
    borderColor = 'border-red-200'; bgColor = 'bg-red-50';
    label = <span className="font-bold text-red-600">Slap</span>;
  } else if (type === 'event_created') {
    icon = <CalendarIcon size={14} className="text-indigo-500" />;
    borderColor = 'border-indigo-200'; bgColor = 'bg-indigo-50';
    label = <span className="font-bold text-indigo-600">Event Created</span>;
  } else {
    icon = <Award size={14} className="text-gray-400" />;
    borderColor = 'border-gray-200'; bgColor = 'bg-gray-50';
    label = <span className="font-bold text-gray-500 capitalize">{type?.replace(/_/g, ' ') || 'Activity'}</span>;
  }
  const targetName = entry.targetName || entry.metadata?.targetName;
  const actorName = entry.actorName || entry.giverName;
  const eventTitle = entry.eventTitle;
  const ts = entry.createdAt?.toDate ? entry.createdAt.toDate().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : (entry.timestamp || '');

  return (
    <div className={`flex items-center px-4 py-3 ${bgColor}/30`}>
      <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center mr-3 shrink-0 border ${borderColor}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm">{label} → <span className="font-semibold text-gray-800">{targetName}</span></div>
        <div className="text-[10px] text-gray-400 flex items-center mt-0.5">
          <span className="truncate">{eventTitle}</span>
          {actorName && <><span className="mx-1">·</span><span className="font-medium text-gray-500">{actorName}</span></>}
        </div>
      </div>
      <div className="text-[10px] text-gray-400 shrink-0 ml-2">{ts}</div>
    </div>
  );
}

function ActivityLogModal({ activityLog, onClose }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  const filtered = activityLog.filter(entry => {
    const type = entry.type || entry.actionType;
    const targetName = entry.targetName || '';
    const eventTitle = entry.eventTitle || '';
    const matchesSearch = targetName.toLowerCase().includes(search.toLowerCase()) || eventTitle.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' ||
      (filterType === 'Hours' && (type === 'hours_logged' || type === 'hours')) ||
      (filterType === 'Appreciate' && (entry.metadata?.badge === 'appreciate' || type === 'appreciate')) ||
      (filterType === 'Slap' && (entry.metadata?.badge === 'slap' || type === 'slap'));
    return matchesSearch && matchesType;
  });

  const exportCSV = () => {
    const header = 'Action,Target,Event,Hours,Logged By,Timestamp';
    const rows = activityLog.map(e => {
      const ts = e.createdAt?.toDate ? e.createdAt.toDate().toISOString() : (e.timestamp || '');
      return `"${e.type || e.actionType}","${e.targetName || ''}","${e.eventTitle || ''}","${e.metadata?.hours || e.hours || ''}","${e.actorName || e.giverName || ''}","${ts}"`;
    });
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `activity_log_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Activity Log</h2>
              <p className="text-xs text-gray-500">{activityLog.length} total entries</p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or event..."
              className="w-full bg-gray-100 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          </div>
          <div className="flex bg-gray-100 p-0.5 rounded-lg">
            {['All', 'Hours', 'Appreciate', 'Slap'].map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all ${filterType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 bg-gray-50/50">
          {filtered.length === 0
            ? <div className="p-10 text-center text-gray-400 text-sm">No entries match your filter.</div>
            : filtered.map(entry => <ActivityLogEntry key={entry.id} entry={entry} />)
          }
        </div>
        <div className="p-3 border-t border-gray-100 bg-white flex space-x-2">
          <button onClick={exportCSV} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 shadow-sm transition-colors flex items-center justify-center">
            <Download size={16} className="mr-2" /> Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 2: DIRECTORY ─────────────────────────────────────────────────────────
function DirectoryTab() {
  const { users } = useContext(AppContext);
  const [filterVertical, setFilterVertical] = useState('All');
  const [filterRole, setFilterRole] = useState('All');
  const [freeNow, setFreeNow] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const verticals = ['All', 'Networking', 'Design', 'Operations', 'Media'];
  const rolesFilter = ['All', 'Coordinators', 'Reps'];

  const filteredUsers = users.filter(user => {
    if (searchQuery && !user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterVertical !== 'All' && user.vertical !== filterVertical) return false;
    if (filterRole !== 'All') {
      if (filterRole === 'Coordinators' && user.role !== 'Coordinator') return false;
      if (filterRole === 'Reps' && user.role !== 'Representative') return false;
    }
    if (freeNow && !user.isFreeNow) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="bg-white p-5 border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Team Directory</h1>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search team members..."
            className="w-full bg-gray-100 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>

        {/* Role filter (All / Coordinators / Reps) */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
          {rolesFilter.map(level => (
            <button key={level} onClick={() => setFilterRole(level)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterRole === level ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>{level}</button>
          ))}
        </div>

        {/* Vertical filter pills */}
        <div className="flex overflow-x-auto hide-scrollbar space-x-2 pb-2">
          {verticals.map(v => (
            <button key={v} onClick={() => setFilterVertical(v)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                ${filterVertical === v ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{v}</button>
          ))}
        </div>

        {/* Free Now Toggle */}
        <div className="flex items-center justify-between mt-3 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
          <div className="flex items-center">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-semibold text-green-800">Free Now (No Class)</span>
          </div>
          <button onClick={() => setFreeNow(!freeNow)}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${freeNow ? 'bg-green-500' : 'bg-gray-300'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute transition-transform ${freeNow ? 'translate-x-6' : 'translate-x-1'}`}></div>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filteredUsers.map(user => (
          <div key={user.id} onClick={() => setSelectedUser(user)}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center cursor-pointer hover:border-blue-300 hover:shadow-md transition-all active:scale-[0.98]">
            <div className="relative">
              <img src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                alt={user.fullName} className={`w-12 h-12 rounded-full border-2 ${user.role === 'Coordinator' ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}`} />
              {user.isFreeNow && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-semibold text-gray-800">{user.fullName}</h3>
              <p className="text-xs text-gray-500">{user.vertical} <span className={`font-semibold ${user.role === 'Team Leader' ? 'text-purple-600' : user.role === 'Coordinator' ? 'text-blue-600' : 'text-gray-500'}`}>{user.role}</span></p>
            </div>
            <ChevronRight className="text-gray-300" size={20} />
          </div>
        ))}
        {filteredUsers.length === 0 && <div className="text-center py-10 text-gray-400">No members match this filter.</div>}
      </div>

      {selectedUser && <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}

// ─── TAB 3: EVENTS ────────────────────────────────────────────────────────────
function EventsTab() {
  const { events, users, currentUserRole, userProfile, showToast } = useContext(AppContext);
  const [eventFilter, setEventFilter] = useState('ongoing');
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [activeChatEvent, setActiveChatEvent] = useState(null);
  const [activeTasksEvent, setActiveTasksEvent] = useState(null);
  const [activeDocsEvent, setActiveDocsEvent] = useState(null);
  const [activeMeetEvent, setActiveMeetEvent] = useState(null);
  const [activeExpensesEvent, setActiveExpensesEvent] = useState(null);
  const [activeManageTeamEvent, setActiveManageTeamEvent] = useState(null);
  const [hourInputs, setHourInputs] = useState({});
  const [pendingAction, setPendingAction] = useState(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [myEventsOnly, setMyEventsOnly] = useState(false);

  const myId = userProfile?.uid || userProfile?.id;
  const filteredEvents = events.filter(e => {
    if (e.status !== eventFilter) return false;
    if (!myEventsOnly) return true;
    return e.createdBy === myId ||
      (e.coordinatorIds || []).includes(myId) ||
      (e.representativeIds || []).includes(myId);
  });

  const requestAction = (actionType, targetUser, eventTitle, hours, event) => {
    setPendingAction({ actionType, targetUser, eventTitle, hours, event });
  };

  const confirmAction = async () => {
    if (!pendingAction || !userProfile) return;
    const { actionType, targetUser, eventTitle, hours, event } = pendingAction;

    try {
      // Write hours_log entry (status = approved immediately since TL/Coordinator is doing the logging)
      await addDoc(collection(db, 'hours_log'), {
        eventId: event.id,
        userId: targetUser.id,
        loggedBy: userProfile.uid || userProfile.id,
        hours: actionType === 'hours' ? Number(hours) : 0,
        badgeAwarded: actionType === 'hours' ? 'none' : actionType,
        status: 'approved',
        approvedBy: userProfile.uid || userProfile.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Atomically update user totals
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', targetUser.id);
        const updates = { updatedAt: serverTimestamp() };
        if (actionType === 'hours') updates.totalHours = increment(Number(hours));
        if (actionType === 'appreciate') updates.badgesAppreciate = increment(1);
        if (actionType === 'slap') updates.badgesSlap = increment(1);
        transaction.update(userRef, updates);
      });

      // Write to activity_log for the feed
      await addDoc(collection(db, 'activity_log'), {
        type: actionType === 'hours' ? 'hours_logged' : 'badge_awarded',
        actorId: userProfile.uid || userProfile.id,
        actorName: userProfile.fullName,
        targetId: targetUser.id,
        targetName: targetUser.fullName,
        eventId: event.id,
        eventTitle,
        metadata: {
          hours: actionType === 'hours' ? Number(hours) : 0,
          badge: actionType !== 'hours' ? actionType : 'none',
        },
        createdAt: serverTimestamp(),
      });

      if (actionType === 'hours') setHourInputs(prev => ({ ...prev, [targetUser.id]: '' }));
      setPendingAction(null);
      showToast(actionType === 'hours' ? `Hours logged for ${targetUser.fullName}` : `Badge sent to ${targetUser.fullName}`, 'success');
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
      setPendingAction(null);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="bg-white p-5 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Event Management</h1>
          {(currentUserRole === 'Team Leader' || currentUserRole === 'Coordinator') && (
            <button onClick={() => setIsCreatingEvent(true)}
              className="flex items-center space-x-1 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={14} /><span>New</span>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex flex-1 bg-gray-100 p-1 rounded-xl">
            {['ongoing', 'upcoming', 'past'].map(status => (
              <button key={status} onClick={() => setEventFilter(status)}
                className={`flex-1 py-2 text-sm font-semibold capitalize rounded-lg transition-all ${eventFilter === status ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>{status}</button>
            ))}
          </div>
          <button onClick={() => setMyEventsOnly(v => !v)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${myEventsOnly ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>
            Mine
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filteredEvents.map(event => {
          const isExpanded = expandedEvent === event.id;
          const coordinatorIds = event.coordinatorIds || [];
          const representativeIds = event.representativeIds || [];
          const allTeamIds = [...coordinatorIds, ...representativeIds];

          return (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all">
              <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedEvent(isExpanded ? null : event.id)}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{event.type}</span>
                    <h3 className="font-bold text-lg text-gray-800 leading-tight">{event.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{event.date ? new Date(event.date).toDateString() : ''} at {event.time}</p>
                  </div>
                  {event.status === 'ongoing' && <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mt-1"></div>}
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-gray-500">Coordinator(s):</span>
                    <div className="flex -space-x-1">
                      {coordinatorIds.map(uid => {
                        const u = users.find(u => u.id === uid);
                        return u ? (
                          <img key={uid} src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.fullName}`}
                            className="w-6 h-6 rounded-full border-2 border-white bg-blue-100" alt={u.fullName} title={u.fullName} />
                        ) : null;
                      })}
                      {coordinatorIds.length === 0 && <span className="text-xs text-gray-400 italic">None</span>}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 animate-in slide-in-from-top-2">
                  {/* Team Roster */}
                  <div className="bg-gray-50 p-4 space-y-3">
                    {/* Coordinators */}
                    <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Coordinators ({coordinatorIds.length})</h4>
                        {currentUserRole === 'Team Leader' && (
                          <button onClick={e => { e.stopPropagation(); setActiveManageTeamEvent({ event, type: 'Coordinators' }); }}
                            className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-50 transition-colors">Manage</button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {coordinatorIds.map(uid => {
                          const u = users.find(u => u.id === uid);
                          return u ? (
                            <div key={uid} className="flex items-center bg-white border border-blue-200 rounded-full pr-3 p-1 shadow-sm">
                              <img src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.fullName}`} className="w-6 h-6 rounded-full bg-blue-100 mr-2" alt={u.fullName} />
                              <span className="text-xs font-medium text-blue-900">{u.fullName?.split(' ')[0]}</span>
                            </div>
                          ) : null;
                        })}
                        {coordinatorIds.length === 0 && <span className="text-xs text-gray-400 italic">No coordinators assigned</span>}
                      </div>
                    </div>

                    {/* Representatives */}
                    <div className="border border-green-200 bg-green-50/50 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider">Representatives ({representativeIds.length})</h4>
                        {(currentUserRole === 'Team Leader' || currentUserRole === 'Coordinator') && (
                          <button onClick={e => { e.stopPropagation(); setActiveManageTeamEvent({ event, type: 'Representatives' }); }}
                            className="text-[10px] font-bold text-green-600 bg-white px-2 py-0.5 rounded border border-green-200 hover:bg-green-50 transition-colors">Manage</button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {representativeIds.map(uid => {
                          const u = users.find(u => u.id === uid);
                          return u ? (
                            <div key={uid} className="flex items-center bg-white border border-green-200 rounded-full pr-3 p-1 shadow-sm">
                              <img src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.fullName}`} className="w-6 h-6 rounded-full bg-green-100 mr-2" alt={u.fullName} />
                              <span className="text-xs font-medium text-green-900">{u.fullName?.split(' ')[0]}</span>
                            </div>
                          ) : null;
                        })}
                        {representativeIds.length === 0 && <span className="text-xs text-gray-400 italic">No representatives assigned</span>}
                      </div>
                    </div>
                  </div>

                  {/* Planning Tools */}
                  <div className="p-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Planning Tools</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Tasks', icon: <CheckSquare size={18} />, action: () => setActiveTasksEvent(event) },
                        { label: 'Chat', icon: <MessageSquare size={18} />, action: () => setActiveChatEvent(event) },
                        { label: 'Docs', icon: <FileText size={18} />, action: () => setActiveDocsEvent(event) },
                        { label: 'Meet', icon: <Video size={18} />, action: () => setActiveMeetEvent(event) },
                        { label: 'Expenses', icon: <Receipt size={18} />, action: () => setActiveExpensesEvent(event) },
                      ].map(({ label, icon, action }) => (
                        <button key={label} onClick={action}
                          className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                          <span className="text-gray-400 group-hover:text-blue-500 mb-1">{icon}</span>
                          <span className="text-[11px] font-medium text-gray-600 group-hover:text-blue-600">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Log Hours & Feedback */}
                  <div className="p-4 bg-blue-50/50 border-t border-blue-100">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <Award size={16} className="mr-1 text-blue-600" /> Log Hours & Recognition
                    </h4>
                    <div className="space-y-3">
                      {allTeamIds.map(uid => {
                        const u = users.find(u => u.id === uid);
                        const isCoord = coordinatorIds.includes(uid);
                        let canEdit = false;
                        if (currentUserRole === 'Team Leader') canEdit = true;
                        else if (currentUserRole === 'Coordinator') canEdit = !isCoord;

                        return u ? (
                          <div key={uid} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                            <div className="flex items-center flex-1">
                              <img src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.fullName}`} className="w-8 h-8 rounded-full bg-gray-100 mr-3" alt="" />
                              <div>
                                <div className="text-sm font-semibold">
                                  {u.fullName}
                                  {isCoord && <span className="ml-1 text-[10px] text-blue-500 font-bold">(C)</span>}
                                </div>
                                <div className="text-[10px] text-gray-500 flex items-center mt-0.5">
                                  <CheckCircle2 size={10} className="text-green-500 mr-1" /> {u.totalHours || 0} hrs total
                                </div>
                              </div>
                            </div>

                            {canEdit ? (
                              <div className="flex items-center space-x-1.5">
                                <div className="flex items-center bg-blue-50 border border-blue-200 rounded-full overflow-hidden">
                                  <button className="w-7 h-7 flex items-center justify-center text-blue-400 hover:bg-blue-100 transition-colors font-bold text-sm"
                                    onClick={() => { const cur = Number(hourInputs[uid] || 0); if (cur > 0) setHourInputs(prev => ({ ...prev, [uid]: String(cur - 1) })); }}>−</button>
                                  <input type="number" placeholder="0" min="0" max="12"
                                    className="w-8 py-1 text-center text-sm font-bold text-blue-700 bg-transparent outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    value={hourInputs[uid] || ''} onChange={e => setHourInputs(prev => ({ ...prev, [uid]: e.target.value }))} />
                                  <button className="w-7 h-7 flex items-center justify-center text-blue-400 hover:bg-blue-100 transition-colors font-bold text-sm"
                                    onClick={() => { const cur = Number(hourInputs[uid] || 0); if (cur < 12) setHourInputs(prev => ({ ...prev, [uid]: String(cur + 1) })); }}>+</button>
                                </div>
                                <button
                                  className="w-7 h-7 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-sm transition-all active:scale-90 disabled:opacity-40"
                                  disabled={!hourInputs[uid] || Number(hourInputs[uid]) <= 0}
                                  onClick={() => { const hrs = hourInputs[uid]; if (!hrs || Number(hrs) <= 0) return; requestAction('hours', u, event.title, hrs, event); }}>
                                  <Check size={14} />
                                </button>
                                <button className="w-7 h-7 flex items-center justify-center text-green-600 bg-green-50 rounded-full hover:bg-green-100 border border-green-200 transition-all active:scale-90"
                                  onClick={() => requestAction('appreciate', u, event.title, null, event)}>
                                  <PartyPopper size={14} />
                                </button>
                                <button className="w-7 h-7 flex items-center justify-center text-red-500 bg-red-50 rounded-full hover:bg-red-100 border border-red-200 transition-all active:scale-90"
                                  onClick={() => requestAction('slap', u, event.title, null, event)}>
                                  <Hand size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="text-[10px] text-gray-400 italic px-2">View Only</div>
                            )}
                          </div>
                        ) : null;
                      })}
                      {allTeamIds.length === 0 && <p className="text-xs text-gray-400 italic text-center py-2">No team members assigned yet.</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filteredEvents.length === 0 && (
          <div className="text-center py-10 text-gray-400">No {eventFilter} events found.</div>
        )}
      </div>

      {/* Modals */}
      {activeChatEvent && <EventChatModal event={activeChatEvent} onClose={() => setActiveChatEvent(null)} />}
      {activeTasksEvent && <EventTasksModal event={activeTasksEvent} onClose={() => setActiveTasksEvent(null)} />}
      {activeDocsEvent && <EventDocsModal event={activeDocsEvent} onClose={() => setActiveDocsEvent(null)} />}
      {activeMeetEvent && <EventMeetModal event={activeMeetEvent} onClose={() => setActiveMeetEvent(null)} />}
      {activeExpensesEvent && <EventExpensesModal event={activeExpensesEvent} onClose={() => setActiveExpensesEvent(null)} />}

      {isCreatingEvent && (
        <NewEventModal
          onClose={() => setIsCreatingEvent(false)}
          onSave={async (data) => {
            try {
              await addDoc(collection(db, 'events'), {
                title: data.title,
                date: data.date,
                time: data.time,
                type: data.type,
                location: data.location || '',
                description: data.description || '',
                status: 'upcoming',
                coordinatorIds: [],
                representativeIds: [],
                createdBy: userProfile?.uid || userProfile?.id || '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
              await addDoc(collection(db, 'activity_log'), {
                type: 'event_created',
                actorId: userProfile?.uid || userProfile?.id,
                actorName: userProfile?.fullName,
                targetId: null, targetName: null,
                eventId: null, eventTitle: data.title,
                metadata: {},
                createdAt: serverTimestamp(),
              });
              setIsCreatingEvent(false);
              showToast('Event created!', 'success');
            } catch (error) {
              showToast('Error creating event: ' + error.message, 'error');
            }
          }}
        />
      )}

      {activeManageTeamEvent && (
        <ManageTeamModal
          event={activeManageTeamEvent.event}
          type={activeManageTeamEvent.type}
          onClose={() => setActiveManageTeamEvent(null)}
          onSave={async (selectedIds) => {
            const { event, type } = activeManageTeamEvent;
            let updateData = {};
            if (type === 'Coordinators') {
              updateData = { coordinatorIds: selectedIds, updatedAt: serverTimestamp() };
            } else {
              updateData = { representativeIds: selectedIds, updatedAt: serverTimestamp() };
            }
            try {
              await updateDoc(doc(db, 'events', event.id), updateData);
              setActiveManageTeamEvent(null);
            } catch (error) {
              showToast('Permission Denied: ' + error.message, 'error');
            }
          }}
        />
      )}

      {pendingAction && (
        <ConfirmActionModal
          action={pendingAction}
          currentUserRole={pendingAction.currentUserRole}
          onConfirm={confirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}

function ManageTeamModal({ event, type, onClose, onSave }) {
  const { users } = useContext(AppContext);
  const allUsers = users.filter(u =>
    type === 'Coordinators' ? u.role === 'Coordinator' : u.role === 'Representative'
  );

  const currentlySelected = type === 'Coordinators'
    ? (event.coordinatorIds || [])
    : (event.representativeIds || []);

  const [selectedIds, setSelectedIds] = useState(currentlySelected);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = allUsers.filter(u =>
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Manage {type}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{event.title}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search ${type.toLowerCase()}...`}
              className="w-full bg-gray-100 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
          {filteredUsers.map(user => {
            const isSelected = selectedIds.includes(user.id);
            return (
              <div key={user.id} onClick={() => toggleUser(user.id)}
                className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                <img src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`} className="w-10 h-10 rounded-full bg-gray-200 mr-3" alt={user.fullName} />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-gray-800">{user.fullName}</h4>
                  <p className="text-[10px] text-gray-500">{user.vertical}</p>
                </div>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                  {isSelected && <Check size={14} />}
                </div>
              </div>
            );
          })}
          {filteredUsers.length === 0 && <p className="text-center text-gray-400 text-sm py-6">No {type.toLowerCase()} found.</p>}
        </div>
        <div className="p-4 border-t border-gray-100 bg-white">
          <button onClick={() => onSave(selectedIds)}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            Save {type} ({selectedIds.length} selected)
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmActionModal({ action, onConfirm, onCancel }) {
  const { actionType, targetUser, eventTitle, hours } = action;
  let title, description, iconEl, btnColor;
  if (actionType === 'hours') {
    title = 'Confirm Hours'; description = `Add ${hours} hour(s) to ${targetUser.fullName} for "${eventTitle}"?`;
    iconEl = <Clock size={24} className="text-blue-500" />; btnColor = 'bg-blue-600 hover:bg-blue-700 text-white';
  } else if (actionType === 'appreciate') {
    title = 'Confirm Appreciation'; description = `Send an appreciation to ${targetUser.fullName} for "${eventTitle}"?`;
    iconEl = <PartyPopper size={24} className="text-green-500" />; btnColor = 'bg-green-600 hover:bg-green-700 text-white';
  } else {
    title = 'Confirm Slap'; description = `Send a slap to ${targetUser.fullName} for "${eventTitle}"?`;
    iconEl = <Hand size={24} className="text-red-500" />; btnColor = 'bg-red-600 hover:bg-red-700 text-white';
  }
  return (
    <div className="fixed inset-0 bg-black/50 z-[110] flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">{iconEl}</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
          <div className="flex items-center justify-center mt-4 bg-gray-50 rounded-xl p-3">
            <img src={targetUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.fullName}`} className="w-10 h-10 rounded-full bg-gray-200 mr-3" alt="" />
            <div className="text-left">
              <div className="text-sm font-bold text-gray-800">{targetUser.fullName}</div>
              <div className="text-[10px] text-gray-500">{targetUser.vertical} · {targetUser.role}</div>
            </div>
          </div>
        </div>
        <div className="flex border-t border-gray-100">
          <button onClick={onCancel} className="flex-1 py-3.5 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 py-3.5 text-sm font-bold ${btnColor} transition-colors border-l border-gray-100 rounded-br-2xl`}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

function NewEventModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: '', date: '', time: '10:00 AM', type: 'Seminar', location: '', description: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Create New Event</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Event Title *</label>
            <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="Alumni Meet 2026"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date *</label>
              <input required type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Time</label>
              <input value={form.time} onChange={e => set('time', e.target.value)} placeholder="10:00 AM"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all">
                {['Flagship', 'Seminar', 'Workshop', 'Networking', 'Reunion'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Room 101"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center">
            {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── TAB 4: LEADERBOARD ───────────────────────────────────────────────────────
function LeaderboardTab() {
  const { users } = useContext(AppContext);
  const [sortBy, setSortBy] = useState('hours');
  const [filterLevel, setFilterLevel] = useState('All');

  const filtered = [...users]
    .filter(u => {
      if (filterLevel === 'Coordinators') return u.role === 'Coordinator';
      if (filterLevel === 'Reps') return u.role === 'Representative';
      return u.role !== 'Team Leader'; // exclude TL from leaderboard or include all
    })
    .sort((a, b) => {
      if (sortBy === 'hours') return (b.totalHours || 0) - (a.totalHours || 0) || (b.badgesAppreciate || 0) - (a.badgesAppreciate || 0);
      return (b.badgesAppreciate || 0) - (a.badgesAppreciate || 0) || (b.totalHours || 0) - (a.totalHours || 0);
    });

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="bg-white p-5 border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Trophy className="text-yellow-500 mr-3" size={28} /> Leaderboard
        </h1>
        <div className="flex bg-gray-100 p-1 rounded-xl mb-3">
          {['All', 'Coordinators', 'Reps'].map(level => (
            <button key={level} onClick={() => setFilterLevel(level)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterLevel === level ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>{level}</button>
          ))}
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setSortBy('hours')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${sortBy === 'hours' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Most Hours</button>
          <button onClick={() => setSortBy('appreciations')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${sortBy === 'appreciations' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Most Appreciated</button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filtered.map((user, index) => {
          const rank = index + 1;
          let rankStyles = 'bg-white border-gray-100';
          let rankBadge = <span className="font-bold text-gray-500 w-6 text-center">{rank}</span>;
          if (rank === 1) { rankStyles = 'bg-yellow-50 border-yellow-300 shadow-sm'; rankBadge = <Trophy size={20} className="text-yellow-500 mx-1" />; }
          else if (rank === 2) { rankStyles = 'bg-slate-50 border-slate-300 shadow-sm'; rankBadge = <Medal size={20} className="text-slate-400 mx-1" />; }
          else if (rank === 3) { rankStyles = 'bg-orange-50 border-orange-300 shadow-sm'; rankBadge = <Medal size={20} className="text-orange-500 mx-1" />; }

          return (
            <div key={user.id} className={`p-4 rounded-xl border flex items-center ${rankStyles}`}>
              <div className="flex items-center justify-center w-8 mr-3">{rankBadge}</div>
              <img src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                alt={user.fullName} className={`w-12 h-12 rounded-full bg-white border-2 mr-4 ${rank === 1 ? 'border-yellow-400' : 'border-transparent'}`} />
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{user.fullName}</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{user.vertical} {user.role === 'Coordinator' ? 'Coord.' : 'Rep'}</p>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold flex items-center justify-end ${sortBy === 'hours' ? 'text-blue-600' : 'text-gray-500'}`}>
                  {user.totalHours || 0} <span className="text-[10px] font-medium ml-1">hrs</span>
                </div>
                <div className={`text-sm font-bold flex items-center justify-end ${sortBy === 'appreciations' ? 'text-green-600' : 'text-gray-500'}`}>
                  {user.badgesAppreciate || 0} <PartyPopper size={12} className="ml-1" />
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-10 text-gray-400">No members match this filter.</div>}
      </div>
    </div>
  );
}

// ─── USER PROFILE MODAL ───────────────────────────────────────────────────────
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const times = ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM'];

function UserProfileModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5">
        <div className="relative p-6 border-b border-gray-100 flex items-center">
          <button onClick={onClose} className="absolute right-4 top-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
          <img src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
            alt={user.fullName} className={`w-16 h-16 rounded-full shadow-sm border-2 ${user.role === 'Coordinator' ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}`} />
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-800">{user.fullName}</h2>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-600 font-medium mr-3">{user.vertical} {user.role === 'Coordinator' ? 'Coord.' : 'Rep'}</span>
              {user.isFreeNow
                ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Free Now</span>
                : <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">In Class</span>}
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-blue-50 p-3 rounded-xl text-center">
              <div className="text-xl font-black text-blue-700">{user.totalHours || 0}</div>
              <div className="text-xs text-blue-600 font-medium mt-1">Hours Logged</div>
            </div>
            <div className="bg-green-50 p-3 rounded-xl text-center">
              <div className="flex justify-center mb-1 text-green-600"><PartyPopper size={18} /></div>
              <div className="text-lg font-bold text-green-700">{user.badgesAppreciate || 0}</div>
              <div className="text-[10px] text-green-600 font-medium">Appreciations</div>
            </div>
            <div className="bg-red-50 p-3 rounded-xl text-center">
              <div className="flex justify-center mb-1 text-red-500"><Hand size={18} /></div>
              <div className="text-lg font-bold text-red-700">{user.badgesSlap || 0}</div>
              <div className="text-[10px] text-red-600 font-medium">Slaps</div>
            </div>
          </div>

          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <CalendarIcon size={18} className="mr-2 text-blue-600" /> Weekly Schedule
          </h3>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 overflow-x-auto">
            <div className="min-w-[300px]">
              <div className="grid grid-cols-6 gap-1 mb-1">
                <div className="text-xs text-gray-400 p-2"></div>
                {days.map(day => <div key={day} className="text-xs font-semibold text-center text-gray-500 py-1">{day}</div>)}
              </div>
              {times.map((time, i) => (
                <div key={time} className="grid grid-cols-6 gap-1 mb-1">
                  <div className="text-[10px] font-medium text-gray-400 text-right pr-2 pt-1">{time}</div>
                  {days.map((day, j) => {
                    const schedule = user.schedule || [];
                    const hasClass = schedule.some(s => s.day === (j + 1) % 7);
                    return (
                      <div key={`${day}-${time}`} className={`h-8 rounded ${hasClass ? 'bg-red-100 border border-red-200' : 'bg-white border border-gray-100'} flex items-center justify-center`}>
                        {hasClass && <span className="text-[8px] font-bold text-red-400">CLASS</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-center text-gray-400 mt-3">White blocks indicate free time slots.</p>

          <div className="flex space-x-3 mt-8">
            <a href={`tel:${user.phone}`} className="flex-1 flex items-center justify-center bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">
              <Phone size={18} className="mr-2" /> Call
            </a>
            <a href={`https://wa.me/${user.phone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition-colors shadow-md shadow-green-200">
              <MessageSquare size={18} className="mr-2" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EVENT MODALS ─────────────────────────────────────────────────────────────
function EventChatModal({ event, onClose }) {
  const { userProfile, users, showToast } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const bottomRef = React.useRef(null);
  const isInitialLoad = React.useRef(true);
  const prevCountRef = React.useRef(0);

  useEffect(() => {
    isInitialLoad.current = true;
    prevCountRef.current = 0;
    const q = query(collection(db, 'events', event.id, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (!isInitialLoad.current && msgs.length > prevCountRef.current) {
        const latest = msgs[msgs.length - 1];
        const myId = userProfile?.uid || userProfile?.id;
        if (latest.senderId !== myId) {
          showToast(`${latest.senderName?.split(' ')[0]}: ${latest.text.slice(0, 50)}`, 'info');
        }
      }
      isInitialLoad.current = false;
      prevCountRef.current = msgs.length;
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsub();
  }, [event.id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !userProfile) return;
    const text = messageText;
    setMessageText('');
    try {
      await addDoc(collection(db, 'events', event.id, 'messages'), {
        senderId: userProfile.uid || userProfile.id,
        senderName: userProfile.fullName,
        text,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      showToast('Error sending message: ' + err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">Team Chat</h2>
            <p className="text-xs text-blue-600 font-medium">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No messages yet. Start the conversation!</p>}
          {messages.map(msg => {
            const isMe = msg.senderId === (userProfile?.uid || userProfile?.id);
            const sender = !isMe ? users.find(u => u.id === msg.senderId) : null;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <img src={sender?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderName}`}
                    className="w-8 h-8 rounded-full bg-gray-200 mr-2 mt-auto" alt={msg.senderName} />
                )}
                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isMe && <span className="text-[10px] text-gray-500 mb-1 ml-1">{msg.senderName?.split(' ')[0]}</span>}
                  <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1">
                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div className="p-3 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <input type="text" value={messageText} onChange={e => setMessageText(e.target.value)} placeholder="Type a message..."
              className="flex-1 bg-gray-100 border-transparent rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
            <button type="submit" disabled={!messageText.trim()}
              className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${messageText.trim() ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function EventTasksModal({ event, onClose }) {
  const { showToast } = useContext(AppContext);
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'events', event.id, 'tasks'), snap => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [event.id]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    try {
      await addDoc(collection(db, 'events', event.id, 'tasks'), { text: newTaskText.trim(), completed: false, createdAt: serverTimestamp() });
      setNewTaskText('');
    } catch (err) { showToast('Failed to add task: ' + err.message, 'error'); }
  };

  const toggleTask = async (task) => {
    try {
      await updateDoc(doc(db, 'events', event.id, 'tasks', task.id), { completed: !task.completed });
    } catch (err) { showToast('Failed to update task', 'error'); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">Event Tasks</h2>
            <p className="text-xs text-blue-600 font-medium">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">To Do ({tasks.filter(t => !t.completed).length})</span>
          {tasks.map(task => (
            <div key={task.id} onClick={() => toggleTask(task)}
              className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${task.completed ? 'bg-gray-100 border-transparent opacity-70' : 'bg-white border-gray-200 shadow-sm hover:border-blue-300'}`}>
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 flex-shrink-0 ${task.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                {task.completed && <CheckSquare size={14} />}
              </div>
              <span className={`text-sm flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-800 font-medium'}`}>{task.text}</span>
            </div>
          ))}
          {tasks.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No tasks added yet.</p>}
        </div>
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleAddTask} className="flex items-center space-x-2">
            <input type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="Add a new task..."
              className="flex-1 bg-gray-100 border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
            <button type="submit" disabled={!newTaskText.trim()}
              className={`p-3 rounded-xl transition-colors flex-shrink-0 ${newTaskText.trim() ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
              <Plus size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function EventDocsModal({ event, onClose }) {
  const { showToast } = useContext(AppContext);
  const [docs, setDocs] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'events', event.id, 'docs'), snap => {
      setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [event.id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await addDoc(collection(db, 'events', event.id, 'docs'), { title: newTitle.trim(), url: newUrl.trim(), type: 'Link', createdAt: serverTimestamp() });
      setNewTitle(''); setNewUrl(''); setAdding(false);
    } catch (err) { showToast('Failed to add document: ' + err.message, 'error'); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">Shared Documents</h2>
            <p className="text-xs text-blue-600 font-medium">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {docs.map(d => (
            <div key={d.id} className="flex items-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mr-3"><FileText size={20} /></div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-800 truncate">{d.title}</h4>
                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-medium">{d.type || 'Link'}</span>
              </div>
              {d.url && (
                <a href={d.url} target="_blank" rel="noreferrer" className="text-gray-400 group-hover:text-blue-600 p-2"><ExternalLink size={18} /></a>
              )}
            </div>
          ))}
          {docs.length === 0 && !adding && <p className="text-center py-8 text-gray-400 text-sm">No documents shared yet.</p>}
          {adding && (
            <form onSubmit={handleAdd} className="bg-white p-4 rounded-xl border border-blue-200 space-y-2">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Document title" required
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://docs.google.com/..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex space-x-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white text-sm font-bold py-2 rounded-lg">Add</button>
                <button type="button" onClick={() => setAdding(false)} className="flex-1 bg-gray-100 text-gray-600 text-sm font-bold py-2 rounded-lg">Cancel</button>
              </div>
            </form>
          )}
        </div>
        <div className="p-4 bg-white border-t border-gray-100">
          <button onClick={() => setAdding(true)} className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 border border-blue-200 font-bold py-3.5 rounded-xl hover:bg-blue-100 transition-colors">
            <Plus size={18} /><span>Attach Link</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function EventMeetModal({ event, onClose }) {
  const { showToast } = useContext(AppContext);
  const [meets, setMeets] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newTime, setNewTime] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'events', event.id, 'meetings'), snap => {
      setMeets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [event.id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await addDoc(collection(db, 'events', event.id, 'meetings'), { title: newTitle.trim(), link: newLink.trim(), scheduledTime: newTime.trim(), createdAt: serverTimestamp() });
      setNewTitle(''); setNewLink(''); setNewTime(''); setAdding(false);
    } catch (err) { showToast('Failed to schedule meeting: ' + err.message, 'error'); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">Team Meetings</h2>
            <p className="text-xs text-blue-600 font-medium">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {meets.map(meet => (
            <div key={meet.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-all">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-semibold text-gray-800 pr-2">{meet.title}</h4>
                <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg"><Video size={16} /></div>
              </div>
              {meet.scheduledTime && (
                <p className="text-xs text-gray-500 mb-3 flex items-center"><Clock size={12} className="mr-1" /> {meet.scheduledTime}</p>
              )}
              {meet.link && (
                <a href={meet.link.startsWith('http') ? meet.link : `https://${meet.link}`} target="_blank" rel="noreferrer"
                  className="inline-flex items-center justify-center w-full text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                  <LinkIcon size={14} className="mr-2" /> Join Meeting
                </a>
              )}
            </div>
          ))}
          {meets.length === 0 && !adding && <p className="text-center py-8 text-gray-400 text-sm">No meetings scheduled yet.</p>}
          {adding && (
            <form onSubmit={handleAdd} className="bg-white p-4 rounded-xl border border-blue-200 space-y-2">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Meeting topic" required
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="e.g. Tomorrow, 8:00 PM"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="meet.google.com/abc-defg-hij"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex space-x-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white text-sm font-bold py-2 rounded-lg">Schedule</button>
                <button type="button" onClick={() => setAdding(false)} className="flex-1 bg-gray-100 text-gray-600 text-sm font-bold py-2 rounded-lg">Cancel</button>
              </div>
            </form>
          )}
        </div>
        <div className="p-4 bg-white border-t border-gray-100">
          <button onClick={() => setAdding(true)} className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 border border-blue-200 font-bold py-3.5 rounded-xl hover:bg-blue-100 transition-colors">
            <Plus size={18} /><span>Schedule a Meeting</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function EventExpensesModal({ event, onClose }) {
  const { userProfile, users, currentUserRole, showToast } = useContext(AppContext);
  const [expenses, setExpenses] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'expenses'), where('eventId', '==', event.id));
    const unsub = onSnapshot(q, snap => {
      setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [event.id]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newItem.trim() || !newAmount || !docFile || !userProfile) return;
    setUploading(true);
    try {
      let receiptUrl = '';
      if (docFile) {
        const uid = userProfile.uid || userProfile.id;
        const storageRef = ref(storage, `receipts/${uid}_${Date.now()}_${docFile.name}`);
        await uploadBytes(storageRef, docFile);
        receiptUrl = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, 'expenses'), {
        eventId: event.id,
        submittedBy: userProfile.uid || userProfile.id,
        itemDescription: newItem.trim(),
        amount: Number(newAmount),
        status: 'pending',
        receiptUrl,
        reviewedBy: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNewItem(''); setNewAmount(''); setDocFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
    finally { setUploading(false); }
  };

  const handleApprove = async (expId) => {
    try {
      await updateDoc(doc(db, 'expenses', expId), { status: 'reimbursed', reviewedBy: userProfile?.uid || userProfile?.id, updatedAt: serverTimestamp() });
      showToast('Expense approved', 'success');
    } catch (err) { showToast('Permission Denied: ' + err.message, 'error'); }
  };

  const handleReject = async (expId) => {
    try {
      await updateDoc(doc(db, 'expenses', expId), { status: 'rejected', reviewedBy: userProfile?.uid || userProfile?.id, updatedAt: serverTimestamp() });
      showToast('Expense rejected', 'info');
    } catch (err) { showToast('Permission Denied: ' + err.message, 'error'); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">Event Expenses</h2>
            <p className="text-xs text-blue-600 font-medium">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {expenses.map(exp => {
            const submitter = users.find(u => u.id === exp.submittedBy);
            const isPdf = exp.receiptUrl && exp.receiptUrl.includes('.pdf');
            return (
              <div key={exp.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-2">
                    <h4 className="text-sm font-semibold text-gray-800">{exp.itemDescription}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">By {submitter?.fullName || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">₹{exp.amount}</div>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[9px] font-bold uppercase rounded-full tracking-wider
                      ${exp.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${exp.status === 'reimbursed' ? 'bg-green-100 text-green-700' : ''}
                      ${exp.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}`}>
                      {exp.status}
                    </span>
                  </div>
                </div>
                {exp.receiptUrl && (
                  <div className="mt-2">
                    {isPdf ? (
                      <a href={exp.receiptUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                        <FileText size={13} />
                        <span>View Receipt PDF</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <a href={exp.receiptUrl} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-gray-200">
                        <img src={exp.receiptUrl} alt="Receipt" className="w-full max-h-32 object-cover" />
                      </a>
                    )}
                  </div>
                )}
                {currentUserRole === 'Team Leader' && exp.status === 'pending' && (
                  <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-100">
                    <button onClick={() => handleReject(exp.id)} className="flex items-center px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                      <XCircle size={14} className="mr-1" /> Reject
                    </button>
                    <button onClick={() => handleApprove(exp.id)} className="flex items-center px-3 py-1.5 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                      <Check size={14} className="mr-1" /> Approve
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {expenses.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No expenses submitted yet.</p>}
        </div>
        {(currentUserRole === 'Coordinator' || currentUserRole === 'Team Leader') && (
          <div className="p-4 bg-white border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Request Reimbursement</h4>
            <form onSubmit={handleAddExpense} className="space-y-2">
              <div className="flex space-x-2">
                <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Item / Description"
                  className="flex-1 bg-gray-100 border-transparent rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="Amt (₹)" min="1"
                  className="w-24 bg-gray-100 border-transparent rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center space-x-2">
                <label className={`flex-1 flex items-center space-x-2 px-3 py-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-sm
                  ${docFile ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'}`}>
                  <FileText size={16} />
                  <span className="truncate">{docFile ? docFile.name : 'Attach receipt (image or PDF)'}</span>
                  <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden"
                    onChange={e => setDocFile(e.target.files[0] || null)} />
                </label>
                {docFile && (
                  <button type="button" onClick={() => { setDocFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                )}
                <button type="submit" disabled={!newItem.trim() || !newAmount.trim() || !docFile || uploading}
                  className={`p-2 rounded-xl transition-colors flex-shrink-0 flex items-center justify-center ${newItem.trim() && newAmount.trim() && docFile && !uploading ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                  {uploading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={20} />}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NAV BUTTON ───────────────────────────────────────────────────────────────
function NavButton({ icon, label, isActive, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
      {icon}
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}
