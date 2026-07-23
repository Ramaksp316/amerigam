"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle, Circle, Plus, AlertTriangle, Clock, Activity, Award, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
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
  status: "PENDING" | "COMPLETED" | "MISSED";
};

export default function ProductivityDashboard({
  initialScore,
  initialEntries,
  currentDateStr,
}: {
  initialScore: number;
  initialEntries: Entry[];
  currentDateStr: string;
}) {
  const router = useRouter();
  const [score, setScore] = useState(initialScore);
  const [entries, setEntries] = useState(initialEntries);
  const [showDistractionModal, setShowDistractionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isToday = new Date().toISOString().split('T')[0] === currentDateStr;

  useEffect(() => {
    // Update local state when server props change (e.g. date change)
    setEntries(initialEntries);
    setScore(initialScore);
  }, [initialEntries, initialScore, currentDateStr]);

  // Setup audio and notification permissions
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/alarm.mp3");
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Time ticker & Alarm Checker
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;
      setCurrentTimeStr(timeStr);
      
      const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const currentDay = dayNames[now.getDay()];

      if (isToday) {
        entries.forEach(entry => {
          if (entry.daysOfWeek.includes(currentDay)) {
            if (entry.startTime === timeStr) {
              triggerAlarm(`Time to start: ${entry.title}`);
            }
            if (entry.endTime === timeStr) {
              triggerAlarm(`Time is up for: ${entry.title}`);
            }
          }
        });
      }
    };

    const interval = setInterval(checkAlarms, 60000); 
    checkAlarms();
    return () => clearInterval(interval);
  }, [entries, isToday]);

  const triggerAlarm = (message: string) => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Amerigam Productivity", { body: message });
    }
  };

  const handleCompleteTask = async (entry: Entry) => {
    if (entry.status !== "PENDING") return;
    
    // Check for early completion
    if (isToday && currentTimeStr < entry.startTime) {
      alert("You cannot complete a task before it starts!");
      return;
    }
    if (!isToday && new Date(currentDateStr) > new Date()) {
      alert("You cannot complete future tasks!");
      return;
    }

    // Optimistic UI update
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: "COMPLETED" } : e));
    setScore(prev => prev + entry.pointsReward);

    const res = await completeTask(entry.id, currentDateStr);
    if (!res.success) {
      setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: "PENDING" } : e));
      setScore(prev => prev - entry.pointsReward);
      alert(res.message || "Failed to complete task");
    }
  };

  const handleDistractionLogged = (pointsLost: number) => {
    setScore(prev => prev - pointsLost);
    setShowDistractionModal(false);
  };

  const changeDate = (daysToAdd: number) => {
    const d = new Date(currentDateStr);
    d.setDate(d.getDate() + daysToAdd);
    const newDateStr = d.toISOString().split('T')[0];
    router.push(`/productivity?date=${newDateStr}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column: Score & Actions */}
      <div className="md:col-span-1 space-y-6">
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center relative">
          <Award className="w-12 h-12 text-yellow-400 mb-3" />
          <h2 className="text-xl text-gray-400 font-medium">Productivity Score</h2>
          <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-green-400 to-blue-500 mt-2">
            {score}
          </div>
          <p className="text-sm text-gray-500 mt-4">Keep completing tasks to earn points!</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg text-white"
        >
          <Plus size={20} /> Add Time Table Entry
        </button>

        <button
          onClick={() => setShowDistractionModal(true)}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 transition-all shadow-lg text-white"
        >
          <AlertTriangle size={20} /> I Got Distracted
        </button>
      </div>

      {/* Right Column: Time Table */}
      <div className="md:col-span-2 glass-card p-6">
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">Time Table</h2>
          </div>
          <div className="flex items-center gap-4 bg-white/5 rounded-full px-3 py-1 border border-white/10">
            <button onClick={() => changeDate(-1)} className="hover:text-blue-400 p-1"><ChevronLeft size={20}/></button>
            <span className="font-medium text-sm w-24 text-center">
              {isToday ? "Today" : currentDateStr}
            </span>
            <button onClick={() => changeDate(1)} className="hover:text-blue-400 p-1"><ChevronRight size={20}/></button>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Your schedule is empty for this day.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.filter(entry => {
              const d = new Date(currentDateStr);
              const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
              return entry.daysOfWeek.includes(dayNames[d.getDay()]);
            }).map((entry) => {
              const isLocked = isToday && currentTimeStr < entry.startTime;
              const isMissed = entry.status === "MISSED";
              const isCompleted = entry.status === "COMPLETED";

              return (
                <div 
                  key={entry.id} 
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isCompleted ? "bg-green-900/20 border-green-500/30 opacity-70" 
                    : isMissed ? "bg-red-900/20 border-red-500/30 opacity-70"
                    : isLocked ? "bg-white/5 border-white/5 opacity-50"
                    : "bg-white/5 border-white/10 hover:border-blue-500/50 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleCompleteTask(entry)}
                      disabled={isLocked || isMissed || isCompleted}
                      className="focus:outline-none transition-transform hover:scale-110 disabled:hover:scale-100"
                    >
                      {isCompleted ? <CheckCircle className="w-8 h-8 text-green-400" /> :
                       isMissed ? <XCircle className="w-8 h-8 text-red-400" /> :
                       <Circle className={`w-8 h-8 ${isLocked ? "text-gray-600" : "text-gray-400 hover:text-blue-400"}`} />
                      }
                    </button>
                    <div>
                      <h3 className={`font-bold text-lg ${isCompleted || isMissed ? "line-through text-gray-400" : "text-white"}`}>
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
                        {isLocked && <span className="text-xs text-orange-400">Locked (Starts later)</span>}
                        {isMissed && <span className="text-xs text-red-400 font-bold">Missed! (-5 pts)</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {!isMissed && (
                      <span className={`font-bold ${isLocked ? 'text-gray-500' : 'text-green-400'}`}>
                        +{entry.pointsReward} pts
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDistractionModal && (
        <DistractionModal onClose={() => setShowDistractionModal(false)} onLogged={handleDistractionLogged} />
      )}
      {showCreateModal && (
        <CreateTaskModal 
          onClose={() => setShowCreateModal(false)} 
          onCreated={() => router.refresh()} 
          currentDateStr={currentDateStr}
        />
      )}
    </div>
  );
}
