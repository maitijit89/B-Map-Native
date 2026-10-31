import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const APP_DIR = path.join(SRC_DIR, 'app');

console.log('================================================================');
console.log('         B-MAP NATIVE COMPREHENSIVE BUG FINDER TEST SUITE       ');
console.log('================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
const defects = [];
const warnings = [];

function check(name, pass, details = '') {
  totalChecks++;
  if (pass) {
    passedChecks++;
    console.log(`  ✓ PASS: ${name}`);
  } else {
    defects.push({ name, details });
    console.log(`  ✗ FAIL: ${name}`);
    if (details) console.log(`    -> ${details}`);
  }
}

function warn(name, details = '') {
  warnings.push({ name, details });
  console.log(`  ! WARN: ${name}`);
  if (details) console.log(`    -> ${details}`);
}

// ----------------------------------------------------
// 1. Collect all files in src/
// ----------------------------------------------------
function getAllFiles(dir, exts = ['.ts', '.tsx', '.js', '.jsx']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, exts));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (exts.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const allSrcFiles = getAllFiles(SRC_DIR);
console.log(`[INFO] Loaded ${allSrcFiles.length} source files under src/.\n`);

// ----------------------------------------------------
// 2. Discover App Routes
// ----------------------------------------------------
console.log('--- TEST SUITE 1: Route Discovery & Screen Architecture ---');
const appFiles = getAllFiles(APP_DIR);
const validRoutes = new Set();

for (const file of appFiles) {
  const rel = path.relative(APP_DIR, file).replace(/\\/g, '/');
  const withoutExt = rel.replace(/\.(tsx|jsx|ts|js)$/, '');
  
  if (path.basename(file).startsWith('_layout') || path.basename(file).startsWith('+')) {
    continue;
  }

  const segments = withoutExt.split('/');
  const cleanSegments = segments.filter(s => !s.startsWith('(') || !s.endsWith(')'));
  
  let normalRoute = '/' + cleanSegments.join('/');
  if (normalRoute.endsWith('/index')) {
    normalRoute = normalRoute.slice(0, -6) || '/';
  }
  validRoutes.add(normalRoute);

  let rawRoute = '/' + segments.join('/');
  if (rawRoute.endsWith('/index')) {
    rawRoute = rawRoute.slice(0, -6) || '/';
  }
  validRoutes.add(rawRoute);
  validRoutes.add('/' + segments.join('/'));
}

check('Discovered registered routes', validRoutes.size > 0, `Discovered ${validRoutes.size} route variants`);

// ----------------------------------------------------
// 3. Verify Default Exports in src/app/
// ----------------------------------------------------
console.log('\n--- TEST SUITE 2: Screen Default Export Verification ---');
for (const file of appFiles) {
  const basename = path.basename(file);
  if (basename === '+html.tsx') continue;
  const content = fs.readFileSync(file, 'utf8');
  const hasDefaultExport = /export\s+default\s+(function|class|const|memo|[A-Za-z0-9_]+)/m.test(content) ||
                           /export\s*\{\s*[^}]*\bdefault\b[^}]*\}/m.test(content);
  
  check(`Default export in app/${path.relative(APP_DIR, file)}`, hasDefaultExport, `Missing "export default" component in ${file}`);
}

// ----------------------------------------------------
// 4. Verify Route Navigation Calls Across Codebase
// ----------------------------------------------------
console.log('\n--- TEST SUITE 3: Navigation Route Integrity & Dead Links ---');
const navRegex = /(?:router\.(?:push|replace|navigate)\(\s*['"`]([^'"`]+)['"`]|href\s*=\s*['"`]([^'"`]+)['"`])/g;

let routeCheckCount = 0;
for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = navRegex.exec(content)) !== null) {
    const target = match[1] || match[2];
    if (!target) continue;
    if (target.startsWith('http') || target.startsWith('tel:') || target.startsWith('mailto:') || target.startsWith('#')) {
      continue;
    }
    const targetBase = target.split('?')[0].split('#')[0];
    const isMatched = validRoutes.has(targetBase) || 
                      validRoutes.has(targetBase.replace(/\/$/, '')) ||
                      [...validRoutes].some(vr => {
                        const vrRegex = new RegExp('^' + vr.replace(/\[[^\]]+\]/g, '[^/]+') + '$');
                        return vrRegex.test(targetBase);
                      });
    
    routeCheckCount++;
    check(`Nav target "${targetBase}" in ${path.relative(SRC_DIR, file)}`, isMatched, `Route "${targetBase}" called in ${file} does not resolve to any screen in src/app/`);
  }
}
console.log(`[INFO] Verified ${routeCheckCount} navigation links across all screens.`);

// ----------------------------------------------------
// 5. Verify Local File Imports
// ----------------------------------------------------
console.log('\n--- TEST SUITE 4: Import Resolution & Broken Relative Dependencies ---');
const importRegex = /(?:import|export)\s+(?:[\w*\s{},]*\s+from\s+)?['"](\.[^'"]+)['"]/g;
const requireRegex = /require\(['"](\.[^'"]+)['"]\)/g;

