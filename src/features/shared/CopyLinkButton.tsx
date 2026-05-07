import { useEffect, useRef, useState } from "react";
import { Button } from "@/ui-stub";

const FEEDBACK_DURATION_MS = 2000;

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setFailed(false);
    } catch {
      setFailed(true);
      setCopied(false);
    } finally {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopied(false);
        setFailed(false);
      }, FEEDBACK_DURATION_MS);
    }
  };

  const label = copied ? "Copied!" : failed ? "Copy failed" : "Copy link";
  const announcement = copied
    ? "Link copied to clipboard"
    : failed
      ? "Couldn't copy link to clipboard"
      : "";

  return (
    <>
      <Button variant="ghost" onClick={handleClick} aria-label="Copy link to current view">
        {label}
      </Button>
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
