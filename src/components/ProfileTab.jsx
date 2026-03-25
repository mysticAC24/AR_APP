import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { AppContext } from '../lib/context.jsx';
import { collection, onSnapshot, doc, updateDoc, query, where, getDoc } from 'firebase/firestore';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Camera, Pencil, Landmark, Wallet, Verified, CheckCircle2, Check, X as XIcon, ChevronUp, ChevronDown, ExternalLink, PartyPopper, Hand, Clock
} from 'lucide-react';

export default function ProfileTab() {
  const { currentUserRole, users } = React.useContext(AppContext);
  const [profileData, setProfileData] = React.useState(null);
  
  const [myPending, setMyPending] = React.useState([]);
  const [myReimbursed, setMyReimbursed] = React.useState([]);
  const [teamPending, setTeamPending] = React.useState([]);
  const [teamReimbursed, setTeamReimbursed] = React.useState([]);
  
  const [selectedBill, setSelectedBill] = React.useState(null);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [uploadingBanner, setUploadingBanner] = React.useState(false);

  React.useEffect(() => {
    if (!auth?.currentUser) return;
    const uid = String(auth.currentUser.uid);
    const unsub = onSnapshot(doc(db, 'users', uid), (docSnap) => {
      if (docSnap.exists()) setProfileData({ id: docSnap.id, ...docSnap.data() });
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    if (!auth?.currentUser) return;
    const uid = String(auth.currentUser.uid);
    const qMy = query(collection(db, 'expenses'), where('submittedBy', '==', uid));
    const unsub = onSnapshot(qMy, (snap) => {
      const p = []; const r = [];
      snap.forEach(d => {
        const data = { id: d.id, ...d.data() };
        if (data.status === 'pending') p.push(data);
        if (data.status === 'reimbursed') r.push(data);
      });
      setMyPending(p); setMyReimbursed(r);
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    if (!profileData || profileData.level !== 'Team Leader') return;
    
    const qTP = query(collection(db, 'expenses'), where('status', '==', 'pending'));
    const unsub1 = onSnapshot(qTP, async (snap) => {
      const arr = [];
      for (const d of snap.docs) {
        const exp = d.data();
        let uData = { fullName: 'Unknown', avatarUrl: '', upiId: '' };
        if (exp.submittedBy) {
           const udoc = await getDoc(doc(db, 'users', exp.submittedBy));
           if (udoc.exists()) uData = udoc.data();
        }
        arr.push({ id: d.id, ...exp, submitterName: uData.fullName || uData.name || exp.submittedBy, avatarUrl: uData.avatarUrl || uData.image, upiId: uData.upiId });
      }
      setTeamPending(arr);
    });

    const qTR = query(collection(db, 'expenses'), where('status', '==', 'reimbursed'));
    const unsub2 = onSnapshot(qTR, async (snap) => {
      const arr = [];
      for (const d of snap.docs) {
        const exp = d.data();
        let uName = 'Unknown';
        if (exp.submittedBy) {
           const udoc = await getDoc(doc(db, 'users', exp.submittedBy));
           if (udoc.exists()) uName = udoc.data().fullName || udoc.data().name;
        }
        arr.push({ id: d.id, ...exp, submitterName: uName });
      }
      setTeamReimbursed(arr);
    });

    return () => { unsub1(); unsub2(); };
  }, [profileData]);

  const handleUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;
    type === 'avatar' ? setUploadingAvatar(true) : setUploadingBanner(true);
    try {
      const storageRef = ref(storage, \`users/\${auth.currentUser.uid}/\${type}_\${Date.now()}.jpg\`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        [type === 'avatar' ? 'image' : 'bannerUrl']: url
      });
    } catch (err) {
      alert("Upload Failed: " + err.message);
    } finally {
      type === 'avatar' ? setUploadingAvatar(false) : setUploadingBanner(false);
    }
  };

  const handleAction = async (expId, newStatus) => {
    try {
      await updateDoc(doc(db, 'expenses', expId), {
        status: newStatus,
        reviewedBy: auth.currentUser?.uid
      });
    } catch (err) {
       alert("Permission Denied: \\n" + err.message);
    }
  };

  if (!profileData) return <div className="flex h-full items-center justify-center font-bold text-gray-500">Loading Profile...</div>;

  const isTeamLeader = profileData.level === 'Team Leader' || profileData.role === 'Team Leader';
  const myPendingSum = myPending.reduce((a, b) => a + (Number(b.amount)||0), 0);
  const myReimbursedSum = myReimbursed.reduce((a, b) => a + (Number(b.amount)||0), 0);

  return (
    <div className="flex flex-col h-full animate-in fade-in pb-20 bg-gray-50 overflow-y-auto w-full">
      <div className="bg-white pb-6 shadow-sm relative rounded-b-3xl">
         <div className="relative h-40 w-full bg-gray-200">
            <img src={profileData.bannerUrl || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop"} 
                 className="w-full h-full object-cover" alt="Banner" />
            <div className="absolute top-4 right-4 bg-white/50 backdrop-blur-md p-2 rounded-full shadow-sm z-10 w-9 h-9 flex items-center justify-center">
               <label htmlFor="banner-upload" className="cursor-pointer flex items-center justify-center w-full h-full">
                  {uploadingBanner ? <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"/> : <Pencil size={18} className="text-gray-700" />}
               </label>
               <input id="banner-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'banner')} />
            </div>
         </div>

         <div className="px-6 relative -mt-16 text-left">
            <div className="relative inline-block">
               <img src={profileData.image || profileData.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed="+profileData.name} 
                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover bg-white" alt="Avatar"/>
               <div className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md z-10 flex items-center justify-center w-8 h-8">
                  <label htmlFor="avatar-upload" className="cursor-pointer flex items-center justify-center w-full h-full">
                    {uploadingAvatar ? <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"/> : <Camera size={14} className="text-gray-600" />}
                  </label>
                  <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'avatar')} />
               </div>
            </div>
            
            <div className="mt-2 flex justify-between items-start">
               <div>
                 <h1 className="text-2xl font-black text-gray-900 flex items-center">
                    {profileData.fullName || profileData.name} <CheckCircle2 size={18} className="text-gray-400 ml-2" />
                 </h1>
                 <p className="text-sm font-medium text-gray-700 mt-1">{(profileData.vertical || profileData.role || 'Management')} {profileData.level} | Alumni Relations</p>
                 <p className="text-xs text-gray-500 mt-0.5">Indian Institute of Technology, Delhi</p>
               </div>
               <button className="text-gray-400 hover:text-gray-600 transition"><Pencil size={18} /></button>
            </div>
               
            {profileData.upiId && (
              <div className="mt-4 inline-block bg-blue-50 text-blue-600 text-[11px] font-bold uppercase py-1.5 px-3 rounded-md border border-blue-100 shadow-sm">
                 UPI: {profileData.upiId}
              </div>
            )}
         </div>
      </div>

      <div className="px-5 mt-6 space-y-7">
        <div className="grid grid-cols-3 gap-3">
           <div className="bg-white border text-center border-gray-100 rounded-2xl p-4 flex flex-col items-center shadow-sm">
              <span className="text-2xl font-black text-gray-900">{profileData.hours || profileData.totalHours || 0}</span>
              <span className="text-[10px] text-gray-400 font-bold mt-1">Total Hours</span>
           </div>
           <div className="bg-white border text-center border-gray-100 rounded-2xl p-3 flex flex-col items-center justify-center shadow-sm">
              <PartyPopper size={22} className="text-green-500 mb-1" />
              <span className="text-lg font-black text-gray-900">{profileData.badges?.appreciate || profileData.badgesAppreciate || 0}</span>
           </div>
           <div className="bg-white border text-center border-gray-100 rounded-2xl p-3 flex flex-col items-center justify-center shadow-sm">
              <Hand size={22} className="text-red-500 mb-1" />
              <span className="text-lg font-black text-gray-900">{profileData.badges?.slap || profileData.badgesSlap || 0}</span>
           </div>
        </div>

        <div>
           <div className="flex items-center text-gray-800 font-bold text-lg mb-3 px-1">
             <Wallet size={20} className="mr-2 text-blue-600" /> My Finances
           </div>
           <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex divide-x divide-gray-100">
              <div className="flex-1 flex flex-col items-center justify-center">
                 <span className="text-xs text-gray-500 font-bold tracking-wider uppercase">Pending</span>
                 <span className="text-2xl font-black text-orange-500 mt-1">₹{myPendingSum.toLocaleString()}</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                 <span className="text-xs text-gray-500 font-bold tracking-wider uppercase">Reimbursed</span>
                 <span className="text-2xl font-black text-green-500 mt-1">₹{myReimbursedSum.toLocaleString()}</span>
              </div>
           </div>
        </div>

        {isTeamLeader ? (
          <div className="space-y-4">
             <div className="flex items-center text-gray-800 font-bold text-lg px-1">
               <Landmark size={20} className="mr-2 text-indigo-600" /> Team Reimbursements
             </div>
             {teamPending.map(exp => (
                <div key={exp.id} className="bg-white border border-indigo-50 rounded-2xl p-4 shadow-sm">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{exp.itemDescription || exp.title || 'Expense'}</h4>
                        <p className="text-xs text-gray-500">{exp.eventName || 'General Event'}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-lg text-gray-900">₹{exp.amount}</div>
                        {exp.receiptUrl && (
                          <button onClick={() => setSelectedBill(exp.receiptUrl)} className="text-[10px] text-blue-600 font-bold flex items-center justify-end hover:underline cursor-pointer opacity-80 mt-1 transition">
                            <ExternalLink size={10} className="mr-1"/> View Bill
                          </button>
                        )}
                      </div>
                   </div>
                   <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                      <div className="flex items-center">
                         <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-[10px] mr-2 overflow-hidden shadow-sm">
                           {exp.avatarUrl ? <img src={exp.avatarUrl} className="w-full h-full object-cover" /> : exp.submitterName?.[0]}
                         </div>
                         <div className="text-left">
                           <div className="text-xs font-bold text-gray-800">{exp.submitterName}</div>
                           <div className="text-[9px] text-gray-400 font-mono">{exp.upiId || 'No UPI'}</div>
                         </div>
                      </div>
                      <div className="flex items-center space-x-2">
                         <button onClick={() => handleAction(exp.id, 'rejected')} className="w-8 h-8 flex flex-col items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition shadow-sm">
                           <XIcon size={14} strokeWidth={2.5} />
                         </button>
                         <button onClick={() => handleAction(exp.id, 'reimbursed')} className="px-3 h-8 flex items-center justify-center bg-green-50 text-green-600 font-bold text-xs rounded-lg hover:bg-green-100 transition space-x-1 shadow-sm">
                           <Check size={14} strokeWidth={2.5} /> <span>Settle</span>
                         </button>
                      </div>
                   </div>
                </div>
             ))}
             <div className="bg-white border border-green-100 rounded-2xl overflow-hidden mt-6 mb-10 shadow-sm">
                <button onClick={() => setHistoryOpen(!historyOpen)} className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 transition">
                   <div className="flex items-center text-sm font-bold text-gray-800">
                     <CheckCircle2 size={18} className="text-green-500 mr-2" /> Previously Reimbursed
                   </div>
                   {historyOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                {historyOpen && (
                  <div className="p-4 space-y-3 border-t border-green-50 bg-gray-50/50">
                    {teamReimbursed.length === 0 ? <p className="text-xs text-center text-gray-400 py-2">No history</p> : 
                      teamReimbursed.map(exp => (
                        <div key={exp.id} className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between shadow-sm">
                           <div className="text-left">
                              <h4 className="font-bold text-gray-800 text-sm">{exp.itemDescription || exp.title}</h4>
                              <p className="text-[10px] text-gray-500">{exp.eventName || 'General'}</p>
                              <div className="flex items-center mt-3">
                                <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[9px] flex justify-center items-center font-bold mr-1.5 shadow-sm">{exp.submitterName?.[0]}</span>
                                <span className="text-[10px] text-gray-400">Reimbursed to <strong className="text-gray-600">{exp.submitterName}</strong></span>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="font-black text-gray-800 text-lg">₹{exp.amount}</div>
                              {exp.receiptUrl && (
                                <button onClick={() => setSelectedBill(exp.receiptUrl)} className="text-[10px] text-blue-500 flex items-center justify-end hover:underline mt-1 transition">
                                  <ExternalLink size={10} className="mr-1"/> View Bill
                                </button>
                              )}
                           </div>
                        </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        ) : (
          <div className="space-y-6 mb-10 text-left">
             {myPending.length > 0 && (
               <div>
                 <div className="flex items-center text-gray-800 font-bold text-sm mb-3 px-1">
                   <Clock size={16} className="mr-2 text-orange-500" /> Pending Requests
                 </div>
                 <div className="space-y-3">
                   {myPending.map(exp => (
                     <div key={exp.id} className="bg-white border border-yellow-100 rounded-xl p-4 shadow-sm flex justify-between">
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">{exp.itemDescription || exp.title}</h4>
                          <p className="text-[11px] text-gray-500 mt-1">{exp.eventName || 'General'}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-gray-900 text-lg">₹{exp.amount}</div>
                          {exp.receiptUrl && (
                            <button onClick={() => setSelectedBill(exp.receiptUrl)} className="text-[10px] text-blue-600 font-bold flex items-center justify-end hover:underline mt-1">
                              <ExternalLink size={10} className="mr-1"/> View Bill
                            </button>
                          )}
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
             <div className="bg-white border border-green-100 rounded-2xl overflow-hidden shadow-sm">
                <button onClick={() => setHistoryOpen(!historyOpen)} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition border-b border-gray-50">
                   <div className="flex items-center text-sm font-bold text-gray-800">
                     <CheckCircle2 size={18} className="text-green-500 mr-2" /> Reimbursed History
                   </div>
                   {historyOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                {historyOpen && (
                  <div className="p-4 space-y-3 bg-gray-50/50">
                    {myReimbursed.length === 0 ? <p className="text-xs text-center text-gray-400 py-2">No history</p> : 
                      myReimbursed.map(exp => (
                        <div key={exp.id} className="bg-white border border-green-50 rounded-xl p-4 flex justify-between shadow-sm">
                           <div>
                              <h4 className="font-bold text-gray-800 text-sm">{exp.itemDescription || exp.title}</h4>
                              <p className="text-[11px] text-gray-500 mt-1">{exp.eventName || 'General'}</p>
                           </div>
                           <div className="text-right">
                              <div className="font-black text-gray-800 text-lg">₹{exp.amount}</div>
                              {exp.receiptUrl && (
                                <button onClick={() => setSelectedBill(exp.receiptUrl)} className="text-[10px] text-blue-500 flex items-center hover:underline mt-1 justify-end">
                                  <ExternalLink size={10} className="mr-1"/> View Bill
                                </button>
                              )}
                           </div>
                        </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        )}
      </div>

      {selectedBill && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex flex-col justify-center items-center backdrop-blur-sm p-4 animate-in fade-in">
           <div className="w-full max-w-md flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-lg">Receipt</h3>
              <button onClick={() => setSelectedBill(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"><XIcon size={20} /></button>
           </div>
           <img src={selectedBill} className="w-full bg-white rounded-xl shadow-2xl object-contain max-h-[70vh]" />
        </div>
      )}
    </div>
  );
}
