"use client"

import { Folder, MoreVertical, Clock } from "lucide-react"

export default function ProjectsPage() {
    const projects = [
        { name: "Website Redesign", status: "In Progress", tasks: 12, completed: 8, color: "bg-blue-500" },
        { name: "Mobile App Launch", status: "Planning", tasks: 24, completed: 0, color: "bg-purple-500" },
        { name: "Marketing Campaign", status: "Review", tasks: 8, completed: 7, color: "bg-green-500" },
        { name: "Internal Tools", status: "On Hold", tasks: 5, completed: 2, color: "bg-orange-500" },
    ]

    return (
        <main className="flex-1 p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Projects</h1>
                <p className="text-muted-foreground">Overview of all ongoing projects.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, i) => (
                    <div key={i} className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-2xl ${project.color} bg-opacity-10 text-${project.color.split('-')[1]}-600`}>
                                <Folder className="h-8 w-8" />
                            </div>
                            <button className="text-muted-foreground hover:text-foreground"><MoreVertical className="h-5 w-5" /></button>
                        </div>

                        <h3 className="text-2xl font-bold mb-2">{project.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                            <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 rounded-full">{project.status}</span>
                            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 2 days left</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span>Progress</span>
                                <span>{Math.round((project.completed / project.tasks) * 100)}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${project.color} transition-all duration-1000`}
                                    style={{ width: `${(project.completed / project.tasks) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}
