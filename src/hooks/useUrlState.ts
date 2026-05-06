import { ProjectStatus } from "@/types";
import { useCallback, useMemo, useSyncExternalStore } from "react";

export type UrlState = {
    q: string;
    status: ProjectStatus | null;
    tags: string[];
    selected: string | null;
};

const VALID_STATUSES: readonly ProjectStatus[] = ["active", "paused", "archived"];

// Custom event so all useUrlState consumers re-render when any one calls
// setState - history.replaceState does not fire popstate on its own.
const URL_STATE_EVENT = "urlstatechange";

function parseSearch(search: string): UrlState {
    const params = new URLSearchParams(search);
    const rawStatus = params.get("status");
    const status = VALID_STATUSES.includes(rawStatus as ProjectStatus) ? (rawStatus as ProjectStatus) : null;

    return {
        q: params.get("q") ?? "",
        status,
        tags: params.getAll("tag").filter(Boolean),
        selected: params.get("selected"),
    };
}

function serializeSearch(state: UrlState): string {
    const params = new URLSearchParams();
    if (state.q) params.set("q", state.q);
    if (state.status) params.set("status", state.status);
    for (const tag of state.tags) params.append("tag", tag);
    if (state.selected) params.set("selected", state.selected);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
}

function subscribe(callback: () => void) {
    window.addEventListener("popstate", callback);
    window.addEventListener(URL_STATE_EVENT, callback);
    return () => {
        window.removeEventListener("popstate", callback);
        window.removeEventListener(URL_STATE_EVENT, callback);
    };
}

function getSearchSnapshot() {
    return window.location.search;
}

export function useUrlState() {
    const search = useSyncExternalStore(subscribe, getSearchSnapshot, getSearchSnapshot);
    const state = useMemo(() => parseSearch(search), [search]);

    const setState = useCallback((patch: Partial<UrlState>) => {
        const current = parseSearch(window.location.search);
        const next = { ...current, ...patch };
        const newSearch = serializeSearch(next);
        const url = `${window.location.pathname}${newSearch}${window.location.hash}`;
        window.history.replaceState(null, "", url);
        window.dispatchEvent(new Event(URL_STATE_EVENT));
    }, []);

    return { state, setState };
}
