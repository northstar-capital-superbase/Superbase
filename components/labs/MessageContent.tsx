import { Fragment, type ReactNode } from "react";
import "./chat-ui.css";

// Lightweight, dependency-free markdown renderer for assistant replies so they
// read like Claude/ChatGPT: headings, bullet/numbered lists, bold, italics and
// inline code — without pulling in a full markdown library or dangerouslySet.

type Block =
  | { type: "p"; text: string }
  | { type: "h"; level: number; text: string }
  | { type: "list"; ordered: boolean; items: string[] };

function parseBlocks(input: string): Block[] {
  const lines = input.replace(/\r/g, "").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "p", text: para.join(" ") });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({ type: "list", ordered: list.ordered, items: list.items });
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const ordered = line.match(/^\d+[.)]\s+(.*)$/);

    if (heading) {
      flushPara();
      flushList();
      blocks.push({ type: "h", level: heading[1].length, text: heading[2] });
    } else if (bullet) {
      flushPara();
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1]);
    } else if (ordered) {
      flushPara();
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(ordered[1]);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g;

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function MessageContent({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  return (
    <div className="md">
      {blocks.map((b, i) => {
        if (b.type === "h") {
          const level = Math.min(b.level + 2, 4);
          const Tag = `h${level}` as "h3" | "h4";
          return <Tag key={i}>{renderInline(b.text)}</Tag>;
        }
        if (b.type === "list") {
          const items = b.items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ));
          return b.ordered ? <ol key={i}>{items}</ol> : <ul key={i}>{items}</ul>;
        }
        return <p key={i}>{renderInline(b.text)}</p>;
      })}
    </div>
  );
}
