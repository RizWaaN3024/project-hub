import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { fetchProjects } from "@/data/fakeApi";
import { filterProjects } from "@/utils/filterProjects";
import projectsData from "@/data/projects.json";
import type { Project } from "@/types";

vi.mock("@/data/fakeApi");

const allProjects = projectsData as Project[];

beforeEach(() => {
  window.history.replaceState({}, "", "/");

  vi.mocked(fetchProjects).mockImplementation(async (filters) =>
    filterProjects(allProjects, filters),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("App", () => {
  it("debounces search input before updating the URL and the list", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });

    render(<App />);

    // Drain the initial fetch (instant, but useEffect still runs after render).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const searchInput = screen.getByLabelText(/search/i);
    await user.type(searchInput, "audit");

    // Mid-typing: URL must NOT yet reflect the query.
    expect(window.location.search).not.toContain("q=");

    // Advance past the 300ms debounce window.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    // Now the URL reflects the query, and the filtered list shows the match.
    expect(window.location.search).toContain("q=audit");
    await waitFor(() => {
      expect(screen.getByText(/portfolio audit log/i)).toBeInTheDocument();
    });
  });

  it("hydrates filters and opens the selected project from URL on mount", async () => {
    window.history.replaceState(
      {},
      "",
      "/?q=audit&status=paused&tag=compliance&selected=audit-log",
    );

    render(<App />);

    // The search input mirrors ?q=audit.
    const searchInput = (await screen.findByLabelText(
      /search/i,
    )) as HTMLInputElement;
    expect(searchInput.value).toBe("audit");

    // The status select mirrors ?status=paused.
    const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement;
    expect(statusSelect.value).toBe("paused");

    // The "compliance" tag chip is in its pressed state because ?tag=compliance.
    const complianceChip = screen.getByRole("button", {
      name: /^compliance$/i,
      pressed: true,
    });
    expect(complianceChip).toBeInTheDocument();

    // The detail dialog opens to the project named in ?selected=audit-log.
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName(/portfolio audit log/i);
  });

  it("ignores results from a fetch that was superseded by a filter change", async () => {
    // Override the default mock for this test only: we want manual control
    // over resolution so we can simulate the stale-after-filter-change race.
    let resolveFirst: (data: Project[]) => void = () => { };
    let resolveSecond: (data: Project[]) => void = () => { };

    vi.mocked(fetchProjects)
      .mockImplementationOnce(
        (_filters, signal) =>
          new Promise<Project[]>((resolve, reject) => {
            resolveFirst = resolve;
            signal.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            );
          }),
      )
      .mockImplementationOnce(
        (_filters, signal) =>
          new Promise<Project[]>((resolve, reject) => {
            resolveSecond = resolve;
            signal.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            );
          }),
      );

    render(<App />);

    // The first fetch is pending. Change a filter — this triggers a new fetch
    // and the cleanup of the previous effect aborts the first.
    const statusSelect = await screen.findByLabelText(/status/i);
    const user = userEvent.setup();
    await user.selectOptions(statusSelect, "archived");

    // Resolve the second (current) fetch with the archived-only subset.
    const archivedOnly = filterProjects(allProjects, {
      q: "",
      status: "archived",
      tags: [],
      selected: null,
    });
    await act(async () => {
      resolveSecond(archivedOnly);
    });

    // The list shows the archived project.
    await waitFor(() => {
      expect(screen.getByText(/legacy csv import/i)).toBeInTheDocument();
    });

    // Now try to resolve the FIRST (stale) fetch with the full unfiltered list.
    // The first promise was already rejected by the abort listener, so calling
    // resolve is a no-op — the list must NOT update with the stale data.
    await act(async () => {
      resolveFirst(allProjects);
    });

    // The active project from the unfiltered set must NOT appear. If it did,
    // the stale result would have overwritten the current list.
    await waitFor(() => {
      expect(
        screen.queryByText(/advertising campaign console/i),
      ).not.toBeInTheDocument();
    });
  });
});
