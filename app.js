document.querySelector('#timer').textContent = 'Уточняем';
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
const spoilerButton = document.querySelector('#spoilerToggle');
let spoilers = read('vice-spoilers', false);
function renderSpoilers() {
  spoilerButton.textContent = spoilers ? '◉ Спойлеры разрешены' : '◉ Без спойлеров';
  spoilerButton.setAttribute('aria-pressed', String(!spoilers));
  document.querySelectorAll('.news-list article').forEach(item => { if(item.querySelector('.theory')) item.hidden = !spoilers; });
}
spoilerButton.addEventListener('click', () => { spoilers = !spoilers; save('vice-spoilers', spoilers); renderSpoilers(); });
renderSpoilers();
document.querySelectorAll('.check-items input').forEach((input, index) => {
  input.checked = read('vice-check-' + index, false);
  input.addEventListener('change', () => save('vice-check-' + index, input.checked));
});
const filterButton = document.querySelector('.filter-button');
filterButton.textContent = 'Только примеры';
let onlyExamples = false;
filterButton.addEventListener('click', () => {
  onlyExamples = !onlyExamples;
  document.querySelectorAll('.news-list article').forEach(item => item.hidden = onlyExamples && !item.querySelector('.confirmed'));
  if(!onlyExamples) renderSpoilers();
  filterButton.textContent = onlyExamples ? 'Все статусы' : 'Только примеры';
});
