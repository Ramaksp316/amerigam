const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    let list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

let count = 0;
walk('app').forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    let nextContent = content.replace(/import\s*\{\s*prisma\s*\}\s*from\s*['"](\.\.\/)+lib\/prisma['"]/g, "import { prisma } from '@/lib/prisma'");
    if (content !== nextContent) {
        fs.writeFileSync(file, nextContent);
        count++;
        console.log('Fixed', file);
    }
});
console.log('Total fixed:', count);
