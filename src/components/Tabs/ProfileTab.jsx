import React, { useState, useEffect, useContext, createContext } from 'react';
import { 
  Calendar as CalendarIcon, Users, LayoutList, Search, Clock, Award, 
  PartyPopper, Hand, X, ChevronRight, CheckCircle2, AlertCircle, 
  ChevronDown, ChevronUp, CheckSquare, MessageSquare, FileText, Send, 
  Plus, ExternalLink, Trophy, Medal, Phone, Video, Link as LinkIcon, 
  Receipt, Landmark, Download, ImageIcon, Check, XCircle
} from 'lucide-react';
import { MOCK_USERS, MOCK_EVENTS } from '../../data/mockData';

export function ProfileTab({ currentUserRole }) {
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
