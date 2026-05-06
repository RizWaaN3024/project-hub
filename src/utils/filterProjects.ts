import type { Project } from "@/types";
import type { UrlState } from "@/hooks/useUrlState";

export function filterProjects(projects: Project[], filters: UrlState): Project[] {
    const q = filters.q.trim().toLowerCase();

    return projects.filter((project) => {
        const matchesSearch = !q || project.title.toLowerCase().includes(q) || project.description.toLowerCase().includes(q);

        const matchesStatus = !filters.status || project.status === filters.status;

        const matchesTags = filters.tags.length === 0 || filters.tags.some((tag) => project.tags.includes(tag));

        return matchesSearch && matchesStatus && matchesTags;
    })


}