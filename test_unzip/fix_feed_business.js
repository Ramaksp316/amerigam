const fs = require('fs');
const path = 'app/home/page.tsx';
let content = fs.readFileSync(path, 'utf-8');

const oldCode = `        if (post.author.personalProfile) {
          const up = post.author.personalProfile;
          let uSkills: string[] = [];
          let uInterests: string[] = [];
          let uHobbies: string[] = [];
          try { if (up.skills) uSkills = JSON.parse(up.skills); } catch(e){}
          try { if (up.interests) uInterests = JSON.parse(up.interests); } catch(e){}
          try { if (up.hobbies) uHobbies = JSON.parse(up.hobbies); } catch(e){}
  
          const authorText = [up.mainIdentity, ...uSkills, ...uInterests, ...uHobbies].join(' ').toLowerCase();
          userKeywords.forEach(kw => {
            if (authorText.includes(kw)) score += 2;
          });
        }`;

const newCode = `        let authorText = '';
        if (post.author.personalProfile) {
          const up = post.author.personalProfile;
          let uSkills: string[] = [];
          let uInterests: string[] = [];
          let uHobbies: string[] = [];
          try { if (up.skills) uSkills = JSON.parse(up.skills); } catch(e){}
          try { if (up.interests) uInterests = JSON.parse(up.interests); } catch(e){}
          try { if (up.hobbies) uHobbies = JSON.parse(up.hobbies); } catch(e){}
  
          authorText = [up.mainIdentity, ...uSkills, ...uInterests, ...uHobbies].join(' ').toLowerCase();
        } else if (post.author.businessProfile) {
          authorText = [post.author.businessProfile.industry, post.author.businessProfile.stage].join(' ').toLowerCase();
        } else if (post.author.organizationProfile) {
          authorText = [post.author.organizationProfile.orgType].join(' ').toLowerCase();
        }
        
        if (authorText) {
          userKeywords.forEach(kw => {
            if (authorText.includes(kw)) score += 2;
          });
        }`;

if(content.includes('if (post.author.personalProfile) {') && !content.includes('else if (post.author.businessProfile) {')) {
    content = content.replace(oldCode, newCode);
    
    // Also we need to include businessProfile in the prisma query for posts!
    content = content.replace("personalProfile: true,", "personalProfile: true, businessProfile: true, organizationProfile: true,");
    fs.writeFileSync(path, content);
    console.log("feed business fixed");
} else {
    console.log("feed business already fixed or not found");
}
