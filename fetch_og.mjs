import https from 'https';

https.get('https://amerigam-wk8l.vercel.app/api/og?postId=f0e01331-06db-41ff-938f-7d8cc09af644', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Data length:', data.length));
}).on('error', (e) => {
  console.error(e);
});
