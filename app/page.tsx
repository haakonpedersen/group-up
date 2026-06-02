"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RecentRoom {
  id: string;
  title: string;
  visitedAt: number;
}

export default function HomePage() {
  const router = useRouter();
  const [newRoomTitle, setNewRoomTitle] = useState("");
  const [recentRooms, setRecentRooms] = useState<RecentRoom[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("groupup_recent_rooms");
    if (saved) {
      try {
        const parsed: RecentRoom[] = JSON.parse(saved);
        setRecentRooms(parsed.sort((a, b) => b.visitedAt - a.visitedAt));
      } catch (e) {
        console.error("Failed to parse recent rooms history:", e);
      }
    }
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomTitle.trim() || isCreating) return;

    setIsCreating(true);
    const generatedId = Math.random().toString(36).substring(2, 7);

    try {
      const res = await fetch("/api/room/title", {
        method: "POST",
        body: JSON.stringify({ roomId: generatedId, title: newRoomTitle.trim() }),
      });

      if (res.ok) {
        const updatedHistory = [
          { id: generatedId, title: newRoomTitle.trim(), visitedAt: Date.now() },
          ...recentRooms.filter((r) => r.id !== generatedId),
        ].slice(0, 5);

        localStorage.setItem("groupup_recent_rooms", JSON.stringify(updatedHistory));
        router.push(`/room/${generatedId}`);
      }
    } catch (err) {
      console.error("Error building new calendar:", err);
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 text-slate-800 flex flex-col items-center px-4 py-12 md:py-20">
      
      {/* App Branding Hero */}
      <div className="text-center max-w-2xl mb-10">
        <span className="text-xs font-black tracking-widest text-cyan-600 uppercase bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
          Meet Group Up
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-cyan-950 mt-4 mb-4">
          Group planning, minus the headache.
        </h1>
        <p className="text-sm md:text-base text-stone-500 font-medium leading-relaxed">
          No more messy group chats or infinite scrolling to find dates. Group Up simplifies plan tracking for holidays, road trips, and weekend activities in one synchronized view.
        </p>
      </div>

      {/* 🌟 CENTRAL HIGH-VISIBILITY INTERACTIVE ZONE */}
      <div className="max-w-3xl w-full space-y-6 mb-16">
        
        {/* Main Central Card: Create Calendar */}
        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-md border border-stone-200/80 text-center">
          <h2 className="text-2xl font-black text-cyan-950 tracking-tight mb-2">Create a Calendar</h2>
          <p className="text-sm text-stone-400 font-medium mb-6">Start organizing a new group event instantly. No signups required.</p>
          
          <form onSubmit={handleCreateRoom} className="max-w-xl mx-auto space-y-4">
            <div className="text-left">
              <label className="block text-xs font-bold text-stone-600 mb-1.5 uppercase tracking-wide">Event or Trip Title</label>
              <input
                type="text"
                required
                placeholder="e.g., Summer Cabin Trip '26, Birthday Dinner..."
                value={newRoomTitle}
                onChange={(e) => setNewRoomTitle(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl bg-stone-50 text-base font-semibold focus:ring-2 focus:ring-cyan-500 outline-none transition shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={isCreating || !newRoomTitle.trim()}
              className="w-full bg-cyan-800 hover:bg-cyan-950 text-white font-black py-3.5 rounded-xl text-base shadow-md transition disabled:opacity-40 tracking-wide"
            >
              {isCreating ? "Generating Canvas..." : "Create Calendar →"}
            </button>
          </form>
        </div>

        {/* Secondary Dashboard Area: History Lookup */}
        {recentRooms.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200/80 max-w-xl mx-auto w-full">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-3 text-center">
              Your Recent Calendars
            </h3>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {recentRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => router.push(`/room/${room.id}`)}
                  className="cursor-pointer border border-stone-200/60 bg-stone-50 hover:bg-cyan-50/40 hover:border-cyan-200 p-3 rounded-xl flex items-center justify-between transition group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-black text-stone-800 truncate group-hover:text-cyan-950">
                      {room.title}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mt-0.5">
                      Code: {room.id}
                    </p>
                  </div>
                  <span className="text-xs font-black text-cyan-700 bg-white border border-stone-200/80 px-2.5 py-1 rounded-md shadow-xs group-hover:bg-cyan-700 group-hover:text-white group-hover:border-cyan-700 transition">
                    Open
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- INSTRUCTIONAL EXPLAINER ROW (SCROLL DOWN CONTENT) --- */}
      <div className="max-w-4xl w-full border-t border-stone-200 pt-12">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200/80 space-y-6">
          <h2 className="text-xl font-black text-cyan-950 tracking-tight border-b border-stone-100 pb-2 text-center sm:text-left">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-cyan-900 text-white font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <h3 className="font-extrabold text-sm text-stone-800">Launch a Canvas</h3>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed pl-8 md:pl-0">
                Pick a title for your shared event. Your custom planning platform generates dynamically in under a second.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-cyan-900 text-white font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <h3 className="font-extrabold text-sm text-stone-800">Share with Friends</h3>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed pl-8 md:pl-0">
                Copy the dashboard URL directly into your group chats. Friends can step straight onto the sheet without configuring profiles.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-cyan-900 text-white font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <h3 className="font-extrabold text-sm text-stone-800">Coordinate Instantly</h3>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed pl-8 md:pl-0">
                Everyone tags their available dates. Best match options bubble right to the top row as responses drop into place.
              </p>
            </div>
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 text-xs font-semibold text-stone-500 leading-relaxed text-center">
            💡 <span className="text-stone-700 font-bold">Zero Logins Required:</span> We respect your time. Your browser automatically keeps track of recent links so you can click off and jump back in anytime.
          </div>
        </div>
      </div>

    </main>
  );
}