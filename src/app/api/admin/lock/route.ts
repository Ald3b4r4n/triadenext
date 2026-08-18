import { NextResponse } from "next/server";
import { revokeAdminStepUp } from "@/features/auth/server/admin-step-up";

export async function POST() {
  await revokeAdminStepUp();
  return NextResponse.json({ locked: true });
}
