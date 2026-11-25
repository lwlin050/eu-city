// scene2.js — 依四幅水彩畫（布拉格夕照、維也納春日、布達佩斯夜景、布拉提斯拉瓦秋雨）重新設計城市場景：
// 地標建築、街屋、樹木、河岸步道（煤氣燈、鐵欄杆）、遊船、新藝術綠色公廁亭、各城電車塗裝、街景小品、行人與馬車。
// 本檔須在 app.js 之前載入；所有函式都在 app.js 建場景時才被呼叫，因此可以使用 app.js 的 bx、cn、cy、DM、M、BM、win、inst 等。
const S2G={},S2A=[],S2SK=[0xf1c9a5,0xe0ac82,0xc68863,0x8d5a3c],S2SH=[0xe8574a,0x3f7fc0,0xf2b632,0x4fa36a,0x8a5fb0,0xf4f1e8,0x2f3a4f],S2PN=[0x2f3a4f,0x3b4a6a,0x6a5a4a,0x222222],S2HR=[0x2a1d14,0x5a3a22,0xc9a050,0x1a1a1a];
let S2LT=0;
function S2T(t){const dt=Math.min(.1,Math.max(0,t-S2LT));S2LT=t;for(const f of S2A)f(t,dt)}
function s2tex(key,w,h,draw){if(!S2G[key]){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;t.wrapS=t.wrapT=THREE.RepeatWrapping;S2G[key]=t}return S2G[key]}
function gableGeo(){if(!S2G.gable){const s=new THREE.Shape();s.moveTo(-.5,0);s.lineTo(.5,0);s.lineTo(0,1);s.lineTo(-.5,0);const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false});g.translate(0,0,-.5);g.computeVertexNormals();S2G.gable=g}return S2G.gable}
// 山形屋頂：橫向寬 w、高 h、屋脊方向長 d（未旋轉時屋脊沿 z）
function gab(G,w,h,d,col,x,y,z,ry,mat){const m=new THREE.Mesh(gableGeo(),mat||M(col));m.scale.set(w,h,d);m.position.set(x,y,z);m.rotation.y=ry||0;m.castShadow=m.receiveShadow=true;G.add(m);return m}
const S2UP=new THREE.Vector3(0,1,0);
function beam(G,a,b,r,col,mat){const A=new THREE.Vector3(a[0],a[1],a[2]),B=new THREE.Vector3(b[0],b[1],b[2]),d=B.clone().sub(A),L=d.length();const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,5),mat||M(col));m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(S2UP,d.normalize());m.castShadow=true;G.add(m);return m}
function sign2(G,txt,bg,fg,w,h,x,y,z,ry){const H=Math.max(32,Math.round(256*h/w)),t=s2tex('sg|'+txt+'|'+bg+'|'+fg,256,H,(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.strokeStyle=fg;c.globalAlpha=.55;c.lineWidth=4;c.strokeRect(5,5,W-10,H-10);c.globalAlpha=1;c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';let fs=Math.floor(H*.6);const F=()=>c.font='bold '+fs+'px Georgia,"Times New Roman",serif';F();while(c.measureText(txt).width>W-28&&fs>8){fs--;F()}c.fillText(txt,W/2,H/2+2)});
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=ry||0;G.add(m);return m}
// 斜紋屋瓦（聖史蒂芬、馬加什教堂的彩色磁磚屋頂）
function patMat(key,cols,rx,ry){const t=s2tex('pat|'+key,64,64,(x,w,h)=>{x.fillStyle=cols[0];x.fillRect(0,0,w,h);for(let r=0;r<8;r++){x.fillStyle=cols[1+(r%(cols.length-1))];x.beginPath();for(let c=0;c<=8;c++)x[c?'lineTo':'moveTo'](c*8,r*8+(c%2?0:4));for(let c=8;c>=0;c--)x.lineTo(c*8,r*8+(c%2?0:4)+3.2);x.fill()}});t.repeat.set(rx||2,ry||2);return new THREE.MeshStandardMaterial({map:t,roughness:.6})}
function stripeMat(a,b){const t=s2tex('st|'+a+b,64,16,(x,w,h)=>{for(let i=0;i<8;i++){x.fillStyle=i%2?b:a;x.fillRect(i*8,0,8,h)}});return new THREE.MeshStandardMaterial({map:t,side:THREE.DoubleSide,roughness:.8})}
const S2LAMP=new THREE.MeshBasicMaterial({color:0xffd98a});
function gasLamp(G,x,z,h){h=h||.55;cy(G,.016,.024,h,6,0x26352e,x,h/2,z);cy(G,.035,.035,.03,6,0x26352e,x,h,z);const L=new THREE.Mesh(new THREE.BoxGeometry(.065,.085,.065),S2LAMP);L.position.set(x,h+.055,z);G.add(L);cn(G,.06,.06,4,0x26352e,x,h+.125,z,Math.PI/4)}
function umbTable(G,x,z,col){cy(G,.012,.012,.36,5,0x6a5a4a,x,.18,z);const u=cn(G,.2,.08,10,col,x,.4,z);u.castShadow=true;cy(G,.07,.07,.02,12,0xf4efe6,x,.16,z);cy(G,.012,.012,.15,5,0x555555,x,.08,z);[0,2.1,4.2].forEach(a=>bx(G,.06,.09,.06,0x8a5a35,x+Math.cos(a)*.13,.045,z+Math.sin(a)*.13))}
function sitter(G,i,x,z,ry){const Z=mkPerson(S2SK[i%4],S2SH[(i*3+2)%7],S2PN[i%4],S2HR[(i+1)%4],i%4,0xc8553d,i%3===1?'skirt':undefined,null);Z.g.position.set(x,-.06,z);Z.g.rotation.y=ry;Z.l[0].rotation.x=Z.l[1].rotation.x=-1.45;Z.k[0].rotation.x=Z.k[1].rotation.x=1.45;Z.a[0].rotation.x=Z.a[1].rotation.x=-.7;G.add(Z.g);const o=i*1.7;S2A.push(t=>{Z.hd.rotation.y=Math.sin(t*.6+o)*.35;Z.a[0].rotation.x=-.7+Math.max(0,Math.sin(t*.9+o))*.5});return Z}

// ---------- 新藝術風格綠色公廁亭（四幅畫共同元素） ----------
function S2kiosk(G,s,x,z){const K=new THREE.Group();K.position.set(x||0,0,z||0);K.scale.setScalar(s||1);G.add(K);const gr=0x3e7a5c;
 cy(K,.2,.21,.06,8,0x2c5a44,0,.03,0);cy(K,.19,.19,.18,8,gr,0,.15,0);cy(K,.195,.195,.2,8,0xcfe8da,0,.34,0);
 for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8;bx(K,.025,.42,.025,gr,Math.cos(a)*.19,.27,Math.sin(a)*.19).rotation.y=-a}
 cy(K,.25,.22,.05,8,gr,0,.47,0);DM(K,.2,0x4a8a68,0,.49,0).scale.y=.9;cy(K,.04,.05,.08,8,0x4a8a68,0,.7,0);cn(K,.03,.1,6,0xd9b24a,0,.78,0);
 const wc=s2tex('wcplate',64,32,(c,w,h)=>{c.fillStyle='#f6f1e4';c.fillRect(0,0,w,h);c.strokeStyle='#2c5a44';c.lineWidth=3;c.strokeRect(2,2,w-4,h-4);c.fillStyle='#22332b';c.font='bold 22px Georgia,serif';c.textAlign='center';c.textBaseline='middle';c.fillText('WC',w/2,h/2+1)});
 [0,Math.PI].forEach(a=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(.16,.08),new THREE.MeshBasicMaterial({map:wc,side:THREE.DoubleSide}));p.position.set(Math.sin(a)*.235,.42,Math.cos(a)*.235);p.rotation.y=a;K.add(p)});
 bx(K,.1,.22,.01,0x2c5a44,0,.15,.192);return K}

