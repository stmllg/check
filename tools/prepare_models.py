import pathlib, hashlib, json, sys, shutil
names=['encoder-epoch-99-avg-1.onnx','decoder-epoch-99-avg-1.onnx','joiner-epoch-99-avg-1.onnx','tokens.txt','bpe.model','bpe.vocab']
if len(sys.argv)>1: src=pathlib.Path(sys.argv[1])
else:
 import tkinter as tk
 from tkinter import filedialog
 root=tk.Tk();root.withdraw(); p=filedialog.askdirectory(title='選取 Android V04.5 原始 models 資料夾');root.destroy()
 if not p: sys.exit('未選取資料夾')
 src=pathlib.Path(p)
for n in names:
 if not (src/n).is_file() or not (src/n).stat().st_size: sys.exit('缺少 '+n)
out=pathlib.Path(__file__).resolve().parents[1]/'models';out.mkdir(exist_ok=True)
files=[]
for n in names:
 h=hashlib.sha256();parts=[];size=0
 with (src/n).open('rb') as f:
  while b:=f.read(16*1024*1024):
   p=f'{n}.part{len(parts)+1:03d}';(out/p).write_bytes(b);h.update(b);size+=len(b);parts.append(dict(name=p,size=len(b),sha256=hashlib.sha256(b).hexdigest()))
 files.append(dict(name=n,size=size,sha256=h.hexdigest(),parts=parts));print(n,size,h.hexdigest())
version=hashlib.sha256(''.join(f['sha256'] for f in files).encode()).hexdigest()
(out/'model-manifest.json').write_text(json.dumps(dict(version=version,files=files),indent=2),encoding='utf-8')
print('完成：',out)
