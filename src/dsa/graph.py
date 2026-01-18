from typing import Dict, List
from src.models import AppType

class DependencyGraph:
    """ Directed Graph to represent dominance rules (App A > App B). """
    def __init__(self):
        self.adj_list: Dict[AppType, List[AppType]] = {
            AppType.EMERGENCY: [AppType.WORK, AppType.SOCIAL, AppType.NEWS, AppType.HEALTH, AppType.FINANCE, AppType.CALENDAR],
            AppType.HEALTH: [AppType.SOCIAL, AppType.NEWS],
            AppType.WORK: [AppType.SOCIAL, AppType.NEWS],
            AppType.FINANCE: [AppType.SOCIAL],
            AppType.CALENDAR: [AppType.SOCIAL, AppType.NEWS],
        }
    
    def add_rule(self, dominant: AppType, subordinate: AppType):
        if dominant not in self.adj_list:
            self.adj_list[dominant] = []
        self.adj_list[dominant].append(subordinate)

    def is_dominant(self, app_a: AppType, app_b: AppType) -> bool:
        """ Returns True if app_a dominates app_b via BFS. """
        if app_a == app_b: return False
        queue = [app_a]
        visited = set()
        while queue:
            curr = queue.pop(0)
            if curr == app_b: return True
            if curr in visited: continue
            visited.add(curr)
            if curr in self.adj_list:
                for neighbor in self.adj_list[curr]:
                    queue.append(neighbor)
        return False
