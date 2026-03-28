export interface ClipConfig {
  label: string;
  src: string;
  id: string;
}

export const GAME_CLIPS: Record<string, ClipConfig> = {
  fasla: { label: "Fasla", src: "/videos/fasla.mp4", id: "v1" },
  sixEight: { label: "6 8", src: "/videos/6-8.mp4", id: "v2" },
  money: { label: "Money", src: "/videos/money.mp4", id: "v3" },
  marshmallow: { label: "Marshmallow", src: "/videos/marshmallow.mp4", id: "v4" },
};

export const DISTRACTOR_CLIPS: ClipConfig[] = [
  { label: "Clip A", src: "/videos/distractor-1.mp4", id: "d1" },
  { label: "Clip B", src: "/videos/distractor-2.mp4", id: "d2" },
  { label: "Clip C", src: "/videos/distractor-3.mp4", id: "d3" },
];

export const CLIP_ORDER = ["fasla", "sixEight", "money", "marshmallow"] as const;
export const REPS_PER_CLIP = 3;

/** Audio files per clip for the short-term memory intro */
export const CLIP_AUDIO: Record<string, string> = {
  fasla: "/audio/stage2-fasla.mp3",
  sixEight: "/audio/stage2-6-8.mp3",
  money: "/audio/stage2-money.mp3",
  marshmallow: "/audio/stage2-marshmallow.mp3",
};

export const SIX_EIGHT_SEGMENTS = [
  { id: 1, src: "/segments/6-8-1.jpg" },
  { id: 2, src: "/segments/6-8-2.jpg" },
  { id: 3, src: "/segments/6-8-3.jpg" },
  { id: 4, src: "/segments/6-8-4.jpg" },
  { id: 5, src: "/segments/6-8-5.jpg" },
  { id: 6, src: "/segments/6-8-6.jpg" },
];
