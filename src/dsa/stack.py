from typing import Optional
from src.models import Notification

class UndoStack:
    """ LIFO Stack to store deleted notifications for Undo. """
    def __init__(self, capacity: int = 10):
        self._stack = [] # Protected stack
        self.capacity = capacity

    def push(self, notification: Notification):
        if len(self._stack) >= self.capacity:
            self._stack.pop(0) 
        self._stack.append(notification)

    def pop(self) -> Optional[Notification]:
        if not self.is_empty():
            return self._stack.pop()
        return None

    def is_empty(self) -> bool:
        return len(self._stack) == 0

    def peek(self) -> Optional[Notification]:
        if not self.is_empty():
            return self._stack[-1]
        return None
