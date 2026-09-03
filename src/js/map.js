/**
 * map.js — 지도 UI 진입점 (PC + 모바일)
 *
 * 관련: a11y.js / meta.js / zoom.js · docs/MAP-SCRIPT.md
 *
 * ── 섹션 목차 ─────────────────────────────────────────
 *  1. 셸 · 패널 · LNB
 *  2. 레이어 패널 (.layer__item / .sub__row / .sub__add / .leaf__star)
 *  3. 메타정보 팝업 (dialog · 탭 · 아코디언 · MapUI)
 *  4. 트리 · 체크 · 검색
 *  5. 줌 · PC 도구 · 범례
 *  6. 좌표 포맷 셀렉트
 *  7. 모바일 (바텀시트 · 도구 · 전체메뉴)
 *  8. Esc 공통
 * ─────────────────────────────────────────────────────
 */
import '../scss/main.scss'
import {
  announce,
  bindTablist,
  focusPanel,
  setBackgroundInert,
  setPressed,
  trapFocus,
} from './a11y.js'
import {
  fetchLayerMeta,
  fillMetaPop,
  MOCK_META,
  setMetaFetcher,
} from './meta.js'
import { createZoom } from './zoom.js'

/* —— 1. 셸 · 패널 · LNB —— */
const app = document.getElementById('app')
const panel = document.getElementById('layerPanel')
const handle = document.getElementById('panelHandle')
const lnbItems = document.querySelectorAll('.lnb__item')
const searchForm = document.querySelector('.search')
const searchInput = document.getElementById('placeSearch')

function setPanel(open) {
  app.classList.toggle('is-open', open)
  handle.setAttribute('aria-expanded', String(open))
  handle.setAttribute('aria-label', open ? '패널 접기' : '패널 펼치기')
  panel.setAttribute('aria-hidden', String(!open))
  panel.toggleAttribute('inert', !open)

  if (open) {
    focusPanel(panel)
    announce('검색 패널이 열렸습니다.')
    return
  }

  handle.focus()
  announce('검색 패널이 닫혔습니다.')
}

handle.addEventListener('click', () => {
  setPanel(!app.classList.contains('is-open'))
})

lnbItems.forEach((item) => {
  item.addEventListener('click', () => {
    lnbItems.forEach((el) => {
      el.classList.remove('lnb__item--on')
      el.setAttribute('aria-current', 'false')
    })
    item.classList.add('lnb__item--on')
    item.setAttribute('aria-current', 'page')
    announce(`${item.textContent.trim().replace(/\s+/g, ' ')} 메뉴 선택`)
  })
})

/* —— 2. 레이어 패널 (아코디언 · 추가 · 즐겨찾기) —— */
document.querySelectorAll('.layer__item').forEach((btn) => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true'
    const body = document.getElementById(btn.getAttribute('aria-controls'))
    btn.setAttribute('aria-expanded', String(!expanded))
    if (body) body.hidden = expanded
    announce(`${btn.querySelector('.layer__name')?.textContent ?? ''} ${expanded ? '접힘' : '펼침'}`)
  })
})

/** .sub__row 펼침/접힘 — 같은 .sub 안에서는 하나만 열림 */
function setSubRowOpen(btn, open) {
  const id = btn.getAttribute('aria-controls')
  const body =
    (id && document.getElementById(id)) ||
    btn.parentElement?.querySelector(':scope > .leaf, :scope > .tree')
  btn.setAttribute('aria-expanded', String(open))
  btn.classList.toggle('sub__row--on', open)
  if (body) body.hidden = !open
}

panel?.addEventListener('click', (e) => {
  const addBtn = e.target.closest('.sub__add')
  if (addBtn && panel.contains(addBtn)) {
    e.stopPropagation()
    const on = addBtn.getAttribute('aria-pressed') !== 'true'
    addBtn.setAttribute('aria-pressed', String(on))
    const base = (addBtn.getAttribute('aria-label') ?? '레이어')
      .replace(/\s*(추가|제거)$/, '')
      .trim()
    addBtn.setAttribute('aria-label', `${base} ${on ? '제거' : '추가'}`)
    announce(`${base} ${on ? '선택' : '선택 해제'}`)
    return
  }

  const btn = e.target.closest('button.sub__row[aria-expanded]')
  if (!btn || !panel.contains(btn)) return

  const willOpen = btn.getAttribute('aria-expanded') !== 'true'
  const list = btn.closest('.sub')

  if (willOpen && list) {
    list.querySelectorAll('button.sub__row[aria-expanded="true"]').forEach((other) => {
      if (other !== btn) setSubRowOpen(other, false)
    })
  }

  setSubRowOpen(btn, willOpen)
  announce(`${btn.querySelector('.sub__name')?.textContent ?? ''} ${willOpen ? '펼침' : '접힘'}`)
})

