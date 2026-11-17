'use strict';
const KNOWLEDGE = [{"category":"Запуск","title":"Когда выходит GTA VI?","body":"В официальном расписании Rockstar указан запуск 19 ноября 2026 года в полночь по местному времени. Калькулятор учитывает выбранный часовой пояс.","source":"https://support.rockstargames.com/articles/29jV3Cv2cCgvwM1XgtMO5o/grand-theft-auto-vi-regional-pre-load-and-release-times-on-playstation-5-and-xbox-series-x-or-s?pubDate=20261110","link":"release.html","linkText":"Рассчитать своё время"},{"category":"Запуск","title":"На каких платформах?","body":"Rockstar указывает PlayStation 5 и Xbox Series X|S. Не переносим эту дату автоматически на ПК.","source":"https://www.rockstargames.com/VI"},{"category":"Мир","title":"Что такое Леонида?","body":"Леонида — штат, где разворачивается история GTA VI. Вайс-Сити — одна из его локаций.","source":"https://www.rockstargames.com/VI","link":"map.html","linkText":"Посмотреть места"},{"category":"Персонажи","title":"Кто главные герои?","body":"Джейсон и Люсия — центральные персонажи истории. Официальное описание рассказывает о неудачном деле и преступном заговоре.","source":"https://www.rockstargames.com/VI"},{"category":"Мир","title":"Где посмотреть настоящие скриншоты?","body":"В официальной галерее Rockstar. Изображения в оформлении этого сайта взяты оттуда.","source":"https://www.rockstargames.com/VI/media/screenshots"},{"category":"Запуск","title":"Регион покупки и мой часовой пояс","body":"Калькулятор переводит расписание выбранного региона покупки в твоё местное время. Получившаяся дата не гарантирует, что смена региона позволит запустить конкретную копию раньше.","source":"https://support.rockstargames.com/articles/29jV3Cv2cCgvwM1XgtMO5o/grand-theft-auto-vi-regional-pre-load-and-release-times-on-playstation-5-and-xbox-series-x-or-s?pubDate=20261110","link":"release.html","linkText":"Открыть калькулятор"}];
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
    const query=$('#knowledge-search').value.trim().toLocaleLowerCase('ru');
    const category=$('#category').value;
    const rows=KNOWLEDGE.filter(row=>(category==='all'||row.category===category)&&(row.title+' '+row.body).toLocaleLowerCase('ru').includes(query));
    $('#result-count').textContent=rows.length ? 'Найдено материалов: '+rows.length : 'Ничего не найдено. Попробуй другой запрос или категорию.';
    $('#knowledge-results').innerHTML=rows.map(row=>'<article class="knowledge-card"><p class="eyebrow dark">'+esc(row.category)+'</p><h2>'+esc(row.title)+'</h2><p>'+esc(row.body)+'</p><p class="small">Проверено 17.11.2026</p>'+(row.link?'<a class="inline-link" href="'+row.link+'">'+esc(row.linkText)+' →</a>':'')+'</article>').join('');
  }
  $('#knowledge-search').addEventListener('input',renderKnowledge);
  $('#category').addEventListener('change',renderKnowledge);
  renderKnowledge();
}
if ($('#place-photo')) {
  document.querySelectorAll('.place-button').forEach(button=>button.addEventListener('click',()=>{
    const place=button.dataset.place;
    $('#place-photo').src=PHOTOS[place];
    $('#place-photo').alt='Официальный скриншот '+button.textContent;
    $('#place-title').textContent=button.textContent;
    document.querySelectorAll('.place-button').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});
  }));
}
if ($('#region-form')) {
  try {
    const names=new Intl.DisplayNames(['ru'],{type:'region'});
    const deviceZone=Intl.DateTimeFormat().resolvedOptions().timeZone || 'Etc/UTC';
    const normalized=zone=>{try{return new Intl.DateTimeFormat('en',{timeZone:zone}).resolvedOptions().timeZone;}catch{return zone;}};
    const regions=(window.REGIONS||[]).filter(row=>{try{new Intl.DateTimeFormat('ru',{timeZone:row.zone});return true;}catch{return false;}});
    if(!regions.length) throw new Error('Список часовых поясов не загрузился. Обнови страницу.');
    const countries=[...new Set(regions.map(r=>r.country))].map(code=>({code,name:names.of(code)})).sort((a,b)=>a.name.localeCompare(b.name,'ru'));
    let detected=regions.find(row=>normalized(row.zone)===normalized(deviceZone));
    const saved=read('gta-start-region',null);
    let selectedCountry=saved&&countries.some(c=>c.code===saved.country)?saved.country:(detected?.country||'GB');
    const country=$('#country'),zone=$('#zone'),store=$('#store-zone');
    const cityNames={'Europe/Moscow':'Москва','Europe/Kaliningrad':'Калининград','Asia/Yekaterinburg':'Екатеринбург','Asia/Novosibirsk':'Новосибирск','Asia/Vladivostok':'Владивосток','Asia/Kamchatka':'Камчатка','Europe/London':'Лондон','Pacific/Auckland':'Окленд','America/New_York':'Нью-Йорк','America/Los_Angeles':'Лос-Анджелес','Asia/Tokyo':'Токио','Asia/Dubai':'Дубай','Asia/Kolkata':'Калькутта','Asia/Almaty':'Алматы','Europe/Kyiv':'Киев'};
    const label=tz=>(cityNames[tz]||tz.split('/').slice(1).join(' / ').replaceAll('_',' '))+' — '+tz;
    function fillCountries() {
      const q=$('#country-search').value.trim().toLocaleLowerCase('ru');
      const shown=countries.filter(c=>(c.name+' '+c.code).toLocaleLowerCase('ru').includes(q));
      country.replaceChildren(...shown.map(c=>new Option(c.name,c.code)));
      if(shown.some(c=>c.code===selectedCountry)) country.value=selectedCountry;
      else if(shown.length) selectedCountry=shown[0].code;
      country.disabled=!shown.length;
      if(!shown.length) { country.add(new Option('Страна не найдена','')); zone.replaceChildren();zone.disabled=true;$('#release-date').textContent='Страна не найдена';$('#countdown').textContent='';target=null;return; }
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
      const format=new Intl.DateTimeFormat('ru-RU',{timeZone:zone.value,day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
      $('#release-date').textContent=format.format(new Date(target));
      $('#release-location').textContent=names.of(country.value)+' · '+label(zone.value);
      $('#store-date').textContent='Регион покупки: '+label(storeZone)+' · 19 ноября, 00:00';
      $('#region-error').hidden=true;
      save('gta-start-region',{country:country.value,zone:zone.value,store:store.value});
      tick();
    }
    function tick(){
      if(target===null)return;
      const seconds=Math.max(0,Math.floor((target-Date.now())/1000));
      if(seconds===0){$('#countdown').textContent='Время запуска по расписанию наступило';return;}
      const days=Math.floor(seconds/86400),hours=Math.floor(seconds%86400/3600),minutes=Math.floor(seconds%3600/60),secs=seconds%60;
      $('#countdown').textContent=(days?days+' д · ':'')+[hours,minutes,secs].map(n=>String(n).padStart(2,'0')).join(' : ');
    }
    $('#country-search').addEventListener('input',fillCountries);
    country.addEventListener('change',()=>{selectedCountry=country.value;fillZones();});
    zone.addEventListener('change',update);store.addEventListener('change',update);
    $('#detect').addEventListener('click',()=>{
      if(!detected){$('#detect-note').textContent='Пояс устройства: '+deviceZone+'. Выбери страну и пояс вручную.';return;}
      $('#country-search').value='';selectedCountry=detected.country;fillCountries();fillZones(detected.zone);
      $('#detect-note').textContent='Выбран пояс устройства: '+deviceZone;
    });
    fillCountries();
    fillZones(saved?.zone||detected?.zone);
    setInterval(tick,1000);
  } catch(error) {
    $('#region-error').hidden=false;
    $('#region-error').textContent='Не удалось рассчитать время: '+error.message;
    $('#release-date').textContent='Расчёт временно недоступен';
  }
}
