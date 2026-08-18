import { NextRequest, NextResponse } from "next/server";
import { revokeAdminStepUp } from "@/features/auth/server/admin-step-up";

export async function GET(request: NextRequest) {
  await revokeAdminStepUp();
  const requestedPath = request.nextUrl.searchParams.get("returnTo");
  const returnTo = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
    ? requestedPath
    : "/";
  return NextResponse.redirect(new URL(returnTo, request.url));
}
