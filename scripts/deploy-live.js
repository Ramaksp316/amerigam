const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const HOST = process.env.VPS_HOST || '168.144.126.4';
const USERNAME = process.env.VPS_USER || 'root';
const SSH_KEY_PATH = path.join(process.env.USERPROFILE || 'C:\\Users\\Admin', '.ssh', 'id_rsa');
const SSH_PUB_PATH = path.join(process.env.USERPROFILE || 'C:\\Users\\Admin', '.ssh', 'id_rsa.pub');

const inputPassword = process.argv[2] || process.env.VPS_PASSWORD || null;


async function executeCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    console.log(`\n> [SERVER EXEC] ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', (code, signal) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          console.error(`Command failed with code ${code}: ${stderr || stdout}`);
          reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
        }
      }).on('data', (data) => {
        const text = data.toString();
        stdout += text;
        process.stdout.write(text);
      }).stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        process.stderr.write(text);
      });
    });
  });
}

async function tryConnect(authConfig) {
  return new Promise((resolve) => {
    const conn = new Client();
    conn.on('ready', () => {
      resolve({ success: true, conn });
    }).on('error', (err) => {
      resolve({ success: false, error: err });
    }).connect({
      host: HOST,
      port: 22,
      username: USERNAME,
      readyTimeout: 10000,
      ...authConfig
    });
  });
}

async function runDeploy() {
  const { execSync } = require('child_process');
  console.log('====================================================');
  console.log('📦 Step 0: Syncing local changes to GitHub...');
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (status) {
      console.log('Staging changes...');
      execSync('git add -A', { stdio: 'inherit' });
      const commitMsg = process.argv[3] || 'feat: update developer mission control and server health';
      console.log(`Committing: ${commitMsg}`);
      execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
    }
    console.log('Pushing to GitHub origin main...');
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ Pushed to GitHub successfully!');
  } catch (err) {
    console.warn('⚠️ Git push note:', err.message);
  }

  console.log('====================================================');
  console.log(`Connecting to live server: ${USERNAME}@${HOST}...`);
  console.log('====================================================');

  let conn = null;

  // 1. Try connecting with private key first
  if (fs.existsSync(SSH_KEY_PATH)) {
    try {
      const privateKey = fs.readFileSync(SSH_KEY_PATH);
      console.log('Attempting authentication with local SSH key...');
      const keyResult = await tryConnect({ privateKey });
      if (keyResult.success) {
        console.log('✅ Authenticated successfully with SSH Key!');
        conn = keyResult.conn;
      }
    } catch (e) {
      console.log('SSH key authentication attempt failed:', e.message);
    }
  }

  // 2. If SSH key failed, try with provided password
  if (!conn) {
    if (!inputPassword) {
      console.error('\n❌ No password provided and SSH key not authorized yet.');
      console.error('Usage: node scripts/deploy-live.js <VPS_ROOT_PASSWORD>');
      process.exit(1);
    }

    console.log('Attempting authentication with provided root password...');
    const passResult = await tryConnect({ password: inputPassword });
    if (passResult.success) {
      console.log('✅ Authenticated successfully with Password!');
      conn = passResult.conn;

      // Automatically install SSH public key for passwordless future deploys!
      if (fs.existsSync(SSH_PUB_PATH)) {
        try {
          const pubKey = fs.readFileSync(SSH_PUB_PATH, 'utf8').trim();
          console.log('\n🔑 Setting up permanent passwordless SSH key on server...');
          const setupKeyCmd = `mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo "${pubKey}" >> ~/.ssh/authorized_keys && sort -u ~/.ssh/authorized_keys -o ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys`;
          await executeCommand(conn, setupKeyCmd);
          console.log('✅ SSH key registered in /root/.ssh/authorized_keys! Future deploys will be 100% passwordless.');
        } catch (err) {
          console.warn('Warning: Could not setup SSH key automatically:', err.message);
        }
      }
    } else {
      console.error(`❌ Authentication failed: ${passResult.error.message}`);
      process.exit(1);
    }
  }

  try {
    // 3. Inspect server environment and find project directory
    console.log('\n🔍 Discovering project directory & PM2 processes on server...');
    const pm2List = await executeCommand(conn, 'pm2 list || true');
    
    // Check known locations: /root/Amerigam, /var/www/amerigam, /root/amerigam
    const dirCheck = await executeCommand(conn, 'if [ -d "/root/Amerigam" ]; then echo "/root/Amerigam"; elif [ -d "/var/www/amerigam" ]; then echo "/var/www/amerigam"; elif [ -d "/root/amerigam" ]; then echo "/root/amerigam"; else echo "UNKNOWN"; fi');
    const projectDir = dirCheck.trim();
    console.log(`\n📁 Target project directory found: ${projectDir}`);

    if (projectDir === 'UNKNOWN') {
      throw new Error('Project directory not found in /root/Amerigam or /var/www/amerigam!');
    }

    // 4. Update the codebase
    console.log(`\n🚀 Updating codebase in ${projectDir}...`);
    // Check if git remote is configured in projectDir
    const gitCheck = await executeCommand(conn, `cd "${projectDir}" && git status || echo "NO_GIT"`);
    
    if (gitCheck.includes('NO_GIT') || gitCheck.includes('fatal: not a git repository')) {
      console.log('Repository is not a git clone. Pulling via git into projectDir...');
      await executeCommand(conn, `cd "${projectDir}" && git init && git remote add origin https://github.com/Ramaksp316/amerigam.git || git remote set-url origin https://github.com/Ramaksp316/amerigam.git`);
    }

    // Pull latest code from GitHub main
    await executeCommand(conn, `cd "${projectDir}" && git fetch origin main && git reset --hard origin/main`);

    // Ensure VPS .env contains DEV_BOARD_PIN and DEV_BOARD_SECRET
    console.log('\n🔐 Syncing dev-board environment variables on server...');
    await executeCommand(conn, `cd "${projectDir}" && (grep -q "DEV_BOARD_PIN" .env 2>/dev/null || printf '\\nDEV_BOARD_PIN="Amerigam316@@@RK"\\nDEV_BOARD_SECRET="amg_dev_2026_s3cr3t_k3y"\\n' >> .env)`);

    // Run prisma generate on server
    console.log('\n📦 Generating Prisma Client on server...');
    await executeCommand(conn, `cd "${projectDir}" && npx prisma generate`);

    // Ensure uploads directories exist with proper write permissions for Next.js & Nginx
    console.log('\n📁 Ensuring uploads directories and permissions on server...');
    await executeCommand(conn, `cd "${projectDir}" && mkdir -p public/uploads/{posts,videos,avatars,events,general,banners,qrs} && chmod -R 777 public/uploads`);

    // 5. Build Next.js application
    console.log('\n🔨 Building Next.js application on production server...');
    await executeCommand(conn, `cd "${projectDir}" && npm run build`);

    // 6. Restart PM2 process
    console.log('\n🔄 Restarting PM2 process...');
    await executeCommand(conn, `pm2 restart amerigam || pm2 restart all`);

    // 7. Verify HTTP response
    console.log('\n🌐 Verifying live site response...');
    await executeCommand(conn, `curl -I -s -o /dev/null -w "%{http_code}" http://localhost:3000 || curl -I -s -o /dev/null -w "%{http_code}" http://localhost:3001 || true`);

    console.log('\n====================================================');
    console.log('🎉 DEPLOYMENT COMPLETE! amerigam.com is now live!');
    console.log('====================================================');
  } catch (err) {
    console.error(`\n❌ Deployment failed: ${err.message}`);
  } finally {
    conn.end();
  }
}

runDeploy().catch((err) => {
  console.error('Fatal deployment error:', err);
  process.exit(1);
});
