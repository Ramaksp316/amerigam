const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('curl -s -i -H "Cookie: userId=fe70b00c-d4fe-4d99-be03-cccd97b9886b" http://localhost:3000/communities | head -n 45', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT:\n' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR:\n' + data);
    });
  });
}).connect({
  host: '168.144.126.4',
  port: 22,
  username: 'root',
  password: 'Ramaks316@@@Par'
});
