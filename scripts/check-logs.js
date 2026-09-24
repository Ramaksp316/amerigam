const { Client } = require('ssh2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const HOST = process.env.VPS_HOST || '168.144.126.4';
const USERNAME = process.env.VPS_USER || 'root';
const PASSWORD = process.argv[2] || 'Ramaks316@@@Par';

async function checkLogs() {
  const conn = new Client();
  conn.on('ready', () => {
    console.log('Connected to server. Fetching logs...');
    conn.exec('pm2 logs amerigam --lines 80 --nostream', (err, stream) => {
      if (err) throw err;
      stream.on('close', () => {
        conn.end();
      }).on('data', (data) => {
        process.stdout.write(data);
      }).stderr.on('data', (data) => {
        process.stderr.write(data);
      });
    });
  }).connect({
    host: HOST,
    port: 22,
    username: USERNAME,
    password: PASSWORD
  });
}

checkLogs();
