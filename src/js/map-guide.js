/**
 * guide-map.html 전용 — 메타 팝업 API 데모
 * (map.js 전체 UI 바인딩 없음)
 */
import '../scss/guide-map.scss'
import {
  announce,
  bindTablist,
  setBackgroundInert,
  trapFocus,
} from './a11y.js'
import {
  fetchLayerMeta,
  fillMetaPop,
  MOCK_META,
  setMetaFetcher,
} from './meta.js'

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

metaPopClose?.addEventListener('click', closeMetaPop)
metaPopDim?.addEventListener('click', closeMetaPop)

bindTablist(metaPop?.querySelector('.pop__tabs'), {
  tabClass: 'pop__tab--on',
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
  })
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && metaPop && !metaPop.hidden) {
    e.preventDefault()
    closeMetaPop()
  }
})

document.getElementById('demoOpen')?.addEventListener('click', (e) => {
  window.MapUI.openMeta('LYR_ROUTE_ACCESS', e.currentTarget)
})
document.getElementById('demoCatch')?.addEventListener('click', (e) => {
  window.MapUI.openMeta('LYR_CATCH', e.currentTarget)
})
