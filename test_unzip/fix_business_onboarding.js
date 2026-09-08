const fs = require('fs');
const path = 'app/onboarding/BusinessOnboarding.tsx';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace("Industry & Stage", "Category & Stage");
content = content.replace("<label style={{ fontSize: '13px', color: '#A1A1AA', marginBottom: '8px', display: 'block' }}>Industry</label>", "<label style={{ fontSize: '13px', color: '#A1A1AA', marginBottom: '8px', display: 'block' }}>Category / Industry</label>");
content = content.replace("const INDUSTRIES = ['Tech & AI', 'Retail', 'Healthcare', 'Finance', 'Education', 'Media', 'Real Estate', 'Manufacturing', 'Logistics', 'Hospitality', 'Creative Agency', 'Other'];", "const INDUSTRIES = ['Technology', 'AI / ML', 'Retail', 'Healthcare', 'Finance', 'Education', 'Media', 'Real Estate', 'Manufacturing', 'Logistics', 'Hospitality', 'Creative Agency', 'Business', 'Other'];");

fs.writeFileSync(path, content);
console.log("business onboarding fixed");
