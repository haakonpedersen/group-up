import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("id");

  if (!roomId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  // Ensure room record wrapper shell placeholder exists
  await sql`INSERT INTO rooms (id, title) VALUES (${roomId}, 'Plan: ' || UPPER(${roomId})) ON CONFLICT (id) DO NOTHING;`;

  const roomInfo = await sql`SELECT title FROM rooms WHERE id = ${roomId};`;
  const avails = await sql`SELECT name, date FROM availability WHERE room_id = ${roomId};`;
  const suggs = await sql`SELECT id, name, text, liked_by as "likedBy" FROM suggestions WHERE room_id = ${roomId};`;

  const suggestions = suggs.rows.map(row => ({
    ...row,
    likedBy: typeof row.likedBy === 'string' ? JSON.parse(row.likedBy) : row.likedBy || []
  }));

  return NextResponse.json({
    title: roomInfo.rows[0]?.title,
    availabilities: avails.rows,
    suggestions
  });
}