document.querySelectorAll('.leaf__star').forEach((btn) => {
  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true'
    btn.setAttribute('aria-pressed', String(on))
    announce(`${btn.getAttribute('aria-label') ?? '즐겨찾기'} ${on ? '추가' : '해제'}`)
  })
})

/* —— 3. 메타정보 팝업 (dialog) —— */
const metaPop = document.getElementById('metaPop')
const metaPopDim = document.getElementById('metaPopDim')
const metaPopClose = document.getElementById('metaPopClose')
const metaPopTitle = document.getElementById('metaPopTitle')
let metaPopTrigger = null
let releaseMetaTrap = null

function openMetaPop(title, trigger) {
  if (!metaPop || !metaPop.hidden) return
  metaPopTrigger = trigger || document.activeElement
  if (metaPopTitle && title) metaPopTitle.textContent = title
  metaPop.hidden = false
  if (metaPopDim) {
    metaPopDim.hidden = false
    metaPopDim.setAttribute('aria-hidden', 'true')
  }
  setBackgroundInert(true, [metaPop, metaPopDim])
  releaseMetaTrap = trapFocus(metaPop, { initialFocus: metaPopClose })
  announce(`${title || '레이어'} 메타정보 대화상자`)
}

function closeMetaPop() {
  if (!metaPop || metaPop.hidden) return
  releaseMetaTrap?.()
  releaseMetaTrap = null
  metaPop.hidden = true
  if (metaPopDim) metaPopDim.hidden = true
  setBackgroundInert(false, [metaPop, metaPopDim])
  announce('메타정보가 닫혔습니다.')
  const back = metaPopTrigger
  metaPopTrigger = null
  window.requestAnimationFrame(() => back?.focus?.())
}

/** .leaf__info 클릭 → fetch → fill → open */
async function openMetaFromButton(btn) {
  const id = btn.dataset.layerId || ''
  const fallback = btn.getAttribute('aria-label')?.replace(/\s*정보$/, '') || '레이어'
  const data = await fetchLayerMeta(id, fallback)
  fillMetaPop(data)
  openMetaPop(data.title || fallback, btn)
}

document.querySelectorAll('.leaf__info').forEach((btn) => {
  btn.addEventListener('click', () => {
    openMetaFromButton(btn)
  })
})

metaPopClose?.addEventListener('click', closeMetaPop)
metaPopDim?.addEventListener('click', closeMetaPop)

/** 개발 연동용 공개 API — window.MapUI */
window.MapUI = {
  openMeta: async (layerId, trigger) => {
    const data = await fetchLayerMeta(layerId)
    fillMetaPop(data)
    openMetaPop(data.title, trigger || null)
  },
  closeMeta: closeMetaPop,
  fillMeta: fillMetaPop,
  setMetaFetcher,
  MOCK_META,
}

bindTablist(metaPop?.querySelector('.pop__tabs'), {
  tabClass: 'pop__tab--on',
  onChange(tab) {
    announce(`${tab.textContent.trim()} 탭`)
  },
})

metaPop?.querySelectorAll('.pop__acc-btn').forEach((btn) => {
  const label = btn.querySelector('span')?.textContent?.trim() ?? '항목'
  const open0 = btn.getAttribute('aria-expanded') === 'true'
  btn.setAttribute('aria-label', `${label} ${open0 ? '접기' : '펼치기'}`)

  btn.addEventListener('click', () => {
    const item = btn.closest('.pop__acc-item')
    const body = document.getElementById(btn.getAttribute('aria-controls'))
    const open = btn.getAttribute('aria-expanded') !== 'true'
    const ico = btn.querySelector('.pop__acc-ico')

    item?.classList.toggle('is-open', open)
    btn.setAttribute('aria-expanded', String(open))
    btn.setAttribute('aria-label', `${label} ${open ? '접기' : '펼치기'}`)
    if (body) body.hidden = !open
    if (ico) {
      ico.src = open
        ? './src/assets/img/icon/pop-chevron-on.svg'
        : './src/assets/img/icon/pop-chevron.svg'
    }
    announce(`${label} ${open ? '펼침' : '접힘'}`)
  })
})

