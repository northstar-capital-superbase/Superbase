"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui";
import type { PendingItem } from "@/lib/dashboard/briefing";
import { CcSection } from "./CcSection";

// Only real, actionable setup items (from buildPendingItems). When there's
// nothing to do we show a calm "all set" state rather than padding the list.
export function PendingItems({
  items,
  loading,
}: {
  items: PendingItem[];
  loading: boolean;
}) {
  return (
    <CcSection
      label="Pending items"
      busy={loading}
      meta={
        !loading && items.length > 0 ? (
          <span className="cc-count">{items.length}</span>
        ) : null
      }
      bodyClassName={!loading && items.length ? "cc-body cc-body--flush" : "cc-body"}
    >
      {loading ? (
        <div aria-hidden="true">
          <Skeleton width="60%" height={14} />
          <Skeleton width="85%" height={12} style={{ marginTop: 8 }} />
        </div>
      ) : items.length === 0 ? (
        <div className="cc-allset">
          <span className="cc-allset-check" aria-hidden="true">
            <CheckIcon />
          </span>
          <div>
            <p className="cc-allset-title">You&rsquo;re all set</p>
            <p className="cc-allset-note">Nothing needs your attention right now.</p>
          </div>
        </div>
      ) : (
        <ul className="cc-pending">
          {items.map((item) => (
            <li key={item.id} className="cc-pending-item">
              <div className="cc-pending-main">
                <span className="cc-pending-title">{item.title}</span>
                <span className="cc-pending-desc">{item.description}</span>
              </div>
              <Link href={item.href} className="cc-pending-action">
                {item.cta}
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CcSection>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
