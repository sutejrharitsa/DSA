import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Plus, Moon, ChevronDown } from 'lucide-react';
import NotificationItem from './NotificationItem';
import AddPill from './AddPill';

const NotificationCenter = ({ activeQueue, isDND, modeName, dndBuffer, onDismiss, onUndo, onAdd, onToggleDND }) => {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isDndExpanded, setIsDndExpanded] = useState(false);

    // Filter Logic: "Focus is On" group vs Normal Stream
    // In this demo, if DND is on, we show a special collapsed card at top

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="glass-dashboard h-full"
        >
            {/* --- HEADER --- */}
            <div className="flex justify-between items-center mb-8 px-2">
                <div>
                    <h1 className="text-white tracking-tight leading-none">Notification Center</h1>
                    <p className="text-white/60 text-lg font-medium mt-1">Today</p>
                </div>

                <div className="flex gap-3">
                    {/* DND Toggle */}
                    <button
                        onClick={onToggleDND}
                        className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md transition-all flex items-center gap-2 border ${isDND
                            ? "bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                            : "bg-white/10 hover:bg-white/20 text-white/90 border-transparent"
                            }`}
                    >
                        <Moon size={16} fill={isDND ? "currentColor" : "none"} />
                        {isDND ? "Focus On" : "Focus"}
                    </button>

                    <button onClick={onUndo} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-semibold text-white/90 backdrop-blur-md transition-all">
                        Undo
                    </button>
                    <button onClick={() => setIsAddOpen(true)} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-semibold text-white backdrop-blur-md transition-all flex items-center gap-2">
                        <Plus size={16} /> New
                    </button>
                </div>
            </div>

            {/* --- GRID LAYOUT --- */}
            <div className="flex flex-1 gap-8 overflow-hidden">

                {/* LEFT COLUMN: Notification Stream (60%) */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-20 scroll-smooth">

                    {/* DND Collapsed State */}
                    {isDND && (
                        <>
                            <div
                                onClick={() => setIsDndExpanded(!isDndExpanded)}
                                className="glass-card-item p-4 flex justify-between items-center cursor-pointer mb-2 active:scale-[0.98] transition-all bg-indigo-500/10 border-indigo-500/20"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                        <Moon fill="currentColor" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-[15px]">{dndBuffer.length} Notifications Silenced</h3>
                                        <p className="text-white/50 text-sm">Focus is On</p>
                                    </div>
                                </div>
                                <motion.div animate={{ rotate: isDndExpanded ? 180 : 0 }}>
                                    <ChevronDown className="text-white/50" />
                                </motion.div>
                            </div>

                            {/* Expanded Buffer List */}
                            <AnimatePresence>
                                {isDndExpanded && dndBuffer.map((notif) => (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="opacity-70 scale-95 origin-top pl-4"
                                    >
                                        <NotificationItem data={notif} onDismiss={onDismiss} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </>
                    )}

                    <AnimatePresence>
                        {activeQueue.map((notif) => (
                            <NotificationItem key={notif.id} data={notif} onDismiss={onDismiss} />
                        ))}
                    </AnimatePresence>

                    {activeQueue.length === 0 && !isDND && (
                        <div className="text-center py-20 text-white/30 font-medium text-lg">
                            No new notifications
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Widgets (40%) */}
                <div className="w-[320px] flex flex-col gap-6">

                    {/* Weather Widget */}
                    <div className="widget-base widget-weather h-[160px] text-white relative overflow-hidden">
                        <div className="z-10">
                            <h3 className="text-lg font-medium">Cupertino</h3>
                            <h1 className="text-5xl mt-1 font-light">72°</h1>
                        </div>
                        <div className="z-10 bg-white/20 self-start px-3 py-1 rounded-full text-xs font-semibold mt-auto backdrop-blur-md">
                            Partly Cloudy
                        </div>
                        {/* Decorative Sun */}
                        <div className="absolute top-4 right-4 w-12 h-12 bg-yellow-400 rounded-full shadow-[0_0_20px_rgba(255,200,0,0.6)]"></div>
                    </div>

                    {/* Calendar Widget */}
                    <div className="widget-base widget-calendar h-[160px]">
                        <div>
                            <p className="text-red-500 font-bold uppercase text-xs">Sunday</p>
                            <h1 className="text-black text-4xl font-semibold mt-0">18</h1>
                        </div>
                        <div className="mt-auto">
                            <p className="text-gray-500 text-xs font-medium uppercase">Up Next</p>
                            <p className="text-gray-900 font-semibold text-sm truncate">Review Project Plan</p>
                            <p className="text-gray-400 text-xs">10:00 AM - 11:30 AM</p>
                        </div>
                    </div>


                </div>
            </div>

            <AddPill isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={onAdd} />
        </motion.div>
    );
}

export default NotificationCenter;
