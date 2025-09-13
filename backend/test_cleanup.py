#!/usr/bin/env python3
"""
Test script to manually trigger the cleanup task and see if it's working.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from celery_app import celery_app
from tasks.project_cleanup import cleanup_pending_projects
import time

def test_cleanup_task():
    print("🧪 Testing cleanup task...")
    
    # Method 1: Call the task directly (synchronous)
    print("\n1. Testing direct function call:")
    try:
        result = cleanup_pending_projects()
        print(f"Direct call result: {result}")
    except Exception as e:
        print(f"Direct call failed: {e}")
    
    # Method 2: Send task to Celery worker (asynchronous)
    print("\n2. Testing Celery task dispatch:")
    try:
        task = celery_app.send_task("tasks.project_cleanup.cleanup_pending_projects")
        print(f"Task sent with ID: {task.id}")
        
        # Wait for result (with timeout)
        print("Waiting for result...")
        result = task.get(timeout=30)
        print(f"Celery task result: {result}")
        
    except Exception as e:
        print(f"Celery task failed: {e}")

if __name__ == "__main__":
    test_cleanup_task()