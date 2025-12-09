"use client"

import { CryptoDashboard } from "@/components/web3/crypto-dashboard"

export default function AnalyticsPage() {
    return (
        <main className="flex-1 p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Web3 Analytics</h1>
                <p className="text-muted-foreground">Track your crypto portfolio and performance.</p>
            </div>

            <CryptoDashboard />
        </main>
    )
}
