/* Világ proletárjai, kattintsatok! — core game */
(function(){
'use strict';
const {Engine,Composite,Bodies,Body,Events,Query,Sleeping}=Matter;
const A=ART,T=(k,v)=>I18N.t(k,v),W=1600,H=900,GROUND=820;
const DEBUG=/[?&]debug=1/.test(location.search);
const SUB=3,DT=1000/60/SUB,VMAX=30,PREV_FRAC=0.5;
const MAT={wood:{d:.0016,hp:70,pts:300,snd:'crumble',col:['#dcb47a','#a97a3f']},stone:{d:.003,hp:150,pts:500,snd:'crumble',col:['#c2b9a8','#8b8274']},glass:{d:.0012,hp:32,pts:250,snd:'glass',col:['#a9d6da','#e8fbff']},gold:{d:.004,hp:170,pts:800,snd:'coins',col:['#f6d257','#b8860b']},steel:{d:.004,hp:320,pts:1000,snd:'metal',col:['#666c74','#3a3e44']}};
const WPN={hammer:{r:20,d:.012,mult:1.4},star:{r:18,d:.008,mult:1},leaflet:{r:16,d:.004,mult:.4},rev:{r:30,d:.02,mult:2},sickle:{r:24}};
const WLIST=['hammer','sickle','star','leaflet','rev'];
const AMMO={sickle:2,star:2,leaflet:1};
const clamp=(v,a,b)=>v<a?a:v>b?b:v, rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)];
/* ---------- save ---------- */
const SKEY='proletar_v1';
let save={unlocked:1,best:{},bestTotal:0,lang:null,muted:false,preview:true,ng:0,ngMax:0};
try{Object.assign(save,JSON.parse(localStorage.getItem(SKEY)||'{}'));}catch(e){}
function persist(){try{localStorage.setItem(SKEY,JSON.stringify(save));}catch(e){}}
/* ---------- state ---------- */
let engine=null,pe=null;
const G={li:0,phase:'menu',t:0,angle:45,power:70,weapon:'hammer',preview:save.preview!==false,shots:0,ammo:{},rev:0,score:0,levelScore:0,runStart:0,bonus:0,
  dest:[],targets:[],proj:[],parts:[],floats:[],bankers:[],bubbles:[],banners:[],trail:[],lastTrail:[],tankX:170,tankTX:170,wheel:0,recoil:0,shake:0,flash:0,
  len:{expr:'idle',et:0,arm:'rest',say:null,sayT:0},shot:null,strike:false,rebuilds:0,infl:1,inf:false,grace:0,clouds:[],boss:null,ft:0,flags:{},stats:{}};
window.PK={G,DEBUG,save,T};
/* ---------- canvas ---------- */
const cv=document.getElementById('cv'),ctx=cv.getContext('2d'),wrap=document.getElementById('wrap');
let scale=1,dpr=1;
function resize(){const vw=window.innerWidth,vh=window.innerHeight;scale=Math.min(vw/W,vh/H);const cw=Math.floor(W*scale),ch=Math.floor(H*scale);
  dpr=Math.min(2,window.devicePixelRatio||1);wrap.style.width=cw+'px';wrap.style.height=ch+'px';wrap.style.left=Math.floor((vw-cw)/2)+'px';wrap.style.top=Math.floor((vh-ch)/2)+'px';
  cv.width=Math.floor(cw*dpr);cv.height=Math.floor(ch*dpr);document.documentElement.style.setProperty('--u',(cw/100)+'px');document.documentElement.style.setProperty('--hu',(ch/100)+'px');
  const rot=document.getElementById('rotate');if(rot&&!G.rotDismissed)rot.classList.toggle('show',vh>vw*1.1&&Math.min(vw,vh)<900);}
window.addEventListener('resize',resize);window.addEventListener('orientationchange',()=>setTimeout(resize,200));
/* ---------- physics world ---------- */
function newEngine(){const e=Engine.create({enableSleeping:true,positionIterations:10,velocityIterations:8});e.gravity.y=1;
  const ground=Bodies.rectangle(W/2,GROUND+60,W*4,120,{isStatic:true,friction:1,label:'ground'});ground.g={type:'ground'};Composite.add(e.world,ground);
  Events.on(e,'collisionStart',ev=>{for(const p of ev.pairs)pair(p);});return e;}
function mkBlock(x,y,w,h,mat,o){o=o||{};const m=MAT[mat];const b=Bodies.rectangle(x,y,w,h,{density:m.d,friction:.8,frictionStatic:1,restitution:.04,slop:.03});
  b.g={type:'block',mat,w,h,hp:m.hp,maxhp:m.hp,deco:o.deco||null,sign:o.sign||null,fresh:o.fresh?90:0,flash:0};Composite.add(engine.world,b);G.dest.push(b);
  if(o.fresh){G.rbX=x;G.rbY=y;spawnPuff(x,y,8);}return b;}
function mkTri(x,y,w,h,mat){const m=MAT[mat];const b=Bodies.fromVertices(x,y,[[{x:-w/2,y:h/3},{x:w/2,y:h/3},{x:0,y:-2*h/3}]],{density:m.d,friction:.8,frictionStatic:1,restitution:.04});
  Body.setPosition(b,{x,y});b.g={type:'block',shape:'tri',mat,w,h,hp:m.hp,maxhp:m.hp,fresh:0,flash:0};Composite.add(engine.world,b);G.dest.push(b);return b;}
function mkTarget(kind,x,y,w,h,hp){const b=Bodies.rectangle(x,y,w,h,{density:.0018,friction:.8,frictionStatic:1,restitution:.05,chamfer:{radius:4}});
  b.g={type:'target',kind,w,h,hp:hp||70,maxhp:hp||70,fresh:0,flash:0,mat:'target'};Composite.add(engine.world,b);G.dest.push(b);G.targets.push(b);return b;}
const builder={box:mkBlock,tri:mkTri,target:mkTarget};
const rapi={box:(x,y,w,h,mat,o)=>mkBlock(x,y,w,h,mat,Object.assign({fresh:true},o||{})),
  surface(x1,x2){let s=GROUND;for(const b of G.dest){if(b.g.dead)continue;if(b.bounds.max.x<x1||b.bounds.min.x>x2)continue;s=Math.min(s,b.bounds.min.y);}return s;},
  highest(){const L=LEVELS[G.li];let best=null;for(const b of G.dest){if(b.g.dead)continue;if(b.position.x<L.range[0]||b.position.x>L.range[1])continue;if(!best||b.bounds.min.y<best.bounds.min.y)best=b;}
    const x=best?best.position.x:(L.range[0]+L.range[1])/2;return{x:clamp(x,L.range[0]+90,L.range[1]-90),y:best?best.bounds.min.y:GROUND};},
  toSteel(n){const c=G.dest.filter(b=>b.g.type==='block'&&b.g.mat!=='steel'&&!b.g.dead&&b.g.shape!=='tri').sort(()=>Math.random()-.5).slice(0,n);
    for(const b of c){const r=b.g.hp/b.g.maxhp;b.g.mat='steel';b.g.maxhp=MAT.steel.hp;b.g.hp=Math.max(40,MAT.steel.hp*r*0.75);b.g.weak=false;b.g.flash=20;b.g.deco=null;Body.setDensity(b,MAT.steel.d);spawnPuff(b.position.x,b.position.y,5);}
    if(c.length){G.rbX=c[0].position.x;G.rbY=c[0].position.y;}return c.length;}};
