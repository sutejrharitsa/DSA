import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Network, Server, Layers, X, GripHorizontal } from 'lucide-react';

// --- VISUALIZATION HELPERS ---

// 1. GRAPH LAYOUT (Hierarchical)
const APP_NODES = {
    'emergency': { x: 300, y: 50, color: '#ff5f57', label: 'Emergency' }, // Red (Apple)
    'work': { x: 150, y: 180, color: '#007aff', label: 'Work' }, // Blue
    'health': { x: 450, y: 180, color: '#34c759', label: 'Health' }, // Green
    'finance': { x: 100, y: 320, color: '#ff9500', label: 'Finance' }, // Orange
    'news': { x: 300, y: 320, color: '#af52de', label: 'News' }, // Purple
    'social': { x: 500, y: 320, color: '#ff2d55', label: 'Social' }, // Pink
    'calendar': { x: 300, y: 180, color: '#5856d6', label: 'Calendar' } // Indigo
};

const GraphView = ({ data, fullState }) => {
    const [selected, setSelected] = useState(null);

    // Filter notifications for selected node
    const filteredNotifs = useMemo(() => {
        if (!selected || !fullState) return [];
        const active = fullState.heap || [];
        const buffered = fullState.buffer || [];
        return [...active, ...buffered].filter(n => n.app.toLowerCase() === selected);
    }, [selected, fullState]);

    // Convert adjacency list to edges
    const edges = useMemo(() => {
        const list = [];
        Object.entries(data).forEach(([parent, children]) => {
            children.forEach(child => {
                if (APP_NODES[parent] && APP_NODES[child]) {
                    list.push({ from: APP_NODES[parent], to: APP_NODES[child], id: `${parent}-${child}` });
                }
            });
        });
        return list;
    }, [data]);

    return (
        <div className="h-full w-full flex bg-[#1e1e1e]/50 rounded-xl overflow-hidden border border-white/5 relative">
            {/* GRAPH AREA */}
            <div className={`flex-1 relative transition-all duration-500 ease-[0.19,1,0.22,1] ${selected ? 'w-2/3' : 'w-full'}`}>
                {/* Click Backdrop to Deselect */}
                <div onClick={() => setSelected(null)} className="absolute inset-0 z-0 bg-transparent" />

                <svg width="100%" height="100%" viewBox="0 0 600 400" className="drop-shadow-lg">
                    {/* Edges */}
                    {edges.map((edge, i) => (
                        <motion.line
                            key={edge.id}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.3 }}
                            x1={edge.from.x} y1={edge.from.y}
                            x2={edge.to.x} y2={edge.to.y}
                            stroke="white"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                        />
                    ))}

                    {/* Nodes */}
                    {Object.entries(APP_NODES).map(([key, node], i) => {
                        const isSelected = selected === key;
                        const isDimmed = selected && !isSelected;

                        return (
                            <motion.g
                                key={key}
                                initial={{ scale: 0 }}
                                animate={{
                                    scale: isSelected ? 1.15 : 1,
                                    opacity: isDimmed ? 0.3 : 1
                                }}
                                transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                                onClick={(e) => { e.stopPropagation(); setSelected(key); }}
                                style={{ cursor: 'pointer' }}
                            >
                                <circle cx={node.x} cy={node.y} r="28" fill={node.color} fillOpacity="0.15" stroke={node.color} strokeWidth="2.5" />
                                <circle cx={node.x} cy={node.y} r="6" fill="#f5f5f7" />
                                <text x={node.x} y={node.y + 45} textAnchor="middle" fill="#f5f5f7" fontSize="13" fontWeight="500" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" opacity="0.9">
                                    {node.label}
                                </text>
                            </motion.g>
                        );
                    })}

                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="white" fillOpacity="0.4" />
                        </marker>
                    </defs>
                </svg>

                {!selected && (
                    <div className="absolute top-6 left-6 text-sm text-gray-400/80 font-medium pointer-events-none tracking-wide">
                        Interactive Dependency Graph
                    </div>
                )}
            </div>

            {/* SIDEBAR DETAILS */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 50, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="w-80 border-l border-white/10 bg-[#1c1c1e]/90 p-6 overflow-y-auto flex flex-col z-10 shadow-2xl relative"
                    >
                        <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors">
                            <X size={14} className="text-gray-400" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ background: APP_NODES[selected]?.color }} />
                            <h3 className="text-xl font-bold text-white capitalize tracking-tight font-sans">{selected}</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="text-[11px] text-gray-500 font-bold mb-2 uppercase tracking-wider font-sans">Queue</div>

                            {filteredNotifs.length === 0 ? (
                                <div className="text-center py-10 text-gray-500/60 font-medium italic">
                                    Empty
                                </div>
                            ) : (
                                filteredNotifs.map(n => (
                                    <motion.div
                                        key={n.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white/5 border border-white/5 p-4 rounded-xl shadow-sm hover:bg-white/10 transition-colors"
                                    >
                                        <div className="text-sm text-white/90 mb-1 font-medium leading-snug">{n.content}</div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/60 font-semibold backdrop-blur-md">
                                                Risk Score: {n.priority}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// 2. HEAP VISUALIZATION (Binary Tree - ENHANCED)
const HeapNode = ({ node, x, y, level, isRoot }) => {
    if (!node) return null;

    // Apple Colors for Priority Levels
    const getPriorityColor = (p) => {
        if (p >= 80) return '#ff453a'; // Red
        if (p >= 50) return '#ff9f0a'; // Orange
        return '#32d74b'; // Green
    };

    const color = getPriorityColor(node.priority);

    return (
        <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {/* Node Background */}
            <circle cx={x} cy={y} r={isRoot ? 35 : 28} fill="#1c1c1e" stroke={color} strokeWidth="3" className="shadow-xl" />

            {/* Priority Badge */}
            <circle cx={x + (isRoot ? 24 : 18)} cy={y - (isRoot ? 24 : 18)} r="10" fill={color} />
            <text x={x + (isRoot ? 24 : 18)} y={y - (isRoot ? 24 : 18) + 3} textAnchor="middle" fill="black" fontSize="9" fontWeight="800">
                {Math.round(node.priority)}
            </text>

            {/* Content Text */}
            <foreignObject x={x - 40} y={y - 12} width="80" height="40">
                <div xmlns="http://www.w3.org/1999/xhtml" className="flex items-center justify-center h-full text-center">
                    <span className="text-white/90 font-medium truncate w-full px-1" style={{ fontSize: isRoot ? '12px' : '10px', fontFamily: '-apple-system, sans-serif' }}>
                        {node.content}
                    </span>
                </div>
            </foreignObject>
        </motion.g>
    );
};

const HeapView = ({ data }) => {
    const getCoords = (index) => {
        const level = Math.floor(Math.log2(index + 1));
        const maxNodesInLevel = Math.pow(2, level);
        const positionInLevel = index - (maxNodesInLevel - 1);

        const canvasWidth = 700;
        const sectionWidth = canvasWidth / maxNodesInLevel;
        const x = (positionInLevel * sectionWidth) + (sectionWidth / 2);
        const y = 80 + (level * 100); // Increased vertical spacing
        return { x, y };
    };

    return (
        <div className="h-full w-full flex items-center justify-center bg-[#1e1e1e]/50 rounded-xl overflow-y-auto border border-white/5 relative backdrop-blur-sm">
            <svg width="700" height="500" className="min-h-[400px]">
                {data.map((node, i) => {
                    const { x, y } = getCoords(i);
                    // Draw line to parent
                    let line = null;
                    if (i > 0) {
                        const parentIdx = Math.floor((i - 1) / 2);
                        const p = getCoords(parentIdx);
                        line = (
                            <motion.line
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                x1={p.x} y1={p.y} x2={x} y2={y}
                                stroke="rgba(255,255,255,0.2)" strokeWidth="2"
                            />
                        );
                    }
                    return (
                        <React.Fragment key={node.id}>
                            {line}
                            <HeapNode node={node} x={x} y={y} isRoot={i === 0} />
                        </React.Fragment>
                    );
                })}
            </svg>
            {data.length === 0 && <div className="absolute text-gray-500/50 font-medium text-lg">Heap Empty</div>}
        </div>
    );
};

// 3. STACK VISUALIZATION (Physical Bucket)
const StackView = ({ data }) => {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-[#1e1e1e]/50 rounded-xl border border-white/5 p-8 relative backdrop-blur-sm">
            <div className="w-72 border-l-[6px] border-r-[6px] border-b-[6px] border-white/10 rounded-b-2xl min-h-[350px] flex flex-col-reverse p-4 gap-3 bg-gradient-to-b from-transparent to-white/5 transition-all">
                <AnimatePresence>
                    {data.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: -100, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="w-full py-3 px-4 bg-[#0a84ff]/20 border border-[#0a84ff]/40 rounded-lg text-center text-sm text-white font-medium shadow-[0_4px_12px_rgba(10,132,255,0.15)] flex items-center justify-center"
                        >
                            <span className="truncate">{item}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {data.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500/40 font-bold tracking-widest text-xs uppercase">
                        Stack Empty
                    </div>
                )}
            </div>
            <div className="mt-6 text-xs text-gray-500 font-medium tracking-wide uppercase">LIFO Undo Stack</div>
        </div>
    );
};


// --- Main Modal ---

const DSAVisualizerModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('heap');
    const [vizData, setVizData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchData();
            const interval = setInterval(fetchData, 2000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:8001/visualize');
            setVizData(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Viz Error", err);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="modal-window"
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                >
                    {/* BACKDROP - Fades out independently */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    {/* WINDOW CONTAINER */}
                    <motion.div
                        // REFINED APPLE GENIE SIMULATION
                        initial={{
                            opacity: 0,
                            scale: 0.05,
                            x: -350, // Button position relative to center
                            y: 400,
                            skewX: -40, // Strong initial skew
                            scaleY: 0.1,
                            borderRadius: "80px"
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            x: 0,
                            y: 0,
                            skewX: 0,
                            scaleY: 1,
                            borderRadius: "12px",
                            transition: {
                                type: "spring",
                                stiffness: 200,
                                damping: 25,
                                mass: 1
                            }
                        }}
                        exit={{
                            opacity: 1,
                            scale: 0,
                            x: -350,
                            y: 400,
                            skewX: -60, // Exaggerated suck on close
                            scaleY: 0, // Shrink y as well to simulate disappearing into the point
                            borderRadius: "200px", // Turn into a blob
                            transition: {
                                duration: 1.2,
                                ease: [0.2, 0, 0, 1] // "Suck" ease
                            }
                        }}
                        style={{ transformOrigin: "bottom left", backfaceVisibility: "hidden" }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-6xl h-[85vh] bg-[#1c1c1e] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-white/10 ring-1 ring-black/50 relative z-50"
                    >
                        {/* MACOS TITLE BAR */}
                        <div className="h-12 bg-[#2c2c2e] border-b border-black/50 flex items-center px-4 justify-between select-none relative" onDoubleClick={onClose}>

                            {/* Traffic Lights */}
                            <div className="flex gap-2 group">
                                <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] hover:bg-[#ff5f57]/80 flex items-center justify-center">
                                    <X size={8} className="text-black/50 opacity-0 group-hover:opacity-100" strokeWidth={3} />
                                </button>
                                <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d8a213]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]"></div>
                            </div>

                            {/* Title */}
                            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-60">
                                <Server size={14} className="text-gray-400" />
                                <span className="text-sm font-semibold text-gray-200 font-sans tracking-wide">System Internals</span>
                            </div>

                            {/* Right Actions (Dummy) */}
                            <div className="w-16"></div>
                        </div>

                        {/* WINDOW CONTENT */}
                        <div className="flex-1 flex overflow-hidden">

                            {/* SIDEBAR TABS */}
                            <div className="w-64 bg-[#252527] border-r border-black/50 flex flex-col pt-4 px-2 antialiased z-10">
                                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">Structure</div>
                                {[
                                    { id: 'heap', icon: Server, label: 'Priority Heap' },
                                    { id: 'graph', icon: Network, label: 'Dep. Graph' },
                                    { id: 'stack', icon: Layers, label: 'Undo Stack' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all mb-1
                                        ${activeTab === tab.id
                                                ? 'bg-[#0a84ff] text-white shadow-md'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                                    `}
                                    >
                                        <tab.icon size={16} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* MAIN CANVAS */}
                            <div className="flex-1 bg-[#1c1c1e] p-6 relative">
                                {/* Background Grid */}
                                <div className="absolute inset-0 opacity-[0.03]"
                                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                                />

                                {loading && !vizData ? (
                                    <div className="h-full flex items-center justify-center text-gray-500 flex-col gap-3">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0a84ff]"></div>
                                        <span className="text-sm font-medium">Connecting...</span>
                                    </div>
                                ) : (
                                    vizData && (
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="h-full relative z-10"
                                        >
                                            {activeTab === 'heap' && <HeapView data={vizData.heap} />}
                                            {activeTab === 'stack' && <StackView data={vizData.stack} />}
                                            {activeTab === 'graph' && <GraphView data={vizData.graph} fullState={vizData} />}
                                        </motion.div>
                                    )
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DSAVisualizerModal;