let importCheckCount = 0;
let brokenImports = 0;
for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  
  const checkImport = (importPath) => {
    importCheckCount++;
    const resolvedDirect = path.resolve(dir, importPath);
    const candidates = [
      resolvedDirect,
      resolvedDirect + '.ts',
      resolvedDirect + '.tsx',
      resolvedDirect + '.js',
      resolvedDirect + '.jsx',
      resolvedDirect + '.json',
      path.join(resolvedDirect, 'index.ts'),
      path.join(resolvedDirect, 'index.tsx'),
      path.join(resolvedDirect, 'index.js'),
      path.join(resolvedDirect, 'index.json')
    ];
    
    const exists = candidates.some(c => fs.existsSync(c));
    if (!exists) {
      brokenImports++;
      check(`Import "${importPath}" in ${path.relative(SRC_DIR, file)}`, false, `Cannot resolve import "${importPath}" from ${file}`);
    }
  };

  let m;
  while ((m = importRegex.exec(content)) !== null) {
    checkImport(m[1]);
  }
  while ((m = requireRegex.exec(content)) !== null) {
    checkImport(m[1]);
  }
}
if (brokenImports === 0) {
  check(`All ${importCheckCount} relative imports resolve cleanly to files`, true);
}

// ----------------------------------------------------
// 6. Verify Asset References
// ----------------------------------------------------
console.log('\n--- TEST SUITE 5: Static Asset Reference Validation ---');
const assetRegex = /require\(['"](\.\.?\/[^'"]+\.(?:png|jpg|jpeg|gif|webp|svg|ttf|otf|mp3|wav|json))['"]\)/gi;

let assetCheckCount = 0;
let brokenAssets = 0;
for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  let m;
  while ((m = assetRegex.exec(content)) !== null) {
    assetCheckCount++;
    const assetPath = m[1];
    const fullAssetPath = path.resolve(dir, assetPath);
    const exists = fs.existsSync(fullAssetPath);
    if (!exists) {
      brokenAssets++;
      check(`Asset "${assetPath}" in ${path.relative(SRC_DIR, file)}`, false, `File not found: ${fullAssetPath}`);
    } else {
      check(`Asset "${assetPath}" referenced in ${path.relative(SRC_DIR, file)}`, true);
    }
  }
}

// ----------------------------------------------------
// 7. Check for Web HTML DOM leaks in Native Components
// ----------------------------------------------------
console.log('\n--- TEST SUITE 6: HTML DOM Elements in Native Screens ---');
const domTagRegex = /<(?:\/)?(?:div|span|h[1-6]|button|table|tbody|tr|td|input|ul|ol|li)(?:\s|>|\/)/;

let domLeaks = 0;
for (const file of allSrcFiles) {
  if (path.basename(file) === '+html.tsx') continue;
  const content = fs.readFileSync(file, 'utf8');
  if (domTagRegex.test(content)) {
    domLeaks++;
    check(`No HTML DOM elements in ${path.relative(SRC_DIR, file)}`, false, `Found web HTML element in native component`);
  }
}
if (domLeaks === 0) {
  check('Zero Web DOM tag leaks across native components', true);
}

// ----------------------------------------------------
// 8. Style Value Sanity (no 'px' strings in RN styles)
// ----------------------------------------------------
console.log('\n--- TEST SUITE 7: React Native Style Sanity ---');
const pxStyleRegex = /:\s*['"]\d+px['"]/g;

let pxLeaks = 0;
for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (pxStyleRegex.test(content)) {
    pxLeaks++;
    check(`No raw 'px' strings in ${path.relative(SRC_DIR, file)}`, false, `React Native style properties must be numbers or percentages, not 'px' strings`);
  }
}
if (pxLeaks === 0) {
  check('Zero invalid "px" style properties across all style sheets', true);
}

// ----------------------------------------------------
// 9. Code Hygiene & Leftover Debug Artifacts
// ----------------------------------------------------
console.log('\n--- TEST SUITE 8: Code Hygiene & Leftover Debug Artifacts ---');
let debuggersFound = 0;
for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (/\bdebugger\s*;/.test(content)) {
    debuggersFound++;
    check(`No debugger statement in ${path.relative(SRC_DIR, file)}`, false, `Found leftover debugger statement`);
  }
}
if (debuggersFound === 0) {
  check('No lingering debugger statements found', true);
}

// ----------------------------------------------------
// 10. Static Analysis: TypeScript & ESLint
// ----------------------------------------------------
console.log('\n--- TEST SUITE 9: TypeScript Type Check ---');
try {
  execSync('npx tsc --noEmit', { cwd: ROOT_DIR, stdio: 'pipe' });
  check('TypeScript compilation (tsc --noEmit)', true);
} catch (e) {
  check('TypeScript compilation (tsc --noEmit)', false, e.stdout?.toString() || e.message);
}

console.log('\n--- TEST SUITE 10: Expo ESLint Static Analysis ---');
try {
  execSync('npx expo lint', { cwd: ROOT_DIR, stdio: 'pipe' });
  check('Expo ESLint (expo lint)', true);
} catch (e) {
  check('Expo ESLint (expo lint)', false, e.stdout?.toString() || e.message);
}

// ----------------------------------------------------
// Summary
// ----------------------------------------------------
console.log('\n================================================================');
console.log(`TOTAL CHECKS: ${totalChecks}`);
console.log(`PASSED:       ${passedChecks}`);
console.log(`DEFECTS:      ${defects.length}`);
console.log(`WARNINGS:     ${warnings.length}`);
console.log('================================================================\n');

if (defects.length > 0) {
  console.log('Defects identified:');
  for (const d of defects) {
    console.log(`  - [DEFECT] ${d.name}: ${d.details}`);
  }
  process.exit(1);
} else {
  console.log('🎉 ALL COMPREHENSIVE BUG FINDER TESTS PASSED WITH 0 DEFECTS!\n');
  process.exit(0);
}
