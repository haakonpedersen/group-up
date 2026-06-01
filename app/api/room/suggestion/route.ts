import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(request: Request) {
  const { roomId, name, text } = await request.json();
  const id = Math.random().toString(36).substring(2);

  await sql`INSERT INTO suggestions (id, room_id, name, text, liked_by) VALUES (${id}, ${roomId}, ${name}, ${text}, '[]');`;
  return NextResponse.json({ success: true });
}