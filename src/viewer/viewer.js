import './viewer.scss'

const FRAME = { width: 1280, label: 'PC' }

const PAGE_GROUPS = [
  {
    title: '내부망',
    items: [
      { id: '601', name: '01 기본정보', file: 'inter-SFR-006-01-01.html', ready: true },
      { id: '602', name: '02 매립면허', file: 'inter-SFR-006-01-02.html', ready: true },
      { id: '603', name: '03 점용사용허가', file: 'inter-SFR-006-01-03.html', ready: true },
      { id: '604', name: '04 적합성협의', file: 'inter-SFR-006-01-04.html', ready: true },
      { id: '605', name: '05 어업면허', file: 'inter-SFR-006-01-05.html', ready: true },
      { id: '606', name: '06 이용·개발사업', file: 'inter-SFR-006-01-06.html', ready: true },
      { id: '607', name: '07 지역위원회', file: 'inter-SFR-006-01-07.html', ready: true },
      { id: '608', name: '08 지역협의회', file: 'inter-SFR-006-01-08.html', ready: true },
      { id: '609', name: '09 지역역량강화', file: 'inter-SFR-006-01-09.html', ready: true },
      { id: '610', name: '10 해양용도구역', file: 'inter-SFR-006-01-10.html', ready: true },
      { id: '620', name: '이행점검 현황', file: 'inter-SFR-006-02.html', ready: true },
      { id: '630', name: '이행점검 상세', file: 'inter-SFR-006-03.html', ready: true },
      { id: '640', name: '결과 목록', file: 'inter-SFR-006-04.html', ready: true },
      { id: '641', name: '결과 01 기초지자체', file: 'inter-SFR-006-04-01.html', ready: true },
      { id: '642', name: '결과 02 시도검토', file: 'inter-SFR-006-04-02.html', ready: true },
      { id: '643', name: '결과 03 해수부1차', file: 'inter-SFR-006-04-03.html', ready: true },
      { id: '644', name: '결과 04 전문기관', file: 'inter-SFR-006-04-04.html', ready: true },
      { id: '645', name: '결과 05 최종승인', file: 'inter-SFR-006-04-05.html', ready: true },
    ],
  },
]

const nav = document.getElementById('viewerNav')
const iframe = document.getElementById('viewerIframe')
const frame = document.getElementById('viewerFrame')
const sizeLabel = document.getElementById('viewerSizeLabel')
const pageCount = document.getElementById('viewerPageCount')
const openTabBtn = document.getElementById('viewerOpenTab')

let currentFile = 'inter-SFR-006-01-01.html'

function getReadyPages() {
  return PAGE_GROUPS.flatMap((group) => group.items.filter((item) => item.ready && item.file))
}

function renderNav() {
  const readyCount = getReadyPages().length
  pageCount.textContent = `${readyCount}개 화면`

  nav.innerHTML = PAGE_GROUPS.map((group) => {
    const items = group.items.map((item) => {
      if (!item.ready || !item.file) {
        return `
          <li class="viewer-nav__item viewer-nav__item--pending">
            <span class="viewer-nav__id">${item.id}</span>
            <span class="viewer-nav__name">${item.name}</span>
            <span class="viewer-nav__badge">대기</span>
          </li>`
      }

      const isActive = item.file === currentFile
      return `
        <li>
          <button
            type="button"
            class="viewer-nav__btn${isActive ? ' viewer-nav__btn--active' : ''}"
            data-file="${item.file}"
          >
            <span class="viewer-nav__id">${item.id}</span>
            <span class="viewer-nav__name">${item.name}</span>
          </button>
        </li>`
    }).join('')

    return `
      <section class="viewer-nav__group">
        <h2>${group.title}</h2>
        <ul>${items}</ul>
      </section>`
  }).join('')
}

function loadPage(file) {
  currentFile = file
  iframe.src = `./${file}`
  renderNav()
  history.replaceState(null, '', `#${encodeURIComponent(file)}`)
}

function updateSizeLabel() {
  const frameHeight = Math.round(frame.getBoundingClientRect().height)
  sizeLabel.textContent = `${FRAME.label} · ${FRAME.width} × ${frameHeight || '—'}`
}

function initFromHash() {
  const hash = decodeURIComponent(window.location.hash.replace('#', ''))
  if (!hash) return

  const exists = getReadyPages().some((page) => page.file === hash)
  if (exists) currentFile = hash
}

nav.addEventListener('click', (event) => {
  const btn = event.target.closest('.viewer-nav__btn')
  if (!btn) return
  loadPage(btn.dataset.file)
})

openTabBtn.addEventListener('click', () => {
  window.open(`./${currentFile}`, '_blank')
})

iframe.addEventListener('load', updateSizeLabel)
window.addEventListener('resize', updateSizeLabel)

initFromHash()
renderNav()
iframe.src = `./${currentFile}`
frame.style.setProperty('--frame-width', `${FRAME.width}px`)
updateSizeLabel()
