"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const emojis = [
    { icon: "😡", label: "Angry", color: "bg-red-500/20 text-red-500" },
    { icon: "😔", label: "Sad", color: "bg-blue-500/20 text-blue-500" },
    { icon: "😐", label: "Neutral", color: "bg-gray-500/20 text-gray-500" },
    { icon: "🙂", label: "Good", color: "bg-green-500/20 text-green-500" },
    { icon: "🤩", label: "Amazing", color: "bg-yellow-500/20 text-yellow-500" },
]

interface EmojiTrackerProps {
    compact?: boolean;
}

export function EmojiTracker({ compact = false }: EmojiTrackerProps) {
    const [selected, setSelected] = useState<number | null>(null)

    return (
        <div className={cn("w-full", compact ? "p-0" : "p-4")}>
            {!compact && <h3 className="text-lg font-medium mb-4 text-muted-foreground">How are you feeling today?</h3>}
            <div className={cn("flex justify-between items-center gap-1", compact ? "gap-1" : "gap-2")}>
                {emojis.map((emoji, index) => (
                    <motion.button
                        key={index}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelected(index)}
                        className={cn(
                            "rounded-full transition-all duration-300 flex flex-col items-center justify-center",
                            compact ? "w-8 h-8 p-0" : "p-4 w-16 h-16 glass hover:bg-white/10",
                            selected === index ? emoji.color + " ring-2 ring-offset-2 ring-offset-background ring-current scale-110" : "opacity-50 hover:opacity-100 grayscale hover:grayscale-0"
                        )}
                    >
                        <span className={cn(compact ? "text-lg" : "text-3xl")}>{emoji.icon}</span>
                        {!compact && <span className="text-xs font-medium mt-1">{emoji.label}</span>}
                    </motion.button>
                ))}
            </div>
        </div>
    )
}
