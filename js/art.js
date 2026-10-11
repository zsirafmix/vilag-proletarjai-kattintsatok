/* Procedural poster-style art. All graphics drawn in code. */
(function(){
const C={RED:'#c8202a',DRED:'#8e1219',BLACK:'#1b1513',YEL:'#f2c230',BEIGE:'#ecdcb8',BEIGE2:'#dccaa0',GREY:'#7d766c',GOLD:'#e9b824',GOLD2:'#a87908',SKIN:'#f1c9a0',SKIN2:'#d9a77e'};
const FONT_H='"Russo One", "Oswald", Impact, sans-serif';
const W=1600,H=900,GROUND=820;
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function star(ctx,x,y,r,rot,inner){ctx.beginPath();for(let i=0;i<10;i++){const a=rot-Math.PI/2+i*Math.PI/5,rad=i%2?r*(inner||0.42):r;ctx.lineTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad);}ctx.closePath();}
function rng(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return((s>>>0)%100000)/100000;};}
function fitText(ctx,text,maxW,size,font){ctx.font=size+'px '+(font||FONT_H);let w=ctx.measureText(text).width;if(w>maxW){size=Math.max(6,size*maxW/w);ctx.font=size+'px '+(font||FONT_H);}return size;}

/* ---------- background ---------- */
function background(levelIdx){
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d');
  const boss=levelIdx===7, r=rng(levelIdx*977+13);
  ctx.fillStyle=boss?'#e2c7a0':C.BEIGE;ctx.fillRect(0,0,W,H);
  // rays from behind Lenin
  const ox=220,oy=780,n=26;
  for(let i=0;i<n;i++){const a0=-Math.PI*0.62+i*(Math.PI*0.78/n),a1=a0+Math.PI*0.78/n*0.5;
    ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+Math.cos(a0)*2600,oy+Math.sin(a0)*2600);ctx.lineTo(ox+Math.cos(a1)*2600,oy+Math.sin(a1)*2600);ctx.closePath();
    ctx.fillStyle=boss?(i%2?'rgba(142,18,25,.55)':'rgba(200,32,42,.45)'):(i%2?'rgba(200,32,42,.42)':'rgba(200,32,42,.22)');ctx.fill();}
  // big sun disc
  ctx.fillStyle=boss?'rgba(200,32,42,.9)':'rgba(242,194,48,.85)';ctx.beginPath();ctx.arc(ox,oy-40,190,0,Math.PI*2);ctx.fill();
  ctx.lineWidth=6;ctx.strokeStyle=C.BLACK;ctx.stroke();
  // halftone dots top-right
  for(let y=10;y<520;y+=14)for(let x=600;x<W;x+=14){const k=((x-600)/1000)*(1-y/520);const rad=k*5.2;if(rad<0.4)continue;
    ctx.fillStyle=boss?'rgba(60,10,10,.25)':'rgba(27,21,19,.13)';ctx.beginPath();ctx.arc(x+(y/14%2)*7,y,rad,0,7);ctx.fill();}
  // distant capitalist skyline (right)
  ctx.fillStyle=boss?'rgba(40,10,10,.42)':'rgba(27,21,19,.22)';
  let x=760;while(x<W){const w=50+r()*70,h=120+r()*300;ctx.fillRect(x,GROUND-h,w,h);
    if(r()<0.4){ctx.font='bold 40px '+FONT_H;ctx.fillText('$',x+w/2-12,GROUND-h-8);} x+=w+6+r()*20;}
  // factories (left, the proletarian side)
  ctx.fillStyle=boss?'rgba(27,21,19,.6)':'rgba(27,21,19,.45)';
  for(let i=0;i<5;i++){const fx=20+i*110,fh=60+r()*60;ctx.fillRect(fx,GROUND-fh,95,fh);ctx.beginPath();ctx.moveTo(fx,GROUND-fh);
    for(let k=0;k<3;k++){ctx.lineTo(fx+k*32+16,GROUND-fh-22);ctx.lineTo(fx+k*32+32,GROUND-fh);}ctx.fill();
    ctx.fillRect(fx+60,GROUND-fh-110-r()*50,16,140);}
  // diagonal black band (poster composition)
  ctx.save();ctx.globalAlpha=boss?0.5:0.18;ctx.fillStyle=C.BLACK;ctx.beginPath();ctx.moveTo(0,330);ctx.lineTo(W,-60);ctx.lineTo(W,20);ctx.lineTo(0,410);ctx.fill();ctx.restore();
  // ground
  ctx.fillStyle=C.RED;ctx.fillRect(0,GROUND,W,22);ctx.fillStyle=C.BLACK;ctx.fillRect(0,GROUND+22,W,H-GROUND);
  ctx.fillStyle='rgba(242,194,48,.85)';for(let gx=-40;gx<W;gx+=90){ctx.beginPath();ctx.moveTo(gx,GROUND+22);ctx.lineTo(gx+40,GROUND+22);ctx.lineTo(gx+10,H);ctx.lineTo(gx-30,H);ctx.fill();}
  ctx.fillStyle=C.BLACK;ctx.fillRect(0,GROUND+40,W,H);
  ctx.lineWidth=4;ctx.strokeStyle=C.BLACK;ctx.beginPath();ctx.moveTo(0,GROUND);ctx.lineTo(W,GROUND);ctx.stroke();
  // paper texture
  for(let i=0;i<9000;i++){ctx.fillStyle=r()<0.5?'rgba(60,40,20,.07)':'rgba(255,250,235,.09)';ctx.fillRect(r()*W,r()*H,1+r()*2,1+r()*2);}
  for(let i=0;i<30;i++){ctx.strokeStyle='rgba(80,60,30,.06)';ctx.lineWidth=1;ctx.beginPath();const y=r()*H;ctx.moveTo(0,y);ctx.lineTo(W,y+r()*40-20);ctx.stroke();}
  // vignette
  const g=ctx.createRadialGradient(W/2,H/2,H*0.45,W/2,H/2,H*1.05);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(60,20,10,.35)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  return cv;
}
function cloud(ctx,x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='#f6ecd2';ctx.strokeStyle=C.BLACK;ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(-90,20);ctx.quadraticCurveTo(-95,-15,-55,-12);ctx.quadraticCurveTo(-45,-48,-5,-38);ctx.quadraticCurveTo(25,-62,55,-32);ctx.quadraticCurveTo(95,-30,92,20);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(27,21,19,.35)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-60,8);ctx.lineTo(60,8);ctx.stroke();ctx.restore();}

