const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Remove the invalid inner import
code = code.replace(/import \{ doc, getDoc, setDoc \} from 'firebase\/firestore'; \/\/ ensured below\s*/g, '');

// Ensure they exist at the top level
if (!code.includes('setDoc')) {
  code = code.replace(/import {([^}]+)} from 'firebase\/firestore';/, (match, p1) => {
    return `import {${p1}, doc, getDoc, setDoc} from 'firebase/firestore';`;
  });
}

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('Fixed Import Scope.');
