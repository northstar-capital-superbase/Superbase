"use client";

import "./ui.css";

export function Spinner({ size = 13 }: { size?: number }) {
  return (
    <svg
      className="ui-spinner"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" />
    </svg>
  );
}

export function Skeleton({
  width,
  height = 14,
  className,
  style,
}: {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={className ? `ui-skeleton ${className}` : "ui-skeleton"}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}
