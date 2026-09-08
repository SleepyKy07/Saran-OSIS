import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySiswaToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const store = await cookies();
  const token = store.get("siswa_session")?.value;
  if (!token) return NextResponse.json({ loggedIn: false });
  const sid = await verifySiswaToken(token);
  if (!sid) return NextResponse.json({ loggedIn: false });
  const student = await prisma.student.findUnique({
    where: { id: sid },
    select: { isUsed: true, displayCode: true },
  });
  if (!student) return NextResponse.json({ loggedIn: false });
  return NextResponse.json({
    loggedIn: true,
    used: student.isUsed,
    displayCode: student.displayCode ?? null,
  });
}
