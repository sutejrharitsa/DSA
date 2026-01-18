# 🔔 Smart Notification Scheduler with DSA Optimization

> **College Project Report: Advanced Data Structures in Real-time Systems**

## 📖 1. Project Overview

The **Smart Notification Scheduler** is a full-stack application designed to demonstrate the practical application of **Data Structures and Algorithms (DSA)** in a real-world scenario (System Design). Unlike standard notification systems that push messages sequentially (FIFO), this system implements an intelligent **Weighted Priority Scheduling Algorithm** to deliver critical information first.

It features a "Context-Aware" **Do Not Disturb (DND)** mode that buffers non-essential notifications while allowing emergency alerts to break through, utilizing a **Buffer Queue** and **Adaptive Flow Control**.

---

## 🏗️ 2. System Architecture

The system follows a Client-Server architecture with a clean separation of concerns:

### **Backend (The Logic Core)**
*   **Framework**: FastAPI (Python) - High performance, async support.
*   **Role**: Handles notification ingestion, priority calculation, scheduling APIs, and buffering logic.
*   **State Management**: Maintains in-memory Data Structures for the Heap, Buffer, and History.

### **Frontend (The Visualizer)**
*   **Framework**: React + Vite (JavaScript).
*   **Styling**: Interface inspired by Apple's macOS/iOS aesthetics (Glassmorphism, Lucide Icons).
*   **Role**:
    1.  **Dashboard**: Shows the "Smartphone Interface" receiving notifications.
    2.  **DSA Visualizer Panel**: A real-time debug window showing the internal state of the **Heap** (Priority Queue), **Stack** (Undo History), and **Graph** (Logic Dependencies).

---

## 🧠 3. Data Structures & Algorithms (How it Works)

This is the core of the project. We utilize specific DSAs to solve scheduling problems efficiently.

### **A. schedulable_queue (Max-Heap)**
*   **Structure**: Binary Max-Heap.
*   **Purpose**: To store active notifications waiting for delivery.
*   **Why Heap?**: We always need the *highest priority* item next. Storage is unsorted, but retrieval is always `O(log n)`. Standard Lists would be `O(n)` to find the max, which is too slow for high-throughput systems.

### **B. dnd_buffer (Queue / List)**
*   **Structure**: FIFO Queue.
*   **Purpose**: Stores "Social" or "News" notifications when DND is active.
*   **Logic**: When DND is disabled, this buffer is *flushed* into the Main Heap.

### **C. undo_stack (Stack)**
*   **Structure**: LIFO Stack (Last-In, First-Out).
*   **Purpose**: Handles the "Undo Delete" feature.
*   **Logic**: Every deleted notification is pushed to this stack. If the user clicks "Undo", we pop the top item and re-schedule it.

### **D. Priority Algorithm (The "Brain")**

Every notification is assigned a **Priority Score** based on this multi-factor formula:

```python
Priority = (AppWeight + UrgencyScore - FrequencyPenalty + AgingBonus)
```

1.  **AppWeight**: Base importance of the app (e.g., `Emergency=100`, `Work=70`, `Social=40`).
2.  **UrgencyScore**: NLP-based inference.
    *   Keywords like "Urgent", "OTP", "911" add +50 to +300 points.
    *   Senders like "Mom" or "Boss" get dynamic boosts.
3.  **FrequencyPenalty (Spam Control)**:
    *   If an app sends too many messages in 60 seconds, its score *decreases*. This prevents one app from hogging the user's attention.
4.  **AgingBonus (Starvation Prevention)**:
    *   Low-priority items (like "News") gain small priority points over time. This ensures they eventually get seen and don't stay in the queue forever (Starvation).

---

## 📂 4. Project Structure

```bash
📦 DSA-Notification-Scheduler
 ┣ 📂 src                    # Backend (Python/FastAPI)
 ┃ ┣ 📂 dsa                  # Custom DSA Implementations
 ┃ ┃ ┣ 📜 heap.py            # Custom Priority Queue Class
 ┃ ┃ ┣ 📜 stack.py           # Custom UndoStack Class
 ┃ ┃ ┗ 📜 graph.py           # Dependency Relation Graph
 ┃ ┣ 📜 engine.py            # Priority Engine (The Algorithm)
 ┃ ┣ 📜 main.py              # API Endpoints
 ┃ ┗ 📜 models.py            # Pydantic Data Models
 ┣ 📂 frontend               # Frontend (React)
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 components         # UI Components (NotificationItem, Visualizer)
 ┃ ┃ ┗ 📜 App.jsx            # Main Logic
 ┗ 📜 simulation.py          # Python Script to auto-generate test traffic
```

---

## 🚀 5. Setup & Installation

Follow these steps to run the project locally.

### Prerequisites
*   Python 3.9+
*   Node.js & npm

### Step 1: Start the Backend
1.  Open a terminal in the root folder.
2.  Install Python dependencies:
    ```bash
    pip install fastapi uvicorn requests
    ```
3.  Run the server:
    ```bash
    uvicorn src.main:app --reload --port 8001
    ```
    *Server will start at `http://127.0.0.1:8001`*

### Step 2: Start the Frontend
1.  Open a **new** terminal.
2.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
    *Frontend will usually open at `http://localhost:5173`*

### Step 3: Test the System
*   Open the Frontend URL.
*   Use the **Control Panel** to add random notifications.
*   Toggle **DND Mode** to see buffering in action.
*   Click **"Visualize DSA"** to see the real-time Heap and Stack states.

---

## 🧪 6. Key Learnings & Outcomes

This project successfully demonstrates:
*   **System Design**: Combining Frontend and Backend in a cohesive real-time app.
*   **Algorithm Design**: Creating a custom weighted scheduling algorithm.
*   **Data Structures**: Practical use cases for Heaps (Scheduling) and Stacks (History).
