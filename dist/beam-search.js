import { catalog } from './catalog.js';

export const BEAM_MILESTONES = [0, 1500, 3300, 5300, 7500, 9300];
export const BEAM_DURATION = 11300;

// Conditional probabilities over valid next tokens. Each sibling group sums to 1.
const transitions = {
  '': [['12', .80], ['31', .20]],
  '12': [['07', .70], ['19', .30]],
  '31': [['05', .60], ['09', .25], ['18', .15]],
  '12 · 07': [['42', .55], ['43', .45]],
  '12 · 19': [['08', 1]],
  '31 · 05': [['11', 1]],
  '31 · 09': [['22', 1]],
  '31 · 18': [['06', 1]],
};

/** Expand only surviving prefixes and rank all extensions together. */
export function getBeamSearch(width = 3) {
  if (![3, 5].includes(width)) throw new RangeError('Beam width must be 3 or 5');
  let live = [{ id: 'start', code: '', probability: 1 }];
  const rounds = Array.from({ length: 3 }, (_, index) => {
    const nodes = live.flatMap(parent => transitions[parent.code].map(([token, conditional]) => {
      const code = parent.code ? `${parent.code} · ${token}` : token;
      const probability = parent.probability * conditional;
      const item = catalog.find(item => item.id.join(' · ') === code);
      return { id: code.replaceAll(' · ', '-'), code, probability,
        score: probability.toFixed(index === 2 ? 3 : 2).replace(/^0/, ''),
        parent: parent.id, ...(item ? { result: item.name, symbol: item.symbol, color: item.color } : {}) };
    })).sort((a, b) => b.probability - a.probability);
    nodes.forEach((node, rank) => { node.pruneAt = rank >= width ? (index === 2 ? 4 : index + 1) : null; });
    live = nodes.filter(node => !node.pruneAt);
    return { label: `TOKEN ${index + 1}`, nodes, kept: live.length };
  });
  // Space each round to fit its nodes; keep branches in catalog order.
  const height = 29 + Math.max(...rounds.map(round => round.nodes.length)) * 52;
  rounds.forEach((round, index) => {
    round.nodes.sort((a, b) => a.code.localeCompare(b.code));
    round.nodes.forEach((node, row) => Object.assign(node, {
      x: [134, 329, 555][index], w: [84, 107, 133][index],
      y: 29 + row * (height - 29) / round.nodes.length,
    }));
  });
  const candidates = [...live].sort((a, b) => b.probability - a.probability);
  const finalCount = rounds[2].nodes.length;
  const captions = [
    'Read the history once. Explore several possible item IDs.',
    `Start two valid prefixes. The beam can hold up to ${width}.`,
    `Expand to 5 prefixes, then keep the best ${width} across all branches.${width === 3 ? ' Prune the other 2.' : ''}`,
    `Expand again: these ${width} prefixes produce ${finalCount} complete IDs.`,
    `Keep the ${width} highest-scoring IDs overall. Prune the lowest-scoring ID.`,
    `Look up the ${width} valid IDs to retrieve ${width} candidate items.`,
  ];
  return { width, rounds, candidates, captions, height };
}

export function beamCaptions(width = 3) { return getBeamSearch(width).captions; }

function treeNode(node, round) {
  return `<g class="beam-node beam-reveal${node.pruneAt ? ' beam-prunable' : ''}" data-beam-show="${round + 1}" data-beam-node="${node.id}" data-beam-prune="${node.pruneAt || 0}" aria-hidden="true" transform="translate(${node.x} ${node.y})">
    <rect class="beam-node-box" width="${node.w}" height="43" rx="6"/>
    <text x="${node.w / 2}" y="18" text-anchor="middle" class="beam-code">${node.code}</text>
    <text x="${node.w / 2}" y="34" text-anchor="middle" class="beam-score">${node.score}</text>
    ${node.pruneAt ? `<path class="beam-prune-mark" d="M8 8L${node.w - 8} 35"/>` : ''}
  </g>`;
}

