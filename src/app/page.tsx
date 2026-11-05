"use client";

/**
 * The system's single route — everything lives here.
 *
 * <GrowthOS /> mounts the merged OS: the hash-path router (home · builder ·
 * AI Studio · Motion Lab · sources · library · catalogue · playbook ·
 * forge · site), the edition skin, the FX finishes and the command
 * palette. See src/engine/nav.ts for the full address grammar.
 */
import { GrowthOS } from "@/shell/growth-os";

export default function Page() {
  return <GrowthOS />;
}
