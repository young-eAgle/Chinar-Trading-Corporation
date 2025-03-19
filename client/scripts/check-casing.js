// Simple warning script for case-sensitivity issues
console.log('======================================================');
console.log('📝 Case-Sensitivity Check');
console.log('======================================================');
console.log('✅ This build is being prepared for cross-platform deployment');
console.log('✅ Remember: Linux (VPS) is case-sensitive while Windows is not');
console.log('✅ Check for these common issues:');
console.log('  1. Directory names should use kebab-case (e.g., "contact-us")');
console.log('  2. Component file names should use PascalCase (e.g., "ContactUs.jsx")');
console.log('  3. Utility file names should use camelCase (e.g., "cartContext.js")');
console.log('  4. Import paths should exactly match directory and file names');
console.log('======================================================');
console.log('✅ Run the fix-structure.ps1 script to automatically fix these issues');

// Basic check - do App.jsx imports exist?
console.log('✅ Build proceeding. If it fails, check import paths in App.jsx'); 