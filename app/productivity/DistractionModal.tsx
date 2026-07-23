"use client";

import { useState } from "react";
import { X, Frown } from "lucide-react";
import { logDistraction } from "./actions";

export default function DistractionModal({ 
  onClose, 
  onLogged 
}: { 
  onClose: () => void;
  onLogged: (pointsLost: number) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [customReason, setCustomReason] = useState("");

  const presetDistractions = [
    { label: "Watched Reels / Shorts", points: 10 },
    { label: "Binge Watched Series", points: 15 },
    { label: "Hanging out randomly", points: 10 },
    { label: "Daydreaming", points: 5 },
  ];

  const handleLog = async (reason: string, pointsLost: number) => {
    setLoading(true);
    const res = await logDistraction(reason, pointsLost);
    if (res.success) {
      onLogged(pointsLost);
    } else {
      alert("Failed to log distraction");
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

        <div className="text-center mb-6">
          <Frown className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-white">I Got Distracted</h2>
          <p className="text-gray-400 text-sm">Be honest. It's the first step to improving.</p>
        </div>

        <div className="space-y-3">
          {presetDistractions.map((d, i) => (
            <button
              key={i}
              disabled={loading}
              onClick={() => handleLog(d.label, d.points)}
              className="w-full flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/50 transition-colors disabled:opacity-50"
            >
              <span className="font-medium text-white">{d.label}</span>
              <span className="text-red-400 font-bold">-{d.points} pts</span>
            </button>
          ))}

          <div className="pt-4 border-t border-white/10 mt-4">
            <p className="text-sm text-gray-400 mb-2">Other Reason:</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="What distracted you?"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
              />
              <button
                disabled={loading || !customReason.trim()}
                onClick={() => handleLog(customReason, 5)}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl disabled:opacity-50 transition-colors font-bold"
              >
                Log (-5 pts)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
