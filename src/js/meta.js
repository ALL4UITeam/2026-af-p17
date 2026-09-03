/**
 * meta.js — 레이어 메타정보 팝업 데이터
 *
 * 관련: map.js (openMetaPop) · partials/pop-meta.hbs · docs/MAP-SCRIPT.md
 *
 * ── 섹션 / export 목차 ────────────────────────────────
 *  MOCK_META           목업 데이터 (API 대체 전)
 *  fillMetaPop(data)   #metaPop [data-meta=*] 채우기
 *  setMetaFetcher(fn)  조회 함수 교체 (개발)
 *  fetchLayerMeta(id)  레이어 메타 조회
 *
 * 연동 흐름:
 *   .leaf__info[data-layer-id] 클릭
 *     → fetchLayerMeta(id)
 *     → fillMetaPop(data)
 *     → openMetaPop(title, trigger)  // map.js
 * ─────────────────────────────────────────────────────
 */

/* —— 상수 · 아이콘 맵 —— */
const CHIP_CLASS = {
  mof: 'pop__chip--mof',
  gov: 'pop__chip--gov',
  src: 'pop__chip--src',
}

const BADGE_CLASS = {
  open: 'pop__badge--open',
  db: 'pop__badge--db',
}

const CARD_ICON = {
  folder: { src: './src/assets/img/icon/pop-folder.svg', round: false },
  graph: { src: './src/assets/img/icon/pop-graph.svg', round: false },
  building: { src: './src/assets/img/icon/pop-building.svg', round: true },
  desktop: { src: './src/assets/img/icon/pop-desktop.svg', round: true },
}

const CHEVRON = './src/assets/img/icon/pop-chevron-right.svg'

/* —— 목업 —— */
/** @type {Record<string, object>} API 대체 전용 */
export const MOCK_META = {
  LYR_ROUTE_ACCESS: {
    id: 'LYR_ROUTE_ACCESS',
    title: '추천항로접속항로',
    badges: [
      { type: 'open', label: '공개' },
      { type: 'db', label: '기초 DB' },
    ],
    overview: {
      desc: '다양한 해양활동과 편의제공을 위한 요트 추천항로_ 마리나 항만시설 등 안전하고 편리한 해양활동 정보를 제공.요트 연결항로 및 접속항로에 대한 정보 제공',
      classes: [
        {
          chip: 'mof',
          chipLabel: '해양수산분류',
          path: ['공공질서 및 안전', '해경', '해상안전'],
        },
        {
          chip: 'gov',
          chipLabel: '정부지능분야',
          path: ['해사안전', '해사안전관리', '해양재난안전'],
        },
        {
          chip: 'src',
          chipLabel: '원천출처',
          path: ['해사안전'],
        },
      ],
      tags: ['요트', '항로', '연결', '접속', '불규칙', '흐름', '소용돌이'],
      cards: [
        { icon: 'folder', label: '유형', value: '공간 자료(좌표형)' },
        { icon: 'graph', label: '자료생산 진행상태', value: '규칙적 생산진행' },
        { icon: 'building', label: '관리기관(부서)', value: '국립해양조사원(해도수로과)' },
        { icon: 'desktop', label: '관리기관 시스템', value: '개방해' },
      ],
    },
    spatial: '공간 메타정보 내용(목업)',
    marine: '해양특성 메타정보 내용(목업)',
    model: '데이터모델 메타정보 내용(목업)',
    dataView: '데이터보기 내용(목업)',
  },
  LYR_CATCH: {
    id: 'LYR_CATCH',
    title: '연근해 어획량',
    badges: [{ type: 'open', label: '공개' }],
    overview: {
      desc: '연근해 어획량 메타정보 목업입니다. 실제 연동 시 API 응답으로 교체하세요.',
      classes: [
        { chip: 'mof', chipLabel: '해양수산분류', path: ['수산', '어업'] },
      ],
      tags: ['어획', '연근해'],
      cards: [
        { icon: 'folder', label: '유형', value: '통계 자료' },
        { icon: 'graph', label: '자료생산 진행상태', value: '비정기' },
        { icon: 'building', label: '관리기관(부서)', value: '해양수산부' },
        { icon: 'desktop', label: '관리기관 시스템', value: '통계시스템' },
      ],
    },
    spatial: '어획량 공간 메타(목업)',
    marine: '어획량 해양특성(목업)',
    model: '어획량 데이터모델(목업)',
    dataView: '어획량 데이터보기(목업)',
  },
}

