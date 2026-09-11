# MAP 화면 연동

퍼블은 화면 상태와 이벤트만 제공합니다. API·지도 엔진은 개발에서 붙입니다.

## 파일

| 파일 | 역할 |
|------|------|
| `map.html` | 기본 지도 |
| `map-tour.html` | 관광정보 목록 |
| `map-tour-overlay.html` | 관광정보 상세 |
| `map-tour-detail.html` | 홍성 국가유산야행 오버레이 |
| `map-basemap.html` | 배경지도 선택 |
| `map-*.html` | 기능 단위 화면. 공통 셸 `partials/map-app.hbs`, `body[data-screen]` |
| `src/js/map.js` | 패널·트리·레이어리스트·도구·모바일 시트/메뉴 |
| `src/scss/main.scss` | PC 스타일 (내부망은 이것만) |
| `src/scss/map-mo.scss` | 모바일 추가 (`max-width: 767px`) |

전역 객체: `window.MapUI`

```js
MapUI.getCheckedLayers()
MapUI.setLayerChecked('LYR_TIDAL', false)
MapUI.openPanel()
MapUI.closePanel()
MapUI.openLayerList()
MapUI.closeLayerList()
MapUI.openBasemap()
MapUI.closeBasemap()
MapUI.openMoSheet()
MapUI.closeMoSheet()
MapUI.openMoMenu()
MapUI.closeMoMenu()
MapUI.setMoNav('platform')
MapUI.getZoom()
MapUI.setZoom(7)
MapUI.openAttr()
MapUI.closeAttr()
MapUI.openEval()
MapUI.closeEval()
MapUI.setEvalTab('valid')
MapUI.openClusters()
MapUI.closeClusters()
MapUI.setClusters([{ id: 'gangwon', name: '강원특별자치도', count: 776, left: 61, top: 30 }])
MapUI.openLegend('grade')
MapUI.setLegendTab('use')
MapUI.closeLegend()
MapUI.openSuggest()
MapUI.closeSuggest()
MapUI.openFilter()
MapUI.closeFilter()
MapUI.getFilter() // { area, cat, cho }
MapUI.openTour()
MapUI.openTourOverlay('tour-fest-1')
MapUI.closeTourOverlay()
MapUI.openTourDetail()
MapUI.closeTourDetail()
MapUI.closeTour()
MapUI.on('map:layer-change', (e) => {
  const { id, name, checked, parentId } = e.detail
})
```

## 마크업 훅

- `data-action` : tab, toggle, toggle-layer, search, filter, filter-chip, filter-all, filter-fold, filter-reset, filter-apply, close-filter, tool, zoom, info-layer, fav-layer, lyr-onoff, lyr-remove, mo-menu, mo-nav, mo-sheet, close-modal, modal-tab, meta-data, attr-download, attr-min, attr-max, close-attr, legend-tab, legend-fold, eval-tab, eval-criteria, close-eval, cluster, open-tour, close-tour-list, close-tour-overlay, close-tour-detail, tour-item, tour-pin, tour-info, tour-tab, tour-near-km, tour-detail-route, tour-detail-down, tour-detail-sel, close-basemap, basemap-pick, basemap-color, basemap-opacity
- `data-layer-id` / `data-layer-name` / `data-parent-id` : 레이어 식별
- `data-group-id` : 트리 접기 대상
- `data-dimmed` : 모달 딤. `true` | `false`. `MapUI.openModal(id, { dimmed })` 로 덮어씀
- `data-bind` : keyword, zoom-level, active-layers, meta-title, meta-desc

## 이벤트

| 이벤트 | detail |
|--------|--------|
| `map:layer-change` | `{ id, name, checked, parentId }` |
| `map:search` | `{ keyword, target }` |
| `map:filter` | `{ open?, action?: 'apply' \| 'reset', area[], cat[], cho[] }` |
| `map:tool` | `{ tool, on }` |
| `map:basemap` | `{ open, map?, color?, opacity? }` |
| `map:zoom` | `{ dir: 'in' \| 'out' \| 'set' \| 'drag', level }` 1~10 |
| `map:info` | `{ id }` |
| `map:modal` | `{ id, open, dimmed, tab? }` |
| `map:modal-tab` | `{ tab: 'overview' \| 'spatial' \| 'marine' \| 'model' \| 'data' }` |
| `map:meta-data` | `{ id }` |
| `map:attr` | `{ open, id, min? }` |
| `map:attr-download` | `{ id }` |
| `map:eval` | `{ open, tab? }` |
| `map:eval-tab` | `{ tab: 'all' \| 'valid' }` |
| `map:eval-criteria` | — |
| `map:cluster` | `{ id, name, count, on }` |
| `map:cluster-layer` | `{ open }` |
| `map:tour` | `{ open, overlay? }` |
| `map:tour-item` | `{ id, pin }` |
| `map:mo-nav` | `{ id }` |
| `map:legend` | `{ open, tab? }` |
| `map:legend-tab` | `{ tab: 'grade' \| 'use' \| 'mgmt' }` |
| `map:fav` | `{ id, on }` |
| `map:spatial` | `{ kind: 'op' \| 'an' }` |
| `map:suggest` | `{ open? }` 펼침/접힘. 칩이면 `{ name }` |
| `map:user` | — |
| `map:layer-reset` | — |
| `map:layer-remove` | `{ id }` |
| `map:layer-set` | `{ id }` |

