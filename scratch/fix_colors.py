import os
import re

replacements = {
    r'#0f172a': 'var(--ink)',
    r'#1a1a1a': 'var(--ink)',
    r'#64748b': 'var(--muted)',
    r'#94a3b8': 'var(--muted)',
    r'#f8fafc': 'var(--bg)',
    r'#f1f5f9': 'var(--bg)',
    r'#e2e8f0': 'var(--border)',
    r'#e5e7eb': 'var(--border)',
    r'#ffffff': 'var(--surface)',
    r'#fff\b': 'var(--surface)',
    r'background: #ffffff': 'background: var(--surface)',
    r'background: #fff': 'background: var(--surface)',
    r'color: #0f172a': 'color: var(--ink)',
    r'border: 1px solid #e2e8f0': 'border: 1px solid var(--border)',
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in replacements.items():
        new_content = re.sub(pattern, replacement, new_content, flags=re.IGNORECASE)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk('resources/js'):
    for file in files:
        if file.endswith('.css'):
            process_file(os.path.join(root, file))
