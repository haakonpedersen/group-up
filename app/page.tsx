"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const createNewRoom = () => {
    // Generate a simple random unique ID (e.g., "room-x9f2k")
    const randomId = Math.random().toString(36).substring(2, 7);
    // Redirect the user to the dynamic room route
    router.push(`/room/${randomId}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md border text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">📅 GroupUp</h1>
        <p className="text-slate-500 mb-8">
          The easiest way to figure out who is free and what to do. No logins required.
        </p>
        <button
          onClick={createNewRoom}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow transition"
        >
          Create a Planning Room
        </button>
      </div>
    </main>
  );
}