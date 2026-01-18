import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, GitMerge, Database, Clock, Zap } from 'lucide-react';

const DSA_TOPICS = [
    {
        id: 'heap',
        title: 'Priority Heap',
        icon: Layers,
        desc: 'A binary tree-based structure that ensures O(1) access to the highest priority element. Used here to instantly fetch the most urgent notification (e.g., "Emergency") regardless of how many others are pending.',
        stats: ['O(log n) Insertion', 'O(1) Peek', 'O(log n) Extraction']
    },
    {
        id: 'graph',
        title: 'Dependency Graph',
        icon: GitMerge,
        desc: 'A Directed Acyclic Graph (DAG) that models relationships. If Notification B depends on A (e.g., "Payment Success" after "OTP"), the graph ensures B remains locked until A is dismissed.',
        stats: ['Topological Sort', 'Cycle Detection', 'Dependency Resolution']
    },
    {
        id: 'stack',
        title: 'Undo Stack',
        icon: Clock,
        desc: 'A LIFO (Last-In-First-Out) stack that stores dismissed notifications. This allows you to "Undo" your last action instantly in O(1) time, restoring the exact state of the object.',
        stats: ['O(1) Push', 'O(1) Pop', 'State Preservation']
    },
    {
        id: 'hash',
        title: 'Urgency Hash Map',
        icon: Zap,
        desc: 'A Hash Map providing O(1) constant time lookups for keywords and sender metadata. This powers the instant categorization engine (e.g., mapping "Mom" -> CRITICAL).',
        stats: ['O(1) Lookup', 'Key-Value Pairs', 'Instant Classification']
    },
    {
        id: 'buffer',
        title: 'DND Buffer',
        icon: Database,
        desc: 'A secondary queue that intercepts non-critical notifications when "Focus Mode" is active. It holds them in a temporary holding state until manually reviewed or mode is disabled.',
        stats: ['Conditional logic', 'Batch Processing', 'State Management']
    }
];

export default function DSAPanel() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % DSA_TOPICS.length);
        }, 10000); // 10 Seconds
        return () => clearInterval(timer);
    }, []);

    const topic = DSA_TOPICS[index];
    const Icon = topic.icon;

    return (
        <div className="h-full glass-dashboard !w-full !p-8 flex flex-col justify-center relative overflow-hidden">
            {/* Progress Bar Top */}
            {/*<div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                <motion.div
                    key={index}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 10, ease: "linear" }}
                    className="h-full bg-blue-500/50 blur-[2px]"
                />
            </div>*/}

            <AnimatePresence mode='wait'>
                <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                    transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                    className="flex flex-col h-full"
                >
                    {/* Icon */}
                    <div className="mb-6 w-16 h-16 rounded-[20px] bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md">
                        <Icon size={32} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                    </div>

                    {/* Title */}
                    <h2 className="text-white/60 text-sm font-semibold tracking-widest uppercase mb-2">System Architecture</h2>
                    <h1 className="text-4xl font-bold text-white mb-6 leading-tight">{topic.title}</h1>

                    {/* Description */}
                    <p className="text-lg text-white/80 leading-relaxed font-light mb-auto">
                        {topic.desc}
                    </p>

                    {/* Stats/Tags */}
                    <div className="flex flex-wrap gap-2 mt-8">
                        {topic.stats.map((stat, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/5 text-xs font-medium text-white/70">
                                {stat}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Pagination Dots */}
            <div className="flex gap-2 mt-8 justify-center">
                {DSA_TOPICS.map((t, i) => (
                    <div
                        key={t.id}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${i === index ? "bg-white scale-125" : "bg-white/20"}`}
                    />
                ))}
            </div>
        </div>
    );
}
