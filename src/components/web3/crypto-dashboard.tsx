"use client"

import { useState, useEffect } from "react"
import { WalletConnect } from "./wallet-connect"
import { ArrowUpRight, ArrowDownRight, TrendingUp, Activity, DollarSign, Bitcoin, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { useMusic } from "@/providers/music-provider"
import { fetchAddressInfo, AddressInfo } from "@/services/token-service"

interface MarketToken {
    id: number;
    name: string;
    symbol: string;
    quote: {
        USD: {
            price: number;
            percent_change_24h: number;
        }
    }
}

export function CryptoDashboard() {
    const [account, setAccount] = useState<string | null>(null)
    const [portfolio, setPortfolio] = useState<AddressInfo | null>(null)
    const [marketData, setMarketData] = useState<MarketToken[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { themeColor } = useMusic()

    const handleConnect = (address: string) => {
        setAccount(address)
    }

    const loadData = async () => {
        setIsLoading(true)

        // Fetch Market Data
        try {
            const marketRes = await fetch('/api/market-data')
            const marketJson = await marketRes.json()
            if (marketJson.data) {
                setMarketData(marketJson.data)
            }
        } catch (e) {
            console.error("Failed to fetch market data", e)
        }

        // Fetch Portfolio if connected
        if (account) {
            const data = await fetchAddressInfo(account)
            setPortfolio(data)
        }

        setIsLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [account])

    // Calculate totals
    let totalValue = 0
    let totalChange24h = 0

    if (portfolio) {
        const ethValue = portfolio.ETH.balance * portfolio.ETH.price.rate
        totalValue += ethValue

        // Simple weighted change for ETH
        totalChange24h += portfolio.ETH.price.diff * (ethValue)

        portfolio.tokens?.forEach(token => {
            if (token.tokenInfo.price) {
                // Adjust balance for decimals
                const decimals = parseInt(token.tokenInfo.decimals)
                const balance = token.balance / Math.pow(10, decimals)
                const value = balance * token.tokenInfo.price.rate
                totalValue += value
                totalChange24h += token.tokenInfo.price.diff * value
            }
        })

        // Normalize change percentage
        if (totalValue > 0) {
            totalChange24h = totalChange24h / totalValue
        }
    }

    // High precision formatting for small values
    const formattedTotal = totalValue < 1
        ? totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 6 })
        : totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

    const formattedChange = totalChange24h.toFixed(2)

    if (!account) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-12 border border-gray-100 dark:border-neutral-800 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                    <div
                        className="h-20 w-20 rounded-full flex items-center justify-center mb-6 transition-colors duration-500"
                        style={{ backgroundColor: themeColor ? `${themeColor}20` : '#EEF2FF' }}
                    >
                        <TrendingUp
                            className="h-10 w-10 transition-colors duration-500"
                            style={{ color: themeColor || '#6366f1' }}
                        />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Web3 Analytics</h2>
                    <p className="text-muted-foreground max-w-md mb-8">Connect your wallet to track your portfolio, analyze performance, and view real-time token statistics.</p>
                    <WalletConnect onConnect={handleConnect} />
                </div>

                {/* Market Overview (Visible even without wallet) */}
                {marketData.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold mb-4 px-2">Market Overview</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {marketData.slice(0, 4).map((token) => (
                                <div key={token.id} className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold">{token.symbol}</span>
                                        <span className={`text-xs ${token.quote.USD.percent_change_24h >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                                            {token.quote.USD.percent_change_24h >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                                            {Math.abs(token.quote.USD.percent_change_24h).toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="text-lg font-bold">
                                        ${token.quote.USD.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Main Portfolio Card */}
            <div
                className="relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-2xl transition-all duration-1000"
                style={{
                    background: themeColor
                        ? `linear-gradient(135deg, ${themeColor}, #000000)`
                        : 'linear-gradient(135deg, #4f46e5, #9333ea, #db2777)',
                    boxShadow: themeColor ? `0 20px 40px -10px ${themeColor}60` : undefined
                }}
            >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Activity className="h-64 w-64 -mr-10 -mt-10" />
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-white/80 font-medium mb-1">Total Portfolio Value</p>
                            <h2 className="text-5xl font-bold tracking-tight">
                                {isLoading ? "Loading..." : formattedTotal}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={loadData}
                                className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/30 transition-colors"
                            >
                                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
                                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-sm font-medium">{account.slice(0, 6)}...{account.slice(-4)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3 pr-6">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${Number(formattedChange) >= 0 ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                                {Number(formattedChange) >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                            </div>
                            <div>
                                <p className="text-sm text-white/60">24h Change</p>
                                <p className={`font-bold ${Number(formattedChange) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                    {Number(formattedChange) > 0 ? '+' : ''}{formattedChange}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Market Overview */}
            {marketData.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold mb-4 px-2">Market Overview</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {marketData.slice(0, 4).map((token, i) => (
                            <motion.div
                                key={token.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + (i * 0.05) }}
                                className="bg-white dark:bg-neutral-900 p-5 rounded-[1.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg">{token.symbol}</span>
                                        <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">{token.name}</span>
                                    </div>
                                    <span className={`text-xs font-medium ${token.quote.USD.percent_change_24h >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                                        {token.quote.USD.percent_change_24h >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                                        {Math.abs(token.quote.USD.percent_change_24h).toFixed(2)}%
                                    </span>
                                </div>
                                <div className="text-xl font-bold">
                                    ${token.quote.USD.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Portfolio Grid */}
            <div>
                <h3 className="text-xl font-bold mb-4 px-2">Your Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ETH Card */}
                    {portfolio && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-12 w-12 rounded-2xl flex items-center justify-center transition-colors duration-500"
                                        style={{
                                            backgroundColor: themeColor ? `${themeColor}20` : '#3b82f620',
                                            color: themeColor || '#3b82f6'
                                        }}
                                    >
                                        <Activity className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Ethereum</h3>
                                        <p className="text-sm text-muted-foreground">ETH</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">
                                        {portfolio.ETH.balance < 0.0001
                                            ? portfolio.ETH.balance.toFixed(8)
                                            : portfolio.ETH.balance.toFixed(4)} ETH
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        ≈ ${(portfolio.ETH.balance * portfolio.ETH.price.rate).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                    </p>
                                    <p className={`text-xs ${portfolio.ETH.price.diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {portfolio.ETH.price.diff > 0 ? '+' : ''}{portfolio.ETH.price.diff}%
                                    </p>
                                </div>
                            </div>
                            <div className="h-1 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full w-[100%] transition-all duration-1000"
                                    style={{ backgroundColor: themeColor || '#3b82f6' }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Other Tokens */}
                    {portfolio?.tokens?.filter(t => t.tokenInfo.price && (t.balance / Math.pow(10, parseInt(t.tokenInfo.decimals)) * t.tokenInfo.price.rate) > 0.000001).map((token, i) => {
                        const decimals = parseInt(token.tokenInfo.decimals)
                        const balance = token.balance / Math.pow(10, decimals)
                        const value = balance * (token.tokenInfo.price ? token.tokenInfo.price.rate : 0)
                        const change = token.tokenInfo.price ? token.tokenInfo.price.diff : 0

                        return (
                            <motion.div
                                key={token.tokenInfo.address}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                                            {/* Placeholder icon since we don't have images yet */}
                                            <span className="font-bold text-xs">{token.tokenInfo.symbol.slice(0, 3)}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg truncate max-w-[120px]">{token.tokenInfo.name}</h3>
                                            <p className="text-sm text-muted-foreground">{token.tokenInfo.symbol}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">
                                            {balance < 0.0001 ? balance.toFixed(8) : balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            ≈ ${value.toLocaleString(undefined, { maximumFractionDigits: value < 1 ? 6 : 2 })}
                                        </p>
                                        <p className={`text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center justify-end gap-1`}>
                                            {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                            {Math.abs(change)}%
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
