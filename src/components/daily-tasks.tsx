"use client"

import { Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface Task {
    id: string
    title: string
    completed: boolean
}

interface DailyTasksProps {
    tasks: Task[]
    onToggle: (id: string) => void
}

export function DailyTasks({ tasks, onToggle }: DailyTasksProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold tracking-tight">Today's Tasks</h2>
            </div>

            <AnimatePresence>
                {tasks.length === 0 && (
                    <div className="text-center text-muted-foreground py-10">
                        No tasks yet. Add one to get started!
                    </div>
                )}
                {tasks.map((task) => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        layout
                    >
                        <Card
                            className={cn(
                                "p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 border-0 shadow-sm",
                                task.completed ? "bg-gray-50 dark:bg-neutral-900/50 opacity-60" : "bg-gray-50 dark:bg-neutral-700/30 hover:bg-gray-100 dark:hover:bg-neutral-700/50"
                            )}
                            onClick={() => onToggle(task.id)}
                        >
                            <div className={cn(
                                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                task.completed ? "bg-green-500 border-green-500 text-white" : "border-gray-300 dark:border-neutral-600"
                            )}>
                                {task.completed && <Check className="h-3 w-3" />}
                            </div>
                            <span className={cn(
                                "flex-1 font-medium transition-all",
                                task.completed && "line-through text-muted-foreground"
                            )}>
                                {task.title}
                            </span>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
