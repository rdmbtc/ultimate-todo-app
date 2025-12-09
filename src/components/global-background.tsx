"use client"

import { useMusic } from "@/providers/music-provider"

export function GlobalBackground() {
    const { themeColor } = useMusic()
    const color = themeColor || '#EDFD6D'

    return (
        <>
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Base Tint */}
                <div
                    className="absolute inset-0 transition-colors duration-1000 opacity-5 mix-blend-color"
                    style={{ backgroundColor: color }}
                />

                {/* Animated Blobs */}
                <div
                    className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 animate-[spin_20s_linear_infinite] transition-colors duration-1000"
                    style={{ backgroundColor: color }}
                />
                <div
                    className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-10 animate-[pulse_10s_ease-in-out_infinite] transition-colors duration-1000"
                    style={{ backgroundColor: color }}
                />
                <div
                    className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full blur-[140px] opacity-10 animate-[bounce_15s_infinite] transition-colors duration-1000"
                    style={{ backgroundColor: color }}
                />
            </div>
            <style jsx global>{`
                ::selection {
                    background-color: ${color};
                    color: black;
                }
            `}</style>
        </>
    )
}
