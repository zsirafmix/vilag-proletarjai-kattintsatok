/* HTML UI: menus, HUD, level select, results, language selector */
(function(){
const $=id=>document.getElementById(id),T=(k,v)=>I18N.t(k,v),G=PK.G,save=PK.save;
const INF='<svg class="inf" viewBox="0 0 24 12"><path d="M6 2a4 4 0 1 0 0 8c3 0 9-8 12-8a4 4 0 1 1 0 8c-3 0-9-8-12-8z" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>';
const SCREENS=['menu','levelsScr','howScr','pauseScr','resultScr','finaleScr'];
const FLAGS={
 hu:'<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#477050"/><rect width="30" height="13.3" fill="#fff"/><rect width="30" height="6.7" fill="#ce2939"/></svg>',
 en:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#012169"/><path d="M0 0L60 40M60 0L0 40" stroke="#fff" stroke-width="8"/><path d="M0 0L60 40M60 0L0 40" stroke="#c8102e" stroke-width="3"/><path d="M30 0v40M0 20h60" stroke="#fff" stroke-width="12"/><path d="M30 0v40M0 20h60" stroke="#c8102e" stroke-width="7"/></svg>',
 de:'<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#ffce00"/><rect width="30" height="13.3" fill="#dd0000"/><rect width="30" height="6.7" fill="#000"/></svg>',
 fr:'<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#ef4135"/><rect width="20" height="20" fill="#fff"/><rect width="10" height="20" fill="#0055a4"/></svg>',
 ru:'<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#d52b1e"/><rect width="30" height="13.3" fill="#0039a6"/><rect width="30" height="6.7" fill="#fff"/></svg>'};
let icons={},open=null;
function show(id){for(const s of SCREENS)$(s).classList.toggle('show',s===id);open=id;$('hud').classList.toggle('hidden',id==='menu'||id==='levelsScr'||id==='howScr'||G.phase==='menu');}
function hideAll(){for(const s of SCREENS)$(s).classList.remove('show');open=null;$('hud').classList.remove('hidden');}
function fmt(n){return Math.round(n).toLocaleString(I18N.lang==='en'?'en-US':I18N.lang).replace(/\u00a0|\u202f/g,' ');}
function applyLang(){
  document.querySelectorAll('[data-i]').forEach(el=>{el.textContent=T(el.dataset.i);});
  $('title').innerHTML=T('title').replace(/,\s*/,',<br>');document.title=T('title');
  updMute();
  $('mBest').textContent=fmt(save.bestTotal||0);
  $('mNg').textContent=T('ngLevel',{n:(save.ngMax||0)});$('mNg').classList.toggle('hidden',!(save.ngMax>0));
  $('howList').innerHTML=T('howLines').map(l=>'<li>'+l+'</li>').join('');
  $('wpnList').innerHTML=PK.WLIST.map(w=>'<div class="wl"><img src="'+icons[w]+'" alt=""><div><b>'+T('w_'+w)+'</b><small>'+T('d_'+w)+'</small></div></div>').join('');
  document.querySelectorAll('#langs button').forEach(b=>b.classList.toggle('on',b.dataset.l===I18N.lang));
  buildWeapons();renderLevels();if(G.phase!=='menu')onLevel();sync();
}
function setLang(l){I18N.set(l);save.lang=l;PK.persist();applyLang();}
function buildWeapons(){const box=$('weapons');box.innerHTML='';
  for(const [i,w] of PK.WLIST.entries()){const b=document.createElement('button');b.className='wbtn';b.dataset.w=w;b.title=T('w_'+w)+' – '+T('d_'+w)+' ['+(i+1)+']';
    b.innerHTML='<img src="'+icons[w]+'" alt=""><span class="cnt"></span>'+(w==='rev'?'<span class="meter"><i></i></span>':'');
    b.addEventListener('click',()=>{SFX.init();selectWeapon(w);});box.appendChild(b);}}
function selectWeapon(w){if(G.phase==='menu')return;if(!PK.canFire(w)){SFX.play('bounce');return;}G.weapon=w;SFX.play('click');sync();}
function renderLevels(){const g=$('lvGrid');g.innerHTML='';
  for(const L of PK.LEVELS){const locked=L.id>save.unlocked&&!PK.DEBUG;const c=document.createElement('button');c.className='lvcard'+(locked?' locked':'')+(L.boss?' boss':'');
    c.innerHTML='<span class="no">'+L.id+'</span><b>'+T('lv'+L.id)+'</b><small>'+(locked?T('locked'):(T('best')+': '+fmt(save.best[L.id]||0)))+'</small>';
    c.disabled=locked;c.addEventListener('click',()=>{SFX.init();SFX.play('click');G.runStart=0;G.score=0;startLevel(L.id-1);});g.appendChild(c);}}
function startLevel(i,keep){SFX.init();if(!save.muted)SFX.music(true);hideAll();PK.loadLevel(i,keep);}
function onLevel(){const L=PK.LEVELS[G.li];$('hLevelNo').textContent=T('level')+' '+L.id+'/8'+(save.ng?' · '+T('ng')+save.ng:'');$('hLevelName').textContent=T('lv'+L.id);sync();}
let lastSync='';
function sync(){
  if(G.phase==='menu')return;
  $('sAngle').value=G.angle;$('sPower').value=G.power;$('vAngle').textContent=G.angle+'°';$('vPower').textContent=G.power+'%';
  $('inflTag').textContent=G.infl<1?'-30%':'';$('cPreview').checked=G.preview;
  $('wName').textContent=T('w_'+G.weapon);$('wDesc').textContent=T('d_'+G.weapon);
  document.querySelectorAll('.wbtn').forEach(b=>{const w=b.dataset.w;b.classList.toggle('sel',w===G.weapon);const ok=PK.canFire(w);b.classList.toggle('empty',!ok);
    const c=b.querySelector('.cnt');if(w==='hammer'){if(!c.firstChild)c.innerHTML=INF;}else c.textContent=w==='rev'?Math.floor(G.rev)+'%':G.ammo[w];
    if(w==='rev'){b.querySelector('.meter i').style.width=G.rev+'%';b.classList.toggle('ready',G.rev>=100);}});
  $('bFire').disabled=G.phase!=='aim';
}
function tick(){
  if(G.phase==='menu'||!$('hScore'))return;
  const s=fmt(G.score)+'|'+G.shots+'|'+(G.boss?G.boss.weak.filter(w=>w.hp>0).length:G.targets.length)+'|'+G.phase+'|'+Math.floor(G.rev)+'|'+G.infl+'|'+G.weapon;
  if(s===lastSync)return;lastSync=s;
  $('hScore').textContent=fmt(G.score);if(G.inf)$('hShots').innerHTML=INF;else $('hShots').textContent=G.shots;$('hTargets').textContent=G.boss?G.boss.weak.filter(w=>w.hp>0).length:G.targets.length;
  const wasReady=$('weapons').querySelector('.ready');sync();if(!wasReady&&G.rev>=100&&G.phase==='aim'){SFX.play('charge');}
}
function showResult(won){const L=PK.LEVELS[G.li];show('resultScr');$('rTitle').textContent=won?T('win'):T('lose');
  $('resultScr').classList.toggle('lost',!won);
  const st=won?G.stars:0;$('rStars').innerHTML=won?[0,1,2].map(i=>'<svg viewBox="0 0 24 24" class="'+(i<st?'on':'')+'"><path d="M12 1.5l3.1 6.6 7.2.9-5.3 5 1.4 7.2L12 17.6l-6.4 3.6 1.4-7.2-5.3-5 7.2-.9z"/></svg>').join(''):'<p class="losesub">'+T('loseSub')+'</p>';
  const b=G.stats.bonuses,rows=[[T('bDestr'),G.levelScore-G.stats.bonusPts-(won?G.shotsBonus:0)]];for(const k in b)rows.push([T(k),b[k]]);if(won)rows.push([T('bShots')+' ('+G.shots+' × 10 000)',G.shotsBonus]);
  rows.push([T('total'),G.levelScore]);$('rTable').innerHTML=rows.map((r,i)=>'<tr'+(i===rows.length-1?' class="tot"':'')+'><td>'+r[0]+'</td><td>'+fmt(r[1])+'</td></tr>').join('');
  $('rRecord').textContent=won&&G.newRecord?T('newRecord'):'';$('rNext').classList.toggle('hidden',!won||L.id>=8);}
function showFinale(){show('finaleScr');$('fTitle').textContent=T('leninWon');$('fScore').textContent=T('total')+': '+fmt(G.score)+' · '+T('totalBest')+': '+fmt(save.bestTotal);$('fNg').textContent=T('ngLevel',{n:save.ng+1});}
function pause(){if(G.phase==='menu'||G.phase==='panel'||G.phase==='finale'||open)return;G.paused=true;show('pauseScr');}
function resume(){G.paused=false;hideAll();}
function toMenu(){G.paused=false;G.phase='menu';SFX.music(false);show('menu');applyLang();}
function restart(){if(G.phase==='menu')return;G.paused=false;startLevel(G.li,false);}
function toggleMute(){save.muted=!save.muted;PK.persist();SFX.setMuted(save.muted);if(!save.muted&&G.phase!=='menu')SFX.music(true);updMute();}
function updMute(){$('muteX').style.display=save.muted?'':'none';$('muteW').style.display=save.muted?'none':'';$('mMute').innerHTML=$('bMute').innerHTML.replace(/id="mute[XW]"/g,'')+'<span>'+T('sound')+'</span>';$('mMute').classList.toggle('off',!!save.muted);}
function menuArtLoop(){if(open==='menu'){const c=$('menuArt'),x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.save();x.translate(-20,-520);x.scale(1,1);
  ART.tank(x,190,30+Math.sin(performance.now()/600)*8,'shout',performance.now()/16,0,'point',T('tankName'),0);x.restore();
  x.save();x.translate(270,-525);ART.banker(x,{x:100,state:'run',scale:.9},performance.now()/16);x.restore();}
  requestAnimationFrame(menuArtLoop);}
function init(){
  for(const w of PK.WLIST)icons[w]=ART.icon(w,96);
  const lb=$('langs');for(const l of I18N.LANGS){const b=document.createElement('button');b.dataset.l=l;b.innerHTML=FLAGS[l]+'<span>'+l.toUpperCase()+'</span>';b.addEventListener('click',()=>{SFX.init();SFX.play('click');setLang(l);});lb.appendChild(b);}
  $('mPlay').onclick=()=>{SFX.init();SFX.play('click');G.runStart=0;G.score=0;save.ng=save.ng||0;startLevel(Math.min(save.unlocked,8)-1);};
  $('mLevels').onclick=()=>{SFX.init();SFX.play('click');renderLevels();show('levelsScr');};
  $('mHow').onclick=()=>{SFX.init();SFX.play('click');show('howScr');};
  $('mNg').onclick=()=>{SFX.init();save.ng=save.ngMax;PK.persist();G.runStart=0;G.score=0;startLevel(0);};
  $('mMute').onclick=()=>{toggleMute();};
  document.querySelectorAll('.back').forEach(b=>b.onclick=()=>{SFX.play('click');if(G.paused){show('pauseScr');}else show('menu');});
  $('bPause').onclick=()=>{SFX.init();pause();};$('bRestart').onclick=()=>{SFX.init();restart();};$('bMute').onclick=()=>{SFX.init();toggleMute();};
  $('pResume').onclick=resume;$('pRestart').onclick=restart;$('pMenu').onclick=toMenu;$('pLevels').onclick=()=>{renderLevels();show('levelsScr');};
  $('rNext').onclick=()=>{SFX.play('click');startLevel(G.li+1,true);};$('rRetry').onclick=()=>{SFX.play('click');startLevel(G.li,false);};$('rMenu').onclick=toMenu;
  $('fNg').onclick=()=>{save.ng=(save.ng||0)+1;save.ngMax=Math.max(save.ngMax||0,save.ng);PK.persist();G.runStart=0;G.score=0;startLevel(0);};$('fMenu').onclick=toMenu;
  $('sAngle').addEventListener('input',e=>{G.angle=+e.target.value;sync();});$('sPower').addEventListener('input',e=>{G.power=+e.target.value;sync();});
  $('cPreview').addEventListener('change',e=>{G.preview=e.target.checked;save.preview=G.preview;PK.persist();});
  $('bFire').addEventListener('click',()=>{SFX.init();PK.fire();});
  $('rotBtn').onclick=()=>{G.rotDismissed=true;$('rotate').classList.remove('show');};
  if(PK.DEBUG){const d=$('debugBar');d.classList.remove('hidden');d.innerHTML='DEBUG: <button data-a="win">WIN</button><button data-a="inf">INF</button><button data-a="rev">REV</button><button data-a="auto">AUTO</button>'+[1,2,3,4,5,6,7,8].map(n=>'<button data-j="'+n+'">'+n+'</button>').join('');
    d.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.j)PK.debug.jump(+b.dataset.j);else if(b.dataset.a==='win')PK.debug.win();else if(b.dataset.a==='inf')PK.debug.inf(!G.inf);else if(b.dataset.a==='rev')PK.debug.rev();else if(b.dataset.a==='auto')PK.autoShot();});}
  SFX.setMuted(!!save.muted);updMute();
  const ready=document.fonts&&document.fonts.load?Promise.all(['400 40px "Russo One"','500 20px "Oswald"','700 20px "Oswald"'].map(f=>document.fonts.load(f,'AÁŐŰßÉÇЖЯ'))):Promise.resolve();
  ready.catch(()=>{}).then(()=>{for(const w of PK.WLIST)icons[w]=ART.icon(w,96);applyLang();show('menu');document.body.classList.add('ready');});
  applyLang();show('menu');menuArtLoop();
}
window.UI={init,onLevel,sync,tick,showResult,showFinale,overlayOpen:()=>!!open,selectWeapon,pause,resume,toggleMute,restart,startLevel,setLang,applyLang,show};
})();
