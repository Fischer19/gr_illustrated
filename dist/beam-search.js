export const BEAM_MILESTONES = [0, 1500, 3300, 5300, 7500, 9300];
export const BEAM_DURATION = 11300;
export const BEAM_CAPTIONS = [
  'Read the history once. Explore several possible item IDs.',
  'Start two valid prefixes. The beam can hold up to 3.',
  'Expand every prefix, then keep the best 3 across all branches.',
  'Expand again: these 3 prefixes produce 4 complete IDs.',
  'Keep the 3 highest-scoring IDs overall. Prune the fourth.',
  'Look up the 3 valid IDs to retrieve 3 candidate items.',
];

const rounds = [
  { label: 'TOKEN 1', nodes: [
    { id: 'a', code: '12', score: '.80', x: 134, y: 80, w: 84 },
    { id: 'b', code: '31', score: '.20', x: 134, y: 181, w: 84 },
  ] },
  { label: 'TOKEN 2', nodes: [
    { id: 'c', code: '12 · 07', score: '.56', x: 329, y: 49, w: 107, parent: 'a' },
    { id: 'd', code: '12 · 19', score: '.24', x: 329, y: 130, w: 107, parent: 'a' },
    { id: 'e', code: '31 · 05', score: '.20', x: 329, y: 190, w: 107, parent: 'b' },
  ] },
  { label: 'TOKEN 3', nodes: [
    { id: 'f', code: '12 · 07 · 42', score: '.308', x: 555, y: 29, w: 133, parent: 'c', result: 'Trail runner', symbol: 'shoe', color: '#d8ef62' },
    { id: 'g', code: '12 · 07 · 43', score: '.252', x: 555, y: 81, w: 133, parent: 'c', result: 'Light trail shoe', symbol: 'shoe', color: '#b6c9ac' },
    { id: 'h', code: '12 · 19 · 08', score: '.240', x: 555, y: 133, w: 133, parent: 'd', result: 'Hiking boot', symbol: 'boot', color: '#dba477' },
    { id: 'i', code: '31 · 05 · 11', score: '.200', x: 555, y: 190, w: 133, parent: 'e', pruned: true },
  ] },
];
const nodesById = Object.fromEntries(rounds.flatMap(round => round.nodes.map(node => [node.id, node])));

function treeNode(node, round) {
  return `<g class="beam-node beam-reveal${node.pruned ? ' beam-prunable' : ''}" data-beam-show="${round + 1}" data-beam-node="${node.id}" aria-hidden="true" transform="translate(${node.x} ${node.y})">
    <rect class="beam-node-box" width="${node.w}" height="43" rx="6"/>
    <text x="${node.w / 2}" y="18" text-anchor="middle" class="beam-code">${node.code}</text>
    <text x="${node.w / 2}" y="34" text-anchor="middle" class="beam-score">${node.score}</text>
    ${node.pruned ? `<path class="beam-prune-mark" d="M8 8L${node.w - 8} 35"/>` : ''}
  </g>`;
}

function treeLink(node, round) {
  const parent = nodesById[node.parent];
  const fromX = parent ? parent.x + parent.w : 52;
  const fromY = parent ? parent.y + 21.5 : 138;
  const toY = node.y + 21.5;
  const midX = (fromX + node.x) / 2;
  return `<path class="beam-branch beam-reveal${node.pruned ? ' beam-prunable' : ''}" data-beam-show="${round + 1}" aria-hidden="true" d="M${fromX} ${fromY} C${midX} ${fromY},${midX} ${toY},${node.x} ${toY}"/>`;
}

function resultNode(node, index) {
  return `<g class="beam-candidate beam-reveal" data-beam-show="5" aria-hidden="true" transform="translate(798 ${node.y})">
    <rect width="185" height="43" rx="6"/>
    <use href="#${node.symbol}-symbol" x="7" y="5" width="49" height="31" style="--shoe-color:${node.color}"/>
    <text x="65" y="25" class="beam-item-name">${node.result}</text>
    <circle cx="174" cy="-3" r="9" class="beam-rank-badge"/><text x="174" y=".5" class="beam-rank" text-anchor="middle">${index + 1}</text>
  </g>`;
}

