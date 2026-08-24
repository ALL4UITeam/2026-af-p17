import '../scss/main.scss'
import lnbActive from '../assets/img/lnb-active.png'
import { createZoom } from './zoom.js'
import { announce, bindTablist, focusPanel } from './a11y.js'

document.documentElement.style.setProperty('--img-lnb-active', `url("${lnbActive}")`)

/** 지도 줌 (0~max, 기본 max=12, 초기 중간값) */
const mapZoom = createZoom({
  root: document.getElementById('mapZoom'),
  max: 12,
  onChange(level, prev, reason) {
    // 개발자 콜백: 지도 엔진 줌 반영
    // mapView.setZoom(level)
  },
})

window.mapZoom = mapZoom

const app = document.getElementById('app')
const searchPanel = document.getElementById('searchPanel')
const tourPanel = document.getElementById('tourPanel')
const detailPanel = document.getElementById('detailPanel')
const searchBtn = document.querySelector('[data-menu="search"]')
const tourBtn = document.querySelector('[data-menu="tour"]')
const panelClose = document.getElementById('panelClose')
const tourClose = document.getElementById('tourClose')
const detailClose = document.getElementById('detailClose')
const panelHandle = document.getElementById('panelHandle')
const cards = document.querySelectorAll('.card')
const cats = document.querySelectorAll('.cat')
const quickMenu = document.getElementById('quickMenu')
const quickMore = document.getElementById('quickMore')
const quickItems = document.querySelectorAll('[data-quick]')
const toolItems = document.querySelectorAll('.tools__item')

function clearMenus() {
  document.querySelectorAll('.lnb__item').forEach((el) => {
    el.classList.remove('lnb__item--on')
    if (el.hasAttribute('aria-expanded')) el.setAttribute('aria-expanded', 'false')
    el.setAttribute('aria-current', 'false')
  })
}

function closeAll() {
  app.classList.remove('is-open', 'is-tour', 'is-detail')
  clearMenus()
  searchPanel.hidden = true
  tourPanel.hidden = true
  detailPanel.hidden = true
}

function setSearch(open) {
  closeAll()
  if (!open) {
    announce('통합검색 패널이 닫혔습니다.')
    searchBtn?.focus()
    return
  }

  app.classList.add('is-open')
  searchBtn.classList.add('lnb__item--on')
  searchBtn.setAttribute('aria-expanded', 'true')
  searchBtn.setAttribute('aria-current', 'page')
  searchPanel.hidden = false
  focusPanel(searchPanel)
  announce('통합검색 패널이 열렸습니다.')
}

function setTour(open, withDetail = true) {
  closeAll()
  if (!open) {
    announce('관광정보지도 패널이 닫혔습니다.')
    tourBtn?.focus()
    return
  }

  app.classList.add('is-tour')
  tourBtn.classList.add('lnb__item--on')
  tourBtn.setAttribute('aria-expanded', 'true')
  tourBtn.setAttribute('aria-current', 'page')
  tourPanel.hidden = false
  focusPanel(tourPanel)
  announce('관광정보지도 패널이 열렸습니다.')

  if (withDetail) setDetail(true)
}

function setDetail(open) {
  app.classList.toggle('is-detail', open)
  detailPanel.hidden = !open
  if (open) {
    focusPanel(detailPanel)
    announce('상세정보가 열렸습니다.')
  } else {
    announce('상세정보가 닫혔습니다.')
  }
}

searchBtn.addEventListener('click', () => {
  setSearch(!app.classList.contains('is-open'))
})

tourBtn.addEventListener('click', () => {
  setTour(!app.classList.contains('is-tour'), true)
})

panelClose.addEventListener('click', () => setSearch(false))
tourClose.addEventListener('click', () => setTour(false, false))
detailClose.addEventListener('click', () => setDetail(false))
panelHandle.addEventListener('click', closeAll)

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return
  if (!detailPanel.hidden) {
    setDetail(false)
    return
  }
  if (!tourPanel.hidden) {
    setTour(false, false)
    return
  }
  if (!searchPanel.hidden) {
    setSearch(false)
  }
})

document.querySelectorAll('[role="tablist"]').forEach(bindTablist)

cats.forEach((cat) => {
  cat.setAttribute('aria-pressed', cat.classList.contains('cat--on') ? 'true' : 'false')
  cat.addEventListener('click', () => {
    cats.forEach((c) => {
      c.classList.remove('cat--on')
      c.setAttribute('aria-pressed', 'false')
    })
    cat.classList.add('cat--on')
    cat.setAttribute('aria-pressed', 'true')
    announce(`${cat.textContent.trim()} 카테고리 선택`)
  })
})

cards.forEach((card) => {
  card.setAttribute('aria-pressed', card.classList.contains('card--on') ? 'true' : 'false')
  card.addEventListener('click', () => {
    cards.forEach((c) => {
      c.classList.remove('card--on')
      c.setAttribute('aria-pressed', 'false')
    })
    card.classList.add('card--on')
    card.setAttribute('aria-pressed', 'true')
    setDetail(true)
  })
})

quickItems.forEach((item) => {
  item.addEventListener('click', () => {
    const on = !item.classList.contains('quick__item--on')
    item.classList.toggle('quick__item--on', on)
    item.setAttribute('aria-pressed', String(on))
    announce(`${item.textContent.trim()} ${on ? '선택' : '선택 해제'}`)
  })
})

quickMore?.addEventListener('click', () => {
  const open = !quickMenu.classList.contains('is-open')
  quickMenu.classList.toggle('is-open', open)
  quickMore.setAttribute('aria-expanded', String(open))
  quickMore.setAttribute('aria-label', open ? '빠른 카테고리 접기' : '빠른 카테고리 더보기')
  announce(open ? '추가 카테고리를 표시합니다.' : '추가 카테고리를 숨겼습니다.')
  if (open) {
    const firstExtra = quickMenu.querySelector('[data-extra]')
    firstExtra?.focus()
  }
})

toolItems.forEach((item) => {
  item.addEventListener('click', () => {
    toolItems.forEach((t) => {
      t.classList.remove('tools__item--on')
      t.setAttribute('aria-pressed', 'false')
    })
    item.classList.add('tools__item--on')
    item.setAttribute('aria-pressed', 'true')
    announce(`${item.textContent.trim()} 도구 선택`)
  })
})

/* Figma: 통합검색 결과 화면 */
setSearch(true)

export { mapZoom }
