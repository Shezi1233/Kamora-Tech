"use client";

import type { ReactNode } from "react";

function safeHref(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (value.startsWith("/") || value.startsWith("#")) return value;
  if (/^https?:\/\//i.test(value) || /^mailto:/i.test(value)) return value;
  return null;
}

const INLINE_PATTERN = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const pattern = new RegExp(INLINE_PATTERN.source, "g");

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    const key = `${keyPrefix}-${match.index}`;
    if (token.startsWith("[")) {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (link) {
        const href = safeHref(link[2]);
        if (href) {
          nodes.push(
            <a
              key={key}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {link[1]}
            </a>,
          );
        } else {
          nodes.push(link[1]);
        }
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else {
      nodes.push(token);
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function Markdown({ text }: { text: string }) {
  const lines = (text ?? "").replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;
  let key = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push(
        <pre key={`pre-${key++}`}>
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      const level = Math.min(heading[1].length + 2, 6);
      const content = renderInline(heading[2], `h-${key}`);
      if (level === 3) blocks.push(<h4 key={`h-${key++}`}>{content}</h4>);
      else if (level === 4) blocks.push(<h5 key={`h-${key++}`}>{content}</h5>);
      else blocks.push(<h6 key={`h-${key++}`}>{content}</h6>);
      index += 1;
      continue;
    }

    if (/^\s*([-*])\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*([-*])\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*([-*])\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ul key={`ul-${key++}`}>
          {items.map((item, itemIndex) => (
            <li key={`li-${key}-${itemIndex}`}>
              {renderInline(item, `li-${key}-${itemIndex}`)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+[.)]\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ol key={`ol-${key++}`}>
          {items.map((item, itemIndex) => (
            <li key={`oli-${key}-${itemIndex}`}>
              {renderInline(item, `oli-${key}-${itemIndex}`)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      blocks.push(
        <blockquote key={`bq-${key++}`}>
          {renderInline(quote.join(" "), `bq-${key}`)}
        </blockquote>,
      );
      continue;
    }

    if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) {
      blocks.push(<hr key={`hr-${key++}`} />);
      index += 1;
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,4})\s+/.test(lines[index]) &&
      !/^\s*([-*])\s+/.test(lines[index]) &&
      !/^\s*\d+[.)]\s+/.test(lines[index]) &&
      !/^\s*>\s?/.test(lines[index]) &&
      !lines[index].trim().startsWith("```")
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(
      <p key={`p-${key++}`}>{renderInline(paragraph.join(" "), `p-${key}`)}</p>,
    );
  }

  return <div className="chat-markdown" dir="auto">{blocks}</div>;
}
