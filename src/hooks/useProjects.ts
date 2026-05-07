import { fetchProjects } from "@/data/fakeApi";
import type { Project, ProjectStatus } from "@/types";
import { useEffect, useState } from "react";


type Result = {
    data: Project[];
    loading: boolean;
    error: Error | null;
    retry: () => void;
}

export function useProjects(q: string, status: ProjectStatus | null, tags: string[]): Result {
    const [data, setData] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [retryNonce, setRetryNonce] = useState(0);

    const tagsKey = tags.join("|");

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        fetchProjects({ q, status, tags, selected: null }, controller.signal)
            .then((result) => {
                setData(result);
                setLoading(false);
            })
            .catch((err: unknown) => {
                if (err instanceof DOMException && err.name === "AbortError") return;
                setError(err instanceof Error ? err : new Error(String(err)));
                setLoading(false);
            });

        return () => controller.abort();
    }, [q, status, tagsKey, retryNonce]);

    return {
        data,
        loading,
        error,
        retry: () => setRetryNonce((n) => n + 1),
    };

}