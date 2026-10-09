import { comparisonMarkup, startComparison } from './comparison.js';
import { beamSearchMarkup, renderBeamStage, BEAM_CAPTIONS, BEAM_MILESTONES } from './beam-search.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const catalog = [
  { name: 'Trail runner', symbol: 'shoe', color: '#d8ef62', id: ['12','07','42'] },
  { name: 'Light trail shoe', symbol: 'shoe', color: '#b6c9ac', id: ['12','07','43'] },
  { name: 'Hiking boot', symbol: 'boot', color: '#dba477', id: ['12','19','08'] },
  { name: 'Headphones', symbol: 'headphones', color: '#b6a6d7', id: ['31','05','11'] },
];
const hashes = ['#semantic-ids', '#generate', '#compare'];
const labels = ['From content to codes', 'One code at a time', 'Three routes to candidates'];
const durations = [4100, 11300, 5600];
const milestones = [0, 1700, 3700, 5700, 7800];
const captions = [
  'Read the sequence of items in the user’s history.',
  'Predict 12 using the encoded history.',
  'Predict 07 using the history + 12.',
  'Predict 42 using the history + 12, 07.',
  'Resolve the valid ID 12 · 07 · 42 to a catalog item.',
];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let sceneIndex = 0;
let selectedItem = 0;
let elapsed = 0;
let playing = false;
let lastFrame = 0;
let decoderStage = -1;
let decoderMode = 'beam';
let comparisonCleanup = () => {};
let resumeAfterDialog = false;

$('#comparison-mount').innerHTML = comparisonMarkup();
$('#beam-search-view').innerHTML = beamSearchMarkup();

function decoderMilestones() { return decoderMode === 'beam' ? BEAM_MILESTONES : milestones; }
function decoderCaptions() { return decoderMode === 'beam' ? BEAM_CAPTIONS : captions; }
function lastDecoderStage() { return decoderMilestones().length - 1; }

function renderCatalog() {
  const selected = catalog[selectedItem];
  $('#catalog-items').innerHTML = catalog.map((item,index) => `<button class="catalog-item" data-item="${index}" aria-pressed="${index === selectedItem}" aria-label="${item.name}, semantic ID ${item.id.join(', ')}"><svg aria-hidden="true" style="--shoe-color:${item.color}"><use href="#${item.symbol}-symbol"></use></svg><span class="catalog-item-label">${item.name}</span><span class="catalog-codes" aria-hidden="true">${item.id.map((code,i) => `<span class="catalog-code ${i < 2 && selected.id[i] === code ? 'shared' : ''}">${code}</span>`).join('')}</span></button>`).join('');
  $('#source-name').textContent = selected.name;
  $('#source-symbol').setAttribute('href', `#${selected.symbol}-symbol`);
  $('#product-stage svg').style.setProperty('--shoe-color', selected.color);
  $$('#semantic-tokens .token').forEach((token,i) => { token.textContent = selected.id[i]; });
  $('#catalog-insight').innerHTML = selectedItem < 2
    ? 'Related shoes share <b>12 · 07</b>.<br> The last code distinguishes the item.'
    : selectedItem === 2
    ? 'The boot shares <b>12</b> with the shoes.<br> Its finer codes take a different path.'
    : 'Different content, a different prefix.<br> This address begins with <b>31</b>.';
}

function setPlaying(value) {
  playing = value;
  document.body.classList.toggle('is-paused', !playing);
  $('.comparison-grid').classList.toggle('comparison-paused', !playing);
  $('#play-icon').textContent = playing ? 'Ⅱ' : '▷';
  $('#play-label').textContent = playing ? 'Pause' : 'Play';
  $('#play-toggle').setAttribute('aria-label', playing ? 'Pause animation' : 'Play animation');
  lastFrame = performance.now();
}