/* —— 4. 트리 · 체크 · 검색 —— */
document.querySelectorAll('.tree__fold').forEach((btn) => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true'
    const body = document.getElementById(btn.getAttribute('aria-controls'))
    const name = btn.closest('.tree__row, .tree__sub')?.querySelector('.tree__name')?.textContent ?? '항목'
    btn.setAttribute('aria-expanded', String(!expanded))
    btn.setAttribute('aria-label', `${name} ${expanded ? '펼치기' : '접기'}`)
    btn.closest('.tree__row')?.classList.toggle('tree__row--on', !expanded)
    btn.closest('.tree__sub')?.classList.toggle('tree__sub--on', !expanded)
    if (body) body.hidden = expanded
    announce(`${name} ${expanded ? '접힘' : '펼침'}`)
  })
})

document.querySelectorAll('.tree__check').forEach((el) => {
  el.addEventListener('change', () => {
    const name = el.closest('.tree__main')?.querySelector('.tree__name')?.textContent ?? '항목'
    announce(`${name} ${el.checked ? '선택' : '선택 해제'}`)
  })
})

document.querySelectorAll('.leaf__check').forEach((el) => {
  el.addEventListener('change', () => {
    const name = el.closest('.leaf__row')?.querySelector('.leaf__name')?.textContent ?? '레이어'
    announce(`${name} ${el.checked ? '선택' : '선택 해제'}`)
  })
})

searchForm?.addEventListener('submit', (e) => {
  e.preventDefault()
  const q = searchInput?.value.trim() ?? ''
  announce(q ? `${q} 검색` : '검색어를 입력해 주세요.')
})

/* —— 5. 줌 · PC 도구 · 범례 —— */
createZoom({
  root: document.getElementById('mapZoom'),
  max: 9,
  value: 5,
})

const toolItems = document.querySelectorAll('.tools__item[data-tool]')
toolItems.forEach((btn) => {
  btn.addEventListener('click', () => {
    const name = btn.textContent.trim().replace(/\s+/g, ' ')
    if (btn.dataset.tool === 'refresh') {
      announce('지도를 초기화했습니다.')
      return
    }
    const on = btn.getAttribute('aria-pressed') !== 'true'
    toolItems.forEach((el) => {
      if (el.dataset.tool === 'refresh') return
      setPressed(el, el === btn ? on : false)
    })
    announce(`${name} ${on ? '선택' : '해제'}`)
  })
})

document.querySelector('.tools__legend')?.addEventListener('click', (e) => {
  const btn = e.currentTarget
  const on = btn.getAttribute('aria-pressed') !== 'true'
  btn.setAttribute('aria-pressed', String(on))
  announce(`범례 ${on ? '열림' : '닫힘'}`)
})

/* —— 6. 좌표 포맷 셀렉트 —— */
const coordFormats = {
  dms: '36°27′14.8″N · 127°55′19.9″E',
  dec: '36.454111°N · 127.922194°E',
  tm: '198532.12 · 403214.56',
}
const fmtWrap = document.querySelector('.status__select')
const fmtBtn = fmtWrap?.querySelector('.status__fmt-btn')
const fmtList = fmtWrap?.querySelector('.status__opts')
const fmtLabel = fmtWrap?.querySelector('.status__fmt-txt')
const fmtCoord = document.querySelector('.status__coord-txt')

function closeFmt() {
  if (!fmtWrap || !fmtBtn || !fmtList) return
  if (fmtBtn.getAttribute('aria-expanded') !== 'true') return
  fmtWrap.classList.remove('is-open')
  fmtBtn.setAttribute('aria-expanded', 'false')
  fmtList.hidden = true
}

function openFmt() {
  if (!fmtWrap || !fmtBtn || !fmtList) return
  fmtWrap.classList.add('is-open')
  fmtBtn.setAttribute('aria-expanded', 'true')
  fmtList.hidden = false
  fmtList.querySelector('[aria-selected="true"]')?.focus()
}

function moveFmt(step) {
  const opts = [...(fmtList?.querySelectorAll('[role="option"]') ?? [])]
  const i = opts.findIndex((el) => el === document.activeElement)
  const next = opts[(i + step + opts.length) % opts.length]
  next?.focus()
}

fmtBtn?.addEventListener('click', (e) => {
  e.stopPropagation()
  if (fmtBtn.getAttribute('aria-expanded') === 'true') closeFmt()
  else openFmt()
})

