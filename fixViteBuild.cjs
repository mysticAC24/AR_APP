const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// The appended code looks exactly like:
// import { storage } from './lib/firebase';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

code = code.replace(/import \{ storage \} from '\.\/lib\/firebase';\nimport \{ ref, uploadBytes, getDownloadURL \} from 'firebase\/storage';\n/, '');

if (!code.includes('import { storage }')) {
  code = `import { storage } from './lib/firebase';\nimport { ref, uploadBytes, getDownloadURL } from 'firebase/storage';\n` + code;
}

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log("Moved storage imports to top!");
