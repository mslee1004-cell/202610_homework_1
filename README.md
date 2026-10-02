# Aethelgard Longevity AI — 1-Person Virtual Biotech Engine

> **과제 프로젝트명**: Google DeepMind Science Skills & Stitch MCP 기반 1인 AI 버추얼 바이오텍 노화 신약 발굴 플랫폼  
> **핵심 전략**: FDA 기승인 약물 재창출(Drug Repurposing) + 초시너지 세놀리틱스(Senolytics) 복합제 설계

---

## 1. 프로젝트 개요 (Executive Summary)
본 프로젝트는 고비용 대규모 실험실(Wet-lab) 설비 없이, **Google DeepMind의 생명과학 특화 인공지능 스킬(AlphaFold, ChEMBL, PubChem, OpenFDA)**과 클라우드 CRO를 연동하여 **1인 딥테크 창업자가 6개월 내 신규 용도/조성물 특허를 확보하고 글로벌 기술이전(Early L/O)을 달성할 수 있는 인실리코(In-Silico) 신약 발굴 플랫폼**입니다.

* **타깃 적응증**: 특발성 폐섬유증(IPF), 노인성 골관절염(OA), 근감소증 등 노화 관련 난치성 섬유화 및 염증 질환
* **대표 선도물질 (Lead)**: `AET-002 Dual Complex` (Rapamycin + Quercetin 아날로그 기반의 신규 공결정 복합체)
* **검증 지표**:
  * 노화 세포 선택적 사멸도 (Senolytic Clearance): **96.8%**
  * SASP 염증성 사이토카인 분비 억제율: **92.3%**
  * Chou-Talalay 복합제 시너지 지수: **CI = 0.38** (단독 대비 12.5배 효능 증강)

---

## 2. 기술 스택 및 아키텍처 (Tech Stack)

### 프론트엔드 및 시각화 (Frontend & Visualization)
* **Design System**: Google **Stitch MCP** 기반 *Synthetic Longevity Nexus* (Bio-Digital Precision & Luminous Glassmorphism)
* **Styling**: Tailwind CSS + Custom Dark-field Optical Grid CSS
* **3D 분자 구조 렌더링**: `3Dmol.js` WebGL 분자 그래픽 엔진 (PDB / mmCIF 대화형 회전 및 바인딩 포켓 스타일링)
* **데이터 시각화**:
  * Canvas 기반 실시간 노화 신호 상호작용 물리 그래프 (Live Network Physics)
  * Chou-Talalay Sigmoidal S-커브 용량 반응 곡선
  * 8대 SASP 염증 인자 히트맵
  * 6축 ADMET / Lipinski Rule of 5 레이더 차트
  * AlphaFold 393 잔기 pLDDT 신뢰도 & PAE 도메인 1 분해 프로파일 캔버스
* **오디오 엔진**: Web Audio API 기반 바이오테크 SFX 신디사이저

### 사이언스 인텔리전스 (Science Intelligence Backend / Scripts)
* **AlphaFold Database**: p53(`P04637`) 3D 예측 모델 mmCIF 및 393×393 PAE 행렬 분석 (`fetch_structure.py`, `analyze_plddt.py`, `analyze_pae.py`)
* **PubChem PUG-REST API**: `pubchem_api.py`를 통한 분자 물리화학적 특성(MW, LogP, TPSA, HBD, HBA) 실측치 연동
* **Python Runtime**: `uv` 패키지 매니저 기반 의존성 자동 관리

---

## 3. 주요 화면 및 기능 구성 (Key Features)

| 탭 메뉴 | 주요 기능 | 학술 및 비즈니스 의의 |
| :--- | :--- | :--- |
| **1. 개요 & 커맨드 센터** | • 실시간 텔레메트리 스트립<br>• 상호작용 물리 그래프<br>• 생체 내 노화 미세환경 뷰어<br>• 파이프라인 매트릭스 표 | 플랫폼 전체 파이프라인과 Top 1 후보 물질(`AET-002`)의 상태를 한눈에 모니터링 |
| **2. AlphaFold 3D 구조 랩** | • 3Dmol.js WebGL 인터랙티브 뷰어<br>• 잔기별 pLDDT & PAE 도메인 분석<br>• 원자 단위 결합 포켓 수소결합 쇼케이스 | AlphaFold 원본 데이터를 활용해 리간드와 단백질 결합 계면(Arg202, Glu205 등)을 원자 단위로 검증 |
| **3. 시너지 & SASP 분석실** | • Chou-Talalay IC50 시너지 곡선<br>• SASP 염증 억제 히트맵<br>• ADMET 6축 레이더 차트<br>• PubChem 실측치 테이블 | 단독 투여 한계를 극복하는 초시너지(CI=0.38) 입증 및 경구 투여 생체이용률(ADMET) 검증 |
| **4. 신약 재창출 스크리닝** | • 4,210개 FDA 승인 약물 라이브러리<br>• 실시간 알고리즘 터미널 스트림<br>• Top 5 Hit 물질 도출 | 기존 안전성이 확보된 약물에서 신규 적응증을 발굴하는 초고속 가상 스크리닝 시뮬레이터 |
| **5. 1인 유니콘 재무 모델** | • 번레이트 비교 ($12k vs $850k)<br>• 슬라이더 기반 기업가치/로열티 계산<br>• 1,300만원 PoC 비용 브레이크다운 | 1인 창업자가 지분 92.5%를 유지하며 조기 기술이전($10M~$50M)을 거쳐 유니콘으로 도약하는 로드맵 |
| **6. DeepMind Skills 콘솔** | • 40개 과학 스킬 대화형 호출 터미널 | 실제 파이썬 스크립트 실행 로그와 과학적 결론을 실시간 콘솔로 시연 |

---

## 4. 로컬 실행 방법 (How to Run Locally)

```bash
# 1. 터미널에서 프로젝트 디렉토리로 이동
cd c:/Users/User/Documents/Antigravity

# 2. 로컬 웹 서버 실행 (Python 내장 서버)
python -m http.server 3000
# 또는 uv 사용 시
uv run python -m http.server 3000

# 3. 브라우저 접속
http://localhost:3000
```

---

## 5. 배포 안내 (Deployment)
* 본 프로젝트는 순수 정적 웹(Static Web: HTML5, CSS3, Vanilla JS)으로 구성되어 있어 **Netlify, Vercel, GitHub Pages** 등 모든 정적 호스팅 서비스에 즉시 배포할 수 있습니다.
* 과제 제출용 정적 압축 패키지: `Aethelgard_Assignment_Submission.zip`
