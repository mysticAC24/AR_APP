import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Users,
  LayoutList,
  Search,
  Clock,
  Award,
  PartyPopper,
  Hand,
  X,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  MessageSquare,
  FileText,
  Send,
  Plus,
  ExternalLink,
  Trophy,
  Medal,
  Phone,
  Video,
  Link as LinkIcon,
  Receipt,
  Check,
  XCircle,
  User, // Added User icon
  UserCircle,
  Wallet,
  Landmark,
  Image as ImageIcon,
  Edit2,
  Camera,
  Download
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_USERS = [
  { id: 1, name: "Alex Sharma", role: "Design", level: "Coordinator", isFreeNow: true, hours: 12, badges: { appreciate: 3, slap: 0 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", upi: "alex@okhdfc" },
  { id: 2, name: "Priya Patel", role: "Networking", level: "Representative", isFreeNow: false, hours: 24, badges: { appreciate: 5, slap: 1 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya", upi: "priya@oksbi" },
  { id: 3, name: "Rahul Singh", role: "Operations", level: "Coordinator", isFreeNow: true, hours: 8, badges: { appreciate: 1, slap: 0 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul", upi: "rahul@okaxis" },
  { id: 4, name: "Neha Gupta", role: "Media", level: "Coordinator", isFreeNow: true, hours: 15, badges: { appreciate: 4, slap: 0 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha", upi: "neha@okicici" },
  { id: 5, name: "Kabir Khan", role: "Networking", level: "Representative", isFreeNow: false, hours: 5, badges: { appreciate: 0, slap: 2 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir", upi: "kabir@okhdfc" },
  { id: 6, name: "Ananya Desai", role: "Design", level: "Representative", isFreeNow: true, hours: 18, badges: { appreciate: 6, slap: 0 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya", upi: "ananya@oksbi" },
];

const MOCK_EVENTS = [
  { id: 1, title: "Alumni Meet 2026", date: "2026-03-25", time: "10:00 AM", status: "upcoming", type: "Flagship", team: [1, 2, 3], coordinators: [1] },
  { id: 2, title: "Guest Lecture: Tech Trends", date: "2026-03-20", time: "02:00 PM", status: "ongoing", type: "Seminar", team: [4, 5], coordinators: [4] },
  { id: 3, title: "Batch of '16 Reunion", date: "2026-02-15", time: "06:00 PM", status: "past", type: "Networking", team: [1, 2, 4, 6], coordinators: [6] },
  { id: 4, title: "Career Fair Prep", date: "2026-04-05", time: "09:00 AM", status: "upcoming", type: "Workshop", team: [3, 6], coordinators: [3] },
];

// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState('directory');
  const [currentUserRole, setCurrentUserRole] = useState('Team Leader');
  const [activityLog, setActivityLog] = useState([]);

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen font-sans">
      {/* Mobile App Container */}
      <div className="w-full max-w-md bg-white h-screen flex flex-col shadow-2xl overflow-hidden relative">

        {/* Prototype Role Simulator */}
        <div className="bg-indigo-900 text-indigo-100 text-[10px] py-1.5 px-4 flex justify-between items-center z-50">
          <span className="font-semibold uppercase tracking-wider">Simulating Role:</span>
          <select
            value={currentUserRole}
            onChange={(e) => setCurrentUserRole(e.target.value)}
            className="bg-indigo-800 text-white border border-indigo-700 outline-none rounded px-2 py-0.5 cursor-pointer"
          >
            <option value="Team Leader">Team Leader</option>
            <option value="Coordinator">Coordinator</option>
            <option value="Representative">Representative</option>
          </select>
        </div>

        {/* App Content Area */}
        <div className="flex-1 overflow-y-auto pb-20">
          {activeTab === 'home' && <HomeTab activityLog={activityLog} currentUserRole={currentUserRole} />}
          {activeTab === 'directory' && <DirectoryTab />}
          {activeTab === 'events' && <EventsTab currentUserRole={currentUserRole} activityLog={activityLog} setActivityLog={setActivityLog} />}
          {activeTab === 'leaderboard' && <LeaderboardTab />}
          {activeTab === 'profile' && <ProfileTab currentUserRole={currentUserRole} />}
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 px-1 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-[60]">
          <NavButton
            icon={<CalendarIcon size={24} />}
            label="Home"
            isActive={activeTab === 'home'}
            onClick={() => setActiveTab('home')}
          />
          <NavButton
            icon={<Users size={24} />}
            label="Team"
            isActive={activeTab === 'directory'}
            onClick={() => setActiveTab('directory')}
          />
          <NavButton
            icon={<LayoutList size={24} />}
            label="Events"
            isActive={activeTab === 'events'}
            onClick={() => setActiveTab('events')}
          />
          <NavButton
            icon={<Trophy size={24} />}
            label="Rankings"
            isActive={activeTab === 'leaderboard'}
            onClick={() => setActiveTab('leaderboard')}
          />
          <NavButton
            icon={<User size={24} />}
            label="Profile"
            isActive={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          />
        </div>
      </div>
    </div>
  );
}

// --- TAB 1: HOME (CALENDAR) ---
function HomeTab({ activityLog = [], currentUserRole }) {
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

function ActivityLogModal({ activityLog, onClose }) {
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

// --- TAB 2: TEAM DIRECTORY ---
function DirectoryTab() {
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

// --- TAB 3: EVENTS & TRACKING ---
function EventsTab({ currentUserRole = 'Team Leader', activityLog, setActivityLog }) {
  const [events, setEvents] = useState([...MOCK_EVENTS]);
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
  const [showMyEvents, setShowMyEvents] = useState(false);

  // Determine mock user ID based on role for simulation
  const mockUserId = currentUserRole === 'Coordinator' ? 4 : (currentUserRole === 'Representative' ? 5 : null);

  const filteredEvents = events.filter(e => {
    if (e.status !== eventFilter) return false;
    if (showMyEvents && mockUserId) {
      return e.team.includes(mockUserId);
    }
    return true;
  });

  const handleManageSave = (selectedIds) => {
    if (!activeManageTeamEvent) return;
    const { event, type } = activeManageTeamEvent;
    setEvents(prev => prev.map(ev => {
      if (ev.id !== event.id) return ev;
      if (type === 'Coordinators') {
        const existingReps = ev.team.filter(id => !ev.coordinators.includes(id));
        return { ...ev, coordinators: selectedIds, team: [...selectedIds, ...existingReps] };
      } else {
        return { ...ev, team: [...ev.coordinators, ...selectedIds] };
      }
    }));
    setActiveManageTeamEvent(null);
  };

  const requestAction = (actionType, targetUser, eventTitle, hours) => {
    setPendingAction({ actionType, targetUser, eventTitle, hours });
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    const { actionType, targetUser, eventTitle, hours } = pendingAction;
    const entry = {
      id: Date.now(),
      giverRole: currentUserRole,
      giverName: currentUserRole === 'Team Leader' ? 'You (Team Leader)' : currentUserRole === 'Coordinator' ? 'You (Coordinator)' : 'You (Representative)',
      targetName: targetUser.name,
      targetId: targetUser.id,
      eventTitle,
      actionType,
      hours: actionType === 'hours' ? Number(hours) : null,
      timestamp: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
    };
    setActivityLog(prev => [entry, ...prev]);
    if (actionType === 'hours') {
      setHourInputs(prev => ({ ...prev, [targetUser.id]: '' }));
    }
    setPendingAction(null);
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-300">
      <div className="bg-white p-5 border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Event Management</h1>

        {/* Segmented Control */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {['ongoing', 'upcoming', 'past'].map(status => (
            <button
              key={status}
              onClick={() => setEventFilter(status)}
              className={`flex-1 py-2 text-sm font-semibold capitalize rounded-lg transition-all
                ${eventFilter === status ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* My Events Filter Toggle */}
        {currentUserRole !== 'Team Leader' && (
          <div className="mt-4 flex items-center justify-between bg-blue-50/50 px-4 py-2.5 rounded-xl border border-blue-100">
            <span className="text-sm font-semibold text-blue-900">Show My Events Only</span>
            <button
              onClick={() => setShowMyEvents(!showMyEvents)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center shadow-inner ${showMyEvents ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute transition-transform ${showMyEvents ? 'translate-x-6' : 'translate-x-1'}`}></div>
            </button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {filteredEvents.map(event => {
          const isExpanded = expandedEvent === event.id;
          const reps = event.team.filter(id => !event.coordinators.includes(id));

          return (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all">
              {/* Event Header & Coordinators */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
              >
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
                        const user = MOCK_USERS.find(u => u.id === userId);
                        return user ? (
                          <img key={userId} src={user.image} className="w-6 h-6 rounded-full border-2 border-white bg-blue-100" alt={user.name} title={user.name} />
                        ) : null;
                      })}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
              </div>

              {/* Expanded Section */}
              {isExpanded && (
                <div className="border-t border-gray-100 animate-in slide-in-from-top-2">

                  {/* Full Team Roster (Split) */}
                  <div className="bg-gray-50 p-4 space-y-3">
                    {/* Coordinators Section */}
                    <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Coordinators ({event.coordinators.length})</h4>
                        {currentUserRole === 'Team Leader' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveManageTeamEvent({ event, type: 'Coordinators' }); }}
                            className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                          >
                            Manage
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {event.coordinators.map(userId => {
                          const user = MOCK_USERS.find(u => u.id === userId);
                          return user ? (
                            <div key={userId} className="flex items-center bg-white border border-blue-200 rounded-full pr-3 p-1 shadow-sm">
                              <img src={user.image} className="w-6 h-6 rounded-full bg-blue-100 mr-2" alt={user.name} />
                              <span className="text-xs font-medium text-blue-900">{user.name.split(' ')[0]}</span>
                            </div>
                          ) : null;
                        })}
                        {event.coordinators.length === 0 && <span className="text-xs text-gray-400 italic">No coordinators assigned</span>}
                      </div>
                    </div>

                    {/* Representatives Section */}
                    <div className="border border-green-200 bg-green-50/50 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider">Representatives ({reps.length})</h4>
                        {(currentUserRole === 'Team Leader' || currentUserRole === 'Coordinator') && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveManageTeamEvent({ event, type: 'Representatives' }); }}
                            className="text-[10px] font-bold text-green-600 bg-white px-2 py-0.5 rounded border border-green-200 hover:bg-green-50 transition-colors"
                          >
                            Manage
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {reps.map(userId => {
                          const user = MOCK_USERS.find(u => u.id === userId);
                          return user ? (
                            <div key={userId} className="flex items-center bg-white border border-green-200 rounded-full pr-3 p-1 shadow-sm">
                              <img src={user.image} className="w-6 h-6 rounded-full bg-green-100 mr-2" alt={user.name} />
                              <span className="text-xs font-medium text-green-900">{user.name.split(' ')[0]}</span>
                            </div>
                          ) : null;
                        })}
                        {reps.length === 0 && <span className="text-xs text-gray-400 italic">No representatives assigned</span>}
                      </div>
                    </div>
                  </div>

                  {/* Planning Tools */}
                  <div className="p-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Planning Tools</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setActiveTasksEvent(event)}
                        className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                      >
                        <CheckSquare size={18} className="text-gray-400 group-hover:text-blue-500 mb-1" />
                        <span className="text-[11px] font-medium text-gray-600 group-hover:text-blue-600">Tasks</span>
                      </button>
                      <button
                        onClick={() => setActiveChatEvent(event)}
                        className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                      >
                        <MessageSquare size={18} className="text-gray-400 group-hover:text-blue-500 mb-1" />
                        <span className="text-[11px] font-medium text-gray-600 group-hover:text-blue-600">Chat</span>
                      </button>
                      <button
                        onClick={() => setActiveDocsEvent(event)}
                        className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                      >
                        <FileText size={18} className="text-gray-400 group-hover:text-blue-500 mb-1" />
                        <span className="text-[11px] font-medium text-gray-600 group-hover:text-blue-600">Docs</span>
                      </button>
                      <button
                        onClick={() => setActiveMeetEvent(event)}
                        className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                      >
                        <Video size={18} className="text-gray-400 group-hover:text-blue-500 mb-1" />
                        <span className="text-[11px] font-medium text-gray-600 group-hover:text-blue-600">Meet</span>
                      </button>
                      <button
                        onClick={() => setActiveExpensesEvent(event)}
                        className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                      >
                        <Receipt size={18} className="text-gray-400 group-hover:text-blue-500 mb-1" />
                        <span className="text-[11px] font-medium text-gray-600 group-hover:text-blue-600">Expenses</span>
                      </button>
                    </div>
                  </div>

                  {/* Log Hours & Feedback Section */}
                  <div className="p-4 bg-blue-50/50 border-t border-blue-100">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <Award size={16} className="mr-1 text-blue-600" /> Log Hours & Feedback
                    </h4>
                    <div className="space-y-3">
                      {event.team.map(userId => {
                        const user = MOCK_USERS.find(u => u.id === userId);

                        const isTargetCoordinator = event.coordinators.includes(userId);
                        let canEdit = false;
                        if (currentUserRole === 'Team Leader') {
                          canEdit = true;
                        } else if (currentUserRole === 'Coordinator') {
                          canEdit = !isTargetCoordinator;
                        }

                        return user ? (
                          <div key={userId} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                            <div className="flex items-center flex-1">
                              <img src={user.image} className="w-8 h-8 rounded-full bg-gray-100 mr-3" alt="" />
                              <div>
                                <div className="text-sm font-semibold">
                                  {user.name}
                                  {isTargetCoordinator && <span className="ml-1 text-[10px] text-blue-500 font-bold">(C)</span>}
                                </div>
                                <div className="text-[10px] text-gray-500 flex items-center mt-0.5">
                                  <CheckCircle2 size={10} className="text-green-500 mr-1" /> {user.hours} hrs total
                                </div>
                              </div>
                            </div>

                            {canEdit ? (
                              <div className="flex items-center space-x-1.5">
                                <div className="flex items-center bg-blue-50 border border-blue-200 rounded-full overflow-hidden">
                                  <button
                                    className="w-7 h-7 flex items-center justify-center text-blue-400 hover:bg-blue-100 transition-colors font-bold text-sm"
                                    onClick={() => {
                                      const cur = Number(hourInputs[userId] || 0);
                                      if (cur > 0) setHourInputs(prev => ({ ...prev, [userId]: String(cur - 1) }));
                                    }}
                                  >−</button>
                                  <input
                                    type="number" placeholder="0" min="0" max="12"
                                    className="w-8 py-1 text-center text-sm font-bold text-blue-700 bg-transparent outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    value={hourInputs[userId] || ''}
                                    onChange={(e) => setHourInputs(prev => ({ ...prev, [userId]: e.target.value }))}
                                  />
                                  <button
                                    className="w-7 h-7 flex items-center justify-center text-blue-400 hover:bg-blue-100 transition-colors font-bold text-sm"
                                    onClick={() => {
                                      const cur = Number(hourInputs[userId] || 0);
                                      if (cur < 12) setHourInputs(prev => ({ ...prev, [userId]: String(cur + 1) }));
                                    }}
                                  >+</button>
                                </div>
                                <button
                                  className="w-7 h-7 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-sm transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                  disabled={!hourInputs[userId] || Number(hourInputs[userId]) <= 0}
                                  title="Submit hours"
                                  onClick={() => {
                                    const hrs = hourInputs[userId];
                                    if (!hrs || Number(hrs) <= 0) return;
                                    requestAction('hours', user, event.title, hrs);
                                  }}
                                >
                                  <Check size={14} />
                                </button>
                                <button className="w-7 h-7 flex items-center justify-center text-green-600 bg-green-50 rounded-full hover:bg-green-100 border border-green-200 transition-all active:scale-90" title="Appreciate"
                                  onClick={() => requestAction('appreciate', user, event.title)}>
                                  <PartyPopper size={14} />
                                </button>
                                <button className="w-7 h-7 flex items-center justify-center text-red-500 bg-red-50 rounded-full hover:bg-red-100 border border-red-200 transition-all active:scale-90" title="Slap"
                                  onClick={() => requestAction('slap', user, event.title)}>
                                  <Hand size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="text-[10px] text-gray-400 italic px-2">
                                {currentUserRole === 'Representative' ? 'View Only' : 'Requires Team Leader Access'}
                              </div>
                            )}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {filteredEvents.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            No {eventFilter} events found.
          </div>
        )}
      </div>

      {/* Modals */}
      {activeChatEvent && <EventChatModal event={activeChatEvent} onClose={() => setActiveChatEvent(null)} />}
      {activeTasksEvent && <EventTasksModal event={activeTasksEvent} onClose={() => setActiveTasksEvent(null)} />}
      {activeDocsEvent && <EventDocsModal event={activeDocsEvent} onClose={() => setActiveDocsEvent(null)} />}
      {activeMeetEvent && <EventMeetModal event={activeMeetEvent} onClose={() => setActiveMeetEvent(null)} />}
      {activeExpensesEvent && <EventExpensesModal event={activeExpensesEvent} onClose={() => setActiveExpensesEvent(null)} currentUserRole={currentUserRole} />}
      {activeManageTeamEvent && (
        <ManageTeamModal
          event={activeManageTeamEvent.event}
          type={activeManageTeamEvent.type}
          onClose={() => setActiveManageTeamEvent(null)}
          onSave={handleManageSave}
        />
      )}
      {pendingAction && (
        <ConfirmActionModal
          action={pendingAction}
          currentUserRole={currentUserRole}
          onConfirm={confirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}

function ManageTeamModal({ event, type, onClose, onSave }) {
  const allUsers = MOCK_USERS.filter(u =>
    type === 'Coordinators' ? u.level === 'Coordinator' : u.level === 'Representative'
  );

  const currentlySelected = type === 'Coordinators'
    ? event.coordinators
    : event.team.filter(id => !event.coordinators.includes(id));

  const [selectedIds, setSelectedIds] = useState(currentlySelected);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
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
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
              <X size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${type.toLowerCase()}...`}
              className="w-full bg-gray-100 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
          {filteredUsers.map(user => {
            const isSelected = selectedIds.includes(user.id);
            return (
              <div
                key={user.id}
                onClick={() => toggleUser(user.id)}
                className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all
                  ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
              >
                <img src={user.image} className="w-10 h-10 rounded-full bg-gray-200 mr-3" alt={user.name} />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-gray-800">{user.name}</h4>
                  <p className="text-[10px] text-gray-500">{user.role}</p>
                </div>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                  ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                  {isSelected && <Check size={14} />}
                </div>
              </div>
            );
          })}
          {filteredUsers.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? `No ${type.toLowerCase()} matching "${searchQuery}"` : `No ${type.toLowerCase()} available to assign.`}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-100 bg-white flex space-x-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={() => onSave(selectedIds)} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-md transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmActionModal({ action, currentUserRole, onConfirm, onCancel }) {
  const { actionType, targetUser, eventTitle, hours } = action;
  let title, description, iconEl, btnColor;
  if (actionType === 'hours') {
    title = 'Confirm Hours';
    description = `Add ${hours} hour(s) to ${targetUser.name} for "${eventTitle}"?`;
    iconEl = <Clock size={24} className="text-blue-500" />;
    btnColor = 'bg-blue-600 hover:bg-blue-700 text-white';
  } else if (actionType === 'appreciate') {
    title = 'Confirm Appreciation';
    description = `Send an appreciation to ${targetUser.name} for "${eventTitle}"?`;
    iconEl = <PartyPopper size={24} className="text-green-500" />;
    btnColor = 'bg-green-600 hover:bg-green-700 text-white';
  } else {
    title = 'Confirm Slap';
    description = `Send a slap to ${targetUser.name} for "${eventTitle}"?`;
    iconEl = <Hand size={24} className="text-red-500" />;
    btnColor = 'bg-red-600 hover:bg-red-700 text-white';
  }
  return (
    <div className="fixed inset-0 bg-black/50 z-[110] flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {iconEl}
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
          <div className="flex items-center justify-center mt-4 bg-gray-50 rounded-xl p-3">
            <img src={targetUser.image} className="w-10 h-10 rounded-full bg-gray-200 mr-3" alt="" />
            <div className="text-left">
              <div className="text-sm font-bold text-gray-800">{targetUser.name}</div>
              <div className="text-[10px] text-gray-500">Logged by: {currentUserRole}</div>
            </div>
          </div>
        </div>
        <div className="flex border-t border-gray-100">
          <button onClick={onCancel} className="flex-1 py-3.5 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className={`flex-1 py-3.5 text-sm font-bold ${btnColor} transition-colors border-l border-gray-100 rounded-br-2xl`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}


// --- TAB 4: LEADERBOARD ---
function LeaderboardTab() {
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

// --- TAB 5: PROFILE & FINANCES ---
function ProfileTab({ currentUserRole }) {
  // Mock Logged-in User based on simulated role
  let loggedInUser;
  if (currentUserRole === 'Team Leader') {
    loggedInUser = { id: 99, name: "Parth Boss", role: "Management", level: "Team Leader", hours: 140, badges: { appreciate: 25, slap: 0 }, image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Parth", upi: "parth@okicici" };
  } else if (currentUserRole === 'Coordinator') {
    loggedInUser = MOCK_USERS.find(u => u.level === 'Coordinator');
  } else {
    loggedInUser = MOCK_USERS.find(u => u.level === 'Representative');
  }

  const [selectedBill, setSelectedBill] = useState(null);
  const [showReimbursedHistory, setShowReimbursedHistory] = useState(false);
  const [showPendingReimbursements, setShowPendingReimbursements] = useState(true);

  // Profile & Banner Upload States
  const [uploadedProfile, setUploadedProfile] = useState(null);
  const [uploadedBanner, setUploadedBanner] = useState(null);

  // Clear uploads when simulating a different role
  React.useEffect(() => {
    setUploadedProfile(null);
  }, [currentUserRole]);

  const displayProfileImage = uploadedProfile || loggedInUser.image;
  // Using a generic university building as the default mock banner
  const displayBannerImage = uploadedBanner || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=300&fit=crop";

  const handleProfileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedProfile(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleBannerUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedBanner(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Mock Global Pending Approvals (For Team Leader)
  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 101, event: "Alumni Meet 2026", requestedBy: "Alex Sharma", upiId: "alex@okhdfc", item: "Venue Booking Advance", amount: 5000, receiptUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop" },
    { id: 102, event: "Guest Lecture", requestedBy: "Neha Gupta", upiId: "neha@okicici", item: "Speaker Mementos", amount: 1200, receiptUrl: "https://images.unsplash.com/photo-1565347871638-9bf95f3da7e4?w=400&h=600&fit=crop" },
    { id: 103, event: "Reunion Event", requestedBy: "Priya Patel", upiId: "priya@oksbi", item: "Decorations", amount: 800, receiptUrl: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=600&fit=crop" }
  ]);

  const [teamReimbursed, setTeamReimbursed] = useState([
    { id: 104, event: "Career Fair Prep", requestedBy: "Kabir Khan", upiId: "kabir@okhdfc", item: "Posters", amount: 1500, receiptUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop" }
  ]);
  const [showTeamReimbursedHistory, setShowTeamReimbursedHistory] = useState(false);

  const handleGlobalApprove = (id) => {
    const itemToApprove = pendingApprovals.find(req => req.id === id);
    if (itemToApprove) {
      setTeamReimbursed(prev => [itemToApprove, ...prev]);
    }
    setPendingApprovals(prev => prev.filter(req => req.id !== id));
  };

  const handleGlobalReject = (id) => setPendingApprovals(prev => prev.filter(req => req.id !== id));

  // Mock Personal Expenses (For Reps & Coordinators)
  const [myExpenses] = useState([
    { id: 201, event: "Alumni Meet 2026", requestedBy: loggedInUser.name, upiId: loggedInUser.upi, item: "Printer Ink & Paper", amount: 1500, status: 'Pending', receiptUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop" },
    { id: 202, event: "Guest Lecture", requestedBy: loggedInUser.name, upiId: loggedInUser.upi, item: "Water Bottles", amount: 400, status: 'Reimbursed', receiptUrl: "https://images.unsplash.com/photo-1565347871638-9bf95f3da7e4?w=400&h=600&fit=crop" },
    { id: 203, event: "Career Fair Prep", requestedBy: loggedInUser.name, upiId: loggedInUser.upi, item: "Stationery", amount: 3800, status: 'Reimbursed', receiptUrl: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=600&fit=crop" }
  ]);

  const myPending = myExpenses.filter(e => e.status === 'Pending');
  const myReimbursed = myExpenses.filter(e => e.status === 'Reimbursed');
  const totalPending = myPending.reduce((sum, e) => sum + e.amount, 0);
  const totalReimbursed = myReimbursed.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex flex-col animate-in fade-in duration-300 pb-8">
      {/* Profile Header Block (LinkedIn Style) */}
      <div className="bg-white shadow-sm relative pb-4">
        {/* Banner */}
        <div className="relative h-32 bg-gray-200 w-full group">
          <img src={displayBannerImage} alt="Cover" className="w-full h-full object-cover" />
          <label className="absolute top-3 right-3 p-2 bg-white text-gray-600 rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition-colors" title="Edit Background">
            <Edit2 size={16} />
            <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
          </label>
        </div>

        {/* Profile Details Container */}
        <div className="px-5 relative">
          {/* Avatar overlapping banner */}
          <div className="absolute -top-12 left-5">
            <div className="relative">
              <img src={displayProfileImage} alt={loggedInUser.name} className="w-24 h-24 rounded-full border-4 border-white bg-blue-50 shadow-sm object-cover" />
              <label className="absolute bottom-0 right-0 p-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-full text-gray-700 shadow-sm cursor-pointer transition-colors" title="Edit Profile Picture">
                <Camera size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={handleProfileUpload} />
              </label>
            </div>
          </div>

          {/* Edit Profile Action (right side) */}
          <div className="flex justify-end pt-3">
            <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
              <Edit2 size={18} />
            </button>
          </div>

          {/* Text Info */}
          <div className="mt-1">
            <h1 className="text-xl font-bold text-gray-900 flex items-center">
              {loggedInUser.name} <CheckCircle2 size={16} className="text-gray-400 ml-1" />
            </h1>
            <p className="text-sm text-gray-800 mt-1 font-medium">{loggedInUser.role} {loggedInUser.level} | Alumni Relations</p>
            <p className="text-xs text-gray-500 mt-1">Indian Institute of Technology, Delhi</p>
            <div className="flex items-center mt-3 space-x-2">
              <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-1 rounded-md uppercase tracking-wider font-bold flex items-center border border-blue-100">
                UPI: {loggedInUser.upi}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 relative z-10">

        {/* Personal Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="text-xl font-black text-gray-800">{loggedInUser.hours}</div>
            <div className="text-[10px] text-gray-500 font-medium mt-1">Total Hours</div>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="flex justify-center mb-1 text-green-500"><PartyPopper size={18} /></div>
            <div className="text-lg font-bold text-gray-800 leading-none">{loggedInUser.badges.appreciate}</div>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="flex justify-center mb-1 text-red-500"><Hand size={18} /></div>
            <div className="text-lg font-bold text-gray-800 leading-none">{loggedInUser.badges.slap}</div>
          </div>
        </div>

        {/* My Personal Reimbursements Section */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center">
            <Wallet className="text-blue-600 mr-2" size={20} /> My Finances
          </h3>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex divide-x divide-gray-100">
            <div className="flex-1 text-center pr-2">
              <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-black text-yellow-600">₹{totalPending.toLocaleString()}</p>
            </div>
            <div className="flex-1 text-center pl-2">
              <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Reimbursed</p>
              <p className="text-2xl font-black text-green-600">₹{totalReimbursed.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Rep/Coordinator Personal Expense Details */}
        {currentUserRole !== 'Team Leader' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">

            {/* Pending List */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3 flex items-center text-sm">
                <Clock className="text-yellow-600 mr-2" size={16} /> Pending Requests
              </h4>
              <div className="space-y-3">
                {myPending.map(req => (
                  <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-yellow-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">{req.item}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{req.event}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-800">₹{req.amount}</span>
                        <button
                          onClick={() => setSelectedBill(req)}
                          className="text-[10px] text-blue-600 font-medium flex items-center justify-end mt-1 hover:text-blue-800 transition-colors"
                        >
                          <ImageIcon size={12} className="mr-1" /> View Bill
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {myPending.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No pending requests.</p>}
              </div>
            </div>

            {/* Reimbursed List (Collapsible) */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setShowReimbursedHistory(!showReimbursedHistory)}
                className="w-full flex items-center justify-between font-bold text-gray-800 p-4 text-sm focus:outline-none hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <CheckCircle2 className="text-green-600 mr-2" size={18} /> Reimbursed History
                </div>
                {showReimbursedHistory ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
              </button>

              {showReimbursedHistory && (
                <div className="space-y-3 p-4 pt-0 animate-in fade-in slide-in-from-top-2">
                  {myReimbursed.map(req => (
                    <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-green-100 opacity-80">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">{req.item}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{req.event}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-800">₹{req.amount}</span>
                          <button
                            onClick={() => setSelectedBill(req)}
                            className="text-[10px] text-blue-600 font-medium flex items-center justify-end mt-1 hover:text-blue-800 transition-colors"
                          >
                            <ImageIcon size={12} className="mr-1" /> View Bill
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {myReimbursed.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No history found.</p>}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Team Leader Global Expense Tracking Section */}
        {currentUserRole === 'Team Leader' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
            {/* Team Leader Global Expense Tracking Section (Collapsible) */}
            <div className="bg-white rounded-xl border border-purple-100 overflow-hidden shadow-sm">
              <button
                onClick={() => setShowPendingReimbursements(!showPendingReimbursements)}
                className="w-full flex items-center justify-between font-bold text-gray-800 p-4 focus:outline-none hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center text-base">
                  <Landmark className="text-purple-600 mr-2" size={20} /> Team Reimbursements
                </div>
                {showPendingReimbursements ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
              </button>

              {showPendingReimbursements && (
                <div className="space-y-3 p-4 pt-0 animate-in fade-in slide-in-from-top-2">
                  {pendingApprovals.map(req => (
                    <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">{req.item}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{req.event}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-800">₹{req.amount}</span>
                          <button
                            onClick={() => setSelectedBill(req)}
                            className="text-[10px] text-blue-600 font-medium flex items-center justify-end mt-1 hover:text-blue-800 transition-colors"
                          >
                            <ImageIcon size={12} className="mr-1" /> View Bill
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-50 pt-3 mt-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs">
                            {req.requestedBy.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-700 leading-none">{req.requestedBy}</p>
                            <p className="text-[9px] text-gray-400 mt-0.5">{req.upiId}</p>
                          </div>
                        </div>

                        {/* Quick Approve Actions */}
                        <div className="flex space-x-1.5">
                          <button
                            onClick={() => handleGlobalReject(req.id)}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                          <button
                            onClick={() => handleGlobalApprove(req.id)}
                            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center font-bold text-[10px]"
                            title="Settle/Reimburse"
                          >
                            <Check size={16} className="mr-1" /> Settle
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingApprovals.length === 0 && (
                    <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check size={24} />
                      </div>
                      <p className="text-sm font-bold text-gray-700">All Caught Up!</p>
                      <p className="text-xs text-gray-500 mt-1">No pending reimbursements across the team.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Team Leader Settled History (Collapsible) */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setShowTeamReimbursedHistory(!showTeamReimbursedHistory)}
                className="w-full flex items-center justify-between font-bold text-gray-800 p-4 text-sm focus:outline-none hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <CheckCircle2 className="text-green-600 mr-2" size={18} /> Previously Reimbursed
                </div>
                {showTeamReimbursedHistory ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
              </button>

              {showTeamReimbursedHistory && (
                <div className="space-y-3 p-4 pt-0 animate-in fade-in slide-in-from-top-2">
                  {teamReimbursed.map(req => (
                    <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-green-100 opacity-80">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">{req.item}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{req.event}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-800">₹{req.amount}</span>
                          <button
                            onClick={() => setSelectedBill(req)}
                            className="text-[10px] text-blue-600 font-medium flex items-center justify-end mt-1 hover:text-blue-800 transition-colors"
                          >
                            <ImageIcon size={12} className="mr-1" /> View Bill
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 border-t border-gray-50 pt-2 mt-1">
                        <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-[10px]">
                          {req.requestedBy.charAt(0)}
                        </div>
                        <p className="text-[10px] text-gray-500">Reimbursed to <span className="font-bold text-gray-700">{req.requestedBy}</span></p>
                      </div>
                    </div>
                  ))}
                  {teamReimbursed.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No settled history found.</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bill Preview Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Receipt Preview</h3>
                <p className="text-xs text-blue-600 font-medium truncate max-w-[200px]">{selectedBill.item}</p>
              </div>
              <button onClick={() => setSelectedBill(null)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 bg-gray-50 flex justify-center items-center">
              <img
                src={selectedBill.receiptUrl}
                alt="Bill Receipt"
                className="max-h-[50vh] object-contain rounded-lg border border-gray-200 shadow-sm"
              />
            </div>
            <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-gray-500">Requested by</p>
                <p className="text-xs font-bold text-gray-800">{selectedBill.requestedBy}</p>
              </div>
              <p className="text-lg font-black text-gray-800">₹{selectedBill.amount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- MODALS & HELPERS ---

function UserProfileModal({ user, onClose }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const times = ['9AM', '11AM', '1PM', '3PM', '5PM'];

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5">

        <div className="relative p-6 border-b border-gray-100 flex items-center">
          <button onClick={onClose} className="absolute right-4 top-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
            <X size={20} />
          </button>
          <img src={user.image} alt={user.name} className={`w-16 h-16 rounded-full shadow-sm border-2 ${user.level === 'Coordinator' ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}`} />
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-600 font-medium mr-3">{user.role} {user.level === 'Coordinator' ? 'Coord.' : 'Rep'}</span>
              {user.isFreeNow ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Free Now</span>
              ) : (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">In Class</span>
              )}
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

          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <CalendarIcon size={18} className="mr-2 text-blue-600" />
            Weekly Schedule
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
                    const hasClass = (i + j + user.id) % 3 === 0;
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
            <button className="flex-1 flex items-center justify-center bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">
              <MessageSquare size={18} className="mr-2" />
              Message
            </button>
            <a
              href={`tel:${user.phone}`}
              className="flex items-center justify-center px-6 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-md shadow-green-200"
              title="Call"
            >
              <Phone size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventChatModal({ event, onClose }) {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, senderId: event.coordinators[0], text: "Hey team! Let's make sure we are all set for the upcoming tasks.", time: "10:00 AM" },
    { id: 2, senderId: 'me', text: "I'll be bringing the supplies from the storage room.", time: "10:15 AM" }
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMsg = {
      id: Date.now(),
      senderId: 'me',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setMessageText("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">

        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">Team Chat</h2>
            <p className="text-xs text-blue-600 font-medium">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          <div className="text-center text-[10px] text-gray-400 font-medium my-4">Today</div>

          {messages.map((msg) => {
            const isMe = msg.senderId === 'me';
            const user = !isMe ? MOCK_USERS.find(u => u.id === msg.senderId) : null;

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && user && (
                  <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full bg-gray-200 mr-2 mt-auto" />
                )}
                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isMe && user && <span className="text-[10px] text-gray-500 mb-1 ml-1">{user.name.split(' ')[0]}</span>}
                  <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1">{msg.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 border-transparent rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${messageText.trim() ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
            >
              <Send size={18} />
            </button>
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
    { id: 3, text: "Send out invitations", completed: false }
  ]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTaskText, completed: false }]);
    setNewTaskText("");
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">

        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">Event Tasks</h2>
            <p className="text-xs text-blue-600 font-medium">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">To Do ({tasks.filter(t => !t.completed).length})</span>
          </div>
          {tasks.map(task => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${task.completed ? 'bg-gray-100 border-transparent opacity-70' : 'bg-white border-gray-200 shadow-sm hover:border-blue-300'}`}
            >
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 flex-shrink-0 ${task.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                {task.completed && <CheckSquare size={14} />}
              </div>
              <span className={`text-sm flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-800 font-medium'}`}>
                {task.text}
              </span>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No tasks added yet.</div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleAddTask} className="flex items-center space-x-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 bg-gray-100 border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!newTaskText.trim()}
              className={`p-3 rounded-xl transition-colors flex-shrink-0 flex items-center justify-center ${newTaskText.trim() ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
            >
              <Plus size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function EventDocsModal({ event, onClose }) {
  const docs = [
    { id: 1, title: "Event Proposal & Budget", type: "PDF", date: "Mar 10" },
    { id: 2, title: "Vendor Contact List", type: "Sheet", date: "Mar 12" },
    { id: 3, title: "Marketing Assets", type: "Folder", date: "Mar 14" }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">

        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">Shared Documents</h2>
            <p className="text-xs text-blue-600 font-medium">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mr-3 flex-shrink-0">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-800 truncate">{doc.title}</h4>
                <div className="flex items-center text-[10px] text-gray-500 mt-0.5">
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium mr-2">{doc.type}</span>
                  <span>Added {doc.date}</span>
                </div>
              </div>
              <button className="text-gray-400 group-hover:text-blue-600 p-2">
                <ExternalLink size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <button className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 border border-blue-200 font-bold py-3.5 rounded-xl hover:bg-blue-100 transition-colors">
            <Plus size={18} />
            <span>Upload or Attach Link</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function EventMeetModal({ event, onClose }) {
  const [newMeetTitle, setNewMeetTitle] = useState("");
  const [meets, setMeets] = useState([
    { id: 1, title: "Sync up: Roles & Responsibilities", time: "Tomorrow, 8:00 PM", link: "meet.google.com/abc-defg-hij" },
    { id: 2, title: "Final Event Walkthrough", time: "Mar 22, 6:00 PM", link: "meet.google.com/xyz-uvwx-yz" }
  ]);

  const handleAddMeet = (e) => {
    e.preventDefault();
    if (!newMeetTitle.trim()) return;
    setMeets([...meets, { id: Date.now(), title: newMeetTitle, time: "TBD", link: "Pending Link" }]);
    setNewMeetTitle("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">

        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">Team Meetings</h2>
            <p className="text-xs text-blue-600 font-medium">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {meets.map(meet => (
            <div key={meet.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-all">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-semibold text-gray-800 pr-2">{meet.title}</h4>
                <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg text-center flex-shrink-0">
                  <Video size={16} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3 flex items-center">
                <Clock size={12} className="mr-1" /> {meet.time}
              </p>
              <a
                href={`https://${meet.link}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <LinkIcon size={14} className="mr-2" /> Join Meeting
              </a>
            </div>
          ))}
          {meets.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No meetings scheduled yet.</div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleAddMeet} className="flex items-center space-x-2">
            <input
              type="text"
              value={newMeetTitle}
              onChange={(e) => setNewMeetTitle(e.target.value)}
              placeholder="Topic for new meet..."
              className="flex-1 bg-gray-100 border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!newMeetTitle.trim()}
              className={`p-3 rounded-xl transition-colors flex-shrink-0 flex items-center justify-center ${newMeetTitle.trim() ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
            >
              <Plus size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function EventExpensesModal({ event, onClose, currentUserRole }) {
  const [newItem, setNewItem] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [expenses, setExpenses] = useState([
    { id: 1, submittedBy: event.coordinators[0], item: "Venue Booking Advance", amount: 5000, status: 'Pending' },
    { id: 2, submittedBy: event.coordinators[0] || 4, item: "Banners & Flex Printing", amount: 1200, status: 'Approved' }
  ]);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newItem.trim() || !newAmount.trim()) return;
    setExpenses([...expenses, {
      id: Date.now(),
      submittedBy: 1, // Simulating the current user submitting
      item: newItem,
      amount: parseFloat(newAmount),
      status: 'Pending'
    }]);
    setNewItem("");
    setNewAmount("");
  };

  const handleApprove = (id) => {
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, status: 'Approved' } : exp));
  };

  const handleReject = (id) => {
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, status: 'Rejected' } : exp));
  };

  if (currentUserRole === 'Representative') {
    return (
      <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4 backdrop-blur-sm">
        <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-xl animate-in zoom-in-95">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-sm text-gray-500 mb-6">Only Coordinators and Team Leaders have access to event finances and reimbursements.</p>
          <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden">

        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">Reimbursements</h2>
            <p className="text-xs text-blue-600 font-medium">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {expenses.map(exp => {
            const user = MOCK_USERS.find(u => u.id === exp.submittedBy);
            return (
              <div key={exp.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-2">
                    <h4 className="text-sm font-semibold text-gray-800">{exp.item}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Submitted by {user ? user.name : 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">₹{exp.amount}</div>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[9px] font-bold uppercase rounded-full tracking-wider
                      ${exp.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${exp.status === 'Approved' ? 'bg-green-100 text-green-700' : ''}
                      ${exp.status === 'Rejected' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {exp.status}
                    </span>
                  </div>
                </div>

                {/* Team Leader Approval Actions */}
                {currentUserRole === 'Team Leader' && exp.status === 'Pending' && (
                  <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleReject(exp.id)}
                      className="flex items-center px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <XCircle size={14} className="mr-1" /> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(exp.id)}
                      className="flex items-center px-3 py-1.5 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <Check size={14} className="mr-1" /> Approve
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {expenses.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No expenses submitted yet.</div>
          )}
        </div>

        {/* Coordinator Form: Submit new expense */}
        {(currentUserRole === 'Coordinator' || currentUserRole === 'Team Leader') && (
          <div className="p-4 bg-white border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Request Reimbursement</h4>
            <form onSubmit={handleAddExpense} className="flex space-x-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Item / Description"
                className="flex-1 bg-gray-100 border-transparent rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="Amt (₹)"
                min="1"
                className="w-24 bg-gray-100 border-transparent rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!newItem.trim() || !newAmount.trim()}
                className={`p-2 rounded-xl transition-colors flex-shrink-0 flex items-center justify-center ${newItem.trim() && newAmount.trim() ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
              >
                <Plus size={20} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function NavButton({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors
        ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>
        {icon}
      </div>
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}
