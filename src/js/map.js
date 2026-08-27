import '../scss/main.scss'
import { announce, focusPanel, setPressed } from './a11y.js'
import { createZoom } from './zoom.js'

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

document.querySelectorAll('.layer__item').forEach((btn) => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true'
    const body = document.getElementById(btn.getAttribute('aria-controls'))
    btn.setAttribute('aria-expanded', String(!expanded))
    if (body) body.hidden = expanded
    announce(`${btn.querySelector('.layer__name')?.textContent ?? ''} ${expanded ? '접힘' : '펼침'}`)
  })
})

document.querySelectorAll('.sub__row[aria-expanded]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true'
    const body = document.getElementById(btn.getAttribute('aria-controls'))
    btn.setAttribute('aria-expanded', String(!expanded))
    btn.classList.toggle('sub__row--on', !expanded)
    if (body) body.hidden = expanded
    announce(`${btn.querySelector('.sub__name')?.textContent ?? ''} ${expanded ? '접힘' : '펼침'}`)
  })
})

document.querySelectorAll('.sub__add').forEach((btn) => {
  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true'
    btn.setAttribute('aria-pressed', String(on))
    announce(`${btn.getAttribute('aria-label') ?? '레이어'} ${on ? '선택' : '선택 해제'}`)
  })
})

document.querySelectorAll('.leaf__star').forEach((btn) => {
  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true'
    btn.setAttribute('aria-pressed', String(on))
    announce(`${btn.getAttribute('aria-label') ?? '즐겨찾기'} ${on ? '추가' : '해제'}`)
  })
})

document.querySelectorAll('.leaf__info').forEach((btn) => {
  btn.addEventListener('click', () => {
    announce(`${btn.getAttribute('aria-label') ?? '정보'}`)
  })
})

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
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    document.activeElement?.click()
  }
})

document.addEventListener('click', (e) => {
  if (fmtWrap && !fmtWrap.contains(e.target)) closeFmt()
})

document.querySelector('.status__find')?.addEventListener('click', () => {
  const coord = document.querySelector('.status__coord-txt')?.textContent.trim() ?? ''
  announce(coord ? `${coord} 좌표 검색` : '좌표 검색')
})

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return
  if (fmtBtn?.getAttribute('aria-expanded') === 'true') {
    closeFmt()
    fmtBtn.focus()
    return
  }
  if (app.classList.contains('is-open')) setPanel(false)
})
