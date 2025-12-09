import { Check, Clock, AlertCircle, Image as ImageIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Task } from "@/lib/google-sheets"

interface DailyTasksProps {
    tasks: Task[]
    onToggle: (id: string) => void
    onEdit?: (task: Task) => void
}

export function DailyTasks({ tasks, onToggle, onEdit }: DailyTasksProps) {
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
                                "relative overflow-hidden p-0 cursor-pointer transition-all duration-300 border-0 shadow-sm group min-h-[5rem]",
                                task.completed ? "opacity-60" : "hover:shadow-md"
                            )}
                            onClick={() => onEdit ? onEdit(task) : onToggle(task.id)}
                        >
                            {/* Background Image & Overlay */}
                            {task.images && task.images.length > 0 ? (
                                <>
                                    <div className="absolute inset-0 z-0">
                                        <img
                                            src={task.images[0]}
                                            alt="Background"
                                            className="w-full h-full object-cover opacity-40 dark:opacity-30 blur-[2px] scale-110"
                                        />
                                    </div>
                                    <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent dark:from-black/95 dark:via-black/80 dark:to-transparent" />
                                </>
                            ) : (
                                <div className={cn(
                                    "absolute inset-0 z-0",
                                    task.completed ? "bg-gray-50 dark:bg-neutral-900/50" : "bg-gray-50 dark:bg-neutral-700/30 group-hover:bg-gray-100 dark:group-hover:bg-neutral-700/50"
                                )} />
                            )}

                            <div className="relative z-10 p-4 flex items-center gap-4">
                                <div
                                    className={cn(
                                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                                        task.completed ? "bg-green-500 border-green-500 text-white" : "border-gray-300 dark:border-neutral-600 bg-white/50 dark:bg-black/50"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggle(task.id);
                                    }}
                                >
                                    {task.completed && <Check className="h-3 w-3" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "font-medium transition-all truncate",
                                            task.completed && "line-through text-muted-foreground"
                                        )}>
                                            {task.title}
                                        </span>
                                        {task.priority === 'high' && (
                                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="High Priority" />
                                        )}
                                    </div>
                                    {(task.description || task.dueDate || (task.progress !== undefined && task.progress > 0) || (task.images && task.images.length > 0)) && (
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                            {task.dueDate && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {task.dueDate}
                                                </span>
                                            )}
                                            {task.progress !== undefined && task.progress > 0 && task.progress < 100 && (
                                                <span className="flex items-center gap-1">
                                                    <div className="w-12 h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500" style={{ width: `${task.progress}%` }} />
                                                    </div>
                                                </span>
                                            )}
                                            {task.images && task.images.length > 0 && (
                                                <span className="flex items-center gap-1 text-blue-500 font-medium">
                                                    <ImageIcon className="h-3 w-3" />
                                                    {task.images.length}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
