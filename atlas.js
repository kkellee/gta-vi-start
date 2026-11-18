'use strict';
const atlasGet = s => document.querySelector(s);
const atlasEscape = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function atlasRead(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function atlasSave(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
const menuButton=atlasGet('#vi-menu-button'),menu=atlasGet('#vi-menu');
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');}
menuButton.addEventListener('click',()=>{menu.hidden=!menu.hidden;menuButton.setAttribute('aria-expanded',String(!menu.hidden));});
document.addEventListener('click',event=>{if(!menu.contains(event.target)&&!menuButton.contains(event.target))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){closeMenu();menuButton.focus();}});
document.querySelectorAll('.close-dialog').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
function silhouette(type){
 const shapes={
 car:'<path d="M20 65 35 45h35l20-25h65l30 25 35 10v25H20Z"/><path d="m80 44 17-17h49l24 17Z"/><circle cx="62" cy="78" r="17"/><circle cx="183" cy="78" r="17"/><path d="M112 48v20m-85-9h20m145 0h20"/>',
 van:'<path d="M25 24h155l30 30v28H20V34Z"/><path d="M37 34h36v24H37Zm46 0h36v24H83Zm48 0h36l24 24h-60Z"/><circle cx="57" cy="82" r="16"/><circle cx="177" cy="82" r="16"/>',
 heli:'<path d="M78 43h70l40 30-30 10H77L44 49 15 42v-9l70 20Z"/><path d="M120 43V21M50 18h150M80 91h105m-85-11v11m59-10v10M140 48l25 23h-35V48Z"/>',
 truck:'<path d="M20 45h120v30H20Zm120-20h45l30 30v27h-75Z"/><path d="M152 34h25l20 21h-45Z"/><circle cx="58" cy="80" r="17"/><circle cx="178" cy="80" r="17"/>',
 rifle:'<path d="M15 42h48l16-10h91v13h50v8h-60l-10 15h-28l-8-12H82L66 80H50l8-27-43 12Z"/><path d="M112 56v28h21l-5-28M80 30v-9h32v9m45 3v-12h10v12"/>',
 melee:'<path d="m45 85 140-65 12 13-139 68Z"/><path d="m42 77 18 25m12-40 15 26"/>',
 grenade:'<path d="M100 30h38l18 20v36l-18 18h-38L82 86V50Z"/><path d="M108 30V17h21v13m0-12h35v36M89 56h60M89 76h60M111 37v60m17-60v60"/>'
 };
 return '<svg viewBox="0 0 240 120" aria-hidden="true">'+(shapes[type]||shapes.car)+'</svg>';
}
document.querySelectorAll('.platform-tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.platform-tab').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});atlasGet('#cheat-platform').textContent=b.dataset.platform.toUpperCase();}));
if(atlasGet('#task-form')){
 let tasks=atlasRead('start-goals',[]);if(!Array.isArray(tasks))tasks=[];
 function render(){atlasGet('#task-progress').textContent=tasks.filter(t=>t.done).length+' / '+tasks.length+' выполнено';atlasGet('#task-empty').hidden=!!tasks.length;atlasGet('#task-list').innerHTML=tasks.map(t=>'<label class="task-row '+(t.done?'done':'')+'"><input type="checkbox" data-task="'+t.id+'" '+(t.done?'checked':'')+'><span>'+atlasEscape(t.name)+'</span><button type="button" data-delete="'+t.id+'" aria-label="Удалить цель: '+atlasEscape(t.name)+'">×</button></label>').join('');}
 atlasGet('#task-form').addEventListener('submit',e=>{e.preventDefault();const name=atlasGet('#task-name').value.trim();if(!name)return;tasks.push({id:crypto.randomUUID(),name,done:false});atlasSave('start-goals',tasks);atlasGet('#task-name').value='';render();});
 atlasGet('#task-list').addEventListener('change',e=>{const t=tasks.find(t=>t.id===e.target.dataset.task);if(t){t.done=e.target.checked;atlasSave('start-goals',tasks);render();}});
 atlasGet('#task-list').addEventListener('click',e=>{const b=e.target.closest('[data-delete]');if(b){e.preventDefault();tasks=tasks.filter(t=>t.id!==b.dataset.delete);atlasSave('start-goals',tasks);render();}});
 render();
}
if(atlasGet('#map-stage')){
 const stage=atlasGet('#map-stage'),canvas=atlasGet('#map-canvas'),image=atlasGet('#map-underlay');
 let pins=atlasRead('start-map-pins',[]);if(!Array.isArray(pins))pins=[];
 let scale=1,panX=0,panY=0,adding=false,currentId=null,pendingPosition={x:50,y:50},imageReady=false;
 let dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open('gta-start-map',1);req.onupgradeneeded=()=>req.result.createObjectStore('assets');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
 async function dbRead(){const db=await dbPromise;return new Promise((resolve,reject)=>{const req=db.transaction('assets').objectStore('assets').get('underlay');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
 async function dbSave(blob){const db=await dbPromise;return new Promise((resolve,reject)=>{const tx=db.transaction('assets','readwrite');tx.objectStore('assets').put(blob,'underlay');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
 let imageUrl;
 function showImage(blob){if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=URL.createObjectURL(blob);image.src=imageUrl;}
 function fit(){if(!imageReady)return;const width=stage.clientWidth,height=stage.clientHeight,ratio=image.naturalWidth/image.naturalHeight;let w=width,h=w/ratio;if(h>height){h=height;w=h*ratio;}canvas.style.width=w+'px';canvas.style.height=h+'px';canvas.style.left=(width-w)/2+'px';canvas.style.top=(height-h)/2+'px';transform();}
 image.onload=()=>{imageReady=true;image.hidden=false;atlasGet('#map-placeholder').hidden=true;atlasGet('#add-pin').disabled=false;fit();};
 image.onerror=()=>{atlasGet('#map-message').textContent='Не удалось прочитать изображение.';};
 dbRead().then(blob=>{if(blob)showImage(blob);}).catch(()=>{atlasGet('#map-message').textContent='Хранилище карты недоступно. Загруженное изображение будет работать до закрытия страницы.';});
 new ResizeObserver(fit).observe(stage);
 function transform(){canvas.style.transform='translate('+panX+'px,'+panY+'px) scale('+scale+')';}
 function savePins(){if(!atlasSave('start-map-pins',pins))atlasGet('#map-message').textContent='Не удалось сохранить отметки. Экспортируй их в JSON.';}
 function selected(){const q=atlasGet('#map-search').value.trim().toLocaleLowerCase('ru'),cat=atlasGet('#map-filter').value,hide=atlasGet('#hide-found').checked;return pins.filter(p=>(cat==='all'||p.category===cat)&&(!hide||!p.found)&&(p.name+' '+p.note).toLocaleLowerCase('ru').includes(q));}
 function render(){const shown=selected();atlasGet('#map-count').textContent='Отметок: '+shown.length+' / '+pins.length;atlasGet('#pin-list').innerHTML=shown.map(p=>'<button class="pin-list-button '+(p.found?'done':'')+'" data-pin="'+p.id+'">'+atlasEscape(p.name)+'<small>'+atlasEscape(p.category)+(p.found?' · найдено':'')+'</small></button>').join('');atlasGet('#map-pins').innerHTML=shown.map(p=>'<button class="map-pin '+(p.found?'found':'')+'" style="left:'+p.x+'%;top:'+p.y+'%" data-pin="'+p.id+'" aria-label="'+atlasEscape(p.name)+'">'+(p.found?'✓':'•')+'</button>').join('');}
 function openPin(id,pos){currentId=id;const p=pins.find(p=>p.id===id);pendingPosition=pos||{x:p?.x||50,y:p?.y||50};atlasGet('#pin-dialog-title').textContent=p?'Изменить отметку':'Новое место';atlasGet('#pin-name').value=p?.name||'';atlasGet('#pin-category').value=p?.category||'Другое';atlasGet('#pin-note').value=p?.note||'';atlasGet('#pin-found').checked=p?.found||false;atlasGet('#pin-dialog').showModal();}
 function clickPin(e){const b=e.target.closest('[data-pin]');if(b){e.stopPropagation();openPin(b.dataset.pin);}}
 atlasGet('#pin-list').addEventListener('click',clickPin);atlasGet('#map-pins').addEventListener('click',clickPin);
 atlasGet('#pin-form').addEventListener('submit',e=>{e.preventDefault();const name=atlasGet('#pin-name').value.trim();if(!name)return;const p={id:currentId||crypto.randomUUID(),name,category:atlasGet('#pin-category').value,note:atlasGet('#pin-note').value.trim(),found:atlasGet('#pin-found').checked,...pendingPosition};if(currentId)pins=pins.map(old=>old.id===currentId?p:old);else pins.push(p);savePins();render();atlasGet('#pin-dialog').close();});
 ['#map-search','#map-filter','#hide-found'].forEach(s=>atlasGet(s).addEventListener(s==='#map-search'?'input':'change',render));
 atlasGet('#map-image').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>8*1024*1024){atlasGet('#map-message').textContent='Нужен PNG, JPEG или WebP размером до 8 МБ.';return;}showImage(f);scale=1;panX=panY=0;try{await dbSave(f);atlasGet('#map-message').textContent='Карта сохранена в этом браузере.';}catch{atlasGet('#map-message').textContent='Карта открыта, но сохранить её не удалось.';}});
 atlasGet('#zoom-in').addEventListener('click',()=>{scale=Math.min(5,scale*1.25);transform();});
 atlasGet('#zoom-out').addEventListener('click',()=>{scale=Math.max(.5,scale/1.25);transform();});
 atlasGet('#zoom-reset').addEventListener('click',()=>{scale=1;panX=panY=0;transform();});
 atlasGet('#map-full').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await stage.requestFullscreen();}catch{atlasGet('#map-message').textContent='Полноэкранный режим не поддерживается.';}});
 atlasGet('#add-pin').addEventListener('click',()=>{adding=!adding;atlasGet('#add-pin').textContent=adding?'Нажми на место на карте':'＋ Добавить отметку';canvas.style.cursor=adding?'crosshair':'grab';});
 let drag=null;
 canvas.addEventListener('pointerdown',e=>{if(e.target.closest('button')||!imageReady)return;if(adding){const r=canvas.getBoundingClientRect();openPin(null,{x:Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100)),y:Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100))});adding=false;atlasGet('#add-pin').textContent='＋ Добавить отметку';canvas.style.cursor='grab';return;}drag={x:e.clientX,y:e.clientY,px:panX,py:panY};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(drag){panX=drag.px+e.clientX-drag.x;panY=drag.py+e.clientY-drag.y;transform();}});
 canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
 stage.addEventListener('keydown',e=>{if(e.target!==stage)return;if(e.key==='Enter'&&adding&&imageReady){e.preventDefault();openPin(null,{x:50,y:50});adding=false;atlasGet('#add-pin').textContent='＋ Добавить отметку';}else if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();panX+=(e.key==='ArrowLeft'?30:e.key==='ArrowRight'?-30:0);panY+=(e.key==='ArrowUp'?30:e.key==='ArrowDown'?-30:0);transform();}});
 function download(name,content){const url=URL.createObjectURL(new Blob([content],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 atlasGet('#export-pins').addEventListener('click',()=>download('gta-vi-start-marks.json',JSON.stringify({version:1,pins},null,2)));
 atlasGet('#import-pins').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>1024*1024)throw Error();const data=JSON.parse(await f.text());if(data.version!==1||!Array.isArray(data.pins)||data.pins.length>1000)throw Error();const valid=data.pins.map(p=>{if(typeof p.name!=='string'||!p.name.trim()||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>100||p.y<0||p.y>100)throw Error();return{id:crypto.randomUUID(),name:p.name.slice(0,80),category:['Магазины','Оружие','Транспорт','Миссии','Другое'].includes(p.category)?p.category:'Другое',note:String(p.note||'').slice(0,1200),found:p.found===true,x:p.x,y:p.y};});pins.push(...valid);savePins();render();atlasGet('#map-message').textContent='Добавлено отметок: '+valid.length;}catch{atlasGet('#map-message').textContent='Не удалось импортировать файл. Нужен JSON экспорта Start.';}});
 render();
}
