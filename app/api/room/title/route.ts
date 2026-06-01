import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(request: Request) {
  const { roomId, title } = await request.json();
  await sql`UPDATE rooms SET title = ${title} WHERE id = ${roomId};`;
  return NextResponse.json({ success: true });
}