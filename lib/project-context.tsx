'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { useProjects, type Project } from '@/lib/hooks/use-projects';

// ── Context ────────────────────────────────────────────────────────────────────

type ProjectContextValue = {
    /** The currently-selected "active" project (used by sidebar + other pages). */
    activeProject: Project | null;
    setActiveProject: (p: Project | null) => void;
    /** Full list of projects from the API (fetched via React Query). */
    projects: Project[];
    /** True while the initial fetch is in-flight. */
    isLoading: boolean;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const { data: projects = [], isLoading } = useProjects();

    const [activeProject, setActiveProjectState] = useState<Project | null>(null);

    // Auto-select the first project once data arrives, if nothing is selected
    const resolvedActive = activeProject
        ?? projects.find(p => p.status === 'active')
        ?? projects[0]
        ?? null;

    const setActiveProject = useCallback((p: Project | null) => {
        setActiveProjectState(p);
    }, []);

    return (
        <ProjectContext.Provider value={{
            activeProject: resolvedActive,
            setActiveProject,
            projects,
            isLoading,
        }}>
            {children}
        </ProjectContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useProject() {
    const ctx = useContext(ProjectContext);
    if (!ctx) throw new Error('useProject must be used inside <ProjectProvider>');
    return ctx;
}
