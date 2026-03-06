'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import 'molstar/lib/mol-plugin-ui/skin/light.scss'; // Base styles
import { Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MolstarViewer({ url, format = 'pdb' }: { url: string; format?: 'pdb' | 'mmcif' }) {
    const parentRef = useRef<HTMLDivElement>(null);
    const [plugin, setPlugin] = useState<PluginUIContext | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!parentRef.current) return;

        let pluginInstance: PluginUIContext | null = null;
        let isMounted = true;

        const init = async () => {
            try {
                // Initialize Molstar Plugin UI
                pluginInstance = await createPluginUI({
                    target: parentRef.current!,
                    spec: {
                        ...DefaultPluginUISpec(),
                        layout: {
                            initial: {
                                isExpanded: false,
                                showControls: false,
                            },
                        },
                        components: {
                            controls: { right: 'none', bottom: 'none', left: 'none', top: 'none' },
                        },
                    },
                    render: renderReact18,
                });

                if (!isMounted) return;
                setPlugin(pluginInstance);

                // Configure viewport styling (light background)
                pluginInstance.canvas3d?.setProps({ renderer: { backgroundColor: 0xf8fafc as any } });

                // Download and load the PDB/CIF file
                const data = await pluginInstance.builders.data.download({ url, isBinary: false });
                const trajectory = await pluginInstance.builders.structure.parseTrajectory(data, format);

                // Build model and structure
                const model = await pluginInstance.builders.structure.createModel(trajectory);
                const structure = await pluginInstance.builders.structure.createStructure(model);

                // Add default representation (cartoon)
                await pluginInstance.builders.structure.representation.addRepresentation(structure, { type: 'cartoon', color: 'sequence-id' });

                // Auto-center camera
                pluginInstance.managers.camera.reset();
            } catch (error) {
                console.error("Molstar initialization error:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        init();

        return () => {
            isMounted = false;
            // Clean up WebGL context when unmounted
            if (pluginInstance) {
                pluginInstance.dispose();
            }
        };
    }, [url, format]);

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

            {/* The Molstar WebGL Canvas container */}
            <div ref={parentRef} className="absolute inset-0" />

            {/* Custom Overlay Controls */}
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
                    <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/80 dark:bg-black/80 backdrop-blur text-xs h-8"
                        onClick={() => window.open(url, '_blank')}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Button>
                </div>
            )}
        </div>
    );
}
