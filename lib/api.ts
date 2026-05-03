export interface ChatResponse {
  response: string;
  session_id?: string;
  awaiting_confirmation?: boolean;
  pending_action?: Record<string, unknown>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function sendMessage(
  message: string,
  sessionId: string = "default"
): Promise<ChatResponse> {
  console.log("API_URL =", API_URL);
  console.log("sending:", message, sessionId);

  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      session_id: sessionId,
    }),
  });

  console.log("status:", res.status);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch");
  }

  const data = await res.json();
  console.log("response data:", data);

  return data;
}

export async function confirmAction(
  sessionId: string,
  reply: string,
  txHash?: string
) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      reply,
      tx_hash: txHash,
    }),
  });

  return res.json();
}