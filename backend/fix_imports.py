import os
import glob

files = glob.glob('app/models/*.py')
for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    new_content = content.replace('from app.db.base_class import Base', 'from app.models.base import Base')
    
    if f == 'app/models/conversation.py':
        new_content = new_content.replace('from sqlalchemy import Column, String, DateTime, Boolean, Text', 'from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer')
    
    if f == 'app/models/message.py':
        new_content = new_content.replace('from sqlalchemy import Column, String, DateTime, Integer, Text, Float, ForeignKey', 'from sqlalchemy import Column, String, DateTime, Integer, Text, Float, ForeignKey, Boolean')

    if content != new_content:
        with open(f, 'w') as file:
            file.write(new_content)
        print(f"Fixed {f}")
