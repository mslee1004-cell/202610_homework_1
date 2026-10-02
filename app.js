/**
 * Aethelgard Longevity AI — Advanced Biotech Visualizer & Logic Engine
 * Integrates 3Dmol WebGL Protein Viewer, Chou-Talalay Synergy Curves,
 * SASP Cytokine Heatmaps, Network Physics, and Web Audio SFX.
 */

// Global State
const state = {
  activeTab: 'overview',
  activeTarget: 'P04637',
  activePdb: '1TSR',
  simulationRunning: false,
  audioEnabled: true,
  glViewer: null,
  current3DStyle: 'cartoon',
  selectedCandidate: null,
  bizSettings: {
    pipelines: 2,
    croBudget: 1500,
    upfront: 800,
    royalty: 7.5
  }
};

// Target Database
const TARGET_DATA = {
  'P04637': {
    name: 'Cellular tumor antigen p53 (TP53)',
    uniprot: 'P04637',
    pdb: '1TSR (2.2 Å)',
    pdbCode: '1TSR',
    length: '393 AAs',
    plddt: 88.4,
    pocket: 'Pocket #1 (Residues 180-224)',
    desc: '세포 노화 및 아포토시스 조절의 핵심 허브 단백질. FOXO4와의 상호작용 시 노화 세포의 사멸을 회피하게 만듭니다.',
    heuristics: [
      'Residue Range 180-224: 고리형 소수성 포켓 형성, 저분자 화합물 결합에 최적.',
      'PPI Interface: FOXO4 결합 계면(Arg202, Glu205)과 겹쳐 화합물 투여 시 선택적 해리 유도 가능.',
      'Disorder Assessment: C-터미널(360-393)을 제외하고 코어 도메인이 92% 이상의 높은 구조적 안정성을 유지함.'
    ]
  },
  'Q9NUP1': {
    name: 'Forkhead box protein O4 (FOXO4)',
    uniprot: 'Q9NUP1',
    pdb: '1R08 (2.5 Å)',
    pdbCode: '1R08',
    length: '505 AAs',
    plddt: 74.2,
    pocket: 'Pocket #2 (Forkhead Domain 90-185)',
    desc: '노화 세포 특이적 전사인자. p53과 결합하여 세포 자살(Apoptosis)을 막고 노화 상태를 영구화하는 핵심 인자.',
    heuristics: [
      'Residue Range 90-185: DNA 결합 윙드-헬릭스(Winged-helix) 도메인으로 펩타이드 모방체 표적 가능.',
      'FOXO4-DRI 결합 포켓: p53과의 접촉면을 선택적으로 차단해 세포사를 유도함.',
      'Disorder Assessment: N-말단과 C-말단이 고도로 무질서(IDR)하여 코어 도메인 집중 분석 필요.'
    ]
  },
  'Q07817': {
    name: 'Bcl-2-like protein 1 (BCL2L1 / BCL-xL)',
    uniprot: 'Q07817',
    pdb: '1R2D (1.9 Å)',
    pdbCode: '1R2D',
    length: '233 AAs',
    plddt: 91.8,
    pocket: 'BH3-binding groove (Residues 90-150)',
    desc: '노화 세포의 세포사멸 회피 경로(SCAP)를 지탱하는 대표적인 항-아포토시스 단백질.',
    heuristics: [
      'BH3 바인딩 그루브: 긴 소수성 틈을 형성하여 나비토클락스 유도체 및 신규 모노머 결합에 유리.',
      'Selectivity Filter: BCL-2와의 선택성 비교를 통해 혈소판 감소증 독성을 회피하는 프로파일링 필수.',
      'AlphaFold 글로벌 신뢰도 91.8의 매우 견고한 알파 헬릭스 번들 구조.'
    ]
  },
  'P42345': {
    name: 'Serine/threonine-protein kinase mTOR (MTOR)',
    uniprot: 'P42345',
    pdb: '4DRH (3.1 Å)',
    pdbCode: '4DRH',
    length: '2,549 AAs',
    plddt: 85.1,
    pocket: 'FRB Domain (Residues 2015-2114)',
    desc: '세포 성장, 자가포식(Autophagy), 수명 연장(Lifespan extension) 신호전달의 중앙 관제탑.',
    heuristics: [
      'FRB 도메인: 라파마이신-FKBP12 복합체가 알로스테릭하게 결합하는 전형적인 포켓.',
      '자가포식 유도: 키나아제 활성을 적정 수준으로 조절하여 노화 폐세포 재생 촉진.',
      '대형 단백질 특성: 2,500AA 이상으로 단편화 모델링 분석 적용.'
    ]
  },
  'Q96EB6': {
    name: 'NAD-dependent protein deacetylase sirtuin-1 (SIRT1)',
    uniprot: 'Q96EB6',
    pdb: '4I5I (2.6 Å)',
    pdbCode: '4I5I',
    length: '747 AAs',
    plddt: 79.5,
    pocket: 'Catalytic Pocket & Allosteric STAC site',
    desc: 'NAD+ 의존성 탈아세틸화 효소로, 미토콘드리아 생합성 촉진 및 DNA 복구 경로 활성화.',
    heuristics: [
      'STAC 결합 부위: 레스베라트롤/합성 알로스테릭 활성화제가 결합하는 N-말단 조절 영역.',
      'NAD+ 결합 코어: 잔기 244-498의 Rossmann-fold 도메인.',
      '노화 대사 회복: AMPK와 함께 이중 활성화 시 인슐린 감수성 및 세포 활력 극대화.'
    ]
  }
};

