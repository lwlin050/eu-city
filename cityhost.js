// cityhost.js — 載入外部設計的城市平台（city_x.js，由 Gemini 設計），接上旅遊島的圖釘、車流、行人、紅綠燈、日夜、天氣與點擊互動
// 在 scene2.js、city_x.js 之後、app.js 之前載入；有平台的城市改用平台造型，沒有的城市維持原樣。

// 【1. 平台註冊與建置】
const PFHOST={},PFPLAZA={v:[2.16,-2.51]},PFAUD={ctx:null,out:null},PFRM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function PFon(id){return !!(window.CITY_PLATFORMS&&window.CITY_PLATFORMS[id])}
function PF(id){if(!PFon(id))return null;if(!PFHOST[id]){try{const o=window.CITY_PLATFORMS[id].build(THREE,{reducedMotion:PFRM,quality:innerWidth<700?'low':'high',audio:PFAUD});o.persons=[];o.carriages=[];PFHOST[id]=o}catch(e){console.error('[platform]',id,e);window.CITY_PLATFORMS[id]=null;return null}}return PFHOST[id]}
const PFY=.347; // 平台道路面高度（地面 0.33＋路面厚度）

// 【2. 取代原本的城市裝飾：只保留廣場位置與交通設施】
// 地標擺放點：景點圖釘離道路太近，地標改放在圖釘旁的空地（座標、朝向、可用半徑）；平台若有 landmarkAnchors 則以平台為準
const PFANCH={v:{'聖史蒂芬大教堂':{x:2.7,z:0.96,ry:-1.69,r:0.8},'國家歌劇院':{x:-0.52,z:5.45,ry:-2.59,r:0.8},'霍夫堡皇宮':{x:-4.11,z:1.45,ry:-1.2,r:0.75},'美泉宮':{x:-5.34,z:3.13,ry:2.22,r:0.35},'普拉特與大摩天輪':{x:4.27,z:-3.85,ry:0.22,r:0.8},'美景宮 Belvedere':{x:4.83,z:3.11,ry:-0.89,r:0.8},'藝術史博物館 KHM':{x:-6.06,z:0.52,ry:1.34,r:0.47},'卡爾教堂':{x:1.11,z:5.6,ry:2.78,r:0.79},'百水公寓':{x:5.71,z:0.69,ry:-0.84,r:0.8},'市政廳廣場':{x:-4.22,z:-0.86,ry:-0.58,r:0.44}}};
function PFdecor(g,id){const L=LAY[id],q=PFPLAZA[id],P0=PF(id);if(P0&&P0.roadSpec){L.road=P0.roadSpec;L.swo=P0.roadSpec.asphalt/2+(P0.roadSpec.sidewalk||0)/2}if(q){L.pz={x:q[0],z:q[1]};PLAZA.push({id,g,x:q[0],z:q[1]})}if(P0&&P0.bridgeSpot&&typeof S2bridgePlace==='function'){const B=Object.assign({n:S2BRN[id]},P0.bridgeSpot);S2BR[id]=B;S2bridgePlace(g,id,B)}if(typeof S2traffic==='function')S2traffic(g,id)}
// 景點模型：平台有提供就用平台的（model() 外層會縮放 0.82、下移 0.9，這裡抵銷回原尺寸並貼齊路面）
function PFlandmark(c,p,i){const P=PF(c.id),f=P&&P.landmarks&&P.landmarks[p[2]];if(!f||p[1]==='r'||p[1]==='w'||p[1]==='x')return null;
 const an=(P.landmarkAnchors&&P.landmarkAnchors[p[2]])||(PFANCH[c.id]&&PFANCH[c.id][p[2]]);
 if(an){const g=isl[CT.indexOf(c)],lm=f();lm.position.set(an.x,.33,an.z);lm.rotation.y=an.ry||0;const lbb=new THREE.Box3().setFromObject(lm);g.add(lm);
  if(typeof LABC!=='undefined'&&LABC[p[1]]){const bb=lbb,H=new THREE.Group();H.position.set(an.x,0,an.z);H.scale.setScalar(.82);g.add(H);sgn(H,p[2],LABC[p[1]],(bb.max.y+.2)/.82)}// 平台地標的名稱看板，大小與其他城市一致if(lm.userData&&lm.userData.interactive)P.interactives.push(Object.assign({object:lm},lm.userData.interactive));
  const hb=new THREE.Mesh(new THREE.BoxGeometry((an.r||.6)*1.4,.9,(an.r||.6)*1.4),new THREE.MeshBasicMaterial({visible:false}));hb.position.set(an.x,.8,an.z);hb.userData.i=i;g.add(hb);hits.push(hb);return new THREE.Group()}
 const G=new THREE.Group(),lm=f();if(lm.userData&&lm.userData.interactive)P.interactives.push(Object.assign({object:lm},lm.userData.interactive));lm.scale.setScalar(1/.82);lm.position.y=(PFY-.27)/.82;G.add(lm);G.position.y=-.9;G.scale.setScalar(.82);return G}