function renderDecoder(stage) {
  if (decoderStage === stage) return;
  decoderStage = stage;
  if (decoderMode === 'beam') {
    renderBeamStage(stage);
  } else {
  $$('.generated-token').forEach((token,i) => {
    const filled = stage > i;
    token.classList.toggle('filled', filled);
    token.classList.toggle('active', stage === i + 1 && stage < 4);
    token.querySelector('span').textContent = filled ? ['12','07','42'][i] : '?';
  });
  $('.generation-column').classList.toggle('has-output', stage > 0);
  $('#lookup-result').classList.toggle('visible', stage === 4);
  $('#lookup-result').setAttribute('aria-hidden', stage === 4 ? 'false' : 'true');
  }
  $('#decode-step').textContent = `${String(stage + 1).padStart(2, '0')} / ${String(lastDecoderStage() + 1).padStart(2, '0')}`;
  $('#decode-caption').textContent = decoderCaptions()[stage];
  $('#step-button').innerHTML = stage === lastDecoderStage() ? 'Start again <span aria-hidden="true">↺</span>' : 'Next step <span aria-hidden="true">→</span>';
}

function setDecoderMode(mode, autoplay = true) {
  decoderMode = mode;
  const beam = mode === 'beam';
  durations[1] = beam ? 11300 : 9400;
  labels[1] = beam ? 'Expand · score · keep the best' : 'One code at a time';
  $('#single-path-view').hidden = beam;
  $('#beam-search-view').hidden = !beam;
  $('#beam-width-label').hidden = !beam;
  $$('[data-decoder-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.decoderMode === mode)));
  $('#decoder-title').textContent = beam ? 'Keep a few promising paths.' : 'Predict a code. Then the next.';
  $('#decoder-description').textContent = beam ? 'Beam search expands the surviving prefixes, then keeps the best three across all branches.' : 'The Transformer uses the user’s history and the codes it has already generated.';
  $('#decoder-takeaway').innerHTML = beam ? 'One history. Several generated IDs. <strong>A shortlist of existing catalog items.</strong>' : 'Generate the <strong>address</strong>, then look up the item. <span class="muted">The product already exists.</span>';
  if (sceneIndex === 1) $('#playback-label').textContent = labels[1];
  restart(autoplay);
}

function restart(autoplay = true) {
  elapsed = 0;
  decoderStage = -1;
  comparisonCleanup();
  const flow = $('#encode-flow');
  const output = $('.semantic-output');
  flow.classList.remove('encoding');
  output.classList.remove('encoding');
  void flow.offsetWidth;
  if (sceneIndex === 0) {
    flow.classList.add('encoding');
    output.classList.add('encoding');
  }
  renderDecoder(0);
  if (sceneIndex === 2) comparisonCleanup = startComparison($('#comparison-mount'));
  if (reducedMotion.matches) {
    elapsed = durations[sceneIndex];
    if (sceneIndex === 1) renderDecoder(lastDecoderStage());
    setPlaying(false);
  } else setPlaying(autoplay);
}

function selectScene(index, {focus = false, updateHash = true} = {}) {
  sceneIndex = Math.max(0, Math.min(2, index));
  $$('.scene-tabs [role=tab]').forEach((tab,i) => {
    tab.setAttribute('aria-selected', String(i === sceneIndex));
    tab.tabIndex = i === sceneIndex ? 0 : -1;
  });
  $$('.scene').forEach((scene,i) => { scene.hidden = i !== sceneIndex; });
  $('#chapter-count').innerHTML = `${String(sceneIndex + 1).padStart(2,'0')} <span>/ 03</span>`;
  $('#prev-chapter').disabled = sceneIndex === 0;
  $('#next-chapter').disabled = sceneIndex === 2;
  $('#playback-label').textContent = labels[sceneIndex];
  if (updateHash) history.replaceState(null, '', hashes[sceneIndex]);
  if (focus) $$('.scene-tabs [role=tab]')[sceneIndex].focus();
  restart();
}

function frame(now) {
  if (playing && !document.hidden) {
    elapsed += Math.min(now - lastFrame, 150);
    if (sceneIndex === 1) renderDecoder(decoderMilestones().reduce((stage,time,i) => elapsed >= time ? i : stage, 0));
    if (elapsed >= durations[sceneIndex]) setPlaying(false);
  }
  lastFrame = now;
  requestAnimationFrame(frame);
}

function togglePlayback() {
  if (!playing && elapsed >= durations[sceneIndex]) restart();
  else setPlaying(!playing);
}

$('#catalog-items').addEventListener('click', event => {
  const button = event.target.closest('[data-item]');
  if (!button) return;
  selectedItem = Number(button.dataset.item);
  renderCatalog();
  restart();
  $(`[data-item="${selectedItem}"]`).focus({preventScroll:true});
});
$$('[data-scene]').forEach(button => button.addEventListener('click', () => selectScene(Number(button.dataset.scene))));
$('#next-chapter').addEventListener('click', () => selectScene(sceneIndex + 1));
$('#prev-chapter').addEventListener('click', () => selectScene(sceneIndex - 1));
$('#replay-button').addEventListener('click', () => restart());
$('#play-toggle').addEventListener('click', togglePlayback);
$$('[data-decoder-mode]').forEach(button => button.addEventListener('click', () => setDecoderMode(button.dataset.decoderMode)));
$('#present-toggle').addEventListener('click', () => {
  const active = document.body.classList.toggle('presenting');
  $('#present-toggle').setAttribute('aria-pressed', String(active));
  $('#present-toggle').innerHTML = active ? 'Exit presentation <span aria-hidden="true">↙</span>' : 'Present <span aria-hidden="true">⤢</span>';
  window.scrollTo({top:0, behavior:'instant'});
});
$('#step-button').addEventListener('click', () => {
  setPlaying(false);
  const stage = decoderStage === lastDecoderStage() ? 0 : decoderStage + 1;
  elapsed = decoderMilestones()[stage];
  renderDecoder(stage);
});
window.addEventListener('hashchange', () => { const index = hashes.indexOf(location.hash); if (index !== -1) selectScene(index, {updateHash:false}); });
document.addEventListener('keydown', event => {
  if ($('dialog[open]') || event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    selectScene(sceneIndex + (event.key === 'ArrowRight' ? 1 : -1), {focus: true});
  } else if (event.key === 'Home' && event.target.closest('[role=tablist]')) {
    event.preventDefault(); selectScene(0, {focus:true});
  } else if (event.key === 'End' && event.target.closest('[role=tablist]')) {
    event.preventDefault(); selectScene(2, {focus:true});
  } else if (event.code === 'Space' && !event.target.closest('button,a')) {
    event.preventDefault(); togglePlayback();
  }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) setPlaying(false); });
