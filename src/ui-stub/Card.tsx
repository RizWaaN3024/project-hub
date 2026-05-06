import type { HTMLAttributes } from "react";
import "./ui-stub.css";

export function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`ph-card ${className}`.trim()} {...rest} />;
}
