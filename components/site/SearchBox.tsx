"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Suggestion = { id: number; title: string; slug: string; category_name: string };

export function SearchBox({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        if (response.ok) {
          const data = (await response.json()) as { items: Suggestion[] };
          setItems(data.items ?? []);
          setOpen(true);
          setActive(-1);
        }
      } catch {
        setItems([]);
      }
    }, 220);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function submit() {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, items.length - 1));
      setOpen(true);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter") {
      if (open && active >= 0 && items[active]) {
        event.preventDefault();
        setOpen(false);
        router.push(`/services/${items[active].slug}`);
      } else {
        event.preventDefault();
        submit();
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className={`search-form ${compact ? "search-form-compact" : ""}`} ref={wrapRef}>
      <label className="visually-hidden" htmlFor={compact ? "navSearch" : "pageSearch"}>
        Search services
      </label>
      <div className="input-group">
        <input
          id={compact ? "navSearch" : "pageSearch"}
          type="search"
          className="form-control"
          placeholder="Search services…"
          value={query}
          autoComplete="off"
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            if (value.trim().length < 2) {
              setItems([]);
              setOpen(false);
            }
          }}
          onKeyDown={onKeyDown}
          onFocus={() => items.length > 0 && setOpen(true)}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={compact ? "navSearchList" : "pageSearchList"}
        />
        <button type="button" className="btn btn-primary" onClick={submit} aria-label="Search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        </button>
      </div>
      <div
        id={compact ? "navSearchList" : "pageSearchList"}
        className={`search-suggestions ${open ? "open" : ""}`}
        role="listbox"
      >
        {items.map((item, index) => (
          <a
            key={item.id}
            href={`/services/${item.slug}`}
            role="option"
            aria-selected={index === active}
            onClick={(event) => {
              event.preventDefault();
              setOpen(false);
              router.push(`/services/${item.slug}`);
            }}
          >
            <span className="d-block small text-secondary">{item.category_name}</span>
            {item.title}
          </a>
        ))}
        {open && items.length === 0 ? (
          <span className="d-block px-3 py-2 small text-secondary">No matching services.</span>
        ) : null}
      </div>
    </div>
  );
}
