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
  likedBy: string[]; // Track user names who liked this suggestion
}

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  const [roomTitle, setRoomTitle] = useState("My Awesome Event");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [userName, setUserName] = useState("");
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [newSuggestion, setNewSuggestion] = useState("");
  
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [currentYear, setCurrentYear] = useState(2026);

  const [systemMonthIndex, setSystemMonthIndex] = useState(0);
  const [systemYear, setSystemYear] = useState(2026);

  useEffect(() => {
    const today = new Date();
    const realMonth = today.getMonth();
    const realYear = today.getFullYear();

    setCurrentMonthIndex(realMonth);
    setCurrentYear(realYear);
    setSystemMonthIndex(realMonth);
    setSystemYear(realYear);
    
    setRoomTitle(`Plan: ${roomId.toUpperCase()}`);
  }, [roomId]);

  const months = [
    { name: "January", days: 31 },
    { name: "February", days: 28 },
    { name: "March", days: 31 },
    { name: "April", days: 30 },
    { name: "May", days: 31 },
    { name: "June", days: 30 },
    { name: "July", days: 31 },
    { name: "August", days: 31 },
    { name: "September", days: 30 },
    { name: "October", days: 31 },
    { name: "November", days: 30 },
    { name: "December", days: 31 },
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
    if (currentYear === systemYear && currentMonthIndex === systemMonthIndex) {
      return;
    }

    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonthIndex((prev) => prev - 1);
    }
  };

  const resetToCurrentMonth = () => {
    setCurrentMonthIndex(systemMonthIndex);
    setCurrentYear(systemYear);
  };

  const toggleAvailability = (date: string) => {
    if (!userName.trim()) {
      alert("Please enter your name first!");
      return;
    }

    const exists = availabilities.find((a) => a.name === userName && a.date === date);
    if (exists) {
      setAvailabilities(availabilities.filter((a) => !(a.name === userName && a.date === date)));
    } else {
      setAvailabilities([...availabilities, { name: userName, date }]);
    }
  };

  const addSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !newSuggestion.trim()) {
      alert("Make sure you've entered your name and a suggestion!");
      return;
    }

    const suggestion: Suggestion = {
      id: Math.random().toString(),
      name: userName,
      text: newSuggestion,
      likedBy: [], // Initializes with an empty array of likes
    };

    setSuggestions([...suggestions, suggestion]);
    setNewSuggestion("");
  };

  // --- SMART LIKE/UNLIKE TOGGLE LOGIC ---
  const handleLikeSuggestion = (id: string) => {
    if (!userName.trim()) {
      alert("Please enter your name first to vote on suggestions!");
      return;
    }

    const cleanedName = userName.trim();

    setSuggestions(
      suggestions.map((s) => {
        if (s.id !== id) return s;

        const hasLiked = s.likedBy.includes(cleanedName);
        return {
          ...s,
          // If already liked, remove the user name (unlike). Otherwise, append it (like).
          likedBy: hasLiked
            ? s.likedBy.filter((name) => name !== cleanedName)
            : [...s.likedBy, cleanedName],
        };
      })
    );
  };

  // Sort by array length (total unique likes)
  const sortedSuggestions = [...suggestions].sort((a, b) => b.likedBy.length - a.likedBy.length);

  const activeMonth = months[currentMonthIndex];
  const monthStr = String(currentMonthIndex + 1).padStart(2, "0");
  const totalDays = getDaysInMonth(currentMonthIndex, currentYear);

  const getFirstDayOffset = (monthIdx: number, year: number) => {
    const firstDay = new Date(year, monthIdx, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; 
  };

  const offsetCount = getFirstDayOffset(currentMonthIndex, currentYear);
  const blankDaysArray = Array.from({ length: offsetCount });

  const isPrevDisabled = currentYear === systemYear && currentMonthIndex === systemMonthIndex;
  const isLookingAtFuture = currentYear > systemYear || currentMonthIndex > systemMonthIndex;

  return (
    <main className="min-h-screen bg-stone-50 p-6 text-slate-800">
      {/* Header */}
      <header className="mb-8 border-b border-stone-200 pb-5">
        <span className="text-xs font-bold tracking-widest text-cyan-600 uppercase">Group Up</span>
        
        <div className="flex items-center gap-3 mt-1">
          {isEditingTitle ? (
            <input
              type="text"
              value={roomTitle}
              onChange={(e) => setRoomTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
              className="text-3xl font-bold tracking-tight text-cyan-900 border-b border-cyan-500 bg-transparent focus:outline-none max-w-xl"
              autoFocus
            />
          ) : (
            <h1 
              onClick={() => setIsEditingTitle(true)}
              className="text-3xl font-bold tracking-tight text-cyan-900 cursor-pointer hover:text-cyan-700 transition decoration-dotted underline decoration-stone-300 decoration-2 underline-offset-4"
            >
              {roomTitle}
            </h1>
          )}
        </div>
        
        <p className="text-sm text-stone-500 mt-2">
          Share Link: <span className="font-mono bg-stone-200 px-1.5 py-0.5 rounded text-xs text-stone-700">groupup.com/room/{roomId}</span>
        </p>
      </header>

      {/* Profile Card */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 mb-6 max-w-md">
        <label className="block text-sm font-semibold mb-2 text-cyan-900">Who are you?</label>
        <input
          type="text"
          placeholder="Enter your name..."
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Calendar Grid */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-4 mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-cyan-900">{activeMonth.name} {currentYear}</h2>
              <p className="text-xs text-stone-400 mt-0.5">Click a day to toggle your availability.</p>
            </div>
            
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {isLookingAtFuture && (
                <button
                  onClick={resetToCurrentMonth}
                  className="px-3 py-1.5 text-xs font-semibold bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg border border-cyan-200/60 transition shadow-sm mr-1"
                >
                  Current Month
                </button>
              )}
              
              <button
                onClick={prevMonth}
                disabled={isPrevDisabled}
                className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm bg-stone-50 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed text-cyan-900 font-medium transition"
              >
                &larr; Prev
              </button>
              <button
                onClick={nextMonth}
                className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm bg-stone-50 hover:bg-stone-100 text-cyan-900 font-medium transition"
              >
                Next &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold mb-2 text-cyan-800">
            <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {blankDaysArray.map((_, index) => (
              <div key={`blank-${index}`} className="border border-transparent bg-transparent min-h-[80px]" />
            ))}

            {Array.from({ length: totalDays }, (_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${monthStr}-${String(dayNum).padStart(2, "0")}`;
              const globalAvails = availabilities.filter((a) => a.date === dateStr);
              const amIAvailable = availabilities.some((a) => a.name === userName && a.date === dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => toggleAvailability(dateStr)}
                  className={`p-2 border rounded-lg text-left flex flex-col justify-between transition min-h-[80px] ${
                    amIAvailable 
                      ? "bg-teal-50 border-teal-300 text-teal-900" 
                      : "border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700"
                  }`}
                >
                  <span className="font-bold text-xs">{dayNum}</span>
                  <div className="flex flex-wrap gap-1 mt-1 max-h-12 overflow-y-auto w-full">
                    {globalAvails.map((av, idx) => (
                      <span key={idx} className="bg-sky-600 text-white text-[9px] px-1 py-0.5 rounded w-full truncate block text-center">
                        {av.name}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Suggestions Box */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-fit lg:sticky lg:top-6">
          <h2 className="text-xl font-bold mb-4 text-cyan-900">Activity Suggestions</h2>
          
          <form onSubmit={addSuggestion} className="space-y-2 mb-6">
            <input
              type="text"
              placeholder="Suggest something to do..."
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="submit"
              className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-semibold py-2 rounded-md text-sm transition shadow-sm"
            >
              Add Suggestion
            </button>
          </form>

          <ul className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {sortedSuggestions.length === 0 ? (
              <p className="text-sm text-stone-400 italic">No suggestions yet. Be the first!</p>
            ) : (
              sortedSuggestions.map((s) => {
                const userHasLiked = s.likedBy.includes(userName.trim());
                
                return (
                  <li key={s.id} className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm flex justify-between items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-stone-800 break-words">{s.text}</p>
                      <span className="text-[11px] text-stone-400 block mt-0.5">by {s.name}</span>
                    </div>
                    
                    {/* Visual state changes when active user has liked it */}
                    <button
                      onClick={() => handleLikeSuggestion(s.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-md transition font-medium text-xs shrink-0 shadow-sm ${
                        userHasLiked
                          ? "bg-cyan-600 border-cyan-600 text-white hover:bg-cyan-700"
                          : "bg-white hover:bg-cyan-50 border-stone-200 text-stone-600 hover:text-cyan-700 hover:border-cyan-200"
                      }`}
                    >
                      👍 <span>{s.likedBy.length}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}