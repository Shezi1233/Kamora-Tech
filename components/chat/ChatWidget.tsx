"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { addToCartAction, setCartTokenAction } from "@/lib/actions/cart";
import {
  clearStoredSession,
  ensureChatSession,
  loadHistory,
  readStoredSession,
  streamChat,
  storeSession,
  type ChatEvent,
  type ChatMessage,
  type ChatProduct,
} from "@/lib/chat";
import { imageUrl } from "@/lib/format";
import { Markdown } from "./Markdown";

const SUGGESTIONS = [
  "What services do you offer?",
  "E-commerce website ka price kya hai?",
  "What is your refund policy?",
  "How do I place an order?",
];

const WELCOME =
  "Hi! I'm **Kamora Assistant**. I can help with services, pricing, policies, orders, and your cart. What would you like to know?";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `m-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toast(message: string, tone: "success" | "danger" = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("app:toast", { detail: { message, tone } }));
}

function ProductCard({ product }: { product: ChatProduct }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const src = imageUrl(product.image ?? null);

  async function add() {
    if (pending) return;
    setPending(true);
    try {
      const result = await addToCartAction(product.id);
      if (!result.ok) {
        toast(result.error ?? "Could not add to cart.", "danger");
        return;
      }
      setAdded(true);
      window.dispatchEvent(
        new CustomEvent("cart:count", { detail: { count: result.count } }),
      );
      toast(`${product.title} added to your cart.`);
      router.refresh();
      window.setTimeout(() => setAdded(false), 1800);
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="chat-product-card">
      <div className="chat-product-thumb" aria-hidden="true">
        {src && !imageFailed ? (
          // Plain img: uploads are served by the backend, not next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <i className="fa-solid fa-layer-group" />
        )}
      </div>
      <div className="chat-product-body">
        <span className="chat-product-category">
          {product.category_name ?? "Service"}
        </span>
        <strong className="chat-product-title">{product.title}</strong>
        {product.short_description ? (
          <span className="chat-product-desc">{product.short_description}</span>
        ) : null}
        <span className="chat-product-price">{product.price_label}</span>
        <div className="chat-product-actions">
          <Link
            href={`/services/${product.slug}`}
            className="btn btn-outline-light btn-sm"
          >
            View
          </Link>
          <button
            type="button"
            className={`btn btn-primary btn-sm ${added ? "btn-added" : ""}`}
            onClick={add}
            disabled={pending}
            aria-label={`Add ${product.title} to cart`}
          >
            <i
              className={`fa-solid ${added ? "fa-check" : "fa-cart-plus"} me-1`}
              aria-hidden="true"
            />
            {pending ? "Adding…" : added ? "Added" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function ChatWidget({ user }: { user: { full_name: string } | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [unread, setUnread] = useState(false);

  const initializedRef = useRef(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const wasOpenRef = useRef(false);
  const lastUserRef = useRef<string>("");

  const hasUserMessage = useMemo(
    () => messages.some((message) => message.role === "user"),
    [messages],
  );

  const scrollToBottom = useCallback((smooth = false) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    scrollToBottom(!busy);
  }, [messages, busy, scrollToBottom]);

  useEffect(() => {
    if (open) {
      setUnread(false);
      const timer = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(timer);
    }
    if (wasOpenRef.current) launcherRef.current?.focus();
    wasOpenRef.current = open;
    return undefined;
  }, [open]);

  const initialize = useCallback(async () => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    setInitializing(true);
    setInitError(null);
    try {
      const stored = readStoredSession();
      const sid = await ensureChatSession(stored);
      setSessionId(sid);
      if (stored) {
        const history = await loadHistory(sid);
        if (history.length > 0) {
          setMessages(
            history.map((item) => ({
              id: `h-${item.id}`,
              role: item.role,
              content: item.content,
              products: item.products ?? [],
            })),
          );
        }
      }
    } catch {
      setInitError("The assistant is offline right now. Please try again.");
      initializedRef.current = false;
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    if (open) void initialize();
  }, [open, initialize]);

  const handleEvent = useCallback(
    (assistantId: string, event: ChatEvent) => {
      if (event.type === "delta") {
        const delta = event.content;
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: message.content + delta, streaming: true }
              : message,
          ),
        );
        if (!open) setUnread(true);
        return;
      }

      if (event.type === "products") {
        const products = event.products ?? [];
        setMessages((current) =>
          current.map((message) => {
            if (message.id !== assistantId) return message;
            const existing = message.products ?? [];
            const merged = [...existing];
            for (const product of products) {
              const index = merged.findIndex((item) => item.id === product.id);
              if (index === -1) merged.push(product);
              else merged[index] = product;
            }
            return { ...message, products: merged };
          }),
        );
        return;
      }

      if (event.type === "cart_updated") {
        const count = event.count ?? event.cart?.item_count ?? 0;
        window.dispatchEvent(
          new CustomEvent("cart:count", { detail: { count } }),
        );
        const token = event.cart?.cart_token;
        if (token) {
          void setCartTokenAction(token).catch(() => undefined);
        }
        toast(event.action === "remove" ? "Removed from your cart." : "Added to your cart.");
        router.refresh();
        return;
      }

      if (event.type === "error") {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  content:
                    event.message ||
                    "Something went wrong. Please try again.",
                  error: true,
                  streaming: false,
                }
              : message,
          ),
        );
        return;
      }

      if (event.type === "done") {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, streaming: false }
              : message,
          ),
        );
      }
    },
    [open, router],
  );

  const send = useCallback(
    async (raw?: string) => {
      const text = (raw ?? input).trim();
      if (!text || busy) return;

      let sid = sessionId;
      if (!sid) {
        try {
          sid = await ensureChatSession(readStoredSession());
          setSessionId(sid);
        } catch {
          toast("Could not start the chat. Please retry.", "danger");
          setInitError("The assistant is offline right now. Please try again.");
          return;
        }
      }

      lastUserRef.current = text;
      setInput("");
      setBusy(true);
      setInitError(null);

      const assistantId = newId();
      setMessages((current) => [
        ...current,
        { id: newId(), role: "user", content: text },
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ]);

      try {
        await streamChat({
          sessionId: sid,
          message: text,
          onEvent: (event) => handleEvent(assistantId, event),
        });
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  streaming: false,
                  content:
                    message.content ||
                    "I could not generate a reply. Please try again.",
                }
              : message,
          ),
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.";
        setMessages((current) =>
          current.map((item) =>
            item.id === assistantId
              ? { ...item, content: message, error: true, streaming: false }
              : item,
          ),
        );
      } finally {
        setBusy(false);
      }
    },
    [busy, handleEvent, input, sessionId],
  );

  const retry = useCallback(() => {
    const text = lastUserRef.current;
    if (!text || busy) return;
    setMessages((current) => {
      const next = [...current];
      while (next.length > 0 && next[next.length - 1].role === "assistant") {
        next.pop();
      }
      while (next.length > 0 && next[next.length - 1].role === "user") {
        next.pop();
      }
      return next;
    });
    void send(text);
  }, [busy, send]);

  const clearChat = useCallback(async () => {
    setBusy(false);
    lastUserRef.current = "";
    clearStoredSession();
    setMessages([{ id: "welcome", role: "assistant", content: WELCOME }]);
    setInitError(null);
    try {
      const sid = await ensureChatSession(null);
      setSessionId(sid);
      storeSession(sid);
    } catch {
      setSessionId(null);
    }
    inputRef.current?.focus();
  }, []);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  }

  function onPanelKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      setOpen(false);
    }
  }

  const firstName = user?.full_name?.trim().split(/\s+/)[0] ?? null;

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className={`chat-launcher ${open ? "is-open" : ""}`}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={open}
        aria-controls="kamora-chat-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <i
          className={`fa-solid ${open ? "fa-xmark" : "fa-comment-dots"}`}
          aria-hidden="true"
        />
        {!open && unread ? <span className="chat-launcher-dot" aria-hidden="true" /> : null}
      </button>

      {open ? (
        <section
          id="kamora-chat-panel"
          className="chat-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="kamora-chat-title"
          onKeyDown={onPanelKeyDown}
        >
          <header className="chat-header">
            <div className="chat-brand">
              <span className="chat-brand-mark" aria-hidden="true">
                K
              </span>
              <div className="chat-brand-text">
                <strong id="kamora-chat-title">Kamora Assistant</strong>
                <span>
                  <span className="chat-status-dot" aria-hidden="true" />
                  {initializing ? "Connecting…" : "Online"}
                </span>
              </div>
            </div>
            <div className="chat-header-actions">
              <button
                type="button"
                className="chat-icon-btn"
                onClick={clearChat}
                aria-label="Clear chat"
                title="Clear chat"
              >
                <i className="fa-solid fa-rotate-left" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="chat-icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                title="Close chat"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div
            className="chat-messages"
            ref={scrollerRef}
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-row ${message.role === "user" ? "is-user" : "is-assistant"}`}
              >
                {message.role === "assistant" ? (
                  <span className="chat-avatar" aria-hidden="true">
                    <i className="fa-solid fa-headset" />
                  </span>
                ) : null}
                <div className={`chat-bubble ${message.error ? "is-error" : ""}`}>
                  {message.role === "assistant" ? (
                    message.content ? (
                      <Markdown text={message.content} />
                    ) : message.streaming ? (
                      <span className="chat-typing" aria-label="Assistant is typing">
                        <span />
                        <span />
                        <span />
                      </span>
                    ) : null
                  ) : (
                    <p className="chat-plain" dir="auto">
                      {message.content}
                    </p>
                  )}

                  {message.streaming && message.content ? (
                    <span className="chat-caret" aria-hidden="true" />
                  ) : null}

                  {message.products && message.products.length > 0 ? (
                    <div className="chat-products">
                      {message.products.map((product) => (
                        <ProductCard key={`${message.id}-${product.id}`} product={product} />
                      ))}
                    </div>
                  ) : null}

                  {message.error ? (
                    <button
                      type="button"
                      className="btn btn-outline-light btn-sm mt-2"
                      onClick={retry}
                      disabled={busy}
                    >
                      <i className="fa-solid fa-rotate-right me-1" aria-hidden="true" />
                      Retry
                    </button>
                  ) : null}
                </div>
              </div>
            ))}

            {initError ? (
              <div className="chat-row is-assistant">
                <div className="chat-bubble is-error">
                  <p className="chat-plain">{initError}</p>
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm mt-2"
                    onClick={() => void initialize()}
                  >
                    Retry connection
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {!hasUserMessage && !busy ? (
            <div className="chat-suggestions" aria-label="Suggested questions">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="chat-chip"
                  onClick={() => void send(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}

          <form className="chat-composer" onSubmit={onSubmit}>
            <label className="visually-hidden" htmlFor="kamora-chat-input">
              Message
            </label>
            <textarea
              id="kamora-chat-input"
              ref={inputRef}
              className="form-control chat-input"
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={
                firstName
                  ? `Ask anything, ${firstName}…`
                  : "Ask about services, pricing, orders…"
              }
              maxLength={2000}
              dir="auto"
              disabled={busy}
            />
            <button
              type="submit"
              className="btn btn-primary chat-send"
              disabled={busy || !input.trim()}
              aria-label="Send message"
            >
              <i
                className={`fa-solid ${busy ? "fa-spinner fa-spin" : "fa-paper-plane"}`}
                aria-hidden="true"
              />
            </button>
          </form>
          <p className="chat-foot">
            AI can make mistakes. Confirm pricing before ordering.
          </p>
        </section>
      ) : null}
    </>
  );
}
