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

  // Load recent rooms from the browser's localStorage on page mount
  useEffect(() => {
    const saved = localStorage.getItem("groupup_recent_rooms");
    if (saved) {
      try {
        const parsed: RecentRoom[] = JSON.parse(saved);
        // Sort by most recently visited first
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
    // Generate a random 5-character room code (e.g., "x9b2f")
    const generatedId = Math.random().toString(36).substring(2, 7);

    try {
      // Create the room in your live Vercel Postgres database
      const res = await fetch("/api/room/title", {
        method: "POST",
        body: JSON.stringify({ roomId: generatedId, title: newRoomTitle.trim() }),
      });

      if (res.ok) {
        // Save to local browser history list before routing away
        const updatedHistory = [
          { id: generatedId, title: newRoomTitle.trim(), visitedAt: Date.now() },
          ...recentRooms.filter((r) => r.id !== generatedId), // Remove duplicates if any
        ].slice(0, 5); // Keep the top 5 most recent rooms

        localStorage.setItem("groupup_recent_rooms", JSON.stringify(updatedHistory));

        // Route directly to the new interactive calendar room
        router.push(`/room/${generatedId}`);
      }
    } catch (err) {
      console.error("Error building new plan room:", err);
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 text-slate-800 flex flex-col items-center px-4 py-12 md:py-20">
      
      {/* App Branding Hero */}
      <div className="text-center max-w-2xl mb-12">
        <span className="text-xs font-black tracking-widest text-cyan-600 uppercase bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
          Meet Group Up
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-cyan-950 mt-4 mb-4">
          Group planning, minus the headache.
        </h1>
        <p className="text-base md:text-lg text-stone-500 font-medium leading-relaxed">
          No more messy group chats or infinite scrolling to find dates. Group Up simplifies plan tracking for holidays, road trips, and weekend activities in one synchronized view.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl w-full">
        
        {/* LEFT COLUMN: App Explainer & Instructions */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200/80 space-y-6">
          <h2 className="text-xl font-black text-cyan-950 tracking-tight border-b border-stone-100 pb-2">
            How It Works
          </h2>
          
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <span className="h-7 w-7 rounded-lg bg-cyan-900 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                1
              </span>
              <div>
                <h3 className="font-extrabold text-sm text-stone-800">Launch a New Room</h3>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Type in a custom purpose for your group—like <span className="font-semibold text-stone-700 italic">"Summer Cabin Trip '26"</span> or <span className="font-semibold text-stone-700 italic">"Friday Night Dinner"</span>—to generate an instantly shareable, private planning canvas.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="h-7 w-7 rounded-lg bg-cyan-900 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                2
              </span>
              <div>
                <h3 className="font-extrabold text-sm text-stone-800">Drop the Link to Friends</h3>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Send your uniquely generated room URL directly into your group chat. Anyone with the link can step right into the room without completing complex signup sheets.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="h-7 w-7 rounded-lg bg-cyan-900 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                3
              </span>
              <div>
                <h3 className="font-extrabold text-sm text-stone-800">Coordinate and Vote Live</h3>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Everyone types their name and selects the calendar squares they are free. The app cross-references responses automatically to surface **Best Match Days** in real-time, while friends drop activity ideas into the interactive poll stack.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/60 text-xs font-semibold text-stone-500 leading-relaxed">
            💡 <span className="text-stone-700 font-bold">Zero Logins Required:</span> We respect your time. Your browser will naturally remember rooms you create or join so you can step away and resume planning seamlessly.
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Control Portal */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Box A: Create New Room Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200/80">
            <h2 className="text-lg font-black text-cyan-950 tracking-tight mb-1">Create a Room</h2>
            <p className="text-xs text-stone-400 font-medium mb-4">Start organizing a new group event instantly.</p>
            
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1 uppercase tracking-wide">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Road Trip or Dinner Party..."
                  value={newRoomTitle}
                  onChange={(e) => setNewRoomTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 text-sm font-medium focus:ring-2 focus:ring-cyan-500 outline-none transition"
                />
              </div>
              <button
                type="submit"
                disabled={isCreating || !newRoomTitle.trim()}
                className="w-full bg-cyan-800 hover:bg-cyan-950 text-white font-bold py-2.5 rounded-lg text-sm shadow-sm transition disabled:opacity-40"
              >
                {isCreating ? "Generating Room..." : "Create Canvas →"}
              </button>
            </form>
          </div>

          {/* Box B: History Dashboard (Conditional) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200/80 flex-1 flex flex-col">
            <h2 className="text-lg font-black text-cyan-950 tracking-tight mb-1">Your Recent Rooms</h2>
            <p className="text-xs text-stone-400 font-medium mb-4">Jump straight back into your ongoing plans.</p>

            {recentRooms.length > 0 ? (
              <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
                {recentRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => router.push(`/room/${room.id}`)}
                    className="cursor-pointer border border-stone-200/80 bg-stone-50 hover:bg-cyan-50/40 hover:border-cyan-200 p-3 rounded-xl flex items-center justify-between transition group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-black text-stone-800 truncate group-hover:text-cyan-950">
                        {room.title}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mt-0.5">
                        Code: {room.id}
                      </p>
                    </div>
                    <span className="text-xs font-black text-cyan-700 bg-white border border-stone-200/80 px-2 py-1 rounded-md shadow-xs group-hover:bg-cyan-700 group-hover:text-white group-hover:border-cyan-700 transition">
                      Open
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 border-2 border-dashed border-stone-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <span className="text-xl mb-1">🗺️</span>
                <p className="text-xs font-bold text-stone-400">No rooms visited yet</p>
                <p className="text-[10px] text-stone-400 max-w-[180px] mt-0.5">Once you create or open a plan room, it will match here automatically!</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </main>
  );
}