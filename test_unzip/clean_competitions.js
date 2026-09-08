const fs = require('fs');

let fileContent = fs.readFileSync('app/competitions/CompetitionsClient.tsx', 'utf-8');

// 1. Remove TopPeopleSection import completely
fileContent = fileContent.replace(/import TopPeopleSection from '\.\/components\/TopPeopleSection';\n?/g, '');

// 2. Change TabType
fileContent = fileContent.replace(/type TabType = 'Following' \| 'Suggested' \| 'Top Competitions';/g, "type TabType = 'Following' | 'Top Competitions';");

// 3. Change Tabs Array
fileContent = fileContent.replace(/\{\['Following', 'Suggested', 'Top Competitions'\]\.map\(tab => \(/g, "{['Following', 'Top Competitions'].map(tab => (");

// 4. Update Following Tab Empty State & View All
const followingHeaderRegex = /<div style=\{\{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' \}\}>\s*<h2 style=\{\{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#FFFFFF', letterSpacing: '-0\.3px' \}\}>From organizations you follow<\/h2>\s*<Link href="\/competitions\/following" style=\{\{ fontSize: '14px', color: '#3B82F6', fontWeight: 600, textDecoration: 'none' \}\}>\s*View all &gt;\s*<\/Link>\s*<\/div>/;

fileContent = fileContent.replace(followingHeaderRegex, `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#FFFFFF', letterSpacing: '-0.3px' }}>From organizations you follow</h2>
              {followingEvents.length > 0 && (
                <Link href="/competitions/following" style={{ fontSize: '14px', color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>
                  View all &gt;
                </Link>
              )}
            </div>`);

const followingEmptyStateRegex = /<div style=\{\{ color: '#A1A1AA', padding: '32px 0', textAlign: 'center', width: '100%', fontSize: '14px' \}\}>\s*Follow more Competition Organizations to see their events here\.\s*<\/div>/;

fileContent = fileContent.replace(followingEmptyStateRegex, `<div style={{ color: '#A1A1AA', padding: '12px 0 16px', textAlign: 'left', width: '100%', fontSize: '14px' }}>
                No competitions from followed organizations yet.
              </div>`);

// 5. Remove TopPeopleSection tags
fileContent = fileContent.replace(/<TopPeopleSection rankingData=\{rankingData\} \/>/g, '');

// 6. Delete Suggested Tab completely
const suggestedTabRegex = /\{\/\* SUGGESTED TAB \*\/\}\s*\{activeTab === 'Suggested' && \([\s\S]*?\{\/\* TOP COMPETITIONS TAB \*\/\}/;
fileContent = fileContent.replace(suggestedTabRegex, "{/* TOP COMPETITIONS TAB */}");

// Adjust margin for Suggested in Following tab
fileContent = fileContent.replace(/<div style=\{\{ marginTop: '32px' \}\}>\s*<div style=\{\{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' \}\}>\s*<h2 style=\{\{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#FFFFFF', letterSpacing: '-0\.3px' \}\}>Suggested competitions<\/h2>/,
`<div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#FFFFFF', letterSpacing: '-0.3px' }}>Suggested competitions</h2>`);

fs.writeFileSync('app/competitions/CompetitionsClient.tsx', fileContent);
console.log("Successfully cleaned up Competition discovery");
