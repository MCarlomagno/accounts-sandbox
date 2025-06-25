import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'
import { Copy, RefreshCcw } from "lucide-react"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useEffect, useState } from 'react';

interface BurnerStepProps {
  onGenerate?: (privateKey: string, address: string) => void;
  nextStep?: () => void;
}

export default function BurnerStep({ onGenerate, nextStep }: BurnerStepProps) {
  const [privateKey, setPrivateKey] = useState('');
  const [address, setAddress] = useState('');

  const generate = () => {
    const newPrivateKey = generatePrivateKey();
    const newAddress = privateKeyToAddress(newPrivateKey);
    setPrivateKey(newPrivateKey);
    setAddress(newAddress);
    
    // Call the callback to pass values to parent
    if (onGenerate) {
      onGenerate(newPrivateKey, newAddress);
    }
  };

  useEffect(() => {
    generate();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold">Burner EOA</h2>

      <p className="text-muted-foreground text-lg">
        Generate a new burner EOA to use for the self-upgrade.
      </p>

      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="address">Address</Label>
        <Input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="privateKey">Private key</Label>
        <div className="flex items-center gap-2 w-full">
          <Input type="password" placeholder="Private key" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} />
          <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(privateKey)}>
            <Copy />
          </Button>
          <Button variant="outline" size="icon" onClick={generate}>
            <RefreshCcw />
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground text-sm text-right">
        ⚠️ Addresses are not persistent if you refresh the page you will 
        need to generate and fund a new one.
        <br />
        There&apos;s no need to note them down, we&apos;ll remember them for you.
      </p>
      <Button variant="default" size="lg" onClick={nextStep}>
          Continue
      </Button>
    </div>
  )
}