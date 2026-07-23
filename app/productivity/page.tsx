import ProductivityDashboard from "./ProductivityDashboard";
import { getProductivityScore, getTimeTableEntries } from "./actions";

export default async function ProductivityPage() {
  const score = await getProductivityScore();
  const entries = await getTimeTableEntries();

  // Convert entries so they can be passed to client component easily
  const plainEntries = entries.map(entry => ({
    id: entry.id,
    title: entry.title,
    appContext: entry.appContext,
    startTime: entry.startTime,
    endTime: entry.endTime,
    daysOfWeek: JSON.parse(entry.daysOfWeek),
    pointsReward: entry.pointsReward,
    isCompletedToday: entry.taskLogs && entry.taskLogs.length > 0
  }));

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            Productivity Hub
          </h1>
          <p className="text-gray-400">Manage your time, track distractions, and earn points.</p>
        </header>

        <ProductivityDashboard initialScore={score} initialEntries={plainEntries} />
      </div>
    </main>
  );
}
