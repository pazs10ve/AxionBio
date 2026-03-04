'use client';

import { useState } from 'react';
import { MOCK_DATA_TREE } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import {
    FolderOpen, FolderClosed, FileText, Database, Upload,
    Search, Download, Eye, ChevronRight, Plus, X, Cpu, Dna,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type DataFile = {
    id: string; name: string; type: string;
    size: string; uploaded: string; by: string;
};
type DataFolder = {
    id: string; name: string; type: 'folder';
    children: DataFile[];
};

// ── File icon by type ─────────────────────────────────────────────────────────

function FileIcon({ type }: { type: string }) {
    if (type === 'structure') return <Cpu className="w-4 h-4 text-brand" />;
    if (type === 'sequence') return <Dna className="w-4 h-4 text-green-500" />;
    return <FileText className="w-4 h-4 text-slate-400" />;
}

// ── Upload Zone ───────────────────────────────────────────────────────────────

function UploadZone({ onClose }: { onClose: () => void }) {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDrop = () => {
        setDragOver(false);
        setUploading(true);
        let p = 0;
        const id = setInterval(() => {
            p += Math.random() * 18;
            setProgress(Math.min(p, 100));
            if (p >= 100) { clearInterval(id); setTimeout(onClose, 600); }
        }, 150);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-slate-900">Upload Files</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {uploading ? (
                    <div className="space-y-3 py-4">
                        <p className="text-sm text-slate-600">Uploading...</p>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand rounded-full transition-all duration-200"
                                style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-slate-400 font-mono">{Math.round(progress)}%</p>
                    </div>
                ) : (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); handleDrop(); }}
                        className={cn(
                            'border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer',
                            dragOver ? 'border-brand bg-brand/5' : 'border-slate-200 hover:border-slate-300'
                        )}
                    >
                        <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-slate-700 mb-1">Drop files here</p>
                        <p className="text-xs text-slate-400">Supports .pdb, .cif, .fasta, .csv, .tsv</p>
                        <Button size="sm" className="mt-4 bg-brand hover:bg-brand-hover text-white" onClick={handleDrop}>
                            Browse files
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── File Preview Panel ────────────────────────────────────────────────────────

