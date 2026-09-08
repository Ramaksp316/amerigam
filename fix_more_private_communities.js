const fs = require('fs');

// Fix HomeCommunities
let homePath = 'app/components/HomeCommunities.tsx';
if (fs.existsSync(homePath)) {
    let content = fs.readFileSync(homePath, 'utf-8');
    if (!content.includes("type !== 'FRIEND_GROUP'")) {
        content = content.replace(
            "const displayCommunities = allCommunities.slice(0, 5);",
            "const displayCommunities = allCommunities.filter(c => c.type !== 'FRIEND_GROUP' || c.members.length > 0).slice(0, 5);"
        );
        fs.writeFileSync(homePath, content);
    }
}

// Fix RightSidebar
let rightPath = 'app/components/RightSidebar.tsx';
if (fs.existsSync(rightPath)) {
    let content = fs.readFileSync(rightPath, 'utf-8');
    if (!content.includes("OR: [{ type: 'PUBLIC' }")) {
        content = content.replace(
            "const communities = await prisma.community.findMany({",
            "const communities = await prisma.community.findMany({\n    where: {\n      OR: [\n        { type: 'PUBLIC' },\n        { members: { some: { userId } } }\n      ]\n    },"
        );
        fs.writeFileSync(rightPath, content);
    }
}

console.log("fixed more");