/* ---------- level setup ---------- */
function loadLevel(i,keepScore){
  G.li=i;const L=LEVELS[i];engine=newEngine();
  Object.assign(G,{dest:[],targets:[],proj:[],parts:[],floats:[],bankers:[],bubbles:[],banners:[],trail:[],lastTrail:[],tankX:200,tankTX:200,recoil:0,shake:0,flash:0,
    strike:false,rebuilds:0,infl:1,grace:70,boss:null,ft:0,flags:{},levelScore:0,bonus:0,weapon:'hammer',angle:45,power:70,t:0,atk:0,rbMsg:null,rbX:null,prevKey:null});
  G.shots=Math.max(3,L.shots-(save.ng>0&&!L.boss?1:0));G.maxShots=G.shots;G.ammo=Object.assign({},AMMO);G.rev=35;
  G.stats={blocks:0,targets:0,destrPts:0,bonusPts:0,shotsUsed:0,rebuilds:0,bonuses:{}};
  if(!keepScore)G.score=G.runStart;G.runStart=G.score;
  L.build(builder);
  if(L.boss)setupBoss();
  for(const x of L.bankers)G.bankers.push({x,state:'idle',face:-1,t:Math.random()*100,say:null,sayT:0,scale:1});
  G.clouds=[];for(let k=0;k<5;k++)G.clouds.push({x:rnd(0,W),y:rnd(60,300),s:rnd(.6,1.2),v:rnd(.15,.45)});
  G.bg=A.background(i);G.len={expr:'idle',et:0,arm:'rest',say:null,sayT:0};
  G.phase='intro';G.it=0;G.paused=false;
  // settle structures silently
  for(let k=0;k<40;k++)step(true);
  for(const b of G.dest)b.g.hp=b.g.maxhp;
  UI.onLevel();
}
/* ---------- boss ---------- */
function setupBoss(){
  const B={x:1300,visible:true,tilt:0,sink:0,pose:'idle',mood:'idle',hurt:0,eyesRed:false,bodies:[],
    weak:[{id:'monocle',x:1252,y:315,r:22},{id:'vault',x:1180,y:520,r:34},{id:'hat',x:1242,y:222,r:24}]};
  const hp=3+Math.min(2,save.ng);for(const w of B.weak){w.hp=w.max=hp;w.flash=0;}
  const add=(b,type,wp)=>{b.g={type,wp};Composite.add(engine.world,b);B.bodies.push(b);};
  add(Bodies.rectangle(1305,520,230,240,{isStatic:true,restitution:.5}),'armor');
  add(Bodies.circle(1300,320,62,{isStatic:true,restitution:.5}),'armor');
  add(Bodies.rectangle(1305,215,100,95,{isStatic:true,restitution:.5}),'armor');
  add(Bodies.rectangle(1300,265,170,16,{isStatic:true,restitution:.5}),'armor');
  add(Bodies.rectangle(1238,730,60,180,{isStatic:true}),'armor');add(Bodies.rectangle(1362,730,60,180,{isStatic:true}),'armor');
  for(const w of B.weak)add(Bodies.circle(w.x,w.y,w.r+4,{isStatic:true,restitution:.3}),'weak',w);
  G.boss=B;
}
function bossHit(wp,n,p){
  if(!wp||wp.hp<=0)return;if(p){if(p.hit.has(wp.id))return;p.hit.add(wp.id);}
  wp.hp=Math.max(0,wp.hp-n);wp.flash=14;G.boss.hurt=14;G.boss.mood='angry';SFX.play('weak');G.shake=Math.max(G.shake,10);
  addScore(4000*n,wp.x,wp.y-40,T('weak'),'#c8202a');if(G.shot)G.shot.weakHits++;
  for(let k=0;k<20;k++)G.parts.push({ty:'coin',x:wp.x,y:wp.y,vx:rnd(-6,6),vy:rnd(-9,-2),life:rnd(50,90),rot:0,vr:rnd(-.3,.3),s:rnd(5,9)});
  lenSay(pick(T('shouts')),'shout','fist');
  if(wp.hp<=0){const b=G.boss.bodies.find(x=>x.g.wp===wp);if(b)Composite.remove(engine.world,b);boom(wp.x,wp.y,.8);}
}
const bossAlive=()=>G.boss&&G.boss.weak.some(w=>w.hp>0);
/* ---------- collisions ---------- */
function pair(p){
  const a=p.bodyA,b=p.bodyB;if(!a.g||!b.g)return;
  const pa=a.g.type==='proj'?a:(b.g.type==='proj'?b:null),o=pa===a?b:a;
  if(pa){const pr=pa.g.p;
    if(o.g.type==='bubble'){popBubble(o,pr);return;}
    if(o.g.type==='weak'){bossHit(o.g.wp,pr.w==='rev'?2:1,pr);}
    else if(o.g.type==='armor'){const sp=p.collision.supports&&p.collision.supports[0];let hitWeak=false;
      if(sp)for(const w of G.boss.weak){if(w.hp>0&&Math.hypot(sp.x-w.x,sp.y-w.y)<w.r+30){bossHit(w,pr.w==='rev'?2:1,pr);hitWeak=true;}}
      if(!hitWeak&&!pr.hit.has('armor')){pr.hit.add('armor');SFX.play('metal');floatText(pa.position.x,pa.position.y-30,T('armor'),'#1b1513',30);}}
    if((pr.w==='star'||pr.w==='leaflet'||pr.w==='rev')&&!pr.det)pr.det=true;
    if(pr.w==='hammer'&&!pr.thud){pr.thud=true;SFX.play('thud');}
  }
  if(a.g.type==='bubble'||b.g.type==='bubble')return;
  if(G.grace>0)return;
  const va=Body.getVelocity(a),vb=Body.getVelocity(b),n=p.collision.normal;
  const s=Math.abs((va.x-vb.x)*n.x+(va.y-vb.y)*n.y);
  hit(a,b,s);hit(b,a,s);
}
function hit(i,o,s){
  const g=i.g;if(!(g.type==='block'||g.type==='target')||g.dead)return;if(g.fresh>0||(o.g&&o.g.fresh>0))return;if(s<1.8)return;
  const m=o.isStatic?i.mass*1.5:o.mass;let f=clamp(m/i.mass,.3,4);const byP=o.g&&o.g.type==='proj';if(byP)f*=WPN[o.g.w].mult;
  damage(i,(s-1.8)*8*f,byP);
}
function damage(b,d,byP){const g=b.g;if(g.dead||d<=0)return;g.hp-=d;g.flash=6;if(G.shot)G.shot.dmg+=d;
  if(d>12){chips(b,3);if(d>30)SFX.play(g.type==='target'?'coins':'thud',.5);}
  if(g.hp<=0)destroy(b);}
function destroy(b,off){
  const g=b.g;if(g.dead)return;g.dead=true;Composite.remove(engine.world,b);
  G.dest.splice(G.dest.indexOf(b),1);const x=b.position.x,y=b.position.y;
  if(g.type==='target'){G.targets.splice(G.targets.indexOf(b),1);addScore(5000,x,y-30,'+5000','#c8202a',true);G.stats.targets++;if(G.shot)G.shot.targets++;
    SFX.play('target');for(let k=0;k<26;k++)G.parts.push({ty:k%3?'coin':'bill',x,y,vx:rnd(-7,7),vy:rnd(-11,-3),life:rnd(60,110),rot:rnd(0,6),vr:rnd(-.3,.3),s:rnd(6,10)});
    lenSay(pick(T('shouts')),'shout','point');flee(x,380,false);}
  else{const m=MAT[g.mat]||MAT.wood;addScore(m.pts,x,y,'+'+m.pts,'#1b1513');G.stats.blocks++;if(G.shot)G.shot.blocks++;SFX.play(m.snd,.7);flee(x,240,false);}
  if(!off)chips(b,14);spawnPuff(x,y,4);
}
function chips(b,n){const g=b.g,col=(MAT[g.mat]||{col:['#cfa66a','#7a5a2c']}).col;for(let k=0;k<n;k++){if(G.parts.length>700)break;
  G.parts.push({ty:'chip',x:b.position.x+rnd(-g.w/2,g.w/2)*.8,y:b.position.y+rnd(-g.h/2,g.h/2)*.8,vx:rnd(-5,5),vy:rnd(-8,-1),life:rnd(40,80),rot:rnd(0,6),vr:rnd(-.4,.4),s:rnd(4,11),c:col[k%2]});}}