function desktopTree() {
  const headings = [{ text: 'START', x: 35 }, { text: 'TOKEN 1', x: 176 }, { text: 'TOKEN 2', x: 382 }, { text: 'TOKEN 3', x: 621 }, { text: 'CATALOG LOOKUP', x: 886 }];
  return `<svg class="beam-tree" viewBox="0 0 1000 244" role="img" aria-labelledby="beam-tree-title beam-tree-desc">
    <title id="beam-tree-title">Beam search with a width of three</title><desc id="beam-tree-desc">Explore valid semantic ID prefixes. Keep at most the three highest-scoring prefixes across all branches after each token. Four final IDs compete for three candidate slots.</desc>
    ${headings.map(heading => `<text class="beam-column-label" x="${heading.x}" y="13" text-anchor="middle">${heading.text}</text>`).join('')}
    <path class="beam-column-rule" d="M282 29V236M492 29V236M745 29V236"/>
    ${rounds.flatMap((round, index) => round.nodes.map(node => treeLink(node, index))).join('')}
    <g class="beam-start"><circle cx="35" cy="138" r="17"/><text x="35" y="142" text-anchor="middle">&lt;s&gt;</text></g>
    ${rounds.flatMap((round, index) => round.nodes.map(node => treeNode(node, index))).join('')}
    ${rounds[2].nodes.filter(node => node.result).map((node, index) => `<path class="beam-lookup-link beam-reveal" data-beam-show="5" aria-hidden="true" d="M${node.x + node.w + 6} ${node.y + 21.5}H787"/><path class="beam-lookup-link beam-reveal" data-beam-show="5" aria-hidden="true" d="M782 ${node.y + 17.5}l5 4-5 4"/>${resultNode(node, index)}`).join('')}
    <text class="beam-cut-label beam-reveal" data-beam-show="4" x="709" y="217" aria-hidden="true">pruned</text>
  </svg>`;
}

function mobileRounds() {
  return `<div class="beam-mobile" aria-label="Beam search rounds">
    ${rounds.map((round, index) => `<div class="beam-round"><div class="beam-round-heading"><span>${round.label}</span><span class="beam-round-count" data-beam-count="${index + 1}"></span></div><div class="beam-round-options">${round.nodes.map(node => `<div class="beam-mobile-node beam-reveal${node.pruned ? ' beam-prunable' : ''}" data-beam-show="${index + 1}" aria-hidden="true"><span class="beam-mobile-code">${node.code}</span><span class="beam-mobile-score">${node.score}</span>${node.pruned ? '<span class="beam-mobile-pruned">pruned</span>' : ''}</div>`).join('')}</div></div>`).join('')}
    <div class="beam-round beam-mobile-results"><div class="beam-round-heading"><span>CATALOG LOOKUP</span><span class="beam-round-count" data-beam-count="5"></span></div><div class="beam-result-options">${rounds[2].nodes.filter(node => node.result).map(node => `<div class="beam-mobile-candidate beam-reveal" data-beam-show="5" aria-hidden="true"><svg aria-hidden="true" style="--shoe-color:${node.color}"><use href="#${node.symbol}-symbol"></use></svg><span>${node.result}</span></div>`).join('')}</div></div>
  </div>`;
}

export function beamSearchMarkup() {
  return `<div class="beam-demo" data-beam-stage="0">
    <div class="beam-context-strip"><div class="beam-history"><span>HISTORY</span><svg aria-hidden="true" style="--shoe-color:#dba477"><use href="#boot-symbol"></use></svg><svg aria-hidden="true" style="--shoe-color:#b6c9ac"><use href="#shoe-symbol"></use></svg><svg aria-hidden="true" style="--shoe-color:#b6c9ac"><use href="#shoe-symbol"></use></svg></div><span class="beam-context-arrow" aria-hidden="true">→</span><div class="beam-transformer"><span class="beam-transformer-light"></span>Transformer decoder</div><div class="beam-rule"><span>One next-token prediction per live prefix.</span></div></div>
    ${desktopTree()}${mobileRounds()}
    <div class="beam-footnote"><span>Score = product of token probabilities · illustrative values</span><span>Catalog-constrained demo</span></div>
    <p class="beam-screen-reader" data-beam-live>${BEAM_CAPTIONS[0]}</p>
  </div>`;
}

/** Update one shared stage for the desktop and mobile diagrams; no DOM rebuild. */
export function renderBeamStage(stage, root = document) {
  const demo = root.matches?.('.beam-demo') ? root : root.querySelector('.beam-demo');
  if (!demo) return;
  const nextStage = Math.max(0, Math.min(5, Math.floor(Number(stage) || 0)));
  if (demo.dataset.beamRendered === String(nextStage)) return;
  demo.dataset.beamRendered = String(nextStage);
  demo.dataset.beamStage = String(nextStage);
  demo.querySelectorAll('[data-beam-show]').forEach(element => {
    const visible = nextStage >= Number(element.dataset.beamShow);
    element.classList.toggle('beam-visible', visible);
    element.setAttribute('aria-hidden', String(!visible));
  });
  demo.querySelectorAll('[data-beam-count]').forEach(element => {
    const round = Number(element.dataset.beamCount);
    element.textContent = nextStage < round ? 'waiting' : round === 1 ? '2 prefixes' : round === 2 ? '3 prefixes' : round === 3 ? (nextStage >= 4 ? '3 kept · 1 pruned' : '4 options') : '3 candidates';
  });
  demo.querySelector('[data-beam-live]').textContent = BEAM_CAPTIONS[nextStage];
}
