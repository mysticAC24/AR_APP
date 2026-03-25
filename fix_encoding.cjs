const fs = require('fs');
const content = fs.readFileSync('d:/AR_APP/src/App.jsx', 'utf8');

// Find all lines containing suspicious non-ASCII characters near currency amounts
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Look for non-ASCII chars followed by digits or {req or {total
  if (line.match(/[^\x00-\x7F]/) && (line.includes('amount') || line.includes('total') || line.includes('req.') || line.match(/[^\x00-\x7F]\d/) || line.match(/[^\x00-\x7F]\{/))) {
    const nonAscii = line.match(/[^\x00-\x7F]+/g);
    if (nonAscii) {
      for (const seq of nonAscii) {
        if (seq !== '₹') {
          const codes = [...seq].map(c => 'U+' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'));
          console.log(`Line ${i+1}: "${seq}" -> [${codes.join(', ')}]`);
          console.log(`  Context: ...${line.substring(Math.max(0, line.indexOf(seq) - 15), line.indexOf(seq) + seq.length + 15)}...`);
        }
      }
    }
  }
}