fmtList?.addEventListener('click', (e) => {
  const opt = e.target.closest('[role="option"]')
  if (!opt) return
  fmtList.querySelectorAll('[role="option"]').forEach((el) => {
    el.setAttribute('aria-selected', String(el === opt))
  })
  const name = opt.textContent.trim()
  if (fmtLabel) fmtLabel.textContent = name
  const next = coordFormats[opt.dataset.value]
  if (fmtCoord && next) fmtCoord.textContent = next
  announce(`좌표 형식 ${name}`)
  closeFmt()
  fmtBtn.focus()
})

fmtList?.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    moveFmt(1)
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    moveFmt(-1)
  }
  if (e.key === 'Home') {
    e.preventDefault()
    fmtList.querySelector('[role="option"]')?.focus()
  }
  if (e.key === 'End') {
    e.preventDefault()
    const opts = fmtList.querySelectorAll('[role="option"]')
    opts[opts.length - 1]?.focus()
  }
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    document.activeElement?.click()
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    closeFmt()
    fmtBtn.focus()
  }
  if (e.key === 'Tab') {
    closeFmt()
  }
})

document.addEventListener('click', (e) => {
  if (fmtWrap && !fmtWrap.contains(e.target)) closeFmt()
})

document.querySelector('.status__find')?.addEventListener('click', () => {
  const coord = document.querySelector('.status__coord-txt')?.textContent.trim() ?? ''
  announce(coord ? `${coord} 좌표 검색` : '좌표 검색')
})

/* —— 7. 모바일 (바텀시트 · 도구 · 전체메뉴) ——
 * PC(≥1024)에서는 map-mo.css 미적용 + hide-mo 로 UI 숨김.
 * 내부망 PC only: 이 섹션·모바일 마크업·map-mo 엔트리 제외 가능.
 */
const moSheet = document.getElementById('moSheet')
const moSheetBody = document.getElementById('moSheetBody')
const moSheetHandle = document.getElementById('moSheetHandle')
const moMenu = document.getElementById('moMenu')
const moMenuDim = document.getElementById('moMenuDim')
const moMenuOpenBtn = document.getElementById('moMenuOpen')
const moMenuCloseBtn = document.getElementById('moMenuClose')
let releaseMoMenuTrap = null
let moMenuTrigger = null

function setMoSheetState(state) {
  if (!moSheet) return
  moSheet.dataset.state = state
  const expanded = state !== 'closed'
  moSheetHandle?.setAttribute('aria-expanded', String(expanded))
  moSheetHandle?.setAttribute(
    'aria-label',
    state === 'closed' ? '공간정보 목록 펼치기' : '공간정보 목록 접기',
  )
  if (moSheetBody) moSheetBody.hidden = state === 'closed'

  if (state === 'closed') {
    document.getElementById('moDepthClass')?.setAttribute('hidden', '')
    document.getElementById('moDepthTheme')?.setAttribute('hidden', '')
    document.querySelectorAll('.mo-depth').forEach((btn) => {
      btn.setAttribute('aria-expanded', 'false')
    })
  }
  announce(
    state === 'closed'
      ? '공간정보 목록이 닫혔습니다.'
      : state === 'peek'
        ? '공간정보 목록'
        : '분류 목록이 열렸습니다.',
  )
}

function openMoDepth(key) {
  setMoSheetState('open')
  const depthPanel = document.getElementById(key === 'class' ? 'moDepthClass' : 'moDepthTheme')
  document.getElementById('moDepthClass')?.setAttribute('hidden', '')
  document.getElementById('moDepthTheme')?.setAttribute('hidden', '')
  depthPanel?.removeAttribute('hidden')
  document.querySelectorAll('.mo-depth').forEach((btn) => {
    const on = btn.dataset.depth === key
    btn.setAttribute('aria-expanded', String(on))
  })
}

document.getElementById('moSheetOpen')?.addEventListener('click', () => setMoSheetState('peek'))
document.getElementById('moListBtn')?.addEventListener('click', () => setMoSheetState('peek'))
moSheetHandle?.addEventListener('click', () => {
  const cur = moSheet?.dataset.state || 'closed'
  setMoSheetState(cur === 'closed' ? 'peek' : 'closed')
})

document.querySelectorAll('.mo-depth').forEach((btn) => {
  btn.addEventListener('click', () => openMoDepth(btn.dataset.depth))
})

