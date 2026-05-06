import { describe, it, expect } from "vitest";
import { filterProjects } from "./filterProjects";
import type { Project } from "@/types";

const projects: Project[] = [
    {
        id: "a", title: "Ads Console", description: "campaigns", status: "active",
        owner: "Aurora", updatedAt: "2026-01-01", tags: ["ads", "metrics"]
    },
    {
        id: "b", title: "Audit Log", description: "compliance trail", status: "paused",
        owner: "Core", updatedAt: "2026-01-02", tags: ["audit", "compliance"]
    },
    {
        id: "c", title: "Legacy Importer", description: "csv tool", status: "archived",
        owner: "Core", updatedAt: "2026-01-03", tags: ["legacy", "import"]
    },
];

const empty = { q: "", status: null, tags: [], selected: null };


describe("filterProjects", () => {
    it("returns all projects with no filters", () => {
        expect(filterProjects(projects, empty)).toHaveLength(3);
    });

    it("matches title case-insensitively", () => {
        expect(filterProjects(projects, { ...empty, q: "AUDIT" })).toEqual([projects[1]]);
    });

    it("matches description text", () => {
        expect(filterProjects(projects, { ...empty, q: "csv" })).toEqual([projects[2]]);
    });

    it("filters by status", () => {
        expect(filterProjects(projects, { ...empty, status: "paused" })).toEqual([projects[1]]);
    });

    it("returns projects matching ANY selected tag (OR within tags)", () => {
        const result = filterProjects(projects, { ...empty, tags: ["ads", "audit"] });
        expect(result).toHaveLength(2);
    });

    it("combines filters with AND across categories", () => {
        const result = filterProjects(projects, { ...empty, q: "log", status: "paused" });
        expect(result).toEqual([projects[1]]);
    });

    it("returns empty when filters match nothing", () => {
        expect(filterProjects(projects, { ...empty, q: "nothing-matches" })).toEqual([]);
    });
});