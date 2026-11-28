let recognizer,stream,epoch=0,sid=0,previous='',lastVoice=-Infinity,recent=[],count=0,compute=0,ModuleReady,manifest;
const send=(type,data={})=>postMessage({type,...data});const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
async function hash(b){return hex(await crypto.subtle.digest('SHA-256',b));}
async function prepare(){
 const begin=performance.now();let downloaded=0;
 const root=await navigator.storage.getDirectory();
 const manifestName='check-active-manifest-v2.json';
 try{const r=await fetch('models/model-manifest.json',{cache:'no-store'});if(!r.ok)throw Error('模型清單 HTTP '+r.status);manifest=await r.json();}catch(e){try{manifest=JSON.parse(await (await (await root.getFileHandle(manifestName)).getFile()).text());}catch{throw e;}}
 const validName=n=>typeof n==='string'&&/^[a-zA-Z0-9_.-]+$/.test(n)&&n!=='.'&&n!=='..';
 if(!validName(manifest.version)||!Array.isArray(manifest.files)||!manifest.files.length)throw Error('模型清單格式錯誤');
 const roles=manifest.roles||Object.fromEntries(['encoder','decoder','joiner','tokens'].map(k=>[k,manifest.files.find(f=>f.name.startsWith(k))?.name]));
 for(const k of ['encoder','decoder','joiner','tokens'])if(!manifest.files.some(f=>f.name===roles[k]))throw Error('缺少模型角色 '+k);
 manifest.roles=roles;
 for(const f of manifest.files){if(!validName(f.name)||!Number.isSafeInteger(f.size)||f.size<=0||!Array.isArray(f.parts)||f.parts.reduce((n,p)=>n+p.size,0)!==f.size||!/^\w{64}$/.test(f.sha256)||f.parts.some(p=>!validName(p.name)||!Number.isSafeInteger(p.size)||p.size<=0||! /^[a-f0-9]{64}$/i.test(p.sha256)))throw Error('模型清單檔案格式錯誤');}
 const dir=await root.getDirectoryHandle('check-model-'+manifest.version,{create:true});const files=[];let done=0;const total=manifest.files.reduce((a,f)=>a+f.size,0);
 for(const f of manifest.files){const target=await dir.getFileHandle(f.name,{create:true});let complete=false;try{const mark=await (await dir.getFileHandle(f.name+'.verified')).getFile();complete=await mark.text()===f.sha256&&(await target.getFile()).size===f.size;}catch{}
 if(!complete){const writer=await target.createSyncAccessHandle();try{let offset=0;for(const p of f.parts){let b; if(writer.getSize()>=offset+p.size){b=new Uint8Array(p.size);writer.read(b,{at:offset});if(await hash(b)!==p.sha256)b=null;}if(!b){send('status',{text:'下載模型：'+p.name,progress:(done+offset)/total});const r=await fetch('models/'+p.name,{cache:'no-store'});if(!r.ok)throw Error('下載失敗 '+p.name);b=new Uint8Array(await r.arrayBuffer());downloaded+=b.length;if(b.length!==p.size||await hash(b)!==p.sha256)throw Error('SHA-256 不符 '+p.name);if(writer.write(b,{at:offset})!==b.length)throw Error('模型寫入不完整');writer.flush();}offset+=p.size;}writer.truncate(f.size);writer.flush();}finally{writer.close();}const mark=await (await dir.getFileHandle(f.name+'.verified',{create:true})).createSyncAccessHandle();try{mark.truncate(0);mark.write(new TextEncoder().encode(f.sha256));mark.flush();}finally{mark.close();}}
 done+=f.size;files.push(await target.getFile());}
 const mh=await (await root.getFileHandle(manifestName,{create:true})).createSyncAccessHandle();try{const bytes=new TextEncoder().encode(JSON.stringify(manifest));mh.truncate(0);if(mh.write(bytes)!==bytes.length)throw Error('模型清單寫入失敗');mh.flush();}finally{mh.close();}
 send('storage',{downloaded,ms:performance.now()-begin});return files;
}
async function init(){const t=performance.now();const files=await prepare();const loadStart=performance.now();send('status',{text:'模型已完整保存，正在載入 WASM…'});const engineNames=['sherpa-onnx-asr.js','sherpa-onnx-wasm-main-asr.js','sherpa-onnx-wasm-main-asr.wasm'];const urls={};
 try{for(const n of engineNames){const f=files.find(f=>f.name===n);if(!f)throw Error('模型清單缺少引擎 '+n);urls[n]=URL.createObjectURL(new Blob([f],{type:n.endsWith('.wasm')?'application/wasm':'text/javascript'}));}
 await new Promise((resolve,reject)=>{self.Module={locateFile:p=>urls[p]||new URL('models/'+p,self.location.href).href,onRuntimeInitialized:resolve,onAbort:reject,printErr:t=>send('engineLog',{text:String(t)})};try{importScripts(urls[engineNames[0]],urls[engineNames[1]]);}catch(e){reject(e);}});
 }finally{for(const u of Object.values(urls))URL.revokeObjectURL(u);}
 const M=self.Module;M.FS.mkdir('/models');M.FS.mount(M.WORKERFS,{files},'/models');const path=n=>'/models/'+n;recognizer=createOnlineRecognizer(M,{featConfig:{sampleRate:16000,featureDim:80},modelConfig:{transducer:{encoder:path(manifest.roles.encoder),decoder:path(manifest.roles.decoder),joiner:path(manifest.roles.joiner)},tokens:path(manifest.roles.tokens),numThreads:1,provider:'cpu',modelType:'zipformer',debug:0},decodingMethod:'greedy_search',maxActivePaths:4,enableEndpoint:0});if(!recognizer.handle)throw Error('Sherpa 初始化失敗');send('ready',{ms:performance.now()-t,initMs:performance.now()-loadStart,version:manifest.version});}
