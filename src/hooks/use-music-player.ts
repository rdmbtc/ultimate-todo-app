"use client"

import { useState, useEffect } from "react"

export interface MediaInfo {
    title: string
    artist: string
    album_artist: string
    album_title: string
    thumbnail: string | null
    color: string | null
    status: number // 4=Playing, 5=Paused
    position: number
    duration: number
}

export function useMusicPlayer() {
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

    return { media, isConnected, sendCommand }
}
