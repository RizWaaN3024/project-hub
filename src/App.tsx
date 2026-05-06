/**
 * Project Hub Lite — implement the assignment in this file (and new modules).
 * See assignment-brief.md next to this starter folder (repository) or your copy of the brief.
 */
import projectsData from "./data/projects.json";
import type { Project } from "./types";
import { Card, Stack, Text } from "@/ui-stub";
import "./App.css";

const projects = projectsData as Project[];

export default function App() {
  return (
    <div className="app-shell">
      <main aria-labelledby="app-title">
        <Text as="h1" id="app-title" tone="title">
          Project Hub Lite
        </Text>
        <Text as="p" tone="body" style={{ marginTop: "0.5rem" }}>
          Starter loads <strong>{projects.length}</strong> mock projects (with <strong>tags</strong>).
          Replace this screen per <strong>assignment-brief.md</strong>: list + detail, debounced search,
          filters + URL (including selected project), stale-async handling, documented shortcut + copy link,
          loading/error/empty, <strong>three</strong> RTL tests; optional stretch: create/edit via
          slideovers; bonus: Tailwind for new styles.
        </Text>
        <Stack direction="column" style={{ marginTop: "1.5rem" }}>
          {projects.slice(0, 2).map((p) => (
            <Card key={p.id}>
              <Text as="h2" tone="title">
                {p.title}
              </Text>
              <Text tone="muted">
                {p.status} · {p.owner} · {p.tags.join(", ")}
              </Text>
            </Card>
          ))}
        </Stack>
      </main>
    </div>
  );
}
