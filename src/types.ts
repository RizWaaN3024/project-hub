export type ProjectStatus = "active" | "paused" | "archived";

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  owner: string;
  updatedAt: string;
  /** Filter facets; each project has several tags (see assignment brief). */
  tags: string[];
}
