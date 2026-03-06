'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import 'molstar/lib/mol-plugin-ui/skin/light.scss'; // Base styles
import { Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MolstarMolecule {
    id: string;
    url: string;
    label: string;
    format?: 'pdb' | 'mmcif';
    color?: string;
}

export default function MolstarViewer({
    molecules = [],
    onAnnotationRequest
}: {
    molecules: MolstarMolecule[];
    onAnnotationRequest?: (selection: any) => void;
}) {
    const parentRef = useRef<HTMLDivElement>(null);
    const [plugin, setPlugin] = useState<PluginUIContext | null>(null);
    const [loading, setLoading] = useState(true);
    const [visibility, setVisibility] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!parentRef.current) return;

        let pluginInstance: PluginUIContext | null = null;
        let isMounted = true;

        const init = async () => {
            try {
                pluginInstance = await createPluginUI({
                    target: parentRef.current!,
                    spec: {
                        ...DefaultPluginUISpec(),
                        layout: {
                            initial: { isExpanded: false, showControls: false },
                        },
                        components: {
                            controls: { right: 'none', bottom: 'none', left: 'none', top: 'none' },
                        },
                    },
                    render: renderReact18,
                });

                if (!isMounted) return;
                setPlugin(pluginInstance);
                pluginInstance.canvas3d?.setProps({ renderer: { backgroundColor: 0xf8fafc as any } });

                // Load all molecules
                const structures = await Promise.all(molecules.map(async (mol) => {
                    const data = await pluginInstance!.builders.data.download({ url: mol.url, isBinary: false });
                    const trajectory = await pluginInstance!.builders.structure.parseTrajectory(data, mol.format || 'pdb');
                    const model = await pluginInstance!.builders.structure.createModel(trajectory);
                    const structure = await pluginInstance!.builders.structure.createStructure(model);

                    // Add representation
                    await pluginInstance!.builders.structure.representation.addRepresentation(structure, {
                        type: 'cartoon',
                        color: mol.color ? 'uniform' : 'sequence-id',
                        colorParams: mol.color ? { value: parseInt(mol.color.replace('#', ''), 16) } : undefined
                    });

                    return structure;
                }));

                // If multiple molecules, try to align them
                if (structures.length > 1) {
                    // Use superposition manager for alignment
                    await pluginInstance.managers.structure.hierarchy.toggleVisibility(structures.map(s => s.cell), true);
                    // @ts-ignore
                    await pluginInstance.managers.structure.hierarchy.alignStructures?.(structures.map(s => s.cell));
                }

                pluginInstance.managers.camera.reset();

                // Initialize visibility state
                const initialVisibility = molecules.reduce((acc, m) => ({ ...acc, [m.id]: true }), {});
                setVisibility(initialVisibility);

            } catch (error) {
                console.error("Molstar initialization error:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        init();

        return () => {
            isMounted = false;
            if (pluginInstance) pluginInstance.dispose();
        };
    }, [molecules]);

    const toggleVisibility = (id: string) => {
        if (!plugin) return;
        const newVisible = !visibility[id];
        setVisibility(prev => ({ ...prev, [id]: newVisible }));

        const hierarchy = plugin.managers.structure.hierarchy.current;
        const idx = molecules.findIndex(m => m.id === id);
        if (idx !== -1 && hierarchy.structures[idx]) {
            plugin.managers.structure.hierarchy.toggleVisibility([hierarchy.structures[idx].cell], newVisible);
        }
    };

    return (
        <div className="relative w-full h-[600px] border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden bg-white/50 dark:bg-black/50 backdrop-blur-sm">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-stone-50 dark:bg-stone-900 z-10">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <p className="text-sm text-stone-500 font-medium">Loading 3D Viewport...</p>
                    </div>
                </div>
            )}

            <div ref={parentRef} className="absolute inset-0" />

            {/* Molecule Layer Controls */}
            {!loading && molecules.length > 0 && (
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                    {molecules.map((mol) => (
                        <div key={mol.id} className="flex items-center gap-2 bg-white/80 dark:bg-black/80 backdrop-blur p-2 rounded-md shadow-sm border border-stone-200 dark:border-stone-800">
                            <input
                                type="checkbox"
                                checked={visibility[mol.id]}
                                onChange={() => toggleVisibility(mol.id)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[10px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">{mol.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {!loading && (
                <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/80 dark:bg-black/80 backdrop-blur text-xs h-8"
                        onClick={() => {
                            if (plugin) plugin.managers.camera.reset();
                        }}
                    >
                        Reset Camera
                    </Button>
                </div>
            )}
        </div>
    );
}
