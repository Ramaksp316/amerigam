"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createTimeTableEntry } from "./actions";

export default function CreateTaskModal({ 
  onClose,
  onCreated
}: { 
  onClose: () => void;
  onCreated: (entry: any) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [appContext, setAppContext] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  // Default to today for MVP
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const currentDay = dayNames[new Date().getDay()];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const entry = await createTimeTableEntry({
        title,
        appContext: appContext || undefined,
        startTime,
        endTime,
        daysOfWeek: [currentDay], // Just running today
        pointsReward: 10
      });

      // Format for the client dashboard
      onCreated({
        id: entry.id,
        title: entry.title,
        appContext: entry.appContext,
        startTime: entry.startTime,
        endTime: entry.endTime,
        daysOfWeek: JSON.parse(entry.daysOfWeek),
        pointsReward: entry.pointsReward,
        isCompletedToday: false
      });
    } catch (err) {
      alert("Failed to create task");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Add Time Table Entry</h2>
          <p className="text-gray-400 text-sm">Schedule a block of time to focus.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Task Title</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Study Physics, 30min Reels"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">App Context (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Instagram, VS Code"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              value={appContext}
              onChange={e => setAppContext(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Start Time</label>
              <input 
                required
                type="time" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">End Time</label>
              <input 
                required
                type="time" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl font-bold flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg text-white disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add to Schedule"}
          </button>
        </form>
      </div>
    </div>
  );
}