function treeLink(node, round, nodesById, height) {
  const parent = nodesById[node.parent];
  const fromX = parent ? parent.x + parent.w : 52;
  const fromY = parent ? parent.y + 21.5 : height / 2;
  const toY = node.y + 21.5;
  const midX = (fromX + node.x) / 2;
  return `<path class="beam-branch beam-reveal${node.pruneAt ? ' beam-prunable' : ''}" data-beam-show="${round + 1}" data-beam-prune="${node.pruneAt || 0}" aria-hidden="true" d="M${fromX} ${fromY} C${midX} ${fromY},${midX} ${toY},${node.x} ${toY}"/>`;
}

function resultNode(node, index) {
  return `<g class="beam-candidate beam-reveal" data-beam-show="5" aria-hidden="true" transform="translate(798 ${node.y})">
    <rect width="185" height="43" rx="6"/>
    <use href="#${node.symbol}-symbol" x="7" y="5" width="49" height="31" style="--shoe-color:${node.color}"/>
    <text x="65" y="25" class="beam-item-name">${node.result}</text>
    <circle cx="174" cy="-3" r="9" class="beam-rank-badge"/><text x="174" y=".5" class="beam-rank" text-anchor="middle">${index + 1}</text>
  </g>`;
}

function desktopTree({ width, rounds, candidates, height }) {
  const nodesById = Object.fromEntries(rounds.flatMap(round => round.nodes.map(node => [node.id, node])));
  const headings = [{ text: 'START', x: 35 }, { text: 'TOKEN 1', x: 176 }, { text: 'TOKEN 2', x: 382 }, { text: 'TOKEN 3', x: 621 }, { text: 'CATALOG LOOKUP', x: 886 }];
  return `<svg class="beam-tree" viewBox="0 0 1000 ${height}" style="--beam-tree-height:${height}px" role="img" aria-labelledby="beam-tree-title beam-tree-desc">
    <title id="beam-tree-title">Beam search with a width of ${width}</title><desc id="beam-tree-desc">Explore valid semantic ID prefixes. Keep at most the ${width} highest-scoring prefixes across all branches after each token. ${rounds[2].nodes.length} final IDs compete for ${width} candidate slots.</desc>
    ${headings.map(heading => `<text class="beam-column-label" x="${heading.x}" y="13" text-anchor="middle">${heading.text}</text>`).join('')}
    <path class="beam-column-rule" d="M282 29V${height - 8}M492 29V${height - 8}M745 29V${height - 8}"/>
    ${rounds.flatMap((round, index) => round.nodes.map(node => treeLink(node, index, nodesById, height))).join('')}
    <g class="beam-start"><circle cx="35" cy="${height / 2}" r="17"/><text x="35" y="${height / 2 + 4}" text-anchor="middle">&lt;s&gt;</text></g>
    ${rounds.flatMap((round, index) => round.nodes.map(node => treeNode(node, index))).join('')}
    ${candidates.map((node, index) => `<path class="beam-lookup-link beam-reveal" data-beam-show="5" aria-hidden="true" d="M${node.x + node.w + 6} ${node.y + 21.5}H787"/><path class="beam-lookup-link beam-reveal" data-beam-show="5" aria-hidden="true" d="M782 ${node.y + 17.5}l5 4-5 4"/>${resultNode(node, index)}`).join('')}
    ${rounds.flatMap(round => round.nodes.filter(node => node.pruneAt).map(node => `<text class="beam-cut-label beam-reveal" data-beam-show="${node.pruneAt}" x="${node.x + node.w + 9}" y="${node.y + 27}" aria-hidden="true">pruned</text>`)).join('')}
  </svg>`;
}