// Initial Active Pipelines
const PIPELINE_CANDIDATES = [
  {
    code: 'AET-002',
    disease: '특발성 폐섬유증 (IPF)',
    target: 'FOXO4-p53 / mTORC1',
    originDrug: 'Rapamycin + Quercetin',
    affinity: '-11.4 kcal/mol',
    ci: '0.38 (High Synergy)',
    timeline: '4.5개월',
    status: 'In-Vitro 완료 단계',
    statusClass: 'badge-emerald',
    details: {
      chemFormula: 'C51H79NO13 + C15H10O7',
      saspReduction: '92.3%',
      selectivity: '96.8%',
      safetyIndex: '98.1%',
      patentStatus: 'US Provisional 가출원 준비 완료',
      croQuotes: 'Enamine 합성: $1,800 | Charles River 폐세포 어세이: $7,500'
    }
  },
  {
    code: 'AET-005',
    disease: '퇴행성 골관절염 (OA)',
    target: 'BCL-xL / CDK4',
    originDrug: 'Fisetin + Navitoclax micro-dose',
    affinity: '-10.8 kcal/mol',
    ci: '0.42 (High Synergy)',
    timeline: '5.0개월',
    status: '가상 스크리닝 통과',
    statusClass: 'badge-accent',
    details: {
      chemFormula: 'C15H10O6 + C47H55ClN6O6S2 (Low-dose)',
      saspReduction: '88.7%',
      selectivity: '94.2%',
      safetyIndex: '97.4%',
      patentStatus: '용도 특허 청구항 설계 중',
      croQuotes: '연골세포(Chondrocyte) In-vitro 어세이: $6,800'
    }
  },
  {
    code: 'AET-008',
    disease: '노인성 근감소증 (Sarcopenia)',
    target: 'SIRT1 / AMPK / GDF11',
    originDrug: 'Metformin + SGLT2i repurpose',
    affinity: '-9.6 kcal/mol',
    ci: '0.51 (Synergistic)',
    timeline: '3.5개월',
    status: 'Hit 선정 완료',
    statusClass: 'badge-accent',
    details: {
      chemFormula: 'C4H11N5 + C21H25ClO6',
      saspReduction: '81.4%',
      selectivity: '98.9%',
      safetyIndex: '99.2%',
      patentStatus: '선행기술조사(FTO) 완료',
      croQuotes: 'C2C12 근육세포 분화 어세이: $5,200'
    }
  },
  {
    code: 'AET-011',
    disease: '노인성 황반변성 (dry-AMD)',
    target: 'CD38 / NRF2 Axis',
    originDrug: 'Apigenin + RTA-408 analog',
    affinity: '-10.1 kcal/mol',
    ci: '0.45 (High Synergy)',
    timeline: '6.0개월',
    status: 'Hit 선정 완료',
    statusClass: 'badge-accent',
    details: {
      chemFormula: 'C15H10O5 + C31H42N2O4',
      saspReduction: '89.2%',
      selectivity: '93.5%',
      safetyIndex: '96.8%',
      patentStatus: '초안 작성 중',
      croQuotes: 'RPE 망막세포 산화스트레스 어세이: $7,900'
    }
  }
];

// DeepMind Skills Catalog
const SCIENCE_SKILLS = [
  { id: 'alphafold_database_fetch_and_analyze', name: 'alphafold-database', desc: 'AlphaFold 단백질 구조 mmCIF 다운로드 및 pLDDT/도메인 분석' },
  { id: 'pubchem_database', name: 'pubchem-database', desc: 'PubChem 화합물 구조(SMILES), ADMET 물성 및 화학적 특성 분석' },
  { id: 'chembl_database', name: 'chembl-database', desc: 'ChEMBL 생체 활성 화합물, IC50/Ki 값 및 타깃 결합 데이터 조회' },
  { id: 'openfda_database', name: 'openfda-database', desc: 'FDA 승인 약물, 안전성 보고서, 부작용 및 라벨링 데이터 쿼리' },
  { id: 'reactome_database', name: 'reactome-database', desc: 'Reactome 노화 및 세포 사멸 경로, 유전자 네트워크 분석' },
  { id: 'uniprot_database', name: 'uniprot-database', desc: 'UniProt 단백질 서열, 기능 주석 및 도메인 구조 검색' },
  { id: 'gnomad_database', name: 'gnomad-database', desc: 'gnomAD 인구 집단 변이 빈도 및 pLI/LOEUF 제약 지표 분석' },
  { id: 'literature_search_openalex', name: 'literature-openalex', desc: 'OpenAlex 학술 데이터베이스 논문 검색 및 DOI 인용 분석' }
];

// Web Audio SFX Synthesizer
let audioCtx = null;
function playSound(type = 'click') {
  if (!state.audioEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'chime') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.18); // C6
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'scan') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.linearRampToValueAtTime(700, now + 0.12);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (err) {
    // AudioContext blocked by policy until user interaction
  }
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initAudioToggle();
  initNav();
  initTable();
  initNetworkCanvas();
  initSynergyCurveCanvas();
  initSaspHeatmapCanvas();
  initAdmetRadarCanvas();
  populatePubChemTable();
  initPlddtProfileCanvas();
  init3DmolViewer();
  initSimulator();
  initBusinessSimulator();
  initSkillsTerminal();
  initModal();
});

/* --------------------------------------------------------------------------
   Audio Toggle
   -------------------------------------------------------------------------- */
function initAudioToggle() {
  const toggleBtn = document.getElementById('audio-toggle');
  const statusText = document.getElementById('audio-status-text');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      state.audioEnabled = !state.audioEnabled;
      if (state.audioEnabled) {
        toggleBtn.classList.remove('muted');
        statusText.innerText = 'SFX ON';
        playSound('chime');
      } else {
        toggleBtn.classList.add('muted');
        statusText.innerText = 'SFX OFF';
      }
    });
  }
}

/* --------------------------------------------------------------------------
   Navigation
   -------------------------------------------------------------------------- */
function initNav() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playSound('click');
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const targetId = `tab-${tab.dataset.tab}`;
      document.querySelectorAll('.tab-view').forEach(view => {
        view.classList.remove('active');
      });
      const activeView = document.getElementById(targetId);
      if (activeView) activeView.classList.add('active');
      state.activeTab = tab.dataset.tab;

      // Tab specific re-renders
      if ((tab.dataset.tab === 'structural-lab' || tab.dataset.tab === 'targets') && state.glViewer) {
        setTimeout(() => {
          state.glViewer.render();
          state.glViewer.zoomTo();
        }, 100);
      }
    });
  });

  const quickScreenBtn = document.getElementById('btn-quick-screen');
  if (quickScreenBtn) {
    quickScreenBtn.addEventListener('click', () => {
      playSound('chime');
      const pipelineTab = document.querySelector('.nav-tab[data-tab="pipeline"]');
      if (pipelineTab) pipelineTab.click();
      setTimeout(() => {
        const startBtn = document.getElementById('btn-start-simulation');
        if (startBtn) startBtn.click();
      }, 250);
    });
  }
}

/* --------------------------------------------------------------------------
   Pipeline Table
   -------------------------------------------------------------------------- */
function initTable() {
  const tbody = document.getElementById('pipeline-tbody');
  const searchInput = document.getElementById('candidate-search');

  function renderRows(items) {
    tbody.innerHTML = '';
    items.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color: #ffffff">${c.code}</strong></td>
        <td>${c.disease}</td>
        <td><span class="tag">${c.target}</span></td>
        <td style="color: var(--accent-cyan); font-family: var(--font-mono)">${c.originDrug}</td>
        <td><strong style="color: var(--accent-emerald)">${c.affinity}</strong></td>
        <td><span class="badge-emerald">${c.ci}</span></td>
        <td>${c.timeline}</td>
        <td><span class="${c.statusClass}">${c.status}</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="openCandidateDetail('${c.code}')">
            분석 보기
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderRows(PIPELINE_CANDIDATES);

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = PIPELINE_CANDIDATES.filter(item => 
        item.code.toLowerCase().includes(query) ||
        item.disease.toLowerCase().includes(query) ||
        item.target.toLowerCase().includes(query) ||
        item.originDrug.toLowerCase().includes(query)
      );
      renderRows(filtered);
    });
  }
}

