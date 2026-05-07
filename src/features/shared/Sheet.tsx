import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Text } from "@/ui-stub";

type Props = {
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
};

export function Sheet({ onClose, title, description, children }: Props) {
  const panelRef = useRef<HTMLElement>(null);

  // Focus the panel on open so screen readers announce the dialog title.
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  // Lock body scroll while the sheet is open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Close on Escape from anywhere (the global App-level Esc handler also
  // fires, but only acts when state.selected is set, so they don't conflict).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="detail-backdrop absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="detail-panel absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <Text as="h2" tone="title" className="!mb-0">
              {title}
            </Text>
            {description && (
              <Text tone="muted" className="!mt-1">
                {description}
              </Text>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </aside>
    </div>
  );
}
