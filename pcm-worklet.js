class PCM extends AudioWorkletProcessor {
 constructor(){super();this.sum=0;this.weight=0;this.left=sampleRate/16000;this.buf=new Float32Array(800);this.pos=0;this.n=0;}
 process(inputs,outputs){const a=inputs[0]?.[0];if(a){const ratio=sampleRate/16000;for(const x of a){let remain=1;while(remain>1e-8){const take=Math.min(remain,this.left);this.sum+=x*take;this.weight+=take;remain-=take;this.left-=take;if(this.left<1e-8){this.buf[this.pos++]=this.sum/this.weight;this.left=ratio;this.sum=0;this.weight=0;if(this.pos===800){const b=this.buf;this.port.postMessage({samples:b,seq:++this.n},[b.buffer]);this.buf=new Float32Array(800);this.pos=0;}}}}}for(const ch of outputs[0]||[])ch.fill(0);return true;}
}registerProcessor('pcm50',PCM);
