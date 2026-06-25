"""
Initial configuration
"""
import pytest
import os
import sys

# Append backend directory to path for tests to discover app module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