// ---------- 街屋：立面窗戶貼圖＋山形屋頂，配色取自畫作 ----------
const S2HP={p:{w:[0xf2e2c0,0xe9c98a,0xf0d2b8,0xf3e7c8,0xe6d6a8],r:[0xb84a32,0xc95a3a,0xa8422e,0xd06a45]},
 v:{w:[0xf1e6cc,0xeadbb8,0xf4ead8,0xe3d3b0,0xf0d9c0],r:[0x6f7f80,0x5f8a7c,0xa04a36,0x7a6f68]},
 b:{w:[0xf0e4c8,0xe8d0a8,0xead8c0,0xf2e8d0,0xd9c7a0],r:[0xa8503a,0x6a6f78,0x8a5a3a,0xb85a3a]},
 k:{w:[0xf3e3b0,0xf0d4bc,0xf4ecd8,0xe8d8a8,0xf2dccb],r:[0xc1503a,0xd0623f,0xb04a34]},
 c:{w:[0xf3e8d0,0xf0dcc0,0xe8f0e0,0xf6e6c8],r:[0xb83a3a,0xc8553d,0xa8452e]}};
function facMat(rows){return new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85,map:s2tex('fac'+rows,128,128,(x,w,h)=>{x.fillStyle='#ebe5d9';x.fillRect(0,0,w,h);const rh=(h-10)/rows;for(let r=0;r<rows;r++)for(let c=0;c<3;c++){const X=14+c*38,Y=10+r*rh+rh*.18,H=rh*.6;x.fillStyle='#ffffff';x.fillRect(X-4,Y-4,28,H+8);x.fillStyle='#34445e';x.fillRect(X,Y,20,H);x.fillStyle='#ffffff';x.fillRect(X+9,Y,2,H);x.fillRect(X,Y+H*.42,20,2)}x.fillStyle='rgba(60,40,20,.18)';x.fillRect(0,0,w,5);x.fillRect(0,h-4,w,4)})})}
function S2houses(g,id,pick,rn,MW){const pal=S2HP[id]||S2HP.p,P2=[],P3=[],all=[];
 pick(20,.5,1.15,false,.85,700).forEach(p=>{const h={x:p.x,z:p.z,w:.34+rn()*.22,d:.28+rn()*.14,h:.26+rn()*.34,ry:rn()*6.283,wc:pal.w[Math.floor(rn()*pal.w.length)],rc:pal.r[Math.floor(rn()*pal.r.length)],ch:rn()<.55};h.h>.44?P3.push(h):P2.push(h);all.push(h)});
 const box=new THREE.BoxGeometry(1,1,1),B=h=>({x:h.x,y:.33+h.h/2,z:h.z,sx:h.w,sy:h.h,sz:h.d,ry:h.ry,col:h.wc});
 if(P2.length)inst(g,box,facMat(2),P2.map(B));if(P3.length)inst(g,box,facMat(3),P3.map(B));if(!all.length)return;
 inst(g,gableGeo(),MW,all.map(h=>({x:h.x,y:.33+h.h,z:h.z,sx:h.w+.07,sy:.15+h.w*.28,sz:h.d+.07,ry:h.ry,col:h.rc})));
 const cs=all.filter(h=>h.ch).map(h=>{const ox=h.w*.22,oz=h.d*.18,c=Math.cos(h.ry),s=Math.sin(h.ry);return{x:h.x+ox*c+oz*s,y:.33+h.h+.1,z:h.z-ox*s+oz*c,sx:.05,sy:.16,sz:.05,ry:h.ry,col:0x9a5a44}});if(cs.length)inst(g,box,MW,cs)}

// ---------- 樹：布拉格綠蔭、維也納七葉樹花、布達佩斯深綠、布拉提斯拉瓦秋葉 ----------
const S2TP={p:[0x5f9a4a,0x6fae58,0x4f8a42,0x7cb862],v:[0x6aa456,0x5f9a4a,0x78b060],b:[0x3f7a3e,0x4f8a48,0x5a9a50],k:[0xe08a2a,0xd9a030,0xc8602a,0xe8b040,0x9aa840]};
function S2trees(g,id,ts,MW){if(!ts.length)return;inst(g,new THREE.CylinderGeometry(.05,.07,.4,6),MW,ts.map(t=>({x:t.x,y:.33+.2*t.s,z:t.z,sx:t.s,sy:t.s,sz:t.s,col:0x7a5638})));
 const pal=S2TP[id];if(!pal){inst(g,new THREE.ConeGeometry(.28,.7,7),MW,ts.map(t=>({x:t.x,y:.33+.65*t.s,z:t.z,sx:t.s,sy:t.s,sz:t.s,col:t.c})));return}
 const ico=new THREE.IcosahedronGeometry(.27,1);inst(g,ico,MW,ts.map((t,i)=>({x:t.x,y:.33+.6*t.s,z:t.z,sx:t.s*1.1,sy:t.s,sz:t.s*1.1,col:pal[i%pal.length]})));
 inst(g,ico,MW,ts.map((t,i)=>({x:t.x+.1*t.s,y:.33+.82*t.s,z:t.z-.06*t.s,sx:t.s*.62,sy:t.s*.58,sz:t.s*.62,col:pal[(i+1)%pal.length]})));
 if(id==='v'){const bl=[];ts.forEach((t,i)=>{for(let j=0;j<9;j++){const a=j*.7+i,r=(.16+(j%3)*.06)*t.s;bl.push({x:t.x+Math.cos(a)*r,y:.33+(.62+(j%4)*.08)*t.s,z:t.z+Math.sin(a)*r,sx:t.s*1.4,sy:t.s*1.4,sz:t.s*1.4,col:j%2?0xfff6f8:0xf6c6d4})}});inst(g,new THREE.ConeGeometry(.035,.1,5),MW,bl)}
 if(id==='k'){const lv=[];ts.forEach((t,i)=>{for(let j=0;j<5;j++){const a=j*1.3+i*.7,r=.3+((j*37)%10)/25;lv.push({x:t.x+Math.cos(a)*r,y:.345,z:t.z+Math.sin(a)*r,sx:1,sy:.15,sz:1,col:[0xe08a2a,0xc8602a,0xe8b040][j%3]})}});inst(g,new THREE.SphereGeometry(.035,5,4),MW,lv)}}

// ---------- 河岸步道：煤氣燈、鑄鐵欄杆、遊船 ----------
function s2resample(pts,step){const o=[];let acc=0;o.push(pts[0]);for(let i=1;i<pts.length;i++){let a=pts[i-1],b=pts[i],s=Math.hypot(b[0]-a[0],b[1]-a[1]);while(acc+s>=step){const f=(step-acc)/s;a=[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f];o.push(a);s=Math.hypot(b[0]-a[0],b[1]-a[1]);acc=0}acc+=s}return o}
function S2river(g,id,D){const rv=RVP[id];if(!rv)return;const ok=(x,z,rr,pr)=>D.roadD(x,z)>rr&&D.pinD(x,z)>pr&&(!D.vg||Math.hypot(x-D.vg.x,z-D.vg.z)>1.15)&&(!D.pz||Math.hypot(x-D.pz.x,z-D.pz.z)>1.6);
 const P=s2resample(rv.map(p=>[p.x,p.z]),.2),N=P.map((p,i)=>{const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return[-dz/l,dx/l]});
 const MW=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.7}),posts=[],rails=[],lp=[];
 [-1,1].forEach(sd=>{let prev=null;P.forEach((p,i)=>{const x=p[0]+N[i][0]*sd*.37,z=p[1]+N[i][1]*sd*.37;if(Math.hypot(x,z)<6.05&&ok(x,z,.3,.45)){posts.push({x,y:.33+.05,z,sx:1,sy:1,sz:1,col:0x2c3a34});if(prev&&prev.i===i-1){const mx=(x+prev.x)/2,mz=(z+prev.z)/2,L=Math.hypot(x-prev.x,z-prev.z);[.085,.045].forEach(h=>rails.push({x:mx,y:.33+h,z:mz,sx:1,sy:1,sz:L,ry:Math.atan2(x-prev.x,z-prev.z),col:0x2c3a34}))}prev={x,z,i}}else prev=null});
  P.forEach((p,i)=>{if(i%5!==(sd>0?0:2)||i%10>=5===(sd>0))return;const x=p[0]+N[i][0]*sd*.48,z=p[1]+N[i][1]*sd*.48;if(Math.hypot(x,z)<5.95&&ok(x,z,.32,.55))lp.push({x,z})})});
 if(posts.length)inst(g,new THREE.BoxGeometry(.014,.1,.014),MW,posts);if(rails.length)inst(g,new THREE.BoxGeometry(.01,.01,1),MW,rails);
 if(lp.length){inst(g,new THREE.CylinderGeometry(.014,.022,.55,6),MW,lp.map(l=>({x:l.x,y:.33+.275,z:l.z,col:0x26352e})));const lm=new THREE.InstancedMesh(new THREE.BoxGeometry(.06,.08,.06),S2LAMP,lp.length),d=new THREE.Object3D();lp.forEach((l,i)=>{d.position.set(l.x,.33+.6,l.z);d.updateMatrix();lm.setMatrixAt(i,d.matrix)});g.add(lm);inst(g,new THREE.ConeGeometry(.055,.06,4),MW,lp.map(l=>({x:l.x,y:.33+.67,z:l.z,ry:Math.PI/4,col:0x26352e})))}
 const route=P.filter(p=>Math.hypot(p[0],p[1])<5.6);if(route.length<8)return;(id==='b'?[0,.5]:[.2]).forEach((o,j)=>S2boat(g,id,route,o,j))}
