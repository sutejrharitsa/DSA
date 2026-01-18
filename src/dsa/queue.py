import heapq
from collections import deque
from typing import List, Optional
from src.models import Notification

class NotificationHeap:
    """
    Max-Priority Queue wrapper using Python's heapq (min-heap).
    """
    def __init__(self):
        self._heap = [] # Internal heap storage

    def push(self, notification: Notification):
        heapq.heappush(self._heap, notification)

    def pop(self) -> Optional[Notification]:
        if not self.is_empty():
            return heapq.heappop(self._heap)
        return None

    def peek(self) -> Optional[Notification]:
        if not self.is_empty():
            return self._heap[0]
        return None

    def is_empty(self) -> bool:
        return len(self._heap) == 0

    def get_all_sorted(self) -> List[Notification]:
        """Returns all items sorted by priority without removing them."""
        return sorted(self._heap)

    def remove_by_id(self, notif_id: str) -> bool:
        initial_len = len(self._heap)
        self._heap = [n for n in self._heap if n.id != notif_id]
        if len(self._heap) < initial_len:
            heapq.heapify(self._heap)
            return True
        return False

class HistoryWindow:
    """ Sliding window to track recent notifications per app. """
    def __init__(self, time_window_seconds: int = 60):
        self.window = deque()
        self.time_window = time_window_seconds

    def add(self, timestamp: float):
        self.window.append(timestamp)
        self.cleanup(timestamp)

    def cleanup(self, current_time: float):
        while self.window and self.window[0] < current_time - self.time_window:
            self.window.popleft()

    def count(self) -> int:
        return len(self.window)
