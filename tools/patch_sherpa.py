import pathlib,sys
p=pathlib.Path(sys.argv[1])/'wasm/asr/CMakeLists.txt';s=p.read_text()
# Keep upstream target and API, remove only the bundled model preload.
lines=s.splitlines(); matches=[x for x in lines if '--preload-file' in x];assert len(matches)==1, 'Upstream build layout changed'
s=s.replace(matches[0], 'string(APPEND MY_FLAGS " -lworkerfs.js -s NO_EXIT_RUNTIME=1 ")')
lines=s.splitlines(); matches=[x for x in lines if 'EXPORTED_RUNTIME_METHODS' in x];assert len(matches)==1
s=s.replace(matches[0],matches[0].replace("['ccall'","['FS','WORKERFS','ccall'"));assert "'WORKERFS'" in s
s='\n'.join(x for x in s.splitlines() if not ('TARGET_FILE_DIR' in x and '.data"' in x))+'\n'
p.write_text(s);(p.parent/'assets/encoder.onnx').touch()