// 車輛：平台造型，尺寸已是實際大小（addVeh 縮放傳 1）
function PFwrap(o){const W=new THREE.Group();o.position.y=PFY-.34;W.add(o);return W}
function PFtraffic(g,id){const P=PF(id);[0xe8574a,0x5b8fd9].forEach(c=>addVeh(g,id,PFwrap(P.makeCar(c)),.5+Math.random()*.2,1));
 addVeh(g,id,PFwrap(P.makeBus()),.45+Math.random()*.1,1);const tr=P.makeTram&&P.makeTram();if(tr)addVeh(g,id,PFwrap(tr),.4+Math.random()*.1,1);
 if(P.makeCarriage){const C=P.makeCarriage();if(C&&C.group){addVeh(g,id,PFwrap(C.group),.28,1);P.carriages.push(C)}}}
// 行人：平台造型＋我們的路網移動（人行道、讓車規則照舊）
function PFwalker(g,id,i){const P=PF(id),cols=[0x3f7fc0,0xc93b3b,0x7ea36b,0xd4a338,0x8a5fb0],Z=P.makePerson({coatColor:cols[i%5]}),w=Object.assign(mkW(id,.2+Math.random()*.12,(i%2?1:-1)*.04),{pm:18}),H=new THREE.Group();H.add(Z.group);g.add(H);P.persons.push(Z);
 live.push(t=>{stepW(w,DT);Z.setWalk(w.ph);H.position.set(w.x,PFY,w.z);H.rotation.y=w.h})}

