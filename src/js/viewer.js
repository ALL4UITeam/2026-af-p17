const PAGES = [
  {
    title: '외부망 · PC',
    items: [
      { id: 'g0', name: '컴포넌트 가이드', file: 'guide.html', ready: true, width: 1580, label: 'PC' },
      { id: '01', name: '기본 화면', file: 'map.html', ready: true, width: 1580, label: 'PC' },
      { id: '01n', name: '로그인', file: 'map-login.html', ready: true, width: 1580, label: 'PC' },
      { id: '01k', name: '레이어 리스트', file: 'map-lyr.html', ready: true, width: 1580, label: 'PC' },
      { id: '01s', name: '추천레이어 펼침', file: 'map-suggest.html', ready: true, width: 1580, label: 'PC' },
      { id: '01t', name: '관광정보 목록', file: 'map-tour.html', ready: true, width: 1580, label: 'PC' },
      { id: '01t2', name: '관광정보 오버레이', file: 'map-tour-overlay.html', ready: true, width: 1580, label: 'PC' },
      { id: '01t3', name: '홍성 국가유산야행', file: 'map-tour-detail.html', ready: true, width: 1920, label: 'PC' },
      { id: '01t4', name: '마리나관광 목록', file: 'map-marina.html', ready: true, width: 1920, label: 'PC' },
      { id: '01t5', name: '관광 POI · 상세', file: 'map-poi.html', ready: true, width: 1580, label: 'PC' },
      { id: '01t6', name: '관광 POI · 목록', file: 'map-poi-list.html', ready: true, width: 1580, label: 'PC' },
      { id: '01d', name: '메타정보 모달 · 개요', file: 'map-modal.html', ready: true, width: 1580, label: 'PC' },
      { id: '01d2', name: '모달 · 공간 메타정보', file: 'map-modal-spatial.html', ready: true, width: 1580, label: 'PC' },
      { id: '01d3', name: '모달 · 해양특성 메타정보', file: 'map-modal-marine.html', ready: true, width: 1580, label: 'PC' },
      { id: '01d4', name: '모달 · 데이터모델', file: 'map-modal-model.html', ready: true, width: 1580, label: 'PC' },
      { id: '01d5', name: '모달 · 데이터보기', file: 'map-modal-data.html', ready: true, width: 1580, label: 'PC' },
      { id: '01f', name: '검색 필터', file: 'map-filter.html', ready: true, width: 1580, label: 'PC' },
      { id: '01g', name: '좌표 검색', file: 'map-coord.html', ready: true, width: 1580, label: 'PC' },
      { id: '01a', name: '하단 속성정보 · 갯벌면적', file: 'map-attr.html', ready: true, width: 1580, label: 'PC' },
      { id: '01b', name: '배경지도 선택', file: 'map-basemap.html', ready: true, width: 1580, label: 'PC' },
      { id: '01q', name: '면적재기', file: 'map-area.html', ready: true, width: 1580, label: 'PC' },
      { id: '01e', name: '격자별 특성평가 결과', file: 'map-eval.html', ready: true, width: 1580, label: 'PC' },
      { id: '01e2', name: '특성평가 · 유효값만', file: 'map-eval-valid.html', ready: true, width: 1580, label: 'PC' },
      { id: '01c', name: '시도 클러스터', file: 'map-cluster.html', ready: true, width: 1580, label: 'PC' },
      { id: '01l', name: '범례 · 특성평가', file: 'map-legend.html', ready: true, width: 1580, label: 'PC' },
      { id: '01l2', name: '범례 · 해양용도구역', file: 'map-legend-use.html', ready: true, width: 1580, label: 'PC' },
      { id: '01l3', name: '범례 · 관리구역', file: 'map-legend-mgmt.html', ready: true, width: 1580, label: 'PC' },
      { id: '01l4', name: '범례 · 관광정보', file: 'map-legend-tour.html', ready: true, width: 1580, label: 'PC' },
      { id: '02', name: '레이어 확장형', file: '', ready: false },
      { id: '03', name: '목록 노출형', file: '', ready: false },
    ],
  },
  {
    title: '내부망 · PC',
    items: [
      { id: 'i01', name: '내부망_나의 지도', file: 'map-mymap.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i01b', name: '내부망_나의 지도 · 확장', file: 'map-mymap-detail.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i01c', name: '내부망_나의 지도 · 미설정', file: 'map-mymap-empty.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i01d', name: '내부망_나의 지도 · 생성 모달', file: 'map-mymap-create.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i02', name: '내부망_공간분석', file: 'map-spatial.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i02b', name: '내부망_공간분석 · 레이어 활성화', file: 'map-spatial-on.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i02c', name: '내부망_공간분석 · 레이어 추가', file: 'map-spatial-add.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i02d', name: '내부망_공간분석 · 레이어 추가 · 개요', file: 'map-spatial-add-info.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i02e', name: '내부망_공간분석 · 레이어 관리', file: 'map-spatial-mgr.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i02f', name: '내부망_공간분석 · 레이어 권한 설정', file: 'map-spatial-perm.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i02g', name: '내부망_공간분석 · 선택된 레이어', file: 'map-spatial-pick.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i02h', name: '내부망_공간분석 · 격자 정보', file: 'map-spatial-info.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i03', name: '내부망_공간분석 · 공간연산', file: 'map-spatial-op.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i03b', name: '내부망_공간분석 · 공간연산 · 일반화', file: 'map-spatial-op-diss.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i03c', name: '내부망_공간분석 · 공간연산 · 통합', file: 'map-spatial-op-union.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i03d', name: '내부망_공간분석 · 공간분석', file: 'map-spatial-an.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i03e', name: '내부망_공간분석 · 편집', file: 'map-spatial-edit.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i03f', name: '내부망_공간분석 · 편집 · 스타일', file: 'map-spatial-edit-style.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i03g', name: '내부망_공간분석 · 편집 · 필터', file: 'map-spatial-edit-filter.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i03h', name: '내부망_공간분석 · 속성정보', file: 'map-spatial-attr.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i03i', name: '내부망_공간분석 · 속성정보 · 통계분석', file: 'map-spatial-stat.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i03j', name: '내부망_공간분석 · 속성정보 · 검색', file: 'map-spatial-stat-find.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i03k', name: '내부망_공간분석 · 정보보기', file: 'map-spatial-meta.html', ready: true, width: 1920, label: 'PC' },
      { id: 'i03l', name: '내부망_공간분석 · 레이어 조인', file: 'map-spatial-join.html', ready: true, width: 1920, label: 'PC' },
    ],
  },
  {
    title: '외부망 · 모바일',
    items: [
      { id: 'm00', name: '00. 기본', file: 'map-mo.html', ready: true, width: 360, label: 'MO' },
      { id: 'm01', name: '01. 아코디언 목록(peek)', file: 'map-mo-peek.html', ready: true, width: 360, label: 'MO' },
      { id: 'm02', name: '02. 분류체계 대분류(open)', file: 'map-mo-open.html', ready: true, width: 360, label: 'MO' },
      { id: 'm03', name: '03. 선택된 레이어 리스트', file: 'map-mo-lyr.html', ready: true, width: 360, label: 'MO' },
      { id: 'm04', name: '04. 검색 필터', file: 'map-mo-filter.html', ready: true, width: 360, label: 'MO' },
      { id: 'm05', name: '05. 전체 메뉴', file: 'map-mo-menu.html', ready: true, width: 360, label: 'MO' },
      { id: 'm06', name: '06. 레이어 트리(2~4뎁스)', file: 'map-mo-tree.html', ready: true, width: 360, label: 'MO' },
      { id: 'm07', name: '07. 추천레이어', file: 'map-mo-suggest.html', ready: true, width: 360, label: 'MO' },
      { id: 'm08', name: '08. 배경지도', file: 'map-mo-basemap.html', ready: true, width: 360, label: 'MO' },
      { id: 'm09', name: '09. 메타정보', file: 'map-mo-modal.html', ready: true, width: 360, label: 'MO' },
      { id: 'm10', name: '10. 속성정보(table)', file: 'map-mo-attr.html', ready: true, width: 360, label: 'MO' },
    ],
  },
]

