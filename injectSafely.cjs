const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Ensure Lucide Icons are available
const newIcons = "Camera, Pencil, Landmark, Wallet, Verified, Check, X as XIcon, ChevronUp, ChevronDown, User";
code = code.replace(/import \{([^\}]+)\} from 'lucide-react';/, (match, p1) => {
  return "import {" + p1 + ", " + newIcons + "} from 'lucide-react';";
});

// Add Profile Component Import
if (!code.includes('import ProfileTab')) {
  code = "import ProfileTab from './components/ProfileTab';\n" + code;
}

// Ensure contextual imports
if (!code.includes('import { storage }')) {
  code = "import { storage } from './lib/firebase';\nimport { ref, uploadBytes, getDownloadURL } from 'firebase/storage';\n" + code;
}
if (!code.includes('getDoc')) {
  code = code.replace(/import {([^}]+)} from 'firebase\\/firestore';/, (match, p1) => {
    return "import {" + p1 + ", getDoc, setDoc} from 'firebase/firestore';";
  });
}
if (!code.includes('import { AppContext }')) {
  code = code.replace(/import \{ db \} from '\\.\\/lib\\/firebase';/, "import { db, auth } from './lib/firebase';\nimport { AppContext } from './lib/context.jsx';");
}
if (!code.includes('signInAnonymously')) {
  code = "import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';\n" + code;
}

// REMOVE context export crash
code = code.replace(/export const AppContext = createContext\(\);\n/g, '');

// FIX Latency Load block
const regexLoad = /useEffect\(\(\) => \{\s*let usersLoaded = false;[\s\S]*?\}, \[\]\);/m;
if (regexLoad.test(code)) {
  code = code.replace(regexLoad, `  useEffect(() => {
    if (!isLoggedIn) return;
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const fetchedUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(fetchedUsers);
      setLoading(false);
    });
    const unsubEvents = onSnapshot(collection(db, 'events'), (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubUsers(); unsubEvents(); };
  }, [isLoggedIn]);`);
}

// FIX Auto-Signin Seed
const regexLogin = /<LoginPage onLogin={\(userData\) => \{/m;
if (regexLogin.test(code)) {
  code = code.replace(regexLogin, `<LoginPage onLogin={async (userData) => {
      if (!auth.currentUser) {
        const cred = await signInAnonymously(auth);
        const uRef = doc(db, 'users', cred.user.uid);
        const snap = await getDoc(uRef);
        if (!snap.exists()) {
           await setDoc(uRef, {
             fullName: userData.name || "Test User",
             email: userData.email || "demo@alumsync.com",
             role: userData.role || "Representative",
             vertical: userData.vertical || "Networking",
             level: userData.level || "Representative",
             totalHours: 0,
             badgesAppreciate: 0,
             badgesSlap: 0,
             isFreeNow: true
           });
        }
      }`);
}

// FIX Nav Routing (The exact reason it wasn't visible)
if (!code.includes('<ProfileTab />')) {
  code = code.replace(
    /\{activeTab === 'leaderboard' && <LeaderboardTab \/>\}/, 
    "{activeTab === 'leaderboard' && <LeaderboardTab />}\n            {activeTab === 'profile' && <ProfileTab />}"
  );
}
if (!code.includes('label="Profile"')) {
  code = code.replace(
    /<NavButton icon=\{<Trophy size=\{24\} \/>\} label="Rankings" isActive=\{activeTab === 'leaderboard'\} onClick=\{\(\) => setActiveTab\('leaderboard'\)\} \/>/,
    `<NavButton icon={<Trophy size={24} />} label="Rankings" isActive={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} />\n            <NavButton icon={<User size={24} />} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />`
  );
}

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('App.jsx properly wired to ProfileTab! Done!');