function FilePreviewPanel({ file }: { file: DataFile | null }) {
    if (!file) return (
        <div className="h-full flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <div className="text-center space-y-2">
                <Eye className="w-8 h-8 text-slate-200 mx-auto" />
                <p className="text-sm text-slate-400 font-medium">Select a file to preview</p>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2.5">
                    <FileIcon type={file.type} />
                    <div>
                        <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                        <p className="text-[10px] text-slate-400">{file.size} · {file.type}</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs border-slate-200 gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Download
                </Button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                {file.type === 'sequence' && (
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">FASTA Preview</p>
                        <pre className="bg-slate-950 text-green-400 text-[11px] font-mono rounded-xl p-4 overflow-x-auto leading-6">
                            {`>ABL1-Binder-Rank1 | pLDDT=94.2 | pTM=0.91
MGGHHHHHHGSQPKKKRKVGGENLYFQSMGSEG
HHHHHHGSQPKKKRKVGENHYSENLIFQSHHH
HHHGSQPKKKRKVGENLIFQSHHHHHGSQPKK
KRKVGENLYFQS

>ABL1-Binder-Rank2 | pLDDT=91.7 | pTM=0.88
MGSEGHHHHHHGSQPKKKRKVGENHYSENLIFQ
SHHHHHHGSQPKKKRKVGENLYFQSMGGHHHHH
HGSQPKKKRKVGEN`}
                        </pre>
                    </div>
                )}
                {file.type === 'structure' && (
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PDB Info</p>
                        {[
                            { label: 'File', value: file.name },
                            { label: 'Type', value: 'Protein Data Bank' },
                            { label: 'Size', value: file.size },
                            { label: 'Uploaded by', value: file.by },
                        ].map(row => (
                            <div key={row.label} className="flex justify-between text-xs border-b border-slate-50 pb-2">
                                <span className="text-slate-500">{row.label}</span>
                                <span className="font-semibold text-slate-800">{row.value}</span>
                            </div>
                        ))}
                        <div className="mt-4 h-32 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full border-4 border-brand/20 animate-spin mx-auto" style={{ animationDuration: '12s' }} />
                                <p className="text-xs text-slate-400 mt-2">3D preview</p>
                            </div>
                        </div>
                    </div>
                )}
                {file.type === 'data' && (
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">CSV Preview (first 5 rows)</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs border border-slate-200 rounded-xl overflow-hidden">
                                <thead className="bg-slate-50 text-slate-500 font-semibold">
                                    <tr>
                                        {['Rank', 'Sequence', 'pLDDT', 'pTM', 'ΔG'].map(h => (
                                            <th key={h} className="px-3 py-2 text-left">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="px-3 py-2 font-mono">#{i}</td>
                                            <td className="px-3 py-2 font-mono truncate max-w-[80px]">MGGHHHHH…</td>
                                            <td className="px-3 py-2 font-mono">{(94.2 - i * 2.3).toFixed(1)}</td>
                                            <td className="px-3 py-2 font-mono">{(0.91 - i * 0.03).toFixed(2)}</td>
                                            <td className="px-3 py-2 font-mono">{(-11.2 + i * 0.5).toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DataLakePage() {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['proj-kras']));
    const [selectedFile, setSelectedFile] = useState<DataFile | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [search, setSearch] = useState('');

    const toggleFolder = (id: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const allFiles = MOCK_DATA_TREE.flatMap(f => f.children as DataFile[]);
    const filtered = search
        ? allFiles.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
        : null;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
            {showUpload && <UploadZone onClose={() => setShowUpload(false)} />}

            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                        <Database className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-slate-900">Data Lake</h1>
                        <p className="text-xs text-slate-500">Structures, sequences, datasets</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search files..."
                            className="h-9 pl-9 pr-4 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand w-64"
                        />
                    </div>
                    <Button onClick={() => setShowUpload(true)} className="bg-brand hover:bg-brand-hover text-white h-9 text-sm gap-2">
                        <Plus className="w-4 h-4" /> Upload
                    </Button>
                </div>
            </div>

            {/* 3-panel body */}
            <div className="flex flex-1 overflow-hidden gap-4 p-4">

                {/* LEFT: Folder tree */}
                <div className="w-56 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-y-auto shrink-0 p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-3">Projects</p>
                    <div className="space-y-1">
                        {MOCK_DATA_TREE.map((folder) => {
                            const isOpen = expandedFolders.has(folder.id);
                            return (
                                <div key={folder.id}>
                                    <button
                                        onClick={() => toggleFolder(folder.id)}
                                        className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
                                    >
                                        <ChevronRight className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', isOpen && 'rotate-90')} />
                                        {isOpen ? <FolderOpen className="w-4 h-4 text-amber-500" /> : <FolderClosed className="w-4 h-4 text-amber-400" />}
                                        <span className="text-xs font-semibold truncate">{folder.name}</span>
                                    </button>
                                    {isOpen && (
                                        <div className="ml-6 mt-1 space-y-0.5">
                                            {(folder.children as DataFile[]).map((file) => (
                                                <button
                                                    key={file.id}
                                                    onClick={() => setSelectedFile(file)}
                                                    className={cn(
                                                        'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs transition-colors text-left',
                                                        selectedFile?.id === file.id
                                                            ? 'bg-brand/10 text-brand'
                                                            : 'hover:bg-slate-50 text-slate-600'
                                                    )}
                                                >
                                                    <FileIcon type={file.type} />
                                                    <span className="truncate">{file.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CENTER: File list or search results */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 py-3.5 border-b border-slate-100 shrink-0">
                        <h2 className="text-sm font-semibold text-slate-700">
                            {search ? `Search results for "${search}"` : 'All files'}
                        </h2>
                        <p className="text-xs text-slate-400">{(filtered ?? allFiles).length} files</p>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px] sticky top-0">
                                <tr>
                                    <th className="px-5 py-3 text-left">Name</th>
                                    <th className="px-5 py-3 text-left">Type</th>
                                    <th className="px-5 py-3 text-left">Size</th>
                                    <th className="px-5 py-3 text-left">Uploaded</th>
                                    <th className="px-5 py-3 text-left">By</th>
                                    <th className="px-5 py-3 text-left"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(filtered ?? allFiles).map((file) => (
                                    <tr
                                        key={file.id}
                                        onClick={() => setSelectedFile(file)}
                                        className={cn(
                                            'cursor-pointer transition-colors',
                                            selectedFile?.id === file.id ? 'bg-brand/5' : 'hover:bg-slate-50'
                                        )}
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <FileIcon type={file.type} />
                                                <span className="font-semibold text-slate-800">{file.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={cn(
                                                'px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                                                file.type === 'structure' ? 'text-brand bg-brand/10 border-brand/20' :
                                                    file.type === 'sequence' ? 'text-green-600 bg-green-50 border-green-200' :
                                                        'text-slate-500 bg-slate-50 border-slate-200'
                                            )}>
                                                {file.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-slate-500 font-mono">{file.size}</td>
                                        <td className="px-5 py-3 text-slate-500">{file.uploaded}</td>
                                        <td className="px-5 py-3 text-slate-500">{file.by}</td>
                                        <td className="px-5 py-3">
                                            <button className="text-slate-300 hover:text-brand transition-colors" onClick={(e) => e.stopPropagation()}>
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT: Preview panel */}
                <div className="w-72 shrink-0">
                    <FilePreviewPanel file={selectedFile} />
                </div>
            </div>
        </div>
    );
}
