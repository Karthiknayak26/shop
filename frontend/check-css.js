const fs = require('fs');
const path = require('path');

function scanCss(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanCss(fullPath);
    } else if (fullPath.endsWith('.css')) {
      const lines = fs.readFileSync(fullPath, 'utf-8').split('\n');
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (
          trimmed.startsWith('//') ||                 // JS-style comment
          /url\([^\)'"]/.test(trimmed) ||           // url() without quotes
          /[.#][^ ]*\/[^ ]*/.test(trimmed)          // class or id with /
        ) {
          console.log(`${fullPath}:${idx + 1}: ${trimmed}`);
        }
      });
    }
  });
}

// Scan your source folder
scanCss('./src');
