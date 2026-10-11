/* Level layouts + "capitalism rebuilds itself" logic. Ground top is y=820. */
(function(){
const G=820;
function floor(b,xl,xr,yb,colH,colMat,slabMat,o){o=o||{};const cw=o.colW||22,n=o.cols||2,sh=o.slabH||20;
  for(let i=0;i<n;i++){const x=xl+cw/2+i*(xr-xl-cw)/(n-1);b.box(x,yb-colH/2,cw,colH,colMat,{deco:o.colDeco||(colMat==='glass'?null:o.deco),fresh:o.fresh});}
  b.box((xl+xr)/2,yb-colH-sh/2,xr-xl+(o.over==null?16:o.over),sh,slabMat,{deco:o.slabDeco,sign:o.sign,fresh:o.fresh});
  return yb-colH-sh;}
function topFloor(r,cx,w,colH,colMat,slabMat,o){const s=r.surface(cx-w/2,cx+w/2);if(s<(o&&o.minY||170))return false;
  floor(r,cx-w/2,cx+w/2,s-2,colH,colMat,slabMat,Object.assign({fresh:true,over:10},o||{}));return true;}
const LEVELS=[
{ id:1, shots:6, range:[960,1440], bankers:[1490,1550], night:false,
  build(b){
    b.box(1200,810,480,20,'stone');
    floor(b,990,1410,800,120,'stone','stone',{cols:4,colW:26,deco:'column',slabH:22});
    floor(b,1030,1370,658,100,'wood','wood',{cols:3,slabH:24,slabDeco:'sign',sign:'sign1'});
    b.tri(1200,534-70/3,360,70,'stone');
    b.target('bag',1068,778,46,44);b.target('bag',1331,778,46,44);b.target('bag',1120,636,46,44);b.target('bag',1280,636,46,44);
  },
  rebuild(r,n){const top=r.highest();return topFloor(r,top.x,170,70,'wood','stone',{slabH:22})?'rb1':null;}
},
{ id:2, shots:6, range:[900,1500], bankers:[1180,1540],
  build(b){
    for(const xl of[930,1320]){let y=floor(b,xl,xl+150,820,110,'stone','stone',{colW:26});y=floor(b,xl,xl+150,y,100,'wood','stone');floor(b,xl,xl+150,y,90,'glass','wood');}
    b.box(1200,450,300,22,'stone',{deco:'sign',sign:'sign2'});
    b.target('bull',1200,439-28,70,56);b.target('safe',1005,795,50,50);b.target('safe',1395,795,50,50);b.target('bag',1005,669,44,42);
  },
  rebuild(r,n){const c=r.toSteel(3);const top=r.highest();const s=r.surface(top.x-80,top.x+80);if(s>200)r.box(top.x,s-12,160,18,'steel',{fresh:true});return 'rb2';}
},
{ id:3, shots:6, range:[960,1420], bankers:[1460,1530],
  build(b){
    let y=820;for(let i=0;i<6;i++)y=floor(b,1180,1340,y,70,'glass','gold',{slabH:18,slabDeco:i===2?'sign':null,sign:'sign3'});
    b.tri(1260,y-30,70,90,'gold');
    let y2=floor(b,980,1100,820,90,'stone','gold');floor(b,980,1100,y2,80,'glass','gold');
    b.target('bars',1260,800,60,40);b.target('case',1260,820-2*88-20,56,40);b.target('bars',1260,820-4*88-20,60,40);b.target('bag',1040,798,44,44);
  },
  rebuild(r,n){const top=r.highest();return topFloor(r,top.x,150,60,'glass','gold',{minY:150})?'rb3':null;}
},
{ id:4, shots:6, range:[930,1470], bankers:[1500,1555],
  build(b){
    b.box(960,740,30,160,'stone');b.box(1200,740,40,160,'stone');b.box(1440,740,30,160,'stone');
    b.box(1072,647,255,26,'stone',{deco:'sign',sign:'sign4'});b.box(1328,647,255,26,'stone',{deco:'windows'});
    for(const cx of[1000,1400])for(let i=0;i<3;i++)b.box(cx,634-22-i*44,34,44,'stone');
    b.box(1110,612,50,44,'wood',{deco:'crate'});
    b.target('press',1080,790,80,60);b.target('press',1320,790,80,60);b.target('bag',1265,612,44,44);
  },
  rebuild(r,n){const top=r.highest();const s=r.surface(top.x-25,top.x+25);if(s<200)return null;r.box(top.x,s-24,48,44,'wood',{deco:'crate',fresh:true});
    const s2=r.surface(1050,1150);if(s2>220)r.box(1100+((n%2)?-30:30),s2-24,48,44,'wood',{deco:'crate',fresh:true});return 'rb4';}
},
{ id:5, shots:6, range:[760,1530], bankers:[1555,1580],
  build(b){
    floor(b,880,1520,820,100,'stone','wood',{cols:4,colW:24});
    floor(b,940,1460,700,90,'glass','wood',{cols:3});
    floor(b,1020,1380,590,80,'glass','wood',{cols:3,colW:20});
    b.box(1200,490-17,240,34,'wood',{deco:'sign',sign:'sign5'});
    b.tri(1200,456-30,300,90,'glass');
    b.target('cart',1060,795,60,50);b.target('cart',1340,795,60,50);b.target('cart',1080,675,60,50);b.target('cart',1290,565,60,50);
  },
  rebuild(r,n){if(n%2===1){const s=r.surface(770,880);if(s<420)return null;floor(r,770,880,s-2,80,'wood','glass',{fresh:true,over:10});return 'rb5';}
    const top=r.highest();return topFloor(r,top.x,180,70,'glass','wood')?'rb5':null;}
},
{ id:6, shots:7, range:[1000,1400], bankers:[1460,1530],
  build(b){
    let y=floor(b,1040,1360,820,100,'stone','stone',{cols:3,colW:26});y=floor(b,1040,1360,y,90,'stone','stone',{cols:3,slabDeco:'windows'});
    y=floor(b,1100,1300,y,90,'wood','wood');y=floor(b,1100,1300,y,80,'wood','wood',{slabDeco:'sign',sign:'sign6',slabH:24});
    y=floor(b,1150,1250,y,70,'glass','gold');floor(b,1150,1250,y,60,'glass','gold');
    b.target('case',1125,800,56,40);b.target('case',1200,590-20,56,40);b.target('case',1200,376-18,44,36);
  },
  rebuild(r,n){const top=r.highest();return topFloor(r,top.x,110,60,'glass','gold',{minY:140})?'rb6':null;}
},
{ id:7, shots:7, range:[960,1560], bankers:[1150,1585],
  build(b){
    b.box(1250,790,300,60,'stone');b.box(1250,725,240,70,'stone',{deco:'sign',sign:'sign7'});
    b.target('dollar',1250,642,120,95,130);b.target('dollar',1250,547,120,95,130);b.target('dollar',1250,452,120,95,130);
    b.box(990,770,24,100,'stone');b.box(1090,770,24,100,'stone');b.box(1040,710,140,20,'stone');b.target('safe',1040,795,50,50);
    b.box(1440,770,22,100,'gold');b.box(1540,770,22,100,'gold');b.box(1490,710,140,20,'gold');b.target('safe',1490,795,50,50);
  },
  rebuild(r,n){const s=r.surface(1200,1300);if(s<240)return null;r.box(1250,s-22,100,40,'gold',{deco:'crown',fresh:true});return 'rb7';}
},
{ id:8, shots:14, range:[900,1500], bankers:[], boss:true,
  build(b){for(const x of[950,995])for(let i=0;i<4;i++)b.box(x,800-i*40,42,40,'gold',{deco:'crown'});},
  rebuild(r,n){const s=r.surface(930,1015);if(s<560)return null;r.box(950+(n%2)*45,s-22,42,40,'gold',{deco:'crown',fresh:true});return 'rb8';}
}];
window.LEVELS=LEVELS;window.LVHELP={floor};
})();
