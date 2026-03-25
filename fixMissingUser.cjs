const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

// The anonymous login block was:
// const unsubAuth = onAuthStateChanged(auth, async (user) => {
//   if (user) {
//     // Authenticated
//   } else {

const oldAuthBlock = `    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Authenticated
      } else {
        await signInAnonymously(auth);
      }`;

const newAuthBlock = `    import { doc, getDoc, setDoc } from 'firebase/firestore'; // ensured below
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Create mock profile if it doesn't exist
        const uRef = doc(db, 'users', user.uid);
        const snap = await getDoc(uRef);
        if (!snap.exists()) {
           await setDoc(uRef, {
             fullName: "Test User",
             email: "demo@alumsync.com",
             role: "Representative",
             vertical: "Networking",
             totalHours: 0,
             badgesAppreciate: 0,
             badgesSlap: 0,
             isFreeNow: true
           });
        }
      } else {
        await signInAnonymously(auth);
      }`;

code = code.replace(oldAuthBlock, newAuthBlock);

// ensure setDoc is imported
if (!code.includes('setDoc')) {
  code = code.replace(/import {([^\}]+)} from 'firebase\/firestore';/, (match, p1) => {
    return `import {${p1}, setDoc} from 'firebase/firestore';`;
  });
}

// Remove the import inside the function I just accidentally pasted in newAuthBlock 
code = code.replace(/import \{ doc, getDoc, setDoc \} from 'firebase\/firestore'; \/\/ ensured below\n/g, '');

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('Fixed Missing User Auth.');
