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
