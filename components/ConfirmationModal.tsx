"use client";

import { useState } from "react";
import {
  useAccount,
  usePublicClient,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";

interface TxPayload {
  to: `0x${string}`;
  data: `0x${string}`;
  value?: string;
  gas?: number;
}

interface PendingAction {
  type: string;
  amount_usdc?: number;
  user_address?: string;
  network?: string;
  chain_id?: number;
  need_approve?: boolean;
  approve_tx?: TxPayload | null;
  repay_tx?: TxPayload;
}

interface Props {
  pendingAction: Record<string, unknown>;
  onConfirm: (txHash?: string) => void;
  onCancel: () => void;
  loading: boolean;
}

export function ConfirmationModal({
  pendingAction,
  onConfirm,
  onCancel,
  loading,
}: Props) {
  const action = pendingAction as unknown as PendingAction;

  const { isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync, isPending } = useSendTransaction();
  const publicClient = usePublicClient();

  const [step, setStep] = useState("");

  async function handleConfirm() {
    if (!isConnected) {
      alert("Please connect wallet first.");
      return;
    }

    if (!action.repay_tx) {
      alert("Missing repay transaction payload.");
      return;
    }

    if (!publicClient) {
      alert("Public client is not ready.");
      return;
    }

    try {
      await switchChainAsync({ chainId: baseSepolia.id });

      if (action.need_approve && action.approve_tx) {
        setStep("Waiting for approve signature...");

        const approveHash = await sendTransactionAsync({
          to: action.approve_tx.to,
          data: action.approve_tx.data,
          value: BigInt(action.approve_tx.value ?? "0"),
        });

        setStep("Waiting for approve confirmation...");

        await publicClient.waitForTransactionReceipt({
          hash: approveHash,
        });
      }

      setStep("Waiting for repay signature...");

      const repayHash = await sendTransactionAsync({
        to: action.repay_tx.to,
        data: action.repay_tx.data,
        value: BigInt(action.repay_tx.value ?? "0"),
      });

      // 拿到 repay hash 后立刻通知父组件，让 modal 消失
      onConfirm(repayHash);
    } catch (err) {
      console.error("Transaction failed:", err);
      setStep("");
      alert((err as Error).message || "Transaction rejected or failed.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-yellow-500/50 rounded-xl p-6 max-w-md w-full shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-4">
          Confirm Transaction
        </h2>

        <div className="bg-gray-800 rounded-lg p-4 mb-6 space-y-2 text-sm">
          <Row label="Action" value={action.type} />
          <Row label="Amount" value={`${action.amount_usdc ?? "-"} USDC`} />
          <Row label="Network" value={action.network ?? "-"} />
          <Row label="Need approve" value={String(action.need_approve)} />
          <Row label="Wallet" value={action.user_address ?? "-"} />
          <Row
            label="Approve target"
            value={action.approve_tx?.to ?? "Not needed"}
          />
          <Row label="Repay target" value={action.repay_tx?.to ?? "-"} />
        </div>

        <p className="text-xs text-gray-500 mb-3">
          This transaction will be signed by your wallet. Please verify all
          details in MetaMask.
        </p>

        {step && <p className="text-xs text-yellow-400 mb-4">{step}</p>}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading || isPending}
            className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading || isPending}
            className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium transition-colors disabled:opacity-50"
          >
            {isPending ? "Waiting..." : "Confirm & Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="text-gray-200 text-right break-all">{value}</span>
    </div>
  );
}