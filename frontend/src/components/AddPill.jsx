import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const APP_TYPES = [
    { id: 'social', label: 'Social', color: 'bg-green-500' },
    { id: 'work', label: 'Work', color: 'bg-blue-500' },
    { id: 'news', label: 'News', color: 'bg-red-500' },
    { id: 'finance', label: 'Finance', color: 'bg-yellow-500' },
    { id: 'emergency', label: 'Alert', color: 'bg-orange-500' }
];

export default function AddPill({ isOpen, onClose, onAdd }) {
    const [text, setText] = useState("");
    const [selectedType, setSelectedType] = useState('social');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        // Parsing "Sender: Content" or defaulting
        const parts = text.split(':');
        let sender = "System";
        let content = text;
        if (parts.length > 1) {
            sender = parts[0].trim();
            content = parts.slice(1).join(':').trim();
        }

        onAdd({
            sender,
            content,
            app_type: selectedType
        });
        setText("");
        setSelectedType('social'); // Reset
        onClose();
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="absolute bottom-8 left-0 right-0 mx-auto w-[480px] z-50 flex flex-col gap-3"
                    >
                        {/* Type Chips */}
                        <div className="flex justify-center gap-2">
                            {APP_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${selectedType === type.id
                                            ? "bg-white text-black border-white scale-105 shadow-lg"
                                            : "bg-black/40 text-white/70 border-white/10 hover:bg-black/60"
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>

                        {/* Input Pill */}
                        <form onSubmit={handleSubmit} className="bg-[#1c1c1e] text-white rounded-[24px] p-2 pl-6 flex items-center shadow-2xl border border-white/15">
                            <input
                                autoFocus
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder={`New ${selectedType} notification (e.g. Boss: Report due)`}
                                className="bg-transparent border-none outline-none flex-1 text-sm placeholder-white/30 h-10 font-medium"
                            />
                            <button type="submit" className="bg-blue-500 hover:bg-blue-400 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-lg shadow-blue-500/20">
                                ↑
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
