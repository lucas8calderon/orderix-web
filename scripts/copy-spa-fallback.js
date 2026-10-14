const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const indexPath = path.join(buildDir, 'index.html');
const fallbackPath = path.join(buildDir, '404.html');

if (!fs.existsSync(indexPath)) {
  console.error('build/index.html ausente. Rode o build antes do fallback da SPA.');
  process.exit(1);
}

fs.copyFileSync(indexPath, fallbackPath);
console.log('SPA fallback: build/404.html');
