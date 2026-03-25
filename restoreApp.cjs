const { execSync } = require('child_process');
execSync('git checkout HEAD src/App.jsx'); // wait, the staged version is checked out with git checkout-index
execSync('git checkout-index -f -- src/App.jsx'); 
console.log("Restored App.jsx from Git Index.");
