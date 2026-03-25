import React, { useState, useEffect, useContext, createContext } from 'react';
import { auth } from './lib/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { db } from './lib/firebase';
import { collection, onSnapshot, writeBatch, doc, addDoc, updateDoc } from 'firebase/firestore';

export const AppContext = createContext();

import { 
  Calendar as CalendarIcon, Users, LayoutList, Search, Clock, Award, 
  PartyPopper, Hand, X, ChevronRight, CheckCircle2, AlertCircle, 
  ChevronDown, ChevronUp, CheckSquare, MessageSquare, FileText, Send, 
  Plus, ExternalLink, Trophy, Medal, Phone, Video, Link as LinkIcon, 
  Receipt, Check, XCircle
} from 'lucide-react';

const MOCK_USERS = [
  { id: 1, name: "Alex Sharma", vertical: "Design", role: "Coordinator", isFreeNow: true, hours: 12, badges: { appreciate: 3, slap: 0 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" },
  { id: 2, name: "Priya Patel", vertical: "Networking", role: "Representative", isFreeNow: false, hours: 24, badges: { appreciate: 5, slap: 1 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
  { id: 3, name: "Rahul Singh", vertical: "Operations", role: "Coordinator", isFreeNow: true, hours: 8, badges: { appreciate: 1, slap: 0 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" },
  { id: 4, name: "Neha Gupta", vertical: "Media", role: "Coordinator", isFreeNow: true, hours: 15, badges: { appreciate: 4, slap: 0 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha" },
  { id: 5, name: "Kabir Khan", vertical: "Networking", role: "Representative", isFreeNow: false, hours: 5, badges: { appreciate: 0, slap: 2 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir" },
  { id: 6, name: "Ananya Desai", vertical: "Design", role: "Representative", isFreeNow: true, hours: 18, badges: { appreciate: 6, slap: 0 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya" },
];

const MOCK_EVENTS = [
  { id: 1, title: "Alumni Meet 2026", date: "2026-03-25", time: "10:00 AM", status: "upcoming", type: "Flagship", team: [1, 2, 3], coordinators: [1] },
  { id: 2, title: "Guest Lecture: Tech Trends", date: "2026-03-20", time: "02:00 PM", status: "ongoing", type: "Seminar", team: [4, 5], coordinators: [4] },
  { id: 3, title: "Batch of '16 Reunion", date: "2026-02-15", time: "06:00 PM", status: "past", type: "Networking", team: [1, 2, 4, 6], coordinators: [6] },
  { id: 4, title: "Career Fair Prep", date: "2026-04-05", time: "09:00 AM", status: "upcoming", type: "Workshop", team: [3, 6], coordinators: [3] },
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('directory');
  const [currentUserRole, setCurrentUserRole] = useState('Team Leader');
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Authenticated
      } else {
        await signInAnonymously(auth);
      }
    });

    let usersLoaded = false;
    let eventsLoaded = false;
    
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const fetchedUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(fetchedUsers);
      usersLoaded = true;
      if (usersLoaded && eventsLoaded) setLoading(false);
    });

    const unsubEvents = onSnapshot(collection(db, 'events'), (snap) => {
      const fetchedEvents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEvents(fetchedEvents);
      eventsLoaded = true;
      if (usersLoaded && eventsLoaded) setLoading(false);
    });

    setTimeout(() => setLoading(false), 2000); // timeout fallback
    return () => { unsubAuth(); unsubUsers(); unsubEvents(); };
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-gray-500 bg-gray-100">Connecting Database...</div>;

  if (!isLoggedIn) {
    return <LoginPage onLogin={(userData) => {
      setCurrentUserRole(userData.level);
      setIsLoggedIn(true);
    }} />
  }

  return (
    <AppContext.Provider value={{ users, events, setEvents, currentUserRole }}>
      <div className="flex justify-center bg-gray-100 min-h-screen font-sans">
        <div className="w-full max-w-md bg-white h-screen flex flex-col shadow-2xl overflow-hidden relative">
          <div className="bg-indigo-900 text-indigo-100 text-[10px] py-1.5 px-4 flex justify-between items-center z-50">
            <span className="font-semibold uppercase tracking-wider">Simulating Role:</span>
            <select value={currentUserRole} onChange={(e) => setCurrentUserRole(e.target.value)} className="bg-indigo-800 text-white border border-indigo-700 outline-none rounded px-2 py-0.5 cursor-pointer">
              <option value="Team Leader">Team Leader</option>
              <option value="Coordinator">Coordinator</option>
              <option value="Representative">Representative</option>
            </select>
          </div>
          <div className="flex-1 overflow-y-auto pb-20">
            {activeTab === 'home' && <HomeTab />}
            {activeTab === 'directory' && <DirectoryTab />}
            {activeTab === 'events' && <EventsTab />}
            {activeTab === 'leaderboard' && <LeaderboardTab />}
          </div>
          <div className="absolute bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-[60]">
            <NavButton icon={<CalendarIcon size={24} />} label="Home" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <NavButton icon={<Users size={24} />} label="Team" isActive={activeTab === 'directory'} onClick={() => setActiveTab('directory')} />
            <NavButton icon={<LayoutList size={24} />} label="Events" isActive={activeTab === 'events'} onClick={() => setActiveTab('events')} />
            <NavButton icon={<Trophy size={24} />} label="Rankings" isActive={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} />
          </div>
        </div>
      </div>
    </AppContext.Provider>
  );
}

function HomeTab() {
  const { events, users } = useContext(AppContext);
  const upcomingEvents = events.filter(e => e.status === 'upcoming' || e.status === 'ongoing');
  return (
    <div className="animate-in fade-in duration-300">
      <div className="bg-blue-600 p-6 text-white rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-1">Alumni Relations</h1>
        <p className="text-blue-100 text-sm opacity-90">Overview & Schedule</p>
      </div>
      <div className="p-5 space-y-6">
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
              return (
                <div key={day} className={`p-2 rounded-full flex items-center justify-center h-8 w-8 mx-auto cursor-pointer ${isToday ? 'bg-blue-600 text-white font-bold' : ''} ${hasEvent && !isToday ? 'bg-blue-100 text-blue-700 font-bold relative' : ''} ${!isToday && !hasEvent ? 'text-gray-700 hover:bg-gray-100' : ''}`}>
                  {day}
                  {hasEvent && !isToday && <span className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full"></span>}
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center"><CalendarIcon size={18} className="mr-2 text-blue-600" /> Up Next</h3>
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <div key={event.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-lg text-center min-w-[60px] mr-4">
                  <div className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                  <div className="text-xl font-bold leading-none mt-1">{new Date(event.date).getDate()}</div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-800">{event.title}</h4>
                    {event.status === 'ongoing' && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse">Live</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 flex items-center"><Clock size={14} className="mr-1" /> {event.time}</p>
                  <div className="flex -space-x-2 mt-3 overflow-hidden">
                    {event.team.map(userId => {
                      const user = users.find(u => String(u.id) === String(userId));
                      return user ? <img key={userId} src={user.image} alt={user.name} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-200" title={user.name} /> : null;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DirectoryTab() {
  const { users } = useContext(AppContext);
  const [filterVertical, setFilterVertical] = useState('All');
  const [filterRole, setFilterRole] = useState('All');
  const [freeNow, setFreeNow] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const verticals = ['All', 'Networking', 'Design', 'Operations', 'Media'];
  const rolesFilter = ['All', 'Coordinators', 'Reps'];
  const filteredUsers = users.filter(user => {
    if (filterVertical !== 'All' && user.vertical !== filterVertical) return false;
    if (filterRole !== 'All') {
      if (filterRole === 'Coordinators' && user.vertical !== 'Coordinator') return false;
      if (filterRole === 'Reps' && user.vertical !== 'Representative') return false;
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
          <input type="text" placeholder="Search team members..." className="w-full bg-gray-100 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
          {rolesFilter.map(level => (
            <button key={level} onClick={() => setFilterRole(level)} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterRole === level ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>{level}</button>
          ))}
        </div>
        <div className="flex overflow-x-auto hide-scrollbar space-x-2 pb-2">
          {verticals.map(role => (
            <button key={role} onClick={() => setFilterVertical(role)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterVertical === role ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{role}</button>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
          <div className="flex items-center">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-semibold text-green-800">Free Now (No Class)</span>
          </div>
          <button onClick={() => setFreeNow(!freeNow)} className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${freeNow ? 'bg-green-500' : 'bg-gray-300'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute transition-transform ${freeNow ? 'translate-x-6' : 'translate-x-1'}`}></div>
          </button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {filteredUsers.map(user => (
          <div key={user.id} onClick={() => setSelectedUser(user)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center cursor-pointer hover:border-blue-300 hover:shadow-md transition-all active:scale-[0.98]">
            <div className="relative">
              <img src={user.image} alt={user.name} className={`w-12 h-12 rounded-full border-2 ${user.role === 'Coordinator' ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}`} />
              {user.isFreeNow && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-semibold text-gray-800">{user.name}</h3>
              <p className="text-xs text-gray-500">{user.vertical} <span className={user.role === 'Coordinator' ? 'font-semibold text-blue-600' : ''}>{user.role === 'Coordinator' ? 'Coordinator' : 'Rep'}</span></p>
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

function EventsTab() {
  const { events, setEvents, currentUserRole, users } = useContext(AppContext);
  const [eventFilter, setEventFilter] = useState('ongoing');
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [activeChatEvent, setActiveChatEvent] = useState(null);
  const [activeTasksEvent, setActiveTasksEvent] = useState(null);
  const [activeDocsEvent, setActiveDocsEvent] = useState(null);
  const [activeMeetEvent, setActiveMeetEvent] = useState(null);
  const [activeExpensesEvent, setActiveExpensesEvent] = useState(null); 
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [activeManageTeamEvent, setActiveManageTeamEvent] = useState(null);

  const filteredEvents = events.filter(e => e.status === eventFilter);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="bg-white p-5 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Event Management</h1>
          {currentUserRole === 'Team Leader' && (
            <button onClick={() => setIsCreatingEvent(true)} className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 shadow-sm transition-transform active:scale-95">
              <Plus size={20} />
            </button>
          )}
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {['ongoing', 'upcoming', 'past'].map(status => (
            <button key={status} onClick={() => setEventFilter(status)} className={`flex-1 py-2 text-sm font-semibold capitalize rounded-lg transition-all ${eventFilter === status ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>{status}</button>
          ))}
        </div>
      </div>
      <div className="p-4 space-y-4">
        {filteredEvents.map(event => {
          const isExpanded = expandedEvent === event.id;
          return (
          <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all">
            <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedEvent(isExpanded ? null : event.id)}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{event.type}</span>
                  <h3 className="font-bold text-lg text-gray-800 leading-tight">{event.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{new Date(event.date).toDateString()} at {event.time}</p>
                </div>
                {event.status === 'ongoing' && <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mt-1"></div>}
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-gray-500">Coordinator(s):</span>
                  <div className="flex -space-x-1">
                    {event.coordinators.map(userId => {
                      const user = users.find(u => String(u.id) === String(userId));
                      return user ? <img key={userId} src={user.image} className="w-6 h-6 rounded-full border-2 border-white bg-blue-100" alt={user.name} title={user.name} /> : null;
                    })}
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              </div>
            </div>
            {isExpanded && (
              <div className="border-t border-gray-100 animate-in slide-in-from-top-2">
                <div className="bg-gray-50 p-4 space-y-3">
                  <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Coordinators ({event.coordinators.length})</h4>
                      {currentUserRole === 'Team Leader' && (
                        <button onClick={() => setActiveManageTeamEvent({event, type: 'Coordinators'})} className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-50 transition-colors">Manage</button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {event.coordinators.map(userId => {
                        const user = users.find(u => String(u.id) === String(userId));
                        return user ? (
                          <div key={userId} className="flex items-center bg-white border border-blue-200 rounded-full pr-3 p-1 shadow-sm">
                            <img src={user.image} className="w-6 h-6 rounded-full bg-blue-100 mr-2" alt={user.name} />
                            <span className="text-xs font-medium text-blue-900">{user.name.split(' ')[0]}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                  {(() => {
                    const reps = event.team.filter(id => !event.coordinators.includes(id));
                    return reps.length > 0 && (
                      <div className="border border-green-200 bg-green-50/50 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider">Representatives ({reps.length})</h4>
                          {currentUserRole === 'Coordinator' && (
                            <button onClick={() => setActiveManageTeamEvent({event, type: 'Representatives'})} className="text-[10px] font-bold text-green-600 bg-white px-2 py-0.5 rounded border border-green-200 hover:bg-green-50 transition-colors">Manage</button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {reps.map(userId => {
                            const user = users.find(u => String(u.id) === String(userId));
                            return user ? (
                              <div key={userId} className="flex items-center bg-white border border-green-200 rounded-full pr-3 p-1 shadow-sm">
                                <img src={user.image} className="w-6 h-6 rounded-full bg-green-100 mr-2" alt={user.name} />
                                <span className="text-xs font-medium text-green-900">{user.name.split(' ')[0]}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="p-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Planning Tools</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setActiveTasksEvent(event)} className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                      <CheckSquare size={18} className="text-gray-400 group-hover:text-blue-500 mb-1" />
                      <span className="text-[11px] font-medium text-gray-600 group-hover:text-blue-600">Tasks</span>
                    </button>
                    <button onClick={() => setActiveChatEvent(event)} className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                      <MessageSquare size={18} className="text-gray-400 group-hover:text-blue-500 mb-1" />
                      <span className="text-[11px] font-medium text-gray-600 group-hover:text-blue-600">Chat</span>
                    </button>
                    <button onClick={() => setActiveDocsEvent(event)} className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                      <FileText size={18} className="text-gray-400 group-hover:text-blue-500 mb-1" />
                      <span className="text-[11px] font-medium text-gray-600 group-hover:text-blue-600">Docs</span>
                    </button>
                    <button onClick={() => setActiveMeetEvent(event)} className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                      <Video size={18} className="text-gray-400 group-hover:text-blue-500 mb-1" />
                      <span className="text-[11px] font-medium text-gray-600 group-hover:text-blue-600">Meet</span>
                    </button>
                    <button onClick={() => setActiveExpensesEvent(event)} className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                      <Receipt size={18} className="text-gray-400 group-hover:text-blue-500 mb-1" />
                      <span className="text-[11px] font-medium text-gray-600 group-hover:text-blue-600">Expenses</span>
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-blue-50/50 border-t border-blue-100">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center"><Award size={16} className="mr-1 text-blue-600" /> Log Hours & Feedback</h4>
                  <div className="space-y-3">
                    {event.team.map(userId => {
                      const user = users.find(u => String(u.id) === String(userId));
                      const isTargetCoordinator = event.coordinators.includes(userId);
                      let canEdit = currentUserRole === 'Team Leader' || (currentUserRole === 'Coordinator' && !isTargetCoordinator);
                      return user ? (
                        <div key={userId} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                          <div className="flex items-center flex-1">
                            <img src={user.image} className="w-8 h-8 rounded-full bg-gray-100 mr-3" alt="" />
                            <div>
                              <div className="text-sm font-semibold">{user.name}{isTargetCoordinator && <span className="ml-1 text-[10px] text-blue-500 font-bold">(C)</span>}</div>
                              <div className="text-[10px] text-gray-500 flex items-center mt-0.5"><CheckCircle2 size={10} className="text-green-500 mr-1" /> {user.hours} hrs total</div>
                            </div>
                          </div>
                          {canEdit ? (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center border border-gray-200 rounded text-xs overflow-hidden">
                                <input type="number" placeholder="Hrs" className="w-12 px-2 py-1 text-center outline-none" min="0" max="12" />
                                <button className="bg-gray-100 px-2 py-1 hover:bg-gray-200 font-bold">+</button>
                              </div>
                              <button className="p-1.5 text-green-600 bg-green-50 rounded-full hover:bg-green-100" title="Appreciate"><PartyPopper size={16} /></button>
                              <button className="p-1.5 text-red-600 bg-red-50 rounded-full hover:bg-red-100" title="Slap"><Hand size={16} /></button>
                            </div>
                          ) : (
                            <div className="text-[10px] text-gray-400 italic px-2">{currentUserRole === 'Representative' ? 'View Only' : 'Requires TL Access'}</div>
                          )}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )})}
        {filteredEvents.length === 0 && <div className="text-center py-10 text-gray-400">No {eventFilter} events found.</div>}
      </div>
      {activeChatEvent && <EventChatModal event={activeChatEvent} onClose={() => setActiveChatEvent(null)} />}
      {activeTasksEvent && <EventTasksModal event={activeTasksEvent} onClose={() => setActiveTasksEvent(null)} />}
      {activeDocsEvent && <EventDocsModal event={activeDocsEvent} onClose={() => setActiveDocsEvent(null)} />}
      {activeMeetEvent && <EventMeetModal event={activeMeetEvent} onClose={() => setActiveMeetEvent(null)} />}
      {activeExpensesEvent && <EventExpensesModal event={activeExpensesEvent} onClose={() => setActiveExpensesEvent(null)} currentUserRole={currentUserRole} />}
      
      {isCreatingEvent && (
        <NewEventModal 
          onClose={() => setIsCreatingEvent(false)} 
          onSave={async (data) => {
            const newEvent = {
              title: data.title,
              date: data.date,
              time: data.time,
              type: data.type,
              status: 'upcoming',
              team: [],
              coordinators: []
            };
            try {
              await addDoc(collection(db, 'events'), newEvent);
              setIsCreatingEvent(false);
            } catch (error) {
              alert("Backend Rejected: " + error.message);
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
            let updateData = {};
            if (activeManageTeamEvent.type === 'Coordinators') {
              const reps = activeManageTeamEvent.event.team.filter(id => !activeManageTeamEvent.event.coordinators.includes(id));
              updateData = { coordinators: selectedIds, team: [...selectedIds, ...reps] };
            } else {
              updateData = { team: [...activeManageTeamEvent.event.coordinators, ...selectedIds] };
            }
            try {
              await updateDoc(doc(db, 'events', String(activeManageTeamEvent.event.id)), updateData);
              setActiveManageTeamEvent(null);
            } catch (error) {
              alert("Backend Rejected: " + error.message);
            }
          }}
        />
      )}
    </div>
  );
}

function LeaderboardTab() {
  const { users } = useContext(AppContext);
  const [sortBy, setSortBy] = useState('hours'); 
  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === 'hours') return b.hours - a.hours || b.badges.appreciate - a.badges.appreciate; 
    return b.badges.appreciate - a.badges.appreciate || b.hours - a.hours;
  });

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="bg-white p-5 border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><Trophy className="text-yellow-500 mr-3" size={28} /> Leaderboard</h1>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setSortBy('hours')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${sortBy === 'hours' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Most Hours</button>
          <button onClick={() => setSortBy('appreciations')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${sortBy === 'appreciations' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Most Appreciated</button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {sortedUsers.map((user, index) => {
          const rank = index + 1;
          let rankStyles = "bg-white border-gray-100";
          let rankBadge = <span className="font-bold text-gray-500 w-6 text-center">{rank}</span>;
          if (rank === 1) { rankStyles = "bg-yellow-50 border-yellow-300 shadow-sm"; rankBadge = <Trophy size={20} className="text-yellow-500 mx-1" />; }
          else if (rank === 2) { rankStyles = "bg-slate-50 border-slate-300 shadow-sm"; rankBadge = <Medal size={20} className="text-slate-400 mx-1" />; }
          else if (rank === 3) { rankStyles = "bg-orange-50 border-orange-300 shadow-sm"; rankBadge = <Medal size={20} className="text-orange-500 mx-1" />; }
          return (
            <div key={user.id} className={`p-4 rounded-xl border flex items-center ${rankStyles}`}>
              <div className="flex items-center justify-center w-8 mr-3">{rankBadge}</div>
              <div className="relative mr-4"><img src={user.image} alt={user.name} className={`w-12 h-12 rounded-full bg-white border-2 ${rank === 1 ? 'border-yellow-400' : 'border-transparent'}`} /></div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{user.name}</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{user.vertical} {user.role === 'Coordinator' ? 'Coord.' : 'Rep'}</p>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold flex items-center justify-end ${sortBy === 'hours' ? 'text-blue-600' : 'text-gray-500'}`}>{user.hours} <span className="text-[10px] font-medium ml-1">hrs</span></div>
                <div className={`text-sm font-bold flex items-center justify-end ${sortBy === 'appreciations' ? 'text-green-600' : 'text-gray-500'}`}>{user.badges.appreciate} <PartyPopper size={12} className="ml-1" /></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UserProfileModal({ user, onClose }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const times = ['9AM', '11AM', '1PM', '3PM', '5PM'];
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5">
        <div className="relative p-6 border-b border-gray-100 flex items-center">
          <button onClick={onClose} className="absolute right-4 top-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
          <img src={user.image} alt={user.name} className={`w-16 h-16 rounded-full shadow-sm border-2 ${user.role === 'Coordinator' ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}`} />
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-600 font-medium mr-3">{user.vertical} {user.role === 'Coordinator' ? 'Coord.' : 'Rep'}</span>
              {user.isFreeNow ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Free Now</span> : <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">In Class</span>}
            </div>
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-blue-50 p-3 rounded-xl text-center">
              <div className="text-xl font-black text-blue-700">{user.hours}</div>
              <div className="text-xs text-blue-600 font-medium mt-1">Hours Logged</div>
            </div>
            <div className="bg-green-50 p-3 rounded-xl text-center">
              <div className="flex justify-center mb-1 text-green-600"><PartyPopper size={18} /></div>
              <div className="text-lg font-bold text-green-700">{user.badges.appreciate}</div>
              <div className="text-[10px] text-green-600 font-medium">Appreciations</div>
            </div>
            <div className="bg-red-50 p-3 rounded-xl text-center">
              <div className="flex justify-center mb-1 text-red-500"><Hand size={18} /></div>
              <div className="text-lg font-bold text-red-700">{user.badges.slap}</div>
              <div className="text-[10px] text-red-600 font-medium">Slaps</div>
            </div>
          </div>
          <h3 className="font-bold text-gray-800 mb-4 flex items-center"><CalendarIcon size={18} className="mr-2 text-blue-600" /> Weekly Schedule</h3>
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
                    const hasClass = (i + j + user.id) % 3 === 0; 
                    return <div key={`${day}-${time}`} className={`h-8 rounded ${hasClass ? 'bg-red-100 border border-red-200' : 'bg-white border border-gray-100'} flex items-center justify-center`}>{hasClass && <span className="text-[8px] font-bold text-red-400">CLASS</span>}</div>;
                  })}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-center text-gray-400 mt-3">White blocks indicate free time slots.</p>
          <div className="flex space-x-3 mt-8">
            <button className="flex-1 flex items-center justify-center bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"><MessageSquare size={18} className="mr-2" /> Message</button>
            <a href={`tel:${user.phone}`} className="flex items-center justify-center px-6 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-md shadow-green-200" title="Call"><Phone size={20} /></a>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventChatModal({ event, onClose }) {
  const { users } = useContext(AppContext);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, senderId: event.coordinators[0], text: "Hey team! Let's make sure we are all set for the upcoming tasks.", time: "10:00 AM" },
    { id: 2, senderId: 'me', text: "I'll be bringing the supplies from the storage room.", time: "10:15 AM" }
  ]);
  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessages([...messages, { id: Date.now(), senderId: 'me', text: messageText, time: "Now" }]);
    setMessageText("");
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
          <div><h2 className="text-lg font-bold text-gray-800 leading-tight">Team Chat</h2><p className="text-xs text-blue-600 font-medium">{event.title}</p></div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          <div className="text-center text-[10px] text-gray-400 font-medium my-4">Today</div>
          {messages.map((msg) => {
            const isMe = msg.senderId === 'me';
            const user = !isMe ? users.find(u => String(u.id) === String(msg.senderId)) : null;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && user && <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full bg-gray-200 mr-2 mt-auto" />}
                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isMe && user && <span className="text-[10px] text-gray-500 mb-1 ml-1">{user.name.split(' ')[0]}</span>}
                  <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'}`}>{msg.text}</div>
                  <span className="text-[9px] text-gray-400 mt-1">{msg.time}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-3 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type a message..." className="flex-1 bg-gray-100 border-transparent rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={!messageText.trim()} className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${messageText.trim() ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}><Send size={18} /></button>
          </form>
        </div>
      </div>
    </div>
  );
}

function EventTasksModal({ event, onClose }) {
  const [newTaskText, setNewTaskText] = useState("");
  const [tasks, setTasks] = useState([
    { id: 1, text: "Finalize guest list", completed: true },
    { id: 2, text: "Book venue and catering", completed: false },
  ]);
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTaskText, completed: false }]);
    setNewTaskText("");
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between"><h2 className="text-lg font-bold">Event Tasks</h2><button onClick={onClose}><X size={20} /></button></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {tasks.map(task => (
            <div key={task.id} onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))} className={`flex items-center p-3 rounded-xl border cursor-pointer ${task.completed ? 'bg-gray-100 opacity-70' : 'bg-white'}`}>
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 ${task.completed ? 'bg-blue-500' : ''}`}>{task.completed && <CheckSquare size={14} className="text-white" />}</div>
              <span className={`text-sm flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.text}</span>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleAddTask} className="flex items-center space-x-2">
            <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} className="flex-1 bg-gray-100 px-4 py-3 rounded-xl text-sm" placeholder="New task..." />
            <button type="submit" className="p-3 bg-blue-600 text-white rounded-xl"><Plus size={20} /></button>
          </form>
        </div>
      </div>
    </div>
  );
}

function EventDocsModal({ event, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[100]"><div className="bg-white p-6 rounded-3xl"><h2 className="text-lg font-bold">Docs (Mock)</h2><button onClick={onClose} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Close</button></div></div>
  );
}

function EventMeetModal({ event, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[100]"><div className="bg-white p-6 rounded-3xl"><h2 className="text-lg font-bold">Meets (Mock)</h2><button onClick={onClose} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Close</button></div></div>
  );
}

function EventExpensesModal({ event, onClose }) {
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[100]"><div className="bg-white p-6 rounded-3xl"><h2 className="text-lg font-bold">Expenses (Mock)</h2><button onClick={onClose} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Close</button></div></div>
    );
}

function NewEventModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'Flagship'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">New Event</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <form id="newEventForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Event Title</label>
              <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                <input required type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time</label>
                <input required type="time" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Event Type</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="Flagship">Flagship</option>
                <option value="Seminar">Seminar</option>
                <option value="Networking">Networking</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>
          </form>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button type="submit" form="newEventForm" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-md">Create Event</button>
        </div>
      </div>
    </div>
  );
}

function ManageTeamModal({ event, type, onClose, onSave }) {
  const { users } = useContext(AppContext);
  const availableUsers = users.filter(u => 
    type === 'Coordinators' ? u.level === 'Coordinator' : u.level === 'Representative'
  );
  
  const [selectedIds, setSelectedIds] = useState(
    type === 'Coordinators' ? event.coordinators : event.team.filter(id => !event.coordinators.includes(id))
  );

  const toggleUser = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(uid => uid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Manage {type}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
          {availableUsers.map(user => {
            const isSelected = selectedIds.includes(user.id);
            return (
              <div key={user.id} onClick={() => toggleUser(user.id)} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                <img src={user.image} className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-gray-800">{user.name}</h4>
                  <p className="text-[10px] text-gray-500">{user.vertical}</p>
                </div>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                  {isSelected && <Check size={14} />}
                </div>
              </div>
            );
          })}
          {availableUsers.length === 0 && <div className="p-4 text-center text-gray-500">No {type} available.</div>}
        </div>
        <div className="p-4 border-t border-gray-100 bg-white">
          <button onClick={() => onSave(selectedIds)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-md">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function NavButton({ icon, label, isActive, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
      <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>{icon}</div>
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

function LoginPage({ onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vertical: 'Design',
    role: 'Representative',
    schedule: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData);
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen font-sans">
      <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[auto] sm:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="absolute top-0 left-0 w-full h-48 bg-blue-600 rounded-b-[50%] scale-x-150 transform -translate-y-10 z-0 shadow-lg"></div>
        <div className="relative z-10 w-full mb-8 text-center text-white">
          <div className="bg-white text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3">
             <CalendarIcon size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight">AlumSync</h1>
          <p className="text-blue-100 mt-1 font-medium">Connect & Collaborate</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full relative z-10 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
            <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm" placeholder="John Doe" onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
            <input required type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm" placeholder="john@university.edu" onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
            <input required type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm" placeholder="+1 (234) 567-8900" onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Team Role</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm appearance-none cursor-pointer" onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="Design">Design</option>
                <option value="Networking">Networking</option>
                <option value="Operations">Operations</option>
                <option value="Media">Media</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Level</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm appearance-none cursor-pointer" onChange={e => setFormData({...formData, level: e.target.value})}>
                <option value="Representative">Representative</option>
                <option value="Coordinator">Coordinator</option>
                <option value="Team Leader">Team Leader</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Schedule (.ics)</label>
            <input required type="file" accept=".ics" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={e => setFormData({...formData, schedule: e.target.files[0]})} />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl mt-6 hover:bg-blue-700 active:bg-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center">
            Join Platform <ChevronRight size={18} className="ml-1" />
          </button>
        </form>
        <p className="mt-8 text-xs text-gray-400 font-medium text-center relative z-10 cursor-pointer hover:text-gray-600 transition-colors">
          Already have an account? Sign In
        </p>
      </div>
    </div>
  );
}
