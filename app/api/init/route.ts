import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    // Create tables if they don't exist yet
    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) DEFAULT 'My Awesome Event'
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS availability (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(255),
        name VARCHAR(255),
        date VARCHAR(255)
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS suggestions (
        id VARCHAR(255) PRIMARY KEY,
        room_id VARCHAR(255),
        name VARCHAR(255),
        text TEXT,
        liked_by TEXT DEFAULT '[]'
      );
    `;
    return NextResponse.json({ message: "Database initialized successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}