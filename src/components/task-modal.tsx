"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, Flag, Image as ImageIcon, Check, Loader2, Trash2, Plus, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Task } from "@/lib/google-sheets"

interface TaskModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (task: Partial<Task>) => Promise<void>
    onDelete?: (id: string) => Promise<void>
    initialData?: Partial<Task>
}

export function TaskModal({ isOpen, onClose, onSave, onDelete, initialData }: TaskModalProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>("medium")
    const [progress, setProgress] = useState(0)
    const [images, setImages] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Image Modal State
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [newImageUrl, setNewImageUrl] = useState("")

    // Lightbox State
    const [lightboxImage, setLightboxImage] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && initialData) {
            setTitle(initialData.title || "")
            setDescription(initialData.description || "")
            setDueDate(initialData.dueDate || "")
            setPriority(initialData.priority || "medium")
            setProgress(initialData.progress || 0)
            setImages(initialData.images || [])
        } else if (isOpen) {
            // Reset form on open if no initial data
            setTitle("")
            setDescription("")
            setDueDate("")
            setPriority("medium")
            setProgress(0)
            setImages([])
        }
    }, [isOpen, initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        setIsSubmitting(true)
        try {
            await onSave({
                title,
                description,
                dueDate,
                priority,
                progress,
                images
            })
            onClose()
        } catch (error) {
            console.error("Failed to save task", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!initialData?.id || !onDelete) return
        if (!confirm("Are you sure you want to delete this task?")) return

        setIsDeleting(true)
        try {
            await onDelete(initialData.id)
            onClose()
        } catch (error) {
            console.error("Failed to delete task", error)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleAddImage = () => {
        if (newImageUrl.trim()) {
            setImages([...images, newImageUrl.trim()])
            setNewImageUrl("")
            setIsImageModalOpen(false)
        }
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
    }

    const priorities = [
        { value: 'low', label: 'Low', color: 'bg-blue-500' },
        { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
        { value: 'high', label: 'High', color: 'bg-red-500' },
    ]

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-6 z-50 border border-gray-100 dark:border-neutral-800 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold tracking-tight">
                                {initialData ? "Edit Task" : "New Task"}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="What needs to be done?"
                                    className="text-lg font-medium border-0 border-b border-gray-200 dark:border-neutral-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors bg-transparent"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add details..."
                                    className="resize-none min-h-[100px] bg-gray-50 dark:bg-neutral-800/50 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-gray-200 dark:focus-visible:ring-neutral-700"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> Due Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="bg-gray-50 dark:bg-neutral-800/50 border-0 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Flag className="h-4 w-4" /> Priority
                                    </label>
                                    <div className="flex gap-1 bg-gray-50 dark:bg-neutral-800/50 p-1 rounded-xl">
                                        {priorities.map((p) => (
                                            <button
                                                key={p.value}
                                                type="button"
                                                onClick={() => setPriority(p.value as any)}
                                                className={cn(
                                                    "flex-1 text-xs font-medium py-2 rounded-lg transition-all flex items-center justify-center gap-1.5",
                                                    priority === p.value
                                                        ? "bg-white dark:bg-neutral-700 shadow-sm text-black dark:text-white"
                                                        : "text-muted-foreground hover:bg-gray-200 dark:hover:bg-neutral-700/50"
                                                )}
                                            >
                                                <div className={cn("w-2 h-2 rounded-full", p.color)} />
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-muted-foreground">Progress</span>
                                    <span className="font-bold">{progress}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="10"
                                    value={progress}
                                    onChange={(e) => setProgress(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-100 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                                />
                            </div>

                            {/* Images Section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4" /> Images
                                    </label>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsImageModalOpen(true)} className="h-8 text-xs gap-1">
                                        <Plus className="h-3 w-3" /> Add Image
                                    </Button>
                                </div>

                                {images.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative aspect-square group rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-800">
                                                <img src={img} alt="Task attachment" className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform" onClick={() => setLightboxImage(img)} />
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={!title.trim() || isSubmitting}
                                    className="flex-1 rounded-full h-12 text-base font-medium bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-lg shadow-black/5"
                                >
                                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Task"}
                                </Button>
                                {initialData?.id && onDelete && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleDelete}
                                        className="rounded-full h-12 w-12 p-0 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-900/30 dark:hover:bg-red-900/20"
                                        title="Delete Task"
                                    >
                                        {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </motion.div>

                    {/* Add Image Modal */}
                    <AnimatePresence>
                        {isImageModalOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                            >
                                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsImageModalOpen(false)} />
                                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-sm relative shadow-xl border border-gray-100 dark:border-neutral-800">
                                    <h3 className="text-lg font-semibold mb-4">Add Image URL</h3>
                                    <div className="space-y-4">
                                        <Input
                                            value={newImageUrl}
                                            onChange={(e) => setNewImageUrl(e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            autoFocus
                                        />
                                        {newImageUrl && (
                                            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-800">
                                                <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                            </div>
                                        )}
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" onClick={() => setIsImageModalOpen(false)}>Cancel</Button>
                                            <Button onClick={handleAddImage} disabled={!newImageUrl}>Add</Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Lightbox */}
                    <AnimatePresence>
                        {lightboxImage && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
                                onClick={() => setLightboxImage(null)}
                            >
                                <motion.img
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0.9 }}
                                    src={lightboxImage}
                                    alt="Full size"
                                    className="max-w-full max-h-full rounded-lg shadow-2xl"
                                />
                                <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2">
                                    <X className="h-8 w-8" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    )
}
