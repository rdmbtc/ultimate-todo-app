"use client"

import { useState, useEffect, useRef } from "react";
import { Map, Plus, Command, Settings2, LayoutGrid, Folder, Calendar as CalendarIcon, PieChart, Play, Pause, SkipBack, SkipForward, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMusic } from "@/providers/music-provider";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { DailyTasks } from "@/components/daily-tasks";
import { Task } from "@/lib/google-sheets";
import { TaskModal } from "@/components/task-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { ModeToggle } from "@/components/mode-toggle";

import { ProjectsView } from "@/components/home/projects-view";
import { ReportsView } from "@/components/home/reports-view";
import { CalendarView } from "@/components/home/calendar-view";
import { PagesView } from "@/components/home/pages-view";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("overview");
  const [mood, setMood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { media, sendCommand, themeColor } = useMusic();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  useEffect(() => {
    // Simulate network delay for skeleton demo
    setTimeout(() => {
      fetch('/api/tasks')
        .then(res => res.json())
        .then(data => {
          setTasks(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch tasks:', err);
          setIsLoading(false);
        });
    }, 1500);
  }, []);

  const handleSaveTask = async (taskData: Partial<Task>) => {
    const tempId = editingTask?.id || Date.now().toString();
    try {
      // Optimistic update
      const optimisicTask = { ...taskData, id: tempId, completed: editingTask?.completed || false } as Task;

      if (editingTask && editingTask.id) {
        setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t));
      } else {
        setTasks(prev => [...prev, optimisicTask]);
      }

      const payload = { ...taskData };
      if (editingTask?.id) {
        payload.id = editingTask.id;
      }

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save task');
      }

      // Replace optimistic task with real one
      if (!editingTask) {
        setTasks(prev => prev.map(t => t.id === tempId ? data : t));
      }

      setIsModalOpen(false);
      setEditingTask(undefined);
    } catch (err) {
      console.error('Failed to save task:', err);
      // Revert optimistic update on error
      if (!editingTask) {
        setTasks(prev => prev.filter(t => t.id !== tempId));
      } else {
        // Ideally we should revert to the previous state of the task, 
        // but for now we just don't do anything or could refetch.
        // A simple way is to alert.
      }
      alert("Failed to save task. Please check your connection or credentials.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      // Optimistic update
      setTasks(tasks.filter(t => t.id !== id));

      await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const openNewTaskModal = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "projects", label: "Projects", icon: Folder },
    { id: "calendar", label: "Calendar", icon: CalendarIcon },
    { id: "reports", label: "Reports", icon: PieChart },
    { id: "pages", label: "Pages", icon: FileText },
  ];

  const isPlaying = media?.status === 4;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <main className="flex-1 p-4 lg:p-6 flex flex-col gap-8 relative z-10">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-2 rounded-full shadow-sm sticky top-0 z-50 border border-white/20 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-neutral-800 rounded-full">
            <span className="font-medium text-sm">My Workspace</span>
            <button className="hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full p-1 transition-colors">
              <span className="sr-only">Close</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <Button variant="ghost" className="rounded-full gap-2 text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4" />
            New Page
          </Button>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground text-sm px-4">
          <span className="flex items-center gap-1 border border-gray-200 dark:border-neutral-800 px-2 py-1 rounded-md bg-gray-50 dark:bg-neutral-900"><Command className="h-3 w-3" /> K</span>
        </div>
      </header>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative h-[28rem] rounded-[2.5rem] overflow-hidden group shrink-0 shadow-2xl shadow-blue-900/10 transition-all duration-1000"
        style={themeColor ? { boxShadow: `0 25px 50px -12px ${themeColor}40` } : undefined}
      >
        {/* Dynamic Background with Parallax */}
        <motion.div
          className="absolute inset-0 transition-all duration-1000 z-0"
          style={{ y, opacity }}
        >
          {media?.thumbnail ? (
            <img
              src={media.thumbnail}
              alt="Background"
              className="w-full h-full object-cover transition-all duration-1000 scale-110 blur-xl opacity-80"
            />
          ) : (
            <img
              src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2070&auto=format&fit=crop"
              alt="Scenic View"
              className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            />
          )}
          {/* Gradient Overlay for Text Readability */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/10 transition-all duration-1000"
            style={themeColor ? { background: `linear-gradient(to top, #000000 0%, ${themeColor}20 50%, #00000040 100%)` } : undefined}
          />
        </motion.div>

        <div className="absolute inset-0 p-10 flex flex-col justify-between text-white z-10">

          {/* Top Row */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-lg">
                <Map className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium tracking-wide text-sm uppercase opacity-80">Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12">
                <AnimatedLogo />
              </div>
              <ModeToggle />
            </div>
          </div>

          {/* Middle Content: Greeting (Always Visible) */}
          <motion.div
            className="flex flex-col gap-2 mt-10"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.h1 variants={item} className="text-6xl font-medium mb-4 tracking-tight drop-shadow-lg">
              Good Morning, User
            </motion.h1>
            <motion.p variants={item} className="max-w-md text-white/80 text-lg font-light leading-relaxed drop-shadow-md">
              Ready to conquer the day? You have {tasks.length - completedCount} pending tasks.
            </motion.p>
          </motion.div>

          {/* Bottom Controls */}
          <div className="flex items-end justify-between">
            {/* Tabs */}
            <div className="flex gap-1 bg-black/30 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-xl">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 flex items-center gap-2",
                    activeTab === tab.id
                      ? "bg-white text-black shadow-md"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Music Controls (Compact Widget) */}
            <AnimatePresence>
              {media?.title && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="flex items-center gap-4 bg-black/40 backdrop-blur-2xl p-3 pr-6 rounded-full border border-white/10 shadow-2xl max-w-md"
                >
                  {/* Mini Album Art */}
                  {media.thumbnail && (
                    <img src={media.thumbnail} className="w-12 h-12 rounded-full object-cover border border-white/20 animate-[spin_8s_linear_infinite]" style={{ animationPlayState: isPlaying ? 'running' : 'paused' }} />
                  )}

                  {/* Info */}
                  <div className="flex flex-col min-w-[100px]">
                    <span className="text-sm font-bold truncate max-w-[160px]">{media.title}</span>
                    <span className="text-xs text-white/70 truncate max-w-[160px]">{media.artist}</span>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 ml-2">
                    <button onClick={() => sendCommand('prev')} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white">
                      <SkipBack className="h-4 w-4 fill-current" />
                    </button>
                    <button
                      onClick={() => sendCommand(isPlaying ? 'pause' : 'play')}
                      className="p-2 bg-white text-black rounded-full hover:scale-105 transition-transform shadow-lg"
                    >
                      {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                    </button>
                    <button onClick={() => sendCommand('next')} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white">
                      <SkipForward className="h-4 w-4 fill-current" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="pb-10">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Column 1: Assistant / Add Task (Yellow Card) */}
            <div className="md:col-span-1 lg:col-span-1 row-span-2 relative h-full min-h-[320px]">
              <div
                className="absolute inset-0 bg-[#EDFD6D] rounded-[2.5rem] p-8 flex flex-col justify-between text-black shadow-xl shadow-yellow-400/10 transition-all duration-1000 hover:scale-[1.02] group"
                style={themeColor ? {
                  backgroundColor: `color-mix(in srgb, ${themeColor}, white 40%)`,
                  color: '#000',
                  boxShadow: `0 20px 40px -10px ${themeColor}60`,
                  filter: 'saturate(1.2)'
                } : undefined}
              >
                <div className="flex justify-between items-start">
                  <div className="bg-black text-[#EDFD6D] p-3 rounded-full shadow-lg transition-colors duration-1000" style={themeColor ? { color: `color-mix(in srgb, ${themeColor}, white 40%)` } : undefined}>
                    <Plus className="h-6 w-6" />
                  </div>
                  <Button variant="ghost" size="icon" className="hover:bg-black/5 rounded-full"><Map className="h-5 w-5 opacity-50" /></Button>
                </div>

                <div className="space-y-6">
                  <h2 className="text-3xl font-medium leading-tight tracking-tight">
                    Ready to add some <span className="font-bold underline decoration-black/20 decoration-2 underline-offset-4">new tasks</span>?
                  </h2>

                  <>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-4 py-1.5 bg-black/5 rounded-full text-sm font-medium border border-black/5">Quick Task</span>
                      <span className="px-4 py-1.5 bg-black/5 rounded-full text-sm font-medium border border-black/5">Reminder</span>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        onClick={openNewTaskModal}
                        className="rounded-full bg-black text-white hover:bg-black/80 w-14 h-14 p-0 flex items-center justify-center shadow-lg shadow-black/20 transition-all hover:scale-110"
                      >
                        <Plus className="h-7 w-7" />
                      </Button>
                    </div>
                  </>
                </div>
              </div>
            </div>

            {/* Column 2: Widgets & Stats */}
            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Mood Widget */}
              <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-6 flex flex-col justify-between shadow-sm border border-gray-100 dark:border-neutral-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="text-6xl">{mood || '😊'}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Mood</h3>
                  <p className="text-sm text-muted-foreground">How are you feeling?</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  {['😡', '😔', '😐', '🙂', '🤩'].map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => setMood(emoji)}
                      className={cn(
                        "text-2xl hover:scale-125 transition-all p-2 rounded-full",
                        mood === emoji ? "bg-gray-100 dark:bg-neutral-800 scale-125 shadow-sm" : "hover:bg-gray-50 dark:hover:bg-neutral-800/50"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Widget */}
              <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-6 flex items-center gap-6 shadow-sm border border-gray-100 dark:border-neutral-800 relative overflow-hidden">
                <div className="relative h-24 w-24 shrink-0">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-gray-100 dark:text-neutral-800 stroke-current" strokeWidth="10" cx="50" cy="50" r="40" fill="transparent"></circle>
                    <circle
                      className="text-[#EDFD6D] progress-ring__circle stroke-current transition-all duration-1000 ease-out"
                      strokeWidth="10"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * progress) / 100}
                      style={themeColor ? { color: themeColor } : undefined}
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xl font-bold">{progress}%</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Progress</h3>
                  <p className="text-sm text-muted-foreground">{completedCount} / {tasks.length} Done</p>
                </div>
              </div>

              {/* Task List Widget */}
              <div className="md:col-span-3 bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 shadow-sm min-h-[300px] border border-gray-100 dark:border-neutral-800 flex flex-col">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-8 w-20 rounded-full" />
                    </div>
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-6 w-full rounded-md" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <DailyTasks tasks={tasks} onToggle={toggleTask} onEdit={handleEditTask} />
                )}
              </div>

            </div>
          </div>
        )}

        {activeTab === 'projects' && <ProjectsView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'pages' && <PagesView />}
      </div>


      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialData={editingTask}
      />
    </main >
  );
}