function S2boat(g,id,route,off,j){const B=new THREE.Group();g.add(B);(S2G.boats||(S2G.boats=[])).push({id,B});const hull=({p:0xf4f1e8,v:0xf4f1e8,b:0xf4f1e8,k:0xf4f1e8,c:0x8a5a35})[id];
 bx(B,.62,.07,.2,hull,0,.04,0);bx(B,.62,.025,.205,0x23405e,0,.015,0);const bw=cy(B,.115,.115,.07,3,hull,.31,.04,0);bw.rotation.y=Math.PI/2;bw.scale.set(1,1,.87);
 bx(B,.42,.08,.16,0xf7f4ec,-.04,.12,0);const wn=new THREE.Mesh(new THREE.BoxGeometry(.4,.035,.165),id==='b'?S2LAMP:GLS);wn.position.set(-.04,.125,0);B.add(wn);bx(B,.46,.015,.18,0x9a2f2a,-.04,.168,0);
 cy(B,.006,.006,.12,4,0x555555,-.24,.23,0);bx(B,.05,.03,.004,id==='p'||id==='c'?0xd0342c:id==='v'?0xd0242a:id==='b'?0x3f8a4a:0x2f5fa0,-.215,.27,0);
 B.traverse(o=>{o.castShadow=false});B.scale.setScalar(.95);
 const n=route.length,L=[0];for(let i=1;i<n;i++)L.push(L[i-1]+Math.hypot(route[i][0]-route[i-1][0],route[i][1]-route[i-1][1]));const T=L[n-1],sp=.22,per=2*(T/sp+3);let hd=null;
 S2A.push(t=>{let u=((t+off*per+j*7)%per)/per*2,dir=1;if(u>1){u=2-u;dir=-1}const tw=T/sp/(T/sp+3),f=Math.max(0,Math.min(1,(u-(1-tw)/2)/tw)),e=f*f*(3-2*f),s=e*T;let i=1;while(i<n-1&&L[i]<s)i++;const a=route[i-1],b=route[i],k=(s-L[i-1])/((L[i]-L[i-1])||1);
  B.position.set(a[0]+(b[0]-a[0])*k,.33,a[1]+(b[1]-a[1])*k);const want=Math.atan2(-(b[1]-a[1])*dir,(b[0]-a[0])*dir);if(hd===null)hd=want;let dd=want-hd;while(dd>Math.PI)dd-=6.283;while(dd<-Math.PI)dd+=6.283;hd+=dd*.04;B.rotation.y=hd;B.position.y=.33+Math.sin(t*1.7+j)*.006})}

// ---------- 各城電車塗裝 ----------
const S2TR={p:{lo:0xc8312c,band:0xf1e6c8,top:0xc8312c,roof:0xe9e0cc},v:{lo:0xd0242a,band:0xf4efe2,top:0xd0242a,roof:0xf4efe2},b:{lo:0xf2c230,band:0xf7f1dc,top:0xf2c230,roof:0x9a9a96},k:{lo:0xc8322e,band:0xf1e6c8,top:0xf1e6c8,roof:0xc8322e}};
function S2tram(id){const C=S2TR[id]||S2TR.p,mk=front=>{const G=new THREE.Group();
 bx(G,.74,.13,.22,C.lo,0,.15,0);bx(G,.74,.02,.225,C.band,0,.225,0);const w=bx(G,.74,.075,.215,0,0,.272,0);w.material=GLS;
 for(let i=-3;i<=3;i++)bx(G,.012,.075,.222,C.top,i*.105,.272,0);bx(G,.74,.03,.222,C.top,0,.325,0);bx(G,.72,.02,.2,C.roof,0,.35,0);
 [-.37,.37].forEach(x=>{const e=cy(G,.11,.11,.13,12,C.lo,x,.15,0);e.scale.x=.4;const e2=cy(G,.105,.105,.075,12,0,x,.272,0);e2.material=GLS;e2.scale.x=.4;const e3=cy(G,.11,.11,.03,12,C.top,x,.325,0);e3.scale.x=.4});
 if(id==='b')bx(G,.745,.012,.226,0xffffff,0,.21,0);
 [-.22,.22].forEach(o=>{bx(G,.2,.04,.17,0x2a2a2a,o,.06,0);[-.06,.06].forEach(d=>[-.1,.1].forEach(z=>{const k=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.03,10),M(0x1a1a1a));k.rotation.x=Math.PI/2;k.position.set(o+d,.04,z);G.add(k)}))});
 if(front){[-.06,.06].forEach(z=>{const h=new THREE.Mesh(new THREE.SphereGeometry(.018,8,6),S2LAMP);h.position.set(.415,.17,z);G.add(h)});bx(G,.02,.035,.12,0x1d2a3a,.415,.31,0);
  beam(G,[-.05,.36,0],[.04,.44,0],.006,0x333333);beam(G,[.13,.36,0],[.04,.44,0],.006,0x333333);bx(G,.03,.008,.16,0x333333,.04,.445,0)}
 G.traverse(o=>{o.castShadow=false});return G};return[mk(1),mk(0)]}

// ---------- 地標（依畫作重新建模） ----------
const LMK2={
// 布拉格
'布拉格城堡':G=>{bx(G,1.5,.3,.3,0xf1e6cc,0,.23,.22);gab(G,.34,.14,1.54,0,0,.38,.22,Math.PI/2,M(0xb5503a));for(let i=0;i<7;i++){win(G,-.6+i*.2,.2,.375);win(G,-.6+i*.2,.31,.375)}
 bx(G,.95,.38,.26,0x8f8a80,-.05,.27,-.14);gab(G,.28,.26,.97,0,-.05,.46,-.14,Math.PI/2,M(0x44525a));
 [-.08,-.2].forEach(z=>{bx(G,.11,.62,.11,0x8a857a,-.52,.39,z);cn(G,.085,.5,4,0x3f4a48,-.52,.95,z,Math.PI/4);cn(G,.012,.06,4,0xd9b24a,-.52,1.23,z)});
 bx(G,.2,.78,.2,0x8a857a,.24,.47,-.14);cy(G,.1,.11,.12,8,0x5f8a74,.24,.92,-.14);DM(G,.1,0x5f8a74,.24,.98,-.14);cn(G,.04,.22,8,0x5f8a74,.24,1.17,-.14);
 for(let i=0;i<4;i++)beam(G,[-.35+i*.18,.46,-.02],[-.35+i*.18,.3,.05],.012,0x8a857a)},
'查理大橋':G=>{const st=0xb8a888,dk=0x3a3a38;bx(G,1.6,.06,.26,st,0,.36,0);[-.12,.12].forEach(z=>bx(G,1.6,.05,.03,0xa89878,0,.415,z));
 [-.5,-.17,.17,.5].forEach(x=>bx(G,.1,.33,.28,0xa89878,x,.17,0));[-.335,0,.335].forEach(x=>{const a=new THREE.Mesh(new THREE.TorusGeometry(.12,.03,6,12,Math.PI),M(0xa89878));a.position.set(x,.2,0);a.scale.z=4.5;G.add(a)});
 for(let i=0;i<6;i++)[-.125,.125].forEach(z=>{const x=-.55+i*.22;cy(G,.014,.018,.08,6,dk,x,.47,z);const h=new THREE.Mesh(new THREE.SphereGeometry(.018,6,5),M(dk));h.position.set(x,.52,z);G.add(h)});
 const tw=(x,h,r)=>{bx(G,.24,h,.3,0x857a68,x,h/2+.04,0);bx(G,.25,.2,.12,0x3a2f28,x,.2,0);cn(G,r,.36,4,0x343a40,x,h+.22,0,Math.PI/4);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>cn(G,.025,.14,4,0x343a40,x+q[0]*.1,h+.1,q[1]*.12,Math.PI/4));cn(G,.01,.06,4,0xd9b24a,x,h+.44,0)};
 tw(-.8,.82,.22);tw(.8,.7,.2);bx(G,.14,.46,.18,0x857a68,.95,.27,-.06);cn(G,.12,.24,4,0x343a40,.95,.62,-.06,Math.PI/4)},
