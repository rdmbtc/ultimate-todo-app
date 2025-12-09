"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

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

interface MusicContextType {
    media: MediaInfo | null
    isConnected: boolean
    sendCommand: (command: string) => Promise<void>
    themeColor: string | null
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

export function MusicProvider({ children }: { children: ReactNode }) {
    const [media, setMedia] = useState<MediaInfo | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [themeColor, setThemeColor] = useState<string | null>(null)

    const fetchMedia = async () => {
        try {
            const res = await fetch('http://localhost:5000/current-media')
            if (res.ok) {
                const data = await res.json()
                setMedia(data)
                setIsConnected(true)
                if (data.color) {
                    setThemeColor(data.color)
                }
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

    return (
        <MusicContext.Provider value={{ media, isConnected, sendCommand, themeColor }}>
            {children}
        </MusicContext.Provider>
    )
}

export function useMusic() {
    const context = useContext(MusicContext)
    if (context === undefined) {
        throw new Error("useMusic must be used within a MusicProvider")
    }
    return context
}
