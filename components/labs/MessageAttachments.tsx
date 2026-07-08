import type { Attachment } from "@/components/chat/Chat";
import "./chat-ui.css";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Read-only render of a user turn's attachments (image thumbnails + file chips).
export function MessageAttachments({ items }: { items: Attachment[] }) {
  if (!items.length) return null;
  return (
    <div className="msg-atts">
      {items.map((a) =>
        a.kind === "image" && a.dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={a.id} className="msg-att-img" src={a.dataUrl} alt={a.name} />
        ) : (
          <span key={a.id} className="cmp-chip msg-att-file">
            <FileIcon />
            <span className="cmp-chip-name">{a.name}</span>
            <span className="cmp-chip-size">{formatSize(a.size)}</span>
          </span>
        ),
      )}
    </div>
  );
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}
