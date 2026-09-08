const fs = require('fs');

// 1. Fix TopPeopleSection
let topPeople = fs.readFileSync('app/competitions/components/TopPeopleSection.tsx', 'utf-8');
topPeople = topPeople.replace(
  /<div style=\{\{\s*display:\s*'flex',\s*justifyContent:\s*'space-between',\s*alignItems:\s*'center',\s*marginBottom:\s*'16px'\s*\}\}>\s*<h2 style=\{\{\s*fontSize:\s*'18px',\s*fontWeight:\s*700,\s*margin:\s*0,\s*color:\s*'#FFFFFF',\s*letterSpacing:\s*'-0\.3px'\s*\}\}>Top 10 people in your field<\/h2>\s*<Link href=\{`\/ranking\?geo=\$\{activeGeo\.toLowerCase\(\)\}`\} style=\{\{\s*fontSize:\s*'14px',\s*color:\s*'#3B82F6',\s*fontWeight:\s*600,\s*textDecoration:\s*'none'\s*\}\}>\s*View all &gt;\s*<\/Link>\s*<\/div>/g,
  `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#FFFFFF', letterSpacing: '-0.3px' }}>Top 10 people in your field</h2>
      </div>`
);
fs.writeFileSync('app/competitions/components/TopPeopleSection.tsx', topPeople);
console.log("Updated TopPeopleSection");

// 2. Fix CompetitionsClient
let compClient = fs.readFileSync('app/competitions/CompetitionsClient.tsx', 'utf-8');
// Remove Create button
compClient = compClient.replace(
  /\{currentUser\?\.accountType === 'ORGANIZATION' && \(\s*<Link href="\/create\?type=competition" style=\{\{\s*fontSize:\s*'14px',\s*fontWeight:\s*600,\s*color:\s*'#2563EB',\s*textDecoration:\s*'none'\s*\}\}>\s*Create\s*<\/Link>\s*\)\}/g,
  ''
);

// Add suggested competitions to following tab
const followingTabRegex = /\{followingEvents\.length > 0 \? \([\s\S]*?Follow more Competition Organizations to see their events here\.\s*<\/div>\s*\)\}/;

const suggestedToAdd = `
            {/* Added Suggested into Following per C3/C4 */}
            <div style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#FFFFFF', letterSpacing: '-0.3px' }}>Suggested competitions</h2>
                <Link href="/competitions/suggested" style={{ fontSize: '14px', color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>
                  View all &gt;
                </Link>
              </div>
              <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', msOverflowStyle: 'none', scrollbarWidth: 'none', width: '100%' }}>
                {suggestedEvents.slice(0, 5).map(event => (
                  <div key={event.id} style={{ flexShrink: 0 }}>
                    <CompetitionCard event={event} layout="vertical-split" isRegistered={registeredEventIds.includes(event.id)} />
                  </div>
                ))}
              </div>
            </div>`;

if (!compClient.includes("Added Suggested into Following per C3/C4")) {
  compClient = compClient.replace(followingTabRegex, match => match + suggestedToAdd);
}
fs.writeFileSync('app/competitions/CompetitionsClient.tsx', compClient);
console.log("Updated CompetitionsClient");

// 3. Fix Create page header
let createPage = fs.readFileSync('app/create/page.tsx', 'utf-8');
const oldHeaderRegex = /<div style=\{\{ textAlign: 'center', marginBottom: 'var\(--space-8\)' \}\}>\s*<h1 className="heading-jakaas" style=\{\{ fontSize: '2\.5rem' \}\}>Host Competition<\/h1>\s*<p style=\{\{ color: 'var\(--text-secondary\)', fontSize: 'var\(--text-lg\)' \}\}>Organize an event for others to participate in\.<\/p>\s*<\/div>/g;
createPage = createPage.replace(
  oldHeaderRegex,
  `<div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Host Competition</h1>
             </div>`
);
fs.writeFileSync('app/create/page.tsx', createPage);
console.log("Updated create page header");
