const fs = require('fs');

let content = fs.readFileSync('src/lib/data.ts', 'utf8');

// Replace dates
content = content.replace(/2024/g, '2026');
content = content.replace(/2025/g, '2026');

// Add photos to parents
const parts = content.split('export const parentsData = [');
if (parts.length > 1) {
    const subParts = parts[1].split('export const subjectsData = [');
    let parentsContent = subParts[0];
    
    // Replace inside parentsContent
    parentsContent = parentsContent.replace(/    name: "/g, '    photo: "https://images.pexels.com/photos/2888150/pexels-photo-2888150.jpeg?auto=compress&cs=tinysrgb&w=1200",\n    name: "');
    
    content = parts[0] + 'export const parentsData = [' + parentsContent + 'export const subjectsData = [' + subParts[1];
}

fs.writeFileSync('src/lib/data.ts', content);
console.log("Updated data.ts");
