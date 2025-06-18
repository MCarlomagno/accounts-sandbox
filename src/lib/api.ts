'use server';
import { Relayer, RelayerTransactionRequest } from "./relayer";

let relayer = new Relayer({
    apiKey: process.env.RELAYER_API_KEY!, 
    basePath: process.env.RELAYER_API_URL!
});

export async function listRelayers() {
    return relayer.list();
}

export async function getBalance(relayerId: string) {
    return relayer.getBalance(relayerId);
}

export async function sendTransaction(relayerId: string, req: RelayerTransactionRequest) {
    return relayer.send(relayerId, req);
}

export async function getTransaction(relayerId: string, transactionId: string) {
    return relayer.getTransaction(relayerId, transactionId);
}
