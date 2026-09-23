import { NextRequest, NextResponse } from 'next/server';
import { isDevAuthenticatedFromRequest } from '@/lib/dev-auth';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isDevAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. RAM Calculation
    const totalMem = Math.round(os.totalmem() / (1024 * 1024));
    const freeMem = Math.round(os.freemem() / (1024 * 1024));
    const usedMem = totalMem - freeMem;
    const memPct = totalMem > 0 ? Math.round((usedMem / totalMem) * 100) : 0;

    // 2. CPU Calculation
    let cpu = 0;
    try {
      if (process.platform === 'linux') {
        const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2+$4}'", { timeout: 3000 });
        cpu = Math.round(parseFloat(stdout.trim()) || 0);
      } else {
        const load = os.loadavg()[0] || 0;
        const cpus = os.cpus().length || 1;
        cpu = Math.min(100, Math.round((load / cpus) * 100));
      }
    } catch {
      const load = os.loadavg()[0] || 0;
      const cpus = os.cpus().length || 1;
      cpu = Math.min(100, Math.round((load / cpus) * 100));
    }

    // 3. Disk Calculation
    let disk = { used: 'N/A', available: 'N/A', pct: '0%' };
    try {
      if (process.platform === 'linux') {
        const { stdout } = await execAsync("df -h / | awk 'NR==2 {print $3, $4, $5}'", { timeout: 3000 });
        const parts = stdout.trim().split(/\s+/);
        if (parts.length >= 3) {
          disk = { used: parts[0], available: parts[1], pct: parts[2] };
        }
      }
    } catch {}

    // 4. PM2 Status
    let pm2Processes: any[] = [];
    try {
      const { stdout } = await execAsync('pm2 jlist', { timeout: 4000 });
      pm2Processes = JSON.parse(stdout.trim()).map((p: any) => ({
        name: p.name,
        status: p.pm2_env?.status,
        pid: p.pid,
        uptime: p.pm2_env?.pm_uptime,
        restarts: p.pm2_env?.restart_time,
        cpu: p.monit?.cpu,
        memory: Math.round((p.monit?.memory || 0) / (1024 * 1024)),
      }));
    } catch {}

    return NextResponse.json({
      cpu,
      ram: {
        used: usedMem,
        total: totalMem,
        pct: memPct,
      },
      disk,
      pm2: pm2Processes,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err?.message || 'Failed to fetch health',
      cpu: null,
      ram: null,
      disk: null,
      pm2: null,
    });
  }
}