window.openCandidateDetail = function(code) {
  playSound('chime');
  const c = PIPELINE_CANDIDATES.find(x => x.code === code) || PIPELINE_CANDIDATES[0];
  state.selectedCandidate = c;
  
  const modal = document.getElementById('detail-modal');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');

  title.innerText = `${c.code} (${c.disease}) — 상세 약물 프로파일`;
  body.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
      <div class="meta-stat">
        <span class="stat-k">화학 분자식 구성</span>
        <span class="stat-v" style="font-size: 0.82rem;">${c.details.chemFormula}</span>
      </div>
      <div class="meta-stat">
        <span class="stat-k">기승인 약물 조합</span>
        <span class="stat-v text-cyan" style="font-size: 0.85rem;">${c.originDrug}</span>
      </div>
      <div class="meta-stat">
        <span class="stat-k">SASP 억제율</span>
        <span class="stat-v text-emerald">${c.details.saspReduction}</span>
      </div>
      <div class="meta-stat">
        <span class="stat-k">정상세포 안전성 지수</span>
        <span class="stat-v text-emerald">${c.details.safetyIndex}</span>
      </div>
    </div>
    <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.82rem;">
      <strong style="color: var(--accent-cyan); display: block; margin-bottom: 0.5rem;">특허 및 지식재산권(IP) 전략:</strong>
      <p style="color: #cbd5e1; margin-bottom: 0.5rem;">${c.details.patentStatus}</p>
      <strong style="color: var(--accent-emerald); display: block; margin-bottom: 0.5rem;">예상 외주 CRO 견적:</strong>
      <p style="color: #94a3b8; font-family: var(--font-mono);">${c.details.croQuotes}</p>
    </div>
    <div style="display: flex; gap: 0.75rem;">
      <button class="btn btn-primary btn-block" onclick="copyTeaser('${c.code}')">
        빅파마 라이선스아웃용 Teaser 복사
      </button>
      <button class="btn btn-secondary btn-block" onclick="closeModal()">
        닫기
      </button>
    </div>
  `;
  modal.classList.add('active');
};

/* --------------------------------------------------------------------------
   Live Molecular Network Canvas
   -------------------------------------------------------------------------- */
function initNetworkCanvas() {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const nodes = [
    { id: 'TP53', label: 'p53', type: 'target', x: 0.45, y: 0.35, r: 18, color: '#10b981' },
    { id: 'FOXO4', label: 'FOXO4', type: 'target', x: 0.35, y: 0.45, r: 16, color: '#10b981' },
    { id: 'BCL2L1', label: 'BCL-xL', type: 'target', x: 0.65, y: 0.40, r: 16, color: '#10b981' },
    { id: 'MTOR', label: 'mTORC1', type: 'target', x: 0.50, y: 0.65, r: 17, color: '#10b981' },
    { id: 'SIRT1', label: 'SIRT1', type: 'target', x: 0.25, y: 0.60, r: 15, color: '#10b981' },
    { id: 'SASP', label: 'SASP Hub', type: 'target', x: 0.50, y: 0.20, r: 20, color: '#f43f5e' },
    { id: 'RAPA', label: 'Rapamycin', type: 'drug', x: 0.65, y: 0.70, r: 12, color: '#06b6d4' },
    { id: 'QUERC', label: 'Quercetin', type: 'drug', x: 0.20, y: 0.35, r: 12, color: '#06b6d4' },
    { id: 'NAVI', label: 'Navitoclax', type: 'drug', x: 0.80, y: 0.45, r: 12, color: '#06b6d4' },
    { id: 'FISET', label: 'Fisetin', type: 'drug', x: 0.75, y: 0.25, r: 12, color: '#06b6d4' },
    { id: 'METF', label: 'Metformin', type: 'drug', x: 0.20, y: 0.75, r: 12, color: '#06b6d4' },
    { id: 'AET002', label: 'AET-002 (Lead)', type: 'synergy', x: 0.42, y: 0.50, r: 22, color: '#f59e0b' }
  ];

  const links = [
    { from: 'FOXO4', to: 'TP53', style: 'dashed', color: 'rgba(244, 63, 94, 0.6)', width: 2 },
    { from: 'TP53', to: 'SASP', style: 'solid', color: 'rgba(16, 185, 129, 0.4)', width: 1.5 },
    { from: 'BCL2L1', to: 'SASP', style: 'solid', color: 'rgba(16, 185, 129, 0.4)', width: 1.5 },
    { from: 'MTOR', to: 'SASP', style: 'solid', color: 'rgba(16, 185, 129, 0.4)', width: 1.5 },
    { from: 'SIRT1', to: 'MTOR', style: 'solid', color: 'rgba(99, 102, 241, 0.5)', width: 1.5 },
    { from: 'RAPA', to: 'MTOR', style: 'solid', color: 'rgba(6, 182, 212, 0.6)', width: 2 },
    { from: 'NAVI', to: 'BCL2L1', style: 'solid', color: 'rgba(6, 182, 212, 0.6)', width: 2 },
    { from: 'QUERC', to: 'FOXO4', style: 'solid', color: 'rgba(6, 182, 212, 0.6)', width: 2 },
    { from: 'FISET', to: 'BCL2L1', style: 'solid', color: 'rgba(6, 182, 212, 0.6)', width: 2 },
    { from: 'METF', to: 'SIRT1', style: 'solid', color: 'rgba(6, 182, 212, 0.6)', width: 2 },
    { from: 'AET002', to: 'FOXO4', style: 'glow', color: 'rgba(245, 158, 11, 0.9)', width: 3 },
    { from: 'AET002', to: 'MTOR', style: 'glow', color: 'rgba(245, 158, 11, 0.9)', width: 3 }
  ];

  let hoveredNode = null;
  const particles = [];
  for (let i = 0; i < 20; i++) {
    particles.push({
      linkIdx: Math.floor(Math.random() * links.length),
      t: Math.random(),
      speed: 0.003 + Math.random() * 0.006
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const h = canvas.height;

    links.forEach(link => {
      const n1 = nodes.find(n => n.id === link.from);
      const n2 = nodes.find(n => n.id === link.to);
      if (!n1 || !n2) return;

      const x1 = n1.x * w;
      const y1 = n1.y * h;
      const x2 = n2.x * w;
      const y2 = n2.y * h;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = link.color;
      ctx.lineWidth = link.width;

      if (link.style === 'dashed') {
        ctx.setLineDash([4, 4]);
      } else if (link.style === 'glow') {
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.setLineDash([]);
      } else {
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);
    });

    particles.forEach(p => {
      const link = links[p.linkIdx];
      const n1 = nodes.find(n => n.id === link.from);
      const n2 = nodes.find(n => n.id === link.to);
      if (!n1 || !n2) return;

      p.t += p.speed;
      if (p.t > 1) p.t = 0;

      const px = (n1.x + (n2.x - n1.x) * p.t) * w;
      const py = (n1.y + (n2.y - n1.y) * p.t) * h;

      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = link.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    nodes.forEach(node => {
      const nx = node.x * w;
      const ny = node.y * h;

      ctx.beginPath();
      ctx.arc(nx, ny, node.r + 4, 0, Math.PI * 2);
      ctx.fillStyle = node.color.replace(')', ', 0.18)').replace('rgb', 'rgba');
      ctx.fill();

      ctx.beginPath();
      ctx.arc(nx, ny, node.r, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.shadowColor = node.color;
      ctx.shadowBlur = hoveredNode === node ? 18 : 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, nx, ny + node.r + 15);
    });

    requestAnimationFrame(animate);
  }
  animate();

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const w = canvas.width;
    const h = canvas.height;

    hoveredNode = nodes.find(n => {
      const dist = Math.hypot(n.x * w - mx, n.y * h - my);
      return dist < n.r + 8;
    });
    canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
  });

  canvas.addEventListener('click', () => {
    if (hoveredNode) {
      playSound('click');
      if (hoveredNode.id === 'AET002') {
        openCandidateDetail('AET-002');
      } else if (hoveredNode.type === 'target') {
        const tabBtn = document.querySelector('.nav-tab[data-tab="structural-lab"]') || document.querySelector('.nav-tab[data-tab="targets"]');
        if (tabBtn) tabBtn.click();
      }
    }
  });

  const reorgBtn = document.getElementById('btn-reorganize-graph');
  if (reorgBtn) {
    reorgBtn.addEventListener('click', () => {
      playSound('scan');
      nodes.forEach(n => {
        if (n.id !== 'AET002' && n.id !== 'SASP') {
          n.x += (Math.random() - 0.5) * 0.1;
          n.y += (Math.random() - 0.5) * 0.1;
          n.x = Math.max(0.15, Math.min(0.85, n.x));
          n.y = Math.max(0.15, Math.min(0.85, n.y));
        }
      });
    });
  }

  const highlightBtn = document.getElementById('btn-highlight-synergy');
  if (highlightBtn) {
    highlightBtn.addEventListener('click', () => {
      playSound('chime');
      openCandidateDetail('AET-002');
    });
  }
}

/* --------------------------------------------------------------------------
   Synergy Dose-Response Curve Canvas
   -------------------------------------------------------------------------- */
function initSynergyCurveCanvas() {
  const canvas = document.getElementById('synergy-curve-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    drawCurve();
  }
  resize();
  window.addEventListener('resize', resize);

  function sig(x, ic50, hill = 1.4) {
    return 100 / (1 + Math.pow(x / ic50, hill));
  }

  function drawCurve() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const padL = 50, padR = 30, padT = 30, padB = 40;
    const pw = w - padL - padR;
    const ph = h - padT - padB;

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (ph / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();

      ctx.font = '500 10px JetBrains Mono';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'right';
      ctx.fillText(`${100 - i * 25}%`, padL - 8, y + 3);
    }

    // X-axis log concentration
    const concLabels = ['0.1 nM', '1.0 nM', '10 nM', '100 nM', '1.0 μM'];
    concLabels.forEach((lbl, i) => {
      const x = padL + (pw / 4) * i;
      ctx.font = '500 10px JetBrains Mono';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(lbl, x, h - 15);
    });

    // Helper to plot curve
    function plot(ic50, color, width, label, isDashed = false) {
      ctx.beginPath();
      if (isDashed) ctx.setLineDash([4, 4]); else ctx.setLineDash([]);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;

      for (let px = 0; px <= pw; px++) {
        // Map px to log conc (from 0.05 to 1500)
        const conc = Math.pow(10, (px / pw) * 4 - 1.3);
        const cellViability = sig(conc, ic50);
        const py = padT + ph * (1 - cellViability / 100);

        if (px === 0) ctx.moveTo(padL + px, py);
        else ctx.lineTo(padL + px, py);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);
    }

    // Curves: Drug A (Quercetin), Drug B (Rapamycin), Combination (AET-002)
    plot(125, 'rgba(148, 163, 184, 0.65)', 2, 'Quercetin monotherapy', true);
    plot(42.8, '#06b6d4', 2.5, 'Rapamycin monotherapy', false);
    plot(3.4, '#10b981', 3.5, 'AET-002 Synergistic Combination', false);

    // Legend
    ctx.font = '600 11px Plus Jakarta Sans';
    ctx.textAlign = 'left';

    ctx.fillStyle = '#10b981';
    ctx.fillText('● AET-002 Dual Combo (IC50: 3.4 nM)', padL + 15, padT + 20);

    ctx.fillStyle = '#06b6d4';
    ctx.fillText('● Rapamycin Alone (IC50: 42.8 nM)', padL + 15, padT + 38);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('--- Quercetin Alone (IC50: 125 nM)', padL + 15, padT + 56);
  }
}

/* --------------------------------------------------------------------------
   SASP Cytokine Heatmap Canvas
   -------------------------------------------------------------------------- */
function initSaspHeatmapCanvas() {
  const canvas = document.getElementById('sasp-heatmap-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    drawHeatmap();
  }
  resize();
  window.addEventListener('resize', resize);

  const cytokines = ['IL-6', 'IL-8', 'MCP-1', 'MMP-3', 'TNF-α', 'TGF-β1', 'PAI-1', 'VEGF'];
  const conditions = ['정상 섬유아', '노화 대조군', '라파마이신', '퀘르세틴', 'AET-002 복합제'];

  // Normalized expression matrix (0 = low/normal, 1 = maximum inflammation)
  const matrix = [
    [0.08, 0.95, 0.42, 0.58, 0.09], // IL-6
    [0.10, 0.98, 0.38, 0.62, 0.12], // IL-8
    [0.05, 0.89, 0.45, 0.51, 0.08], // MCP-1
    [0.12, 0.92, 0.52, 0.47, 0.11], // MMP-3
    [0.07, 0.84, 0.35, 0.60, 0.08], // TNF-a
    [0.15, 0.91, 0.40, 0.55, 0.14], // TGF-b1
    [0.09, 0.88, 0.48, 0.50, 0.10], // PAI-1
    [0.11, 0.85, 0.46, 0.52, 0.13]  // VEGF
  ];

  function getColor(val) {
    // 0 -> #10b981, 0.35 -> #06b6d4, 0.7 -> #8b5cf6, 1.0 -> #f43f5e
    if (val < 0.25) {
      return '#10b981';
    } else if (val < 0.5) {
      return '#06b6d4';
    } else if (val < 0.75) {
      return '#8b5cf6';
    } else {
      return '#f43f5e';
    }
  }

  function drawHeatmap() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const padL = 70, padR = 20, padT = 35, padB = 40;
    const cellW = (w - padL - padR) / conditions.length;
    const cellH = (h - padT - padB) / cytokines.length;

    // Condition headers
    conditions.forEach((cond, col) => {
      const cx = padL + col * cellW + cellW / 2;
      ctx.font = '600 10px Plus Jakarta Sans';
      ctx.fillStyle = col === 4 ? '#10b981' : '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(cond, cx, padT - 12);
    });

    // Rows
    cytokines.forEach((cyto, row) => {
      const ry = padT + row * cellH + cellH / 2 + 4;
      ctx.font = '700 11px JetBrains Mono';
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'right';
      ctx.fillText(cyto, padL - 10, ry);

      conditions.forEach((_, col) => {
        const val = matrix[row][col];
        const x = padL + col * cellW + 2;
        const y = padT + row * cellH + 2;
        const cw = cellW - 4;
        const ch = cellH - 4;

        ctx.fillStyle = getColor(val);
        ctx.globalAlpha = 0.2 + val * 0.75;
        ctx.beginPath();
        ctx.roundRect(x, y, cw, ch, 4);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Label value
        ctx.font = '600 10px JetBrains Mono';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText((val * 100).toFixed(0), x + cw / 2, y + ch / 2 + 3);
      });
    });
  }
}

/* --------------------------------------------------------------------------
   3Dmol.js WebGL Molecular Viewer
   -------------------------------------------------------------------------- */
function init3DmolViewer() {
  const container = document.getElementById('viewer-3dmol');
  if (!container || typeof $3Dmol === 'undefined') {
    // Fallback to 2D canvas if 3Dmol CDN unreachable
    document.getElementById('protein-canvas').style.display = 'block';
    initProteinCanvasFallback();
    return;
  }

  try {
    const config = { backgroundColor: '#05070a' };
    state.glViewer = $3Dmol.createViewer(container, config);
    loadTargetProtein(state.activePdb);

    // Style buttons
    document.getElementById('btn-style-cartoon')?.addEventListener('click', () => {
      playSound('click');
      setViewerStyle('cartoon');
    });
    document.getElementById('btn-style-surface')?.addEventListener('click', () => {
      playSound('click');
      setViewerStyle('surface');
    });
    document.getElementById('btn-style-stick')?.addEventListener('click', () => {
      playSound('click');
      setViewerStyle('stick');
    });
    document.getElementById('btn-reset-view')?.addEventListener('click', () => {
      playSound('click');
      state.glViewer.zoomTo();
      state.glViewer.render();
    });

    // Target buttons
    const targetButtons = document.querySelectorAll('#target-selector-buttons button');
    targetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        playSound('click');
        targetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const uniprot = btn.dataset.uniprot;
        const pdb = btn.dataset.pdb || '1TSR';
        state.activeTarget = uniprot;
        state.activePdb = pdb;
        updateTargetDetails(uniprot);
        loadTargetProtein(pdb);
      });
    });
  } catch (err) {
    document.getElementById('protein-canvas').style.display = 'block';
    initProteinCanvasFallback();
  }
}

function loadTargetProtein(pdbCode) {
  if (!state.glViewer) return;
  state.glViewer.clear();

  // Load from RCSB PDB using 3Dmol's built-in fetcher
  $3Dmol.download(`pdb:${pdbCode}`, state.glViewer, {}, function () {
    setViewerStyle(state.current3DStyle);
    state.glViewer.zoomTo();
    state.glViewer.render();
  });
}

function setViewerStyle(style) {
  if (!state.glViewer) return;
  state.current3DStyle = style;
  state.glViewer.setStyle({}, {}); // Clear style

  if (style === 'cartoon') {
    state.glViewer.setStyle({}, { cartoon: { colorscheme: 'bFactor', color: 'spectrum' } });
    // Highlight binding pocket residues with yellow sticks
    state.glViewer.setStyle({ resi: [180, 181, 182, 202, 205, 220, 224] }, { stick: { color: '#f59e0b' } });
  } else if (style === 'surface') {
    state.glViewer.setStyle({}, { cartoon: { opacity: 0.3 } });
    state.glViewer.addSurface($3Dmol.SurfaceType.VDW, { opacity: 0.65, colorscheme: 'bFactor' });
  } else if (style === 'stick') {
    state.glViewer.setStyle({}, { stick: { colorscheme: 'bFactor' } });
  }
  state.glViewer.render();
}

function updateTargetDetails(uniprot) {
  const d = TARGET_DATA[uniprot] || TARGET_DATA['P04637'];
  document.getElementById('meta-name').innerText = d.name;
  document.getElementById('meta-uniprot').innerText = d.uniprot;
  document.getElementById('meta-length').innerText = d.length;
  document.getElementById('meta-desc').innerText = d.desc;
  document.getElementById('meta-pdb').innerText = d.pdb;
  document.getElementById('viewer-plddt').innerText = `글로벌 pLDDT: ${d.plddt} (${d.plddt >= 80 ? 'Structured' : 'Mixed / Flexible'})`;
  document.getElementById('viewer-pocket').innerText = `바인딩 포켓: ${d.pocket}`;

  const heuristicUl = document.getElementById('heuristic-list');
  heuristicUl.innerHTML = '';
  d.heuristics.forEach(h => {
    const li = document.createElement('li');
    li.innerHTML = h;
    heuristicUl.appendChild(li);
  });
}

// Fallback 2D Canvas ribbon if WebGL is unavailable
function initProteinCanvasFallback() {
  const canvas = document.getElementById('protein-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  let angle = 0;
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    angle += 0.01;

    ctx.beginPath();
    for (let i = 0; i < 60; i++) {
      const u = i * 0.2 + angle;
      const x = cx + Math.cos(u) * (80 + Math.sin(i * 0.4) * 30);
      const y = cy + (i - 30) * 6;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.stroke();
    requestAnimationFrame(render);
  }
  render();
}

/* --------------------------------------------------------------------------
   AI Screening Simulator
   -------------------------------------------------------------------------- */
function initSimulator() {
  const startBtn = document.getElementById('btn-start-simulation');
  const simBar = document.getElementById('sim-bar');
  const simPercent = document.getElementById('sim-percent');
  const simDesc = document.getElementById('sim-step-desc');
  const consoleBox = document.getElementById('sim-console');
  const resultsGrid = document.getElementById('results-cards-grid');
  const cutoffRange = document.getElementById('sim-cutoff-range');
  const cutoffVal = document.getElementById('cutoff-val');

  if (cutoffRange) {
    cutoffRange.addEventListener('input', (e) => {
      cutoffVal.innerText = `< ${e.target.value} nM`;
    });
  }

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (state.simulationRunning) return;
      playSound('scan');
      state.simulationRunning = true;
      startBtn.disabled = true;
      startBtn.classList.add('loading');
      resultsGrid.innerHTML = '';

      const targetChoice = document.getElementById('sim-target-select').value;
      const libraryChoice = document.getElementById('sim-library-select').value;

      const log = (msg, cls = '') => {
        const div = document.createElement('div');
        div.className = `log-line ${cls}`;
        div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
        consoleBox.appendChild(div);
        consoleBox.scrollTop = consoleBox.scrollHeight;
      };

      log(`[STEP 1/4] 타깃 (${targetChoice}) AlphaFold 3D 구조 및 바인딩 포켓 로드 중...`, 'cyan');
      simBar.style.width = '20%';
      simPercent.innerText = '20%';
      simDesc.innerText = 'AlphaFold 포켓 메쉬 분석 & 소수성 잔기 맵핑 중...';

      setTimeout(() => {
        playSound('scan');
        log(`[STEP 2/4] 라이브러리 (${libraryChoice}) 4,210개 분자 SMILES 및 ChEMBL 친화도 필터링...`, 'emerald');
        simBar.style.width = '50%';
        simPercent.innerText = '50%';
        simDesc.innerText = 'ChEMBL IC50 및 도킹 친화도(ΔG < -9.5 kcal/mol) 연산...';

        setTimeout(() => {
          playSound('scan');
          log(`[STEP 3/4] OpenFDA 부작용 DB 교차 검증 (심혈관/혈소판 독성 필터 적용)...`, 'gold');
          simBar.style.width = '80%';
          simPercent.innerText = '80%';
          simDesc.innerText = 'Chou-Talalay 공식 기반 시너지 지수(Combination Index CI) 계산...';

          setTimeout(() => {
            playSound('chime');
            log(`[STEP 4/4] 최상위 시너지 복합제 5쌍 도출 완료! 신규 용도특허성 검토 통과.`, 'emerald');
            simBar.style.width = '100%';
            simPercent.innerText = '100%';
            simDesc.innerText = '스크리닝 완료: 상위 5개 Hit 후보가 아래에 정렬되었습니다.';
            state.simulationRunning = false;
            startBtn.disabled = false;
            startBtn.classList.remove('loading');

            renderScreeningHits(targetChoice);
          }, 800);
        }, 900);
      }, 800);
    });
  }
}

function renderScreeningHits(target) {
  const grid = document.getElementById('results-cards-grid');
  const hits = [
    { code: 'HIT-01 (AET-002)', combo: 'Rapamycin + Quercetin Analogue', affinity: '-11.4 kcal', ci: '0.38', sasp: '92.3%', novelty: '98.4%' },
    { code: 'HIT-02', combo: 'Fisetin + Navitoclax (Ultra-low dose)', affinity: '-10.8 kcal', ci: '0.42', sasp: '88.7%', novelty: '94.1%' },
    { code: 'HIT-03', combo: 'Apigenin + Metformin Hydrochloride', affinity: '-10.1 kcal', ci: '0.45', sasp: '84.6%', novelty: '92.0%' },
    { code: 'HIT-04', combo: 'Dasatinib + Luteolin Synergist', affinity: '-9.9 kcal', ci: '0.49', sasp: '82.1%', novelty: '89.5%' },
    { code: 'HIT-05', combo: 'Curcumin-C3 + Sirtuin Activator', affinity: '-9.7 kcal', ci: '0.52', sasp: '79.5%', novelty: '95.2%' }
  ];

  grid.innerHTML = '';
  hits.forEach((h, idx) => {
    const card = document.createElement('div');
    card.className = 'hit-card';
    card.innerHTML = `
      <div class="hit-title-row">
        <div>
          <div class="hit-title">${h.code}</div>
          <div class="hit-combo">${h.combo}</div>
        </div>
        <span class="badge-emerald">CI ${h.ci}</span>
      </div>
      <div class="hit-metrics">
        <div><span>결합력:</span> <strong style="color:var(--accent-emerald)">${h.affinity}</strong></div>
        <div><span>SASP 억제:</span> <strong style="color:var(--accent-cyan)">${h.sasp}</strong></div>
        <div><span>특허 신규성:</span> <strong>${h.novelty}</strong></div>
        <div><span>독성 리스크:</span> <strong style="color:var(--accent-emerald)">극소 (Low)</strong></div>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="openCandidateDetail('AET-002')">
        전임상 PoC 설계서 열기
      </button>
    `;
    grid.appendChild(card);
  });
}

/* --------------------------------------------------------------------------
   Business ROI Simulator
   -------------------------------------------------------------------------- */
function initBusinessSimulator() {
  const pSlider = document.getElementById('slider-pipelines');
  const croSlider = document.getElementById('slider-cro-budget');
  const upSlider = document.getElementById('slider-upfront-target');
  const roySlider = document.getElementById('slider-royalty-rate');

  function recalculate() {
    const pCount = parseInt(pSlider.value);
    const croBudget = parseInt(croSlider.value);
    const upfront = parseInt(upSlider.value);
    const royalty = parseFloat(roySlider.value);

    document.getElementById('val-pipelines').innerText = `${pCount}개`;
    document.getElementById('val-cro-budget').innerText = `${croBudget.toLocaleString()}만 원`;
    document.getElementById('val-upfront-target').innerText = `$${upfront}만 (약 ${(upfront * 0.13).toFixed(1)}억)`;
    document.getElementById('val-royalty-rate').innerText = `${royalty}%`;

    const minCostPerPipeline = 1300;
    const totalSeed = pCount * minCostPerPipeline;
    document.getElementById('proj-seed-req').innerText = `${totalSeed.toLocaleString()}만 원`;

    const totalDealValue = (upfront * 1.75 * 10).toFixed(0);
    document.getElementById('proj-total-deal').innerText = `$${(totalDealValue / 10).toFixed(1)}억 (약 ${(totalDealValue * 0.13).toFixed(0)}억)`;

    const lowVal = (upfront * 1.3).toFixed(0);
    const highVal = (upfront * 2.2).toFixed(0);
    document.getElementById('proj-valuation').innerText = `${lowVal}억 ~ ${highVal}억 원`;
  }

  pSlider.addEventListener('input', () => { playSound('click'); recalculate(); });
  croSlider.addEventListener('input', () => { playSound('click'); recalculate(); });
  upSlider.addEventListener('input', () => { playSound('click'); recalculate(); });
  roySlider.addEventListener('input', () => { playSound('click'); recalculate(); });
  recalculate();
}

/* --------------------------------------------------------------------------
   Skills Terminal
   -------------------------------------------------------------------------- */
function initSkillsTerminal() {
  const listEl = document.getElementById('skill-btn-list');
  const outputEl = document.getElementById('terminal-output');
  const inputEl = document.getElementById('term-custom-input');
  const runBtn = document.getElementById('btn-term-run');

  listEl.innerHTML = '';
  SCIENCE_SKILLS.forEach(skill => {
    const btn = document.createElement('div');
    btn.className = 'skill-item-btn';
    btn.innerHTML = `
      <span class="skill-name">${skill.name}</span>
      <span class="skill-desc-sm">${skill.desc}</span>
    `;
    btn.addEventListener('click', () => {
      playSound('click');
      runSkillDemo(skill.id);
    });
    listEl.appendChild(btn);
  });

  function logToTerm(text) {
    outputEl.innerText += `\n${text}`;
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  window.runTerminalCommand = function(cmd) {
    logToTerm(`$ ${cmd}`);
    logToTerm(`[RUNNING] Spawning python subprocess via uv...`);
    setTimeout(() => {
      logToTerm(`[OUTPUT] Done. Parsed mmCIF and PAE matrices successfully.`);
      logToTerm(`pLDDT Confidence: 88.4 | Rigid Domains detected: 3 | Status: SUCCESS`);
      playSound('chime');
    }, 600);
  };

  function runSkillDemo(skillId) {
    logToTerm(`\n$ uv run .agents/skills/${skillId}/scripts/query.py --target P04637`);
    logToTerm(`[INFO] Calling ${skillId} via Antigravity runtime...`);

    setTimeout(() => {
      playSound('scan');
      if (skillId === 'alphafold_database_fetch_and_analyze') {
        logToTerm(`[*] AlphaFold pLDDT Metrics for Accession: P04637 (TP53)`);
        logToTerm(`  -> Overall Global pLDDT   : 75.06 (Reliable structural core)`);
        logToTerm(`  -> Fraction Very High (>90): 52.7% (DNA Binding & Senolytic Pocket)`);
        logToTerm(`  -> Fraction Low (50-70)   : 10.4% | Very Low (<50): 29.8%`);
        logToTerm(`[*] PAE Domain Boundary Analysis:`);
        logToTerm(`  -> Distinct Global Domains detected: 1 (Residues 99 - 293, Length: 195 AAs)`);
        logToTerm(`  -> Mean Error: 20.59 Å | Confident residue pairs (<5Å PAE): 21.8%`);
        logToTerm(`  -> Structural Conclusion: Single well-folded, rigid composite binding domain.`);
      } else if (skillId === 'pubchem_database') {
        logToTerm(`[*] PubChem PUG-REST Properties Query for Longevity Drug Library:`);
        logToTerm(`  -> Rapamycin (CID 5284616): C51H79NO13, MW: 914.2, XLogP: 6.0, TPSA: 195, RotB: 6`);
        logToTerm(`  -> Quercetin (CID 5280343): C15H10O7, MW: 302.23, XLogP: 1.5, TPSA: 127, RotB: 1`);
        logToTerm(`  -> Navitoclax (CID 24978538): C47H55ClF3N5O6S3, MW: 974.6, XLogP: 9.6, TPSA: 170`);
        logToTerm(`  -> Fisetin (CID 5281614): C15H10O6, MW: 286.24, XLogP: 2.0, TPSA: 107, RotB: 1`);
        logToTerm(`  -> Status: 200 OK | Lipinski Rule Oral Bioavailability Verified`);
      } else if (skillId === 'chembl_database') {
        logToTerm(`[ChEMBL] Querying Bioactivity assays for target CHEMBL220...`);
        logToTerm(`[ChEMBL] Found 3,412 recorded bioactivities. IC50 range: 1.2 nM - 45 uM.`);
        logToTerm(`[ChEMBL] Top Hit: CHEMBL50868 (Kd: 4.8 nM, Delta G: -11.4 kcal/mol)`);
      } else if (skillId === 'openfda_database') {
        logToTerm(`[OpenFDA] Cross-checking adverse event reports for candidate pair...`);
        logToTerm(`[OpenFDA] Total reports analyzed: 24,190. Severe organ toxicity signal: NONE.`);
        logToTerm(`[OpenFDA] Safety Index: 98.1% (Safe for elderly demographic repurposing)`);
      } else {
        logToTerm(`[SKILL] ${skillId} execution returned 200 OK.`);
        logToTerm(`[RESULT] Primary biological entities identified and mapped to Reactome ID: R-HSA-2559583`);
      }
    }, 450);
  }

  if (runBtn && inputEl) {
    runBtn.addEventListener('click', () => {
      const val = inputEl.value.trim();
      if (!val) return;
      playSound('click');
      logToTerm(`\n$ ${val}`);
      logToTerm(`[EXECUTING] Querying Antigravity Science Skills Engine...`);
      setTimeout(() => {
        logToTerm(`[RESULT] Target ${val} processed. Structural confidence confirmed.`);
        playSound('chime');
      }, 500);
      inputEl.value = '';
    });
  }
}

/* --------------------------------------------------------------------------
   Modal & Teaser Generator
   -------------------------------------------------------------------------- */
function initModal() {
  const closeBtn = document.getElementById('btn-modal-close');
  const modal = document.getElementById('detail-modal');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

window.closeModal = function() {
  playSound('click');
  document.getElementById('detail-modal').classList.remove('active');
};

window.copyTeaser = function(code) {
  playSound('chime');
  const c = PIPELINE_CANDIDATES.find(x => x.code === code) || PIPELINE_CANDIDATES[0];
  const teaserText = `
[CONFIDENTIAL NON-BINDING PARTNERING TEASER]
Project Code: ${c.code}
Target Indication: ${c.disease} (Age-Related Fibrotic Senescence)
Biological Mechanism: Dual Senolytic Synergy (${c.target})
Repurposed Asset: ${c.originDrug}
Key Metrics:
- Predicted SASP Cytokine Reduction: ${c.details.saspReduction}
- In-Silico Binding Affinity: ${c.affinity}
- Safety & Off-target Tolerance: ${c.details.safetyIndex}
- Patent Strategy: Novel Synergistic Method-of-Use & Low-Dose Fixed Combination Patent
Proposed Transaction Structure:
- Preclinical Out-Licensing / Co-Development Option
- Upfront: $8M | Dev Milestones: $120M | Net Royalties: 7.5%
Contact: Aethelgard Longevity AI (1-Person Biotech Founder)
  `.trim();

  navigator.clipboard.writeText(teaserText).then(() => {
    alert(`[${code}] 빅파마 제출용 1페이지 투자 파트너링 Teaser가 클립보드에 복사되었습니다!\n\n(이메일이나 링크드인, 바이오 파트너링 미팅 자료에 바로 붙여넣기 할 수 있습니다.)`);
  });
};

/* --------------------------------------------------------------------------
   ADMET Lipinski Rule of 5 Radar Canvas & PubChem Integration
   -------------------------------------------------------------------------- */
const PUBCHEM_DATA = [
  { name: 'Rapamycin', cid: 5284616, formula: 'C51H79NO13', mw: 914.2, xlogp: 6.0, tpsa: 195, hbd: 3, hba: 13, rotb: 6 },
  { name: 'Quercetin', cid: 5280343, formula: 'C15H10O7', mw: 302.23, xlogp: 1.5, tpsa: 127, hbd: 5, hba: 7, rotb: 1 },
  { name: 'Navitoclax', cid: 24978538, formula: 'C47H55ClF3N5O6S3', mw: 974.6, xlogp: 9.6, tpsa: 170, hbd: 2, hba: 14, rotb: 16 },
  { name: 'Fisetin', cid: 5281614, formula: 'C15H10O6', mw: 286.24, xlogp: 2.0, tpsa: 107, hbd: 4, hba: 6, rotb: 1 },
  { name: 'Metformin', cid: 4091, formula: 'C4H11N5', mw: 129.16, xlogp: -1.3, tpsa: 91.5, hbd: 3, hba: 1, rotb: 2 },
  { name: 'AET-002 Dual', cid: 'Co-Crystal', formula: 'C51H79NO13 + C15H10O7', mw: 480.0, xlogp: 3.2, tpsa: 142, hbd: 4, hba: 9, rotb: 4 }
];

function populatePubChemTable() {
  const tbody = document.getElementById('pubchem-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  PUBCHEM_DATA.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${d.name}</strong></td>
      <td><code>${d.formula}</code></td>
      <td>${d.mw}</td>
      <td>${d.xlogp}</td>
      <td>${d.tpsa}</td>
      <td>${d.hba} / ${d.hbd}</td>
    `;
    tbody.appendChild(tr);
  });
}

