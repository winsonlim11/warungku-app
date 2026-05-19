const fs = require('fs');
const path = require('path');

const replaceInFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\\${/g, '${').replace(/\\\`/g, '`');
  fs.writeFileSync(file, content);
};

const walk = (dir) => {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      replaceInFile(fullPath);
    }
  });
};

walk('./src');
console.log('Fixed escape characters in JSX');
