const { Client } = require('ssh2');
const HOST = '168.144.126.4';
const USERNAME = 'root';
const password = process.argv[2] || 'Ramaks316@@@Par';

const conn = new Client();
conn.on('ready', () => {
  const remoteCmd = `cd /root/Amerigam && node -e '
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findFirst();
  console.log("FIRST_USER_ID:", user ? user.id : "NONE");
  if (user) {
    const { execSync } = require("child_process");
    try {
      const res = execSync("curl -s -o /dev/null -w \\"%{http_code}\\" --cookie \\"userId=" + user.id + "\\" http://localhost:3000/ranking");
      console.log("HTTP_STATUS_CODE:", res.toString());
    } catch(err) {
      console.error("CURL_ERR:", err.message);
    }
  }
  process.exit(0);
}
main();
'`;
  conn.exec(remoteCmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end());
    stream.pipe(process.stdout);
    stream.stderr.pipe(process.stderr);
  });
}).connect({ host: HOST, port: 22, username: USERNAME, password, readyTimeout: 10000 });