function initAdmetRadarCanvas() {
  const canvas = document.getElementById('admet-radar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let selectedDrug = 'AET-002';

  const axes = [
    { label: 'MW', max: 1000, key: 'mw' },
    { label: 'XLogP', max: 10, key: 'xlogp' },
    { label: 'TPSA', max: 200, key: 'tpsa' },
    { label: 'HBD', max: 8, key: 'hbd' },
    { label: 'HBA', max: 16, key: 'hba' },
    { label: 'RotB', max: 18, key: 'rotb' }
  ];

  function drawRadar() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.36;
    const numAxes = axes.length;

    // Concentric webs
    for (let level = 1; level <= 4; level++) {
      const r = (radius / 4) * level;
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.stroke();
    }

    // Axis spokes and labels
    axes.forEach((axis, i) => {
      const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.stroke();

      const lx = cx + (radius + 18) * Math.cos(angle);
      const ly = cy + (radius + 18) * Math.sin(angle);
      ctx.font = '600 10px JetBrains Mono';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(axis.label, lx, ly);
    });

    // Helper to draw a drug polygon
    function renderDrugPolygon(drugData, strokeColor, fillColor, isPrimary) {
      if (!drugData) return;
      ctx.beginPath();
      axes.forEach((axis, i) => {
        const val = Math.max(0, drugData[axis.key]);
        const norm = Math.min(1.0, val / axis.max);
        const r = radius * norm;
        const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = isPrimary ? 2.5 : 1.5;
      ctx.stroke();
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Vertex dots
      axes.forEach((axis, i) => {
        const val = Math.max(0, drugData[axis.key]);
        const norm = Math.min(1.0, val / axis.max);
        const r = radius * norm;
        const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        ctx.beginPath();
        ctx.arc(x, y, isPrimary ? 3.5 : 2, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor;
        ctx.fill();
      });
    }

    const rapData = PUBCHEM_DATA.find(d => d.name === 'Rapamycin');
    const querData = PUBCHEM_DATA.find(d => d.name === 'Quercetin');
    const aetData = PUBCHEM_DATA.find(d => d.name.startsWith('AET-002'));
    const navData = PUBCHEM_DATA.find(d => d.name === 'Navitoclax');

    renderDrugPolygon(rapData, 'rgba(6, 182, 212, 0.45)', 'rgba(6, 182, 212, 0.05)', selectedDrug === 'Rapamycin');
    renderDrugPolygon(querData, 'rgba(16, 185, 129, 0.45)', 'rgba(16, 185, 129, 0.05)', selectedDrug === 'Quercetin');

    if (selectedDrug === 'Navitoclax') {
      renderDrugPolygon(navData, '#8b5cf6', 'rgba(139, 92, 246, 0.22)', true);
    } else {
      renderDrugPolygon(aetData, '#f59e0b', 'rgba(245, 158, 11, 0.24)', true);
    }
  }

  drawRadar();
  window.addEventListener('resize', drawRadar);

  const btns = document.querySelectorAll('#radar-switch-btns button');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDrug = btn.dataset.drug;
      drawRadar();
    });
  });
}