function spawnPuff(x,y,n){for(let k=0;k<n;k++)G.parts.push({ty:'smoke',x:x+rnd(-20,20),y:y+rnd(-15,15),vx:rnd(-.6,.6),vy:rnd(-1.2,-.2),life:rnd(40,70),s:rnd(10,22)});}
function boom(x,y,k){k=k||1;G.shake=Math.max(G.shake,14*k);for(let i=0;i<28*k;i++){const a=rnd(0,6.28),v=rnd(2,9)*k;G.parts.push({ty:'fire',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rnd(20,40),s:rnd(10,24)*k});}
  for(let i=0;i<14*k;i++)G.parts.push({ty:'smoke',x:x+rnd(-30,30),y:y+rnd(-30,30),vx:rnd(-1,1),vy:rnd(-2,-.4),life:rnd(60,100),s:rnd(18,36)*k});
  G.parts.push({ty:'ring',x,y,life:22,s:20,max:160*k});}
function addScore(pts,x,y,label,col,big){G.levelScore+=pts;G.score+=pts;G.rev=Math.min(100,G.rev+pts/380);if(label)floatText(x,y,label,col,big?42:26);}
function floatText(x,y,text,col,size){G.floats.push({x:clamp(x,120,W-120),y,text,col:col||'#1b1513',size:size||28,t:0});}
function banner(text,dur,y,opts){G.banners.push({text,t:0,dur:dur||120,y:y||300,opts:opts||{}});}
function lenSay(text,expr,arm,dur){const L=G.len;if(L.sayT>40&&expr!=='force')return;L.say=text;L.sayT=dur||130;L.expr=expr==='force'?'shout':(expr||'shout');L.et=dur||130;L.arm=arm||'rest';SFX.play('shout');}
function flee(x,R,byLeaflet){for(const bk of G.bankers){if(bk.state!=='idle'&&bk.state!=='walkin')continue;if(Math.abs(bk.x-x)>R)continue;bk.state='run';bk.say=pick(T('bankers'));bk.sayT=90;
  if(byLeaflet){addScore(1000,bk.x,GROUND-150,T('agit')+' +1000','#c8202a');if(G.shot)G.shot.scared++;}}}
function popBubble(bb,pr){if(bb.g.dead)return;bb.g.dead=true;Composite.remove(engine.world,bb);G.bubbles.splice(G.bubbles.indexOf(bb),1);SFX.play('pop');
  floatText(bb.position.x,bb.position.y-40,T('pop'),'#c8202a',34);for(let k=0;k<16;k++){const a=k/16*6.28;G.parts.push({ty:'spark',x:bb.position.x+Math.cos(a)*38,y:bb.position.y+Math.sin(a)*38,vx:Math.cos(a)*3,vy:Math.sin(a)*3,life:20,s:6,c:'#9fd3ff'});}
  if(pr){if(pr.body){const v=Body.getVelocity(pr.body);Body.setVelocity(pr.body,{x:v.x*.35,y:v.y*.35});}else{pr.vx*=.35;pr.vy*=.35;}}}
