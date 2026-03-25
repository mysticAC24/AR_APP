const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add 'User' 'DollarSign' 'CreditCard' 'CornerDownRight' etc to Lucide imports
code = code.replace(/import {([^}]+)} from 'lucide-react';/, (match, p1) => {
  return `import {${p1}, User, DollarSign, CreditCard, Banknote, FileText as FileIcon} from 'lucide-react';`;
});

// 2. Add queries/doc to firebase imports if missing
if (!code.includes('query,')) {
  code = code.replace(/import {([^\}]+)} from 'firebase\/firestore';/, (match, p1) => {
    return `import {${p1}, query, where, getDoc} from 'firebase/firestore';`;
  });
}

// 3. Add the conditional rendering for the Profile Tab
code = code.replace(/\{activeTab === 'leaderboard' && <LeaderboardTab \/>\}/, `{activeTab === 'leaderboard' && <LeaderboardTab />}\n            {activeTab === 'profile' && <ProfileTab />}`);

// 4. Add the NavButton for Profile
const leaderboardNavBtn = `<NavButton icon={<Trophy size={24} />} label="Rankings" isActive={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} />`;
const profileNavBtn = `            <NavButton icon={<User size={24} />} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />`;
code = code.replace(leaderboardNavBtn, `${leaderboardNavBtn}\n${profileNavBtn}`);

