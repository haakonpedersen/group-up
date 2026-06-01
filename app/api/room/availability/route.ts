import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(request: Request) {
  const { roomId, name, date } = await request.json();

  const existing = await sql`SELECT id FROM availability WHERE room_id = ${roomId} AND name = ${name} AND date = ${date};`;

  // Fix: Use rows.length instead of rowCount
  if (existing.rows && existing.rows.length > 0) {
    await sql`DELETE FROM availability WHERE id = ${existing.rows[0].id};`;
  } else {
    await sql`INSERT INTO availability (room_id, name, date) VALUES (${roomId}, ${name}, ${date});`;
  }

  return NextResponse.json({ success: true });
}