const palette = {
  paper: '#f6f5f0', ink: '#22251f', lime: '#d8ef62', purple: '#8270bd', orange: '#dba477', muted: '#c9cdc1', line: '#dadcd3',
};

function definitions(id) {
  return `<defs>
    <marker id="${id}-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="${palette.ink}" stroke-width="1.1"/></marker>
    <symbol id="${id}-shoe" viewBox="0 0 40 32"><path d="M5 22l5-3 1-11 6-2 9 11 9 3 1 6H5z" fill="currentColor" fill-opacity=".18" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round"/><path d="M6 23h29M17 12l5-2m-2 6 5-2m-2 6 5-2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>
  </defs>`;
}

function history(id, label = 'Recent items') {
  return `<g class="cmp-history"><rect x="83" y="7" width="134" height="36" rx="18" fill="#eeeee5"/><use href="#${id}-shoe" x="95" y="11" width="31" height="26" style="color:${palette.orange}"/><text x="134" y="30" class="cmp-svg-label">${label}</text></g>`;
}

function result(id) {
  return `<g class="cmp-result"><rect x="88" y="194" width="124" height="34" rx="17" fill="${palette.lime}"/><use href="#${id}-shoe" x="98" y="197" width="30" height="25" style="color:${palette.ink}"/><text x="135" y="216" class="cmp-svg-label">Candidate</text></g>`;
}

function signalDiagram() {
  const id = 'cmp-signal';
  return `<svg class="cmp-diagram" viewBox="0 0 300 235" role="img" aria-labelledby="${id}-title ${id}-desc">
    <title id="${id}-title">Item-to-item signal retrieval</title><desc id="${id}-desc">A recently viewed item connects to other items through co-view and co-purchase signals. Strong connections provide similar-item candidates. Edge weights are illustrative.</desc>
    ${definitions(id)}${history(id, 'Recent item')}
    <path d="M150 46C150 61 90 58 90 81" class="cmp-flow cmp-flow-first" marker-end="url(#${id}-arrow)"/>
    <g class="cmp-network">
      <path d="M90 104L166 84M90 104L218 137M90 104L134 160M90 104L52 155M166 84L218 137M134 160L218 137" fill="none" stroke="${palette.line}" stroke-width="1.2"/>
      <path d="M90 104L166 84" fill="none" stroke="${palette.purple}" stroke-width="3" opacity=".45"/>
      <path d="M90 104L218 137" class="cmp-signal-edge" fill="none" stroke="${palette.purple}" stroke-width="5"/>
      <text x="130" y="85" class="cmp-svg-small">0.4</text><text x="151" y="112" class="cmp-svg-small">0.8</text>
      <circle cx="90" cy="104" r="17" fill="${palette.orange}"/><use href="#${id}-shoe" x="77" y="93" width="26" height="21"/>
      <circle cx="166" cy="84" r="12" fill="#e6e4ee" stroke="${palette.purple}"/><circle cx="134" cy="160" r="12" fill="#eeeee5" stroke="${palette.muted}"/><circle cx="52" cy="155" r="9" fill="#eeeee5" stroke="${palette.muted}"/>
      <g class="cmp-selected-node"><circle cx="218" cy="137" r="18" fill="${palette.lime}" stroke="${palette.ink}" stroke-width="1.25"/><use href="#${id}-shoe" x="204" y="125" width="28" height="23"/></g>
    </g>
    <path d="M218 158C218 177 150 172 150 189" class="cmp-flow cmp-flow-last" marker-end="url(#${id}-arrow)"/>
    ${result(id)}
  </svg>`;
}

function annDiagram() {
  const id = 'cmp-ann';
  return `<svg class="cmp-diagram" viewBox="0 0 300 235" role="img" aria-labelledby="${id}-title ${id}-desc">
    <title id="${id}-title">Approximate nearest-neighbor retrieval</title><desc id="${id}-desc">An encoder turns recent activity into a query vector. Search finds nearby stored item vectors and returns candidate items. The two-dimensional space is illustrative.</desc>
    ${definitions(id)}${history(id)}
    <path d="M150 46V57" class="cmp-flow cmp-flow-first" marker-end="url(#${id}-arrow)"/>
    <g class="cmp-query-vector"><rect x="99" y="61" width="102" height="23" rx="7" fill="#e6e4ee"/><text x="150" y="77" text-anchor="middle" class="cmp-svg-mono">[.2, .8, …]</text></g>
    <text x="68" y="101" class="cmp-svg-small">item vectors</text>
    <path d="M64 109V175H235" fill="none" stroke="${palette.line}" stroke-width="1.15"/>
    <g fill="${palette.muted}"><circle cx="88" cy="124" r="4"/><circle cx="115" cy="110" r="4"/><circle cx="96" cy="157" r="4"/><circle cx="130" cy="148" r="4"/><circle cx="220" cy="109" r="4"/><circle cx="219" cy="159" r="4"/><circle cx="201" cy="170" r="4"/><circle cx="113" cy="168" r="4"/></g>
    <g class="cmp-search-radius"><circle cx="174" cy="131" r="28" fill="${palette.purple}" fill-opacity=".07" stroke="${palette.purple}" stroke-dasharray="3 4"/><path d="M174 131L187 124M174 131L153 128M174 131L180 152" stroke="${palette.purple}" stroke-opacity=".45"/></g>
    <g fill="${palette.purple}"><circle cx="153" cy="128" r="4"/><circle cx="180" cy="152" r="4"/></g>
    <g class="cmp-ann-query"><circle cx="174" cy="131" r="7" fill="${palette.paper}"/><path d="M174 126V136M169 131H179" stroke="${palette.ink}" stroke-width="2" stroke-linecap="round"/><text x="161" y="117" class="cmp-svg-small">query</text></g>
    <circle class="cmp-selected-node" cx="187" cy="124" r="6" fill="${palette.lime}" stroke="${palette.ink}" stroke-width="1.1"/>
    <path d="M187 132C203 166 150 170 150 189" class="cmp-flow cmp-flow-last" marker-end="url(#${id}-arrow)"/>
    ${result(id)}
  </svg>`;
}