// 5. Build and append the ProfileTab component code
const profileTabCode = `
import { auth } from './lib/firebase';

function ProfileTab() {
  const { currentUserRole, users } = React.useContext(AppContext);
  const [profileData, setProfileData] = React.useState(null);
  const [myExpenses, setMyExpenses] = React.useState({ pending: 0, reimbursed: 0 });
  const [teamPendingExpenses, setTeamPendingExpenses] = React.useState([]);
  const [selectedBill, setSelectedBill] = React.useState(null);

  // Step 1 & 2: Load current user profile AND personal finances
  React.useEffect(() => {
    if (!auth.currentUser) return;
    const uid = String(auth.currentUser.uid);
    
    // Listen to user profile
    const unsubProfile = onSnapshot(doc(db, 'users', uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfileData({ id: docSnap.id, ...docSnap.data() });
      }
    });

    // Listen to personal expenses
    const qMyExpenses = query(collection(db, 'expenses'), where('submittedBy', '==', uid));
    const unsubMyExpenses = onSnapshot(qMyExpenses, (snap) => {
      let pendingSum = 0;
      let reimbursedSum = 0;
      snap.forEach(d => {
        const amt = Number(d.data().amount) || 0;
        if (d.data().status === 'pending') pendingSum += amt;
        if (d.data().status === 'reimbursed') reimbursedSum += amt;
      });
      setMyExpenses({ pending: pendingSum, reimbursed: reimbursedSum });
    });

    return () => { unsubProfile(); unsubMyExpenses(); };
  }, []);

  // Step 3: Team Leader Dashboard
  React.useEffect(() => {
    if (currentUserRole !== 'Team Leader') return;
    
    const qTeamExp = query(collection(db, 'expenses'), where('status', '==', 'pending'));
    const unsubTeamExp = onSnapshot(qTeamExp, async (snap) => {
      // In a robust implementation, we'd cache users or do bulk fetches. 
      // Since it's a small team, we wait for all fetches to resolve to join user data.
      const expensesArr = [];
      for (const d of snap.docs) {
        const expData = d.data();
        let userData = { fullName: 'Unknown User', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback', upiId: 'N/A' };
        if (expData.submittedBy) {
          // Attempt to find user in global Context users array or fetch directly
          const contextUser = users.find(u => u.id === expData.submittedBy);
          if (contextUser) {
             userData = { fullName: contextUser.name || contextUser.fullName, avatarUrl: contextUser.image || contextUser.avatarUrl, upiId: contextUser.upiId || 'N/A' };
          } else {
             const userDoc = await getDoc(doc(db, 'users', expData.submittedBy));
             if (userDoc.exists()) {
                const ud = userDoc.data();
                userData = { fullName: ud.fullName || ud.name, avatarUrl: ud.avatarUrl || ud.image, upiId: ud.upiId || 'N/A' };
             }
          }
        }
        expensesArr.push({ id: d.id, ...expData, ...userData });
      }
      setTeamPendingExpenses(expensesArr);
    });

    return () => { unsubTeamExp(); };
  }, [currentUserRole, users]);

  // Step 4: Mutations
  const handleMutateExpense = async (expenseId, newStatus) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'expenses', expenseId), {
        status: newStatus,
        reviewedBy: auth.currentUser.uid
      });
      // Optionally show a success toast here
    } catch (error) {
      alert("Permission Denied: Backend Rules rejected the action.\\n" + error.message);
    }
  };

  if (!profileData) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Profile...</div>;
  }

  // Use the canonical PRD names, resolving mismatches
  const Name = profileData.fullName || profileData.name || "Alumni Leader";
  const Avatar = profileData.avatarUrl || profileData.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=Placeholder";
  const RoleLevel = profileData.role || profileData.level || "Representative"; // TL / Coord / Rep
  const Vertical = profileData.vertical || profileData.role || "Team"; // Networking / Design
  
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 pb-20">
      <div className="bg-gradient-to-br from-indigo-700 to-blue-800 p-6 text-white rounded-b-3xl shadow-lg relative">
        <h1 className="text-2xl font-bold mb-1">My Profile</h1>
        <div className="absolute top-6 right-6 flex flex-col items-center p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
            <div className="text-xl font-black">{profileData.totalHours || profileData.hours || 0}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Hours</div>
        </div>
      </div>

      <div className="px-5 -mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center">
            <img src={Avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-md -mt-12 bg-gray-100 object-cover" />
            <h2 className="text-xl font-bold text-gray-800 mt-3">{Name}</h2>
            <p className="text-sm font-semibold text-blue-600 mb-4">{Vertical} &bull; {RoleLevel}</p>
            
            <div className="flex w-full divide-x divide-gray-100 border-t border-gray-50 pt-4">
               <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-green-600 flex justify-center items-center"><PartyPopper size={16} className="mr-1"/> {profileData.badgesAppreciate || (profileData.badges?.appreciate) || 0}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">Appreciations</div>
               </div>
               <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-red-500 flex justify-center items-center"><Hand size={16} className="mr-1"/> {profileData.badgesSlap || (profileData.badges?.slap) || 0}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">Slaps</div>
               </div>
            </div>
            {profileData.upiId && (
               <div className="w-full mt-4 bg-gray-50 rounded-lg p-3 flex items-center justify-between border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase">UPI ID</span>
                  <span className="text-sm font-mono text-gray-700">{profileData.upiId}</span>
               </div>
            )}
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* My Finances Section */}
        <div>
           <h3 className="font-semibold text-gray-800 mb-3 flex items-center"><DollarSign size={18} className="mr-2 text-green-600" /> My Finances</h3>
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex flex-col justify-center items-center">
                 <div className="text-2xl font-black text-orange-600">₹{myExpenses.pending}</div>
                 <div className="text-xs font-bold text-orange-800/60 uppercase tracking-wider mt-1">Pending</div>
              </div>
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex flex-col justify-center items-center">
                 <div className="text-2xl font-black text-teal-600">₹{myExpenses.reimbursed}</div>
                 <div className="text-xs font-bold text-teal-800/60 uppercase tracking-wider mt-1">Reimbursed</div>
              </div>
           </div>
        </div>

        {/* Step 3: Team Leader Dashboard */}
        {currentUserRole === 'Team Leader' && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
           <h3 className="font-semibold text-gray-800 mb-3 flex items-center"><CreditCard size={18} className="mr-2 text-indigo-600" /> Team Reimbursements</h3>
           {teamPendingExpenses.length === 0 ? (
               <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center flex flex-col items-center justify-center text-gray-400">
                  <CheckCircle2 size={36} className="mb-2 text-gray-300" />
                  <span className="font-bold">All Caught Up!</span>
                  <span className="text-xs">No pending expenses to review.</span>
               </div>
           ) : (
             <div className="space-y-3">
               {teamPendingExpenses.map(exp => (
                 <div key={exp.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex items-center space-x-3">
                          <img src={exp.avatarUrl} className="w-10 h-10 rounded-full border border-gray-200" />
                          <div>
                             <h4 className="font-bold text-sm text-gray-800">{exp.fullName}</h4>
                             <p className="text-[10px] text-gray-500 font-mono mt-0.5">{exp.upiId}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="font-black text-lg text-gray-800">₹{exp.amount}</div>
                          <div className="text-[10px] font-bold text-orange-500 uppercase">{exp.status}</div>
                       </div>
                    </div>
                    {exp.itemDescription && <div className="text-sm text-gray-600 mb-3 italic">"{exp.itemDescription}"</div>}
                    
                    <div className="flex items-center space-x-2 border-t border-gray-100 pt-3">
                       {exp.receiptUrl && (
                         <button onClick={() => setSelectedBill(exp.receiptUrl)} className="flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors mr-auto">
                            <FileIcon size={14} className="mr-1" /> View Bill
                         </button>
                       )}
                       <button onClick={() => handleMutateExpense(exp.id, 'rejected')} className="flex items-center justify-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-lg transition-colors">
                          Reject
                       </button>
                       <button onClick={() => handleMutateExpense(exp.id, 'reimbursed')} className="flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                          <Banknote size={14} className="mr-1" /> Settle
                       </button>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
        )}
      </div>

      {/* Step 5: View Bill Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex flex-col justify-center items-center backdrop-blur-sm p-4 animate-in fade-in">
           <div className="w-full max-w-md flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-lg">Expense Receipt</h3>
              <button onClick={() => setSelectedBill(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"><X size={20} /></button>
           </div>
           {/* If it's a PDF or Image, render appropriately. For simplicity, treating as absolute URL / image */}
           <img src={selectedBill} alt="Bill Receipt" className="w-full bg-white rounded-xl shadow-2xl object-contain max-h-[70vh]" />
           <a href={selectedBill} target="_blank" rel="noreferrer" className="mt-6 px-6 py-3 bg-white text-gray-900 font-bold rounded-xl flex items-center hover:bg-gray-100">
              <ExternalLink size={18} className="mr-2" /> Open Original
           </a>
        </div>
      )}
    </div>
  );
}
`;

code = code.replace(/export default function App/g, profileTabCode + '\nexport default function App');

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('ProfileTab and Navigation Injected Successfully!');
