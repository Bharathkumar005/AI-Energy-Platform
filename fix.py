import os

filepath = '.github/workflows/main_ai-energy-backend.yml'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('python -m venv antenv', 'cd backend\n          python -m venv antenv')
text = text.replace('path: |\n            .\n            !antenv/', 'path: |\n            backend\n            !backend/antenv')

with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
    f.write(text)

print('Success')
