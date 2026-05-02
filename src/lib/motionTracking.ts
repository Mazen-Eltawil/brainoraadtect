import { supabase } from "@/integrations/supabase/client";

export interface MotionClick {
  x: number; // normalized 0-1 within the tracked container
  y: number; // normalized 0-1 within the tracked container
  t: number; // ms since trial start
  box_id: string; // identifier of clicked element (e.g. option id, "yes"/"no", etc.)
  target?: string; // optional label of the target/question
  selected?: string; // optional label of selected option
  correct: boolean; // was this the correct answer / a legal click
}

/**
 * Compute normalized 0-1 coordinates of a click within a container element.
 */
export function normalizeClickCoords(
  e: { clientX: number; clientY: number },
  container: HTMLElement | null,
): { x: number; y: number } {
  if (!container) return { x: 0, y: 0 };
  const rect = container.getBoundingClientRect();
  const x = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0;
  const y = rect.height > 0 ? (e.clientY - rect.top) / rect.height : 0;
  return {
    x: Math.max(0, Math.min(1, Math.round(x * 10000) / 10000)),
    y: Math.max(0, Math.min(1, Math.round(y * 10000) / 10000)),
  };
}

/**
 * Trial number ranges per stage (keeps PKs unique across stages):
 *  - puzzle:      1, 2, 3
 *  - short_term:  11, 12, 13
 *  - reordering:  21
 *  - long_term:   31, 32, 33, 34
 *  - aq:          41
 */
export async function saveMotionTrial(params: {
  trialNumber: number;
  clicks: MotionClick[];
}): Promise<void> {
  const { trialNumber, clicks } = params;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email;
    if (!email) {
      console.warn("[motionTracking] No authenticated user; skipping save.");
      return;
    }

    const { count } = await supabase
      .from("click_motion_tracking")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .eq("trial_number", trialNumber);

    const attempt = (count ?? 0) + 1;
    const id = attempt === 1 ? `${email}${trialNumber}` : `${email}${trialNumber}_${attempt}`;

    const click_coordinates = clicks.map((c) => ({
      x: c.x,
      y: c.y,
      t: c.t,
      box: c.box_id,
      ...(c.target ? { target: c.target } : {}),
      ...(c.selected ? { selected: c.selected } : {}),
    }));
    const correctness_sequence = clicks.map((c) => (c.correct ? 1 : 0));
    const box_ids = clicks.map((c) => c.box_id);

    const { error } = await supabase.from("click_motion_tracking").insert({
      id,
      email,
      trial_number: trialNumber,
      click_coordinates,
      correctness_sequence,
      box_ids,
      total_clicks: clicks.length,
    } as any);

    if (error) console.error("[motionTracking] insert error:", error);
    else console.log(`[motionTracking] Saved trial ${trialNumber} (${clicks.length} clicks)`);
  } catch (e) {
    console.error("[motionTracking] save failed:", e);
  }
}