/* —— DOM 헬퍼 —— */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function pathHtml(parts = []) {
  return parts
    .map((p, i) => {
      const bit = `<span>${esc(p)}</span>`
      if (i === parts.length - 1) return bit
      return `${bit}<img src="${CHEVRON}" width="12" height="12" alt="" aria-hidden="true">`
    })
    .join('')
}

function defaultMeta(id, fallbackTitle) {
  return {
    id,
    title: fallbackTitle || id || '레이어',
    badges: [{ type: 'open', label: '공개' }],
    overview: {
      desc: `레이어(${id || 'unknown'}) 메타정보가 없습니다. fetchLayerMeta / setMetaFetcher 를 연결하세요.`,
      classes: [],
      tags: [],
      cards: [],
    },
    spatial: '',
    marine: '',
    model: '',
    dataView: '',
  }
}

/* —— fillMetaPop —— */
/**
 * #metaPop DOM에 데이터 주입
 * @param {object} data MOCK_META 형태
 */
export function fillMetaPop(data) {
  const root = document.getElementById('metaPop')
  if (!root || !data) return

  const title = root.querySelector('#metaPopTitle')
  if (title) title.textContent = data.title ?? ''

  const badges = root.querySelector('[data-meta="badges"]')
  if (badges) {
    badges.innerHTML = (data.badges ?? [])
      .map((b) => {
        const cls = BADGE_CLASS[b.type] || BADGE_CLASS.open
        return `<span class="pop__badge ${cls}">${esc(b.label)}</span>`
      })
      .join('')
  }

  const ov = data.overview ?? {}
  const desc = root.querySelector('[data-meta="desc"]')
  if (desc) desc.textContent = ov.desc ?? ''

  const classes = root.querySelector('[data-meta="classes"]')
  if (classes) {
    classes.innerHTML = (ov.classes ?? [])
      .map((row) => {
        const chipCls = CHIP_CLASS[row.chip] || CHIP_CLASS.mof
        return `<li class="pop__class-row">
          <span class="pop__chip ${chipCls}">${esc(row.chipLabel)}</span>
          <span class="pop__path">${pathHtml(row.path)}</span>
        </li>`
      })
      .join('')
  }

  const tags = root.querySelector('[data-meta="tags"]')
  if (tags) {
    tags.innerHTML = (ov.tags ?? [])
      .map((t) => `<li><span class="pop__tag"># ${esc(t)}</span></li>`)
      .join('')
  }

  const cards = root.querySelector('[data-meta="cards"]')
  if (cards) {
    cards.innerHTML = (ov.cards ?? [])
      .map((c) => {
        const icon = CARD_ICON[c.icon] || CARD_ICON.folder
        const round = icon.round ? ' pop__card-ico--round' : ''
        const size = icon.round ? 24 : 40
        return `<li class="pop__card">
          <span class="pop__card-ico${round}" aria-hidden="true">
            <img src="${icon.src}" width="${size}" height="${size}" alt="">
          </span>
          <span class="pop__card-txt">
            <strong>${esc(c.label)}</strong>
            <span>${esc(c.value)}</span>
          </span>
        </li>`
      })
      .join('')
  }

  const setTxt = (key, value) => {
    const el = root.querySelector(`[data-meta="${key}"]`)
    if (el) el.textContent = value ?? ''
  }
  setTxt('spatial', data.spatial)
  setTxt('marine', data.marine)
  setTxt('model', data.model)
  setTxt('dataView', data.dataView)

  root.dataset.layerId = data.id ?? ''
}

/* —— 조회 (개발이 setMetaFetcher 로 API 교체) —— */
/** @type {(id: string) => Promise<object>} */
let metaFetcher = async (id) => {
  // TODO(dev): return await fetch(`/api/layers/${id}/meta`).then(r => r.json())
  if (MOCK_META[id]) return structuredClone(MOCK_META[id])
  return defaultMeta(id)
}

/** API 조회 함수 교체 (개발용) */
export function setMetaFetcher(fn) {
  if (typeof fn === 'function') metaFetcher = fn
}

/** 레이어 메타 조회 */
export async function fetchLayerMeta(id, fallbackTitle) {
  try {
    const data = await metaFetcher(id)
    if (data) return data
  } catch (err) {
    console.error('[meta] fetchLayerMeta failed', id, err)
  }
  return defaultMeta(id, fallbackTitle)
}
