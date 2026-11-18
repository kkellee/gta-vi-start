'use strict';
(()=>{
 const controls={'#world-add':'pin','#world-reset':'map','#world-fullscreen':'globe','#world-export':'box','#world-show-all':'map','#world-hide-all':'map','#place-save':'check','#place-show':'pin','#delete-place':'pin','#detect':'globe','#only-favorites':'star','#load-more':'arrow'};
 function decorate(node,icon){if(!node)return;node.classList.add('control-icon');node.style.setProperty('--control-picture','url("data:image/svg+xml,'+encodeURIComponent(startIcon(icon).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ').replace('currentColor','#ffffff'))+'")');}
 for(const [selector,icon]of Object.entries(controls))decorate(document.querySelector(selector),icon);
 for(const [selector,icon]of [['#catalog-search','search'],['#catalog-maker','car'],['#catalog-sort','mission'],['#world-search','search'],['#country-search','search'],['#country','globe'],['#zone','clock'],['#store-zone','clock'],['#knowledge-search','search']]){
 const input=document.querySelector(selector);if(!input)continue;const label=input.closest('label')||document.querySelector('label[for="'+input.id+'"]');if(label){const span=document.createElement('span');span.className='label-icon';span.innerHTML=startIcon(icon);label.prepend(span);}
 }
 const radio=document.querySelector('.radio-symbol');if(radio)radio.innerHTML=startIcon('radio');
 const placeholder=document.querySelector('.map-cross');if(placeholder)placeholder.innerHTML=startIcon('map');
})();