const nav = document.getElementById('viewerNav')
const iframe = document.getElementById('viewerIframe')
const frame = document.getElementById('viewerFrame')
const sizeLabel = document.getElementById('viewerSizeLabel')
const pageCount = document.getElementById('viewerPageCount')
const openTab = document.getElementById('viewerOpenTab')

let current = 'map.html'

function allReady() {
  return PAGES.flatMap((group) => group.items.filter((item) => item.ready && item.file))
}

function findItem(file) {
  return allReady().find((item) => item.file === file)
}

function srcOf(file) {
  return `./${file}`
}

function applyFrame(file) {
  const item = findItem(file) || { width: 1580, label: 'PC' }
  frame.style.setProperty('--frame-width', `${item.width}px`)
  if (item.width <= 400) {
    frame.style.height = '768px'
    frame.style.maxHeight = '768px'
  } else {
    frame.style.height = 'calc(100vh - 104px)'
    frame.style.maxHeight = 'calc(100vh - 104px)'
  }
  const height = Math.round(frame.getBoundingClientRect().height)
  sizeLabel.textContent = `${item.label} · ${item.width} × ${height || '—'}`
}

function renderNav() {
  pageCount.textContent = `${allReady().length}개 화면`
  nav.innerHTML = PAGES.map((group) => {
    const items = group.items
      .map((item) =>
        !item.ready || !item.file
          ? `<li class="viewer-nav__item viewer-nav__item--pending">
              <span class="viewer-nav__id">${item.id}</span>
              <span class="viewer-nav__name">${item.name}</span>
              <span class="viewer-nav__badge">대기</span>
            </li>`
          : `<li>
              <button type="button" class="viewer-nav__btn${item.file === current ? ' viewer-nav__btn--active' : ''}" data-file="${item.file}">
                <span class="viewer-nav__id">${item.id}</span>
                <span class="viewer-nav__name">${item.name}</span>
              </button>
            </li>`,
      )
      .join('')
    return `<section class="viewer-nav__group"><h2>${group.title}</h2><ul>${items}</ul></section>`
  }).join('')
}

function show(file) {
  current = file
  iframe.src = srcOf(file)
  applyFrame(file)
  renderNav()
  history.replaceState(null, '', `#${encodeURIComponent(file)}`)
}

function readHash() {
  const hash = decodeURIComponent(window.location.hash.replace('#', ''))
  if (hash && allReady().some((item) => item.file === hash)) current = hash
}

nav.addEventListener('click', (event) => {
  const btn = event.target.closest('.viewer-nav__btn')
  if (btn) show(btn.dataset.file)
})
openTab.addEventListener('click', () => {
  window.open(srcOf(current), '_blank')
})
iframe.addEventListener('load', () => applyFrame(current))
window.addEventListener('resize', () => applyFrame(current))

readHash()
renderNav()
iframe.src = srcOf(current)
applyFrame(current)
