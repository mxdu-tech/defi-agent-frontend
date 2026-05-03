"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export function WalletButton() {
  const [mounted, setMounted] = useState(false);

  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <button disabled>Connect Wallet</button>;
  }

  const connector = connectors[0];

  if (isConnected && address) {
    return (
      <button onClick={() => disconnect()}>
        {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => connect({ connector })}
        disabled={!connector || isPending}
      >
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>

      {error && <p className="text-red-500">{error.message}</p>}
    </div>
  );
}