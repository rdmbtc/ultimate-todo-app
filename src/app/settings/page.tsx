"use client"

import { Bell, Lock, User, Palette, Globe, Moon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
    return (
        <main className="flex-1 p-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and workspace settings.</p>
            </div>

            <div className="space-y-6">
                {/* Profile Section */}
                <section className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><User className="h-5 w-5" /> Profile</h2>
                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">U</div>
                        <div>
                            <h3 className="text-lg font-medium">User Name</h3>
                            <p className="text-muted-foreground">user@example.com</p>
                            <Button variant="outline" className="mt-2 rounded-full">Edit Profile</Button>
                        </div>
                    </div>
                </section>

                {/* Preferences */}
                <section className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Palette className="h-5 w-5" /> Appearance</h2>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-xl"><Moon className="h-5 w-5" /></div>
                            <div>
                                <p className="font-medium">Dark Mode</p>
                                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                            </div>
                        </div>
                        <Switch />
                    </div>
                </section>

                <section className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</h2>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive daily summaries</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Desktop Alerts</p>
                            <p className="text-sm text-muted-foreground">Get notified about tasks</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </section>
            </div>
        </main>
    )
}
