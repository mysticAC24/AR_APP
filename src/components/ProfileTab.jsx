import React, { useState, useEffect, useContext } from 'react';
import { db, storage } from '../lib/firebase';
import { AppContext } from '../lib/context.jsx';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../lib/firebase';
import { deleteUser, reauthenticateWithPopup } from 'firebase/auth';
import {
  Camera, Pencil, Landmark, Wallet, CheckCircle2, Check, X as XIcon,
  ChevronUp, ChevronDown, ExternalLink, PartyPopper, Hand, Clock, LogOut, Trash2
} from 'lucide-react';

export default function ProfileTab() {
  const { userProfile, users, currentUserRole, firebaseUser, signOutUser, showToast } = useContext(AppContext);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [myPending, setMyPending] = useState([]);
  const [myReimbursed, setMyReimbursed] = useState([]);
  const [teamPending, setTeamPending] = useState([]);
  const [teamReimbursed, setTeamReimbursed] = useState([]);

  const [selectedBill, setSelectedBill] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const uid = firebaseUser?.uid;

  // My own expenses
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'expenses'), where('submittedBy', '==', uid));
    const unsub = onSnapshot(q, (snap) => {
      const p = [], r = [];
      snap.forEach(d => {
        const data = { id: d.id, ...d.data() };
        if (data.status === 'pending') p.push(data);
        if (data.status === 'reimbursed') r.push(data);
      });
      setMyPending(p);
      setMyReimbursed(r);
    });
    return () => unsub();
  }, [uid]);

  // Team expenses — TL only
  useEffect(() => {
    if (currentUserRole !== 'Team Leader') return;

    const qTP = query(collection(db, 'expenses'), where('status', '==', 'pending'));
    const unsub1 = onSnapshot(qTP, (snap) => {
      setTeamPending(snap.docs.map(d => {
        const exp = { id: d.id, ...d.data() };
        // Look up submitter from the already-loaded users array (no extra Firestore reads)
        const submitter = users.find(u => u.id === exp.submittedBy);
        return {
          ...exp,
          submitterName: submitter?.fullName || exp.submittedBy,
          avatarUrl: submitter?.avatarUrl || '',
          upiId: submitter?.upiId || '',
        };
      }));
    });

    const qTR = query(collection(db, 'expenses'), where('status', '==', 'reimbursed'));
    const unsub2 = onSnapshot(qTR, (snap) => {
      setTeamReimbursed(snap.docs.map(d => {
        const exp = { id: d.id, ...d.data() };
        const submitter = users.find(u => u.id === exp.submittedBy);
        return { ...exp, submitterName: submitter?.fullName || exp.submittedBy };
      }));
    });

    return () => { unsub1(); unsub2(); };
  }, [currentUserRole, users]);

  const handleUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;
    type === 'avatar' ? setUploadingAvatar(true) : setUploadingBanner(true);
    try {
      const path = type === 'avatar' ? `avatars/${uid}` : `banners/${uid}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', uid), {
        [type === 'avatar' ? 'avatarUrl' : 'bannerUrl']: url,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      showToast('Upload Failed: ' + err.message, 'error');
    } finally {
      type === 'avatar' ? setUploadingAvatar(false) : setUploadingBanner(false);
    }
  };

  const handleAction = async (expId, newStatus) => {
    try {
      await updateDoc(doc(db, 'expenses', expId), {
        status: newStatus,
        reviewedBy: uid,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      showToast('Permission Denied: ' + err.message, 'error');
    }
  };

  if (!userProfile) {
    return <div className="flex h-full items-center justify-center font-bold text-gray-500">Loading Profile...</div>;
  }

  const isTeamLeader = currentUserRole === 'Team Leader';
  const myPendingSum = myPending.reduce((a, b) => a + (Number(b.amount) || 0), 0);
  const myReimbursedSum = myReimbursed.reduce((a, b) => a + (Number(b.amount) || 0), 0);

  const handleRoleChange = async (newRole) => {
    if (!uid || newRole === userProfile.role) return;
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole, updatedAt: serverTimestamp() });
      showToast('Role updated to ' + newRole, 'success');
    } catch (err) {
      showToast('Could not update role: ' + err.message, 'error');
    }
  };

  const handleDeleteProfile = async () => {
    if (!firebaseUser || !uid) return;
    setDeleting(true);
    try {
      // Delete Firestore doc first
      await deleteDoc(doc(db, 'users', uid));
      // Delete Firebase Auth account — may need re-auth if session is old
      try {
        await deleteUser(firebaseUser);
      } catch (authErr) {
        if (authErr.code === 'auth/requires-recent-login') {
          // Re-authenticate then retry
          const { googleProvider } = await import('../lib/firebase');
          await reauthenticateWithPopup(firebaseUser, googleProvider);
          await deleteUser(firebaseUser);
        } else {
          throw authErr;
        }
      }
      // signOutUser cleans up listeners; auth deletion already signs the user out
      signOutUser();
    } catch (err) {
      showToast('Could not delete account: ' + err.message, 'error');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in pb-20 bg-gray-50 overflow-y-auto w-full">

      {/* Banner + Avatar */}
      <div className="bg-white pb-6 shadow-sm relative rounded-b-3xl">
        <div className="relative h-40 w-full bg-gray-200">
          <img
            src={userProfile.bannerUrl || '/icons/Apple-icon.png'}
            className={`w-full h-full ${userProfile.bannerUrl ? 'object-cover' : 'object-contain bg-blue-50 p-4'}`} alt="Banner"
          />
          <div className="absolute top-4 right-4 bg-white/50 backdrop-blur-md p-2 rounded-full shadow-sm z-10 w-9 h-9 flex items-center justify-center">
            <label htmlFor="banner-upload" className="cursor-pointer flex items-center justify-center w-full h-full">
              {uploadingBanner
                ? <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                : <Pencil size={18} className="text-gray-700" />}
            </label>
            <input id="banner-upload" type="file" className="hidden" accept="image/*" onChange={e => handleUpload(e, 'banner')} />
          </div>
        </div>

        <div className="px-6 relative -mt-16 text-left">
          <div className="relative inline-block">
            <img
              src={userProfile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.fullName}`}
              className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover bg-white" alt="Avatar"
            />
            <div className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md z-10 flex items-center justify-center w-8 h-8">
              <label htmlFor="avatar-upload" className="cursor-pointer flex items-center justify-center w-full h-full">
                {uploadingAvatar
                  ? <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  : <Camera size={14} className="text-gray-600" />}
              </label>
              <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={e => handleUpload(e, 'avatar')} />
            </div>
          </div>

          <div className="mt-2 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center">
                {userProfile.fullName} <CheckCircle2 size={18} className="text-gray-400 ml-2" />
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-sm font-medium text-gray-700">{userProfile.vertical} | Alumni Relations</p>
              </div>
              <div className="mt-1.5 flex space-x-1">
                {['Representative', 'Coordinator', 'Team Leader'].map(r => (
                  <button key={r} onClick={() => handleRoleChange(r)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${userProfile.role === r ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {r === 'Representative' ? 'Rep' : r === 'Coordinator' ? 'Coord' : 'TL'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Indian Institute of Technology, Delhi</p>
            </div>
            <div className="flex items-center space-x-1 mt-1">
              <button onClick={signOutUser} title="Sign out"
                className="flex items-center text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
                <LogOut size={16} />
              </button>
              <button onClick={() => setShowDeleteConfirm(true)} title="Delete account"
                className="flex items-center text-gray-400 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {userProfile.upiId && (
            <div className="mt-4 inline-block bg-blue-50 text-blue-600 text-[11px] font-bold uppercase py-1.5 px-3 rounded-md border border-blue-100 shadow-sm">
              UPI: {userProfile.upiId}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mt-6 space-y-7">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border text-center border-gray-100 rounded-2xl p-4 flex flex-col items-center shadow-sm">
            <span className="text-2xl font-black text-gray-900">{userProfile.totalHours || 0}</span>
            <span className="text-[10px] text-gray-400 font-bold mt-1">Total Hours</span>
          </div>
          <div className="bg-white border text-center border-gray-100 rounded-2xl p-3 flex flex-col items-center justify-center shadow-sm">
            <PartyPopper size={22} className="text-green-500 mb-1" />
            <span className="text-lg font-black text-gray-900">{userProfile.badgesAppreciate || 0}</span>
          </div>
          <div className="bg-white border text-center border-gray-100 rounded-2xl p-3 flex flex-col items-center justify-center shadow-sm">
            <Hand size={22} className="text-red-500 mb-1" />
            <span className="text-lg font-black text-gray-900">{userProfile.badgesSlap || 0}</span>
          </div>
        </div>

        {/* My Finances */}
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

        {/* Team Leader: Team Reimbursements */}
        {isTeamLeader ? (
          <div className="space-y-4">
            <div className="flex items-center text-gray-800 font-bold text-lg px-1">
              <Landmark size={20} className="mr-2 text-indigo-600" /> Team Reimbursements
            </div>
            {teamPending.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No pending reimbursement requests.</p>
            )}
            {teamPending.map(exp => (
              <div key={exp.id} className="bg-white border border-indigo-50 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{exp.itemDescription || 'Expense'}</h4>
                    <p className="text-xs text-gray-500">{exp.eventId ? 'Event Expense' : 'General'}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-lg text-gray-900">₹{exp.amount}</div>
                    {exp.receiptUrl && (
                      <button onClick={() => setSelectedBill(exp.receiptUrl)}
                        className="text-[10px] text-blue-600 font-bold flex items-center justify-end hover:underline cursor-pointer mt-1 transition">
                        <ExternalLink size={10} className="mr-1" /> View Bill
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-[10px] mr-2 overflow-hidden shadow-sm">
                      {exp.avatarUrl ? <img src={exp.avatarUrl} className="w-full h-full object-cover" alt="" /> : exp.submitterName?.[0]}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-gray-800">{exp.submitterName}</div>
                      <div className="text-[9px] text-gray-400 font-mono">{exp.upiId || 'No UPI on file'}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleAction(exp.id, 'rejected')}
                      className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition shadow-sm">
                      <XIcon size={14} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => handleAction(exp.id, 'reimbursed')}
                      className="px-3 h-8 flex items-center justify-center bg-green-50 text-green-600 font-bold text-xs rounded-lg hover:bg-green-100 transition space-x-1 shadow-sm">
                      <Check size={14} strokeWidth={2.5} /> <span>Settle</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Reimbursement History */}
            <div className="bg-white border border-green-100 rounded-2xl overflow-hidden mt-6 mb-10 shadow-sm">
              <button onClick={() => setHistoryOpen(!historyOpen)}
                className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 transition">
                <div className="flex items-center text-sm font-bold text-gray-800">
                  <CheckCircle2 size={18} className="text-green-500 mr-2" /> Previously Reimbursed
                </div>
                {historyOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>
              {historyOpen && (
                <div className="p-4 space-y-3 border-t border-green-50 bg-gray-50/50">
                  {teamReimbursed.length === 0
                    ? <p className="text-xs text-center text-gray-400 py-2">No history</p>
                    : teamReimbursed.map(exp => (
                      <div key={exp.id} className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between shadow-sm">
                        <div className="text-left">
                          <h4 className="font-bold text-gray-800 text-sm">{exp.itemDescription || 'Expense'}</h4>
                          <div className="flex items-center mt-3">
                            <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[9px] flex justify-center items-center font-bold mr-1.5 shadow-sm">{exp.submitterName?.[0]}</span>
                            <span className="text-[10px] text-gray-400">Reimbursed to <strong className="text-gray-600">{exp.submitterName}</strong></span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-gray-800 text-lg">₹{exp.amount}</div>
                          {exp.receiptUrl && (
                            <button onClick={() => setSelectedBill(exp.receiptUrl)}
                              className="text-[10px] text-blue-500 flex items-center justify-end hover:underline mt-1 transition">
                              <ExternalLink size={10} className="mr-1" /> View Bill
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
          /* Coordinator / Representative: My own expenses */
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
                        <h4 className="font-bold text-gray-800 text-sm">{exp.itemDescription}</h4>
                        <p className="text-[11px] text-gray-500 mt-1">Pending approval</p>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-gray-900 text-lg">₹{exp.amount}</div>
                        {exp.receiptUrl && (
                          <button onClick={() => setSelectedBill(exp.receiptUrl)}
                            className="text-[10px] text-blue-600 font-bold flex items-center justify-end hover:underline mt-1">
                            <ExternalLink size={10} className="mr-1" /> View Bill
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-white border border-green-100 rounded-2xl overflow-hidden shadow-sm">
              <button onClick={() => setHistoryOpen(!historyOpen)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition border-b border-gray-50">
                <div className="flex items-center text-sm font-bold text-gray-800">
                  <CheckCircle2 size={18} className="text-green-500 mr-2" /> Reimbursed History
                </div>
                {historyOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>
              {historyOpen && (
                <div className="p-4 space-y-3 bg-gray-50/50">
                  {myReimbursed.length === 0
                    ? <p className="text-xs text-center text-gray-400 py-2">No history</p>
                    : myReimbursed.map(exp => (
                      <div key={exp.id} className="bg-white border border-green-50 rounded-xl p-4 flex justify-between shadow-sm">
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">{exp.itemDescription}</h4>
                          <p className="text-[11px] text-green-600 font-medium mt-1">Reimbursed ✓</p>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-gray-800 text-lg">₹{exp.amount}</div>
                          {exp.receiptUrl && (
                            <button onClick={() => setSelectedBill(exp.receiptUrl)}
                              className="text-[10px] text-blue-500 flex items-center hover:underline mt-1 justify-end">
                              <ExternalLink size={10} className="mr-1" /> View Bill
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

      {/* Delete Account Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h2 className="text-lg font-black text-gray-900 text-center">Delete Account?</h2>
            <p className="text-sm text-gray-500 text-center mt-2 mb-6">
              This will permanently delete your profile, hours, and all your data. This cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteProfile} disabled={deleting}
                className="flex-1 py-3 rounded-2xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                {deleting
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Trash2 size={15} /><span>Delete</span></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Viewer */}
      {selectedBill && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex flex-col justify-center items-center backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md flex justify-between items-center mb-4">
            <h3 className="text-white font-bold text-lg">Receipt</h3>
            <button onClick={() => setSelectedBill(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
              <XIcon size={20} />
            </button>
          </div>
          <img src={selectedBill} className="w-full bg-white rounded-xl shadow-2xl object-contain max-h-[70vh]" alt="Receipt" />
        </div>
      )}
    </div>
  );
}
