"use client";
import { generatePrivateKey, privateKeyToAccount, privateKeyToAddress } from 'viem/accounts'
import { createWalletClient, http, type Abi, type Hex } from 'viem'
import { sepolia } from 'viem/chains';
import { getTransaction, listRelayers, sendTransaction } from '../lib/api';
import { Copy, ExternalLink } from "lucide-react"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from '../components/ui/textarea'
import { useEffect, useState } from 'react';
import { RelayerItem, RelayerTransactionRequest } from '@/lib/relayer';

let DELEGATE_ADDRESS: `0x${string}` = '0x3832923A34ac8Fd092ed9941B9302006C16D789f';
let DELEGATION_COST_WEI = 10_000_000_000_000;
const ABI = [
  {
    "type": "function",
    "name": "initialize",
    "inputs": [],
    "outputs": [],
    "stateMutability": "pure"
  },
] as const

export default function Home() {
  const [privateKey, setPrivateKey] = useState('');
  const [address, setAddress] = useState('');
  const [addressContract, setAddressContract] = useState('');
  const [contractAbi, setContractAbi] = useState('');
  const [relayers, setRelayers] = useState<Array<RelayerItem>>([]);
  const [loadingStatus, setLoadingStatus] = useState<'' | 'funding' | 'submitting' | 'done' | 'error'>('');
  const [hash, setHash] = useState('');

  useEffect(() => {
    generate();
    setAddressContract(DELEGATE_ADDRESS);
    setContractAbi(JSON.stringify(ABI));
    listRelayers().then((res) => setRelayers(res.data));
  }, []);

  useEffect(() => {
    if (relayers.length === 0) return;
    let relayerId = relayers[0].id;
  }, [relayers.length]);

  const generate = async () => {
    const privateKey = generatePrivateKey();
    const address = privateKeyToAddress(privateKey);
    setPrivateKey(privateKey);
    setAddress(address);
  }

  const sendToEtherscan = (address: string) => {
    console.log(address);
    window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank');
  }

  const upgrade = async () => {
    const account = privateKeyToAccount(privateKey as Hex);
    
    const walletClient = createWalletClient({
      account: account,
      chain: sepolia,
      transport: http(),
    });

    const authorization = await walletClient.signAuthorization({
      account: account,
      contractAddress: addressContract as `0x${string}`,
      executor: 'self'
    });

    // check funds
    setLoadingStatus('funding');
    await fundAccount();

    setLoadingStatus('submitting');
    const hash = await walletClient.writeContract({ 
      abi: JSON.parse(contractAbi) as Abi,
      address: account.address,
      authorizationList: [authorization],
      functionName: 'initialize',
    });
    setLoadingStatus('done');
    setHash(hash);
  }

  const fundAccount = async () => {
    if (!address || !relayers.length) return;
    const relayerId = relayers[0].id;
    const transaction: RelayerTransactionRequest = {
      value: DELEGATION_COST_WEI,
      to: address,
      data: '0x',
      gas_limit: 21000,
      speed: 'fastest',
    };
    console.log("Funding account with relayer", relayerId); 
    console.log("Transaction", transaction);

    const response = await sendTransaction(relayerId, transaction);
    console.log("Response", response);
    
    if (!response.success || !response.data.id) return;
    console.log("Transaction sent", response.data.id);
    await pollTransaction(relayerId, response.data.id);
  }

  const pollTransaction = async (relayerId: string, transactionId: string) => {
    let response = await getTransaction(relayerId, transactionId);
    console.log("Polling transaction", response);
    while (response.data.status !== 'mined') {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      response = await getTransaction(relayerId, transactionId);
      console.log("Polling transaction", response);
    }
    console.log("Transaction mined", response);
  }
    


  return (
    <div className="flex flex-col items-center justify-center min-h-svh">
      <h1 className="text-2xl font-bold mb-8">7702 Self-upgrade example</h1>
      <div className="flex flex-col w-full max-w-sm space-x-2 gap-2">
          <span>1. Generate burner EOA</span>

          <p className="text-muted-foreground text-sm">Generate a new burner EOA to use for the self-upgrade. 
            <br/><br/> ⚠️ It's not persistent if you refresh the page you will need to generate and fund a new one. ⚠️</p>

          <div className="flex flex-col gap-2 w-full">
            <Label htmlFor="address">Address</Label>
            <Input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)}/>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Label htmlFor="privateKey">Private key</Label>
            <div className="flex items-center gap-2 w-full">
            <Input type="password" placeholder="Private key" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)}/>
              <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(privateKey)}>
                <Copy />
              </Button>
            </div>
          </div>
          <Button variant="default" onClick={generate}>Generate</Button>

        <hr className='w-full' style={{ margin: "15px 0" }}/>

        <span>2. Account Deploy</span>

        <p className="text-muted-foreground text-sm">Select the address of the smart contract to delegate to, it must implement an "initialize" function</p>
        <div className="flex flex-col gap-2 w-full">
            <Label htmlFor="addressContract">Contract Address</Label>         
             <div className="flex items-center gap-2 w-full">
              <Input type="text" placeholder="Address" value={addressContract} onChange={(e) => setAddressContract(e.target.value)}/>
              <Button variant="outline" size="icon" onClick={() => sendToEtherscan(addressContract)}>
              <ExternalLink />
            </Button>
          </div>
        </div>
            
        <div className="flex flex-col gap-2 w-full">
          <Label htmlFor="contractAbi">Contract ABI</Label>
          <Textarea placeholder="[]" value={contractAbi} onChange={(e) => setContractAbi(e.target.value)}/>
        </div>
        <div className="flex flex-col gap-2 w-full"> 

          <Button variant="default" style={{ cursor: loadingStatus !== '' && loadingStatus !== 'done' ? 'not-allowed' : 'pointer' }} disabled={loadingStatus !== '' && loadingStatus !== 'done'} onClick={upgrade}>
            {loadingStatus === 'funding' && <span>Funding account...</span>}
            {loadingStatus === 'submitting' && <span>Submitting transaction...</span>}
            {(loadingStatus === '' || loadingStatus === 'done') && <span>7702 Upgrade</span>}
          </Button>
        </div>

        {loadingStatus === 'funding' && <span className="text-muted-foreground text-sm">The funding process consists on an OpenZeppelin Relayer sending some testnet tokens to your account in order to self upgrade to smart account</span>}
        {loadingStatus === 'done' && <span>Account deployed! <a className="text-primary hover:underline" href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank">View transaction</a></span>}
      </div>
    </div>
  );
}
