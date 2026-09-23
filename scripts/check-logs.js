const { Client } = require('ssh2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const HOST = process.env.VPS_HOST || '168.144.126.4';
const USERNAME = process.env.VPS_USER || 'root';
const password = process.argv[2] || process.env.VPS_PASSWORD || 'Ramaks316@@@Par';

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected! Fetching logs...');
  conn.exec('pm2 logs amerigam --lines 60 --nostream', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      conn.end();
    }).on('data', (d) => {
      process.stdout.write(d.toString());
    }).stderr.on('data', (d) => {
      process.stderr.write(d.toString());
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err.message);
}).connect({
  host: HOST,
  port: 22,
  username: USERNAME,
  password: password,
  readyTimeout: 10000
});
