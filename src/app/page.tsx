"use client"

import { useState, useEffect } from "react";
import { EmojiTracker } from "@/components/emoji-tracker";
import { DailyTasks, Task } from "@/components/daily-tasks";
import { MusicPlayer } from "@/components/music-player";
import { Sidebar } from "@/components/sidebar";
import { Map, Plus, Command, Settings2, LayoutGrid, Folder, Calendar as CalendarIcon, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error('Failed to fetch tasks:', err));
  }, []);

  const addTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle }),
      });
      const task = await res.json();
      setTasks([...tasks, task]);
      setNewTaskTitle("");
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to add task:', err);
    }
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
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-neutral-950 text-foreground overflow-hidden font-sans selection:bg-[#EDFD6D] selection:text-black">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-6 overflow-y-auto flex flex-col gap-8">
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
        <section className="relative h-72 rounded-[2.5rem] overflow-hidden group shrink-0 shadow-2xl shadow-blue-900/10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-violet-600 dark:from-blue-950 dark:to-violet-950" />
          <img
            src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2070&auto=format&fit=crop"
            alt="Scenic View"
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 p-10 pb-24 flex flex-col justify-center text-white">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-lg">
                <Map className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium tracking-wide text-sm uppercase opacity-80">Dashboard</span>
            </div>

            <h1 className="text-6xl font-medium mb-4 tracking-tight">Good Morning, User</h1>
            <p className="max-w-md text-white/80 text-lg font-light leading-relaxed">
              Ready to conquer the day? You have {tasks.length - completedCount} pending tasks.
            </p>

            <div className="absolute top-8 right-8 flex gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white/20 bg-gray-300 shadow-lg" />
                ))}
                <div className="h-10 w-10 rounded-full border-2 border-white/20 bg-black/40 text-white text-xs flex items-center justify-center backdrop-blur-md shadow-lg">+5</div>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 flex gap-3">
              <Button size="icon" variant="secondary" className="rounded-full w-12 h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/10 shadow-lg"><Settings2 className="h-5 w-5" /></Button>
            </div>
          </div>

          {/* Floating Tabs */}
          <div className="absolute bottom-8 left-10 flex gap-1 bg-black/30 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-xl">
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
        </section>

        {/* Content Area */}
        <div className="pb-10">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Column 1: Assistant / Add Task (Yellow Card) */}
              <div className="md:col-span-1 lg:col-span-1 row-span-2 relative h-full min-h-[320px]">
                <div className="absolute inset-0 bg-[#EDFD6D] rounded-[2.5rem] p-8 flex flex-col justify-between text-black shadow-xl shadow-yellow-400/10 transition-transform hover:scale-[1.02] duration-300 group">
                  <div className="flex justify-between items-start">
                    <div className="bg-black text-[#EDFD6D] p-3 rounded-full shadow-lg">
                      <Plus className="h-6 w-6" />
                    </div>
                    <Button variant="ghost" size="icon" className="hover:bg-black/5 rounded-full"><Map className="h-5 w-5 opacity-50" /></Button>
                  </div>

                  <div className="space-y-6">
                    <h2 className="text-3xl font-medium leading-tight tracking-tight">
                      {isAdding ? "What's the task?" : <>Ready to add some <span className="font-bold underline decoration-black/20 decoration-2 underline-offset-4">new tasks</span>?</>}
                    </h2>

                    {!isAdding ? (
                      <>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-4 py-1.5 bg-black/5 rounded-full text-sm font-medium border border-black/5">Quick Task</span>
                          <span className="px-4 py-1.5 bg-black/5 rounded-full text-sm font-medium border border-black/5">Reminder</span>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            onClick={() => setIsAdding(true)}
                            className="rounded-full bg-black text-white hover:bg-black/80 w-14 h-14 p-0 flex items-center justify-center shadow-lg shadow-black/20 transition-all hover:scale-110"
                          >
                            <Plus className="h-7 w-7" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <form onSubmit={addTask} className="space-y-4">
                        <Input
                          autoFocus
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Type here..."
                          className="bg-white/50 border-0 placeholder:text-black/40 text-xl h-14 rounded-2xl px-4 focus-visible:ring-0 focus-visible:bg-white/80 transition-all"
                        />
                        <div className="flex gap-2">
                          <Button type="submit" className="rounded-full bg-black text-white hover:bg-black/80 flex-1 h-12 text-base shadow-lg">Add</Button>
                          <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-full hover:bg-black/5 h-12 px-6">Cancel</Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 2: Widgets & Stats */}
              <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Weather / Emoji Widget */}
                <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 flex items-center justify-between shadow-sm border border-gray-100 dark:border-neutral-800">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-3xl shadow-inner">
                      ☀️
                    </div>
                    <div>
                      <div className="text-3xl font-semibold tracking-tight">Good</div>
                      <div className="text-sm text-muted-foreground font-medium">Current Mood</div>
                    </div>
                  </div>
                  <div className="scale-110 origin-right">
                    <EmojiTracker compact />
                  </div>
                </div>

                {/* Budget / Progress Widget */}
                <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 flex flex-col justify-center shadow-sm border border-gray-100 dark:border-neutral-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <PieChart className="h-24 w-24" />
                  </div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="h-10 w-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm shadow-lg">%</div>
                  </div>
                  <div className="text-3xl font-semibold mb-2 relative z-10">{progress}% Done</div>
                  <div className="w-full bg-gray-100 dark:bg-neutral-800 h-3 rounded-full overflow-hidden relative z-10">
                    <div className="bg-[#EDFD6D] h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(237,253,109,0.5)]" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-3 font-medium relative z-10">{completedCount} / {tasks.length} Tasks Completed</div>
                </div>

                {/* Music Player Widget */}
                <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-0 shadow-sm overflow-hidden border border-gray-100 dark:border-neutral-800">
                  <MusicPlayer />
                </div>

                {/* Main Task List Area */}
                <div className="md:col-span-3 bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 shadow-sm min-h-[300px] border border-gray-100 dark:border-neutral-800">
                  <DailyTasks tasks={tasks} onToggle={toggleTask} />
                </div>

              </div>
            </div>
          )}

          {activeTab !== 'overview' && (
            <div className="flex flex-col items-center justify-center h-[500px] bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-300">
              <div className="h-24 w-24 rounded-full bg-gray-50 dark:bg-neutral-800 flex items-center justify-center mb-6">
                {activeTab === 'projects' && <Folder className="h-10 w-10 text-muted-foreground" />}
                {activeTab === 'calendar' && <CalendarIcon className="h-10 w-10 text-muted-foreground" />}
                {activeTab === 'reports' && <PieChart className="h-10 w-10 text-muted-foreground" />}
              </div>
              <h2 className="text-2xl font-semibold capitalize mb-2">{activeTab}</h2>
              <p className="text-muted-foreground text-center max-w-md">
                This module is currently under development. <br />
                Check back soon for updates!
              </p>
              <Button className="mt-6 rounded-full" onClick={() => setActiveTab('overview')}>
                Back to Overview
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
