import json

try:
    with open('video_info.json', 'r', encoding='utf-16') as f:
        data = json.load(f)
    
    with open('video_summary.txt', 'w', encoding='utf-8') as f:
        f.write(f"TITLE: {data.get('title', 'Unknown')}\n")
        f.write("===============\n")
        f.write(f"DESCRIPTION: {data.get('description', 'None')}\n")
except Exception as e:
    print(f"Error: {e}")
