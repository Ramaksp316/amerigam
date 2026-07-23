"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle, Circle, Plus, AlertTriangle, Clock, Activity, Award } from "lucide-react";
import { completeTask } from "./actions";
import DistractionModal from "./DistractionModal";
import CreateTaskModal from "./CreateTaskModal";

type Entry = {
  id: string;
  title: string;
  appContext: string | null;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  pointsReward: number;
  isCompletedToday: boolean;
};

export default function ProductivityDashboard({
  initialScore,
  initialEntries,
}: {
  initialScore: number;
  initialEntries: Entry[];
}) {
  const [score, setScore] = useState(initialScore);
  const [entries, setEntries] = useState(initialEntries);
  const [showDistractionModal, setShowDistractionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Setup audio and notification permissions
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/alarm.mp3"); // Ensure this file exists in public/ or fallback to a default beep
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Alarm Checker
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      
      const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const currentDay = dayNames[now.getDay()];

      entries.forEach(entry => {
        // Check if the task runs today
        if (entry.daysOfWeek.includes(currentDay)) {
          if (entry.startTime === currentTimeStr) {
            triggerAlarm(`Time to start: ${entry.title}`);
          }
          if (entry.endTime === currentTimeStr) {
            triggerAlarm(`Time is up for: ${entry.title}`);
          }
        }
      });
    };

    const interval = setInterval(checkAlarms, 60000); // Check every minute
    // Initial check on load
    checkAlarms();

    return () => clearInterval(interval);
  }, [entries]);

  const triggerAlarm = (message: string) => {
    // Play sound
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play blocked by browser interaction policy", e));
    }
    // Show notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Amerigam Productivity", { body: message });
    } else {
      alert(message);
    }
  };

  const handleCompleteTask = async (entry: Entry) => {
    if (entry.isCompletedToday) return;

    // Optimistic UI update
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, isCompletedToday: true } : e));
    setScore(prev => prev + entry.pointsReward);

    const res = await completeTask(entry.id);
    if (!res.success) {
      // Revert if failed
      setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, isCompletedToday: false } : e));
      setScore(prev => prev - entry.pointsReward);
      alert(res.message || "Failed to complete task");
    }
  };

  const handleDistractionLogged = (pointsLost: number) => {
    setScore(prev => prev - pointsLost);
    setShowDistractionModal(false);
  };

  const handleTaskCreated = (newEntry: Entry) => {
    setEntries(prev => [...prev, newEntry].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    setShowCreateModal(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column: Score & Actions */}
      <div className="md:col-span-1 space-y-6">
        {/* Score Card */}
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <Award className="w-12 h-12 text-yellow-400 mb-3" />
          <h2 className="text-xl text-gray-400 font-medium">Productivity Score</h2>
          <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-green-400 to-blue-500 mt-2">
            {score}
          </div>
          <p className="text-sm text-gray-500 mt-4">Keep completing tasks to earn points!</p>
        </div>

        {/* Action Buttons */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-blue-500/25 text-white"
        >
          <Plus size={20} /> Add Time Table Entry
        </button>

        <button
          onClick={() => setShowDistractionModal(true)}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 transition-all shadow-lg hover:shadow-red-500/25 text-white"
        >
          <AlertTriangle size={20} /> I Got Distracted
        </button>
      </div>

      {/* Right Column: Time Table */}
      <div className="md:col-span-2 glass-card p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <Clock className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Today's Schedule</h2>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Your schedule is empty.</p>
            <p className="text-sm">Add an entry to start earning points!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div 
                key={entry.id} 
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  entry.isCompletedToday 
                    ? "bg-green-900/20 border-green-500/30 opacity-70" 
                    : "bg-white/5 border-white/10 hover:border-blue-500/50 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleCompleteTask(entry)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    {entry.isCompletedToday ? (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    ) : (
                      <Circle className="w-8 h-8 text-gray-400 hover:text-blue-400" />
                    )}
                  </button>
                  <div>
                    <h3 className={`font-bold text-lg ${entry.isCompletedToday ? "line-through text-gray-400" : "text-white"}`}>
                      {entry.title}
                    </h3>
                    <div className="flex gap-3 text-sm mt-1 text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {entry.startTime} - {entry.endTime}
                      </span>
                      {entry.appContext && (
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-blue-300">
                          App: {entry.appContext}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-400">+{entry.pointsReward} pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDistractionModal && (
        <DistractionModal 
          onClose={() => setShowDistractionModal(false)} 
          onLogged={handleDistractionLogged} 
        />
      )}

      {showCreateModal && (
        <CreateTaskModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}