/* ---------- explosions & specials ---------- */
function explode(x,y,R,dmg,power,pr,kind){
  boom(x,y,R/150);SFX.play(kind==='rev'?'bigboom':'boom');
  for(const b of G.dest.slice()){if(b.g.dead)continue;const dx=b.position.x-x,dy=b.position.y-y,d=Math.hypot(dx,dy);const eff=Math.max(0,d-Math.max(b.g.w,b.g.h)*.35);if(eff>R)continue;
    const f=1-eff/R,nx=dx/(d||1),ny=dy/(d||1);Sleeping.set(b,false);const v=Body.getVelocity(b),k=power*f/Math.sqrt(Math.max(1,b.mass));
    Body.setVelocity(b,{x:v.x+nx*k,y:v.y+ny*k-k*.35});Body.setAngularVelocity(b,b.angularVelocity+rnd(-.15,.15)*f);damage(b,dmg*f,true);}
  if(G.boss)for(const w of G.boss.weak)if(w.hp>0&&Math.hypot(w.x-x,w.y-y)<R+w.r)bossHit(w,kind==='rev'?2:1,pr);
  for(const bb of G.bubbles.slice())if(Math.hypot(bb.position.x-x,bb.position.y-y)<R+40)popBubble(bb,null);
  flee(x,R*2.2,false);
}
function burstLeaflets(x,y){
  SFX.play('paper');let weakened=0;
  for(let k=0;k<60;k++)G.parts.push({ty:'leaf',x:x+rnd(-20,20),y:y+rnd(-20,20),vx:rnd(-7,7),vy:rnd(-7,2),life:rnd(150,240),rot:rnd(0,6),vr:rnd(-.2,.2),s:rnd(8,13),ph:rnd(0,6),c:k%3?'#ecdcb8':'#c8202a'});
  for(const b of G.dest){if(b.g.type!=='block'||b.g.weak)continue;if(Math.hypot(b.position.x-x,b.position.y-y)>240)continue;b.g.weak=true;b.g.hp*=.5;b.friction=.25;b.frictionStatic=.3;b.g.flash=8;weakened++;Sleeping.set(b,false);}
  for(const b of G.targets){if(Math.hypot(b.position.x-x,b.position.y-y)<240){b.g.hp*=.6;b.g.flash=8;}}
  if(G.shot)G.shot.weakened+=weakened;
  flee(x,460,true);G.strike=true;floatText(x,y-60,T('strike').split(/[!.]/)[0]+'!','#c8202a',36);
  for(const bb of G.bubbles.slice())if(Math.hypot(bb.position.x-x,bb.position.y-y)<260)popBubble(bb,null);
}
function detonate(pr){
  const b=pr.body,x=b?b.position.x:pr.x,y=b?b.position.y:pr.y;
  if(pr.w==='star')explode(x,y,150,140,16,pr,'star');
  else if(pr.w==='leaflet')burstLeaflets(x,y);
  else if(pr.w==='rev'){explode(x,y,270,260,28,pr,'rev');G.flash=26;banner(T('w_rev'),110,250,{size:120,bg:'#1b1513',fg:'#f2c230'});
    const tg=G.boss?G.boss.weak.filter(w=>w.hp>0).map(w=>({x:w.x,y:w.y})):G.targets.slice(0,5).map(t=>({x:t.position.x,y:t.position.y}));
    tg.forEach((t,k)=>{const hb=Bodies.circle(t.x+rnd(-10,10),-80-k*90,WPN.hammer.r,{density:WPN.hammer.d,friction:.6,restitution:.2,frictionAir:0});
      const rec={w:'hammer',body:hb,t:0,still:0,hit:new Set(),rain:true};hb.g={type:'proj',w:'hammer',p:rec};Composite.add(engine.world,hb);Body.setVelocity(hb,{x:0,y:14});G.proj.push(rec);});}
  if(b)Composite.remove(engine.world,b);pr.dead=true;
}
/* ---------- firing ---------- */
function launchVel(){const v=G.power/100*VMAX*G.infl,a=G.angle*Math.PI/180;return{x:Math.cos(a)*v,y:-Math.sin(a)*v};}
function canFire(w){w=w||G.weapon;if(w==='rev')return G.rev>=100;if(AMMO[w]!=null)return G.ammo[w]>0;return true;}
function fire(){
  if(G.phase!=='aim'||G.paused)return false;const w=G.weapon;if(!canFire(w))return false;
  if(!G.inf)G.shots--;if(AMMO[w]!=null)G.ammo[w]--;if(w==='rev')G.rev=0;G.stats.shotsUsed++;
  const v=launchVel(),m=A.muzzle(G.tankX,G.angle);G.infl=1;
  let rec;
  if(w==='sickle'){rec={w,x:m.x,y:m.y,vx:v.x*.85,vy:v.y*.85,t:0,rot:0,hit:new Set()};SFX.play('sickle');}
  else{const sp=WPN[w];const b=Bodies.circle(m.x,m.y,sp.r,{density:sp.d,friction:.6,restitution:.25,frictionAir:0});rec={w,body:b,t:0,still:0,hit:new Set()};b.g={type:'proj',w,p:rec};
    Composite.add(engine.world,b);Body.setVelocity(b,v);Body.setAngularVelocity(b,.25);}
  G.proj.push(rec);G.lastTrail=G.trail;G.trail=[];G.phase='flight';G.recoil=16;G.shake=Math.max(G.shake,5);
  G.shot={w,blocks:0,targets:0,dmg:0,scared:0,weakened:0,weakHits:0};
  SFX.play('cannon');SFX.play('whoosh');for(let k=0;k<10;k++)G.parts.push({ty:'smoke',x:m.x,y:m.y,vx:Math.cos(G.angle*Math.PI/180)*rnd(1,3)+rnd(-.5,.5),vy:-Math.sin(G.angle*Math.PI/180)*rnd(1,3)+rnd(-.5,.5),life:rnd(30,50),s:rnd(10,20)});
  G.len.expr='idle';if(!canFire(G.weapon))G.weapon='hammer';UI.sync();return true;
}
function tapAction(){let did=false;for(const p of G.proj){if(p.dead||p.rain)continue;if(p.w==='star'||p.w==='leaflet'||p.w==='rev'){if(!p.det){p.det=true;did=true;}}else if(p.w==='sickle'&&!p.rev){p.rev=true;p.vx=-Math.abs(p.vx)-4;did=true;}}return did;}
/* ---------- sickle kinematics (shared with preview) ---------- */
function sickleStep(p){p.vx-=.17;p.vy+=.11;p.x+=p.vx;p.y+=p.vy;p.rot+=.45;if(p.y>GROUND-16){p.y=GROUND-16;p.vy=-Math.abs(p.vy)*.3;}}
let dummy=null;
function updateSickle(p){
  sickleStep(p);p.t++;if(!dummy)dummy=Bodies.circle(0,0,24);Body.setPosition(dummy,{x:p.x,y:p.y});
  const hits=Query.collides(dummy,G.dest);
  for(const c of hits){const b=c.bodyA===dummy?c.bodyB:c.bodyA;if(p.hit.has(b.id)||b.g.dead)continue;p.hit.add(b.id);
    if(b.g.mat==='steel'){p.vx=-Math.abs(p.vx)*.6;SFX.play('metal');damage(b,40,true);continue;}
    Sleeping.set(b,false);const v=Body.getVelocity(b);Body.setVelocity(b,{x:v.x+p.vx*.12,y:v.y+p.vy*.12-1});damage(b,b.g.type==='target'?60:75,true);SFX.play('sickle');p.vx*=.9;}
  if(G.boss){for(const w of G.boss.weak)if(w.hp>0&&Math.hypot(w.x-p.x,w.y-p.y)<w.r+26)bossHit(w,1,p);
    const ah=Query.collides(dummy,G.boss.bodies.filter(b=>b.g.type==='armor'));if(ah.length&&p.vx>0){p.vx=-Math.abs(p.vx)*.7;SFX.play('metal');if(!p.hit.has('armor')){p.hit.add('armor');floatText(p.x,p.y-30,T('armor'),'#1b1513',30);}}}
  for(const bb of G.bubbles.slice())if(Math.hypot(bb.position.x-p.x,bb.position.y-p.y)<62)popBubble(bb,p);
  if((p.t>30&&p.x<G.tankX+60)||p.x<-120||p.x>W+200||p.y<-900||p.t>480)p.dead=true;
}
/* ---------- trajectory simulation (preview + solver) ---------- */
function simulate(angle,power,w,maxT,infl){
  w=w||'hammer';const v0=power/100*VMAX*(infl||1),a=angle*Math.PI/180,m=A.muzzle(G.tankX,angle),pts=[];maxT=maxT||420;
  if(w==='sickle'){const p={x:m.x,y:m.y,vx:Math.cos(a)*v0*.85,vy:-Math.sin(a)*v0*.85,rot:0};for(let t=0;t<maxT;t++){sickleStep(p);if(t%2===0)pts.push({x:p.x,y:p.y});if((t>30&&p.x<G.tankX+60)||p.x>W+100||p.y<-900)break;}return pts;}
  if(!pe){pe=Engine.create();pe.gravity.y=1;}Composite.clear(pe.world,false);
  const sp=WPN[w]||WPN.hammer;const b=Bodies.circle(m.x,m.y,sp.r,{density:sp.d,frictionAir:0});Composite.add(pe.world,b);Body.setVelocity(b,{x:Math.cos(a)*v0,y:-Math.sin(a)*v0});
  for(let t=0;t<maxT;t++){for(let s=0;s<SUB;s++)Engine.update(pe,DT);pts.push({x:b.position.x,y:b.position.y});if(b.position.y>GROUND||b.position.x>W+100||b.position.x<-100)break;}
  return pts;
}
/* ---------- main step ---------- */
function step(silent){
  for(let s=0;s<SUB;s++)Engine.update(engine,DT);
  if(silent)return;
  G.t++;if(G.grace>0)G.grace--;
  for(const b of G.dest){if(b.g.fresh>0)b.g.fresh--;if(b.g.flash>0)b.g.flash--;}
  // out of world
  for(const b of G.dest.slice()){if(b.position.y>GROUND+150||b.position.x>W+160||b.position.x<-160)destroy(b,true);}
  // projectiles
  for(const p of G.proj){if(p.dead)continue;p.t++;
    if(p.w==='sickle'){updateSickle(p);if(G.t%2===0)G.trail.push({x:p.x,y:p.y});continue;}
    const b=p.body;if(!p.rain&&G.t%2===0)G.trail.push({x:b.position.x,y:b.position.y});
    if(p.det){detonate(p);continue;}
    const sp=b.speed;if(sp<.35)p.still++;else p.still=0;
    if(b.position.x>W+120||b.position.x<-150||b.position.y>GROUND+200||p.still>45||p.t>540){if(p.w==='star'||p.w==='leaflet'||p.w==='rev'){detonate(p);}else{Composite.remove(engine.world,b);p.dead=true;}}}
  G.proj=G.proj.filter(p=>!p.dead);
  // bankers
  for(const bk of G.bankers){bk.t++;if(bk.sayT>0)bk.sayT--;
    if(bk.state==='run'){bk.x+=5.5;}else if(bk.state==='walkin'){bk.x-=2;bk.face=-1;if(bk.x<=bk.tx)bk.state='idle';}
    else if(Math.random()<1/900&&!G.bankers.some(o=>o.sayT>0)){bk.say=pick(T('bankers'));bk.sayT=110;}}
  G.bankers=G.bankers.filter(b=>b.x<W+120);
  // lenin
  const L=G.len;if(L.sayT>0)L.sayT--;if(L.et>0){L.et--;if(L.et===0){L.expr='idle';L.arm='rest';}}
  // tank slide
  if(Math.abs(G.tankX-G.tankTX)>.5){G.tankX+=(G.tankTX-G.tankX)*.12;G.wheel+=(G.tankTX-G.tankX)*.02;}
  if(G.recoil>0)G.recoil*=.85;if(G.shake>0)G.shake*=.88;if(G.shake<.3)G.shake=0;if(G.flash>0)G.flash--;
  if(G.boss){if(G.boss.hurt>0)G.boss.hurt--;for(const w of G.boss.weak)if(w.flash>0)w.flash--;}
  // particles
  for(const p of G.parts){p.life--;p.x+=p.vx||0;p.y+=p.vy||0;
    if(p.ty==='chip'||p.ty==='coin'){p.vy+=.35;p.rot+=p.vr;if(p.y>GROUND-3){p.y=GROUND-3;p.vy*=-.35;p.vx*=.7;}}
    else if(p.ty==='bill'){p.vy=Math.min(p.vy+.15,1.6);p.vx*=.97;p.rot+=p.vr;}
    else if(p.ty==='leaf'){p.vy=Math.min(p.vy+.12,1.3);p.vx=p.vx*.96+Math.sin(G.t*.08+p.ph)*.25;p.rot+=p.vr;}
    else if(p.ty==='smoke'){p.s*=1.012;p.vx*=.98;}else if(p.ty==='fire'){p.vx*=.9;p.vy*=.9;}else if(p.ty==='ring'){p.s+=(p.max-p.s)*.25;}
    else if(p.ty==='fly'){const k=Math.min(1,(G.ft-p.t0)/70);const e=k*k*(3-2*k);p.x=p.sx+(p.tx-p.sx)*e;p.y=p.sy+(p.ty2-p.sy)*e-Math.sin(e*Math.PI)*120;p.life=k>=1?0:10;}}
  G.parts=G.parts.filter(p=>p.life>0);
  for(const f of G.floats){f.t++;f.y-=.8;}G.floats=G.floats.filter(f=>f.t<80);
  for(const b of G.banners)b.t++;G.banners=G.banners.filter(b=>b.t<b.dur);
  for(const c of G.clouds){c.x+=c.v;if(c.x>W+150)c.x=-150;}
  phaseTick();
}
function maxSpeed(){let m=0;for(const b of G.dest){if(b.isSleeping)continue;m=Math.max(m,b.speed,Math.abs(b.angularSpeed)*20);}return m;}
function phaseTick(){
  const L=LEVELS[G.li];
  switch(G.phase){
  case 'intro':G.it++;if(G.it>110){G.phase='aim';}break;
  case 'flight':if(G.boss&&!bossAlive()){startFinale();break;}if(!G.proj.length){G.phase='settle';G.st=0;G.calm=0;}break;
  case 'settle':{G.st++;const ms=maxSpeed();if(ms<.3)G.calm++;else G.calm=0;
    if(G.boss&&!bossAlive()){startFinale();break;}
    if(G.targets.length===0&&!L.boss&&G.st>30){endShot();break;}
    if((G.st>40&&G.calm>14)||G.st>320)endShot();break;}
  case 'rebuild':G.rt++;
    if(G.rt===28){if(G.rbMsg==='strike'){}else{const msg=L.rebuild(rapi,G.rebuilds+1);if(msg){G.rebuilds++;G.stats.rebuilds++;banner(T(msg),95,190,{size:70,rot:.04});SFX.play('build');if(Math.random()<.5)lenSay(pick(T('rebuildLines')),'grumpy','rest',90);}else{G.rt=200;}}}
    if(G.rt>=118){if(L.boss&&bossAlive()){G.phase='bossAttack';G.bt=0;}else G.phase='aim';}
    if(G.targets.length===0&&!L.boss)win();break;
  case 'bossAttack':bossAttackTick();break;
  case 'aim':if(!L.boss&&G.targets.length===0)win();break;
  case 'won':case 'lost':G.et++;if(G.et===150){UI.showResult(G.phase==='won');G.phase='panel';}break;
  case 'finale':finaleTick();break;
  }
}
function endShot(){
  const s=G.shot||{w:'hammer',blocks:0,targets:0,dmg:0,scared:0,weakened:0,weakHits:0},L=LEVELS[G.li];G.shot=null;
  const bonus=(key,pts)=>{G.bonus+=pts;G.stats.bonusPts+=pts;G.stats.bonuses[key]=(G.stats.bonuses[key]||0)+pts;addScore(pts,1100,330+Object.keys(G.stats.bonuses).length*0,T(key)+' +'+pts,'#c8202a',true);banner(T(key)+' +'+pts,80,420,{size:54,bg:'#1b1513',rot:-.03});};
  if(s.blocks>=6)bonus('chain',Math.min(10000,(s.blocks-5)*800));
  if(s.targets>=2)bonus('multi',3000*(s.targets-1));
  if(s.w!=='hammer'&&(s.targets>=1||s.blocks>=3||s.scared>=1||s.weakened>=4||s.weakHits>=1))bonus('special',2500);
  if(s.dmg<5&&s.targets===0&&s.weakHits===0&&s.scared===0)lenSay(pick(T('misses')),'grumpy','rest',110);
  if(!L.boss&&G.targets.length===0){win();return;}
  if(G.shots<=0&&!G.inf){lose();return;}
  startRebuild();
}
function startRebuild(){
  const L=LEVELS[G.li];G.phase='rebuild';G.rt=0;G.rbX=null;
  for(const bb of G.bubbles.slice()){bb.g.ttl--;if(bb.g.ttl<=0)popBubble(bb,null);}
  if(G.strike){G.strike=false;G.rbMsg='strike';banner(T('strike'),100,190,{size:56,bg:'#1b1513'});G.rt=40;return;}
  G.rbMsg=null;
  if(G.rebuilds>=5+Math.min(3,save.ng)){G.rt=200;return;}
  if(L.bankers.length&&G.bankers.length<2)G.bankers.push({x:W+60,tx:rnd(L.range[1]-40,W-40),state:'walkin',face:-1,t:0,say:null,sayT:0,scale:1});
}
function win(){if(G.phase==='won'||G.phase==='panel')return;G.phase='won';G.et=0;G.proj.forEach(p=>{if(p.body)Composite.remove(engine.world,p.body);});G.proj=[];
  G.shotsBonus=G.inf?0:G.shots*10000;G.levelScore+=G.shotsBonus;G.score+=G.shotsBonus;
  banner(T('win'),170,330,{size:80});SFX.play('win');lenSay(pick(T('shouts')),'force','fist',150);G.len.expr='laugh';
  for(const bk of G.bankers)if(bk.state!=='run'){bk.state='run';bk.say=pick(T('bankers'));bk.sayT=80;}
  for(let k=0;k<50;k++)G.parts.push({ty:'leaf',x:rnd(0,W),y:rnd(-200,0),vx:rnd(-1,1),vy:rnd(0,2),life:rnd(160,260),rot:rnd(0,6),vr:rnd(-.2,.2),s:rnd(8,14),ph:rnd(0,6),c:k%2?'#c8202a':'#f2c230',star:true});
  const L=LEVELS[G.li];G.stars=G.shots>=2?3:G.shots>=1?2:1;
  const prev=save.best[L.id]||0;G.newRecord=G.levelScore>prev;if(G.newRecord)save.best[L.id]=G.levelScore;
  save.unlocked=Math.max(save.unlocked,Math.min(8,L.id+1));if(G.score>save.bestTotal)save.bestTotal=G.score;persist();}
