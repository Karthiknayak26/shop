// scanCssErrors.js
const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, 'src'); // Change if your CSS files are elsewhere

function scanCssFile(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  lines.forEach((line, index) => {
    // Look for '/' that is not inside /* comment */ or url()
    const trimmed = line.trim();
    if (trimmed.includes('/') &&
      !trimmed.startsWith('/*') &&
      !trimmed.includes('url(') &&
      !trimmed.endsWith('*/')) {
      console.log(`Potential error in ${filePath} at line ${index + 1}: ${line.trim()}`);
    }
  });
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.css')) {
      scanCssFile(fullPath);
    }
  });
}

scanDir(projectDir);
console.log('CSS scan completed.');
