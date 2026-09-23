import { NextRequest, NextResponse } from 'next/server';
import { isDevAuthenticatedFromRequest } from '@/lib/dev-auth';
import { Client } from 'ssh2';

export const dynamic = 'force-dynamic';

function sshExec(conn: Client, cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream.on('data', (d: Buffer) => { out += d.toString(); });
      stream.on('close', () => resolve(out));
      stream.stderr.on('data', () => {});
    });
  });
}

export async function GET(req: NextRequest) {
  if (!isDevAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return new Promise<NextResponse>((resolve) => {
    const conn = new Client();

    const timeout = setTimeout(() => {
      conn.end();
      resolve(NextResponse.json({
        error: 'SSH timeout',
        cpu: null, ram: null, disk: null, pm2: null,
      }, { status: 200 }));
    }, 10000);

    conn.on('ready', async () => {
      try {
        const [cpuRaw, ramRaw, diskRaw, pm2Raw] = await Promise.all([
          sshExec(conn, "top -bn1 | grep 'Cpu(s)' | awk '{print $2+$4}'"),
          sshExec(conn, "free -m | awk '/Mem:/ {printf \"%.1f %.1f\", $3, $2}'"),
          sshExec(conn, "df -h / | awk 'NR==2 {print $3, $4, $5}'"),
          sshExec(conn, 'pm2 jlist 2>/dev/null'),
        ]);

        const cpu = parseFloat(cpuRaw.trim()) || 0;
        const [ramUsed, ramTotal] = ramRaw.trim().split(' ').map(parseFloat);
        const [diskUsed, diskAvail, diskPct] = diskRaw.trim().split(' ');

        let pm2Processes = [];
        try {
          pm2Processes = JSON.parse(pm2Raw.trim()).map((p: any) => ({
            name: p.name,
            status: p.pm2_env?.status,
            pid: p.pid,
            uptime: p.pm2_env?.pm_uptime,
            restarts: p.pm2_env?.restart_time,
            cpu: p.monit?.cpu,
            memory: Math.round((p.monit?.memory || 0) / 1024 / 1024),
          }));
        } catch {}

        clearTimeout(timeout);
        conn.end();

        resolve(NextResponse.json({
          cpu: Math.round(cpu),
          ram: { used: ramUsed, total: ramTotal, pct: Math.round((ramUsed / ramTotal) * 100) },
          disk: { used: diskUsed, available: diskAvail, pct: diskPct },
          pm2: pm2Processes,
          timestamp: new Date().toISOString(),
        }));
      } catch (err) {
        clearTimeout(timeout);
        conn.end();
        resolve(NextResponse.json({ error: 'Failed to fetch health', cpu: null, ram: null, disk: null, pm2: null }));
      }
    }).on('error', (err) => {
      clearTimeout(timeout);
      resolve(NextResponse.json({ error: err.message, cpu: null, ram: null, disk: null, pm2: null }));
    }).connect({
      host: process.env.VPS_HOST || '168.144.126.4',
      port: 22,
      username: process.env.VPS_USER || 'root',
      password: process.env.VPS_PASSWORD,
      readyTimeout: 8000,
    });
  });
}
