import { Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

export function CopyLinkButton() {
  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied", {
        description: "Share this URL to open the same view.",
      });
    } catch {
      toast.error("Couldn't copy link", {
        description: "Try copying the address bar manually.",
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Copy link to current view"
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 sm:px-3"
    >
      <LinkIcon aria-hidden="true" className="h-4 w-4 text-slate-500" />
      <span className="hidden sm:inline">Copy link</span>
    </button>
  );
}
