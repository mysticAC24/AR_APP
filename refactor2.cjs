const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Wrap addDoc in try/catch
code = code.replace(
  /addDoc\(collection\(db, 'events'\), newEvent\);\s*setIsCreatingEvent\(false\);/g,
  `try {
              await addDoc(collection(db, 'events'), newEvent);
              setIsCreatingEvent(false);
            } catch (error) {
              alert("Backend Rejected: " + error.message);
            }`
);

// We must also make the onSave function async where addDoc is used
code = code.replace(/onSave={\(data\) => {/g, 'onSave={async (data) => {');

// 2. Wrap updateDoc in ManageTeamModal with try/catch
code = code.replace(
  /updateDoc\(doc\(db, 'events', String\(activeManageTeamEvent\.event\.id\)\), updateData\);\s*setActiveManageTeamEvent\(null\);/g,
  `try {
              await updateDoc(doc(db, 'events', String(activeManageTeamEvent.event.id)), updateData);
              setActiveManageTeamEvent(null);
            } catch (error) {
              alert("Backend Rejected: " + error.message);
            }`
);
code = code.replace(/onSave={\(selectedIds\) => {/g, 'onSave={async (selectedIds) => {');

// 3. Remove seedDatabase completely
code = code.replace(/if \(fetchedUsers\.length === 0\) seedDatabase\(\);\s*else setUsers\(fetchedUsers\);/g, 'setUsers(fetchedUsers);');
code = code.replace(/const seedDatabase = async \(\) => {[\s\S]*?};\s*/g, '');

// 4. Add persistent actual auth integration (Anonymous Login for demonstration)
const importAuth = "import { auth } from './lib/firebase';\nimport { signInAnonymously, onAuthStateChanged } from 'firebase/auth';\n";
code = code.replace(/import { db } from '\.\/lib\/firebase';/, importAuth + "import { db } from './lib/firebase';");

const authEffect = `
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Authenticated
      } else {
        await signInAnonymously(auth);
      }
    });
`;
code = code.replace(/let usersLoaded = false;/, authEffect + '\n    let usersLoaded = false;');
code = code.replace(/return \(\) => { unsubUsers\(\); unsubEvents\(\); };/, 'return () => { unsubAuth(); unsubUsers(); unsubEvents(); };');

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('Integration Refactor Complete.');