'舊城廣場與天文鐘':G=>{bx(G,.3,1.02,.3,0x9a9080,-.28,.59,0);cn(G,.21,.36,4,0x3a4248,-.28,1.28,0,Math.PI/4);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>cn(G,.03,.18,4,0x3a4248,-.28+q[0]*.13,1.18,q[1]*.13,Math.PI/4));
 const d=cy(G,.1,.1,.02,20,0x1f3a6a,-.28,.6,.155);d.rotation.x=Math.PI/2;const r=new THREE.Mesh(new THREE.TorusGeometry(.105,.012,6,20),M(0xd9b24a));r.position.set(-.28,.6,.165);G.add(r);const d2=cy(G,.07,.07,.02,16,0xd9b24a,-.28,.4,.155);d2.rotation.x=Math.PI/2;
 bx(G,.46,.42,.3,0xe8d9b8,.12,.29,.02);gab(G,.32,.18,.48,0,.12,.5,.02,Math.PI/2,M(0xb5503a));for(let i=0;i<3;i++)win(G,-.02+i*.14,.32,.175);
 [.24,.46].forEach(x=>{bx(G,.1,.72,.1,0x6a6460,x,.44,-.28);cn(G,.085,.36,4,0x343a40,x,.98,-.28,Math.PI/4);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>cn(G,.018,.1,4,0x343a40,x+q[0]*.05,.86,-.28+q[1]*.05,Math.PI/4))});bx(G,.18,.3,.12,0xd9cbb0,.35,.23,-.28)},
'佩特任瞭望塔':G=>{const c=0x8a3a2e,mt=M(c);for(let i=0;i<8;i++){const a=i*Math.PI/4;beam(G,[Math.cos(a)*.24,.08,Math.sin(a)*.24],[Math.cos(a)*.05,1.55,Math.sin(a)*.05],.012,0,mt)}
 [.3,.6,.9,1.2].forEach(y=>{const r=.24-(.19*(y-.08)/1.47);const t=new THREE.Mesh(new THREE.TorusGeometry(r,.01,4,8),mt);t.rotation.x=Math.PI/2;t.position.y=y;G.add(t);for(let i=0;i<8;i+=2){const a=i*Math.PI/4,b=a+Math.PI/2,r2=.24-(.19*(y+.3-.08)/1.47);beam(G,[Math.cos(a)*r,y,Math.sin(a)*r],[Math.cos(b)*r2,y+.3,Math.sin(b)*r2],.006,0,mt)}});
 cy(G,.13,.13,.03,8,c,0,.62,0);cy(G,.1,.1,.03,8,c,0,1.28,0);cy(G,.06,.06,.1,8,0xb8bec6,0,1.6,0);cn(G,.065,.1,8,c,0,1.7,0);cy(G,.006,.006,.12,4,0x555555,0,1.8,0);bx(G,.3,.12,.2,0xe6d2a8,0,.14,.25)},
'聖尼古拉教堂':G=>{bx(G,.6,.4,.38,0xece2cc,0,.28,0);gab(G,.6,.13,.06,0,0,.48,.19,0,M(0xece2cc));cy(G,.17,.18,.18,14,0xece2cc,0,.57,-.06);DM(G,.19,0x5f9a80,0,.66,-.06).scale.y=1.2;cy(G,.035,.04,.1,8,0xece2cc,0,.9,-.06);cn(G,.04,.12,8,0x5f9a80,0,1.01,-.06);
 bx(G,.16,.62,.16,0xece2cc,.36,.39,.12);cy(G,.07,.07,.07,8,0xece2cc,.36,.73,.12);DM(G,.09,0x5f9a80,.36,.77,.12);cn(G,.035,.16,8,0x5f9a80,.36,.93,.12)},
// 維也納
'國家歌劇院':G=>{const sd=0xe6d2a8,cu=0x5f9a86;bx(G,1.3,.32,.6,sd,0,.24,0);bx(G,.86,.27,.13,0xe9d8b0,0,.215,.36);
 for(let i=0;i<5;i++){bx(G,.11,.12,.01,0x4a3a2a,-.34+i*.17,.15,.428);bx(G,.09,.07,.01,0x5a4a3a,-.34+i*.17,.29,.428)}
 gab(G,.62,.2,1.2,0,0,.4,.02,Math.PI/2,M(cu));cn(G,.09,.1,4,cu,-.62,.45,.02,Math.PI/4);cn(G,.09,.1,4,cu,.62,.45,.02,Math.PI/4);bx(G,.6,.64,.42,sd,0,.4,-.16);gab(G,.62,.22,.44,0,0,.72,-.16,0,M(cu));
 [-.36,.36].forEach(x=>{const H=new THREE.Group();H.position.set(x,.4,.36);G.add(H);bx(H,.1,.045,.035,0x3d4a40,0,.04,0);bx(H,.03,.06,.03,0x3d4a40,.05,.08,0);[-.035,.035].forEach(a=>bx(H,.012,.05,.03,0x3d4a40,a,0,0));bx(H,.02,.05,.02,0x3d4a40,-.01,.09,0)});
 [-.58,.58].forEach(x=>{bx(G,.18,.3,.5,sd,x,.2,0);cn(G,.2,.12,4,cu,x,.41,0,Math.PI/4).scale.z=1.6})},
'聖史蒂芬大教堂':G=>{const sd=0xcfc2a6;bx(G,.9,.34,.34,sd,-.05,.25,0);gab(G,.36,.42,.92,0,-.05,.42,0,Math.PI/2,patMat('ste',['#2f5a4a','#e2b23a','#1d2a2a','#f4efe2'],3,2));
 bx(G,.2,.62,.2,0xc9bb9e,.33,.39,.2);cy(G,.1,.12,.15,8,0xc9bb9e,.33,.77,.2);cn(G,.12,1.0,8,0xc9bb9e,.33,1.34,.2);cn(G,.01,.08,4,0xd9b24a,.33,1.88,.2);for(let i=0;i<4;i++){const a=i*Math.PI/2+.78;cn(G,.018,.14,4,0xc9bb9e,.33+Math.cos(a)*.11,.92,.2+Math.sin(a)*.11)}
 bx(G,.16,.44,.16,0xc9bb9e,.33,.3,-.2);DM(G,.085,0x5f8a74,.33,.52,-.2);cn(G,.02,.08,6,0x5f8a74,.33,.64,-.2);
 [-.06,.06].forEach(z=>{bx(G,.08,.5,.08,sd,-.54,.33,z*2);cn(G,.05,.22,8,sd,-.54,.69,z*2)})},
'卡爾教堂':G=>{const w=0xece4d2,cu=0x4f9a80;bx(G,.5,.3,.32,w,0,.23,-.04);bx(G,.42,.26,.14,w,0,.21,.24);gab(G,.44,.12,.16,0,0,.34,.24,0,M(w));for(let i=0;i<6;i++)cy(G,.018,.018,.24,6,0xf4efe2,-.18+i*.072,.2,.32);
 cy(G,.2,.22,.24,16,w,0,.48,-.06);const d=DM(G,.23,cu,0,.6,-.06);d.scale.y=1.35;cy(G,.04,.05,.1,8,w,0,.94,-.06);cn(G,.045,.14,8,cu,0,1.06,-.06);
 [-.36,.36].forEach(x=>{cy(G,.05,.055,.74,10,0xe6dcc6,x,.45,.22);cy(G,.07,.07,.03,10,0xe6dcc6,x,.83,.22);cn(G,.04,.14,6,cu,x,.92,.22);for(let k=0;k<5;k++){const t=new THREE.Mesh(new THREE.TorusGeometry(.053,.007,4,10),M(0xd6ccb4));t.rotation.x=Math.PI/2;t.position.set(x,.2+k*.13,.22);G.add(t)}});
 [-.52,.52].forEach(x=>{bx(G,.14,.38,.14,w,x,.27,-.02);DM(G,.07,cu,x,.46,-.02)})},
