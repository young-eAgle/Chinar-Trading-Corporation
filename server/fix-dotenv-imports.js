/**
 * A script to fix all dotenv/config imports that might be causing environment issues
 * Run this script with: node fix-dotenv-imports.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to recursively traverse directories
async function findJsFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules
      if (entry.name !== 'node_modules') {
        files.push(...await findJsFiles(fullPath));
      }
    } else if (entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to fix dotenv/config imports in a file
function fixDotenvImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Check for dotenv/config imports
    if (content.includes('// import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times') || content.includes("// import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times")) {
      console.log(`Fixing file: ${filePath}`);
      
      // Replace the import with a comment
      content = content.replace(
        /import\s+["']dotenv\/config["'];?/g, 
        '// // import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times // Removed to prevent .env file from being loaded multiple times'
      );
      
      // Only write back if content changed
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

async function main() {
  console.log('Finding JavaScript files...');
  const jsFiles = await findJsFiles(__dirname);
  console.log(`Found ${jsFiles.length} JavaScript files.`);
  
  let fixedCount = 0;
  
  for (const file of jsFiles) {
    if (fixDotenvImports(file)) {
      fixedCount++;
    }
  }
  
  console.log(`Fixed ${fixedCount} files with dotenv/config imports.`);
}

main().catch(console.error); 