줌: `+`/`-` 클릭, 레일 클릭·드래그, 슬라이더 포커스 후 `↑`/`↓`/`Home`/`End`. 레벨 1~10. `map:zoom` 구독 후 지도 엔진에 넘긴다.

배경지도: 도구 `배경지도`. 미리보기 `map-basemap.html`. `MapUI.openBasemap()` / `closeBasemap()`. 썸네일 `.bmap__thumb` 은 비움. 선택 `basemap-pick`, 투명도 `basemap-opacity`, 배경색 `basemap-color`. 이벤트 `map:basemap`.

추천레이어: GNB 없음. `map-suggest.html` / `MapUI.openSuggest()`. 제목·화살표 클릭으로 칩 펼침. 칩은 `map:suggest` `{ name }`.

관광정보: GNB 관광정보 또는 `map-tour.html` / `MapUI.openTour()`. 패널 `해양공간 주제정보` → `해양레저관광` → `관광정보` 체크.
목록형 `map-tour.html` — 카드 패널 + 시도 클러스터. 카드·클러스터 클릭은 오버레이 `map-tour-overlay.html` — 핀 + 상세 + 범례.
홍성 국가유산야행 오버레이 `map-tour-detail.html` — 개요·주변관광·해양예보도·해양예보지수. `MapUI.openTourDetail()` / `closeTourDetail()`.
`MapUI.openTourOverlay(id)` / `closeTourOverlay()` / `closeTour()`. 관광 `i` 는 메타모달이 아니라 오버레이.

필터: 검색 옆 버튼. 칩 토글·전체선택·접기·초기화·적용. PC `map-filter.html`, 모바일 `map-mo-filter.html`.

하단 속성정보: `MapUI.openAttr()` / `closeAttr()`. 미리보기 `map-attr.html`.
접기 `attr-min`, 확대 `attr-max`, 닫기 `close-attr`, 다운로드는 `map:attr-download`.

격자별 특성평가 결과: `MapUI.openEval()` / `closeEval()` / `setEvalTab('all'|'valid')`.
미리보기 `map-eval.html` `map-eval-valid.html`. 산정기준은 `map:eval-criteria`. 차트는 `[data-bind="eval-chart"]` 이미지. 속성 패널과 동시에 열리지 않는다.

범례: 줌 컨트롤러 왼쪽. `MapUI.openLegend('grade'|'use'|'mgmt')`.

시도 클러스터: 지도 위 원형 마커. `MapUI.openClusters()` / `closeClusters()`.
미리보기 `map-cluster.html`. 클릭은 `map:cluster`. 위치는 `left`/`top` %(미리보기). 개발에서 `setClusters([{ id, name, count, left, top, on }])` 로 갈아끼운다.
미리보기 `map-legend.html` `map-legend-use.html` `map-legend-mgmt.html`. 접기 `legend-fold`.

모바일 전체 메뉴(KRDS 3단): `MapUI.openMoMenu()` / `closeMoMenu()` / `setMoNav('platform'|'bigdata'|'stat'|'archive'|'anal')`.
미리보기 `map-mo-menu.html`. 1차 메뉴 전환은 `map:mo-nav`.

모바일 레이어 리스트(전체 화면): `MapUI.openLayerList()`. 미리보기 `map-mo-lyr.html`.

키보드: `Enter` 검색, `Escape` 모달·필터·특성평가·하단 속성·모바일 메뉴·시트·레이어리스트 닫기.

메타정보 모달: `MapUI.openModal('metaModal', { dimmed, tab })`, `MapUI.setModalTab(tab)`.
`tab` = `overview` | `spatial` | `marine` | `model` | `data`.
미리보기: `map-modal.html` 개요, `map-modal-spatial.html`, `map-modal-marine.html`, `map-modal-model.html`, `map-modal-data.html`.
`data-action="meta-data"` 는 데이터보기 화면으로 전환하고 `map:meta-data` 를 보낸다.
