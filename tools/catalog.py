from pathlib import Path
import json
p=Path('script');p.mkdir(exist_ok=True)
entries=[]
for f in sorted(p.glob('*.json')):
 if f.name=='catalog.json':continue
 rows=json.loads(f.read_text(encoding='utf-8-sig'))
 if not isinstance(rows,list) or not any(isinstance(r,dict) and r.get('type') in ('scripture','mantra') for r in rows):raise ValueError(f'Invalid scripture: {f.name}')
 entries.append({'file':f.name,'name':f.stem})
(p/'catalog.json').write_text(json.dumps(entries,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(entries)} scriptures')
