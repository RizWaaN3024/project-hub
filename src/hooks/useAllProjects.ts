import { useSyncExternalStore } from "react";
import {
    getAllProjects,
    subscribeToProjects,
} from "@/data/projectStore";

export function useAllProjects() {
    return useSyncExternalStore(
        subscribeToProjects,
        getAllProjects,
        getAllProjects
    );
}