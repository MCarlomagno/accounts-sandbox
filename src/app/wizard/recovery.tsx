import { Button } from "../../components/ui/button"

interface BurnerStepProps {
  nextStep?: () => void;
  previousStep?: () => void;
}

export default function RecoveryStep({ nextStep, previousStep }: BurnerStepProps) {

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold">Set Guardians</h2>

      <p className="text-muted-foreground text-lg">
        Set the guardians of your smart account.
      </p>

      <div className="flex flex-col gap-2 w-full">
          <Button variant="default" size="lg" onClick={nextStep}>
            Confirm Guardians
          </Button>
          <Button variant="outline" size="lg" onClick={previousStep}>Back</Button>
        </div>
    </div>
  )
}