function mobileRounds({ rounds, candidates }) {
  return `<div class="beam-mobile" aria-label="Beam search rounds">
    ${rounds.map((round, index) => `<div class="beam-round"><div class="beam-round-heading"><span>${round.label}</span><span class="beam-round-count" data-beam-count="${index + 1}"></span></div><div class="beam-round-options">${round.nodes.map(node => `<div class="beam-mobile-node beam-reveal${node.pruneAt ? ' beam-prunable' : ''}" data-beam-show="${index + 1}" data-beam-prune="${node.pruneAt || 0}" aria-hidden="true"><span class="beam-mobile-code">${node.code}</span><span class="beam-mobile-score">${node.score}</span>${node.pruneAt ? '<span class="beam-mobile-pruned">pruned</span>' : ''}</div>`).join('')}</div></div>`).join('')}
    <div class="beam-round beam-mobile-results"><div class="beam-round-heading"><span>CATALOG LOOKUP</span><span class="beam-round-count" data-beam-count="5"></span></div><div class="beam-result-options">${candidates.map(node => `<div class="beam-mobile-candidate beam-reveal" data-beam-show="5" aria-hidden="true"><svg aria-hidden="true" style="--shoe-color:${node.color}"><use href="#${node.symbol}-symbol"></use></svg><span>${node.result}</span></div>`).join('')}</div></div>
  </div>`;
}

export function beamSearchMarkup(width = 3) {
  const search = getBeamSearch(width);
  return `<div class="beam-demo" data-beam-stage="0" data-beam-width="${width}">
    <div class="beam-context-strip"><div class="beam-history"><span>HISTORY</span><svg aria-hidden="true" style="--shoe-color:#dba477"><use href="#boot-symbol"></use></svg><svg aria-hidden="true" style="--shoe-color:#b6c9ac"><use href="#shoe-symbol"></use></svg><svg aria-hidden="true" style="--shoe-color:#b6c9ac"><use href="#shoe-symbol"></use></svg></div><span class="beam-context-arrow" aria-hidden="true">→</span><div class="beam-transformer"><span class="beam-transformer-light"></span>Transformer decoder</div><div class="beam-rule"><span>One next-token prediction per live prefix.</span></div></div>
    ${desktopTree(search)}${mobileRounds(search)}
    <div class="beam-footnote"><span>Score = product of token probabilities · illustrative values</span><span>Catalog-constrained demo</span></div>
    <p class="beam-screen-reader" data-beam-live>${search.captions[0]}</p>
  </div>`;
}

/** Update one shared stage for the desktop and mobile diagrams; no DOM rebuild. */
export function renderBeamStage(stage, root = document) {
  const demo = root.matches?.('.beam-demo') ? root : root.querySelector('.beam-demo');
  if (!demo) return;
  const search = getBeamSearch(Number(demo.dataset.beamWidth));
  const nextStage = Math.max(0, Math.min(5, Math.floor(Number(stage) || 0)));
  if (demo.dataset.beamRendered === String(nextStage)) return;
  demo.dataset.beamRendered = String(nextStage);
  demo.dataset.beamStage = String(nextStage);
  demo.querySelectorAll('[data-beam-show]').forEach(element => {
    const visible = nextStage >= Number(element.dataset.beamShow);
    element.classList.toggle('beam-visible', visible);
    element.setAttribute('aria-hidden', String(!visible));
  });
  demo.querySelectorAll('[data-beam-prune]').forEach(element => {
    const pruneAt = Number(element.dataset.beamPrune);
    element.classList.toggle('beam-pruned', pruneAt > 0 && nextStage >= pruneAt);
  });
  demo.querySelectorAll('[data-beam-count]').forEach(element => {
    const round = Number(element.dataset.beamCount);
    const info = search.rounds[round - 1];
    const pruned = info ? info.nodes.length - info.kept : 0;
    element.textContent = nextStage < round ? 'waiting'
      : round === 5 ? `${search.candidates.length} candidates`
      : round === 3 && nextStage < 4 ? `${info.nodes.length} options`
      : pruned ? `${info.kept} kept · ${pruned} pruned` : `${info.kept} prefixes`;
  });
  demo.querySelector('[data-beam-live]').textContent = search.captions[nextStage];
}
