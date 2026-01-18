import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { MessageSquare, Briefcase, Hash, Bell, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

const ICONS = {
    social: MessageSquare,
    work: Briefcase,
    news: Hash,
    calendar: Calendar,
    finance: DollarSign,
    emergency: AlertTriangle,
    default: Bell
};

export default function NotificationItem({ data, onDismiss }) {
    const controls = useAnimation();
    const Icon = ICONS[data.app_type] || ICONS.default;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="glass-card-item p-4 mb-3 relative group overflow-hidden"
        >
            {/* Header Row */}
            <div className="flex items-center gap-3 mb-2">
                <div className="w-[28px] h-[28px] bg-white rounded-[7px] flex items-center justify-center shadow-sm shrink-0">
                    <Icon size={16} className="text-black/80" strokeWidth={2.5} />
                </div>
                <span className="text-[13px] font-semibold text-white/90 uppercase tracking-wide opacity-80">{data.app_type}</span>
                <span className="ml-auto text-xs text-white/50 font-medium">now</span>
            </div>

            {/* Content Body */}
            <div>
                <h4 className="text-[15px] font-bold text-white mb-0.5">{data.sender}</h4>
                <p className="text-[14px] text-white/80 leading-snug">{data.content}</p>
            </div>

            {/* Dismiss Button (Visible on Hover) */}
            <button
                onClick={() => onDismiss(data.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30 rounded-full w-6 h-6 flex items-center justify-center text-xs text-white backdrop-blur-md"
            >
                ✕
            </button>
        </motion.div>
    );
}
