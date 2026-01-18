import requests
import time
import json

BASE_URL = "http://127.0.0.1:8000"

def log(msg):
    print(f"[SIMULATION] {msg}")

def send_notif(content, app_type, sender):
    payload = {
        "content": content,
        "app_type": app_type,
        "sender": sender
    }
    res = requests.post(f"{BASE_URL}/notify", json=payload)
    data = res.json()
    log(f"Sent: {content[:20]}.. | Status: {data['status']} | Priority: {data['priority']}")
    return data['id']

def get_next():
    res = requests.get(f"{BASE_URL}/notifications/pop")
    log(f"Delivered: {res.json().get('delivered_notification', 'None')}")

def set_mode(active):
    requests.post(f"{BASE_URL}/config/mode", json={"active": active, "mode_name": "DND"})
    log(f"Set DND: {active}")

def main():
    log("Starting Simulation...")
    
    # 1. Normal Mode - Mixed Priorities
    log("\n--- Phase 1: Normal Mode & Priority Scheduling ---")
    send_notif("Call me back", "social", "Mom")           # Mom -> Critical -> High Priority
    send_notif("50% Off", "news", "Promo")                # Promo -> Low Priority
    send_notif("Server Down!", "work", "Boss")            # Boss -> High Priority

    # Pulling them (Expect: Mom (Critical) -> Boss (High) -> Promo (Low))
    log("Reading Queue:")
    get_next() 
    get_next() 
    get_next() 
    
    # 2. DND Mode - Buffering
    log("\n--- Phase 2: DND Mode & Buffering ---")
    set_mode(True)
    
    id1 = send_notif("Party tonight?", "social", "Friend")        # Friend -> Medium -> Buffer
    id2 = send_notif("New follower", "social", "Twitter")         # Twitter -> Low -> Buffer
    id3 = send_notif("Earthquake Alert", "emergency", "Govt")     # Emergency content/app -> Critical -> Override
    
    log("Reading Queue (Should only see Emergency):")
    get_next() 
    
    log("\n--- Phase 3: Summarization ---")
    res = requests.get(f"{BASE_URL}/summary/batch")
    print(json.dumps(res.json(), indent=2))
    
    log("Single Summary for Friend msg:")
    res = requests.get(f"{BASE_URL}/summary/notification/{id1}")
    print(res.json())

    # 3. Disable DND - Flush
    log("\n--- Phase 4: Disable DND (Flush) ---")
    set_mode(False)
    log("Reading flushed queue:")
    get_next() # Friend
    get_next() # Twitter

if __name__ == "__main__":
    try:
        requests.get(BASE_URL)
        main()
    except requests.exceptions.ConnectionError:
        print("Error: API is not running. Please run 'uvicorn src.main:app --reload' first.")
