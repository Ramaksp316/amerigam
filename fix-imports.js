const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = [...walk('app/competitions'), ...walk('app/api/competitions')];
let changed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('lib/prisma')) {
    const updated = content.replace(/import\s+{\s*prisma\s*}\s+from\s+['"](?:\.\.\/)+lib\/prisma['"];?/, "import { prisma } from '@/lib/prisma';");
    if (content !== updated) {
      fs.writeFileSync(file, updated, 'utf8');
      changed++;
      console.log(`Updated ${file}`);
    }
  }
}
console.log(`Updated ${changed} files.`);
