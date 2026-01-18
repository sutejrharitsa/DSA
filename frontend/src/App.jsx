import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NotificationCenter from './components/NotificationCenter';
import DSAPanel from './components/DSAPanel';

const API_URL = 'http://localhost:8001';

function App() {
    const [activeQueue, setActiveQueue] = useState([]);
    const [dndBuffer, setDndBuffer] = useState([]);
    const [isDND, setIsDND] = useState(false);
    const [globalSummary, setGlobalSummary] = useState(null);
    const [modeName, setModeName] = useState("Normal");

    // Poll Backend
    const fetchState = async () => {
        try {
            const res = await axios.get(`${API_URL}/list`);
            setActiveQueue(res.data.active_queue);
            setDndBuffer(res.data.dnd_buffer);
            setIsDND(res.data.is_dnd);
            setModeName(res.data.mode);
            setGlobalSummary(res.data.global_summary);
        } catch (err) {
            console.error("API Error", err);
        }
    };

    useEffect(() => {
        fetchState(); // Initial Load
        const interval = setInterval(fetchState, 2000); // Poll every 2s
        return () => clearInterval(interval);
    }, []);

    const handleUndo = async () => {
        try {
            await axios.post(`${API_URL}/undo`);
            fetchState();
        } catch (err) { console.error("Undo failed", err); }
    };

    const handleDismiss = async (id) => {
        // Optimistic UI update
        setActiveQueue(prev => prev.filter(n => n.id !== id));
        try {
            await axios.delete(`${API_URL}/notification/${id}`);
        } catch (err) { fetchState(); }
    };

    const handleAddStart = async (data) => {
        try {
            await axios.post(`${API_URL}/notify`, data);
            fetchState();
        } catch (err) { console.error(err); }
    }

    const toggleDND = async () => {
        try {
            await axios.post(`${API_URL}/config/mode`, {
                active: !isDND,
                mode_name: !isDND ? "Focus" : "Normal"
            });
            fetchState();
        } catch (err) { console.error(err); }
    };

    return (
        <>
            {/* Aurora Background Layers */}
            <div className="aurora-bg"></div>
            <div className="aurora-blur"></div>

            {/* SPLIT LAYOUT CONTAINER */}
            <div className="container mx-auto h-screen flex items-center justify-center p-12 gap-10">

                {/* LEFT: DSA Explainer (1/3) */}
                <div className="w-[35%] h-[750px] relative z-10">
                    <DSAPanel />
                </div>

                {/* RIGHT: Notifications (2/3) */}
                <div className="w-[65%] h-[750px] relative z-10">
                    <NotificationCenter
                        activeQueue={activeQueue}
                        isDND={isDND}
                        modeName={modeName}
                        dndBuffer={dndBuffer}
                        onDismiss={handleDismiss}
                        onUndo={handleUndo}
                        onAdd={handleAddStart}
                        onToggleDND={toggleDND}
                    />
                </div>
            </div>
        </>
    );
}

export default App;
