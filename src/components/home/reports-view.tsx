"use client"

import { BarChart2, TrendingUp } from "lucide-react"
import { CryptoDashboard } from "@/components/web3/crypto-dashboard"

export function ReportsView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight mb-2">Analytics & Reports</h2>
                <p className="text-muted-foreground">Track your performance and growth.</p>
            </div>

            <div className="mb-8">
                <CryptoDashboard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm h-[400px] flex items-center justify-center">
                    <div className="text-center">
                        <BarChart2 className="h-16 w-16 mx-auto text-gray-200 mb-4" />
                        <p className="text-muted-foreground">Revenue Chart Placeholder</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm h-[400px] flex items-center justify-center">
                    <div className="text-center">
                        <TrendingUp className="h-16 w-16 mx-auto text-gray-200 mb-4" />
                        <p className="text-muted-foreground">Traffic Chart Placeholder</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
