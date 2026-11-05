import { NextResponse } from "next/server"
import { REPO_INTEGRATIONS, SYSTEM_LAYERS } from "@/lib/gos/repos"

export async function GET() {
  return NextResponse.json({ repos: REPO_INTEGRATIONS, layers: SYSTEM_LAYERS })
}
