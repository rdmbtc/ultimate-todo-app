import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CalendarEvent } from "@/lib/google-calendar"

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true)
            try {
                const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
                const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

                const res = await fetch(`/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`)
                const data = await res.json()
                setEvents(data)
            } catch (error) {
                console.error("Failed to fetch calendar events", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchEvents()
    }, [currentDate])

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const firstDayOfMonth = new Date(year, month, 1).getDay() // 0 = Sunday

        const days = []

        // Add empty slots for days before the 1st
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null)
        }

        // Add actual days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i)
        }

        return days
    }

    const days = getDaysInMonth(currentDate)
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

    const getEventsForDay = (day: number) => {
        if (!day) return []
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0]
        return events.filter(e => e.start.startsWith(dateStr))
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2">Calendar</h2>
                    <p className="text-muted-foreground">Schedule and upcoming events.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-full"><ChevronLeft className="h-4 w-4" /></Button>
                    <span className="font-medium text-lg min-w-[160px] text-center">{monthName}</span>
                    <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-full"><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm p-8">
                <div className="grid grid-cols-7 gap-4 mb-4 text-center text-sm font-medium text-muted-foreground">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-4">
                    {isLoading ? (
                        <div className="col-span-7 flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        days.map((day, i) => (
                            <div key={i} className={`min-h-[100px] p-3 rounded-2xl border border-gray-100 dark:border-neutral-800 transition-colors flex flex-col gap-2 group ${day ? 'hover:bg-gray-50 dark:hover:bg-neutral-800/50 cursor-pointer' : 'opacity-0 pointer-events-none'}`}>
                                {day && (
                                    <>
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">{day}</span>
                                            {getEventsForDay(day).length > 0 && <div className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {getEventsForDay(day).map((event, j) => (
                                                <div key={j} className={`text-[10px] px-2 py-1 rounded-md text-white truncate ${event.color || 'bg-blue-500'}`}>
                                                    {event.title}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
