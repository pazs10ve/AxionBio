'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { MOCK_PROJECTS, MockProject } from './mock-data';

// ── Context ────────────────────────────────────────────────────────────────────

type ProjectContextValue = {
    activeProject: MockProject | null;
    setActiveProject: (p: MockProject | null) => void;
    projects: MockProject[];
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    // Default to first active project
    const [activeProject, setActiveProjectState] = useState<MockProject | null>(
        MOCK_PROJECTS.find(p => p.status === 'active') ?? null
    );

    const setActiveProject = useCallback((p: MockProject | null) => {
        setActiveProjectState(p);
    }, []);

    return (
        <ProjectContext.Provider value={{ activeProject, setActiveProject, projects: MOCK_PROJECTS }}>
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
