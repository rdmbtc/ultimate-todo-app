export interface TokenInfo {
    address: string;
    name: string;
    symbol: string;
    decimals: string;
    price: {
        rate: number;
        diff: number;
        diff7d: number;
        ts: number;
        marketCapUsd: number;
    } | false;
    image?: string;
}

export interface TokenBalance {
    tokenInfo: TokenInfo;
    balance: number;
    rawBalance: string;
}

export interface AddressInfo {
    address: string;
    ETH: {
        price: {
            rate: number;
            diff: number;
            diff7d: number;
            ts: number;
            marketCapUsd: number;
        };
        balance: number;
        rawBalance: string;
    };
    tokens?: TokenBalance[];
}

export async function fetchAddressInfo(address: string): Promise<AddressInfo | null> {
    try {
        const response = await fetch(`/api/portfolio/${address}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Token Service Error (${response.status}):`, errorText);
            throw new Error(`Failed to fetch address info: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching address info:', error);
        return null;
    }
}
