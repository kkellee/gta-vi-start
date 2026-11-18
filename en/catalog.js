'use strict';
(()=>{
 const root=document.querySelector('[data-catalog]');if(!root)return;
 const kind=root.dataset.catalog,rows=window.START_CATALOGS?.[kind]||[],q=s=>document.querySelector(s),esc=atlasEscape;
 let category='',limit=48,onlyFavorites=false,compare=[];
 let favorites=atlasRead('start-favorites',[]);if(!Array.isArray(favorites))favorites=[];
 if(!atlasRead('start-catalog-v4-migrated',false)){const oldIds={'vehicles:coquette':'vehicles:coquette-classic','vehicles:granger':'vehicles:granger-police','weapons:bat':'weapons:baseball-bat','weapons:akm':'weapons:assault-rifle'};favorites=[...new Set(favorites.map(id=>oldIds[id]||id))];if(atlasSave('start-favorites',favorites))atlasSave('start-catalog-v4-migrated',true);}
 const key=r=>kind+':'+r.id;
 const fullName=r=>(r.maker==='Not specified'?'':r.maker+' ')+r.name;
 const cats=[...new Set(rows.flatMap(r=>r.categories))].sort((a,b)=>a.localeCompare(b,'en'));
 q('#catalog-maker').innerHTML='<option value="">All manufacturers</option>'+[...new Set(rows.map(r=>r.maker))].sort().map(x=>'<option>'+esc(x)+'</option>').join('');
 function image(r,large=false){return '<img class="'+(large?'detail-photo':'catalog-photo')+'" src="'+esc(r.image)+'" alt="'+esc(fullName(r))+'" loading="lazy" width="640" height="360">';}
 function stats(r){return [['Manufacturer',r.maker],['Class',r.category],['Real-world inspiration',r.reference||'Not specified'],...(kind==='vehicles'?[['Seats',r.seats||'No data']]:[]),['Name',r.nameUnconfirmed?'Working catalog name; in-game name needs verification':r.name],['Price','No confirmed data'],[kind==='vehicles'?'Speed':'Damage','No confirmed data']];}
 function show(r){q('#item-detail').innerHTML=image(r,true)+'<p class="eyebrow">'+esc(r.category)+'</p><h2>'+esc(fullName(r))+'</h2><table class="detail-table">'+stats(r).map(([k,v])=>'<tr><td>'+esc(k)+'</td><td>'+esc(v)+'</td></tr>').join('')+'</table><p class="detail-status">'+esc(r.imageNote)+'. Stats from previous games are not treated as GTA VI stats.</p>';q('#item-dialog').showModal();history.replaceState(null,'','#'+encodeURIComponent(r.id));}
 function render(){
  q('#catalog-filters').innerHTML=[['','All'],...cats.map(c=>[c,c])].map(([value,label])=>'<button data-category="'+esc(value)+'" class="'+(value===category?'active':'')+'" aria-pressed="'+(value===category)+'">'+esc(label)+' <small>'+rows.filter(r=>!value||r.categories.includes(value)).length+'</small></button>').join('');
  const search=q('#catalog-search').value.trim().toLocaleLowerCase('en'),maker=q('#catalog-maker').value;
  const filtered=rows.filter(r=>(!category||r.categories.includes(category))&&(!maker||r.maker===maker)&&(!onlyFavorites||favorites.includes(key(r)))&&[r.name,r.maker,r.category,r.reference].join(' ').toLocaleLowerCase('en').includes(search)).sort((a,b)=>fullName(a).localeCompare(fullName(b),'en')*(q('#catalog-sort').value==='desc'?-1:1));
  q('#catalog-count').textContent='Found '+filtered.length+' of '+rows.length;
  q('#catalog-empty').hidden=filtered.length>0;
  q('#catalog-grid').innerHTML=filtered.slice(0,limit).map(r=>'<article class="db-card"><button class="favorite-button" data-favorite="'+esc(r.id)+'" aria-label="Favorite: '+esc(fullName(r))+'" aria-pressed="'+favorites.includes(key(r))+'">'+(favorites.includes(key(r))?'★':'☆')+'</button><button class="photo-button" data-detail="'+esc(r.id)+'" aria-label="Open: '+esc(fullName(r))+'">'+image(r)+'</button><div class="db-info"><p class="card-category">'+esc(r.category)+'</p><h2>'+esc(fullName(r))+'</h2><p class="prototype">'+esc(r.reference||'Real-world inspiration not specified')+'</p><div class="card-actions"><button class="detail-button" data-detail="'+esc(r.id)+'">Details ↗</button><button class="compare-toggle" data-compare="'+esc(r.id)+'" aria-pressed="'+compare.includes(r.id)+'">'+(compare.includes(r.id)?'✓ Selected':'＋ Compare')+'</button></div></div></article>').join('');
  q('#load-more').hidden=filtered.length<=limit;
  q('#compare-bar').hidden=!compare.length;
  q('#compare-bar').innerHTML='<span>Compare: '+compare.length+' / 3</span><button class="outline" id="open-compare" '+(compare.length<2?'disabled':'')+'>Compare selected</button><button class="outline" id="clear-compare">Clear</button><span id="compare-message" role="status"></span>';
 }
 q('#catalog-grid').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.detail)show(rows.find(r=>r.id===b.dataset.detail));
  if(b.dataset.favorite){const r=rows.find(r=>r.id===b.dataset.favorite),id=key(r);favorites=favorites.includes(id)?favorites.filter(v=>v!==id):[...favorites,id];atlasSave('start-favorites',favorites);render();}
  if(b.dataset.compare){const id=b.dataset.compare;if(compare.includes(id))compare=compare.filter(v=>v!==id);else if(compare.length<3)compare.push(id);else{q('#compare-message').textContent='You can compare up to three items.';return;}render();}
 });
 q('#catalog-filters').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b){category=b.dataset.category;limit=48;render();}});
 ['#catalog-search','#catalog-maker','#catalog-sort'].forEach(s=>q(s).addEventListener(s==='#catalog-search'?'input':'change',()=>{limit=48;render();}));
 q('#only-favorites').addEventListener('click',()=>{onlyFavorites=!onlyFavorites;q('#only-favorites').setAttribute('aria-pressed',String(onlyFavorites));limit=48;render();});
 q('#load-more').addEventListener('click',()=>{limit+=48;render();});
 q('#compare-bar').addEventListener('click',e=>{if(e.target.id==='clear-compare'){compare=[];render();}if(e.target.id==='open-compare'){
  const chosen=compare.map(id=>rows.find(r=>r.id===id));
  q('#item-detail').innerHTML='<p class="eyebrow">COMPARISON</p><h2>Compare side by side</h2><div class="comparison-scroll"><table class="comparison-table"><thead><tr><th>Specification</th>'+chosen.map(r=>'<th>'+image(r)+esc(fullName(r))+'</th>').join('')+'</tr></thead><tbody>'+stats(chosen[0]).map(([label],i)=>'<tr><th>'+label+'</th>'+chosen.map(r=>'<td>'+esc(stats(r)[i][1])+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';q('#item-dialog').showModal();
 }});
 q('#item-dialog').addEventListener('close',()=>history.replaceState(null,'',location.pathname+location.search));
 render();let id='';try{id=decodeURIComponent(location.hash.slice(1));}catch{}const linked=rows.find(r=>r.id===id);if(linked)show(linked);
})();
