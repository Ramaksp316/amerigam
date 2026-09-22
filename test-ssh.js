const { Client } = require('ssh2');

const passwords = [
  'Ramaks316@@@',
  'Ramaks316',
  'Ramaks316@',
  'root',
  'admin'
];

async function tryPassword(pass) {
  return new Promise((resolve) => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log(`SUCCESS with password: "${pass}"`);
      conn.exec('uptime && whoami && pwd', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          conn.end();
          resolve(true);
        }).on('data', (data) => {
          console.log('OUTPUT: ' + data.toString());
        });
      });
    }).on('error', (err) => {
      console.log(`Failed for "${pass}": ${err.message}`);
      resolve(false);
    }).connect({
      host: '168.144.126.4',
      port: 22,
      username: 'root',
      password: pass,
      readyTimeout: 7000
    });
  });
}

async function run() {
  for (const pass of passwords) {
    console.log(`Trying password: ${pass}...`);
    const success = await tryPassword(pass);
    if (success) {
      console.log(`Found working password: ${pass}`);
      break;
    }
  }
}

run();
