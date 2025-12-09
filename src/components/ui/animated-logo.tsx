"use client"

import { motion } from "framer-motion"
import { useMusic } from "@/providers/music-provider"

export function AnimatedLogo() {
    const { themeColor } = useMusic()
    const color = themeColor || "#EDFD6D"

    const draw = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: (i: number) => {
            const delay = 1 + i * 0.5
            return {
                pathLength: 1,
                opacity: 1,
                transition: {
                    pathLength: { delay, duration: 1.5, bounce: 0 },
                    opacity: { delay, duration: 0.01 }
                }
            }
        }
    }

    return (
        <motion.svg
            width="60"
            height="60"
            viewBox="0 0 600 600"
            initial="hidden"
            animate="visible"
            className="w-full h-full"
        >
            <motion.circle
                cx="300"
                cy="300"
                r="180"
                stroke={color}
                variants={draw}
                custom={1}
                className="stroke-[20px] fill-transparent"
                style={{ strokeLinecap: "round" }}
            />
            <motion.path
                d="M200 300 L400 300"
                stroke={color}
                variants={draw}
                custom={2}
                className="stroke-[20px] fill-transparent"
                style={{ strokeLinecap: "round" }}
            />
            <motion.path
                d="M300 200 L300 400"
                stroke={color}
                variants={draw}
                custom={2.5}
                className="stroke-[20px] fill-transparent"
                style={{ strokeLinecap: "round" }}
            />
        </motion.svg>
    )
}
