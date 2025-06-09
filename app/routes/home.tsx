
import { generatePrivateKey, privateKeyToAccount, privateKeyToAddress, toAccount } from 'viem/accounts'
import { useEffect, useState } from "react"
import { createPublicClient, createWalletClient, http, type Abi, type Hex } from 'viem'
import { sepolia } from 'viem/chains';

import type { Route } from "./+types/home"
import { Copy, RefreshCw, ExternalLink } from "lucide-react"
import { Label } from "~/components/ui/label"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { formatAddress } from '~/lib/utils'
import { Textarea } from '~/components/ui/textarea'

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ]
}

let DELEGATE_ADDRESS: `0x${string}` = '0x3832923A34ac8Fd092ed9941B9302006C16D789f';
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
  const [balance, setBalance] = useState(0);
  const [addressContract, setAddressContract] = useState('');
  const [contractAbi, setContractAbi] = useState('');

  useEffect(() => {
    generate();
    setAddressContract(DELEGATE_ADDRESS);
    setContractAbi(JSON.stringify(ABI));
  }, []);

  const generate = async () => {
    const privateKey = generatePrivateKey();
    const address = privateKeyToAddress(privateKey);
    setPrivateKey(privateKey);
    setAddress(address);
  }

  const loadBalance = async () => {
    if (!address) return;
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(),
    });
    
    const balance = await publicClient.getBalance({ address: address as `0x${string}` });
    let balanceInEther = Number(balance) / 1e18;
    setBalance(balanceInEther);
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

    console.log("Signing authorization");

    console.log("Account to authorize", account.address);
    const authorization = await walletClient.signAuthorization({ 
      account: account, 
      contractAddress: addressContract as `0x${string}`,
      executor: 'self'
    });

    console.log("Sending auth contract call");
    const hash = await walletClient.writeContract({ 
      abi: JSON.parse(contractAbi) as Abi,
      address: account.address,
      authorizationList: [authorization],
      functionName: 'initialize',
    }) 

    console.log("Transaction hash", hash);
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

        <span>2. EOA funding</span>


        <p className="text-muted-foreground text-sm">You will need to fund the address with testnet tokens to be able to self-upgrade it to smart account. Once tokens were sent, press refresh button to see updated balance.</p>

        <div className="flex flex-col gap-2 w-full">
          <Label htmlFor="balance">Sepolia ETH Balance {address ? `of ${formatAddress(address)}` : ""}</Label>
          <div className="flex items-center gap-2 w-full">
          <Input type="text" disabled placeholder="Balance" value={balance}/>
            <Button variant="outline" size="icon" onClick={() => loadBalance()}>
              <RefreshCw />
            </Button>
          </div>
        </div>

        <hr className='w-full' style={{ margin: "15px 0" }}/>

        <span>3. Account Deploy</span>

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
          <Button variant="default" onClick={upgrade}>7702 Upgrade</Button>
        </div>

      </div>
    </div>
  )
}