document.querySelectorAll('.mo-sheet__collapse').forEach((btn) => {
  btn.addEventListener('click', () => {
    setMoSheetState('peek')
    document.getElementById('moDepthClass')?.setAttribute('hidden', '')
    document.getElementById('moDepthTheme')?.setAttribute('hidden', '')
  })
})

document.querySelectorAll('.mo-group__add').forEach((btn) => {
  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-expanded') !== 'true'
    btn.setAttribute('aria-expanded', String(on))
    const ico = btn.querySelector('img')
    if (ico) {
      ico.src = on
        ? './src/assets/img/mo/minus.svg'
        : './src/assets/img/mo/plus.svg'
    }
    announce(`${btn.getAttribute('aria-label')?.replace(/\s*펼치기|\s*접기/g, '') || '항목'} ${on ? '펼침' : '접힘'}`)
    btn.setAttribute('aria-label', btn.getAttribute('aria-label')?.replace(/펼치기|접기/, on ? '접기' : '펼치기') || '')
  })
})

const moToolBtns = document.querySelectorAll('.mo-tools__btn')
moToolBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    moToolBtns.forEach((el) => {
      const on = el === btn
      el.classList.toggle('mo-tools__btn--on', on)
      el.setAttribute('aria-pressed', String(on))
    })
    announce(`${btn.textContent.trim()} 선택`)
    if (btn.dataset.moTool === 'layer') setMoSheetState('peek')
  })
})

document.querySelectorAll('[data-mo-zoom]').forEach((btn) => {
  btn.addEventListener('click', () => {
    announce(btn.dataset.moZoom === 'in' ? '지도 확대' : '지도 축소')
  })
})

document.querySelector('.mo-search')?.addEventListener('submit', (e) => {
  e.preventDefault()
  const q = document.getElementById('moPlaceSearch')?.value.trim() ?? ''
  announce(q ? `${q} 검색` : '검색어를 입력해 주세요.')
})

function openMoMenu() {
  if (!moMenu || !moMenu.hidden) return
  moMenuTrigger = document.activeElement
  moMenu.hidden = false
  if (moMenuDim) moMenuDim.hidden = false
  moMenuOpenBtn?.setAttribute('aria-expanded', 'true')
  setBackgroundInert(true, [moMenu, moMenuDim])
  releaseMoMenuTrap = trapFocus(moMenu, { initialFocus: moMenuCloseBtn })
  announce('전체 메뉴')
}

function closeMoMenu() {
  if (!moMenu || moMenu.hidden) return
  releaseMoMenuTrap?.()
  releaseMoMenuTrap = null
  moMenu.hidden = true
  if (moMenuDim) moMenuDim.hidden = true
  moMenuOpenBtn?.setAttribute('aria-expanded', 'false')
  setBackgroundInert(false, [moMenu, moMenuDim])
  announce('전체 메뉴가 닫혔습니다.')
  window.requestAnimationFrame(() => moMenuTrigger?.focus?.())
  moMenuTrigger = null
}

moMenuOpenBtn?.addEventListener('click', openMoMenu)
moMenuCloseBtn?.addEventListener('click', closeMoMenu)
moMenuDim?.addEventListener('click', closeMoMenu)

document.querySelectorAll('.mo-menu__d1').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mo-menu__d1').forEach((el) => {
      const on = el === btn
      el.classList.toggle('mo-menu__d1--on', on)
      el.toggleAttribute('aria-current', on)
    })
    const key = btn.dataset.menuD1
    document.querySelectorAll('.mo-menu__d2-list').forEach((pane) => {
      pane.hidden = pane.dataset.pane !== key
    })
    announce(`${btn.textContent.trim()} 메뉴`)
  })
})

/* —— 8. Esc 공통 (메뉴 → 메타 → 시트 → 좌표 → 패널) —— */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return
  if (moMenu && !moMenu.hidden) {
    e.preventDefault()
    closeMoMenu()
    return
  }
  if (metaPop && !metaPop.hidden) {
    e.preventDefault()
    closeMetaPop()
    return
  }
  if (moSheet && moSheet.dataset.state !== 'closed') {
    e.preventDefault()
    setMoSheetState('closed')
    return
  }
  if (fmtBtn?.getAttribute('aria-expanded') === 'true') {
    e.preventDefault()
    closeFmt()
    fmtBtn.focus()
    return
  }
  if (app.classList.contains('is-open')) setPanel(false)
})
