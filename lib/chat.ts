export type ChatProduct = {
  id: number;
  title: string;
  slug: string;
  short_description?: string | null;
  price?: string | null;
  price_label: string;
  delivery_estimate?: string | null;
  image?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  quantity?: number;
  item_id?: number;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  products?: ChatProduct[];
  error?: boolean;
  streaming?: boolean;
};

export type ChatEvent =
  | { type: "start"; session_id?: string }
  | { type: "delta"; content: string }
  | { type: "products"; products: ChatProduct[] }
  | {
      type: "cart_updated";
      action?: string;
      count?: number;
      cart?: {
        item_count?: number;
        cart_token?: string | null;
        has_quote?: boolean;
        subtotal_label?: string;
      };
    }
  | { type: "tool"; name: string; status: "start" | "done" }
  | { type: "error"; message: string }
  | { type: "done" };

const SESSION_KEY = "kamora_chat_session_v1";

export function readStoredSession(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function storeSession(sessionId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, sessionId);
  } catch {
    /* storage may be unavailable */
  }
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export async function ensureChatSession(existing: string | null): Promise<string> {
  const response = await fetch("/api/chatbot/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ session_id: existing }),
  });
  if (!response.ok) {
    throw new Error("Could not start a chat session.");
  }
  const data = (await response.json()) as { session_id?: string };
  if (!data.session_id) {
    throw new Error("Chat session is unavailable.");
  }
  storeSession(data.session_id);
  return data.session_id;
}

export async function loadHistory(
  sessionId: string,
): Promise<Array<{ id: number; role: ChatRole; content: string; products?: ChatProduct[] }>> {
  const response = await fetch(`/api/chatbot/history/${encodeURIComponent(sessionId)}`, {
    method: "GET",
    credentials: "same-origin",
  });
  if (!response.ok) return [];
  const data = (await response.json()) as {
    messages?: Array<{
      id: number;
      role: ChatRole;
      content: string;
      products?: ChatProduct[];
    }>;
  };
  return data.messages ?? [];
}

function parseEventBlock(block: string): ChatEvent | null {
  const dataLines: string[] = [];
  for (const line of block.split("\n")) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("data:")) {
      dataLines.push(trimmed.slice(5).trimStart());
    }
  }
  if (dataLines.length === 0) return null;
  const payload = dataLines.join("\n");
  if (!payload) return null;
  try {
    return JSON.parse(payload) as ChatEvent;
  } catch {
    return null;
  }
}

export async function streamChat({
  sessionId,
  message,
  signal,
  onEvent,
}: {
  sessionId: string;
  message: string;
  signal?: AbortSignal;
  onEvent: (event: ChatEvent) => void;
}): Promise<void> {
  const response = await fetch("/api/chatbot/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    credentials: "same-origin",
    body: JSON.stringify({ session_id: sessionId, message }),
    signal,
  });

  if (!response.ok) {
    let detail = "The assistant is unavailable right now.";
    try {
      const data = (await response.json()) as { detail?: string };
      if (data?.detail) detail = String(data.detail);
    } catch {
      /* keep default */
    }
    throw new Error(detail);
  }
  if (!response.body) {
    throw new Error("Streaming is not supported in this browser.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const event = parseEventBlock(block);
      if (event) onEvent(event);
      boundary = buffer.indexOf("\n\n");
    }
  }

  const tail = buffer.trim();
  if (tail) {
    const event = parseEventBlock(tail);
    if (event) onEvent(event);
  }
}
