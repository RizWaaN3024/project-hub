import projectsData from "./projects.json";
import type { Project } from "@/types";

const STORAGE_KEY = "project_hub_lite_projects";

let allProjects: Project[] = loadProjects();
const subscribers = new Set<() => void>();

function loadProjects(): Project[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed as Project[];
        }
    } catch (error) {
        console.error("[ProjectStore] Failed to load projects from localStorage")
    }
    return projectsData as Project[];
}

function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allProjects));
    } catch (error) {
        console.error("[ProjectStore] Failed to persist projects to localStorage")
    }
}

function notify() {
    for (const cb of subscribers) cb();
}

export function getAllProjects(): Project[] {
    return allProjects;
}

export function subscribeToProjects(cb: () => void) {
    subscribers.add(cb);
    return () => {
        subscribers.delete(cb);
    }
}

export function addProject(project: Project) {
    allProjects = [project, ...allProjects];
    persist();
    notify();
}

export function updateProject(id: string, patch: Partial<Omit<Project, "id">>) {
    allProjects = allProjects.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
    );
    persist();
    notify();
}