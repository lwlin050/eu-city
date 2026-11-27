// ux.js — 介面體驗調整（在 app.js 之後載入）。移除這個檔案與 style.css 末段「UX 3.0」即可還原。
// 1. 地圖去雜訊：3D 名稱看板只顯示離鏡頭最近的幾個，已選取的地點一定顯示，全景時全部隱藏
// 2. 桌機頂部搜尋框（與清單抽屜的搜尋同步）
// 3. 設定分組標題、一次性操作提示
(()=>{
 const $=s=>document.querySelector(s),mob=()=>matchMedia('(max-width:819px)').matches;

 // ---------- 1. 名稱看板依距離顯示 ----------
 const V=new THREE.Vector3(),C=new THREE.Vector3();
 function boards(){if(typeof signs==='undefined'||typeof cam==='undefined')return;cam.getWorldPosition(C);const K=mob()?6:10,MAXD=15,list=[];
  let keep=null;if(typeof sel!=='undefined'&&sel!=null&&typeof pins!=='undefined'){const po=pins.find(o=>o.i===sel);if(po)keep=po.g}
  for(const m of signs){if(!m.material||m.material.depthTest!==false)continue;let vis=true;for(let p=m.parent;p;p=p.parent){if(p.visible===false&&p!==m){vis=false;break}}
   if(!vis){m.visible=false;continue}m.getWorldPosition(V);const d=V.distanceTo(C);let pinned=false;if(keep){for(let p=m.parent;p;p=p.parent)if(p===keep){pinned=true;break}}
   list.push({m,d,pinned})}
  list.sort((a,b)=>a.d-b.d);let n=0;for(const o of list){const show=o.pinned||(o.d<MAXD&&n<K);if(show&&!o.pinned)n++;o.m.visible=show}}
 setInterval(boards,180);

 // ---------- 2. 頂部搜尋 ----------
 const tq=$('#tq'),q=$('#q');
 if(tq&&q){tq.addEventListener('input',()=>{q.value=tq.value;if(!$('#index').classList.contains('open'))toggleIndex(true);renderIndex();tq.focus()});
  tq.addEventListener('keydown',e=>{if(e.key==='Escape'){tq.value='';q.value='';toggleIndex(false);tq.blur()}});
  q.addEventListener('input',()=>{tq.value=q.value})}
 // 手機版：點「搜尋」分頁時直接把游標放進搜尋框
 const ml=$('#m-list');if(ml)ml.addEventListener('click',()=>{if($('#index').classList.contains('open')&&mob())setTimeout(()=>q&&q.focus(),320)});

 // ---------- 3. 左側選單：常駐、不再需要 ✕ 收合 ----------
 const d=$('.dock');if(d)d.classList.remove('hide');

 // ---------- 4. 設定分組標題（語言選擇器由 i18n.js 插入，等它出現後補標題） ----------
 function langHead(){const s=$('#sub-set'),l=s&&s.querySelector('.langsel');if(!l)return false;if(!s.querySelector('.sh-lang')){const h=document.createElement('div');h.className='sh sh-lang';h.textContent=(window.T?T('語言'):'語言');s.insertBefore(h,l)}return true}
 if(!langHead()){let n=0;const iv=setInterval(()=>{if(langHead()||++n>40)clearInterval(iv)},150)}

 // ---------- 5. 一次性操作提示 ----------
 const hint=$('.hint');let seen=false;try{seen=localStorage.getItem('eu_hint')==='1'}catch(e){}
 if(hint){if(seen)hint.classList.add('gone');else{hint.classList.add('toast');const done=()=>{hint.classList.add('gone');try{localStorage.setItem('eu_hint','1')}catch(e){}};setTimeout(done,7000);const cv=$('#c');if(cv)cv.addEventListener('pointerdown',()=>setTimeout(done,1200),{once:true})}}
})();
