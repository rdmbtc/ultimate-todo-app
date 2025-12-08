"use client"

import { Home, CheckSquare, BarChart2, Settings, LogOut, MessageSquare, Compass, Star, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
    { icon: Home, label: "Home", active: true },
    { icon: MessageSquare, label: "Messages", active: false },
    { icon: Compass, label: "Explore", active: false },
    { icon: Star, label: "Favorites", active: false },
]

export function Sidebar() {
    return (
        <aside className="w-16 lg:w-20 bg-gray-100 dark:bg-neutral-900 flex flex-col items-center py-6 gap-6 z-50 sticky top-0 h-screen shrink-0">
            <div className="h-10 w-10 rounded-full bg-[#EDFD6D] flex items-center justify-center text-black font-bold text-lg shadow-sm">
                U
            </div>

            <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                {navItems.map((item, index) => (
                    <Button
                        key={index}
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "w-full h-12 rounded-2xl transition-all duration-300",
                            item.active
                                ? "bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm"
                                : "text-muted-foreground hover:bg-white/50 dark:hover:bg-neutral-800"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="sr-only">{item.label}</span>
                    </Button>
                ))}

                <div className="my-auto" />

                <div className="w-full h-px bg-gray-200 dark:bg-neutral-800" />

                <Button variant="ghost" size="icon" className="w-full h-12 rounded-2xl text-muted-foreground hover:bg-white/50">
                    <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="w-full h-12 rounded-2xl text-muted-foreground hover:bg-white/50">
                    <Settings className="h-5 w-5" />
                </Button>
            </nav>
        </aside>
    )
}
