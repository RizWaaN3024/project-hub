import type { Project } from "@/types";
import projectsData from "./projects.json";
import type { UrlState } from "@/hooks/useUrlState";
import { filterProjects } from "@/utils/filterProjects";

const allProjects = projectsData as Project[];

const FETCH_DELAY_MIN = 200;
const FETCH_DELAY_MAX = 900;
const ERROR_RATE = 0.05;

export function fetchProjects(filters: UrlState, signal: AbortSignal): Promise<Project[]> {
    return new Promise((resolve, reject) => {
        const delay = FETCH_DELAY_MIN + Math.random() * (FETCH_DELAY_MAX - FETCH_DELAY_MIN);

        const timeoutId = setTimeout(() => {
            if (signal.aborted) {
                reject(new DOMException("Aborted", "AbortError"));
                return;
            }

            if (Math.random() < ERROR_RATE) {
                reject(new Error("Failed to load projects"));
                return;
            }

            resolve(filterProjects(allProjects, filters));
        }, delay);

        signal.addEventListener("abort", () => {
            clearTimeout(timeoutId);
            reject(new DOMException("Aborted", "AbortError"));
        })
    })
}