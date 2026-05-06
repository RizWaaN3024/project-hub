import type { ButtonHTMLAttributes } from "react";
import "./ui-stub.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

export function Button({ className = "", variant = "primary", ...rest }: ButtonProps) {
  const v = variant === "ghost" ? " ph-btn--ghost" : "";
  return <button type="button" className={`ph-btn${v} ${className}`.trim()} {...rest} />;
}
