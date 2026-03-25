const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. MOCK_USERS
code = code.replace(/role: "([^"]+)", level: "([^"]+)"/g, 'vertical: "$1", role: "$2"');

// 2. DirectoryTab state & logic
code = code.replace(/const \[filterRole, setFilterRole\]/g, 'const [filterVertical, setFilterVertical]');
code = code.replace(/const \[filterLevel, setFilterLevel\]/g, 'const [filterRole, setFilterRole]');
code = code.replace(/const roles = \['All', 'Networking', 'Design', 'Operations', 'Media'\];/g, 'const verticals = [\'All\', \'Networking\', \'Design\', \'Operations\', \'Media\'];');
code = code.replace(/const levels = \['All', 'Coordinators', 'Reps'\];/g, 'const rolesFilter = [\'All\', \'Coordinators\', \'Reps\'];');

// filter logic
code = code.replace(/if \(filterRole !== 'All' && user\.role !== filterRole\) return false;/g, `if (filterVertical !== 'All' && user.vertical !== filterVertical) return false;`);
code = code.replace(/if \(filterLevel !== 'All'\) \{/g, `if (filterRole !== 'All') {`);
code = code.replace(/if \(filterLevel === 'Coordinators' && user\.level !== 'Coordinator'\) return false;/g, `if (filterRole === 'Coordinators' && user.role !== 'Coordinator') return false;`);
code = code.replace(/if \(filterLevel === 'Reps' && user\.level !== 'Representative'\) return false;/g, `if (filterRole === 'Reps' && user.role !== 'Representative') return false;`);

// map UI components in DirectoryTab
code = code.replace(/levels\.map\(level/g, 'rolesFilter.map(level');
code = code.replace(/setFilterLevel\(level\)/g, 'setFilterRole(level)');
code = code.replace(/filterLevel === level/g, 'filterRole === level');

code = code.replace(/roles\.map\(role =>/g, 'verticals.map(role =>');
code = code.replace(/setFilterRole\(role\)/g, 'setFilterVertical(role)');
code = code.replace(/filterRole === role/g, 'filterVertical === role');

// display logic user.role and user.level across components
// Careful: replace user.role -> user.vertical, user.level -> user.role
// Since we have both, we need a 3-step swap.
code = code.replace(/user\.role/g, 'user.__VERTICAL__');
code = code.replace(/user\.level/g, 'user.role');
code = code.replace(/user\.__VERTICAL__/g, 'user.vertical');

// LoginPage mappings
code = code.replace(/role: 'Design',/g, 'vertical: \'Design\',');
code = code.replace(/level: 'Representative',/g, 'role: \'Representative\',');

// MOCK_EVENTS team/coordinators mappings shouldn't be affected by this except we need to double check.
fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('Refactor complete.');
