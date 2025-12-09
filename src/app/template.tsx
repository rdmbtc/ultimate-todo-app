"use client"

import { motion } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { useRef, useEffect } from "react"

const routes = ['/', '/analytics', '/team', '/projects', '/pages', '/settings']

export default function Template({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const containerRef = useRef<HTMLDivElement>(null)
    const isNavigating = useRef(false)

    useEffect(() => {
        isNavigating.current = false
    }, [pathname])

    const checkAndNavigate = (element: HTMLDivElement) => {
        if (isNavigating.current) return

        const { scrollTop, scrollHeight, clientHeight } = element
        // Trigger when close to bottom (within 5px)
        const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 5

        if (isBottom) {
            const currentIndex = routes.indexOf(pathname)
            if (currentIndex !== -1 && currentIndex < routes.length - 1) {
                isNavigating.current = true
                router.push(routes[currentIndex + 1])
            }
        }
    }

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        checkAndNavigate(e.currentTarget)
    }

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (isNavigating.current) return

        const { scrollTop } = e.currentTarget

        // Scroll Up
        if (e.deltaY < 0 && scrollTop === 0) {
            const currentIndex = routes.indexOf(pathname)
            if (currentIndex > 0) {
                isNavigating.current = true
                router.push(routes[currentIndex - 1])
            }
        }

        // Scroll Down
        if (e.deltaY > 0) {
            checkAndNavigate(e.currentTarget)
        }
    }

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
            className="flex-1 h-full flex flex-col overflow-y-auto overflow-x-hidden scroll-smooth"
            onScroll={handleScroll}
            onWheel={handleWheel}
        >
            {children}
        </motion.div>
    )
}
