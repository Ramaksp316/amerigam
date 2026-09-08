const fs = require('fs');

// Fix communities page
let commPath = 'app/communities/page.tsx';
if (fs.existsSync(commPath)) {
    let content = fs.readFileSync(commPath, 'utf-8');
    
    // In currentTab === 'explore', we should only show PUBLIC ones or ones we are a member of
    content = content.replace(
        "displayCommunities = allCommunities;",
        "displayCommunities = allCommunities.filter(c => c.type !== 'FRIEND_GROUP' || c.members.length > 0);"
    );
    
    // Also in For You
    content = content.replace(
        "displayCommunities = allCommunities.slice(0, 15);",
        "displayCommunities = allCommunities.filter(c => c.type !== 'FRIEND_GROUP' || c.members.length > 0).slice(0, 15);"
    );
    
    fs.writeFileSync(commPath, content);
}

// Fix search page
let searchPath = 'app/search/page.tsx';
if (fs.existsSync(searchPath)) {
    let content = fs.readFileSync(searchPath, 'utf-8');
    // Ensure findMany for communities doesn't return private ones we aren't in
    if (!content.includes("type: 'PUBLIC'")) {
        content = content.replace(
            "const communities = await prisma.community.findMany({",
            "const communities = await prisma.community.findMany({\n    where: {\n      OR: [\n        { type: 'PUBLIC' },\n        { members: { some: { userId } } }\n      ]\n    },"
        );
    }
    fs.writeFileSync(searchPath, content);
}

console.log("fixed");