function generativeDiagram() {
  const id = 'cmp-gr';
  return `<svg class="cmp-diagram" viewBox="0 0 300 235" role="img" aria-labelledby="${id}-title ${id}-desc">
    <title id="${id}-title">Generative retrieval</title><desc id="${id}-desc">A transformer decoder uses recent activity to predict an item's semantic ID one token at a time: 12, then 07, then 42. The complete valid ID maps to a catalog item.</desc>
    ${definitions(id)}${history(id)}
    <path d="M150 46V67" class="cmp-flow cmp-flow-first" marker-end="url(#${id}-arrow)"/>
    <g class="cmp-decoder"><rect x="87" y="76" width="134" height="42" rx="9" fill="#ded9eb"/><rect x="83" y="72" width="134" height="42" rx="9" fill="#eeebf3" stroke="${palette.purple}" stroke-width="1.2"/><text x="150" y="98" text-anchor="middle" class="cmp-svg-label">Decoder</text></g>
    <path d="M150 119V132" class="cmp-flow cmp-flow-middle" marker-end="url(#${id}-arrow)"/>
    <g class="cmp-tokens">
      <g class="cmp-token cmp-token-one"><rect x="62" y="138" width="48" height="33" rx="8" fill="#e6e4ee"/><text x="86" y="160" text-anchor="middle" class="cmp-svg-token">12</text></g>
      <path d="M115 154H124" class="cmp-token cmp-token-two cmp-token-arrow" marker-end="url(#${id}-arrow)"/>
      <g class="cmp-token cmp-token-two"><rect x="129" y="138" width="48" height="33" rx="8" fill="#e6e4ee"/><text x="153" y="160" text-anchor="middle" class="cmp-svg-token">07</text></g>
      <path d="M182 154H191" class="cmp-token cmp-token-three cmp-token-arrow" marker-end="url(#${id}-arrow)"/>
      <g class="cmp-token cmp-token-three"><rect x="196" y="138" width="48" height="33" rx="8" fill="${palette.purple}"/><text x="220" y="160" text-anchor="middle" class="cmp-svg-token" fill="white">42</text></g>
    </g>
    <path d="M153 174V189" class="cmp-flow cmp-flow-last" marker-end="url(#${id}-arrow)"/>
    ${result(id)}
  </svg>`;
}

