"use client"

import { Mail, Phone, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TeamPage() {
    const members = [
        { name: "Alice Johnson", role: "Product Designer", email: "alice@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice" },
        { name: "Bob Smith", role: "Frontend Developer", email: "bob@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob" },
        { name: "Charlie Brown", role: "Backend Engineer", email: "charlie@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie" },
        { name: "Diana Prince", role: "Project Manager", email: "diana@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana" },
        { name: "Evan Wright", role: "UX Researcher", email: "evan@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Evan" },
    ]

    return (
        <main className="flex-1 p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Team</h1>
                    <p className="text-muted-foreground">Manage your team members and permissions.</p>
                </div>
                <Button className="rounded-full">Add Member</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((member, i) => (
                    <div key={i} className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <img src={member.avatar} alt={member.name} className="h-16 w-16 rounded-full bg-gray-50" />
                            <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="h-5 w-5 text-muted-foreground" /></Button>
                        </div>
                        <h3 className="text-xl font-bold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{member.role}</p>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-full flex-1 gap-2"><Mail className="h-4 w-4" /> Email</Button>
                            <Button variant="outline" size="sm" className="rounded-full flex-1 gap-2"><Phone className="h-4 w-4" /> Call</Button>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}
