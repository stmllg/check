const assert=require('node:assert/strict');require('../recite-core.js');const {Core,VoiceGate,weight,threshold,evaluate}=globalThis.Recite;
const dict={甲:'jia',乙:'yi',丙:'bing',丁:'ding',戊:'wu',己:'ji',庚:'geng',辛:'xin',壬:'ren',癸:'gui',啊:'a',哦:'o',鵝:'e',佛:'fo',心:'xin',新:'xin',行:'xing',席:'xi'};
const row=(original,type='scripture')=>({original,type,pinyin_syllables:[...original].map(c=>dict[c])});
for(const [a,b,w] of [['shi','si',1],['an','ang',.8],['feng','heng',.8],['ma','ba',.65],['ma','mai',.45],['xing','xi',.45],['a','a',1]])assert.equal(weight(a,b),w,`${a}/${b}`);
assert.deepEqual([1,2,3,4,5].map(n=>threshold(n,false,75)),[0,40,50,55,75]);assert.equal(threshold(2,true,80),30);
let c=new Core(dict);assert.equal(c.decide(row('甲乙'),'甲',false,80,0).action,'pass');assert.equal(c.decide(row('甲乙丙'),'甲',false,80,0).action,'wait');assert.equal(c.decide(row('甲乙丙丁'),'甲乙',false,80,0).action,'wait');assert.equal(c.decide(row('甲乙丙丁戊己庚辛壬癸'),'甲乙丙丁戊己庚',false,65,0).action,'wait');assert.equal(c.decide(row('甲乙丙丁戊己庚辛壬癸'),'甲乙丙丁戊己庚辛壬癸',false,80,0).action,'pass');
const r=row('甲乙丙丁戊己庚辛壬癸');const ins='甲乙丙丁戊啊哦鵝己庚辛壬癸';c.reset();const rr=c.decide(r,ins,false,70,0);assert.equal(rr.score,100);assert.ok(rr.middleInsert);assert.equal(rr.action,'fail'); // raw count already exceeds limit (13>=12)
c.reset();assert.equal(c.decide(r,'甲',true,70,0).action,'fail');assert.equal(c.decide(row('甲乙','mantra'),'甲',false,80,0).action,'pass');assert.equal(evaluate(['xin'],'新',false,0,dict).score,100);
const g=new VoiceGate();assert.equal(g.feed(6),false);assert.equal(g.feed(5),false);assert.equal(g.feed(8),false);assert.equal(g.feed(6),true);assert.equal(g.feed(9),false);g.reset();assert.equal(g.feed(9),false);assert.equal(g.feed(9),true);
console.log('CORE tests passed');
