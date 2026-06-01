import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(request: Request) {
  const { suggestionId, name } = await request.json();

  const item = await sql`SELECT liked_by FROM suggestions WHERE id = ${suggestionId};`;
  
  // Fix: Use rows.length instead of rowCount here too
  if (!item.rows || item.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let likedBy: string[] = JSON.parse(item.rows[0].liked_by || "[]");

  if (likedBy.includes(name)) {
    likedBy = likedBy.filter(n => n !== name);
  } else {
    likedBy.push(name);
  }

  await sql`UPDATE suggestions SET liked_by = ${JSON.stringify(likedBy)} WHERE id = ${suggestionId};`;
  return NextResponse.json({ success: true });
}