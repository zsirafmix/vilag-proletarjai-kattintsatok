/* WebAudio synth: march theme + SFX. All sound generated, no files. */
(function(){
let ctx=null, master=null, musicGain=null, sfxGain=null, muted=false, musicOn=false, nextT=0, step=0, timer=null, noiseBuf=null;
function init(){
  if(ctx) { if(ctx.state==='suspended') ctx.resume(); return; }
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  ctx=new AC(); master=ctx.createGain(); master.gain.value=muted?0:0.8; master.connect(ctx.destination);
  const comp=ctx.createDynamicsCompressor(); comp.connect(master);
  musicGain=ctx.createGain(); musicGain.gain.value=0.22; musicGain.connect(comp);
  sfxGain=ctx.createGain(); sfxGain.gain.value=0.7; sfxGain.connect(comp);
  noiseBuf=ctx.createBuffer(1,ctx.sampleRate*1.5,ctx.sampleRate); const d=noiseBuf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
}
const f=n=>440*Math.pow(2,(n-69)/12);
function tone(freq,t,dur,type,vol,dest,slide,attack){
  const o=ctx.createOscillator(), g=ctx.createGain(); o.type=type||'square'; o.frequency.setValueAtTime(freq,t);
  if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+dur);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||0.2,t+(attack||0.01));
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); g.connect(dest||sfxGain); o.start(t); o.stop(t+dur+0.05); return o;
}
function noise(t,dur,vol,ftype,freq,q,dest,fEnd){
  const s=ctx.createBufferSource(); s.buffer=noiseBuf; const fl=ctx.createBiquadFilter(); fl.type=ftype||'lowpass'; fl.frequency.setValueAtTime(freq||1000,t);
  if(fEnd) fl.frequency.exponentialRampToValueAtTime(fEnd,t+dur);
  fl.Q.value=q||1; const g=ctx.createGain(); g.gain.setValueAtTime(vol||0.3,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(fl); fl.connect(g); g.connect(dest||sfxGain); s.start(t, Math.random()*0.5); s.stop(t+dur+0.05);
}
/* Original march in G minor/major, 2/4 feel, 8th-note grid. */
const MEL=[67,0,67,70, 74,0,72,70, 69,0,65,69, 72,0,70,69, 67,0,67,70, 74,0,77,74, 72,70,69,65, 67,0,0,0,
           74,0,74,72, 70,0,69,67, 69,0,65,67, 69,70,72,0, 74,0,74,77, 79,0,77,74, 72,70,69,72, 70,0,67,0];
const BASS=[43,50,43,50, 46,53,46,53, 41,48,41,48, 45,52,45,52, 43,50,43,50, 46,53,46,53, 48,55,41,48, 43,50,43,50,
            46,53,46,53, 43,50,43,50, 41,48,41,48, 45,52,45,50, 46,53,46,53, 43,50,43,50, 48,55,41,48, 43,50,43,38];
const BPM=132, S8=60/BPM/2;
function schedule(){
  if(!ctx||!musicOn) return;
  while(nextT<ctx.currentTime+0.2){
    const i=step%MEL.length, t=nextT;
    const m=MEL[i]; if(m){ tone(f(m),t,S8*0.9,'sawtooth',0.10,musicGain); tone(f(m+12),t,S8*0.6,'square',0.035,musicGain); }
    tone(f(BASS[i]),t,S8*0.7,'triangle',0.32,musicGain);
    if(i%2===0) noise(t,0.07,0.18,'lowpass',180,1,musicGain); // kick
    else noise(t,0.09,0.13,'highpass',2500,1,musicGain); // snare
    if(i%8===6) noise(t+S8/2,0.05,0.08,'highpass',3000,1,musicGain);
    nextT+=S8; step++;
  }
}
const A={
  init,
  get muted(){return muted},
  setMuted(m){muted=m; if(master) master.gain.setTargetAtTime(m?0:0.8,ctx.currentTime,0.05);},
  music(on){ if(!ctx) return; if(on&&!musicOn){musicOn=true;nextT=ctx.currentTime+0.1;step=0;timer=setInterval(schedule,50);} else if(!on&&musicOn){musicOn=false;clearInterval(timer);} },
  play(name,p){ if(!ctx||muted) return; const t=ctx.currentTime; p=p||1;
    switch(name){
    case 'click': tone(880,t,0.05,'square',0.08); break;
    case 'cannon': noise(t,0.5,0.9,'lowpass',900,1,null,80); tone(110,t,0.35,'sine',0.7,null,35); tone(60,t,0.5,'triangle',0.5,null,30); break;
    case 'whoosh': noise(t,0.6,0.25,'bandpass',600,3,null,2400); break;
    case 'sickle': for(let k=0;k<3;k++) noise(t+k*0.12,0.12,0.2,'bandpass',1800+k*500,6); break;
    case 'thud': noise(t,0.15,0.4*p,'lowpass',400,1); tone(90,t,0.12,'sine',0.3*p,null,50); break;
    case 'crumble': for(let k=0;k<5;k++) noise(t+k*0.05+Math.random()*0.04,0.18,0.25*p,'lowpass',500+Math.random()*900,2); break;
    case 'glass': for(let k=0;k<6;k++) tone(2000+Math.random()*3000,t+k*0.03,0.12,'triangle',0.06); noise(t,0.2,0.15,'highpass',4000); break;
    case 'metal': tone(520,t,0.4,'square',0.08,null,480); tone(1310,t,0.3,'triangle',0.06); break;
    case 'coins': for(let k=0;k<6;k++){const ft=t+k*0.06+Math.random()*0.03; tone(1800+Math.random()*1400,ft,0.15,'triangle',0.09); tone(3200+Math.random()*800,ft,0.08,'sine',0.04);} break;
    case 'boom': noise(t,1.1,1.0,'lowpass',1200,1,null,60); tone(70,t,0.8,'sine',0.8,null,25); break;
    case 'bigboom': noise(t,2.0,1.0,'lowpass',2000,1,null,40); tone(55,t,1.6,'sine',0.9,null,20); tone(90,t+0.15,1.0,'sawtooth',0.2,null,30); break;
    case 'paper': for(let k=0;k<10;k++) noise(t+k*0.04,0.05,0.12,'highpass',3000+Math.random()*3000,1); break;
    case 'build': for(let k=0;k<4;k++){ tone(700,t+k*0.18,0.05,'square',0.09); noise(t+k*0.18,0.04,0.2,'bandpass',2000,4);} break;
    case 'target': tone(f(79),t,0.1,'square',0.12); tone(f(84),t+0.08,0.18,'square',0.12); this.play('coins'); break;
    case 'shout': tone(f(55),t,0.12,'sawtooth',0.08,null,f(62)); break;
    case 'pop': tone(400,t,0.12,'sine',0.3,null,1400); noise(t,0.06,0.2,'highpass',2000); break;
    case 'robot': tone(80,t,0.6,'sawtooth',0.18,null,160); tone(83,t,0.6,'square',0.08,null,170); break;
    case 'alarm': for(let k=0;k<3;k++){tone(880,t+k*0.25,0.12,'square',0.1);tone(660,t+k*0.25+0.12,0.12,'square',0.1);} break;
    case 'weak': tone(f(72),t,0.08,'square',0.15); tone(f(79),t+0.07,0.08,'square',0.15); tone(f(84),t+0.14,0.2,'square',0.15); break;
    case 'bounce': tone(1200,t,0.08,'square',0.06,null,800); break;
    case 'win': [67,72,76,79,84].forEach((n,k)=>{tone(f(n),t+k*0.13,0.3,'sawtooth',0.12);tone(f(n-12),t+k*0.13,0.3,'square',0.06);}); tone(f(84),t+0.7,0.9,'sawtooth',0.14); break;
    case 'lose': [67,66,65,64].forEach((n,k)=>tone(f(n),t+k*0.3,0.32,'sawtooth',0.12)); tone(f(55),t+1.2,0.8,'triangle',0.2); break;
    case 'fanfare': [60,64,67,72,67,72,76,79].forEach((n,k)=>tone(f(n),t+k*0.16,0.35,'sawtooth',0.12)); noise(t,0.3,0.4,'lowpass',300); break;
    case 'reboot': for(let k=0;k<8;k++) tone(200+k*90,t+k*0.2,0.15,'square',0.07); break;
    case 'charge': tone(200,t,0.8,'sawtooth',0.12,null,1200); break;
    }
  }
};
window.SFX=A;
})();