'普拉特與大摩天輪':G=>{const rd=0xb8322a,mt=M(rd),W=new THREE.Group();W.position.y=.98;G.add(W);const R=.68;
 [-.05,.05].forEach(z=>{const t=new THREE.Mesh(new THREE.TorusGeometry(R,.016,6,40),mt);t.position.z=z;W.add(t);const t2=new THREE.Mesh(new THREE.TorusGeometry(R*.82,.008,4,32),mt);t2.position.z=z;W.add(t2)});
 for(let i=0;i<16;i++){const a=i/16*6.283;[-.05,.05].forEach(z=>beam(W,[0,0,z],[Math.cos(a)*R,Math.sin(a)*R,z],.005,0,mt))}cy(W,.05,.05,.14,10,0x5a2a22,0,0,0).rotation.x=Math.PI/2;
 [[-.42,-.18],[.42,-.18],[-.42,.18],[.42,.18]].forEach(q=>beam(G,[q[0],.08,q[1]],[0,.98,q[1]>0?.08:-.08],.016,0,M(0x6a2a24)));
 const cab=[];for(let i=0;i<15;i++){const c=new THREE.Group();bx(c,.11,.08,.09,i%3?0xc8322e:0xf4efe2,0,-.06,0);bx(c,.12,.015,.1,0x4a2a24,0,-.015,0);const g2=new THREE.Mesh(new THREE.BoxGeometry(.112,.03,.092),GLS);g2.position.y=-.055;c.add(g2);G.add(c);cab.push(c)}
 bx(G,.5,.12,.22,0xe9dfc8,0,.14,.32);gab(G,.24,.08,.52,0,0,.2,.32,Math.PI/2,M(0x6f7f80));
 S2A.push(t=>{const r=t*.09;W.rotation.z=r;cab.forEach((c,i)=>{const a=r+i/15*6.283;c.position.set(Math.cos(a)*R,.98+Math.sin(a)*R,0)})})},
// 布達佩斯
'國會大廈':G=>{const w=0xefe6d4,rd=0xb5473a;bx(G,1.6,.3,.34,w,0,.23,0);gab(G,.36,.14,1.62,0,0,.38,0,Math.PI/2,M(0x6a6f78));[-.5,-.28,.28,.5].forEach(x=>{bx(G,.14,.38,.4,w,x,.27,0);cn(G,.12,.2,4,0x6a6f78,x,.56,0,Math.PI/4).scale.z=1.4});
 for(let i=0;i<14;i++){const x=-.72+i*.111;[-.175,.175].forEach(z=>cn(G,.014,.12,4,0xf4efe2,x,.44,z))}for(let i=0;i<9;i++)win(G,-.64+i*.16,.24,.171);
 cy(G,.19,.21,.28,16,w,0,.52,0);const d=DM(G,.21,rd,0,.66,0);d.scale.y=1.5;for(let i=0;i<8;i++){const a=i*Math.PI/4;beam(G,[Math.cos(a)*.21,.66,Math.sin(a)*.21],[Math.cos(a)*.03,.97,Math.sin(a)*.03],.008,0xe6dcc4)}
 cy(G,.035,.045,.12,8,w,0,1.0,0);cn(G,.04,.36,8,rd,0,1.24,0);[-.2,.2].forEach(x=>{bx(G,.07,.56,.07,w,x,.5,0);cn(G,.055,.24,4,rd,x,.9,0,Math.PI/4)})},
'鏈橋':G=>{const st=0xd2c6a8,ch=M(0x4a4e52);bx(G,1.84,.05,.2,0xc8c0b0,0,.32,0);
 [-.42,.42].forEach(x=>{[-.1,.1].forEach(z=>bx(G,.13,.62,.07,st,x,.5,z));bx(G,.16,.15,.3,st,x,.88,0);bx(G,.18,.03,.32,0xc0b496,x,.97,0);bx(G,.17,.08,.28,st,x,.16,0)});
 [-.12,.12].forEach(z=>{const pts=[];for(let i=0;i<=24;i++){const x=-.92+i*1.84/24,ax=Math.abs(x);const y=ax<=.42?.42+.44*(x/.42)**2:.86-(.46)*((ax-.42)/.5)**.8;pts.push([x,y,z])}for(let i=1;i<pts.length;i++)beam(G,pts[i-1],pts[i],.011,0,ch);pts.forEach((p,i)=>{if(i%2===0&&p[1]>.38&&Math.abs(Math.abs(p[0])-.42)>.06)beam(G,[p[0],p[1],z],[p[0],.345,z],.003,0,ch)})});
 [-.93,.93].forEach(x=>{bx(G,.18,.3,.3,st,x,.15,0);[-.11,.11].forEach(z=>{const L=new THREE.Group();L.position.set(x,.3,z);G.add(L);bx(L,.12,.05,.05,0xc9b98c,0,.035,0);const h=new THREE.Mesh(new THREE.SphereGeometry(.03,8,6),M(0xc9b98c));h.position.set(x>0?-.06:.06,.07,0);L.add(h)})})},
'布達城堡':G=>{const w=0xe9e0c8;bx(G,1.5,.08,.5,0xc9bc9c,0,.06,.04);bx(G,1.4,.3,.34,w,0,.25,0);gab(G,.36,.12,1.42,0,0,.4,0,Math.PI/2,M(0x6a6f74));bx(G,.42,.4,.42,w,0,.3,0);for(let i=0;i<8;i++)win(G,-.62+i*.18,.28,.171);
 for(let i=0;i<12;i++){const a=i/12*6.283;cy(G,.012,.012,.16,5,0xf4efe2,Math.cos(a)*.17,.58,Math.sin(a)*.17)}cy(G,.17,.18,.18,16,w,0,.58,0);const d=DM(G,.19,0x4f9a80,0,.67,0);d.scale.y=1.3;cy(G,.035,.04,.08,8,w,0,.93,0);cn(G,.045,.14,8,0x4f9a80,0,1.03,0)},
'馬加什教堂':G=>{bx(G,.56,.3,.3,0xeee6d6,-.12,.23,0);gab(G,.32,.3,.58,0,-.12,.38,0,Math.PI/2,patMat('mat',['#c96a2a','#3f7a4a','#e3b03a','#8a3a2a'],3,2));
 bx(G,.18,.5,.18,0xf1ebdd,.26,.33,.04);bx(G,.15,.24,.15,0xf1ebdd,.26,.7,.04);cy(G,.07,.08,.14,8,0xf1ebdd,.26,.89,.04);cn(G,.08,.42,8,0xd8d2c4,.26,1.17,.04);cn(G,.008,.06,4,0xd9b24a,.26,1.41,.04);
 for(let i=0;i<4;i++){const a=i*Math.PI/2+.78;cn(G,.016,.14,4,0xf1ebdd,.26+Math.cos(a)*.09,.89,.04+Math.sin(a)*.09);cn(G,.012,.1,4,0xf1ebdd,.26+Math.cos(a)*.1,.6,.04+Math.sin(a)*.1)}},
// 布拉提斯拉瓦
'布拉提斯拉瓦城堡':G=>{const w=0xf6f3ea,rd=0xb5473a;bx(G,1.2,.1,1.0,0xc9bc9c,0,.06,0);bx(G,.8,.42,.6,w,0,.32,0);const r=cn(G,1,.24,4,rd,0,.65,0,Math.PI/4);r.scale.set(.58,1,.44);
 [[-.4,-.3],[.4,-.3],[-.4,.3],[.4,.3]].forEach(p=>{bx(G,.18,.6,.18,w,p[0],.38,p[1]);cn(G,.15,.22,4,rd,p[0],.79,p[1],Math.PI/4)});for(let i=0;i<5;i++){win(G,-.24+i*.12,.26,.302);win(G,-.24+i*.12,.42,.302)}},
'聖馬丁大教堂':G=>{const sd=0xd8c7a6;bx(G,.7,.32,.3,sd,-.1,.24,0);gab(G,.32,.28,.72,0,-.1,.4,0,Math.PI/2,M(0xb5503a));cy(G,.15,.15,.32,10,sd,-.46,.24,0);cn(G,.17,.2,10,0xb5503a,-.46,.5,0);
 bx(G,.2,.6,.2,sd,.36,.38,0);cy(G,.09,.1,.18,8,sd,.36,.77,0);cn(G,.1,.42,8,0x5f9a80,.36,1.07,0);cy(G,.04,.05,.04,8,0xe0b040,.36,1.29,0);for(let i=0;i<5;i++){const a=i/5*6.283;cn(G,.012,.035,4,0xe0b040,.36+Math.cos(a)*.04,1.325,Math.sin(a)*.04)}},
