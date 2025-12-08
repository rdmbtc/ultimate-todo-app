"use client"

import { useState, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Music } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface MediaInfo {
    title: string
    artist: string
    album_artist: string
    album_title: string
    thumbnail: string | null
    status: number // 4=Playing, 5=Paused
    position: number
    duration: number
}

export function MusicPlayer() {
    const [media, setMedia] = useState<MediaInfo | null>(null)
    const [isConnected, setIsConnected] = useState(false)

    const fetchMedia = async () => {
        try {
            const res = await fetch('http://localhost:5000/current-media')
            if (res.ok) {
                const data = await res.json()
                setMedia(data)
                setIsConnected(true)
            } else {
                setIsConnected(false)
            }
        } catch (e) {
            setIsConnected(false)
        }
    }

    const sendCommand = async (command: string) => {
        try {
            await fetch('http://localhost:5000/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command }),
            })
            fetchMedia() // Refresh immediately
        } catch (e) {
            console.error("Failed to send command", e)
        }
    }

    useEffect(() => {
        fetchMedia()
        const interval = setInterval(fetchMedia, 1000)
        return () => clearInterval(interval)
    }, [])

    const isPlaying = media?.status === 4
    const progressPercent = media && media.duration > 0 ? (media.position / media.duration) * 100 : 0

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (!isConnected) {
        return (
            <div className="bg-neutral-900 text-white rounded-[2rem] p-8 flex flex-col items-center justify-center shadow-xl h-full min-h-[240px] text-center gap-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-black opacity-50" />
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center animate-pulse z-10 border border-white/10">
                    <Music className="h-8 w-8 text-white/30" />
                </div>
                <div className="z-10">
                    <h3 className="font-medium text-lg">Bridge Disconnected</h3>
                    <p className="text-sm text-white/40 mt-1">Run <code className="bg-white/10 px-1 rounded">python media_server.py</code></p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-black text-white rounded-[2rem] p-0 flex flex-col justify-between shadow-2xl h-full relative overflow-hidden group min-h-[240px]">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                {media?.thumbnail && (
                    <img
                        src={media.thumbnail}
                        alt="Background"
                        className="w-full h-full object-cover opacity-40 blur-3xl scale-150 saturate-150"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
            </div>

            <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                <div className="flex items-start gap-5">
                    {/* Album Art */}
                    <motion.div
                        className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 bg-neutral-900"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        {media?.thumbnail ? (
                            <img
                                src={media.thumbnail}
                                alt="Album Art"
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                                <Music className="h-10 w-10 text-white/20" />
                            </div>
                        )}
                    </motion.div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0 pt-1">
                        <motion.h3
                            className="font-bold text-xl leading-tight truncate text-white"
                            key={media?.title}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {media?.title || "No Media"}
                        </motion.h3>
                        <p className="text-sm text-white/70 font-medium mt-1 truncate">{media?.artist || "Unknown Artist"}</p>
                        <p className="text-xs text-white/40 mt-1 uppercase tracking-wider truncate">{media?.album_title || ""}</p>
                    </div>
                </div>

                {/* Controls & Progress */}
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <button onClick={() => sendCommand('prev')} className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                            <SkipBack className="h-6 w-6 fill-current" />
                        </button>

                        <motion.button
                            onClick={() => sendCommand(isPlaying ? 'pause' : 'play')}
                            className="w-14 h-14 rounded-full bg-white text-black hover:scale-105 flex items-center justify-center transition-all shadow-lg shadow-white/10"
                            whileTap={{ scale: 0.95 }}
                        >
                            {isPlaying ? (
                                <Pause className="h-6 w-6 fill-current" />
                            ) : (
                                <Play className="h-6 w-6 fill-current ml-1" />
                            )}
                        </motion.button>

                        <button onClick={() => sendCommand('next')} className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                            <SkipForward className="h-6 w-6 fill-current" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2 group/progress">
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden cursor-pointer">
                            <motion.div
                                className="h-full bg-[#EDFD6D] rounded-full shadow-[0_0_10px_rgba(237,253,109,0.5)]"
                                initial={{ width: "0%" }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ ease: "linear", duration: 0.5 }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-white/40 font-medium font-mono px-1 opacity-0 group-hover/progress:opacity-100 transition-opacity">
                            <span>{formatTime(media?.position || 0)}</span>
                            <span>{formatTime(media?.duration || 0)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
