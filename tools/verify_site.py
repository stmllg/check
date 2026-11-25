import pathlib,json,hashlib
p=pathlib.Path('models');m=json.loads((p/'model-manifest.json').read_text())
for f in m['files']:
 h=hashlib.sha256();size=0
 for c in f['parts']:
  b=(p/c['name']).read_bytes();assert len(b)==c['size'] and hashlib.sha256(b).hexdigest()==c['sha256'];h.update(b);size+=len(b)
 assert size==f['size'] and h.hexdigest()==f['sha256']
for n in ['sherpa-onnx-wasm-main-asr.js','sherpa-onnx-wasm-main-asr.wasm','sherpa-onnx-asr.js']:
 assert (pathlib.Path('engine')/n).stat().st_size>100
print('Model and engine files verified')
