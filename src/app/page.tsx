"use client";
import Wizard from "./wizard";

export default function Home() {
  return (
    <div className="flex flex-row gap-4 justify-center min-h-svh mx-auto max-w-6xl py-16">
      <div className="flex flex-col gap-2 w-1/3 align-top">
        <h1 className="text-2xl font-bold mb-8">Smart Accounts Sandbox</h1>
        <p className="text-muted-foreground">
          Welcome to the OpenZeppelin smart accounts sandbox! This is a safe, 
          risk free environment for experimenting with smart account functionality. 
          <br/>
          All EOAs used in this sandbox are <strong>burner EOAs*</strong> and 
          cannot be accessed when this session is complete. We will never ask for 
          private keys or sensitive information.
        </p>
        <p className="text-muted-foreground">
          <strong>* Burner EOAs</strong> are temporary test wallets generated for this session.
          They allow you to explore smart account features without risk.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-2/3">
        <Wizard />
      </div>
    </div>
  );
}