/* ---------- blocks ---------- */
const MATCOL={wood:['#dcb47a','#a97a3f'],stone:['#c2b9a8','#8b8274'],glass:['#a9d6da','#5f9aa1'],gold:['#f6d257','#b8860b'],steel:['#666c74','#3a3e44'],target:['#c9a26b','#7a5a2c']};
function block(ctx,b,signText){
  const g=b.g, w=g.w, h=g.h, m=g.mat, col=MATCOL[m]||MATCOL.wood, flash=g.flash>0;
  ctx.save();ctx.translate(b.position.x,b.position.y);ctx.rotate(b.angle);
  if(g.shape==='tri'){ctx.beginPath();const v=b.vertices;ctx.restore();ctx.save();ctx.moveTo(v[0].x,v[0].y);for(let i=1;i<v.length;i++)ctx.lineTo(v[i].x,v[i].y);ctx.closePath();
    ctx.fillStyle=col[0];ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=C.BLACK;ctx.stroke();
    ctx.translate(b.position.x,b.position.y+8);ctx.rotate(b.angle);ctx.fillStyle=C.BLACK;ctx.font='34px '+FONT_H;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('$',0,0);ctx.restore();return;}
  let fill=col[0];
  if(m==='gold'){const gr=ctx.createLinearGradient(-w/2,-h/2,w/2,h/2);gr.addColorStop(0,'#fff0a0');gr.addColorStop(0.35,col[0]);gr.addColorStop(1,col[1]);fill=gr;}
  ctx.fillStyle=flash?'#fff':fill;ctx.fillRect(-w/2,-h/2,w,h);
  ctx.strokeStyle=col[1];ctx.lineWidth=2;
  if(m==='wood'){for(let i=1;i<4;i++){const yy=-h/2+h*i/4;ctx.beginPath();ctx.moveTo(-w/2+4,yy);ctx.lineTo(w/2-4,yy+((i%2)?2:-2));ctx.stroke();}}
  else if(m==='stone'){const bh=Math.min(20,h/2);for(let yy=-h/2+bh;yy<h/2;yy+=bh){ctx.beginPath();ctx.moveTo(-w/2,yy);ctx.lineTo(w/2,yy);ctx.stroke();}
    for(let yy=-h/2,k=0;yy<h/2;yy+=bh,k++)for(let xx=-w/2+(k%2?18:36);xx<w/2;xx+=36){ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx,Math.min(h/2,yy+bh));ctx.stroke();}}
  else if(m==='glass'){ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-w/2+6,h/2-6);ctx.lineTo(Math.min(w/2-6,-w/2+6+h*0.8),-h/2+6);ctx.stroke();}
  else if(m==='gold'){ctx.strokeStyle='rgba(255,255,230,.8)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-w/2+5,-h/2+5);ctx.lineTo(w/2-5,-h/2+5);ctx.stroke();}
  else if(m==='steel'){ctx.strokeStyle=col[1];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-w/2,-h/2);ctx.lineTo(w/2,h/2);ctx.moveTo(-w/2,h/2);ctx.lineTo(w/2,-h/2);ctx.stroke();
    ctx.fillStyle='#b9bec5';const rv=[[-1,-1],[1,-1],[-1,1],[1,1]];for(const[a,c]of rv){ctx.beginPath();ctx.arc(a*(w/2-6),c*(h/2-6),3,0,7);ctx.fill();}}
  // decorations
  const d=g.deco;
  if(d==='column'){ctx.strokeStyle='rgba(27,21,19,.45)';ctx.lineWidth=2;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*w/4,-h/2+10);ctx.lineTo(i*w/4,h/2-10);ctx.stroke();}
    ctx.fillStyle=C.BLACK;ctx.fillRect(-w/2-3,-h/2,w+6,7);ctx.fillRect(-w/2-3,h/2-7,w+6,7);}
  else if(d==='windows'){const cols=Math.max(1,Math.floor(w/26)),rows=Math.max(1,Math.floor(h/30));for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
      const wx=-w/2+(i+0.5)*w/cols-6,wy=-h/2+(j+0.5)*h/rows-8;ctx.fillStyle=((i*7+j*3+b.id)%4===0)?C.YEL:'rgba(27,21,19,.75)';ctx.fillRect(wx,wy,12,16);}}
  else if(d==='sign'&&signText){ctx.fillStyle=C.BLACK;ctx.fillRect(-w/2+6,-h/2+3,w-12,h-6);ctx.fillStyle=C.YEL;ctx.textAlign='center';ctx.textBaseline='middle';
    fitText(ctx,signText,w-24,Math.min(h-8,24));ctx.fillText(signText,0,1);}
  else if(d==='crate'){ctx.strokeStyle=col[1];ctx.lineWidth=3;ctx.strokeRect(-w/2+5,-h/2+5,w-10,h-10);ctx.fillStyle='#2f7d3a';ctx.font=Math.min(w,h)*0.6+'px '+FONT_H;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('$',0,2);}
  else if(d==='crown'){ctx.fillStyle=C.BLACK;ctx.font=Math.min(w,h)*0.7+'px '+FONT_H;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('$',0,2);}
  // weakened by propaganda: posters glued on
  if(g.weak){ctx.fillStyle=C.RED;ctx.save();ctx.rotate(0.12);const pw=Math.min(26,w*0.45),ph=Math.min(30,h*0.8);ctx.fillRect(-pw/2,-ph/2,pw,ph);ctx.fillStyle=C.YEL;star(ctx,0,0,Math.min(pw,ph)*0.32,0);ctx.fill();ctx.restore();}
  // cracks
  const hp=g.hp/g.maxhp;
  if(hp<0.7){const rr2=rng(b.id*31+7);ctx.strokeStyle=C.BLACK;ctx.lineWidth=2;const n=hp<0.35?3:1;for(let k=0;k<n;k++){ctx.beginPath();let cx=(rr2()-0.5)*w*0.6,cy=(rr2()-0.5)*h*0.6;ctx.moveTo(cx,cy);for(let s=0;s<4;s++){cx+=(rr2()-0.5)*Math.min(30,w*0.4);cy+=(rr2()-0.5)*Math.min(30,h*0.6);ctx.lineTo(cx,cy);}ctx.stroke();}}
  if(g.fresh>0){ctx.strokeStyle='rgba(242,194,48,'+(0.4+0.4*Math.sin(g.fresh*0.4))+')';ctx.lineWidth=5;ctx.strokeRect(-w/2-3,-h/2-3,w+6,h+6);}
  ctx.lineWidth=3.5;ctx.strokeStyle=C.BLACK;ctx.strokeRect(-w/2,-h/2,w,h);
  ctx.restore();
}
/* ---------- targets ---------- */
function eyes(ctx,x,y,s,worried,look){ctx.fillStyle='#fff';ctx.strokeStyle=C.BLACK;ctx.lineWidth=2;
  for(const k of[-1,1]){ctx.beginPath();ctx.ellipse(x+k*s*0.9,y,s*0.75,s*0.9,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=C.BLACK;ctx.beginPath();ctx.arc(x+k*s*0.9+look*s*0.3,y+s*0.15,s*0.35,0,7);ctx.fill();ctx.fillStyle='#fff';
    ctx.beginPath();ctx.moveTo(x+k*s*0.2,y-s*(worried?0.7:1.3));ctx.lineTo(x+k*s*1.7,y-s*(worried?1.4:0.9));ctx.strokeStyle=C.BLACK;ctx.lineWidth=3;ctx.stroke();ctx.lineWidth=2;}}
function target(ctx,b,t){
  const g=b.g,w=g.w,h=g.h,k=g.kind,hurt=g.hp<g.maxhp*0.7||g.flash>0;
  ctx.save();ctx.translate(b.position.x,b.position.y);ctx.rotate(b.angle);
  const wob=Math.sin(t*0.08+b.id)*1.5;
  ctx.lineWidth=3.5;ctx.strokeStyle=C.BLACK;
  if(k==='bag'){ctx.fillStyle=g.flash>0?'#fff':'#cfa66a';ctx.beginPath();ctx.moveTo(-w*0.18,-h/2+8);ctx.quadraticCurveTo(-w*0.62,-h*0.1,-w*0.48,h*0.32);ctx.quadraticCurveTo(-w*0.4,h/2,0,h/2);ctx.quadraticCurveTo(w*0.4,h/2,w*0.48,h*0.32);ctx.quadraticCurveTo(w*0.62,-h*0.1,w*0.18,-h/2+8);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#cfa66a';ctx.beginPath();ctx.moveTo(-w*0.2,-h/2+8);ctx.lineTo(-w*0.3,-h/2-2+wob);ctx.lineTo(w*0.3,-h/2-2-wob);ctx.lineTo(w*0.2,-h/2+8);ctx.fill();ctx.stroke();
    ctx.fillStyle=C.RED;ctx.fillRect(-w*0.22,-h/2+5,w*0.44,6);
    ctx.fillStyle=C.BLACK;ctx.font=(h*0.42)+'px '+FONT_H;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('$',0,h*0.27);eyes(ctx,0,-h*0.05,h*0.1,hurt,1);}
  else if(k==='bars'){for(let i=0;i<3;i++){const yy=h/2-(i+1)*h/3,xo=i===2?0:(i?-w*0.22:w*0.22),bw=i===2?w*0.6:w*0.5;
      const yb=i===2?-h/2:0;ctx.fillStyle=g.flash>0?'#fff':C.GOLD;ctx.beginPath();const y0=i===2?-h/2:yb,yy0=i===2?y0:0;ctx.moveTo(xo-bw/2,(i===2?0:h/2));ctx.lineTo(xo+bw/2,(i===2?0:h/2));ctx.lineTo(xo+bw/2-6,(i===2?-h/2:0));ctx.lineTo(xo-bw/2+6,(i===2?-h/2:0));ctx.closePath();ctx.fill();ctx.stroke();}
    eyes(ctx,0,-h*0.22,h*0.1,hurt,1);}
  else if(k==='safe'){ctx.fillStyle=g.flash>0?'#fff':'#4a4f57';rr(ctx,-w/2,-h/2,w,h,6);ctx.fill();ctx.stroke();ctx.strokeStyle='#8a9099';ctx.strokeRect(-w/2+6,-h/2+6,w-12,h-12);
    ctx.fillStyle=C.GOLD;ctx.beginPath();ctx.arc(w*0.18,h*0.1,h*0.18,0,7);ctx.fill();ctx.strokeStyle=C.BLACK;ctx.stroke();ctx.fillStyle=C.YEL;ctx.font=(h*0.3)+'px '+FONT_H;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('$',-w*0.2,h*0.12);eyes(ctx,0,-h*0.22,h*0.09,hurt,1);}
  else if(k==='bull'){ctx.fillStyle=g.flash>0?'#fff':C.GOLD;ctx.beginPath();ctx.ellipse(0,h*0.05,w*0.32,h*0.42,0,0,7);ctx.fill();ctx.stroke();
    for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(s*w*0.2,-h*0.25);ctx.quadraticCurveTo(s*w*0.55,-h*0.4,s*w*0.48,-h*0.62);ctx.quadraticCurveTo(s*w*0.42,-h*0.32,s*w*0.14,-h*0.1);ctx.fill();ctx.stroke();}
    ctx.fillStyle='#c48a12';ctx.beginPath();ctx.ellipse(0,h*0.3,w*0.2,h*0.14,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=C.BLACK;ctx.beginPath();ctx.arc(-w*0.07,h*0.3,3,0,7);ctx.arc(w*0.07,h*0.3,3,0,7);ctx.fill();eyes(ctx,0,-h*0.05,h*0.09,hurt,1);}
  else if(k==='press'){ctx.fillStyle=g.flash>0?'#fff':'#5b6a52';ctx.fillRect(-w/2,-h/2+10,w,h-10);ctx.strokeRect(-w/2,-h/2+10,w,h-10);
    ctx.fillStyle='#333';for(const s of[-1,1]){ctx.beginPath();ctx.arc(s*w*0.22,-h/2+18,10,0,7);ctx.fill();ctx.stroke();}
    ctx.fillStyle='#8fc48a';ctx.save();ctx.translate(0,-h/2+4);ctx.rotate(Math.sin(t*0.2)*0.1);ctx.fillRect(-w*0.25,-8,w*0.5,14);ctx.strokeRect(-w*0.25,-8,w*0.5,14);ctx.fillStyle='#2f5d2a';ctx.font='12px '+FONT_H;ctx.textAlign='center';ctx.fillText('$100',0,4);ctx.restore();
    ctx.fillStyle=C.YEL;ctx.font=(h*0.32)+'px '+FONT_H;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('$$$',0,h*0.22);eyes(ctx,0,-h*0.02,h*0.08,hurt,1);}
  else if(k==='cart'){ctx.fillStyle=g.flash>0?'#fff':'#b8bec6';ctx.beginPath();ctx.moveTo(-w/2,-h*0.15);ctx.lineTo(w/2,-h*0.15);ctx.lineTo(w*0.38,h*0.25);ctx.lineTo(-w*0.38,h*0.25);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#e84a5a';ctx.fillRect(-w*0.35,-h/2+2,w*0.3,h*0.36);ctx.strokeRect(-w*0.35,-h/2+2,w*0.3,h*0.36);ctx.fillStyle=C.GOLD;ctx.fillRect(0,-h/2+8,w*0.32,h*0.3);ctx.strokeRect(0,-h/2+8,w*0.32,h*0.3);
    ctx.fillStyle=C.BLACK;for(const s of[-1,1]){ctx.beginPath();ctx.arc(s*w*0.28,h*0.38,6,0,7);ctx.fill();}eyes(ctx,0,h*0.05,h*0.08,hurt,1);}
  else if(k==='case'){ctx.fillStyle=g.flash>0?'#fff':'#2a2420';rr(ctx,-w/2,-h/2+8,w,h-8,6);ctx.fill();ctx.stroke();ctx.strokeRect(-w*0.15,-h/2,w*0.3,10);
    ctx.fillStyle=C.GOLD;ctx.fillRect(-w*0.08,-h/2+12,w*0.16,8);ctx.fillStyle=C.YEL;ctx.font=(h*0.32)+'px '+FONT_H;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('$',w*0.28,h*0.18);eyes(ctx,-w*0.08,h*0.08,h*0.09,hurt,1);}
  else if(k==='dollar'){const gr=ctx.createLinearGradient(-w/2,-h/2,w/2,h/2);gr.addColorStop(0,'#fff3a8');gr.addColorStop(0.4,C.GOLD);gr.addColorStop(1,C.GOLD2);
    ctx.fillStyle=g.flash>0?'#fff':gr;rr(ctx,-w/2,-h/2,w,h,10);ctx.fill();ctx.stroke();ctx.fillStyle=C.BLACK;ctx.font=(h*0.95)+'px '+FONT_H;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('$',0,h*0.06);
    ctx.fillStyle=C.YEL;ctx.font=(h*0.85)+'px '+FONT_H;ctx.fillText('$',-2,h*0.04);eyes(ctx,0,-h*0.22,h*0.08,hurt,1);}
  // hp ring
  if(g.hp<g.maxhp){ctx.rotate(-b.angle);ctx.fillStyle='rgba(27,21,19,.7)';ctx.fillRect(-22,-h/2-16,44,7);ctx.fillStyle=C.RED;ctx.fillRect(-21,-h/2-15,42*Math.max(0,g.hp/g.maxhp),5);}
  ctx.restore();
}
/* ---------- Lenin + tank ---------- */
function lenin(ctx,x,y,expr,t,arm){
  ctx.save();ctx.translate(x,y);ctx.lineWidth=3.5;ctx.strokeStyle=C.BLACK;
  // coat torso
  ctx.fillStyle='#2b2724';ctx.beginPath();ctx.moveTo(-30,40);ctx.quadraticCurveTo(-32,0,-14,-6);ctx.lineTo(14,-6);ctx.quadraticCurveTo(32,0,30,40);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#f4efe6';ctx.beginPath();ctx.moveTo(-7,-6);ctx.lineTo(0,10);ctx.lineTo(7,-6);ctx.fill();ctx.fillStyle=C.RED;ctx.beginPath();ctx.moveTo(-3,-2);ctx.lineTo(3,-2);ctx.lineTo(2,16);ctx.lineTo(-2,16);ctx.fill();
  // arm
  ctx.save();ctx.translate(20,6);
  const ang=arm==='point'?-0.9+Math.sin(t*0.3)*0.05:arm==='fist'?-1.4+Math.sin(t*0.5)*0.2:0.6;
  ctx.rotate(ang);ctx.fillStyle='#2b2724';rr(ctx,-7,-7,48,15,7);ctx.fill();ctx.stroke();ctx.fillStyle=C.SKIN;ctx.beginPath();ctx.arc(46,0,8,0,7);ctx.fill();ctx.stroke();
  if(arm==='point'){ctx.beginPath();ctx.moveTo(52,-2);ctx.lineTo(64,-3);ctx.lineWidth=5;ctx.strokeStyle=C.SKIN;ctx.stroke();ctx.lineWidth=1.5;ctx.strokeStyle=C.BLACK;ctx.stroke();}
  ctx.restore();ctx.lineWidth=3.5;ctx.strokeStyle=C.BLACK;
  // head
  const hy=-34+(expr==='laugh'?Math.sin(t*0.6)*2:0)+(expr==='surprised'?-3:0);
  ctx.fillStyle=C.SKIN;ctx.beginPath();ctx.ellipse(0,hy,24,27,0,0,7);ctx.fill();ctx.stroke();
  // ears
  ctx.beginPath();ctx.ellipse(-24,hy+2,5,8,0,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(24,hy+2,5,8,0,0,7);ctx.fill();ctx.stroke();
  // goatee + mustache
  ctx.fillStyle='#8a4b26';ctx.beginPath();ctx.moveTo(-15,hy+10);ctx.quadraticCurveTo(-12,hy+34,0,hy+42);ctx.quadraticCurveTo(12,hy+34,15,hy+10);ctx.quadraticCurveTo(0,hy+20,-15,hy+10);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-15,hy+10);ctx.quadraticCurveTo(0,hy+3,15,hy+10);ctx.quadraticCurveTo(0,hy+14,-15,hy+10);ctx.fill();ctx.stroke();
  // mouth
  ctx.fillStyle='#5a1010';
  if(expr==='shout'){ctx.beginPath();ctx.ellipse(0,hy+18,8,9+Math.sin(t*0.8)*2,0,0,7);ctx.fill();ctx.stroke();}
  else if(expr==='surprised'){ctx.beginPath();ctx.ellipse(0,hy+17,5,7,0,0,7);ctx.fill();ctx.stroke();}
  else if(expr==='laugh'){ctx.beginPath();ctx.moveTo(-10,hy+14);ctx.quadraticCurveTo(0,hy+30,10,hy+14);ctx.closePath();ctx.fill();ctx.stroke();}
  else if(expr==='grumpy'){ctx.beginPath();ctx.moveTo(-7,hy+20);ctx.quadraticCurveTo(0,hy+14,7,hy+20);ctx.stroke();}
  else {ctx.beginPath();ctx.moveTo(-6,hy+17);ctx.quadraticCurveTo(2,hy+21,8,hy+15);ctx.stroke();}
  // eyes
  ctx.fillStyle=C.BLACK;
  if(expr==='laugh'){for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(s*12-5,hy-2);ctx.quadraticCurveTo(s*12,hy-8,s*12+5,hy-2);ctx.stroke();}}
  else{const er=expr==='surprised'?5:3;for(const s of[-1,1]){ctx.beginPath();ctx.ellipse(s*10+3,hy-3,er,expr==='surprised'?6:3,0,0,7);ctx.fill();}}
  // brows
  ctx.lineWidth=4;ctx.beginPath();
  if(expr==='shout'||expr==='grumpy'){ctx.moveTo(-17,hy-14);ctx.lineTo(-4,hy-9);ctx.moveTo(19,hy-14);ctx.lineTo(7,hy-9);}
  else if(expr==='surprised'){ctx.moveTo(-17,hy-18);ctx.lineTo(-4,hy-20);ctx.moveTo(19,hy-18);ctx.lineTo(7,hy-20);}
  else{ctx.moveTo(-16,hy-12);ctx.lineTo(-4,hy-13);ctx.moveTo(19,hy-12);ctx.lineTo(7,hy-13);}ctx.stroke();ctx.lineWidth=3.5;
  // nose
  ctx.strokeStyle=C.SKIN2;ctx.beginPath();ctx.moveTo(4,hy-4);ctx.quadraticCurveTo(9,hy+6,3,hy+8);ctx.stroke();ctx.strokeStyle=C.BLACK;
  // flat cap (kepka)
  ctx.fillStyle='#2b2724';ctx.beginPath();ctx.moveTo(-26,hy-12);ctx.quadraticCurveTo(-24,hy-36,2,hy-36);ctx.quadraticCurveTo(26,hy-34,26,hy-16);ctx.lineTo(40,hy-12);ctx.quadraticCurveTo(30,hy-6,20,hy-10);ctx.quadraticCurveTo(0,hy-14,-26,hy-12);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=C.RED;star(ctx,0,hy-26,6,0);ctx.fill();
  ctx.restore();
}
function tank(ctx,x,angleDeg,expr,t,recoil,arm,name,wheelRot){
  const y=GROUND;ctx.save();ctx.lineWidth=4;ctx.strokeStyle=C.BLACK;
  // Lenin behind turret (hatch)
  lenin(ctx,x-38,y-128,expr,t,arm);
  // barrel
  const px=x+24,py=y-98,a=-angleDeg*Math.PI/180;
  ctx.save();ctx.translate(px,py);ctx.rotate(a);ctx.translate(-recoil,0);ctx.fillStyle='#2b2724';ctx.fillRect(0,-11,100,22);ctx.strokeRect(0,-11,100,22);
  ctx.fillStyle=C.RED;ctx.fillRect(30,-11,10,22);ctx.fillRect(84,-13,16,26);ctx.strokeRect(84,-13,16,26);ctx.restore();
  // turret
  ctx.fillStyle=C.DRED;ctx.beginPath();ctx.moveTo(x-80,y-82);ctx.quadraticCurveTo(x-70,y-125,x-10,y-122);ctx.quadraticCurveTo(x+45,y-120,x+50,y-82);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=C.YEL;star(ctx,x-10,y-100,14,0);ctx.fill();ctx.lineWidth=2;ctx.stroke();ctx.lineWidth=4;
  // hull
  ctx.fillStyle=C.RED;ctx.beginPath();ctx.moveTo(x-125,y-42);ctx.lineTo(x+132,y-42);ctx.lineTo(x+105,y-84);ctx.lineTo(x-108,y-86);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=C.BLACK;ctx.fillRect(x-108,y-60,210,16);ctx.fillStyle=C.YEL;ctx.textAlign='center';ctx.textBaseline='middle';fitText(ctx,name,200,14);ctx.fillText(name,x-2,y-51);
  // treads
  ctx.fillStyle='#2b2724';rr(ctx,x-128,y-44,262,44,22);ctx.fill();ctx.stroke();
  for(let i=0;i<6;i++){const wx=x-100+i*41;ctx.fillStyle='#6b645c';ctx.beginPath();ctx.arc(wx,y-22,15,0,7);ctx.fill();ctx.stroke();
    ctx.save();ctx.translate(wx,y-22);ctx.rotate(wheelRot);ctx.fillStyle=C.RED;ctx.fillRect(-3,-12,6,24);ctx.restore();}
  ctx.restore();
}
function muzzle(x,angleDeg){const a=angleDeg*Math.PI/180;return{x:x+24+Math.cos(a)*104,y:GROUND-98-Math.sin(a)*104};}
/* ---------- banker ---------- */
function banker(ctx,bk,t){
  ctx.save();ctx.translate(bk.x,GROUND);const run=bk.state==='run';const s=bk.scale||1;ctx.scale(s*(run?1:bk.face||-1),s);ctx.lineWidth=3;ctx.strokeStyle=C.BLACK;
  const ph=run?t*0.6:0, bob=run?Math.abs(Math.sin(ph))*6:Math.sin(t*0.05+bk.x)*1.5;
  // legs
  ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-6,-26);ctx.lineTo(-6+Math.sin(ph)*12,0);ctx.moveTo(6,-26);ctx.lineTo(6-Math.sin(ph)*12,0);ctx.stroke();ctx.lineWidth=3;
  ctx.translate(0,-bob);
  ctx.fillStyle='#1f1d22';ctx.beginPath();ctx.ellipse(0,-46,22,26,0,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-8,-68);ctx.lineTo(0,-44);ctx.lineTo(8,-68);ctx.fill();ctx.fillStyle=C.RED;ctx.fillRect(-2,-66,4,18);
  ctx.fillStyle=C.GOLD;ctx.beginPath();ctx.arc(12,-40,2.5,0,7);ctx.fill();
  // arms
  ctx.lineWidth=5;ctx.strokeStyle='#1f1d22';ctx.beginPath();
  if(run){ctx.moveTo(-14,-58);ctx.lineTo(-24,-84+Math.sin(ph)*5);ctx.moveTo(14,-58);ctx.lineTo(26,-82-Math.sin(ph)*5);}else{ctx.moveTo(-16,-56);ctx.lineTo(-22,-36);ctx.moveTo(16,-56);ctx.lineTo(24,-38);}ctx.stroke();ctx.lineWidth=3;ctx.strokeStyle=C.BLACK;
  // money bag in hand when idle
  if(!run){ctx.fillStyle='#cfa66a';ctx.beginPath();ctx.arc(26,-30,9,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=C.BLACK;ctx.font='11px '+FONT_H;ctx.textAlign='center';ctx.fillText('$',26,-26);}
  // head
  ctx.fillStyle='#f3b9a0';ctx.beginPath();ctx.arc(0,-84,15,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(6,-87,6,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=C.BLACK;ctx.beginPath();ctx.arc(run?6:7,-87,2,0,7);ctx.arc(-5,-87,2,0,7);ctx.fill();
  ctx.strokeStyle=C.GOLD;ctx.beginPath();ctx.moveTo(12,-85);ctx.quadraticCurveTo(16,-72,10,-62);ctx.stroke();ctx.strokeStyle=C.BLACK;
  ctx.fillStyle='#3a2a20';ctx.beginPath();ctx.moveTo(-10,-77);ctx.quadraticCurveTo(0,-82,10,-77);ctx.quadraticCurveTo(0,-74,-10,-77);ctx.fill();
  if(run){ctx.fillStyle='#5a1010';ctx.beginPath();ctx.ellipse(1,-73,4,4,0,0,7);ctx.fill();ctx.fillStyle='#8cc8ff';ctx.beginPath();ctx.arc(-14,-92,3,0,7);ctx.arc(14,-98,2.5,0,7);ctx.fill();}
  // top hat (flies above head when running)
  const hy=run?-108-Math.abs(Math.sin(ph*0.5))*16:-97;ctx.fillStyle='#16141a';ctx.fillRect(-12,hy-24,24,24);ctx.strokeRect(-12,hy-24,24,24);ctx.fillRect(-18,hy-2,36,5);ctx.strokeRect(-18,hy-2,36,5);ctx.fillStyle=C.RED;ctx.fillRect(-12,hy-8,24,5);
  ctx.restore();
}
/* ---------- boss: MR. CAPITAL ---------- */
function coin(ctx,x,y,rx,ry,tilt){ctx.fillStyle=C.GOLD;ctx.beginPath();ctx.ellipse(x,y,rx,ry,tilt||0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#fff0a0';ctx.beginPath();ctx.ellipse(x-rx*0.25,y-ry*0.25,rx*0.35,ry*0.3,0,0,7);ctx.fill();}
function boss(ctx,B,t){
  if(!B.visible) return;
  ctx.save();const cx=B.x,base=GROUND;ctx.translate(cx,base);ctx.rotate(B.tilt||0);ctx.translate(0,B.sink||0);
  ctx.lineWidth=3;ctx.strokeStyle=C.BLACK;const bob=Math.sin(t*0.05)*4,hurt=B.hurt>0;
  // legs: coin stacks
  for(const lx of[-62,62]){for(let i=0;i<9;i++)coin(ctx,lx,-12-i*20,34,10);}
  ctx.fillStyle='#2b2724';rr(ctx,-110,-20,90,22,8);ctx.fill();ctx.stroke();rr(ctx,20,-20,90,22,8);ctx.fill();ctx.stroke();
  ctx.translate(0,bob);
  // torso
  ctx.fillStyle=hurt?'#fff6c0':C.GOLD;rr(ctx,-130,-420,260,240,40);ctx.fill();ctx.lineWidth=5;ctx.stroke();ctx.lineWidth=3;
  for(let r=0;r<5;r++)for(let c=0;c<6;c++){coin(ctx,-105+c*42+(r%2)*10,-395+r*46,16,16);ctx.fillStyle=C.GOLD2;ctx.font='16px '+FONT_H;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('$',-105+c*42+(r%2)*10,-394+r*46);}
  // tuxedo vest & bow tie
  ctx.fillStyle='#1b1513';ctx.beginPath();ctx.moveTo(-60,-420);ctx.lineTo(0,-330);ctx.lineTo(60,-420);ctx.closePath();ctx.fill();
  ctx.fillStyle=C.RED;ctx.beginPath();ctx.moveTo(0,-405);ctx.lineTo(-26,-420);ctx.lineTo(-26,-390);ctx.closePath();ctx.moveTo(0,-405);ctx.lineTo(26,-420);ctx.lineTo(26,-390);ctx.closePath();ctx.fill();ctx.stroke();
  // arms
  const atk=B.pose==='attack'?Math.sin(t*0.4)*0.4-0.8:0;
  for(const s of[-1,1]){ctx.save();ctx.translate(s*138,-395);ctx.rotate(-s*(0.35+(s>0?-atk:0)));for(let i=0;i<5;i++)coin(ctx,0,i*30,18,14);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,165,22,0,7);ctx.fill();ctx.stroke();ctx.restore();}
  // head
  ctx.fillStyle=hurt?'#fff6c0':C.GOLD;ctx.beginPath();ctx.arc(0,-500,78,0,7);ctx.fill();ctx.lineWidth=5;ctx.stroke();ctx.lineWidth=3;
  ctx.strokeStyle=C.GOLD2;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-500,64,0,7);ctx.stroke();ctx.strokeStyle=C.BLACK;ctx.lineWidth=3;
  // eyes: left normal, right monocle
  const angry=B.mood==='angry'||B.pose==='attack';
  ctx.fillStyle=B.eyesRed?'#ff2020':'#fff';ctx.beginPath();ctx.ellipse(20,-512,12,15,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=C.BLACK;ctx.beginPath();ctx.arc(15,-510,5,0,7);ctx.fill();
  ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-44,angry?-536:-532);ctx.lineTo(-12,angry?-526:-534);ctx.moveTo(12,angry?-526:-534);ctx.lineTo(48,angry?-538:-532);ctx.stroke();ctx.lineWidth=3;
  // mustache
  ctx.fillStyle='#3a2a20';ctx.beginPath();ctx.moveTo(0,-478);ctx.quadraticCurveTo(-30,-492,-52,-470);ctx.quadraticCurveTo(-30,-470,0,-468);ctx.quadraticCurveTo(30,-470,52,-470);ctx.quadraticCurveTo(30,-492,0,-478);ctx.fill();ctx.stroke();
  // grin with gold teeth
  ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-32,-458);ctx.quadraticCurveTo(0,-436+(B.pose==='laugh'?Math.sin(t*0.7)*6:0),32,-458);ctx.closePath();ctx.fill();ctx.stroke();
  // hat
  ctx.fillStyle='#16141a';ctx.fillRect(-58,-650,116,95);ctx.strokeRect(-58,-650,116,95);rr(ctx,-90,-562,180,16,6);ctx.fill();ctx.stroke();
  ctx.fillStyle=C.RED;ctx.fillRect(-58,-585,116,18);
  // cigar
  ctx.fillStyle='#6b3e1e';ctx.save();ctx.translate(30,-455);ctx.rotate(0.25);ctx.fillRect(0,-5,46,10);ctx.strokeRect(0,-5,46,10);ctx.fillStyle='#f25';ctx.fillRect(44,-5,5,10);ctx.restore();
  ctx.restore();
  // weak points (drawn in world coordinates from bodies)
  for(const wp of B.weak){ if(wp.hp<=0){ ctx.save();ctx.translate(wp.x,wp.y+bob);ctx.strokeStyle=C.BLACK;ctx.lineWidth=3;ctx.fillStyle='#555';ctx.beginPath();ctx.arc(0,0,wp.r*0.8,0,7);ctx.fill();ctx.stroke();
      ctx.strokeStyle='#999';ctx.beginPath();ctx.moveTo(-10,-10);ctx.lineTo(10,10);ctx.moveTo(10,-10);ctx.lineTo(-10,10);ctx.stroke();ctx.restore();continue;}
    ctx.save();ctx.translate(wp.x,wp.y+bob);const pulse=1+Math.sin(t*0.15)*0.08;ctx.lineWidth=3;ctx.strokeStyle=C.BLACK;
    if(wp.id==='monocle'){ctx.fillStyle=wp.flash>0?'#fff':'rgba(190,230,255,.85)';ctx.beginPath();ctx.arc(0,0,wp.r,0,7);ctx.fill();ctx.lineWidth=6;ctx.strokeStyle=C.GOLD2;ctx.stroke();ctx.lineWidth=3;ctx.strokeStyle=C.BLACK;ctx.beginPath();ctx.arc(0,0,wp.r+3,0,7);ctx.stroke();
      ctx.fillStyle=C.BLACK;ctx.beginPath();ctx.arc(-3,2,7,0,7);ctx.fill();ctx.strokeStyle=C.GOLD;ctx.beginPath();ctx.moveTo(wp.r,4);ctx.quadraticCurveTo(wp.r+20,60,wp.r-5,110);ctx.stroke();}
    else if(wp.id==='vault'){ctx.fillStyle=wp.flash>0?'#fff':'#59606a';ctx.beginPath();ctx.arc(0,0,wp.r,0,7);ctx.fill();ctx.lineWidth=5;ctx.stroke();ctx.fillStyle=C.RED;ctx.beginPath();ctx.moveTo(0,14);ctx.bezierCurveTo(-26,-4,-14,-24,0,-10);ctx.bezierCurveTo(14,-24,26,-4,0,14);ctx.fill();ctx.lineWidth=2;ctx.stroke();
      ctx.strokeStyle=C.GOLD;ctx.lineWidth=4;for(let i=0;i<6;i++){const a=i*Math.PI/3+t*0.02;ctx.beginPath();ctx.moveTo(Math.cos(a)*(wp.r-8),Math.sin(a)*(wp.r-8));ctx.lineTo(Math.cos(a)*(wp.r+4),Math.sin(a)*(wp.r+4));ctx.stroke();}}
    else {ctx.fillStyle=wp.flash>0?'#fff':C.GOLD;star(ctx,0,0,wp.r,t*0.01,0.55);ctx.fill();ctx.stroke();ctx.fillStyle=C.BLACK;ctx.font='24px '+FONT_H;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('$',0,2);}
    // reticle
    ctx.strokeStyle='rgba(200,32,42,.85)';ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.beginPath();ctx.arc(0,0,(wp.r+14)*pulse,0,7);ctx.stroke();ctx.setLineDash([]);
    // hp pips
    for(let i=0;i<wp.max;i++){ctx.fillStyle=i<wp.hp?C.RED:'#444';ctx.fillRect(-wp.max*7+i*14,-wp.r-26,11,8);ctx.strokeStyle=C.BLACK;ctx.lineWidth=2;ctx.strokeRect(-wp.max*7+i*14,-wp.r-26,11,8);}
    ctx.restore();}
}
/* ---------- projectiles ---------- */
function projectile(ctx,p,t){
  const b=p.body;const x=b?b.position.x:p.x,y=b?b.position.y:p.y,a=b?b.angle:p.rot;
  ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.lineWidth=3;ctx.strokeStyle=C.BLACK;
  if(p.w==='hammer'){ctx.fillStyle='#8a5a2b';ctx.fillRect(-4,-4,34,8);ctx.strokeRect(-4,-4,34,8);ctx.fillStyle='#55595f';ctx.fillRect(-16,-15,22,30);ctx.strokeRect(-16,-15,22,30);ctx.fillStyle='#9aa0a8';ctx.fillRect(-14,-13,6,26);}
  else if(p.w==='sickle'){ctx.fillStyle='#c9ced6';ctx.beginPath();ctx.arc(0,0,26,-0.4,Math.PI*1.25);ctx.arc(-6,-4,18,Math.PI*1.25,-0.4,true);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#8a5a2b';ctx.save();ctx.rotate(-0.4);ctx.fillRect(22,-4,18,8);ctx.strokeRect(22,-4,18,8);ctx.restore();}
  else if(p.w==='star'){ctx.fillStyle=C.RED;star(ctx,0,0,22,0);ctx.fill();ctx.stroke();ctx.fillStyle=C.YEL;star(ctx,0,0,9,0);ctx.fill();}
  else if(p.w==='leaflet'){ctx.fillStyle=C.BEIGE;ctx.fillRect(-16,-12,32,24);ctx.strokeRect(-16,-12,32,24);ctx.fillStyle=C.RED;ctx.fillRect(-16,-3,32,6);ctx.strokeStyle=C.BLACK;ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(0,12);ctx.stroke();}
  else if(p.w==='rev'){const s=1+Math.sin(t*0.5)*0.1;ctx.scale(s,s);ctx.fillStyle=C.YEL;star(ctx,0,0,44,0,0.5);ctx.fill();ctx.fillStyle=C.RED;star(ctx,0,0,36,0);ctx.fill();ctx.stroke();}
  ctx.restore();
}
/* ---------- speech bubble & banners ---------- */
function wrap(ctx,text,maxW){const words=text.split(' ');const lines=[];let cur='';for(const w of words){const tt=cur?cur+' '+w:w;if(ctx.measureText(tt).width>maxW&&cur){lines.push(cur);cur=w;}else cur=tt;}if(cur)lines.push(cur);return lines;}
function bubble(ctx,x,y,text,tx,ty,size,alpha){
  ctx.save();ctx.globalAlpha=alpha==null?1:alpha;size=size||24;ctx.font=size+'px '+FONT_H;const maxW=360;let lines=wrap(ctx,text,maxW);
  let lw=Math.max(...lines.map(l=>ctx.measureText(l).width));if(lw>maxW){size*=maxW/lw;ctx.font=size+'px '+FONT_H;lw=maxW;}
  const pw=lw+30,ph=lines.length*size*1.15+20;let bx=Math.max(8,Math.min(W-pw-8,x-pw/2)),by=y-ph;
  ctx.fillStyle='#fffaf0';ctx.strokeStyle=C.BLACK;ctx.lineWidth=4;rr(ctx,bx,by,pw,ph,14);ctx.fill();ctx.stroke();
  ctx.beginPath();const cx=Math.max(bx+20,Math.min(bx+pw-20,tx));ctx.moveTo(cx-12,by+ph-2);ctx.lineTo(tx,ty);ctx.lineTo(cx+12,by+ph-2);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#fffaf0';ctx.fillRect(cx-10,by+ph-5,20,6);
  ctx.fillStyle=C.BLACK;ctx.textAlign='center';ctx.textBaseline='top';lines.forEach((l,i)=>ctx.fillText(l,bx+pw/2,by+10+i*size*1.15));ctx.restore();
}
function banner(ctx,text,y,t,opts){
  opts=opts||{};ctx.save();const k=Math.min(1,t/12);ctx.translate(W/2,y);ctx.rotate(opts.rot!=null?opts.rot:-0.05);ctx.scale(0.6+0.4*k,0.6+0.4*k);ctx.globalAlpha=Math.min(1,k*1.5)*(opts.alpha==null?1:opts.alpha);
  let size=opts.size||84;ctx.font=size+'px '+FONT_H;const maxW=opts.maxW||1420;let tw=ctx.measureText(text).width;
  let lines=[text];if(tw>maxW&&opts.wrap!==false){lines=wrap(ctx,text,maxW*0.85);}
  let lw=Math.max(...lines.map(l=>ctx.measureText(l).width));if(lw>maxW){size*=maxW/lw;ctx.font=size+'px '+FONT_H;lw=maxW;}
  const ph=lines.length*size*1.1+size*0.5;
  ctx.fillStyle=opts.bg||C.RED;ctx.strokeStyle=C.BLACK;ctx.lineWidth=6;
  ctx.beginPath();ctx.moveTo(-lw/2-60,-ph/2);ctx.lineTo(lw/2+40,-ph/2);ctx.lineTo(lw/2+70,ph/2);ctx.lineTo(-lw/2-30,ph/2);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.textAlign='center';ctx.textBaseline='middle';
  lines.forEach((l,i)=>{const yy=(i-(lines.length-1)/2)*size*1.1+3;ctx.fillStyle=C.BLACK;ctx.fillText(l,6,yy+6);ctx.fillStyle=opts.fg||C.YEL;ctx.fillText(l,0,yy);});
  ctx.restore();
}
function icon(kind,size){
  const cv=document.createElement('canvas');cv.width=cv.height=size||64;const ctx=cv.getContext('2d');ctx.scale(cv.width/64,cv.width/64);
  if(kind==='rev'){ctx.translate(32,32);ctx.fillStyle=C.YEL;star(ctx,0,0,30,0,0.5);ctx.fill();ctx.fillStyle=C.RED;star(ctx,0,0,24,0);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=C.BLACK;ctx.stroke();
    ctx.fillStyle=C.YEL;ctx.font='bold 20px '+FONT_H;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('!',0,2);}
  else{ctx.translate(32,32);if(kind==='hammer')ctx.rotate(-0.7);projectile(ctx,{w:kind,x:0,y:0,rot:kind==='sickle'?0.4:0},0);}
  return cv.toDataURL();
}
window.ART={C,FONT_H,W,H,GROUND,background,cloud,block,target,tank,muzzle,banker,boss,projectile,bubble,banner,icon,star,rr,fitText,wrap};
})();
