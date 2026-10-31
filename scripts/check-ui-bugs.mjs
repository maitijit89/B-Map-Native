import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

console.log('================================================================');
console.log('                 B-MAP NATIVE UI BUG FINDER                     ');
console.log('================================================================\n');

function getAllFiles(dir, exts = ['.tsx', '.jsx']) {
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

const files = getAllFiles(SRC_DIR);
console.log(`[INFO] Auditing ${files.length} UI components & screens...\n`);

const uiBugs = [];

function flagBug(category, file, line, details, fix) {
  uiBugs.push({ category, file: path.relative(SRC_DIR, file), line, details, fix });
}

// ----------------------------------------------------
// 1. Missing keyboardShouldPersistTaps="handled" on scrollable forms
// ----------------------------------------------------
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('<ScrollView') && (content.includes('<SearchBar') || content.includes('<Input') || content.includes('onChangeText'))) {
    if (!content.includes('keyboardShouldPersistTaps')) {
      const line = content.split('\n').findIndex(l => l.includes('<ScrollView')) + 1;
      flagBug(
        'KEYBOARD_TAP_DELAY',
        file,
        line,
        'ScrollView contains editable inputs/search bars but is missing keyboardShouldPersistTaps="handled". Tapping items while the software keyboard is open drops the keyboard without triggering onPress.',
        'Add keyboardShouldPersistTaps="handled" to the ScrollView.'
      );
    }
  }
}

// ----------------------------------------------------
// 2. Hardcoded Text Colors (Invisible in Dark/Light themes)
// ----------------------------------------------------
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    // Catch hardcoded dark text color on potentially dynamic surfaces
    // e.g. color: '#000', color: '#111', color: '#222', color: '#333'
    if (/(?:^|\s)color:\s*['"](?:#000000|#000|#111111|#111|#222222|#222|#333333|#333)['"]/i.test(l)) {
      // Check if it's inside a button with white background or constant background
      const context = lines.slice(Math.max(0, i - 5), Math.min(lines.length, i + 5)).join('\n');
      if (!context.includes('#fff') && !context.includes('#FFF') && !context.includes('white') && !context.includes('colors.surfaceContainerLowest')) {
        flagBug(
          'THEME_CONTRAST',
          file,
          i + 1,
          `Hardcoded dark text color (${l.trim()}) may become unreadable/invisible on dark theme surfaces.`,
          'Replace hardcoded color with theme tokens (e.g. colors.onSurface or colors.onSurfaceVariant).'
        );
      }
    }
  });
}

// ----------------------------------------------------
// 3. Touch Target Slop (< 36x36 dp touch target without hitSlop)
// ----------------------------------------------------
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    if (/<TouchableOpacity|<Pressable/.test(l)) {
      const block = lines.slice(i, Math.min(lines.length, i + 6)).join('\n');
      // If width/height is <= 32 and no hitSlop
      if (/(?:width|size):\s*(?:[12][0-9]|3[0-2])\b/.test(block) && !block.includes('hitSlop')) {
        flagBug(
          'TOUCH_TARGET_SIZE',
          file,
          i + 1,
          'Interactive touch target has dimension <= 32dp without hitSlop. Mobile touch targets should be at least 44x44dp (WCAG 2.5.5).',
          'Add hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} or increase minimum padding.'
        );
      }
    }
  });
}

// ----------------------------------------------------
// 4. Missing flexShrink: 1 in horizontal rows with Text
// ----------------------------------------------------
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  // Check for rows where Text has numberOfLines={1} but no flex or flexShrink
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('numberOfLines={1}') || l.includes('numberOfLines={2}')) {
      const prev = lines[i - 1] || '';
      const next = lines[i + 1] || '';
      const combo = prev + l + next;
      // If style has no flex or flexShrink and inside flex row
      if (combo.includes('flexDirection') && !combo.includes('flex:') && !combo.includes('flexShrink')) {
        flagBug(
          'TEXT_CLIPPING',
          file,
          i + 1,
          'Truncated text in flex row without flex: 1 or flexShrink: 1 can cause layout overflow or push sibling icons off-screen.',
          'Add flex: 1 or flexShrink: 1 to the Text style.'
        );
      }
    }
  });
}

// ----------------------------------------------------
// Print Results
// ----------------------------------------------------
console.log(`TOTAL POTENTIAL UI DEFECTS FOUND: ${uiBugs.length}\n`);

uiBugs.forEach((bug, idx) => {
  console.log(`[BUG #${idx + 1}] [${bug.category}] in ${bug.file}:${bug.line}`);
  console.log(`  Issue: ${bug.details}`);
  console.log(`  Fix:   ${bug.fix}\n`);
});

