"use client"

import { Home, BarChart2, Users, Settings, LogOut, Layers, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMusic } from "@/providers/music-provider"

export function Sidebar() {
    const pathname = usePathname()
    const { themeColor } = useMusic()

    const navItems = [
        { id: "home", href: "/", icon: Home, label: "Home" },
        { id: "analytics", href: "/analytics", icon: BarChart2, label: "Analytics" },
        { id: "team", href: "/team", icon: Users, label: "Team" },
        { id: "projects", href: "/projects", icon: Layers, label: "Projects" },
        { id: "pages", href: "/pages", icon: FileText, label: "Pages" },
        { id: "settings", href: "/settings", icon: Settings, label: "Settings" },
    ]

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/"
        return pathname.startsWith(href)
    }

    return (
        <aside className="h-screen sticky top-0 w-20 flex flex-col items-center py-8 bg-white dark:bg-neutral-900 border-r border-gray-100 dark:border-neutral-800 shrink-0 z-40 transition-colors duration-500">
            <div className="mb-10">
                <div
                    className="h-10 w-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xl transition-colors duration-500"
                    style={themeColor ? { backgroundColor: themeColor } : undefined}
                >
                    U
                </div>
            </div>

            <nav className="flex-1 flex flex-col gap-4 w-full px-4">
                {navItems.map((item) => {
                    const active = isActive(item.href)
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                                "p-3 rounded-xl transition-all duration-300 group relative flex items-center justify-center",
                                active
                                    ? "text-white shadow-lg"
                                    : "text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white"
                            )}
                            style={active ? { backgroundColor: themeColor || '#000' } : undefined}
                        >
                            <item.icon className={cn("h-5 w-5", active && "animate-pulse")} />

                            {/* Tooltip */}
                            <span className="absolute left-14 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>

            <button className="p-3 text-gray-400 hover:text-red-500 transition-colors mt-auto">
                <LogOut className="h-5 w-5" />
            </button>
        </aside>
    )
}
