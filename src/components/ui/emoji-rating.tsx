"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface RatingInteractionProps {
  onChange?: (rating: number) => void
  className?: string
}

const ratingData = [
  { emoji: "😔", label: "Terrible", color: "from-red-400 to-red-500", shadowColor: "shadow-red-500/30" },
  { emoji: "😕", label: "Poor", color: "from-orange-400 to-orange-500", shadowColor: "shadow-orange-500/30" },
  { emoji: "😐", label: "Okay", color: "from-yellow-400 to-yellow-500", shadowColor: "shadow-yellow-500/30" },
  { emoji: "🙂", label: "Good", color: "from-lime-400 to-lime-500", shadowColor: "shadow-lime-500/30" },
  { emoji: "😍", label: "Amazing", color: "from-emerald-400 to-emerald-500", shadowColor: "shadow-emerald-500/30" },
]

export function RatingInteraction({ onChange, className }: RatingInteractionProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)

  const handleClick = (value: number) => {
    setRating(value)
    onChange?.(value)
  }

  const displayRating = hoverRating || rating
  const activeData = displayRating > 0 ? ratingData[displayRating - 1] : null

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {/* Emoji rating buttons */}
      <div className="flex items-center gap-2">
        {ratingData.map((item, i) => {
          const value = i + 1
          const isActive = value <= displayRating
          const isExact = value === displayRating

          return (
            <button
              key={value}
              type="button"
              onClick={() => handleClick(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              className="group relative focus:outline-none"
              aria-label={`Rate ${value}: ${item.label}`}
            >
              <div
                className={cn(
                  "relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ease-out",
                  isExact
                    ? `bg-gradient-to-b ${item.color} shadow-lg ${item.shadowColor} scale-110`
                    : isActive
                    ? "bg-muted/60 scale-100"
                    : "bg-muted/30 scale-100 hover:bg-muted/50 hover:scale-105"
                )}
              >
                {/* Emoji with smooth grayscale transition */}
                <span
                  className={cn(
                    "text-3xl transition-all duration-300",
                    isActive ? "grayscale-0 opacity-100" : "grayscale opacity-50"
                  )}
                >
                  {item.emoji}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="relative h-8 flex items-center justify-center">
        {/* Default "Rate us" text */}
        <span
          className={cn(
            "absolute text-sm font-medium text-muted-foreground transition-all duration-300",
            displayRating > 0 ? "opacity-0 blur-md scale-95" : "opacity-100 blur-0 scale-100",
          )}
        >
          Rate us
        </span>

        {/* Rating labels with blur in/out effect */}
        {ratingData.map((item, i) => (
          <span
            key={i}
            className={cn(
              "absolute text-sm font-semibold transition-all duration-300",
              displayRating === i + 1
                ? "opacity-100 blur-0 scale-100 text-foreground"
                : "opacity-0 blur-md scale-95"
            )}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
