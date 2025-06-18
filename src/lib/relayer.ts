export interface Configuration {
    apiKey?: string;
    basePath?: string;
}

export interface RelayerItem {
    address: string;
    name: string;
    id: string;
    network: string;
    network_type: string;
    paused: boolean;
    policies: Record<string, string>;
    system_disabled: boolean;
}

export type RelayerListResponse = {
    success: boolean;
    data: Array<RelayerItem>;
    error?: string;
    pagination?: {
        current_page: number;
        per_page: number;
        total_items: number;
    }
}

export type RelayerBalanceResponse = {
    success: boolean;
    data: {
        balance: number;
        unit: "wei" | "gwei" | "ether";
    };
    error?: string;
}

export type RelayerTransactionRequest = {
    value: number,
    to: string,
    data: string,
    gas_limit: number,
    speed: 'average' | 'fast' | 'fastest',
    
}

export type RelayerTransactionResponse = {
    success: boolean,
    data: {
        id: string,
        hash: string,
        status: string,
        created_at: string,
        sent_at: string,
        confirmed_at: string,
        gas_price: string,
        gas_limit: number,
        nonce: number,
        value: string,
        from: string,
        to: string,
        relayer_id: string,
    },
    error?: string
}

export type RelayerGetTransactionResponse = {
    success: boolean,
    data: {
        id: string,
        hash: string,
        status: string,
        created_at: string,
        sent_at: string,
        confirmed_at: string,
        gas_price: string,
        gas_limit: number,
        nonce: number,
        value: string,
        from: string,
        to: string,
        relayer_id: string,
    },
    error?: string
}

export class Relayer {
    private apiKey: string;
    private basePath: string;

    constructor(config: Configuration) {
        this.apiKey = config.apiKey || '';
        this.basePath = config.basePath || '';
    }

    public async list(): Promise<RelayerListResponse> {
        const response = await fetch(`${this.basePath}/api/v1/relayers`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
        });
        return response.json();
    }

    public async getBalance(relayerId: string): Promise<RelayerItem> {
        const response = await fetch(`${this.basePath}/api/v1/relayers/${relayerId}/balance`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
        });
        return response.json();
    }

    public async send(relayerId: string, req: RelayerTransactionRequest): Promise<RelayerTransactionResponse> {
        const response = await fetch(`${this.basePath}/api/v1/relayers/${relayerId}/transactions`, {
            method: 'POST',
            body: JSON.stringify(req),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
        });
        return response.json();
    }

    public async getTransaction(relayerId: string, transactionId: string): Promise<RelayerTransactionResponse> {
        const response = await fetch(`${this.basePath}/api/v1/relayers/${relayerId}/transactions/${transactionId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
        });
        return response.json();
    }
}