function lose(){G.phase='lost';G.et=0;banner(T('lose'),170,330,{size:84,bg:'#1b1513'});SFX.play('lose');G.len.expr='grumpy';G.len.et=200;lenSay(pick(T('misses')),'grumpy','rest',150);}
/* ---------- boss attacks ---------- */
function bossAttackTick(){
  const B=G.boss;G.bt++;const kinds=['rate','infl','bubble'];
  if(G.bt===1){G.atkKind=kinds[G.atk%3];G.atk++;B.pose='attack';banner(T('a_'+G.atkKind),100,170,{size:72,bg:'#1b1513',fg:'#f2c230',rot:.05});SFX.play('alarm');SFX.play('robot');B.say=pick(T('boss'));B.sayT=100;}
  const k=G.atkKind;
  if(k==='rate'){if(G.bt>=20&&G.bt<=70){const e=(G.bt-20)/50;G.atkObj={kind:'%',x:1430+(G.tankX-1430)*e,y:420+(700-420)*e-Math.sin(e*Math.PI)*380,rot:e*12};}
    if(G.bt===70){G.atkObj=null;boom(G.tankX+60,720,.8);SFX.play('boom');G.tankTX=Math.max(140,G.tankX-30);G.len.expr='surprised';G.len.et=80;floatText(G.tankX,560,T('e_rate'),'#c8202a',32);}}
  else if(k==='infl'){if(G.bt>=15&&G.bt<=85){const e=(G.bt-15)/70;G.atkObj={kind:'$',x:1430-(1430-G.tankX-40)*Math.max(0,e-.4)/.6,y:380-Math.min(1,e*2.5)*80+Math.max(0,e-.4)/.6*220,s:.4+Math.min(1,e*2.5)*1.1};}
    if(G.bt===86){G.atkObj=null;G.infl=.7;SFX.play('pop');G.len.expr='surprised';G.len.et=80;floatText(G.tankX+60,560,T('e_infl'),'#c8202a',28);UI.sync();}}
  else if(k==='bubble'){if(G.bt===40){const n=3;for(let i=0;i<n;i++){const x=rnd(520,1050),y=rnd(260,640);const bb=Bodies.circle(x,y,38,{isStatic:true,isSensor:true});bb.g={type:'bubble',ttl:3,ph:rnd(0,6)};Composite.add(engine.world,bb);G.bubbles.push(bb);}
      SFX.play('pop');floatText(800,240,T('e_bubble'),'#c8202a',32);}}
  if(G.bt>=115){B.pose='idle';G.atkObj=null;G.phase='aim';}
}
/* ---------- finale ---------- */
function startFinale(){
  G.phase='finale';G.ft=0;G.flags={defeatedHP:G.boss.weak.map(w=>w.hp)};for(const bb of G.bubbles.slice())popBubble(bb,null);G.atkObj=null;G.proj.forEach(p=>{if(p.body)Composite.remove(engine.world,p.body);});G.proj=[];
  G.levelScore+=G.shots*10000;G.score+=G.shots*10000;save.unlocked=8;save.ngMax=Math.max(save.ngMax||0,save.ng+1);const L=LEVELS[G.li];
  if(G.levelScore>(save.best[L.id]||0))save.best[L.id]=G.levelScore;if(G.score>save.bestTotal)save.bestTotal=G.score;persist();SFX.music(false);
}
function finaleTick(){
  const B=G.boss;G.ft++;const f=G.ft;
  if(f<60){B.tilt=Math.sin(f*1.3)*.03;if(f%6===0){boom(B.x+rnd(-120,120),rnd(250,650),.5);SFX.play('boom');}if(f===1)SFX.play('alarm');}
  if(f===60){B.visible=false;B.tilt=0;for(const b of B.bodies)Composite.remove(engine.world,b);G.flags.exploded=true;boom(B.x,450,2.2);SFX.play('bigboom');G.flash=20;
    G.coins=[];for(let i=0;i<70;i++){const x=B.x+rnd(-130,130),y=rnd(220,780);const c=Bodies.circle(x,y,10,{density:.002,restitution:.45,friction:.4});c.g={type:'coin'};Composite.add(engine.world,c);
      const a=Math.atan2(y-500,x-B.x);Body.setVelocity(c,{x:Math.cos(a)*rnd(4,14),y:Math.sin(a)*rnd(4,12)-rnd(4,9)});G.coins.push(c);}
    lenSay(T('leninWon'),'force','fist',200);G.len.expr='laugh';}
  if(f===120){SFX.play('fanfare');G.flags.victory=true;}
  if(f>=120&&f<420){G.starY=Math.max(260,1000-(f-120)*9);if(f===150)banner(T('leninWon'),270,560,{size:110,rot:-.04});if(f%40===0)SFX.play('coins');}
  if(f===420){SFX.play('reboot');}
  if(f>=420){G.rebootPct=Math.min(99,Math.floor((f-420)/150*99));if(G.rebootPct>=99)G.flags.reboot99=true;}
  if(f===600){for(const c of G.coins){Composite.remove(engine.world,c);G.parts.push({ty:'fly',x:c.position.x,y:c.position.y,sx:c.position.x,sy:c.position.y,tx:B.x+rnd(-120,120),ty2:rnd(200,780),t0:f,life:10,s:9});}G.coins=[];SFX.play('coins');}
  if(f===670){for(const w of B.weak){w.hp=w.max;}B.visible=true;B.tilt=-1.3;B.sink=160;B.eyesRed=true;B.pose='laugh';SFX.play('robot');}
  if(f>670&&f<=730){const e=(f-670)/60,k=e*e*(3-2*e);B.tilt=-1.3*(1-k);B.sink=160*(1-k);if(f%15===0)G.shake=8;}
  if(f===735){G.flags.stood=true;B.say=pick(T('boss'));B.sayT=9999;SFX.play('robot');}
  if(f===760){UI.showFinale();}
}
/* ---------- rendering ---------- */
let prevPts=[],lastFrame=0;
function render(){
  const s=scale*dpr;ctx.setTransform(s,0,0,s,0,0);
  if(!G.bg){ctx.fillStyle='#ecdcb8';ctx.fillRect(0,0,W,H);return;}
  ctx.save();if(G.shake)ctx.translate(rnd(-G.shake,G.shake),rnd(-G.shake,G.shake));
  ctx.drawImage(G.bg,0,0);
  for(const c of G.clouds)A.cloud(ctx,c.x,c.y,c.s);
  // finale star
  if(G.phase==='finale'&&G.ft>=120&&G.ft<480){const a=Math.min(1,(G.ft-120)/30)*(G.ft>420?1-(G.ft-420)/60:1);ctx.save();ctx.globalAlpha=Math.max(0,a);ctx.translate(W/2,G.starY);
    for(let i=0;i<24;i++){ctx.rotate(Math.PI/12);ctx.fillStyle=i%2?'rgba(242,194,48,.55)':'rgba(200,32,42,.45)';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(1400,-90);ctx.lineTo(1400,90);ctx.fill();}
    ctx.rotate(G.ft*.004);ctx.fillStyle='#c8202a';ctx.strokeStyle='#1b1513';ctx.lineWidth=10;A.star(ctx,0,0,190,0);ctx.fill();ctx.stroke();ctx.fillStyle='#f2c230';A.star(ctx,0,0,80,0);ctx.fill();ctx.restore();}
  if(G.boss)A.boss(ctx,G.boss,G.t);
  if(G.coins)for(const c of G.coins){ctx.save();ctx.translate(c.position.x,c.position.y);ctx.rotate(c.angle);ctx.fillStyle='#e9b824';ctx.strokeStyle='#1b1513';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,10,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#a87908';ctx.font='12px '+A.FONT_H;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('$',0,1);ctx.restore();}
  for(const b of G.dest){if(b.g.type==='target')A.target(ctx,b,G.t);else A.block(ctx,b,b.g.sign?T(b.g.sign):null);}
  for(const bb of G.bubbles){const x=bb.position.x,y=bb.position.y+Math.sin(G.t*.05+bb.g.ph)*6;ctx.save();ctx.globalAlpha=.8;const gr=ctx.createRadialGradient(x-12,y-14,4,x,y,40);gr.addColorStop(0,'#fff');gr.addColorStop(.5,'rgba(190,225,255,.5)');gr.addColorStop(1,'rgba(120,170,230,.7)');
    ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,38,0,7);ctx.fill();ctx.strokeStyle='#1b1513';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#8e1219';ctx.font='26px '+A.FONT_H;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('-$',0+x,y+2);ctx.restore();}
  for(const bk of G.bankers)A.banker(ctx,bk,G.t);
  // aim helpers
  if(G.phase==='aim'){
    if(G.lastTrail.length){ctx.fillStyle='rgba(27,21,19,.28)';for(let i=0;i<G.lastTrail.length;i+=2){ctx.beginPath();ctx.arc(G.lastTrail[i].x,G.lastTrail[i].y,3,0,7);ctx.fill();}}
    if(G.preview){const key=G.angle+'|'+G.power+'|'+G.weapon+'|'+G.infl+'|'+Math.round(G.tankX);if(key!==G.prevKey){G.prevKey=key;prevPts=simulate(G.angle,G.power,G.weapon,420,G.infl);}
      const n=Math.floor(prevPts.length*PREV_FRAC);ctx.fillStyle='#1b1513';for(let i=2;i<n;i+=4){const p=prevPts[i];ctx.globalAlpha=1-i/n*.7;ctx.beginPath();ctx.arc(p.x,p.y,5,0,7);ctx.fill();}ctx.globalAlpha=1;}
  }
  if(G.trail.length){ctx.strokeStyle='rgba(200,32,42,.55)';ctx.lineWidth=4;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(G.trail[0].x,G.trail[0].y);for(const p of G.trail)ctx.lineTo(p.x,p.y);ctx.stroke();ctx.setLineDash([]);}
  A.tank(ctx,G.tankX,G.angle,G.len.expr,G.t,G.recoil,G.len.arm,T('tankName'),G.wheel);
  if(G.drag&&G.drag.active){const m=A.muzzle(G.tankX,G.angle);ctx.strokeStyle='#c8202a';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(G.drag.sx,G.drag.sy);ctx.lineTo(G.drag.cx,G.drag.cy);ctx.stroke();
    ctx.fillStyle='#f2c230';ctx.strokeStyle='#1b1513';ctx.lineWidth=3;ctx.beginPath();ctx.arc(G.drag.cx,G.drag.cy,14,0,7);ctx.fill();ctx.stroke();
    ctx.font='28px '+A.FONT_H;ctx.fillStyle='#1b1513';ctx.textAlign='left';ctx.fillText(G.angle+'°  '+G.power+'%',G.drag.cx+22,G.drag.cy-14);}
  for(const p of G.proj)A.projectile(ctx,p,G.t);
  if(G.atkObj){const o=G.atkObj;ctx.save();ctx.translate(o.x,o.y);if(o.kind==='%'){ctx.rotate(o.rot);ctx.font='110px '+A.FONT_H;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#1b1513';ctx.fillText('%',5,5);ctx.fillStyle='#c8202a';ctx.fillText('%',0,0);}
    else{ctx.scale(o.s,o.s);ctx.fillStyle='#7fbf6a';ctx.strokeStyle='#1b1513';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,0,50,62,0,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(0,62);ctx.lineTo(0,110);ctx.stroke();ctx.fillStyle='#1b1513';ctx.font='70px '+A.FONT_H;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('$',0,4);}ctx.restore();}
  drawParts();
  for(const f of G.floats){ctx.save();ctx.globalAlpha=Math.min(1,(80-f.t)/25);ctx.font=f.size+'px '+A.FONT_H;ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#fffaf0';ctx.strokeText(f.text,f.x,f.y);ctx.fillStyle=f.col;ctx.fillText(f.text,f.x,f.y);ctx.restore();}
  // crane during rebuild
  if(G.phase==='rebuild'&&G.rbX!=null&&G.rt<100){const x=G.rbX,k=Math.min(1,G.rt/25);ctx.save();ctx.strokeStyle='#1b1513';ctx.lineWidth=5;ctx.fillStyle='#f2c230';ctx.fillRect(x-10,40,W-x+10,22);ctx.strokeRect(x-10,40,W-x+10,22);
    for(let xx=x;xx<W;xx+=30){ctx.beginPath();ctx.moveTo(xx,40);ctx.lineTo(xx+15,62);ctx.lineTo(xx+30,40);ctx.stroke();}ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,62);ctx.lineTo(x,62+(G.rbY-120)*k);ctx.stroke();
    ctx.beginPath();ctx.arc(x,62+(G.rbY-120)*k+10,10,0,Math.PI);ctx.stroke();ctx.restore();}
  // speech bubbles
  const Ln=G.len;if(Ln.say&&Ln.sayT>0)A.bubble(ctx,Math.max(G.tankX+170,330),G.len.expr==='laugh'?480:500,Ln.say,G.tankX-20,GROUND-185,26,Math.min(1,Ln.sayT/15));
  for(const bk of G.bankers)if(bk.say&&bk.sayT>0)A.bubble(ctx,bk.x,GROUND-140,bk.say,bk.x,GROUND-115,20,Math.min(1,bk.sayT/15));
  if(G.boss&&G.boss.visible&&G.boss.say&&G.boss.sayT>0){G.boss.sayT--;if(G.phase==='finale')A.bubble(ctx,G.boss.x-300,470,G.boss.say,G.boss.x-80,330,28);else A.bubble(ctx,G.boss.x-120,140,G.boss.say,G.boss.x-60,250,28);}
  // banners
  for(const b of G.banners){const o=Object.assign({},b.opts);if(b.t>b.dur-15)o.alpha=(b.dur-b.t)/15;A.banner(ctx,b.text,b.y,b.t,o);}
  if(G.phase==='intro'){const L=LEVELS[G.li];A.banner(ctx,T('level')+' '+L.id+(save.ng?' · '+T('ngLevel',{n:save.ng}):''),250,G.it,{size:50,bg:'#1b1513',rot:-.03});A.banner(ctx,T('lv'+L.id),350,G.it-6,{size:78});A.banner(ctx,T('g'+L.id),450,G.it-12,{size:40,bg:'#ecdcb8',fg:'#1b1513',rot:-.02});}
  if(G.phase==='finale'&&G.ft>=420){const a=Math.min(1,(G.ft-420)/20);ctx.save();ctx.globalAlpha=a;A.banner(ctx,T('reboot')+' '+G.rebootPct+'%',200,40,{size:62,bg:'#1b1513',fg:'#f2c230',rot:0});
    ctx.fillStyle='#1b1513';ctx.fillRect(400,265,800,34);ctx.fillStyle='#c8202a';ctx.fillRect(405,270,790*G.rebootPct/100,24);ctx.strokeStyle='#f2c230';ctx.lineWidth=3;ctx.strokeRect(400,265,800,34);
    if(G.flags.stood)A.banner(ctx,T('rebootSub'),360,G.ft-735,{size:44,bg:'#c8202a',rot:.02});ctx.restore();}
  if(G.flash>0){ctx.fillStyle='rgba(200,32,42,'+(G.flash/40)+')';ctx.fillRect(-20,-20,W+40,H+40);}
  ctx.restore();
}
function drawParts(){
  for(const p of G.parts){const a=Math.min(1,p.life/20);ctx.globalAlpha=a;
    switch(p.ty){
    case 'chip':ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s*.7);ctx.strokeStyle='#1b1513';ctx.lineWidth=1.5;ctx.strokeRect(-p.s/2,-p.s/2,p.s,p.s*.7);ctx.restore();break;
    case 'coin':case 'fly':ctx.save();ctx.translate(p.x,p.y);ctx.scale(Math.abs(Math.cos(p.rot||G.t*.2)),1);ctx.fillStyle='#e9b824';ctx.strokeStyle='#1b1513';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,p.s,0,7);ctx.fill();ctx.stroke();ctx.restore();break;
    case 'bill':ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle='#8fc48a';ctx.fillRect(-12,-6,24,12);ctx.strokeStyle='#2f5d2a';ctx.lineWidth=2;ctx.strokeRect(-12,-6,24,12);ctx.restore();break;
    case 'leaf':ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.scale(1,Math.cos(G.t*.15+p.ph));ctx.fillStyle=p.c;if(p.star){A.star(ctx,0,0,p.s,0);ctx.fill();}else{ctx.fillRect(-p.s/2,-p.s*.7,p.s,p.s*1.4);ctx.strokeStyle='#1b1513';ctx.lineWidth=1.5;ctx.strokeRect(-p.s/2,-p.s*.7,p.s,p.s*1.4);ctx.fillStyle=p.c==='#c8202a'?'#f2c230':'#c8202a';ctx.fillRect(-p.s/2+2,-2,p.s-4,4);}ctx.restore();break;
    case 'smoke':ctx.fillStyle='rgba(60,50,45,'+(.35*Math.min(1,p.life/40))+')';ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,7);ctx.fill();break;
    case 'fire':ctx.fillStyle=p.life>25?'#fff3a0':p.life>14?'#f2c230':'#c8202a';ctx.beginPath();ctx.arc(p.x,p.y,p.s*Math.min(1,p.life/20),0,7);ctx.fill();break;
    case 'spark':ctx.fillStyle=p.c||'#f2c230';ctx.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s);break;
    case 'ring':ctx.strokeStyle='rgba(242,194,48,'+(p.life/22)+')';ctx.lineWidth=10;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,7);ctx.stroke();break;}
  }ctx.globalAlpha=1;}