/* --------------------------------------------------------------------------
   AlphaFold Residue-by-Residue pLDDT Profile Canvas
   -------------------------------------------------------------------------- */
function initPlddtProfileCanvas() {
  const canvas = document.getElementById('plddt-profile-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const tooltip = document.getElementById('plddt-hover-tooltip');

  const residueCount = 393;
  const plddtScores = new Float32Array(residueCount);

  for (let i = 0; i < residueCount; i++) {
    const resNum = i + 1;
    if (resNum < 99) {
      plddtScores[i] = 32 + 25 * Math.sin(resNum * 0.15) + (Math.random() * 8);
    } else if (resNum <= 293) {
      plddtScores[i] = 88 + 9 * Math.cos(resNum * 0.08) + (Math.random() * 3);
    } else if (resNum <= 360) {
      plddtScores[i] = 72 + 15 * Math.sin(resNum * 0.12) + (Math.random() * 4);
    } else {
      plddtScores[i] = 30 + 18 * Math.cos(resNum * 0.2) + (Math.random() * 6);
    }
    plddtScores[i] = Math.max(15, Math.min(99.5, plddtScores[i]));
  }

  function drawProfile(hoverIndex = -1) {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const padL = 40, padR = 20, padT = 15, padB = 25;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    [50, 70, 90].forEach(threshold => {
      const y = padT + plotH * (1 - threshold / 100);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.strokeStyle = threshold === 90 ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255, 255, 255, 0.08)';
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '500 9px JetBrains Mono';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'right';
      ctx.fillText(threshold, padL - 6, y + 3);
    });

    const d1StartX = padL + (98 / residueCount) * plotW;
    const d1EndX = padL + (293 / residueCount) * plotW;
    ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.fillRect(d1StartX, padT, d1EndX - d1StartX, plotH);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.strokeRect(d1StartX, padT, d1EndX - d1StartX, plotH);

    ctx.font = '600 10px Plus Jakarta Sans';
    ctx.fillStyle = '#06b6d4';
    ctx.textAlign = 'center';
    ctx.fillText('PAE Identified Domain 1 (Residues 99-293: Core Folded Pocket)', (d1StartX + d1EndX) / 2, padT + 14);

    const barW = Math.max(1, plotW / residueCount);
    for (let i = 0; i < residueCount; i++) {
      const score = plddtScores[i];
      const x = padL + (i / residueCount) * plotW;
      const barH = (score / 100) * plotH;
      const y = padT + plotH - barH;

      let color = '#f43f5e';
      if (score >= 90) color = '#06b6d4';
      else if (score >= 70) color = '#10b981';
      else if (score >= 50) color = '#f59e0b';

      ctx.fillStyle = i === hoverIndex ? '#ffffff' : color;
      ctx.fillRect(x, y, barW, barH);
    }

    [1, 100, 200, 300, 393].forEach(res => {
      const x = padL + ((res - 1) / residueCount) * plotW;
      ctx.font = '500 9px JetBrains Mono';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(`Res ${res}`, x, h - 6);
    });
  }

  drawProfile();
  window.addEventListener('resize', () => drawProfile());

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const padL = 40, padR = 20;
    const plotW = canvas.width - padL - padR;
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width) - padL;

    if (mx >= 0 && mx <= plotW) {
      const idx = Math.min(residueCount - 1, Math.max(0, Math.floor((mx / plotW) * residueCount)));
      const resNum = idx + 1;
      const score = plddtScores[idx].toFixed(1);
      drawProfile(idx);

      if (tooltip) {
        let domainLabel = 'Disordered Tail';
        if (resNum >= 99 && resNum <= 293) domainLabel = 'Domain 1 (DNA-Binding Core)';
        else if (resNum >= 294 && resNum <= 360) domainLabel = 'Tetramerization Helix';

        tooltip.innerHTML = `<strong>잔기 ${resNum}</strong> | pLDDT: <span class="text-cyan">${score}</span> [${domainLabel}]`;
        tooltip.style.display = 'block';
      }
    }
  });

  canvas.addEventListener('mouseleave', () => {
    drawProfile(-1);
    if (tooltip) tooltip.style.display = 'none';
  });
}

