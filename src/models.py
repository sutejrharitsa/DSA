from enum import Enum
from dataclasses import dataclass, field
import time
import uuid

class AppType(str, Enum):
    SOCIAL = "social"
    WORK = "work"
    EMERGENCY = "emergency"
    NEWS = "news"
    HEALTH = "health"
    FINANCE = "finance"
    CALENDAR = "calendar"

class Urgency(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass(order=True)
class Notification:
    """
    Core Notification Model.
    Ordered by priority (reversed because heapq is min-heap, so we store negative priority).
    """
    sort_index: tuple = field(init=False, repr=False)
    
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    content: str = ""
    sender: str = "Unknown"
    app_type: AppType = AppType.SOCIAL
    urgency: Urgency = Urgency.LOW
    timestamp: float = field(default_factory=time.time)
    
    # Priority details
    priority_score: float = 0.0
    is_read: bool = False
    status: str = "pending"
    
    def __post_init__(self):
        # Sort by Priority (Desc) then Timestamp (FIFO)
        self.sort_index = (0, self.timestamp) 
    
    def update_priority(self, score: float):
        self.priority_score = score
        # Negative score for Max-Heap behavior
        self.sort_index = (-score, self.timestamp)
