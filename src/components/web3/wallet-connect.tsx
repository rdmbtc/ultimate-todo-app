"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useMusic } from "@/providers/music-provider"

interface WalletConnectProps {
    onConnect: (address: string, balance: string) => void;
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { themeColor } = useMusic()

    const connectWallet = async () => {
        setIsConnecting(true)
        setError(null)

        if (typeof window === 'undefined' || !(window as any).ethereum) {
            setError("MetaMask is not installed")
            setIsConnecting(false)
            return
        }

        try {
            const ethereum = (window as any).ethereum
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
            const account = accounts[0]

            const balanceHex = await ethereum.request({
                method: 'eth_getBalance',
                params: [account, 'latest'],
            })

            // Convert Wei to ETH (simple conversion)
            const balanceWei = parseInt(balanceHex, 16)
            const balanceEth = (balanceWei / 1e18).toFixed(4)

            onConnect(account, balanceEth)
        } catch (err: any) {
            setError(err.message || "Failed to connect")
        } finally {
            setIsConnecting(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="rounded-full text-white shadow-lg px-8 py-6 text-lg transition-all hover:scale-105"
                style={{
                    backgroundColor: themeColor || '#000',
                    boxShadow: themeColor ? `0 10px 25px -5px ${themeColor}60` : undefined
                }}
            >
                <Wallet className="mr-2 h-5 w-5" />
                {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </Button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    )
}
