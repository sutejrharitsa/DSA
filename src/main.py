from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import traceback

# --- Import Core Modules ---
from src.models import Notification, AppType, Urgency
from src.engine import NotificationSystem

# --- Initialize App ---
app = FastAPI(title="DSA Notification Scheduler", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global System Instance ---
try:
    system = NotificationSystem()
    print("DEBUG: src/System Instantiated Successfully")
except Exception as e:
    print(f"CRITICAL: src/System Instantiation Failed: {e}")
    traceback.print_exc()
    system = None

# --- Models ---
class NotificationRequest(BaseModel):
    content: str
    app_type: AppType
    sender: str = "Unknown" 

class ModeRequest(BaseModel):
    active: bool
    mode_name: str = "DND"

# --- Helper ---
def _format_notif(n):
    try:
        # Get dynamic summary
        try:
            summ = system.get_notification_summary(n.id)
        except:
            summ = "N/A"
            
        return {
            "id": n.id,
            "content": n.content,
            "sender": n.sender,
            "app_type": n.app_type,
            "priority": n.priority_score,
            "urgency": n.urgency,
            "timestamp": n.timestamp,
            "status": n.status,
            "summary": summ
        }
    except Exception as e:
        print(f"Error formatting notif: {e}")
        return {}

def _get_system_state():
    if system is None:
        return {"error": "System Down"}
        
    try:
        # 1. Apply DSA Aging
        system._apply_adaptive_aging()
        
        # 2. Get Data
        raw_queue = system.delivery_queue.get_all_sorted()
        
        # 3. Format
        queue_data = [_format_notif(n) for n in raw_queue]
        buffer_data = [_format_notif(n) for n in system.dnd_buffer]
        
        # 4. Summary
        if system.is_dnd_active:
            batch_sum = system.get_summary_batch()
        else:
            batch_sum = {"message": f"{len(raw_queue)} active notifications scheduled."}

        return {
            "mode": system.dnd_mode_name if system.is_dnd_active else "Normal",
            "is_dnd": system.is_dnd_active,
            "active_queue": queue_data,
            "dnd_buffer": buffer_data,
            "global_summary": batch_sum
        }
    except Exception as e:
        print("CRITICAL STATE ERROR in src:")
        traceback.print_exc()
        # Fail Gracefully
        return {
            "mode": "Error",
            "is_dnd": False,
            "active_queue": [],
            "dnd_buffer": [],
            "global_summary": {"message": f"Server Logic Error: {str(e)}"}
        }

# --- Endpoints ---

@app.get("/")
def home():
    return {"status": "DSA System Online (src)", "endpoints": ["POST /notify", "GET /list"]}

@app.get("/list")
def get_list():
    return _get_system_state()

@app.post("/notify")
def notify(req: NotificationRequest):
    if not system: raise HTTPException(500, "System not initialized")
    
    # Create notification
    n = Notification(content=req.content, app_type=req.app_type, sender=req.sender)
    
    # Schedule it
    try:
        res = system.schedule_notification(n)
        return {"result": res, "system_state": _get_system_state()}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, f"Scheduling Failed: {e}")

@app.post("/config/mode")
def set_mode(req: ModeRequest):
    if not system: raise HTTPException(500, "System not initialized")
    system.set_dnd_mode(req.active, req.mode_name)
    return _get_system_state()

@app.delete("/notification/{nid}")
def delete_notif(nid: str):
    if not system: raise HTTPException(500, "System not initialized")
    system.delete_notification(nid)
    return _get_system_state()

@app.post("/undo")
def undo():
    if not system: raise HTTPException(500, "System not initialized")
    result = system.restore_last_deleted()
    return {"result": result, "system_state": _get_system_state()}
