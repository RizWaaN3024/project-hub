import type { HTMLAttributes } from "react";
import "./ui-stub.css";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "column";
}

export function Stack({ direction = "column", className = "", ...rest }: StackProps) {
  const dir = direction === "row" ? "ph-stack--row" : "ph-stack--col";
  return <div className={`ph-stack ${dir} ${className}`.trim()} {...rest} />;
}
