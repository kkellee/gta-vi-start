'use strict';
const KNOWLEDGE = [{"category":"Launch","title":"When does GTA VI launch?","body":"The official Rockstar schedule lists 19 November 2026 at midnight local time. The calculator uses your selected time zone.","source":"https://support.rockstargames.com/articles/29jV3Cv2cCgvwM1XgtMO5o/grand-theft-auto-vi-regional-pre-load-and-release-times-on-playstation-5-and-xbox-series-x-or-s?pubDate=20261110","link":"release.html","linkText":"Calculate my release time"},{"category":"Launch","title":"Which platforms?","body":"Rockstar lists PlayStation 5 and Xbox Series X|S. We do not automatically apply this date to PC.","source":"https://www.rockstargames.com/VI"},{"category":"World","title":"What is Leonida?","body":"Leonida is the state where GTA VI takes place. Vice City is one of its locations.","source":"https://www.rockstargames.com/VI","link":"map.html","linkText":"Explore locations"},{"category":"Characters","title":"Who are the protagonists?","body":"Jason and Lucia are the central characters. The official synopsis describes a job gone wrong and a criminal conspiracy.","source":"https://www.rockstargames.com/VI"},{"category":"World","title":"Where can I see official screenshots?","body":"In the official Rockstar gallery. The site uses images from that gallery.","source":"https://www.rockstargames.com/VI/media/screenshots"},{"category":"Launch","title":"Purchase region and my time zone","body":"The calculator converts the purchase region schedule to your local time. The result does not guarantee that changing regions will let your copy launch earlier.","source":"https://support.rockstargames.com/articles/29jV3Cv2cCgvwM1XgtMO5o/grand-theft-auto-vi-regional-pre-load-and-release-times-on-playstation-5-and-xbox-series-x-or-s?pubDate=20261110","link":"release.html","linkText":"Open calculator"}];
const PHOTOS = {"city":"https://www.rockstargames.com/VI/_next/static/media/Vice_City_13.0iq8ff474tsdx.jpg?akim=1&imdensity=1&imwidth=3840","duo":"https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_01.0naeahss9-1x6.jpg?akim=1&imdensity=1&imwidth=3840","keys":"https://www.rockstargames.com/VI/_next/static/media/Leonida_Keys_07.0z9tb69ssp4rq.jpg?akim=1&imdensity=1&imwidth=3840"};
const $ = selector => document.querySelector(selector);
function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function esc(text) { return String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
function launchInstant(zone) {
  const target = Date.UTC(2026,10,19,0,0,0);
  let candidate = target;
  const format = new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  for (let i=0;i<4;i++) {
    const parts=Object.fromEntries(format.formatToParts(new Date(candidate)).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
    const represented=Date.UTC(parts.year,parts.month-1,parts.day,parts.hour,parts.minute,parts.second);
    const diff=target-represented;
    candidate+=diff;
    if(!diff) break;
  }
  return candidate;
}
if ($('#knowledge-results')) {
  function renderKnowledge() {
    const query=$('#knowledge-search').value.trim().toLocaleLowerCase('en');
    const category=$('#category').value;
    const rows=KNOWLEDGE.filter(row=>(category==='all'||row.category===category)&&(row.title+' '+row.body).toLocaleLowerCase('en').includes(query));
    $('#result-count').textContent=rows.length ? 'Articles found: '+rows.length : 'No results. Try a different search or category.';
    $('#knowledge-results').innerHTML=rows.map(row=>'<article class="knowledge-card"><p class="eyebrow dark">'+esc(row.category)+'</p><h2>'+esc(row.title)+'</h2><p>'+esc(row.body)+'</p><p class="small">Reviewed 17 November 2026</p>'+(row.link?'<a class="inline-link" href="'+row.link+'">'+esc(row.linkText)+' →</a>':'')+'</article>').join('');
  }
  $('#knowledge-search').addEventListener('input',renderKnowledge);
  $('#category').addEventListener('change',renderKnowledge);
  renderKnowledge();
}
if ($('#place-photo')) {
  document.querySelectorAll('.place-button').forEach(button=>button.addEventListener('click',()=>{
    const place=button.dataset.place;
    $('#place-photo').src=PHOTOS[place];
    $('#place-photo').alt='Official screenshot '+button.textContent;
    $('#place-title').textContent=button.textContent;
    document.querySelectorAll('.place-button').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});
  }));
}
if ($('#region-form')) {
  try {
    const names=new Intl.DisplayNames(['en'],{type:'region'});
    const deviceZone=Intl.DateTimeFormat().resolvedOptions().timeZone || 'Etc/UTC';
    const normalized=zone=>{try{return new Intl.DateTimeFormat('en',{timeZone:zone}).resolvedOptions().timeZone;}catch{return zone;}};
    const regions=(window.REGIONS||[]).filter(row=>{try{new Intl.DateTimeFormat('en',{timeZone:row.zone});return true;}catch{return false;}});
    if(!regions.length) throw new Error('Time zones could not load. Refresh the page.');
    const countries=[...new Set(regions.map(r=>r.country))].map(code=>({code,name:names.of(code)})).sort((a,b)=>a.name.localeCompare(b.name,'en'));
    let detected=regions.find(row=>normalized(row.zone)===normalized(deviceZone));
    const saved=read('gta-start-region',null);
    let selectedCountry=saved&&countries.some(c=>c.code===saved.country)?saved.country:(detected?.country||'GB');
    const country=$('#country'),zone=$('#zone'),store=$('#store-zone');
    const cityNames={'Europe/Moscow':'Moscow','Europe/Kaliningrad':'Kaliningrad','Asia/Yekaterinburg':'Yekaterinburg','Asia/Novosibirsk':'Novosibirsk','Asia/Vladivostok':'Vladivostok','Asia/Kamchatka':'Kamchatka','Europe/London':'London','Pacific/Auckland':'Auckland','America/New_York':'New York','America/Los_Angeles':'Los Angeles','Asia/Tokyo':'Tokyo','Asia/Dubai':'Dubai','Asia/Kolkata':'Kolkata','Asia/Almaty':'Almaty','Europe/Kyiv':'Kyiv'};
    const label=tz=>(cityNames[tz]||tz.split('/').slice(1).join(' / ').replaceAll('_',' '))+' — '+tz;
    function fillCountries() {
      const q=$('#country-search').value.trim().toLocaleLowerCase('en');
      const shown=countries.filter(c=>(c.name+' '+c.code).toLocaleLowerCase('en').includes(q));
      country.replaceChildren(...shown.map(c=>new Option(c.name,c.code)));
      if(shown.some(c=>c.code===selectedCountry)) country.value=selectedCountry;
      else if(shown.length) selectedCountry=shown[0].code;
      country.disabled=!shown.length;
      if(!shown.length) { country.add(new Option('Country not found','')); zone.replaceChildren();zone.disabled=true;$('#release-date').textContent='Country not found';$('#countdown').textContent='';target=null;return; }
      fillZones();
    }
    function fillZones(preferred) {
      zone.disabled=false;
      const rows=regions.filter(r=>r.country===country.value);
      zone.replaceChildren(...rows.map(r=>new Option(label(r.zone),r.zone)));
      if(preferred&&rows.some(r=>r.zone===preferred))zone.value=preferred;
      update();
    }
    for(const c of countries) {
      const group=document.createElement('optgroup');group.label=c.name;
      regions.filter(r=>r.country===c.code).forEach(r=>group.append(new Option(label(r.zone),r.zone)));
      store.append(group);
    }
    if(saved&&regions.some(r=>r.zone===saved.store)) store.value=saved.store;
    let target=null;
    function update() {
      if(!zone.value)return;
      const storeZone=store.value==='same'?zone.value:store.value;
      target=launchInstant(storeZone);
      const format=new Intl.DateTimeFormat('en-GB',{timeZone:zone.value,day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
      $('#release-date').textContent=format.format(new Date(target));
      $('#release-location').textContent=names.of(country.value)+' · '+label(zone.value);
      $('#store-date').textContent='Purchase region: '+label(storeZone)+' · 19 November, 00:00';
      $('#region-error').hidden=true;
      save('gta-start-region',{country:country.value,zone:zone.value,store:store.value});
      tick();
    }
    function tick(){
      if(target===null)return;
      const seconds=Math.max(0,Math.floor((target-Date.now())/1000));
      if(seconds===0){$('#countdown').textContent='The scheduled release time has arrived';return;}
      const days=Math.floor(seconds/86400),hours=Math.floor(seconds%86400/3600),minutes=Math.floor(seconds%3600/60),secs=seconds%60;
      $('#countdown').textContent=(days?days+' d · ':'')+[hours,minutes,secs].map(n=>String(n).padStart(2,'0')).join(' : ');
    }
    $('#country-search').addEventListener('input',fillCountries);
    country.addEventListener('change',()=>{selectedCountry=country.value;fillZones();});
    zone.addEventListener('change',update);store.addEventListener('change',update);
    $('#detect').addEventListener('click',()=>{
      if(!detected){$('#detect-note').textContent='Device time zone: '+deviceZone+'. Choose your country and time zone manually.';return;}
      $('#country-search').value='';selectedCountry=detected.country;fillCountries();fillZones(detected.zone);
      $('#detect-note').textContent='Device time zone selected: '+deviceZone;
    });
    fillCountries();
    fillZones(saved?.zone||detected?.zone);
    setInterval(tick,1000);
  } catch(error) {
    $('#region-error').hidden=false;
    $('#region-error').textContent='Could not calculate time: '+error.message;
    $('#release-date').textContent='Calculation temporarily unavailable';
  }
}