const styles = `<style>
  .comparison-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; }
  .comparison-grid .method { min-width:0; padding:24px 20px 20px; border:1px solid #dadcd3; border-radius:18px; background:#fafaf6; }
  .comparison-grid .method:last-child { background:#f0f3e5; border-color:#ccd49c; }
  .cmp-method-top { display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .cmp-method-top h3 { margin:0; font-size:18px; line-height:1.3; letter-spacing:-.035em; font-weight:600; }
  .cmp-index { color:#858c7a; font-size:11px; font-family:monospace; }
  .cmp-description { font-size:12px; line-height:1.5; color:#68705e; margin:8px 0 3px; }
  .cmp-diagram { display:block; width:100%; height:auto; overflow:visible; color:#22251f; }
  .cmp-svg-label { font-family:inherit; font-size:11px; font-weight:500; fill:#22251f; }
  .cmp-svg-small { font-family:inherit; font-size:9px; fill:#78806e; }
  .cmp-svg-mono { font-family:ui-monospace,monospace; font-size:10px; fill:#564772; }
  .cmp-svg-token { font-family:ui-monospace,monospace; font-size:16px; font-weight:500; }
  .cmp-flow { fill:none; stroke:#68705e; stroke-width:1.2; stroke-linecap:round; }
  .cmp-token-arrow { fill:none; stroke:#68705e; stroke-width:1.2; }
  .cmp-notes { border-top:1px solid #e0e3d6; padding-top:14px; display:grid; gap:6px; font-size:11px; line-height:1.45; }
  .cmp-note { display:flex; gap:8px; align-items:baseline; margin:0; }
  .cmp-note span:first-child { display:inline-block; min-width:39px; color:#89907e; font-size:9px; text-transform:uppercase; letter-spacing:.08em; }
  .cmp-note span:last-child { color:#4a5340; }
  .comparison-running .cmp-history { animation:cmp-enter .45s ease both; }
  .comparison-running .cmp-flow-first { stroke-dasharray:180; animation:cmp-draw 1.2s .25s ease both; }
  .comparison-running .cmp-network, .comparison-running .cmp-query-vector, .comparison-running .cmp-decoder { animation:cmp-enter .55s 1s ease both; }
  .comparison-running .cmp-signal-edge { stroke-dasharray:150; animation:cmp-draw 1.8s 1.5s ease both; }
  .comparison-running .cmp-selected-node { transform-box:fill-box; transform-origin:center; animation:cmp-select .6s 3.3s ease both; }
  .comparison-running .cmp-ann-query { animation:cmp-enter .55s 1.7s ease both; }
  .comparison-running .cmp-search-radius { transform-box:fill-box; transform-origin:center; animation:cmp-radius 1.3s 2s ease both; }
  .comparison-running .cmp-flow-middle { stroke-dasharray:20; animation:cmp-draw .5s 1.5s ease both; }
  .comparison-running .cmp-token { animation:cmp-enter .45s ease both; }
  .comparison-running .cmp-token-one { animation-delay:1.9s; }
  .comparison-running .cmp-token-two { animation-delay:2.7s; }
  .comparison-running .cmp-token-three { animation-delay:3.5s; }
  .comparison-running .cmp-flow-last { stroke-dasharray:120; animation:cmp-draw .8s 4.05s ease both; }
  .comparison-running .cmp-result { animation:cmp-enter .5s 4.65s ease both; }
  .comparison-paused *, .comparison-paused { animation-play-state:paused !important; }
  @keyframes cmp-enter { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cmp-draw { from{stroke-dashoffset:180;opacity:0} 15%{opacity:1} to{stroke-dashoffset:0;opacity:1} }
  @keyframes cmp-select { from{opacity:.15;transform:scale(.7)} 70%{transform:scale(1.15)} to{opacity:1;transform:scale(1)} }
  @keyframes cmp-radius { from{opacity:0;transform:scale(.15)} to{opacity:1;transform:scale(1)} }
  @media(max-width:720px){ .comparison-grid{grid-template-columns:1fr;gap:12px}.comparison-grid .method{padding:20px}.cmp-diagram{max-width:360px;margin:0 auto}.cmp-method-top h3{font-size:18px}.cmp-notes{font-size:12px} }
  @media(prefers-reduced-motion:reduce){ .comparison-running *{animation:none!important} }
</style>`;

/** Three comparable candidate-retrieval diagrams, with deliberately minimal copy. */
export function comparisonMarkup() {
  return `${styles}<div class="comparison-grid" aria-label="Three approaches to candidate retrieval">
    <article class="method"><div class="cmp-method-top"><h3>Item-to-item signals</h3><span class="cmp-index">01</span></div><p class="cmp-description">Follow co-views and co-purchases.</p>${signalDiagram()}<div class="cmp-notes"><p class="cmp-note"><span>Uses</span><span>Observed item connections</span></p><p class="cmp-note"><span>Needs</span><span>Enough shared behavior</span></p></div></article>
    <article class="method"><div class="cmp-method-top"><h3>Vector search (ANN)</h3><span class="cmp-index">02</span></div><p class="cmp-description">Find approximate nearest neighbors.</p>${annDiagram()}<div class="cmp-notes"><p class="cmp-note"><span>Uses</span><span>Similarity in embedding space</span></p><p class="cmp-note"><span>Needs</span><span>A stored vector index</span></p></div></article>
    <article class="method"><div class="cmp-method-top"><h3>Generative retrieval</h3><span class="cmp-index">03</span></div><p class="cmp-description">Predict an item’s address.</p>${generativeDiagram()}<div class="cmp-notes"><p class="cmp-note"><span>Uses</span><span>Sequential ID prediction</span></p><p class="cmp-note"><span>Needs</span><span>Valid IDs → catalog items</span></p></div></article>
  </div>`;
}

/** Start or replay once. Add .comparison-paused to the grid to pause. */
export function startComparison(root = document) {
  const grid = root.matches?.('.comparison-grid') ? root : root.querySelector('.comparison-grid');
  if (!grid) return () => {};
  grid.classList.remove('comparison-running');
  void grid.offsetWidth;
  grid.classList.add('comparison-running');
  return () => grid.classList.remove('comparison-running');
}