'UFO 瞭望塔':G=>{const gy=M(0x8a929a);bx(G,1.7,.04,.2,0x9aa2aa,0,.3,0);[-.13,.13].forEach(z=>beam(G,[.05,.08,z],[0,1.24,0],.03,0,gy));
 cy(G,.3,.2,.07,22,0x8a96a6,0,1.32,0);cy(G,.2,.3,.05,22,0x9aa6b6,0,1.38,0);const g2=cy(G,.29,.29,.03,22,0,0,1.33,0);g2.material=GLS;DM(G,.09,0xb8c2cc,0,1.4,0);
 const cb=M(0xdde2e6);for(let i=0;i<5;i++){const x=-.2-i*.15;[-.08,.08].forEach(z=>beam(G,[0,1.15-i*.04,0],[x,.32,z],.004,0,cb))}},
'Čumil 雕像':G=>{const br=new THREE.MeshStandardMaterial({color:0x8a6a3a,roughness:.45,metalness:.55});cy(G,.16,.16,.03,18,0x3a3a38,0,.1,0);const h=new THREE.Mesh(new THREE.SphereGeometry(.07,12,10),br);h.position.set(0,.18,0);G.add(h);
 const hm=new THREE.Mesh(new THREE.SphereGeometry(.075,12,8,0,6.283,0,1.5),br);hm.position.set(0,.2,0);G.add(hm);const b=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.012,14),br);b.position.set(0,.2,0);G.add(b);
 [-1,1].forEach(s=>{const a=new THREE.Mesh(new THREE.BoxGeometry(.05,.035,.16),br);a.position.set(s*.06,.12,.1);a.rotation.y=-s*.4;G.add(a)});const sh=new THREE.Mesh(new THREE.SphereGeometry(.1,10,6,0,6.283,0,1.2),br);sh.position.set(0,.1,-.02);sh.scale.set(1.3,.6,.8);G.add(sh);
 sign2(G,'Man at Work','#2c3a34','#f1e6c8',.34,.08,0,.32,-.18,0)},
'米歇爾門':G=>{const w=0xece4d2,cu=0x5f9a80;bx(G,.26,.8,.26,w,0,.48,0);bx(G,.14,.22,.27,0x3a2f28,0,.19,0);cy(G,.13,.14,.2,8,w,0,.98,0);const o=new THREE.Mesh(new THREE.SphereGeometry(.12,12,10),M(cu));o.position.y=1.14;o.scale.y=.8;G.add(o);
 cy(G,.06,.07,.08,8,cu,0,1.24,0);cn(G,.05,.34,8,cu,0,1.44,0);cn(G,.015,.05,4,0xe0b040,0,1.63,0);bx(G,.5,.24,.24,0xe6d6b8,.34,.16,0);gab(G,.26,.1,.52,0,.34,.28,0,Math.PI/2,M(0xb5503a))},
'藍教堂':G=>{const bl=0x9fc3e8,dk=0x3f6fb8;bx(G,.55,.32,.3,bl,-.05,.24,0);gab(G,.32,.2,.58,0,-.05,.4,0,Math.PI/2,M(dk));cy(G,.1,.11,.6,12,bl,.3,.38,0);cn(G,.13,.3,12,dk,.3,.83,0);cn(G,.01,.06,4,0xf4efe2,.3,1.0,0);
 for(let i=0;i<4;i++)bx(G,.06,.12,.01,0x2f5f9f,-.25+i*.13,.25,.152)}};