importScripts('recite-core.js');
let round=null,armed=false,gate=new Recite.VoiceGate(),speechChunks=0,lastSpeech=0,lastText='',silenceFired=false,transition=[],retry=false;
const now=()=>performance.timeOrigin+performance.now();
function level(a){let sum=0;for(const x of a)sum+=x*x;return Math.min(100,Math.floor(Math.sqrt(sum/a.length)*32768/150));}
function feed(samples,report=true,at=now()){
 const t=performance.now();stream.acceptWaveform(16000,samples);while(recognizer.isReady(stream))recognizer.decode(stream);const text=recognizer.getResult(stream).text.replace(/\s/g,'');const ms=performance.now()-t;count++;compute+=ms;
 if(text&&text!==previous){previous=text;lastText=text;if(report)send('result',{epoch,sid,text,final:false});}
 return ms;
}
function reset(m){const t=performance.now();if(stream)stream.free();stream=recognizer.createStream();if(!stream.handle)throw Error('stream 建立失敗');epoch=m.epoch;sid=m.sid;previous='';count=0;compute=0;lastText='';speechChunks=0;lastSpeech=0;silenceFired=false;gate.reset();armed=false;retry=!!m.retry;
 const clean=m.clean||m.single||retry;transition=(!clean&&m.replay&&now()-lastVoice<=200)?recent.slice():[];recent=[];
 round={quiet:!!m.quiet||!!m.single||retry,single:!!m.single,clean:!!clean,armAt:now()+Math.max(m.single?200:0,m.pause||0),retry};
 send('reset',{epoch,sid,ms:performance.now()-t});if(!round.quiet&&!m.pause)arm(now());
}
function arm(at){if(!round||armed||at<round.armAt||round.quiet&&at-lastVoice<(round.single?100:350))return false;
 if(round.retry){round=null;transition=[];send('retry-ready',{epoch,sid});return false;}
 armed=true;send('armed',{epoch,sid});for(const p of transition){if(p.level>=6){lastSpeech=p.at;speechChunks++;}feed(p.samples,false,p.at);}transition=[];if(lastText)send('result',{epoch,sid,text:lastText,final:false});return true;}
function pcm(m){const a=m.samples,l=level(a),at=m.at;let ms=0;if(l>=6)lastVoice=at;
 if(!armed&&round){if(!round.clean){transition.push({samples:a,level:l,at});if(transition.length>50)transition.shift();}const just=arm(at);if(just&&round.clean){/* current packet predates the arm; discard */}}
 else if(armed){recent.push({samples:a,level:l,at});if(recent.length>8)recent.shift();if(l>=6){lastSpeech=at;speechChunks++;}if(round.single){if(gate.feed(l)){armed=false;round=null;send('voice-pass',{epoch,sid});}}else{ms=feed(a,true,at);if(!silenceFired&&speechChunks>=6&&lastText&&lastSpeech>0&&at-lastSpeech>=2500){silenceFired=true;armed=false;round=null;send('result',{epoch,sid,text:lastText,final:true});}}}
 send('ack',{epoch,sid,ms,latency:now()-at,rtf:count?compute/(count*50):0,text:lastText,level:l,heap:self.Module.HEAPU8?.byteLength});}
let busy=false;onmessage=async({data:m})=>{try{if(m.type==='init'){if(busy||recognizer)return;busy=true;await init();busy=false;}else if(m.type==='reset'&&recognizer)reset(m);else if(m.type==='block'){armed=false;round=null;transition=[];recent=[];epoch=m.epoch;}else if(m.type==='pcm'&&stream&&m.epoch===epoch&&m.sid===sid)pcm(m);}catch(e){send('error',{text:String(e?.message||e)});}};
