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

  // Modal / Quick-View Popover State
  const [activeModalDate, setActiveModalDate] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    const realMonth = today.getMonth();
    const realYear = today.getFullYear();

    setCurrentMonthIndex(realMonth);
    setCurrentYear(realYear);
    setSystemMonthIndex(realMonth);
    setSystemYear(realYear);

    fetchRoomData();

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

  const getNameColorClass = (name: string) => {
    const colorCombos = [
      "bg-amber-300 text-amber-950 border-amber-400",
      "bg-cyan-300 text-cyan-950 border-cyan-400",
      "bg-lime-300 text-lime-950 border-lime-400",
      "bg-fuchsia-300 text-fuchsia-950 border-fuchsia-400",
      "bg-orange-300 text-orange-950 border-orange-400",
      "bg-yellow-300 text-yellow-950 border-yellow-400",
      "bg-emerald-300 text-emerald-950 border-emerald-400",
      "bg-sky-300 text-sky-950 border-sky-400",
      "bg-pink-300 text-pink-950 border-pink-400",
      "bg-violet-300 text-violet-950 border-violet-400",
      "bg-teal-300 text-teal-950 border-teal-400",
      "bg-rose-300 text-rose-950 border-rose-400"
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorCombos.length;
    return colorCombos[index];
  };

  const getTopDays = () => {
    const uniqueUsers = Array.from(new Set(availabilities.map((a) => a.name)));
    const totalUsersCount = uniqueUsers.length;

    if (totalUsersCount === 0) return [];

    const dateCounts: { [key: string]: number } = {};
    availabilities.forEach((avail) => {
      dateCounts[avail.date] = (dateCounts[avail.date] || 0) + 1;
    });

    return Object.keys(dateCounts)
      .map((date) => ({
        date,
        count: dateCounts[date],
        ratioText: `${dateCounts[date]}/${totalUsersCount} free`,
        formattedDate: new Date(date + "T00:00:00").toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  const topDaysList = getTopDays();

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

  const getDayDetails = (dayNum: number) => {
    const dateStr = `${currentYear}-${monthStr}-${String(dayNum).padStart(2, "0")}`;
    const globalAvails = availabilities.filter((a) => a.date === dateStr);
    const amIAvailable = availabilities.some((a) => a.name === userName.trim() && a.date === dateStr);
    const dayOfWeek = new Date(currentYear, currentMonthIndex, dayNum).toLocaleDateString("en-US", { weekday: "short" });
    return { dateStr, globalAvails, amIAvailable, dayOfWeek };
  };

  const modalAvailabilities = availabilities.filter((a) => a.date === activeModalDate);
  const formattedModalDate = activeModalDate 
    ? new Date(activeModalDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";

  return (
    <main className="min-h-screen bg-stone-50 p-2 sm:p-6 text-slate-800 relative" suppressHydrationWarning>
      
      {/* Header */}
      <header className="mb-4 border-b border-stone-200 pb-4">
        <span className="text-xs font-bold tracking-widest text-cyan-600 uppercase">Group Up</span>
        <div className="flex items-center gap-3 mt-1">
          {isEditingTitle ? (
            <input
              type="text"
              value={roomTitle}
              onChange={(e) => setRoomTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
              onChangeCapture={(update) => updateTitleInDb((update.target as HTMLInputElement).value)}
              className="text-2xl font-bold tracking-tight text-cyan-900 border-b border-cyan-500 bg-transparent focus:outline-none w-full"
              autoFocus
            />
          ) : (
            <h1 
              onClick={() => setIsEditingTitle(true)}
              className="text-2xl font-bold tracking-tight text-cyan-900 cursor-pointer hover:text-cyan-700 transition decoration-dotted underline decoration-stone-300"
            >
              {roomTitle}
            </h1>
          )}
        </div>
      </header>

      {/* Setup Forms Row */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Profile Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 w-full md:max-w-xs flex-shrink-0">
          <label className="block text-sm font-semibold mb-1 text-cyan-900">Who are you?</label>
          <input
            type="text"
            placeholder="Enter your name..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-sm focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* TOP DAYS LEADERS PANEL */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-cyan-800 mb-2">🔥 Best Match Days</h3>
          {topDaysList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {topDaysList.map((day, idx) => (
                <div 
                  key={day.date} 
                  onClick={() => setActiveModalDate(day.date)}
                  className="cursor-pointer bg-amber-50/50 hover:bg-amber-50 border border-amber-200/80 rounded-xl p-2 flex items-center justify-between transition group"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-black text-amber-950 uppercase tracking-wide group-hover:text-amber-800">{day.formattedDate}</p>
                    <p className="text-[10px] font-medium text-stone-400">Rank #{idx + 1}</p>
                  </div>
                  <span className="bg-amber-500 text-amber-950 font-black text-[11px] px-2 py-0.5 rounded-md shadow-sm">
                    {day.ratioText}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400 font-medium py-1">No dates selected yet. Start choosing dates below!</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Unified 7-Column Grid Calendar Panel */}
        <div className="lg:col-span-3 bg-white p-2 sm:p-6 rounded-xl shadow-sm border border-stone-200">
          
          {/* Header Controls */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3 gap-2">
            <h2 className="text-lg sm:text-2xl font-bold text-cyan-900">{activeMonth.name} {currentYear}</h2>
            <div className="flex items-center gap-1.5">
              {isLookingAtFuture && (
                <button
                  onClick={() => { setCurrentMonthIndex(systemMonthIndex); setCurrentYear(systemYear); }}
                  className="px-2 py-1 text-[11px] font-bold bg-cyan-50 text-cyan-800 rounded-md border border-cyan-200"
                >
                  Current
                </button>
              )}
              <button onClick={prevMonth} disabled={isPrevDisabled} className="px-2.5 py-1 border border-stone-200 rounded-md text-xs bg-stone-50 disabled:opacity-30">&larr;</button>
              <button onClick={nextMonth} className="px-2.5 py-1 border border-stone-200 rounded-md text-xs bg-stone-50">&rarr;</button>
            </div>
          </div>

          {/* Unified 7-Column Day Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black mb-1 text-cyan-800 uppercase tracking-wider">
            <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
          </div>

          {/* Unified Grid Layout */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {blankDaysArray.map((_, index) => (
              <div key={`blank-${index}`} className="border border-transparent bg-transparent min-h-[72px] sm:min-h-[110px]" />
            ))}
            {Array.from({ length: totalDays }, (_, i) => {
              const dayNum = i + 1;
              const { dateStr, globalAvails, amIAvailable } = getDayDetails(dayNum);
              
              // Mobile handles limits tighter than desktops to optimize real estate squares
              const shouldTruncate = globalAvails.length > 2;
              const visibleAvails = shouldTruncate ? globalAvails.slice(0, 1) : globalAvails;
              const hiddenCount = globalAvails.length - visibleAvails.length;

              return (
                <div
                  key={dateStr}
                  className={`p-1 sm:p-2 border rounded-md sm:rounded-lg text-left flex flex-col justify-between min-h-[72px] sm:min-h-[110px] relative ${
                    amIAvailable ? "bg-teal-50/40 border-teal-300" : "border-stone-200 bg-stone-50"
                  }`}
                >
                  {/* Square Header Row */}
                  <div className="flex justify-between items-center w-full">
                    <span className="font-extrabold text-xs text-stone-600">{dayNum}</span>
                    {globalAvails.length > 0 && (
                      <span className="bg-cyan-950 text-white font-black text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full min-w-[14px] text-center shadow-sm">
                        {globalAvails.length}
                      </span>
                    )}
                  </div>

                  {/* Date Toggle Hitbox */}
                  <button 
                    onClick={() => toggleAvailability(dateStr)}
                    className="absolute inset-x-0 top-0 h-6 sm:h-8 z-0 bg-transparent rounded-t-md"
                  />

                  {/* Adaptive Stacked Labels Container */}
                  <div className="flex flex-col gap-0.5 sm:gap-1 mt-1 w-full z-10">
                    {/* Desktop View List Layer */}
                    <div className="hidden sm:flex flex-col gap-1">
                      {(globalAvails.length > 3 ? globalAvails.slice(0, 2) : globalAvails).map((av, idx) => (
                        <span key={`desk-${idx}`} className={`text-[10px] px-2 py-0.5 rounded truncate font-bold text-center border shadow-sm ${getNameColorClass(av.name)}`}>
                          {av.name}
                        </span>
                      ))}
                      {globalAvails.length > 3 && (
                        <button onClick={() => setActiveModalDate(dateStr)} className="bg-stone-800 text-white text-[9px] font-black py-0.5 rounded text-center block shadow-sm">
                          + {globalAvails.length - 2} more
                        </button>
                      )}
                    </div>

                    {/* Mobile View Layer (Maximized space configuration) */}
                    <div className="sm:hidden flex flex-col gap-0.5">
                      {visibleAvails.map((av, idx) => (
                        <span key={`mob-${idx}`} className={`text-[9px] px-0.5 py-0.5 rounded truncate font-black tracking-tighter text-center border block shadow-xs leading-none ${getNameColorClass(av.name)}`}>
                          {av.name}
                        </span>
                      ))}
                      {shouldTruncate && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveModalDate(dateStr); }} 
                          className="bg-stone-800 text-white text-[8px] font-black py-0.5 rounded text-center block tracking-tighter leading-none"
                        >
                          +{hiddenCount}
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Suggestions Box */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 h-fit lg:sticky lg:top-6">
          <h2 className="text-lg font-bold mb-3 text-cyan-900">Activity Suggestions</h2>
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
          <ul className="space-y-2 max-h-[240px] overflow-y-auto">
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

      {/* OVERLAY POPUP MODAL COMPONENT */}
      {activeModalDate && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-black text-cyan-950">Who's Free?</h3>
                <p className="text-xs text-stone-400 font-semibold">{formattedModalDate}</p>
              </div>
              <button onClick={() => setActiveModalDate(null)} className="text-stone-400 hover:text-stone-600 font-bold text-sm bg-stone-100 hover:bg-stone-200 h-6 w-6 flex items-center justify-center rounded-full">✕</button>
            </div>
            
            <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-1">
              {modalAvailabilities.map((av, idx) => (
                <div key={idx} className={`px-3 py-2 rounded-xl text-xs font-extrabold border text-center shadow-sm tracking-wide ${getNameColorClass(av.name)}`}>
                  {av.name}
                </div>
              ))}
            </div>

            <button onClick={() => setActiveModalDate(null)} className="mt-5 w-full bg-stone-900 hover:bg-stone-950 text-white text-xs font-bold py-2.5 rounded-xl transition">
              Close Window
            </button>
          </div>
        </div>
      )}

    </main>
  );
}