reducedMotion.addEventListener('change', () => restart(false));

function openDialog(id) {
  resumeAfterDialog = playing;
  setPlaying(false);
  $(`#${id}`).showModal();
}
$('#notes-open').addEventListener('click', () => openDialog('notes-dialog'));
$('#sources-open').addEventListener('click', () => openDialog('sources-dialog'));
$$('[data-close]').forEach(button => button.addEventListener('click', () => $(`#${button.dataset.close}`).close()));
$$('dialog').forEach(dialog => {
  dialog.addEventListener('close', () => { if (resumeAfterDialog) setPlaying(true); });
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
});

function inlineMarkdown(text) {
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g,'<em>$1</em>');
}
fetch('./presenter-notes.md').then(response => {
  if (!response.ok) throw new Error('Notes unavailable');
  return response.text();
}).then(text => {
  $('#notes-content').innerHTML = text.trim().split(/\r?\n\s*\r?\n/).map(block => {
    if (block.startsWith('# ')) return '';
    if (/^\*\*\d:\d\d/.test(block)) {
      const [heading, ...rest] = block.split(/\r?\n/);
      return `<h3>${inlineMarkdown(heading)}</h3><blockquote>${inlineMarkdown(rest.join(' '))}</blockquote>`;
    }
    if (block.startsWith('*Technical basis:')) return `<p class="muted" style="font-size:11px">${inlineMarkdown(block)}</p>`;
    return `<p>${inlineMarkdown(block).replace(/ {2}\r?\n/g,'<br>')}</p>`;
  }).join('');
}).catch(() => { $('#notes-content').innerHTML = '<p>The notes could not be loaded. Use the download link above to open the script directly.</p>'; });

renderCatalog();
labels[1] = 'Expand · score · keep the best';
selectScene(Math.max(0, hashes.indexOf(location.hash)), {updateHash:false});
requestAnimationFrame(frame);
