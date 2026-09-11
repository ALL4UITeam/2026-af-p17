import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import javascript from 'highlight.js/lib/languages/javascript'
import scss from 'highlight.js/lib/languages/scss'
import 'highlight.js/styles/github-dark.css'

hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('scss', scss)
hljs.highlightAll()

const navLinks = [...document.querySelectorAll('.guide__menu a')]
const sections = navLinks
  .map((a) => document.querySelector(a.hash))
  .filter(Boolean)

function setNav(id) {
  navLinks.forEach((a) => a.classList.toggle('is-on', a.hash === `#${id}`))
}

const spy = new IntersectionObserver(
  (entries) => {
    const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
    if (vis?.target.id) setNav(vis.target.id)
  },
  { rootMargin: '-20% 0px -60% 0px', threshold: [0.15, 0.4] },
)
sections.forEach((el) => spy.observe(el))

document.querySelector('.guide__menu')?.addEventListener('click', (e) => {
  const a = e.target.closest('a')
  if (!a) return
  setNav(a.hash.slice(1))
})

function copyText(text, btn) {
  const done = () => {
    btn.textContent = '복사됨'
    btn.classList.add('is-ok')
    setTimeout(() => {
      btn.textContent = '복사'
      btn.classList.remove('is-ok')
    }, 1200)
  }
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallback(text, done))
    return
  }
  fallback(text, done)
}

function fallback(text, done) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '')
  ta.style.position = 'fixed'
  ta.style.left = '-9999px'
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  ta.remove()
  done()
}

document.querySelectorAll('.g-copy').forEach((btn) => {
  btn.addEventListener('click', () => {
    const pre = btn.closest('.g-code')?.querySelector('code')
    if (pre) copyText(pre.textContent.replace(/^\n|\n$/g, ''), btn)
  })
})

const modal = document.getElementById('metaModal')

function setGuideTab(tab = 'overview') {
  if (!modal) return
  const isData = tab === 'data'
  modal.classList.toggle('is-data', isData)
  const btn = isData ? null : modal.querySelector(`[data-action="modal-tab"][data-tab="${tab}"]`)
  modal.querySelectorAll('[data-action="modal-tab"]').forEach((el) => {
    const on = !isData && el === btn
    el.classList.toggle('is-on', on)
    el.setAttribute('aria-selected', on ? 'true' : 'false')
  })
  const paneId = isData ? 'metaPaneData' : btn?.getAttribute('aria-controls')
  modal.querySelectorAll('[role="tabpanel"]').forEach((pane) => {
    const on = pane.id === paneId
    pane.classList.toggle('is-on', on)
    pane.hidden = !on
  })
}

function openGuideModal(opts = {}) {
  if (!modal) return
  const dimmed = opts.dimmed !== false
  const tab = opts.tab || 'overview'
  modal.dataset.dimmed = dimmed ? 'true' : 'false'
  const dim = modal.querySelector('.dlg__dim')
  if (dim) dim.hidden = !dimmed
  setGuideTab(tab)
  modal.hidden = false
  modal.querySelector('.dlg__box')?.focus()
}

function closeGuideModal() {
  if (!modal || modal.hidden) return
  modal.hidden = true
}

document.querySelectorAll('[data-guide-modal]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const kind = btn.dataset.guideModal
    if (kind === 'nodim') openGuideModal({ dimmed: false, tab: 'overview' })
    else if (kind === 'dim') openGuideModal({ dimmed: true, tab: 'overview' })
    else openGuideModal({ dimmed: true, tab: kind })
  })
})

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]')
  if (!el) return
  const action = el.dataset.action
  if (action === 'close-modal') closeGuideModal()
  if (action === 'modal-tab') setGuideTab(el.dataset.tab)
  if (action === 'meta-data') setGuideTab('data')
  if (action === 'filter-all') {
    const on = el.getAttribute('aria-checked') !== 'true'
    el.setAttribute('aria-checked', on ? 'true' : 'false')
    el.querySelector('span').textContent = on ? 'on' : 'off'
  }
  if (action === 'inq-tab') {
    el.parentElement.querySelectorAll('.inq__tab').forEach((tab) => {
      tab.classList.toggle('is-on', tab === el)
    })
  }
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeGuideModal()
})

const GUIDE_HASH = {
  '#modal': { dimmed: true, tab: 'overview' },
  '#modal-nodim': { dimmed: false, tab: 'overview' },
  '#modal-spatial': { dimmed: true, tab: 'spatial' },
  '#modal-marine': { dimmed: true, tab: 'marine' },
  '#modal-model': { dimmed: true, tab: 'model' },
  '#modal-data': { dimmed: true, tab: 'data' },
}
if (GUIDE_HASH[location.hash]) openGuideModal(GUIDE_HASH[location.hash])
