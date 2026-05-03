"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount } from "wagmi";
import { WalletButton } from "@/components/WalletButton";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { sendMessage, confirmAction, ChatResponse } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What is the ETH price?",
  `Check balance for 0x8ed7af7d0B09B693a81f38947B9Df15c2f008296`,
  `Analyze Aave position for 0x8ed7af7d0B09B693a81f38947B9Df15c2f008296`,
  `Repay 5 USDC on Aave for 0x8ed7af7d0B09B693a81f38947B9Df15c2f008296`,
];

function parseAgentResponse(raw: string) {
  const actionMatch = raw.match(/\[ACTION\]([\s\S]*?)\[\/ACTION\]/);

  let cleanText = raw;
  let action: Record<string, unknown> | null = null;

  if (actionMatch) {
    try {
      action = JSON.parse(actionMatch[1]);
      cleanText = raw.replace(/\[ACTION\][\s\S]*?\[\/ACTION\]/, "").trim();
    } catch {
      action = null;
    }
  }

  return { cleanText, action };
}

export default function Home() {
  const { address } = useAccount();

  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [sessionId, setSessionId]   = useState<string | undefined>();
  const [awaiting, setAwaiting]     = useState(false);
  const [pendingAction, setPending] = useState<Record<string, unknown> | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-inject wallet address when connected
  useEffect(() => {
    if (address && messages.length === 0) {
      setInput(`My wallet address is ${address}`);
    }
  }, [address]);

  async function handleSend(text?: string) {
    const message = text ?? input.trim();
    if (!message || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);

    try {
      const res: ChatResponse = await sendMessage(message, sessionId ?? "default");
      setSessionId(res.session_id ?? sessionId ?? "default");

      const parsed = parseAgentResponse(res.response);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: parsed.cleanText },
      ]);

      if (parsed.action) {
        setAwaiting(true);
        setPending(parsed.action);
      }

    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${(e as Error).message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(txHash?: string) {
    const sid = sessionId ?? "default";
  
    setConfirmLoading(true);
  
    try {
      const res = await confirmAction(sid, "yes", txHash);
  
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.response },
      ]);
  
      const refresh = await sendMessage(
        "Check my updated Aave position",
        sid
      );
  
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Updated Aave position:\n\n" + refresh.response,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${(e as Error).message}` },
      ]);
    } finally {
      setSessionId(sid);
      setAwaiting(false);
      setPending(null);
      setConfirmLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-lg">DeFi Portfolio Agent</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            LangGraph · Claude · Aave V3 · Base Sepolia
          </p>
        </div>
        <WalletButton />
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center mt-20">
            <p className="text-gray-500 mb-6 text-sm">
              Ask about your DeFi portfolio
            </p>
            <div className="grid grid-cols-1 gap-2 max-w-lg mx-auto">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left px-4 py-3 rounded-lg border border-gray-800 hover:border-gray-600 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {s.length > 60 ? s.slice(0, 60) + "..." : s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap break-words leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-gray-800 text-gray-200 rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer className="border-t border-gray-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about your DeFi portfolio..."
            disabled={loading || awaiting}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-gray-500 disabled:opacity-50 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || awaiting || !input.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-sm font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </footer>

      {/* Confirmation Modal */}
      {awaiting && pendingAction && (
        <ConfirmationModal
          pendingAction={pendingAction}
          onConfirm={(hash) => handleConfirm(hash)}
          onCancel={() => {
            setAwaiting(false);
            setPending(null);
          }}
          loading={confirmLoading}
      />
    )}
    </div>
  );
}