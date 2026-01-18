import time
from typing import Dict, List, Optional
from collections import defaultdict

from src.models import Notification, AppType, Urgency
from src.dsa.graph import DependencyGraph
from src.dsa.queue import NotificationHeap, HistoryWindow
from src.dsa.stack import UndoStack

class PriorityEngine:
    """ Calculates priority scores. """
    APP_WEIGHTS = {
        AppType.EMERGENCY: 100.0,
        AppType.HEALTH: 80.0,
        AppType.WORK: 70.0,
        AppType.CALENDAR: 60.0,
        AppType.FINANCE: 60.0,
        AppType.SOCIAL: 40.0,
        AppType.NEWS: 30.0,
    }

    URGENCY_WEIGHTS = {Urgency.CRITICAL: 50.0, Urgency.HIGH: 30.0, Urgency.MEDIUM: 10.0, Urgency.LOW: 0.0}

    @staticmethod
    def infer_urgency(sender: str, content: str) -> Urgency:
        sender = sender.lower()
        content = content.lower()
        
        # 1. Sender Rules
        CRITICAL_SENDERS = ["mom", "dad", "wife", "husband", "boss", "manager", "hr"]
        if any(s in sender for s in CRITICAL_SENDERS): return Urgency.CRITICAL

        # 2. Keyword Rules
        if any(w in content for w in ["emergency", "alert", "urgent", "otp", "code", "911"]): return Urgency.CRITICAL
        if any(w in content for w in ["fast", "quick", "meeting", "due", "pay"]): return Urgency.HIGH
        
        return Urgency.MEDIUM

    @staticmethod
    def calculate_score(notif: Notification, recent_freq: int) -> float:
        base = PriorityEngine.APP_WEIGHTS.get(notif.app_type, 20.0)
        freq_penalty = min(recent_freq * 8.0, 50.0)
        
        urgency_score = PriorityEngine.URGENCY_WEIGHTS.get(notif.urgency, 0.0)
        if notif.urgency == Urgency.CRITICAL: urgency_score += 50.0

        # Keywords Bonus
        content = notif.content.lower()
        sender = notif.sender.lower()
        
        # FAMILY PRIORITY RULE (Above Boss, Below Emergency)
        FAMILY_MEMBERS = ["mom", "dad", "wife", "husband"]
        is_family = any(m in sender for m in FAMILY_MEMBERS)
        is_urgent_text = "urgent" in content or "asap" in content
        
        if is_family and is_urgent_text:
            urgency_score += 150.0 # Creates score ~200+ (Beats Boss ~120, Below Emergency ~400)
        elif "urgent" in content or "asap" in content: 
            urgency_score += 80.0
        
        if notif.app_type == AppType.EMERGENCY: urgency_score += 300.0

        # Aging
        time_waiting = (time.time() - notif.timestamp) / 60.0
        aging_factor = 0.0 if notif.app_type in [AppType.WORK, AppType.SOCIAL, AppType.EMERGENCY] else -1.0
        
        return round(base + urgency_score - freq_penalty + (time_waiting * aging_factor), 2)

class NotificationSystem:
    def __init__(self):
        self.delivery_queue = NotificationHeap()
        self.dnd_buffer = []
        self.undo_stack = UndoStack()
        self.history = defaultdict(lambda: HistoryWindow(60))
        self.graph = DependencyGraph()
        
        self.is_dnd_active = False
        self.dnd_mode_name = "Normal"
        self.all_notifications = {} 

    def set_dnd_mode(self, active: bool, mode_name: str = "DND"):
        self.is_dnd_active = active
        self.dnd_mode_name = mode_name
        if active: self._re_evaluate_queue_for_dnd()
        else: self._flush_buffer()

    def _apply_adaptive_aging(self):
        items = self.delivery_queue.get_all_sorted()
        self.delivery_queue = NotificationHeap()
        for n in items:
            cnt = self.history[n.app_type].count()
            n.update_priority(PriorityEngine.calculate_score(n, cnt))
            self.delivery_queue.push(n)

    def _re_evaluate_queue_for_dnd(self):
        items = self.delivery_queue.get_all_sorted()
        self.delivery_queue = NotificationHeap()
        for n in items:
            if self._check_dnd_pass(n): self.delivery_queue.push(n)
            else: 
                n.status = "buffered"
                self.dnd_buffer.append(n)

    def _check_dnd_pass(self, n: Notification) -> bool:
        if n.app_type == AppType.EMERGENCY: return True
        if n.urgency == Urgency.CRITICAL: return True
        return False

    def _flush_buffer(self):
        for n in self.dnd_buffer:
            n.status = "scheduled"
            self.delivery_queue.push(n)
        self.dnd_buffer.clear()

    def schedule_notification(self, n: Notification) -> dict:
        self.all_notifications[n.id] = n
        self.history[n.app_type].add(n.timestamp)
        n.urgency = PriorityEngine.infer_urgency(n.sender, n.content)
        n.update_priority(PriorityEngine.calculate_score(n, self.history[n.app_type].count()))
        
        if self.is_dnd_active and not self._check_dnd_pass(n):
            n.status = "buffered"
            self.dnd_buffer.append(n)
            return {"status": "buffered", "reason": "DND Active"}
            
        n.status = "scheduled"
        self.delivery_queue.push(n)
        return {"status": "scheduled", "priority": n.priority_score}

    def delete_notification(self, nid: str) -> bool:
        if self.delivery_queue.remove_by_id(nid):
            # We need the objects to push to undo stack. 
            # Ideally remove_by_id should return the object.
            # For now, we trust all_notifications has it.
            if nid in self.all_notifications:
                self.undo_stack.push(self.all_notifications[nid])
            return True
        
        for i, n in enumerate(self.dnd_buffer):
            if n.id == nid:
                self.undo_stack.push(self.dnd_buffer.pop(i))
                return True
        return False

    def restore_last_deleted(self) -> dict:
        n = self.undo_stack.pop()
        if not n: return {"message": "Undo stack empty."}
        self.schedule_notification(n)
        return {"action": "restored", "content": n.content}

    def get_next_notification(self) -> Optional[Notification]:
        return self.delivery_queue.pop()

    def get_summary_batch(self) -> dict:
        if not self.dnd_buffer: return {"message": "Empty"}
        return {"message": f"{len(self.dnd_buffer)} notifications buffered."}

    def get_notification_summary(self, nid: str) -> str:
        if nid not in self.all_notifications: return "Not found"
        n = self.all_notifications[nid]
        return f"Summary: {n.sender} said {n.content[:20]}..."
