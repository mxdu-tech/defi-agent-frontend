const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ChatResponse {
  session_id: string;
  reply: string;
  awaiting_confirmation: boolean;
  pending_action: Record<string, unknown> | null;
}

export async function sendMessage(
  message: string,
  sessionId?: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function confirmAction(
  sessionId: string,
  reply: "yes" | "no"
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, reply }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}