/* ---------- loop ---------- */
let acc=0,last=performance.now();
function frame(now){
  const dt=Math.min(100,now-last);last=now;
  if(engine&&!G.paused&&G.phase!=='menu'){if(G.turbo){for(let i=0;i<G.turbo;i++)step();}else{acc+=dt;let n=0;while(acc>=1000/60&&n<4){step();acc-=1000/60;n++;}if(n===4)acc=0;}}
  render();UI.tick();requestAnimationFrame(frame);
}
/* ---------- input ---------- */
function toWorld(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H};}
cv.addEventListener('pointerdown',e=>{SFX.init();if(G.paused||UI.overlayOpen())return;const p=toWorld(e);
  if(G.phase==='intro'){G.it=200;return;}
  if(G.phase==='flight'){tapAction();return;}
  if(G.phase==='aim'){G.drag={sx:p.x,sy:p.y,cx:p.x,cy:p.y,active:false,id:e.pointerId};try{cv.setPointerCapture(e.pointerId);}catch(_){} }});
cv.addEventListener('pointermove',e=>{const d=G.drag;if(!d||G.phase!=='aim')return;const p=toWorld(e);d.cx=p.x;d.cy=p.y;const px=p.x-d.sx,py=p.y-d.sy,len=Math.hypot(px,py);
  if(len>12)d.active=true;if(d.active){let ang=Math.atan2(py,-px)*180/Math.PI;G.angle=Math.round(clamp(ang,0,90));G.power=Math.round(clamp(len/300*100,0,100));UI.sync();}});