// ---------- 街景小品：取材自四幅畫 ----------
function S2spot(id,free,inPark,rn){if(!S2HP[id]||id==='c')return null;for(const th of [[1.0,1.6],[.85,1.35],[.7,1.15]])for(let t=0;t<1500;t++){const a=rn()*6.283,r=1.4+Math.sqrt(rn())*3.4,x=Math.cos(a)*r,z=Math.sin(a)*r;if(free(x,z,th[0],th[1])&&!inPark(x,z))return{x,z,ry:Math.atan2(-x,-z)+(rn()-.5)*.6}}return null}
function S2vig(g,id,vg,rn){const V=new THREE.Group();(S2G.vgw||(S2G.vgw={}))[id]=[g.position.x+vg.x,g.position.z+vg.z];V.position.set(vg.x,.33,vg.z);V.rotation.y=vg.ry;g.add(V);
 const cob=s2tex('cobble',128,128,(x,w,h)=>{x.fillStyle='#8f8676';x.fillRect(0,0,w,h);for(let r=0;r<10;r++)for(let c=0;c<10;c++){const o=r%2?6:0,v=170+((r*7+c*13)%5)*9;x.fillStyle='rgb('+v+','+(v-8)+','+(v-22)+')';x.beginPath();x.ellipse(c*13+o+6,r*13+6,5.4,5,0,0,6.283);x.fill()}});cob.repeat.set(5,5);
 const base=new THREE.Mesh(new THREE.CylinderGeometry(.98,.98,.025,32),new THREE.MeshStandardMaterial({color:0xffffff,map:cob,roughness:.95,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));base.position.y=.012;base.receiveShadow=true;V.add(base);
 const lit=(x,y,z,w,h)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),S2LAMP);m.position.set(x,y,z);V.add(m)};
 if(id==='p'){// 布拉格：老啤酒館「金虎」＋露天座＋提燈
  bx(V,.8,.5,.36,0xe6c48a,0,.25,-.42);gab(V,.42,.24,.84,0,0,.5,-.42,Math.PI/2,M(0xb84a32));bx(V,.05,.16,.05,0x9a5a44,.25,.72,-.45);
  for(let i=0;i<3;i++){lit(-.24+i*.24,.18,-.236,.13,.17);bx(V,.15,.02,.01,0xf4efe6,-.24+i*.24,.28,-.235);lit(-.24+i*.24,.38,-.236,.1,.11)}
  sign2(V,'U Zlatého Tygra','#3a2a1e','#e8c060',.56,.07,0,.29,-.232,0);beam(V,[.38,.42,-.24],[.38,.42,-.12],.01,0x2c2c2c);const ln=new THREE.Mesh(new THREE.BoxGeometry(.06,.08,.06),S2LAMP);ln.position.set(.38,.36,-.12);V.add(ln);
  umbTable(V,-.32,.18,0xf3ead0);umbTable(V,.22,.25,0xc8553d);sitter(V,0,-.45,.24,1.2);sitter(V,1,-.2,.1,-1.6);sitter(V,2,.35,.3,-1.9);gasLamp(V,-.7,.45);S2kiosk(V,.75,.66,.48)}
 else if(id==='v'){// 維也納：條紋遮陽篷咖啡館、廣告柱、地鐵亭、街頭小提琴手
  bx(V,.6,.52,.36,0xf1e3c6,-.25,.26,-.44);gab(V,.4,.18,.64,0,-.25,.52,-.44,Math.PI/2,M(0x6f7f80));for(let i=0;i<3;i++)lit(-.43+i*.18,.16,-.258,.12,.18);
  const aw=new THREE.Mesh(new THREE.PlaneGeometry(.62,.22),stripeMat('#c8322e','#fbf6ec'));aw.position.set(-.25,.33,-.18);aw.rotation.x=-1.05;V.add(aw);sign2(V,'CAFÉ','#f4ead8','#5a3a22',.3,.07,-.25,.45,-.257,0);
  [[-.45,.02],[-.12,.06]].forEach((p,i)=>{cy(V,.06,.06,.015,12,0xf8f4ea,p[0],.15,p[1]);cy(V,.008,.008,.15,5,0x333333,p[0],.075,p[1]);sitter(V,i+3,p[0]-.1,p[1]+.06,1.3)});
  cy(V,.075,.075,.32,14,0,.08,.16,.38).material=new THREE.MeshStandardMaterial({map:s2tex('litfass',64,64,(x,w,h)=>{const c=['#c8553d','#f2c230','#3f6fb0','#f4efe2','#4fa36a','#8a5fb0'];for(let i=0;i<6;i++){x.fillStyle=c[i];x.fillRect((i%3)*22,Math.floor(i/3)*32,22,32)}x.fillStyle='#222';x.font='bold 9px serif';x.fillText('OPER',4,20);x.fillText('KONZERT',24,52)}),roughness:.8});
  DM(V,.085,0x3e7a5c,.08,.32,.38);cn(V,.02,.06,6,0x3e7a5c,.08,.42,.38);
  const U=new THREE.Group();U.position.set(.5,0,-.2);V.add(U);bx(U,.42,.3,.3,0x3e7a5c,0,.15,0);bx(U,.38,.24,.31,0xf4f1e8,0,.15,0);bx(U,.44,.03,.32,0x3e7a5c,0,.315,0);const dm=DM(U,.2,0x4a8a68,0,.32,0);dm.scale.set(1.1,.45,.8);
  for(let i=0;i<5;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(.018,8,6),M(0xe0b040));s.position.set(-.16+i*.08,.27,.157);U.add(s)}bx(U,.1,.18,.01,0x3e7a5c,0,.09,.157);
  cy(U,.008,.008,.42,5,0x333333,.26,.21,.18);sign2(U,'U','#1f5aa8','#ffffff',.09,.09,.26,.45,.18,0);
  const B=mkBusker('violin');B.G.position.set(.05,.03,.05);B.G.rotation.y=.4;V.add(B.G);S2A.push(t=>B.upd(t));gasLamp(V,.74,.3);S2kiosk(V,.7,-.72,.35)}
 else if(id==='b'){// 布達佩斯：匈牙利小酒館 csárda、紅椒串、串燈
  bx(V,.7,.34,.38,0xf4ead8,0,.17,-.44);gab(V,.44,.36,.76,0,0,.34,-.44,Math.PI/2,M(0x6a4a32));[-.34,0,.34].forEach(x=>bx(V,.03,.34,.01,0x5a3a22,x,.17,-.248));bx(V,.7,.025,.01,0x5a3a22,0,.3,-.248);
  lit(-.17,.17,-.247,.12,.14);lit(.17,.17,-.247,.12,.14);bx(V,.1,.2,.01,0x4a2a1a,0,.1,-.246);sign2(V,'csárda','#5a3a22','#f4e2b0',.36,.08,0,.42,-.21,0);
  for(let s=0;s<6;s++)for(let i=0;i<5;i++){const p=new THREE.Mesh(new THREE.ConeGeometry(.014,.045,5),M(0xc0281e));p.position.set(-.3+s*.12,.31-i*.045,-.23);p.rotation.x=Math.PI;V.add(p)}
  const lp=[];for(let i=0;i<=10;i++){const f=i/10,x=-.35+f*1.0,z=-.22+f*.62,y=.42-Math.sin(f*Math.PI)*.12;lp.push([x,y,z])}lp.forEach(p=>{const b=new THREE.Mesh(new THREE.SphereGeometry(.014,6,5),S2LAMP);b.position.set(p[0],p[1],p[2]);V.add(b)});for(let i=1;i<lp.length;i++)beam(V,lp[i-1],lp[i],.002,0x333333);cy(V,.01,.01,.44,5,0x5a3a22,.65,.22,.4);
  [[-.3,.1],[.2,.12]].forEach((p,i)=>{bx(V,.3,.02,.14,0x8a5a35,p[0],.15,p[1]);[-1,1].forEach(s=>bx(V,.3,.02,.05,0x7a4a2a,p[0],.09,p[1]+s*.13));sitter(V,i*2+5,p[0]-.08,p[1]-.13,0);sitter(V,i*2+6,p[0]+.08,p[1]+.13,Math.PI)});
  gasLamp(V,-.72,.35);S2kiosk(V,.72,.7,-.3)}
 else if(id==='k'){// 布拉提斯拉瓦：葡萄酒館 Vináreň、爬藤、酒桶桌、葡萄園
  bx(V,.74,.5,.36,0xf2e2b0,.1,.25,-.44);gab(V,.42,.22,.78,0,.1,.5,-.44,Math.PI/2,M(0xc1503a));for(let i=0;i<3;i++){lit(-.12+i*.22,.17,-.258,.12,.17);lit(-.12+i*.22,.38,-.258,.09,.1)}
  sign2(V,'VINÁREŇ','#f4ecd8','#5a3a22',.4,.08,.1,.29,-.255,0);const vn=[];for(let i=0;i<70;i++){const a=(.5+i*.7548777)%1,b=(.5+i*.5698403)%1;vn.push({x:-.26+a*.74,y:.04+b*.44,z:-.255,sx:1,sy:1,sz:.5,col:[0x6a9a3a,0x8aaa40,0xd0a030,0x5a8a34][i%4]})}inst(V,new THREE.SphereGeometry(.035,6,5),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9}),vn.filter(v=>!(v.y>.1&&v.y<.24&&Math.abs(((v.x-.1+.22)%.22+.22)%.22-.11)<.07)));
  [[-.3,.12],[.1,.2],[.42,.06]].forEach((p,i)=>{cy(V,.07,.07,.17,12,0x8a5a32,p[0],.085,p[1]);[.03,.14].forEach(y=>{const r=new THREE.Mesh(new THREE.TorusGeometry(.071,.006,4,14),M(0x3a3a3a));r.rotation.x=Math.PI/2;r.position.set(p[0],y,p[1]);V.add(r)});const c=new THREE.Mesh(new THREE.BoxGeometry(.025,.035,.025),S2LAMP);c.position.set(p[0],.19,p[1]);V.add(c);if(i<2)sitter(V,i+8,p[0]+.12,p[1]+.05,-1.6)});
  const vy=[];for(let r=0;r<4;r++)for(let i=0;i<7;i++)vy.push({x:-.85+i*.07,y:.05,z:-.55+r*.14,sx:1,sy:1,sz:1,col:r%2?0x6a8a3a:0x9a9a3a});inst(V,new THREE.SphereGeometry(.04,6,5),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9}),vy);
  gasLamp(V,.74,.3);S2kiosk(V,.7,-.62,.5)}
 V.traverse(o=>{if(o.isMesh)o.castShadow=true})}

// ---------- 行人（布拉提斯拉瓦雨傘）、維也納馬車 ----------
function s2umb(Z,col){const U=new THREE.Group();U.position.set(.06,0,0);Z.g.add(U);cy(U,.006,.006,.42,4,0x333333,0,.42,0);const c=cn(U,.22,.08,10,col,0,.66,0);c.castShadow=false;return U}
function S2walk(g,id,k){const n=id==='k'?4:2,cols=[0x23324a,0x1d1d1d,0x8a2f2a,0x4a3a2a];
 for(let i=0;i<n;i++){const j=i+k*3+5,Z=mkPerson(S2SK[j%4],[0xc9b38a,0x3b4a6a,0x6a3a3a,0x8a7a5a,0x2f3a4f][j%5],S2PN[j%4],S2HR[(j*3)%4],j%4,0x1d1d1d,j%2?'skirt':undefined,id==='v'&&i===0?'dome':null);
  if(id==='k'||(id==='p'&&i===1))s2umb(Z,cols[i%4]);const w=Object.assign(mkW(id,.16+Math.random()*.08,(i%2?1:-1)*.05),{pm:18});g.add(Z.g);live.push(t=>{stepW(w,DT);const b=gait(Z,w.ph,1);Z.g.position.set(w.x,.37+b,w.z);Z.g.rotation.y=w.h})}
 if(id==='v'){const H=new THREE.Group(),br=0x6a4028;const bd=new THREE.Mesh(new THREE.CylinderGeometry(.06,.065,.26,8),M(br));bd.rotation.z=Math.PI/2;bd.position.y=.24;H.add(bd);const nk=new THREE.Mesh(new THREE.CylinderGeometry(.03,.045,.16,6),M(br));nk.position.set(.14,.31,0);nk.rotation.z=-.6;H.add(nk);
  const hd=new THREE.Mesh(new THREE.BoxGeometry(.11,.05,.05),M(br));hd.position.set(.21,.37,0);hd.rotation.z=-.4;H.add(hd);const lg=[];[[.1,.04],[.1,-.04],[-.1,.04],[-.1,-.04]].forEach(p=>{const L=new THREE.Group();L.position.set(p[0],.2,p[1]);const m=new THREE.Mesh(new THREE.CylinderGeometry(.015,.012,.2,5),M(0x3a2414));m.position.y=-.1;L.add(m);H.add(L);lg.push(L)});
  const C=new THREE.Group();bx(C,.3,.12,.2,0x1d1d1d,0,.2,0);bx(C,.14,.1,.2,0x1d1d1d,-.08,.31,0).material=GLS;[[.1,.07],[-.1,.1]].forEach(q=>[-1,1].forEach(s=>{const w=new THREE.Mesh(new THREE.TorusGeometry(q[1],.008,4,12),M(0x6a1a1a));w.position.set(q[0],q[1],s*.11);C.add(w)}));beam(C,[.15,.2,.06],[.42,.22,.06],.006,0x3a2414);beam(C,[.15,.2,-.06],[.42,.22,-.06],.006,0x3a2414);
  const D=mkPerson(S2SK[0],0x1d1d1d,0x1d1d1d,S2HR[3],0,0x1d1d1d,undefined,'dome');D.g.position.set(.1,.2,0);D.g.rotation.y=Math.PI/2;D.l[0].rotation.x=D.l[1].rotation.x=-1.4;D.k[0].rotation.x=D.k[1].rotation.x=1.4;D.g.scale.setScalar(.9);C.add(D.g);
  addVeh(g,id,[H,C],.28,1.05);S2A.push(t=>{const s=Math.sin(t*7);lg[0].rotation.z=lg[3].rotation.z=s*.4;lg[1].rotation.z=lg[2].rotation.z=-s*.4})}}

