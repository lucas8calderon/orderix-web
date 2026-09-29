const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function loadEnvFile(file) {
  if (!fs.existsSync(file)) {
    return;
  }
  const text = fs.readFileSync(file, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key] !== undefined) {
      continue;
    }
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile(path.join(root, '.env.production.local'));
loadEnvFile(path.join(root, '.env.local'));
loadEnvFile(path.join(root, '.env.production'));
loadEnvFile(path.join(root, '.env'));

const url = (process.env.REACT_APP_API_BASE_URL || '').trim();

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!url) {
  fail('REACT_APP_API_BASE_URL ausente. npm run build não pode publicar o fallback localhost.');
}

let parsed;
try {
  parsed = new URL(url);
} catch (error) {
  fail('REACT_APP_API_BASE_URL inválida.');
}

if (parsed.protocol !== 'https:') {
  fail('REACT_APP_API_BASE_URL precisa ser HTTPS.');
}

const host = parsed.hostname.toLowerCase();
if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
  fail('REACT_APP_API_BASE_URL não pode apontar para localhost.');
}
