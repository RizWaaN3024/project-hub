import type { HTMLAttributes } from "react";
import "./ui-stub.css";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: "h1" | "h2" | "h3" | "p" | "span";
  tone?: "title" | "body" | "muted";
}

export function Text({
  as: Tag = "p",
  tone = "body",
  className = "",
  ...rest
}: TextProps) {
  const toneClass =
    tone === "title" ? "ph-text--title" : tone === "muted" ? "ph-text--muted" : "ph-text--body";
  return <Tag className={`${toneClass} ${className}`.trim()} {...rest} />;
}
