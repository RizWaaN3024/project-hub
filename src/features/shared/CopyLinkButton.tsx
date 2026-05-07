import { useEffect, useRef, useState } from "react";
import { Check, Link as LinkIcon } from "lucide-react";

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

  const label = copied ? "Copied" : failed ? "Copy failed" : "Copy link";
  const announcement = copied
    ? "Link copied to clipboard"
    : failed
      ? "Couldn't copy link to clipboard"
      : "";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Copy link to current view"
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
      >
        {copied ? (
          <Check aria-hidden="true" className="h-4 w-4 text-emerald-600" />
        ) : (
          <LinkIcon aria-hidden="true" className="h-4 w-4 text-slate-500" />
        )}
        <span>{label}</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
