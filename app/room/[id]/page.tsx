"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Availability {
  name: string;
  date: string;
}

interface Suggestion {
  id: string;
  name: string;
  text: string;
  likedBy: string[];
}

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  // App Data States
  const [roomTitle, setRoomTitle] = useState("Loading Plan...");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [userName, setUserName] = useState("");
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [newSuggestion, setNewSuggestion] = useState("");
  
  // Calendar Navigation States
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [currentYear, setCurrentYear] = useState(2026);
  const [systemMonthIndex, setSystemMonthIndex] = useState(0);
  const [systemYear, setSystemYear] = useState(2026);

  // 1. POLLING EFFECT: Fetch data from database every 2 seconds for live cross-device syncing
  useEffect(() => {
    const today = new Date();
    const realMonth = today.getMonth();
    const realYear = today.getFullYear();

    setCurrentMonthIndex(realMonth);
    setCurrentYear(realYear);
    setSystemMonthIndex(realMonth);
    setSystemYear(realYear);

    // Initial fetch
    fetchRoomData();

    // Set up live sync interval
    const interval = setInterval(() => {
      fetchRoomData();
    }, 2000);

    return () => clearInterval(interval);
  }, [roomId]);

  const fetchRoomData = async () => {
    try {
      const res = await fetch(`/api/room?id=${roomId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.title) setRoomTitle(data.title);
        if (data.availabilities) setAvailabilities(data.availabilities);
        if (data.suggestions) setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error("Error syncing data:", err);
    }
  };

  const months = [
    { name: "January", days: 31 }, { name: "February", days: 28 },
    { name: "March", days: 31 }, { name: "April", days: 30 },
    { name: "May", days: 31 }, { name: "June", days: 30 },
    { name: "July", days: 31 }, { name: "August", days: 31 },
    { name: "September", days: 30 }, { name: "October", days: 31 },
    { name: "November", days: 30 }, { name: "December", days: 31 },
  ];

  const getDaysInMonth = (monthIdx: number, year: number) => {
    if (monthIdx === 1) {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
    }
    return months[monthIdx].days;
  };

  const nextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonthIndex((prev) => prev + 1);
    }
  };

  const prevMonth = () => {
    if (currentYear === systemYear && currentMonthIndex === systemMonthIndex) return;
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonthIndex((prev) => prev - 1);
    }
  };

  const updateTitleInDb = async (newTitle: string) => {
    setRoomTitle(newTitle);
    await fetch("/api/room/title", {
      method: "POST",
      body: JSON.stringify({ roomId, title: newTitle }),
    });
  };

  const toggleAvailability = async (date: string) => {
    if (!userName.trim()) {
      alert("Please enter your name first!");
      return;
    }
    const name = userName.trim();
    // Optimistic UI updates
    const exists = availabilities.find((a) => a.name === name && a.date === date);
    if (exists) {
      setAvailabilities(availabilities.filter((a) => !(a.name === name && a.date === date)));
    } else {
      setAvailabilities([...availabilities, { name, date }]);
    }

    await fetch("/api/room/availability", {
      method: "POST",
      body: JSON.stringify({ roomId, name, date }),
    });
  };

  const addSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !newSuggestion.trim()) return;

    const text = newSuggestion;
    setNewSuggestion("");

    await fetch("/api/room/suggestion", {
      method: "POST",
      body: JSON.stringify({ roomId, name: userName.trim(), text }),
    });
    fetchRoomData();
  };

  const handleLikeSuggestion = async (suggestionId: string) => {
    if (!userName.trim()) {
      alert("Enter your name first to vote!");
      return;
    }
    await fetch("/api/room/suggestion/like", {
      method: "POST",
      body: JSON.stringify({ roomId, suggestionId, name: userName.trim() }),
    });
    fetchRoomData();
  };

  const activeMonth = months[currentMonthIndex];
  const monthStr = String(currentMonthIndex + 1).padStart(2, "0");
  const totalDays = getDaysInMonth(currentMonthIndex, currentYear);

  const getFirstDayOffset = (monthIdx: number, year: number) => {
    const firstDay = new Date(year, monthIdx, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; 
  };

  const offsetCount = getFirstDayOffset(currentMonthIndex, currentYear);
  const blankDaysArray = Array.from({ length: offsetCount });
  const sortedSuggestions = [...suggestions].sort((a, b) => b.likedBy.length - a.likedBy.length);
  const isPrevDisabled = currentYear === systemYear && currentMonthIndex === systemMonthIndex;
  const isLookingAtFuture = currentYear > systemYear || currentMonthIndex > systemMonthIndex;

  // Day renderer sub-logic used by both layouts
  const getDayDetails = (dayNum: number) => {
    const dateStr = `${currentYear}-${monthStr}-${String(dayNum).padStart(2, "0")}`;
    const globalAvails = availabilities.filter((a) => a.date === dateStr);
    const amIAvailable = availabilities.some((a) => a.name === userName.trim() && a.date === dateStr);
    const dayOfWeek = new Date(currentYear, currentMonthIndex, dayNum).toLocaleDateString("en-US", { weekday: "short" });
    return { dateStr, globalAvails, amIAvailable, dayOfWeek };
  };

  return (
    <main className="min-h-screen bg-stone-50 p-4 md:p-6 text-slate-800">
      {/* Header */}
      <header className="mb-6 border-b border-stone-200 pb-5">
        <span className="text-xs font-bold tracking-widest text-cyan-600 uppercase">Group Up</span>
        <div className="flex items-center gap-3 mt-1">
          {isEditingTitle ? (
            <input
              type="text"
              value={roomTitle}
              onChange={(e) => setRoomTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
              onChangeCapture={(e) => updateTitleInDb((e.target as HTMLInputElement).value)}
              className="text-2xl md:text-3xl font-bold tracking-tight text-cyan-900 border-b border-cyan-500 bg-transparent focus:outline-none w-full max-w-xl"
              autoFocus
            />
          ) : (
            <h1 
              onClick={() => setIsEditingTitle(true)}
              className="text-2xl md:text-3xl font-bold tracking-tight text-cyan-900 cursor-pointer hover:text-cyan-700 transition decoration-dotted underline decoration-stone-300"
            >
              {roomTitle}
            </h1>
          )}
        </div>
      </header>

      {/* Profile Card */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 mb-6 max-w-md">
        <label className="block text-sm font-semibold mb-1 text-cyan-900">Who are you?</label>
        <input
          type="text"
          placeholder="Enter your name..."
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-sm focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar UI Panel */}
        <div className="lg:col-span-3 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-stone-200">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-4 mb-4 gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-cyan-900">{activeMonth.name} {currentYear}</h2>
            </div>
            <div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto">
              {isLookingAtFuture && (
                <button
                  onClick={() => { setCurrentMonthIndex(systemMonthIndex); setCurrentYear(systemYear); }}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-cyan-50 text-cyan-800 rounded-lg border border-cyan-200"
                >
                  Current Month
                </button>
              )}
              <div className="flex gap-1.5">
                <button onClick={prevMonth} disabled={isPrevDisabled} className="px-3 py-1.5 border border-stone-200 rounded-lg text-xs md:text-sm bg-stone-50 disabled:opacity-30">&larr; Prev</button>
                <button onClick={nextMonth} className="px-3 py-1.5 border border-stone-200 rounded-lg text-xs md:text-sm bg-stone-50">Next &rarr;</button>
              </div>
            </div>
          </div>

          {/* 📱 MOBILE VIEW: Full-width stacked day list rows (Hidden on desktop) */}
          <div className="sm:hidden space-y-2">
            {Array.from({ length: totalDays }, (_, i) => {
              const dayNum = i + 1;
              const { dateStr, globalAvails, amIAvailable, dayOfWeek } = getDayDetails(dayNum);

              return (
                <div 
                  key={`mobile-${dateStr}`}
                  className={`p-3 border rounded-xl flex flex-col gap-2 transition ${
                    amIAvailable ? "bg-teal-50/60 border-teal-300" : "border-stone-100 bg-stone-50/50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-stone-700 bg-white shadow-sm border border-stone-200/60 h-7 w-7 flex items-center justify-center rounded-lg">{dayNum}</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-400">{dayOfWeek}</span>
                    </div>
                    <button
                      onClick={() => toggleAvailability(dateStr)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold transition ${
                        amIAvailable 
                          ? "bg-teal-600 text-white shadow-sm" 
                          : "bg-white border border-stone-300 text-stone-600"
                      }`}
                    >
                      {amIAvailable ? "✓ Available" : "+ I'm Free"}
                    </button>
                  </div>

                  {/* Clear text display for names on Mobile */}
                  {globalAvails.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-dashed border-stone-200">
                      {globalAvails.map((av, idx) => (
                        <span key={idx} className="bg-sky-600 text-white text-xs px-2 py-0.5 rounded-md font-medium">
                          {av.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 💻 DESKTOP VIEW: Standard Grid Grid (Hidden on phone screens) */}
          <div className="hidden sm:block">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold mb-2 text-cyan-800">
              <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {blankDaysArray.map((_, index) => (
                <div key={`blank-${index}`} className="border border-transparent bg-transparent min-h-[90px]" />
              ))}
              {Array.from({ length: totalDays }, (_, i) => {
                const dayNum = i + 1;
                const { dateStr, globalAvails, amIAvailable } = getDayDetails(dayNum);

                return (
                  <button
                    key={dateStr}
                    onClick={() => toggleAvailability(dateStr)}
                    className={`p-2 border rounded-lg text-left flex flex-col justify-between transition min-h-[90px] group ${
                      amIAvailable ? "bg-teal-50 border-teal-300 text-teal-900" : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                    }`}
                  >
                    <span className="font-bold text-xs">{dayNum}</span>
                    <div className="flex flex-col gap-1 mt-1 w-full overflow-y-auto max-h-[60px]">
                      {globalAvails.map((av, idx) => (
                        <span key={idx} className="bg-sky-600 text-white text-[10px] px-1 py-0.5 rounded truncate text-center block font-medium">
                          {av.name}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Suggestions Box (Responsive column) */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-stone-200 h-fit lg:sticky lg:top-6">
          <h2 className="text-lg md:text-xl font-bold mb-3 text-cyan-900">Activity Suggestions</h2>
          <form onSubmit={addSuggestion} className="space-y-2 mb-4">
            <input
              type="text"
              placeholder="Suggest an activity..."
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm bg-stone-50"
            />
            <button type="submit" className="w-full bg-cyan-700 text-white font-semibold py-2 rounded-md text-sm">Add</button>
          </form>
          <ul className="space-y-2 max-h-[300px] overflow-y-auto">
            {sortedSuggestions.map((s) => {
              const userHasLiked = s.likedBy.includes(userName.trim());
              return (
                <li key={s.id} className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm flex justify-between items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-800 break-words">{s.text}</p>
                    <span className="text-[11px] text-stone-400">by {s.name}</span>
                  </div>
                  <button
                    onClick={() => handleLikeSuggestion(s.id)}
                    className={`flex items-center gap-1 px-2 py-1 border rounded-md text-xs font-semibold ${
                      userHasLiked ? "bg-cyan-600 border-cyan-600 text-white" : "bg-white text-stone-600"
                    }`}
                  >
                    👍 {s.likedBy.length}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </main>
  );
}