// 【3. 日夜與天氣（白天／黃昏／夜晚、晴／多雲／雨／雪）】
const PFW={sun:1,cloud:0,rain:0,snow:0},PFS={weather:'sun',cover:0,mode:'manual',tgt:null,lb:{hl:1,dl:1},night:-1,last:0,parts:{}};
const pfSm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
function PFnightOf(h){return h>=12?pfSm(17.8,20.2,h):1-pfSm(6,7,h)}
function PFlight(){if(typeof hl==='undefined')return;PFS.lb.hl=hl.intensity;PFS.lb.dl=dl.intensity}
function PFparticles(id,g){const B=7,H=6,NR=800,rg=new THREE.BufferGeometry(),ra=new Float32Array(NR*6),rs=[];for(let i=0;i<NR;i++)rs.push({x:(Math.random()*2-1)*B,y:Math.random()*H,z:(Math.random()*2-1)*B,v:5+Math.random()*3});rg.setAttribute('position',new THREE.BufferAttribute(ra,3));
 const rm=new THREE.LineBasicMaterial({color:0x7fa6d8,transparent:true,opacity:0}),rl=new THREE.LineSegments(rg,rm);rl.frustumCulled=false;rl.raycast=()=>{};g.add(rl);
 const NS=700,sg=new THREE.BufferGeometry(),sa=new Float32Array(NS*3),ss=[];for(let i=0;i<NS;i++)ss.push({x:(Math.random()*2-1)*B,y:Math.random()*H,z:(Math.random()*2-1)*B,v:.4+Math.random()*.4,ph:Math.random()*6});sg.setAttribute('position',new THREE.BufferAttribute(sa,3));
 const fl=document.createElement('canvas');fl.width=fl.height=32;{const x=fl.getContext('2d'),gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.5,'rgba(255,255,255,.85)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,32,32)}
 const sm=new THREE.PointsMaterial({color:0xffffff,size:.06,map:new THREE.CanvasTexture(fl),alphaTest:.05,transparent:true,opacity:0,depthWrite:false}),sp=new THREE.Points(sg,sm);sp.frustumCulled=false;sp.raycast=()=>{};g.add(sp);
 PFS.parts[id]={rm,sm,step:(t,dt)=>{const m=PFRM?.25:1;if(PFW.rain>.01){for(let i=0;i<NR;i++){const r=rs[i];r.y-=r.v*dt*m;r.x+=.8*dt*m;if(r.y<.35){r.y=H;r.x=(Math.random()*2-1)*B;r.z=(Math.random()*2-1)*B}ra.set([r.x,r.y,r.z,r.x-.06,r.y+.32,r.z],i*6)}rg.attributes.position.needsUpdate=true}
  if(PFW.snow>.01){for(let i=0;i<NS;i++){const s=ss[i];s.y-=s.v*dt*m;s.x+=Math.sin(t+s.ph)*.15*dt*m;if(s.y<.35){s.y=H;s.x=(Math.random()*2-1)*B;s.z=(Math.random()*2-1)*B}sa.set([s.x,s.y,s.z],i*3)}sg.attributes.position.needsUpdate=true}}}}
function PFtime(dt){const el=document.getElementById('tm');if(!el)return 18.5;let h=+el.value;
 if(PFS.mode==='auto'&&!PFRM){h+=dt*18/150;if(h>24)h=6;el.value=h;applyTime(h)}
 else if(PFS.tgt!=null){const d=PFS.tgt-h;if(Math.abs(d)<.13){h=PFS.tgt;PFS.tgt=null}else h+=Math.sign(d)*Math.min(Math.abs(d),dt*6);el.value=h;applyTime(h)}return h}
function PFweather(dt){const tg=PFS.weather;for(const k in PFW)PFW[k]+=((k===tg?1:0)-PFW[k])*Math.min(1,dt*(PFRM?4:.7));
 PFS.cover=Math.min(1,Math.max(0,PFS.cover+(tg==='snow'?dt*.03:-dt*.015)));
 if(typeof hl!=='undefined'){dl.intensity=PFS.lb.dl*(PFW.sun+PFW.cloud*.5+PFW.rain*.32+PFW.snow*.55);hl.intensity=PFS.lb.hl*(1+.18*(1-PFW.sun))}}

// 【4. 設定選單：天氣與日夜模式】
function PFui(){const s=document.getElementById('sub-set'),tb=document.getElementById('timebox');if(!s||!tb||document.getElementById('pfwx'))return;
 const mk=(id,label,items,on)=>{const w=document.createElement('div');w.className='thsel';w.innerHTML='<span>'+label+'</span><div class="seg" id="'+id+'">'+items.map(i=>'<button type="button" data-v="'+i[0]+'">'+i[1]+'</button>').join('')+'</div>';w.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{on(b.dataset.v);w.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b))}));return w};
 const wx=mk('pfwx','天氣',[['sun','☀ 晴'],['cloud','☁ 多雲'],['rain','☂ 雨'],['snow','❄ 雪']],v=>PFS.weather=v);
 const tm=mk('pftm','日夜',[['auto','自動'],['12','白天'],['18.75','黃昏'],['22.5','夜晚']],v=>{if(v==='auto')PFS.mode='auto';else{PFS.mode='manual';PFS.tgt=+v}});
 tb.parentNode.insertBefore(wx,tb);tb.parentNode.insertBefore(tm,tb);wx.querySelector('[data-v="sun"]').classList.add('on');
 const el=document.getElementById('tm');if(el)el.addEventListener('input',()=>{PFS.mode='manual';PFS.tgt=null;tm.querySelectorAll('button').forEach(x=>x.classList.remove('on'))})}

