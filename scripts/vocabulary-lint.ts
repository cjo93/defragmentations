import fs from 'fs';
import path from 'path';

const BANNED_WORDS = [
  'vibes',
  'chakra',
  'manifest',
  'soul',
  'spirit',
  'energy',
  'aura',
  'quantum',
  'alignment',
  'healer'
];

const SCAN_DIR = './';
const EXTENSIONS = ['.ts', '.tsx'];

let foundViolations = false;

function scanDirectory(dir: string) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        scanDirectory(fullPath);
      }
    } else {
      if (EXTENSIONS.includes(path.extname(file))) {
        checkFile(fullPath);
      }
    }
  });
}

function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8').toLowerCase();
  
  BANNED_WORDS.forEach(word => {
    if (content.includes(word)) {
      // Allow the script itself to contain the words
      if (filePath.includes('vocabulary-lint.ts')) return;
      
      console.error(`[TONE POLICE] Violation detected in ${filePath}: Found banned word "${word}"`);
      foundViolations = true;
    }
  });
}

console.log('Scanning for vocabulary drift...');
scanDirectory(SCAN_DIR);

if (foundViolations) {
  console.error('[FAIL] Drift detected. Build aborted. Please use mechanical language.');
  // Fix: Cast process to any to resolve TS error about exit method not existing on type Process
  (process as any).exit(1);
} else {
  console.log('[PASS] Vocabulary clean. System grounded.');
  // Fix: Cast process to any to resolve TS error about exit method not existing on type Process
  (process as any).exit(0);
}
