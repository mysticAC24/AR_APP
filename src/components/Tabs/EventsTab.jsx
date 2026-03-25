import React, { useState, useEffect, useContext, createContext } from 'react';
import { 
  Calendar as CalendarIcon, Users, LayoutList, Search, Clock, Award, 
  PartyPopper, Hand, X, ChevronRight, CheckCircle2, AlertCircle, 
  ChevronDown, ChevronUp, CheckSquare, MessageSquare, FileText, Send, 
  Plus, ExternalLink, Trophy, Medal, Phone, Video, Link as LinkIcon, 
  Receipt, Landmark, Download, ImageIcon, Check, XCircle
} from 'lucide-react';
import { MOCK_USERS, MOCK_EVENTS } from '../../data/mockData';

export function EventsTab({ currentUserRole = 'Team Leader', activityLog, setActivityLog }) {
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