// 【5. 互動：滑鼠提示與點擊（平台提供的 interactives）】
const PFRC=new THREE.Raycaster(),PFV2=new THREE.Vector2();
function pfAudio(){if(!PFAUD.ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return;PFAUD.ctx=new A();PFAUD.out=PFAUD.ctx.createGain();PFAUD.out.gain.value=.7;PFAUD.out.connect(PFAUD.ctx.destination)}if(PFAUD.ctx.state==='suspended')PFAUD.ctx.resume()}
function pfHit(x,y){if(typeof fc==='undefined'||!fc||!PFHOST[fc])return null;const P=PFHOST[fc],L=(P.interactives||[]).filter(e=>e&&e.object&&e.object.parent);if(!L.length)return null;
 PFV2.set(x/innerWidth*2-1,-(y/innerHeight)*2+1);PFRC.setFromCamera(PFV2,cam);const h=PFRC.intersectObjects(L.map(e=>e.object),true)[0];if(!h)return null;for(let o=h.object;o;o=o.parent){const e=L.find(q=>q.object===o);if(e)return e}return null}
function PFpick(x,y){const e=pfHit(x,y);if(!e)return false;pfAudio();try{e.onClick&&e.onClick()}catch(err){console.error(err)}return true}
function PFhover(){const cv=document.getElementById('c');if(!cv)return;let last=0,tip=null;cv.addEventListener('pointermove',e=>{const now=performance.now();if(now-last<60)return;last=now;const h=pfHit(e.clientX,e.clientY);
  if(!tip){tip=document.createElement('div');tip.id='pftip';tip.style.cssText='position:fixed;z-index:9;pointer-events:none;padding:4px 10px;border-radius:999px;background:rgba(30,34,41,.88);color:#F7F4EB;font:600 13px/1.4 Georgia,serif;transform:translate(12px,-28px);display:none';document.body.appendChild(tip)}
  if(h){const T_=window.T||(s=>s);tip.textContent=T_(h.name)+(h.hint?' · '+T_(h.hint):'');tip.style.left=e.clientX+'px';tip.style.top=e.clientY+'px';tip.style.display='block';cv.style.cursor='pointer'}else{tip.style.display='none';cv.style.cursor=''}});cv.addEventListener('pointerleave',()=>{if(tip)tip.style.display='none'})}

// 【6. 主迴圈】
function PFfinish(){const ids=Object.keys(PFHOST);if(!ids.length)return;ids.forEach(id=>{const k=CT.findIndex(c=>c.id===id);if(k>=0)PFparticles(id,isl[k])});
 PFui();PFhover();PFlight();const old=applyTime;applyTime=function(h){old(h);PFlight()};live.push(t=>PFtick(t))}
function PFtick(t){const dt=Math.min(.1,Math.max(0,t-PFS.last));PFS.last=t;const h=PFtime(dt),n=PFnightOf(h);PFweather(dt);const umb=PFW.rain>.5;
 for(const id in PFHOST){const P=PFHOST[id],pt=PFS.parts[id];try{if(Math.abs(n-P._n)>.004||P._n===undefined){P._n=n;P.setNight(n)}
  const wk=[PFW.sun,PFW.cloud,PFW.rain,PFW.snow,PFS.cover].map(v=>v.toFixed(2)).join();if(wk!==P._w){P._w=wk;P.setWeather({sun:PFW.sun,cloud:PFW.cloud,rain:PFW.rain,snow:PFW.snow,snowCover:PFS.cover})}
  if(P._u!==umb){P._u=umb;P.persons.forEach(z=>z.setUmbrella(umb))}P.update(t,dt);P.carriages.forEach(c=>c.update(t,1))}catch(e){console.error('[platform]',id,e);delete PFHOST[id]}
  if(pt){pt.rm.opacity=PFW.rain*.75;pt.sm.opacity=PFW.snow*.95;pt.step(t,dt)}}}