// ---------- 水彩畫風後製（墨線＋水彩暈染＋紙紋），取代卡通式的直接繪製 ----------
let S2WC=null,S2WCon=(()=>{try{return localStorage.getItem('eu_wc')!=='0'}catch(e){return true}})();
document.documentElement.classList.toggle('wc',S2WCon);
const S2WCFS=`uniform sampler2D tC,tD;uniform vec2 res;uniform float cn,cf;varying vec2 vUv;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float nz(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*nz(p);p*=2.03;a*=.5;}return v;}
float LZ(vec2 u){float z=texture2D(tD,u).x*2.-1.;return 2.*cn*cf/(cf+cn-z*(cf-cn));}
void main(){vec2 px=1./res,sp=vUv*res;
 vec2 wob=(vec2(fb(sp*.012),fb(sp*.012+17.3))-.5)*px*5.;vec2 uv=vUv+wob;
 vec3 acc=vec3(0.);float aw=0.;float jit=fb(sp*.05);
 for(int i=0;i<7;i++){float a=float(i)*.8976+jit*3.;float r=(i==0?0.:1.5+2.5*fb(sp*.03+float(i)*3.1));vec4 s=texture2D(tC,uv+vec2(cos(a),sin(a))*px*r);acc+=s.rgb*s.a;aw+=s.a;}
 vec3 col=acc/max(aw,1e-4);float al=aw/7.;
 float d=LZ(uv),dl=LZ(uv-vec2(px.x,0.)),dr=LZ(uv+vec2(px.x,0.)),du=LZ(uv+vec2(0.,px.y)),dd=LZ(uv-vec2(0.,px.y));
 float de=(abs(dl+dr-2.*d)+abs(du+dd-2.*d))/max(d,1.);float ed=smoothstep(.0035,.016,de);
 vec4 l=texture2D(tC,uv-vec2(px.x,0.)),r=texture2D(tC,uv+vec2(px.x,0.)),u=texture2D(tC,uv+vec2(0.,px.y)),b=texture2D(tC,uv-vec2(0.,px.y));
 float ce=length(r.rgb*r.a-l.rgb*l.a)+length(u.rgb*u.a-b.rgb*b.a);float ec=smoothstep(.22,.55,ce);
 float sil=abs(r.a-l.a)+abs(u.a-b.a);
 float ink=clamp(max(max(ed,ec*.75),sil*.9),0.,1.)*(.55+.45*nz(sp*.09))*(.75+.25*nz(sp*.6));
 float lu=dot(col,vec3(.299,.587,.114));col=mix(vec3(lu),col,.9);col*=vec3(1.06,1.01,.9);
 col*=.9+.2*fb(sp*.004+vec2(3.,9.));
 col*=1.-.16*smoothstep(.06,.3,ce);
 float gr=fb(sp*.35);col*=.94+.1*gr-.05*(1.-lu)*gr;
 vec3 paper=vec3(.975,.95,.885);col=mix(paper,col,.9);
 col=mix(col,vec3(.24,.17,.11),ink*.82);
 gl_FragColor=vec4(col,clamp(max(al,ink*step(.02,al+sil)),0.,1.));}`;
function S2wcInit(rd){try{return S2wcInit0(rd)}catch(e){S2WCon=false;document.documentElement.classList.remove('wc');return false}}
function S2wcInit0(rd){if(!rd.capabilities.isWebGL2&&!rd.extensions.get('WEBGL_depth_texture'))return false;
 const pr=Math.min(1.5,devicePixelRatio||1),w=Math.max(1,Math.floor(innerWidth*pr)),h=Math.max(1,Math.floor(innerHeight*pr));
 const rt=new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat});rt.depthTexture=new THREE.DepthTexture(w,h);rt.depthTexture.type=THREE.UnsignedIntType;
 const mat=new THREE.ShaderMaterial({uniforms:{tC:{value:rt.texture},tD:{value:rt.depthTexture},res:{value:new THREE.Vector2(w,h)},cn:{value:1.5},cf:{value:500}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:S2WCFS,transparent:true,depthTest:false,depthWrite:false});
 const ps=new THREE.Scene(),q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat);q.frustumCulled=false;ps.add(q);S2WC={rt,mat,ps,pc:new THREE.OrthographicCamera(-1,1,1,-1,0,1),pr};return true}
function S2resize(){if(!S2WC)return;const w=Math.max(1,Math.floor(innerWidth*S2WC.pr)),h=Math.max(1,Math.floor(innerHeight*S2WC.pr));S2WC.rt.setSize(w,h);S2WC.mat.uniforms.res.value.set(w,h)}
function S2render(rd,sc,cam){if(S2mapOn!==S2WCon)try{S2maps()}catch(e){S2mapOn=S2WCon}if(S2WCon&&(S2WC||S2wcInit(rd))){if(S2WC.ns!==signs.length){S2WC.ns=signs.length;signs.forEach(m=>{if(m.material&&m.material.depthTest===false)m.layers.set(1)})}
 S2WC.mat.uniforms.cn.value=cam.near;S2WC.mat.uniforms.cf.value=cam.far;cam.layers.set(0);rd.setRenderTarget(S2WC.rt);rd.clear();rd.render(sc,cam);rd.setRenderTarget(null);rd.clear();rd.render(S2WC.ps,S2WC.pc);
 cam.layers.set(1);const ac=rd.autoClear,bg=sc.background;rd.autoClear=false;rd.clearDepth();rd.render(sc,cam);rd.autoClear=ac;cam.layers.set(0)}else{cam.layers.enable(0);cam.layers.enable(1);rd.render(sc,cam)}}
function toggleWC(v){S2WCon=v===undefined?!S2WCon:!!v;try{localStorage.setItem('eu_wc',S2WCon?'1':'0')}catch(e){}document.documentElement.classList.toggle('wc',S2WCon);const b=document.getElementById('wcb');if(b)b.classList.toggle('on',S2WCon)}
(()=>{const b=document.getElementById('wcb');if(b)b.classList.toggle('on',S2WCon)})();
// 水彩模式的城市底圖配色：石灰、沙土、鵝卵石步道（原本的紫／藍綠底色太卡通）
const S2PCW={p:{bg:'#878368',rd:'#d8cbac',re:'#5e5040'},v:{bg:'#968866',rd:'#dccfb0',re:'#5e4c3a'},b:{bg:'#7a7468',rd:'#d2c6ae',re:'#4a4038'},k:{bg:'#80856a',rd:'#d6ccae',re:'#525038'},c:{bg:'#8c8270',rd:'#d8caac',re:'#5e4638'}};
let S2PCO=null,S2mapOn=null;
function S2maps(){if(typeof mapMats==='undefined'||mapMats.length<CT.length)return;if(!S2PCO){S2PCO={};CT.forEach(c=>S2PCO[c.id]=PC[c.id])}
 CT.forEach((c,k)=>{PC[c.id]=S2WCon?Object.assign({},S2PCO[c.id],S2PCW[c.id]||{}):S2PCO[c.id];const m=mapMats[k],old=m.map,tx=cityMap(c.id);m.map=tx;m.emissiveMap=tx;m.needsUpdate=true;if(old)old.dispose()});S2mapOn=S2WCon}
