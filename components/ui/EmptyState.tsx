"use client";

import type { ReactNode } from "react";
import "./ui.css";

export function EmptyState({
  icon,
  title,
  description,
  children,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="ui-empty">
      {icon && <div className="ui-empty-mark">{icon}</div>}
      <div>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
