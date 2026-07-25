const sharp = require('sharp');

async function processIcon() {
  const input = 'public/logo.png';
  const metadata = await sharp(input).metadata();
  
  // zoom by 1.18 (so the bounding box we extract is 1 / 1.18 = ~0.847 of original size)
  const extractSize = Math.floor(metadata.width / 1.18);
  const offset = Math.floor((metadata.width - extractSize) / 2);
  
  const extracted = sharp(input).extract({
    left: offset,
    top: offset,
    width: extractSize,
    height: extractSize
  });

  await extracted.clone().resize(192, 192).toFile('public/icon-192.png');
  await extracted.clone().resize(512, 512).toFile('public/icon-512.png');
  await extracted.clone().resize(180, 180).toFile('public/apple-icon.png');
  console.log('Icons generated successfully');
}

processIcon().catch(console.error);
