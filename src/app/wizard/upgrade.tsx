import { privateKeyToAccount } from 'viem/accounts'
import { createWalletClient, http, type Abi, type Hex } from 'viem'
import { sepolia } from 'viem/chains';
import { getTransaction, listRelayers, sendTransaction } from '../../lib/api';
import { ExternalLink } from "lucide-react"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from '../../components/ui/textarea'
import { useEffect, useState } from 'react';
import { RelayerItem, RelayerTransactionRequest } from '@/lib/relayer';

interface UpgradeStepProps {
  address: string;
  privateKey: string;
  nextStep?: () => void;
  previousStep?: () => void;
}

const DELEGATE_ADDRESS: `0x${string}` = '0x3832923A34ac8Fd092ed9941B9302006C16D789f';
const DELEGATION_COST_WEI = 10_000_000_000_000;
const ABI = [
  {
    "type": "function",
    "name": "initialize",
    "inputs": [],
    "outputs": [],
    "stateMutability": "pure"
  },
] as const

export default function UpgradeStep({ address, privateKey, nextStep, previousStep }: UpgradeStepProps) {
  const [addressContract, setAddressContract] = useState('');
  const [contractAbi, setContractAbi] = useState('');
  const [relayers, setRelayers] = useState<Array<RelayerItem>>([]);
  const [loadingStatus, setLoadingStatus] = useState<'' | 'funding' | 'submitting' | 'done' | 'error'>('');
  const [hash, setHash] = useState('');

  useEffect(() => {
    setAddressContract(DELEGATE_ADDRESS);
    setContractAbi(JSON.stringify(ABI));
    listRelayers().then((res) => setRelayers(res.data));
  }, []);

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
    <div className="flex flex-col gap-8">
        <h2 className="text-2xl font-bold">Upgrade To Smart Account</h2>

        <p className="text-muted-foreground text-lg">Select the address of the smart contract to delegate to, it must implement an &quot;initialize&quot; function</p>
        <div className="flex flex-col gap-2 w-full">
          <Label htmlFor="addressContract">Contract Address</Label>
          <div className="flex items-center gap-2 w-full">
            <Input type="text" placeholder="Address" value={addressContract} onChange={(e) => setAddressContract(e.target.value)} />
            <Button variant="outline" size="icon" onClick={() => sendToEtherscan(addressContract)}>
              <ExternalLink />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Label htmlFor="contractAbi">Contract ABI</Label>
          <Textarea placeholder="[]" value={contractAbi} onChange={(e) => setContractAbi(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Button variant="default" size="lg" style={{ cursor: loadingStatus !== '' && loadingStatus !== 'done' ? 'not-allowed' : 'pointer' }} disabled={loadingStatus !== '' && loadingStatus !== 'done'} onClick={upgrade}>
            {loadingStatus === 'funding' && <span>Funding account...</span>}
            {loadingStatus === 'submitting' && <span>Submitting transaction...</span>}
            {(loadingStatus === '' || loadingStatus === 'done') && <span>Upgrade</span>}
          </Button>
          <Button variant="outline" size="lg" onClick={previousStep}>Back</Button>
        </div>


        {loadingStatus === 'funding' && <span className="text-muted-foreground text-sm">The funding process consists on an OpenZeppelin Relayer sending some testnet tokens to your account in order to self upgrade to smart account</span>}
        {loadingStatus === 'done' && <span>Account deployed! <a className="text-primary hover:underline" href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank">View transaction</a></span>}
      </div>
  )
}