const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

// Remove the direct export of AppContext
code = code.replace(/export const AppContext = createContext\(\);\n/g, '');

// Import AppContext from the new file
code = code.replace(/import \{ db \} from '\.\/lib\/firebase';/g, "import { db } from './lib/firebase';\nimport { AppContext } from './lib/context.jsx';");

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('Fixed React Fast Refresh AppContext Issue.');