function endDrag(e){const d=G.drag;G.drag=null;if(d&&d.active&&G.phase==='aim'&&G.power>=5)fire();}
cv.addEventListener('pointerup',endDrag);cv.addEventListener('pointercancel',()=>{G.drag=null;});
window.addEventListener('keydown',e=>{
  if(e.target&&e.target.tagName==='INPUT'&&e.target.type!=='range'&&e.target.type!=='checkbox')return;
  const k=e.key;SFX.init();
  if(G.phase==='menu'||UI.overlayOpen()){if(k==='Escape'&&G.paused)UI.resume();return;}
  const st=e.shiftKey?5:1;let used=true;
  if(k==='ArrowUp'){G.angle=clamp(G.angle+st,0,90);}else if(k==='ArrowDown'){G.angle=clamp(G.angle-st,0,90);}
  else if(k==='ArrowRight'){G.power=clamp(G.power+st,0,100);}else if(k==='ArrowLeft'){G.power=clamp(G.power-st,0,100);}
  else if(k===' '||k==='Enter'){if(G.phase==='aim')fire();else if(G.phase==='flight')tapAction();else if(G.phase==='intro')G.it=200;}
  else if(k>='1'&&k<='5'){UI.selectWeapon(WLIST[+k-1]);}
  else if(k==='t'||k==='T'){G.preview=!G.preview;save.preview=G.preview;persist();}
  else if(k==='p'||k==='P'||k==='Escape'){UI.pause();}
  else if(k==='m'||k==='M'){UI.toggleMute();}
  else if(k==='r'||k==='R'){UI.restart();}
  else used=false;
  if(used){e.preventDefault();UI.sync();}
});
/* ---------- solver (used by debug autoplayer & tests) ---------- */
function yAtX(pts,x){for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];if((a.x-x)*(b.x-x)<=0&&a.x!==b.x){const k=(x-a.x)/(b.x-a.x);return a.y+(b.y-a.y)*k;}}return null;}
function solveFor(tx,ty,w){
  w=w||'hammer';const res=[];
  for(let ang=8;ang<=82;ang+=3){let lo=5,hi=100,best=null;
    for(let it=0;it<11;it++){const mid=(lo+hi)/2;const pts=simulate(ang,mid,w,420,G.infl);const y=yAtX(pts,tx);
      if(y===null){lo=mid;continue;} if(y>ty)lo=mid;else hi=mid;best={pw:mid,pts};}
    if(!best)continue;const pw=Math.round((lo+hi)/2);const pts=simulate(ang,pw,w,420,G.infl);const y=yAtX(pts,tx);if(y===null||Math.abs(y-ty)>22)continue;
    // obstruction: count non-target bodies hit before reaching target
    let obs=0;const others=G.dest.filter(b=>!b.g.dead&&!(Math.abs(b.position.x-tx)<8&&Math.abs(b.position.y-ty)<8));const bub=G.bubbles;
    for(let i=1;i<pts.length;i++){if(pts[i].x>tx-30)break;const hits=Query.ray(others.concat(bub,G.boss?G.boss.bodies.filter(b=>b.g.type==='armor'):[]),pts[i-1],pts[i],8);obs+=hits.length;}
    res.push({angle:ang,power:pw,obs});}
  res.sort((a,b)=>a.obs-b.obs||Math.abs(a.angle-45)-Math.abs(b.angle-45));return res;
}
function autoShot(){
  if(G.phase!=='aim')return null;let tg=G.boss?G.boss.weak.filter(w=>w.hp>0).map(w=>({x:w.x-w.r*.6,y:w.y})):G.targets.map(t=>({x:t.position.x,y:t.position.y}));
  let best=null;for(const t of tg){const s=solveFor(t.x,t.y,'hammer');if(s.length&&(!best||s[0].obs<best.obs))best=Object.assign({t},s[0]);}
  if(!best)return null;let w='hammer';
  if(G.rev>=100)w='rev';else if(best.obs>0&&G.ammo.star>0)w='star';
  if(w!=='hammer'){const s=solveFor(best.t.x,best.t.y,w);if(s.length)best=Object.assign({t:best.t},s[0]);}
  G.weapon=w;G.angle=best.angle;G.power=best.power;fire();return{w,angle:best.angle,power:best.power,obs:best.obs};
}
/* ---------- public API ---------- */
Object.assign(window.PK,{loadLevel,fire,tapAction,simulate,solveFor,autoShot,canFire,WLIST,AMMO,LEVELS:window.LEVELS,step,
  get engine(){return engine},persist,
  debug:DEBUG?{win(){for(const t of G.targets.slice())destroy(t);if(G.boss){for(const w of G.boss.weak){w.hp=1;bossHit(w,1,null);}}},inf(on){G.inf=on!==false;},jump(n){UI.startLevel(n-1);},rev(){G.rev=100;UI.sync();},
    unlockAll(){save.unlocked=8;persist();},turbo(k){G.turbo=k||0;}}:null});
/* ---------- boot ---------- */
window.addEventListener('load',()=>{resize();UI.init();requestAnimationFrame(frame);});
})();
