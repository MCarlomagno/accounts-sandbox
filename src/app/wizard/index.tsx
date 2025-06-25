import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import BurnerStep from './burner';
import UpgradeStep from './upgrade';
import RecoveryStep from './recovery';

type Step = 'burner' | 'recovery' | 'account' | 'done';
const progressMap: Record<Step, number> = {
  burner: 1,
  recovery: 33,
  account: 66,
  done: 100
}

export default function Wizard() {
  const [privateKey, setPrivateKey] = useState('');
  const [address, setAddress] = useState('');

  const [step, setStep] = useState<Step>('burner');
  const [progress, setProgress] = useState(progressMap[step]);

  const handleGenerate = (newPrivateKey: string, newAddress: string) => {
    setPrivateKey(newPrivateKey);
    setAddress(newAddress);
  };

  useEffect(() => {
    setProgress(progressMap[step]);
  }, [step]);

  return (
    <Card className="flex flex-col gap-8 p-8 dark:bg-slate-950">
      <Progress value={progress} className="w-full h-4" />
      {step === 'burner' && <BurnerStep onGenerate={handleGenerate} nextStep={() => setStep('recovery')} />}
      {step === 'recovery' && <RecoveryStep nextStep={() => setStep('account')} previousStep={() => setStep('burner')} />}
      {step === 'account' && <UpgradeStep address={address} privateKey={privateKey} nextStep={() => setStep('done')} previousStep={() => setStep('recovery')} />}
    </Card>
  )
}