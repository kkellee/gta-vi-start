'use strict';
(()=>{
 const el=document.querySelector('#world-map');if(!el)return;const q=s=>document.querySelector(s),esc=atlasEscape,data=window.START_MAP_DATA;
 if(!window.L||!data){q('#world-message').textContent='The map could not load. Refresh the page or check your connection.';return;}
 const cats=new Map(data.categories.map(c=>[c.id,c]));
 const groupColors={'shops':'#b67aff','properties':'#4bd5bc','collectibles':'#ffd76e','spawn-locations':'#f68c9e','activities':'#8fb2ff','local-places':'#eab99a','personal':'#ffffff'};
 const symbols={'ammu-nation':'A','bank':'$','clothing':'T','convenience-store':'S','food-and-drink':'F','gas-station':'G','vehicle-dealer':'V','vehicle-mod-shop':'⚒','city-town':'◆','landmark':'◈','police-station':'P','hospital':'+','bar':'G','nightclub':'♫','public-transport':'↔','personal':'★'};
 let state=atlasRead('start-world-state',{});if(!state||typeof state!=='object'||Array.isArray(state))state={};
 state.found=Array.isArray(state.found)?state.found:[];state.favorites=Array.isArray(state.favorites)?state.favorites:[];state.notes=state.notes&&typeof state.notes==='object'?state.notes:{};state.custom=Array.isArray(state.custom)?state.custom.filter(p=>typeof p.id==='string'&&typeof p.name==='string'&&Number.isFinite(p.x)&&Number.isFinite(p.y)):[];
 let enabled=new Set(data.categories.map(c=>c.id).concat('personal')),adding=false,current=null;
 const crs=L.extend({},L.CRS.Simple,{transformation:new L.Transformation(1/32,512,-1/32,512)});
 const map=L.map(el,{crs,minZoom:-1,maxZoom:6,zoomSnap:1,zoomControl:false,maxBounds:[[-13000,-15000],[15000,13000]],maxBoundsViscosity:.8});
 L.control.zoom({position:'topright'}).addTo(map);
 map.attributionControl.setPrefix(false);
 const tileRows=new Map();
 const LocalTiles=L.TileLayer.extend({createTile(coords,done){const img=document.createElement('img');img.alt='';img.setAttribute('role','presentation');const key=coords.z+'/'+coords.y;let request=tileRows.get(key);if(!request){request=fetch('../assets/tiles/'+key+'.json').then(r=>{if(!r.ok)throw Error('Tile row '+r.status);return r.json();});tileRows.set(key,request);}img.onload=()=>done(null,img);img.onerror=()=>done(Error('Tile image'),img);request.then(row=>{if(!row[coords.x])throw Error('Tile missing');img.src=row[coords.x];}).catch(error=>done(error,img));return img;}});
 const tiles=new LocalTiles('',{tileSize:256,minZoom:-1,minNativeZoom:0,maxNativeZoom:3,noWrap:true,bounds:[[-9088,-11008],[11008,10112]],attribution:'Map: <a href="https://gtadb.org" target="_blank" rel="noopener">gtadb.org and contributors</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a> · adapted by Start'}).addTo(map);
 let errors=0;tiles.on('tileerror',()=>{if(++errors>=3)q('#world-message').textContent='Some map tiles are unavailable. Markers and search still work; try refreshing the page.';});
 map.fitBounds([[-8050,-9650],[9500,2500]]);
 const layer=L.markerClusterGroup({maxClusterRadius:36,showCoverageOnHover:false,disableClusteringAtZoom:5,spiderfyOnMaxZoom:true,iconCreateFunction:cluster=>L.divIcon({className:'world-cluster',html:'<span>'+cluster.getChildCount()+'</span>',iconSize:[38,38]})}).addTo(map),layers=new Map();
 const all=()=>[...data.markers,...state.custom];
 const catName=p=>cats.get(p.category)?.name||'My places';
 function save(){if(!atlasSave('start-world-state',state))q('#world-message').textContent='Could not save progress. Download a backup.';}
 function selected(){const search=q('#world-search').value.trim().toLocaleLowerCase('en');return all().filter(p=>enabled.has(p.category)&&(!q('#world-hide-found').checked||!state.found.includes(p.id))&&(!q('#world-only-favorites').checked||state.favorites.includes(p.id))&&(p.name+' '+catName(p)+' '+(state.notes[p.id]||'')).toLocaleLowerCase('en').includes(search));}
 function renderCategories(){q('#world-categories').innerHTML=data.groups.map(g=>{const items=data.categories.filter(c=>c.group===g.id&&data.markers.some(p=>p.category===c.id));return '<details open><summary>'+esc(g.name)+'</summary>'+items.map(c=>'<label class="map-category"><input type="checkbox" data-category="'+c.id+'" '+(enabled.has(c.id)?'checked':'')+'><span>'+esc(c.name)+'</span><small>'+data.markers.filter(p=>p.category===c.id).length+'</small></label>').join('')+'</details>';}).join('')+'<label class="map-category"><input type="checkbox" data-category="personal" '+(enabled.has('personal')?'checked':'')+'><span>My places</span><small>'+state.custom.length+'</small></label>';}
 function markerIcon(p){const found=state.found.includes(p.id),group=cats.get(p.category)?.group||'personal';return L.divIcon({className:'world-marker '+(found?'is-found':''),html:'<span style="--pin-color:'+groupColors[group]+'">'+(found?'✓':symbols[p.category]||'•')+'</span>',iconSize:[28,28],iconAnchor:[14,14]});}
 function render(){layer.clearLayers();layers.clear();const visible=selected();for(const p of visible){const marker=L.marker([p.y,p.x],{icon:markerIcon(p),title:p.name,alt:p.name,keyboard:true}).addTo(layer);marker.on('click',()=>open(p));layers.set(p.id,marker);}
  q('#world-count').textContent=visible.length+' / '+all().length+' places';q('#world-progress').textContent='Found: '+all().filter(p=>state.found.includes(p.id)).length;
  q('#world-results').innerHTML=visible.map(p=>'<button type="button" data-place="'+esc(p.id)+'"><span>'+esc(p.name)+'</span><small>'+esc(catName(p))+(state.found.includes(p.id)?' · ✓':'')+'</small></button>').join('')||'<p class="small">No matching places. Change your search or filters.</p>';
 }
 function open(p){current=p;q('#place-name').textContent=p.name;q('#place-category').textContent=catName(p);const photo=q('#place-image');photo.hidden=!p.image;if(p.image)photo.src=p.image;else photo.removeAttribute('src');photo.alt=p.name;
  q('#place-description').textContent=p.description||'No detailed description yet.';q('#place-custom-name-label').hidden=p.category!=='personal';q('#place-custom-name').value=p.name;q('#place-found').checked=state.found.includes(p.id);q('#place-favorite').checked=state.favorites.includes(p.id);q('#place-note').value=state.notes[p.id]||'';q('#delete-place').hidden=p.category!=='personal';q('#place-dialog').showModal();history.replaceState(null,'','#'+encodeURIComponent(p.id));}
 function focus(p){map.setView([p.y,p.x],Math.max(3,map.getZoom()));open(p);}
 q('#world-results').addEventListener('click',e=>{const b=e.target.closest('[data-place]');if(b){const p=all().find(p=>p.id===b.dataset.place);if(p)focus(p);}});
 q('#world-categories').addEventListener('change',e=>{const id=e.target.dataset.category;if(!id)return;e.target.checked?enabled.add(id):enabled.delete(id);render();});
 q('#world-show-all').addEventListener('click',()=>{enabled=new Set(data.categories.map(c=>c.id).concat('personal'));renderCategories();render();});
 q('#world-hide-all').addEventListener('click',()=>{enabled.clear();renderCategories();render();});
 ['#world-search','#world-hide-found','#world-only-favorites'].forEach(s=>q(s).addEventListener(s==='#world-search'?'input':'change',render));
 q('#place-save').addEventListener('click',()=>{if(!current)return;if(current.category==='personal')current.name=q('#place-custom-name').value.trim().slice(0,100)||'My place';for(const [key,id]of [['found','#place-found'],['favorites','#place-favorite']]){state[key]=state[key].filter(v=>v!==current.id);if(q(id).checked)state[key].push(current.id);}state.notes[current.id]=q('#place-note').value.slice(0,2000);save();render();q('#place-dialog').close();});
 q('#place-show').addEventListener('click',()=>{if(current)map.setView([current.y,current.x],4);q('#place-dialog').close();});
 q('#delete-place').addEventListener('click',()=>{if(current?.category!=='personal')return;state.custom=state.custom.filter(p=>p.id!==current.id);save();renderCategories();render();q('#place-dialog').close();});
 q('#place-dialog').addEventListener('close',()=>history.replaceState(null,'',location.pathname+location.search));
 q('#world-add').addEventListener('click',()=>{adding=!adding;q('#world-add').textContent=adding?'Cancel adding':'＋ My place';q('#world-message').textContent=adding?'Click a location on the map.':' ';el.style.cursor=adding?'crosshair':'';});
 map.on('click',e=>{if(!adding)return;adding=false;q('#world-add').textContent='＋ My place';el.style.cursor='';const p={id:'personal-'+crypto.randomUUID(),name:'My place',category:'personal',x:e.latlng.lng,y:e.latlng.lat,description:''};state.custom.push(p);save();renderCategories();render();open(p);q('#world-message').textContent='Personal marker added. Enter a name and any notes.';});
 q('#world-reset').addEventListener('click',()=>map.fitBounds([[-8050,-9650],[9500,2500]]));
 q('#world-fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await q('#world-workspace').requestFullscreen();}catch{q('#world-message').textContent='Your browser does not support full-screen mode.';}});
 new ResizeObserver(()=>map.invalidateSize()).observe(el);
 q('#world-export').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,state},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='gta-vi-start-map-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 q('#world-import').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2000000)throw Error();const input=JSON.parse(await file.text());if(input.version!==1||!input.state||!Array.isArray(input.state.custom)||input.state.custom.length>1000)throw Error();const next=input.state;
  if(!Array.isArray(next.found)||!Array.isArray(next.favorites)||!next.notes||typeof next.notes!=='object')throw Error();
  const custom=next.custom.map(p=>{if(typeof p.id!=='string'||!p.id.startsWith('personal-')||typeof p.name!=='string'||!Number.isFinite(p.x)||!Number.isFinite(p.y)||Math.abs(p.x)>32768||Math.abs(p.y)>32768)throw Error();return{id:p.id.slice(0,80),name:p.name.slice(0,100),category:'personal',x:p.x,y:p.y,description:''};});
  const allowed=new Set([...data.markers,...state.custom,...custom].map(p=>p.id));state.custom=[...new Map([...state.custom,...custom].map(p=>[p.id,p])).values()];for(const k of ['found','favorites'])state[k]=[...new Set([...state[k],...next[k].filter(id=>typeof id==='string'&&allowed.has(id))])];for(const [id,note]of Object.entries(next.notes))if(allowed.has(id)&&typeof note==='string')state.notes[id]=note.slice(0,2000);save();renderCategories();render();q('#world-message').textContent='Progress merged with your existing markers.';
 }catch{q('#world-message').textContent='Could not import the file. Choose a Start map JSON export.';}e.target.value='';});
 renderCategories();render();let linked='';try{linked=decodeURIComponent(location.hash.slice(1));}catch{}const p=all().find(p=>p.id===linked);if(p)focus(p);
})();
