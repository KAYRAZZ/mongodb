const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    fs.cpSync(src, dest, { recursive: true });
}

const root = process.cwd();
copyDir(path.join(root, 'models'), path.join(root, 'dist', 'models'));
copyDir(path.join(root, 'views'), path.join(root, 'dist', 'views'));
