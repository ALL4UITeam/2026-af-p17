/**
 * map.js — 외부망 지도 화면 UI
 *
 * 역할
 * - 패널/트리/레이어리스트/도구/모바일 시트·메뉴의 화면 상태만 다룬다.
 * - API 호출, 실제 검색, 지도 엔진 연동은 하지 않는다.
 *
 * 개발자 연동
 * 1) 마크업의 data-* 를 읽거나 이벤트를 구독한다.
 * 2) window.MapUI 로 상태를 읽거나 화면을 연다/닫는다.
 *
 * 데이터 훅
 * | 속성 | 의미 |
 * | data-action | tab, toggle, toggle-layer, search, filter, filter-chip, filter-all, filter-fold, filter-reset, filter-apply, close-filter, tool, zoom … |
 * | data-dimmed | 모달 딤 여부. MapUI.openModal(id, { dimmed, tab }) |
 * | data-layer-id | 레이어/그룹 ID. 개발 연동 키 |
 * | data-layer-name | 화면 표시명 |
 * | data-parent-id | 상위 그룹 ID |
 * | data-group-id | 트리 접기/펼치기 대상 |
 * | data-tab | list | fav |
 * | data-tool | layer | basemap | fullmap | dist | area | print |
 * | data-bind | 값이 바뀌는 자리 (keyword, zoom-level, active-layers) |
 *
 * 커스텀 이벤트 (document)
 * - map:layer-change  { id, name, checked, parentId }
 * - map:search        { keyword, target }
 * - map:filter        { open?, action?, area[], cat[], cho[] }
 * - map:tool          { tool, on }
 * - map:basemap       { open, map?, color?, opacity? }
 * - map:area-info     { open }
 * - map:zoom          { dir: 'in' | 'out' | 'set' | 'drag', level }
 * - map:info          { id }
 * - map:modal         { id, open, dimmed, tab? }
 * - map:modal-tab     { tab }
 * - map:meta-data     { id }
 * - map:fav           { id, on }
 * - map:spatial       { kind: 'op' | 'an' }
 * - map:suggest       { open? , name? }
 * - map:user
 * - map:layer-reset | map:layer-remove | map:layer-set
 * - map:eval          { open, tab? }
 * - map:eval-tab      { tab: 'all' | 'valid' }
 * - map:eval-criteria
 * - map:cluster       { id, name, count, on }
 * - map:cluster-layer { open }
 * - map:tour          { open, overlay? }
 * - map:tour-item     { id, pin }
 * - map:tour-detail   { open }
 */
const MO_MQ = window.matchMedia('(max-width: 767px)')
const app = document.getElementById('app')
const panel = document.getElementById('layerPanel')
const lyrList = document.getElementById('lyrList')
const live = document.getElementById('liveStatus')

const ZOOM_MIN = 1
const ZOOM_MAX = 10
const RAIL_H = 119
const KNOB_H = 12
let zoomLevel = 5

function emit(name, detail) {
  document.dispatchEvent(new CustomEvent(name, { detail }))
}

function announce(text) {
  if (!live) return
  live.textContent = text
}

function setExpanded(el, on) {
  if (!el) return
  el.setAttribute('aria-expanded', on ? 'true' : 'false')
}

function toggleClass(el, cls, on) {
  if (!el) return
  el.classList.toggle(cls, on)
}

/** 체크된 레이어 목록 — 개발자가 MapUI.getCheckedLayers() 로 가져감 */
function getCheckedLayers() {
  return [...document.querySelectorAll('[data-action="toggle-layer"]:checked')].map((input) => ({
    id: input.dataset.layerId,
    name: input.dataset.layerName || input.value,
    parentId: input.dataset.parentId || '',
  }))
}

function setLayerChecked(id, checked) {
  const input = document.querySelector(`[data-action="toggle-layer"][data-layer-id="${id}"]`)
  if (!input) return
  input.checked = checked
  const row = input.closest('.tree__d4')
  if (row) toggleClass(row, 'is-on', checked)
  emit('map:layer-change', {
    id,
    name: input.dataset.layerName || input.value,
    checked,
    parentId: input.dataset.parentId || '',
  })
}

function panelGnb() {
  return document.querySelector('[data-action="panel-gnb"]')
}

function syncPanelChrome(open) {
  const handle = document.querySelector('[data-action="collapse-panel"]')
  setExpanded(handle, open)
  if (handle) handle.setAttribute('aria-label', open ? '패널 접기' : '패널 펼치기')
  panelGnb()?.classList.toggle('is-active', open)
  syncMapChromePos()
}

function openPanel() {
  app?.classList.remove('is-panel-off')
  syncPanelChrome(true)
}

function closePanel() {
  app?.classList.add('is-panel-off')
  syncPanelChrome(false)
}

function syncMapChromePos() {
  const status = document.querySelector('.status')
  const legends = document.querySelectorAll('.legend')
  const left = document.querySelector('.app__left')
  const tools = document.getElementById('mapTools')
  if (!left || MO_MQ.matches) {
    if (status) {
      status.style.left = ''
      status.style.right = ''
    }
    legends.forEach((legend) => {
      legend.style.right = ''
      legend.style.width = ''
      legend.style.maxWidth = ''
    })
    return
  }
  const root = app.getBoundingClientRect()
  const leftR = left.getBoundingClientRect()
  const leftBound = Math.max(0, Math.round(leftR.right - root.left + 10))
  let rightBound = 85
  if (tools) {
    const toolsR = tools.getBoundingClientRect()
    rightBound = Math.max(0, Math.round(root.right - toolsR.left + 10))
  }
  if (status) {
    const center = Math.round((leftBound + (root.width - rightBound)) / 2)
    status.style.left = `${center}px`
    status.style.right = 'auto'
  }
  const avail = Math.max(0, Math.round(root.width - leftBound - rightBound))
  legends.forEach((legend) => {
    const cap = legend.classList.contains('legend--tour') ? 424 : 402
    legend.style.right = `${rightBound}px`
    legend.style.width = `${Math.min(cap, avail)}px`
    legend.style.maxWidth = `${avail}px`
  })
}

function setLayerTool(on) {
  document.querySelectorAll('[data-action="tool"][data-tool="layer"]').forEach((btn) => {
    btn.setAttribute('aria-pressed', on ? 'true' : 'false')
    btn.closest('.tools__item')?.classList.toggle('is-active', on)
  })
}

function pickedSheet() {
  return document.getElementById('moPicked')
}

function syncPickedCount() {
  const sheet = pickedSheet()
  if (!sheet) return
  const n = sheet.querySelectorAll('.mo-picked__row').length
  sheet.querySelectorAll('[data-bind="mo-picked-count"]').forEach((el) => {
    el.textContent = String(n)
  })
}

function openLayerList() {
  closeBasemap()
  if (MO_MQ.matches) {
    closeFilter()
    setMoDock('close')
    closeSuggest()
    const sheet = pickedSheet()
    if (sheet) {
      syncPickedCount()
      sheet.hidden = false
    }
    setLayerTool(true)
    return
  }
  lyrList?.classList.add('is-open')
  setLayerTool(true)
}

function closeLayerList() {
  lyrList?.classList.remove('is-open')
  const sheet = pickedSheet()
  if (sheet) sheet.hidden = true
  setLayerTool(false)
}

function setBasemapTool(on) {
  document.querySelectorAll('[data-action="tool"][data-tool="basemap"]').forEach((btn) => {
    btn.setAttribute('aria-pressed', on ? 'true' : 'false')
    btn.closest('.tools__item')?.classList.toggle('is-active', on)
  })
}

function syncBasemapOpacity(value) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  document.querySelectorAll('[data-bind="basemap-opacity"]').forEach((el) => {
    el.value = String(pct)
    el.style.setProperty('--pct', `${pct}%`)
  })
}

function openBasemap() {
  const el = document.getElementById('basemapPop')
  if (!el) return
  closeLayerList()
  el.hidden = false
  setBasemapTool(true)
  syncBasemapOpacity(el.querySelector('[data-bind="basemap-opacity"]')?.value || 70)
  emit('map:basemap', { open: true })
}

function closeBasemap() {
  const el = document.getElementById('basemapPop')
  if (!el || el.hidden) return
  el.hidden = true
  setBasemapTool(false)
  emit('map:basemap', { open: false })
}

function setAreaTool(on) {
  document.querySelectorAll('[data-action="tool"][data-tool="area"]').forEach((btn) => {
    btn.setAttribute('aria-pressed', on ? 'true' : 'false')
    btn.closest('.tools__item')?.classList.toggle('is-active', on)
  })
}

function openAreaInfo(opts = {}) {
  const el = document.getElementById('areaInfo')
  if (!el) return
  if (opts.value != null) {
    const val = el.querySelector('[data-bind="area-value"]')
    if (val) val.textContent = String(opts.value)
  }
  if (opts.left != null) el.style.left = typeof opts.left === 'number' ? `${opts.left}%` : opts.left
  if (opts.top != null) el.style.top = typeof opts.top === 'number' ? `${opts.top}%` : opts.top
  el.hidden = false
  setAreaTool(true)
  emit('map:area-info', { open: true })
}

function closeAreaInfo() {
  const el = document.getElementById('areaInfo')
  if (!el || el.hidden) return
  el.hidden = true
  setAreaTool(false)
  emit('map:area-info', { open: false })
}

function pickBasemap(id) {
  const root = document.getElementById('basemapPop')
  if (!root) return
  root.querySelectorAll('[data-action="basemap-pick"]').forEach((el) => {
    const on = el.dataset.map === id
    el.classList.toggle('is-on', on)
    el.setAttribute('aria-pressed', on ? 'true' : 'false')
  })
  emit('map:basemap', { open: true, map: id })
}

function pickBasemapColor(color) {
  const root = document.getElementById('basemapPop')
  if (!root) return
  root.querySelectorAll('[data-action="basemap-color"]').forEach((el) => {
    const on = el.dataset.color === color
    el.classList.toggle('is-on', on)
    el.setAttribute('aria-pressed', on ? 'true' : 'false')
  })
  emit('map:basemap', { open: true, color })
}

function setInfoLayer(id, on) {
  document.querySelectorAll('[data-action="info-layer"]').forEach((el) => {
    const match = !!on && el.dataset.layerId === id
    el.setAttribute('aria-pressed', match ? 'true' : 'false')
  })
}

/**
 * @param {string} [id]
 * @param {{ dimmed?: boolean }} [opts] dimmed 기본 true. false 면 딤 없이 모달만
 */
function syncMoModalTop() {
  const hdr = document.querySelector('.mo-hdr')
  const dlg = document.querySelector('.dlg:not([hidden])')
  if (!hdr || !dlg || !MO_MQ.matches) return
  dlg.style.setProperty('--mo-hdr', `${hdr.offsetHeight}px`)
}

function openModal(id = 'metaModal', opts = {}) {
  const el = document.getElementById(id)
  if (!el) return
  const dimmed = opts.dimmed ?? el.dataset.dimmed !== 'false'
  el.dataset.dimmed = dimmed ? 'true' : 'false'
  const dim = el.querySelector('.dlg__dim')
  if (dim) dim.hidden = !dimmed
  if (MO_MQ.matches) {
    setMoDock('close')
    closeSuggest()
    closeLayerList()
    closeFilter()
    closeBasemap()
  }
  el.hidden = false
  if (opts.tab) setModalTab(opts.tab)
  syncMoModalTop()
  el.querySelector('.dlg__box')?.focus()
  emit('map:modal', { id, open: true, dimmed, tab: opts.tab || currentModalTab(el) })
}

function openAttr(opts = {}) {
  const el = document.getElementById('attrPanel')
  if (!el) return
  if (opts.title) {
    const title = el.querySelector('[data-bind="attr-title"]')
    if (title) title.textContent = opts.title
  }
  if (opts.count != null) {
    const count = el.querySelector('[data-bind="attr-count"]')
    if (count) count.textContent = String(opts.count)
  }
  el.hidden = false
  if (opts.min != null) el.classList.toggle('is-min', !!opts.min)
  if (opts.max != null) el.classList.toggle('is-max', !!opts.max)
  closeEval()
  app?.classList.add('is-attr')
  emit('map:attr', { open: true, id: el.dataset.layerId, min: el.classList.contains('is-min') })
}

function closeAttr() {
  const el = document.getElementById('attrPanel')
  if (!el || el.hidden) return
  el.hidden = true
  el.classList.remove('is-min', 'is-max')
  app?.classList.remove('is-attr')
  emit('map:attr', { open: false, id: el.dataset.layerId })
}

function applyEvalFilter(root) {
  const valid = root.classList.contains('is-valid')
  const groups = [...new Set([...root.querySelectorAll('tr[data-g]')].map((tr) => tr.dataset.g))]
  groups.forEach((g) => {
    const rows = [...root.querySelectorAll(`tr[data-g="${g}"]`)]
    const th = rows.map((r) => r.querySelector('th')).find(Boolean)
    rows.forEach((tr) => {
      const v = Number(tr.querySelector('[data-val]')?.dataset.val)
      tr.hidden = valid && v === 0
    })
    const vis = rows.filter((r) => !r.hidden)
    if (!vis.length) return
    if (th && th.parentElement !== vis[0]) vis[0].insertBefore(th, vis[0].firstChild)
    if (th) th.rowSpan = vis.length
  })
}

function setEvalTab(tab = 'all') {
  const root = document.getElementById('evalPanel')
  if (!root) return
  const mode = tab === 'valid' ? 'valid' : 'all'
  root.classList.toggle('is-valid', mode === 'valid')
  root.querySelectorAll('[data-action="eval-tab"]').forEach((el) => {
    const on = el.dataset.tab === mode
    el.classList.toggle('is-on', on)
    el.setAttribute('aria-selected', on ? 'true' : 'false')
  })
  applyEvalFilter(root)
  emit('map:eval-tab', { tab: mode })
}

function openEval(opts = {}) {
  const el = document.getElementById('evalPanel')
  if (!el) return
  closeAttr()
  el.hidden = false
  setEvalTab(opts.tab || (el.classList.contains('is-valid') ? 'valid' : 'all'))
  app?.classList.add('is-eval')
  emit('map:eval', { open: true, tab: opts.tab || (el.classList.contains('is-valid') ? 'valid' : 'all') })
}

function closeEval() {
  const el = document.getElementById('evalPanel')
  if (!el || el.hidden) return
  el.hidden = true
  app?.classList.remove('is-eval')
  emit('map:eval', { open: false })
}

function openClusters() {
  const el = document.getElementById('clusterLayer')
  if (!el) return
  el.hidden = false
  emit('map:cluster-layer', { open: true })
}

function closeClusters() {
  const el = document.getElementById('clusterLayer')
  if (!el || el.hidden) return
  el.hidden = true
  emit('map:cluster-layer', { open: false })
}

function setClusters(items = []) {
  const root = document.getElementById('clusterLayer')
  if (!root) return
  root.replaceChildren(
    ...items.map((item) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'cluster'
      if (item.on) btn.classList.add('is-on')
      btn.dataset.action = 'cluster'
      btn.dataset.clusterId = item.id || ''
      btn.dataset.name = item.name || ''
      btn.dataset.count = String(item.count ?? '')
      if (item.left != null) btn.style.left = typeof item.left === 'number' ? `${item.left}%` : item.left
      if (item.top != null) btn.style.top = typeof item.top === 'number' ? `${item.top}%` : item.top
      btn.innerHTML = `<span class="cluster__in"><span class="cluster__name"></span><span class="cluster__count"></span></span>`
      btn.querySelector('.cluster__name').textContent = item.name || ''
      btn.querySelector('.cluster__count').textContent = String(item.count ?? '')
      return btn
    }),
  )
}

function isTourLayer(id) {
  return typeof id === 'string' && id.includes('TOUR')
}

function isTourOpen() {
  return app?.classList.contains('is-tour') === true || app?.classList.contains('is-tour-detail') === true
}

function isTourDetailOpen() {
  return document.getElementById('tourDetail')?.hidden === false
}

function openTourDetail() {
  const el = document.getElementById('tourDetail')
  if (!el) return
  openPanel()
  collapseGroup('mof')
  expandGroup('theme')
  expandGroup('leisure')
  expandGroup('tour')
  collapseGroup('marina')
  collapseGroup('forecast')
  collapseGroup('tour-stat')
  closeTourOverlay()
  closeLayerList()
  closeSuggest()
  closeClusters()
  app?.classList.add('is-tour')
  closeMarina()
  setTourList(true)
  setPoi(false)
  closeTourLegend()
  el.hidden = false
  app?.classList.add('is-tour-detail')
  emit('map:tour-detail', { open: true })
}

function closeTourDetail() {
  const el = document.getElementById('tourDetail')
  if (!el || el.hidden) return
  el.hidden = true
  app?.classList.remove('is-tour-detail')
  if (isTourOpen()) openTourLegend()
  emit('map:tour-detail', { open: false })
}

function setTourNearKm(km = '3') {
  const root = document.getElementById('tourDetail')
  if (!root) return
  root.querySelectorAll('[data-action="tour-near-km"]').forEach((el) => {
    const on = el.dataset.km === km
    el.classList.toggle('is-on', on)
    el.setAttribute('aria-selected', on ? 'true' : 'false')
  })
  emit('map:tour-detail', { open: true, km })
}

function setTourList(open) {
  const el = document.getElementById('tourList')
  if (!el) return
  el.hidden = !open
}

function setTourOverlay(open) {
  const el = document.getElementById('tourOverlay')
  if (!el) return
  el.hidden = !open
}

function setPins(open) {
  const el = document.getElementById('pinLayer')
  if (!el) return
  el.hidden = !open
}

function setPoi(open) {
  const el = document.getElementById('poiPop')
  if (!el) return
  el.hidden = !open
}

function setPoiList(open) {
  const el = document.getElementById('poiListPop')
  if (!el) return
  el.hidden = !open
}

function openPoiStage(kind) {
  closePanel()
  setTourList(false)
  setTourOverlay(false)
  setPins(false)
  document.getElementById('marinaPins')?.setAttribute('hidden', '')
  document.getElementById('marinaPoi')?.setAttribute('hidden', '')
  app?.classList.add('is-poi-only')
  const pin = document.getElementById('poiStagePin')
  if (pin) pin.hidden = false
  setPoi(kind === 'thum')
  setPoiList(kind === 'list')
}

function fillTourPoi(pin) {
  const pop = document.getElementById('poiPop')
  if (!pop || !pin) return
  pop.style.left = pin.style.left
  pop.style.top = pin.style.top
}

function selectTourItem(id) {
  if (!id) return
  document.querySelectorAll('[data-action="tour-item"]').forEach((el) => {
    el.classList.toggle('is-on', el.dataset.tourId === id)
  })
  document.querySelectorAll('[data-action="tour-pin"]').forEach((el) => {
    el.classList.toggle('is-on', el.dataset.tourId === id)
  })
  const card = document.querySelector(`[data-action="tour-item"][data-tour-id="${id}"]`)
  const name = card?.querySelector('.tour__name')?.textContent || card?.querySelector('.poi__name')?.textContent
  const cat = card?.querySelector('.poi__badge')?.textContent
  const addr = card?.querySelector('.tour__addr')?.textContent
  const title = document.querySelector('[data-bind="tour-title"]')
  if (title && name) title.textContent = name
  const poiTitle = document.querySelector('[data-bind="poi-title"]')
  const poiCat = document.querySelector('[data-bind="poi-cat"]')
  const poiAddr = document.querySelector('[data-bind="poi-addr"]')
  if (poiTitle && name) poiTitle.textContent = name
  if (poiCat && cat) poiCat.textContent = cat
  if (poiAddr && addr) poiAddr.textContent = addr
  const pin = document.querySelector(`[data-action="tour-pin"][data-tour-id="${id}"]`)
  if (pin) {
    fillTourPoi(pin)
    setPoi(true)
  }
}

function setTourTab(tab = 'overview') {
  const root = document.getElementById('tourOverlay')
  if (!root) return
  root.querySelectorAll('[data-action="tour-tab"]').forEach((el) => {
    const on = el.dataset.tab === tab
    el.classList.toggle('is-on', on)
    el.setAttribute('aria-selected', on ? 'true' : 'false')
  })
  root.querySelectorAll('[data-pane]').forEach((pane) => {
    const on = pane.dataset.pane === tab
    pane.classList.toggle('is-on', on)
    pane.hidden = !on
  })
  const facts = root.querySelector('[data-bind="tour-facts"]')
  if (facts) facts.hidden = tab !== 'overview'
}

function openTourList() {
  setTourOverlay(false)
  setTourList(true)
  setPins(true)
  app?.classList.remove('is-tour-overlay')
  closeClusters()
  openTourLegend()
  const on = document.querySelector('#tourList [data-action="tour-item"].is-on')
  selectTourItem(on?.dataset.tourId || 'tour-fest-1')
  emit('map:tour', { open: true, overlay: false })
}

function openTourOverlay(id) {
  if (id) selectTourItem(id)
  setTourList(false)
  setPoi(true)
  setTourOverlay(true)
  setPins(true)
  setTourTab('overview')
  app?.classList.add('is-tour-overlay')
  closeClusters()
  openTourLegend()
  emit('map:tour', { open: true, overlay: true, id: id || '' })
}

function closeTourList() {
  setTourList(false)
  emit('map:tour', { open: isTourOpen(), overlay: app?.classList.contains('is-tour-overlay') })
}

function closeTourOverlay() {
  setTourOverlay(false)
  app?.classList.remove('is-tour-overlay')
  setInfoLayer('', false)
  if (isTourOpen()) openTourList()
}

function closeTour() {
  app?.classList.remove('is-tour', 'is-tour-overlay')
  setTourList(false)
  setTourOverlay(false)
  setPins(false)
  setPoi(false)
  closeClusters()
  closeTourLegend()
  closeLayerList()
  emit('map:tour', { open: false })
}

function isMarinaOpen() {
  return app?.classList.contains('is-marina') === true
}

function setMarinaList(open) {
  const el = document.getElementById('marinaList')
  if (!el) return
  el.hidden = !open
}

function setMarinaPins(open) {
  const el = document.getElementById('marinaPins')
  if (!el) return
  el.hidden = !open
}

function setMarinaPoi(open) {
  const el = document.getElementById('marinaPoi')
  if (!el) return
  el.hidden = !open
}

function fillMarinaPoi(pin) {
  const pop = document.getElementById('marinaPoi')
  if (!pop || !pin) return
  pop.style.left = pin.style.left
  pop.style.top = pin.style.top
  const set = (key, val) => {
    const el = pop.querySelector(`[data-bind="${key}"]`)
    if (el && val != null) el.textContent = val
  }
  set('marina-poi-title', pin.dataset.name)
  set('marina-poi-addr', pin.dataset.addr)
  set('marina-poi-region', pin.dataset.region)
  set('marina-poi-area', pin.dataset.area)
  set('marina-poi-port', pin.dataset.port)
  set('marina-poi-operator', pin.dataset.operator)
  set('marina-poi-depth', pin.dataset.depth)
  set('marina-poi-homepage', pin.dataset.homepage)
  set('marina-poi-zip', pin.dataset.zip)
}

function selectMarinaItem(id) {
  if (!id) return
  document.querySelectorAll('[data-action="marina-item"]').forEach((el) => {
    el.classList.toggle('is-on', el.dataset.marinaId === id)
  })
  document.querySelectorAll('[data-action="marina-pin"]').forEach((el) => {
    el.classList.toggle('is-on', el.dataset.marinaId === id)
  })
  const pin = document.querySelector(`[data-action="marina-pin"][data-marina-id="${id}"]`)
  if (pin) {
    fillMarinaPoi(pin)
    setMarinaPoi(true)
  }
  emit('map:marina-item', { id })
}

function openMarina() {
  closeTour()
  openPanel()
  collapseGroup('mof')
  expandGroup('theme')
  expandGroup('leisure')
  collapseGroup('tour')
  expandGroup('marina')
  expandGroup('marina-status')
  collapseGroup('forecast')
  collapseGroup('tour-stat')
  setLayerChecked('LYR_MARINA_STATUS', true)
  closeLayerList()
  closeSuggest()
  closeClusters()
  app?.classList.add('is-marina')
  setMarinaList(true)
  setMarinaPins(true)
  const on = document.querySelector('#marinaList [data-action="marina-item"].is-on')
  selectMarinaItem(on?.dataset.marinaId || 'marina-2')
  emit('map:marina', { open: true })
}

function closeMarina() {
  app?.classList.remove('is-marina')
  setMarinaList(false)
  setMarinaPins(false)
  setMarinaPoi(false)
  emit('map:marina', { open: false })
}

function expandGroup(id) {
  const btn = document.querySelector(`[data-action="toggle"][data-group-id="${id}"]`)
  if (btn && btn.getAttribute('aria-expanded') !== 'true') onToggle(btn)
}

function collapseGroup(id) {
  const btn = document.querySelector(`[data-action="toggle"][data-group-id="${id}"]`)
  if (btn && btn.getAttribute('aria-expanded') === 'true') onToggle(btn)
}

function openTour() {
  closeMarina()
  openPanel()
  collapseGroup('mof')
  expandGroup('theme')
  expandGroup('leisure')
  expandGroup('tour')
  collapseGroup('marina')
  collapseGroup('forecast')
  collapseGroup('tour-stat')
  document.getElementById('kids-tour')?.scrollIntoView({ block: 'nearest' })
  app?.classList.add('is-tour')
  closeLayerList()
  closeSuggest()
  openTourList()
}

function onTourItem(btn) {
  const id = btn.dataset.tourId
  selectTourItem(id)
  emit('map:tour-item', { id, pin: btn.dataset.pin || '' })
  if (isTourDetailOpen()) return
  if (!app?.classList.contains('is-tour')) {
    app?.classList.add('is-tour')
    closeLayerList()
    openPanel()
    openTourList()
    return
  }
  if (app?.classList.contains('is-tour-overlay')) openTourOverlay(id)
}

function onCluster(btn) {
  const on = !btn.classList.contains('is-on')
  btn.classList.toggle('is-on', on)
  emit('map:cluster', {
    id: btn.dataset.clusterId,
    name: btn.dataset.name,
    count: Number(btn.dataset.count),
    on,
  })
}

function setLegendTab(tab = 'grade') {
  const root = document.getElementById('legendPop')
  if (!root) return
  root.classList.toggle('is-tour', tab === 'tour')
  root.querySelectorAll('[data-action="legend-tab"]').forEach((el) => {
    const on = el.dataset.tab === tab
    el.classList.toggle('is-on', on)
    el.setAttribute('aria-selected', on ? 'true' : 'false')
  })
  root.querySelectorAll('[data-pane]').forEach((pane) => {
    const on = pane.dataset.pane === tab
    pane.classList.toggle('is-on', on)
    pane.hidden = !on
  })
  emit('map:legend-tab', { tab })
}

function suggestBar() {
  return document.getElementById('suggestBar')
}

function moSuggestSheet() {
  return document.getElementById('moSuggestSheet')
}

function isSuggestOpen() {
  if (MO_MQ.matches) return app?.classList.contains('is-mo-suggest') === true
  return suggestBar()?.classList.contains('is-open') === true
}

function setMoSuggestChip(name) {
  const sheet = moSuggestSheet()
  if (!sheet || !name) return
  sheet.querySelectorAll('.mo-sg__chip').forEach((chip) => {
    const on = chip.dataset.suggest === name
    chip.classList.toggle('is-on', on)
    chip.setAttribute('aria-selected', on ? 'true' : 'false')
  })
  sheet.querySelectorAll('.mo-sg__list').forEach((list) => {
    list.hidden = list.dataset.sgPanel !== name
  })
  const active = sheet.querySelector(`.mo-sg__list[data-sg-panel="${CSS.escape(name)}"]`)
  document.querySelectorAll('[data-bind="mo-sg-count"]').forEach((el) => {
    el.textContent = String(active?.children.length || 0)
  })
}

function setSuggest(open) {
  if (MO_MQ.matches) {
    const sheet = moSuggestSheet()
    if (!sheet) return
    if (open) {
      setMoDock('close')
      closeLayerList()
      closeFilter()
      setMoMenu(false)
    }
    app?.classList.toggle('is-mo-suggest', open)
    sheet.hidden = !open
    document.querySelectorAll('.mo-suggest[data-action="suggest"]').forEach((btn) => {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false')
    })
    if (open) {
      const current = sheet.querySelector('.mo-sg__chip.is-on')?.dataset.suggest || '어촌'
      setMoSuggestChip(current)
    }
    emit('map:suggest', { open })
    return
  }
  const el = suggestBar()
  if (!el) return
  el.classList.toggle('is-open', open)
  el.querySelectorAll('[data-action="suggest"]').forEach((btn) => {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false')
  })
  const next = el.querySelector('.suggest__next')
  if (next) next.setAttribute('aria-label', open ? '추천레이어 접기' : '추천레이어 펼치기')
  emit('map:suggest', { open })
}

function openSuggest() {
  setSuggest(true)
}

function closeSuggest() {
  if (!isSuggestOpen()) return
  setSuggest(false)
}

function openLegend(tab) {
  const el = document.getElementById('legendPop')
  if (!el) return
  closeTourLegend()
  if (tab) setLegendTab(tab)
  el.hidden = false
  el.classList.remove('is-min')
  const fold = el.querySelector('[data-action="legend-fold"]')
  if (fold) fold.setAttribute('aria-expanded', 'true')
  emit('map:legend', { open: true, tab: tab || el.querySelector('.legend__tab.is-on')?.dataset.tab })
}

function closeLegend() {
  const el = document.getElementById('legendPop')
  if (!el || el.hidden) return
  el.hidden = true
  emit('map:legend', { open: false })
}

function openTourLegend() {
  const el = document.getElementById('legendTour')
  if (!el) return
  const main = document.getElementById('legendPop')
  if (main && !main.hidden) closeLegend()
  el.hidden = false
  emit('map:legend', { open: true, tab: 'tour' })
}

function closeTourLegend() {
  const el = document.getElementById('legendTour')
  if (!el || el.hidden) return
  el.hidden = true
  emit('map:legend', { open: false, tab: 'tour' })
}

function closeModal(id) {
  const el = id
    ? document.getElementById(id)
    : document.querySelector('.dlg:not([hidden])')
  if (!el) return
  el.hidden = true
  setInfoLayer('', false)
  emit('map:modal', { id: el.id, open: false, dimmed: el.dataset.dimmed !== 'false' })
}

function currentModalTab(root) {
  if (root?.classList.contains('is-data')) return 'data'
  return root?.querySelector('.dlg-acc.is-on')?.dataset.acc || 'overview'
}

function setModalAcc(tab = 'overview') {
  const root = document.getElementById('metaModal')
  if (!root) return
  root.querySelectorAll('.dlg-acc').forEach((el) => {
    const on = el.dataset.acc === tab
    el.classList.toggle('is-on', on)
    const btn = el.querySelector('[data-action="modal-acc"]')
    if (btn) btn.setAttribute('aria-expanded', on ? 'true' : 'false')
  })
}

function setModalTab(tab = 'overview') {
  const root = document.getElementById('metaModal')
  if (!root) return
  const isData = tab === 'data'
  let section = 'overview'
  if (!isData) {
    if (tab === 'meta') {
      const cur = currentModalTab(root)
      section = cur === 'data' ? 'overview' : cur
    } else {
      section = tab
    }
  }
  root.classList.toggle('is-data', isData)
  root.querySelectorAll('[data-action="modal-tab"]').forEach((el) => {
    const on = isData ? el.dataset.tab === 'data' : el.dataset.tab === 'meta'
    el.classList.toggle('is-on', on)
    el.setAttribute('aria-selected', on ? 'true' : 'false')
  })
  const metaPane = document.getElementById('metaPaneMeta')
  const dataPane = document.getElementById('metaPaneData')
  if (metaPane) {
    metaPane.hidden = isData
    metaPane.classList.toggle('is-on', !isData)
  }
  if (dataPane) {
    dataPane.hidden = !isData
    dataPane.classList.toggle('is-on', isData)
  }
  if (!isData) setModalAcc(section)
  emit('map:modal-tab', { tab: isData ? 'data' : section })
}

function onModalTab(btn) {
  if (!btn?.dataset.tab) return
  setModalTab(btn.dataset.tab)
}

function setMoNav(id) {
  const root = document.getElementById('moMenu')
  if (!root || !id) return
  root.querySelectorAll('[data-action="mo-nav"]').forEach((el) => {
    const on = el.dataset.nav === id
    el.classList.toggle('is-on', on)
    el.setAttribute('aria-selected', on ? 'true' : 'false')
  })
  root.querySelectorAll('[data-nav-pane]').forEach((pane) => {
    const on = pane.dataset.navPane === id
    pane.hidden = !on
    pane.classList.toggle('is-on', on)
  })
  emit('map:mo-nav', { id })
}

function setMoMenu(open) {
  const menu = document.getElementById('moMenu')
  const trigger = document.querySelector('[data-action="mo-menu"]')
  if (!menu) return
  menu.hidden = !open
  toggleClass(menu, 'is-open', open)
  app?.classList.toggle('is-mo-menu', open)
  setExpanded(trigger, open)
  if (trigger) trigger.setAttribute('aria-label', open ? '메뉴 닫기' : '전체 메뉴')
}

const treeHomeMarkers = new WeakMap()

function panelTrees() {
  return [...document.querySelectorAll('#panelList > .tree, #moAccTrees > .tree')]
}

function dockTreesToMo() {
  const host = document.getElementById('moAccTrees')
  const panelList = document.getElementById('panelList')
  if (!host || !panelList) return
  panelList.querySelectorAll(':scope > .tree').forEach((tree) => {
    if (!treeHomeMarkers.has(tree)) {
      const marker = document.createComment(`tree-home:${tree.dataset.tree || ''}`)
      tree.before(marker)
      treeHomeMarkers.set(tree, marker)
    }
    host.appendChild(tree)
  })
  host.querySelectorAll(':scope > .tree > .tree__group').forEach((group) => {
    group.classList.add('is-open')
  })
}

function restoreTreesFromMo() {
  const host = document.getElementById('moAccTrees')
  if (!host) return
  ;[...host.querySelectorAll(':scope > .tree')].forEach((tree) => {
    const root = tree.querySelector(':scope > .tree__group')
    const head = tree.querySelector(':scope > .tree__head')
    if (root && head?.getAttribute('aria-expanded') !== 'true') root.classList.remove('is-open')
    const marker = treeHomeMarkers.get(tree)
    if (marker?.parentNode) marker.after(tree)
    else document.getElementById('panelList')?.appendChild(tree)
    tree.hidden = false
  })
}

function setMoDock(mode) {
  const peek = document.getElementById('moPeek')
  const acc = document.getElementById('moAcc')
  if (mode !== 'close') closeSuggest()
  app?.classList.toggle('is-mo-peek', mode === 'peek')
  app?.classList.toggle('is-mo-open', mode === 'open')
  app?.classList.toggle('is-mo-sheet', mode !== 'close')
  if (peek) peek.hidden = mode !== 'peek'
  if (acc) acc.hidden = mode !== 'open'
  if (mode === 'open') dockTreesToMo()
  else restoreTreesFromMo()
  document.querySelectorAll('[data-action="mo-sheet"]').forEach((el) => {
    setExpanded(el, mode !== 'close')
  })
  if (mode !== 'close' && MO_MQ.matches) closeLayerList()
  emit('map:sheet', { mode })
}

function openMoGroup(group) {
  const isTheme = group === 'theme'
  setMoDock('open')
  panelTrees().forEach((tree) => {
    const key = tree.dataset.tree
    tree.hidden = isTheme ? key !== 'theme' : key !== 'mof'
  })
  document.querySelectorAll('[data-bind="mo-acc-title"]').forEach((el) => {
    el.textContent = isTheme ? '해양공간 주제정보' : '해양수산정보 분류체계'
  })
  document.querySelectorAll('[data-bind="mo-acc-count"]').forEach((el) => {
    el.textContent = isTheme ? '3' : '6'
  })
}

function expandMoTreeDemo() {
  openMoGroup('mof')
  const ocean = document.querySelector('#moAccTrees [data-group-id="ocean"] > .tree__row')
  const env = document.querySelector('#moAccTrees .tree__d3[data-group-id="env"]')
  const policy = document.querySelector('#moAccTrees [data-group-id="env-policy"]')
  if (ocean && ocean.getAttribute('aria-expanded') !== 'true') onToggle(ocean)
  if (env && env.getAttribute('aria-expanded') !== 'true') onToggle(env)
  if (policy && policy.getAttribute('aria-expanded') !== 'true') onToggle(policy)
}

function findToggleBox(btn, id) {
  const ctrl = btn.getAttribute('aria-controls')
  if (ctrl) {
    const byCtrl = document.getElementById(ctrl)
    if (byCtrl) return byCtrl
  }
  const sib = btn.nextElementSibling
  if (sib?.matches('.tree__group, .tree__branch, .tree__kids, .tree__leaves')) return sib
  if (!id) return null
  return document.querySelector(`#kids-${CSS.escape(id)}, [data-group-id="${CSS.escape(id)}"].tree__group, [data-group-id="${CSS.escape(id)}"].tree__branch`)
}

function onToggle(btn) {
  const kind = btn.dataset.toggle
  const id = btn.dataset.groupId
  const expanded = btn.getAttribute('aria-expanded') === 'true'
  const next = !expanded

  if (kind === 'group') {
    const box = findToggleBox(btn, id)
    if (!box) return
    setExpanded(btn, next)
    toggleClass(box, 'is-open', next)
    toggleClass(btn, 'is-open', next)
    if (box.classList.contains('tree__kids')) box.hidden = !next
    const parent = btn.closest('.tree__group')
    if (parent && btn.classList.contains('tree__row') && parent !== box) toggleClass(parent, 'is-open', next)
    return
  }

  if (kind === 'branch') {
    const leaves =
      document.getElementById(btn.getAttribute('aria-controls') || '') ||
      (btn.closest('.tree__d4, .tree__d5')?.nextElementSibling?.classList.contains('tree__leaves')
        ? btn.closest('.tree__d4, .tree__d5').nextElementSibling
        : null)
    if (!leaves) return
    setExpanded(btn, next)
    toggleClass(btn, 'is-open', next)
    leaves.hidden = !next
    toggleClass(leaves, 'is-open', next)
    return
  }

  if (kind === 'lyr-cat') {
    setExpanded(btn, next)
    const rows = btn.nextElementSibling
    if (rows) rows.hidden = !next
  }
}

function syncFavPane() {
  const pane = document.getElementById('panelFav')
  if (!pane) return
  pane.replaceChildren()
  document.querySelectorAll('#panelList [data-action="fav-layer"][aria-pressed="true"], #moAccTrees [data-action="fav-layer"][aria-pressed="true"]').forEach((btn) => {
    const src = btn.closest('.tree__d5')
    if (!src) return
    const clone = src.cloneNode(true)
    clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'))
    pane.append(clone)
  })
}

function onTab(btn) {
  const tab = btn.dataset.tab
  document.querySelectorAll('[data-action="tab"]').forEach((el) => {
    const on = el === btn
    el.classList.toggle('is-active', on)
    el.setAttribute('aria-selected', on ? 'true' : 'false')
  })
  const list = document.getElementById('panelList')
  const fav = document.getElementById('panelFav')
  if (list) list.hidden = tab !== 'list'
  if (fav) fav.hidden = tab !== 'fav'
  if (tab === 'fav') syncFavPane()
}

function getFilterValues() {
  const pick = (group) =>
    [...document.querySelectorAll(`.flt__chip.is-on[data-filter-group="${group}"]`)].map((el) => el.dataset.value)
  return { area: pick('area'), cat: pick('cat'), cho: pick('cho') }
}

function setFilterChip(chip, on) {
  chip.classList.toggle('is-on', on)
  chip.setAttribute('aria-pressed', on ? 'true' : 'false')
}

function syncFilterSwitch(group) {
  const chips = [...document.querySelectorAll(`.flt__chip[data-filter-group="${group}"]`)]
  const all = chips.length > 0 && chips.every((el) => el.classList.contains('is-on'))
  const sw = document.querySelector(`[data-action="filter-all"][data-filter-group="${group}"]`)
  if (!sw) return
  sw.setAttribute('aria-checked', all ? 'true' : 'false')
  const lab = sw.querySelector('span')
  if (lab) lab.textContent = all ? 'on' : 'off'
}

function syncFilterTags() {
  const box = document.querySelector('[data-bind="filter-chips"]')
  if (!box) return
  box.innerHTML = [...document.querySelectorAll('.flt__chip.is-on')]
    .map(
      (el) =>
        `<button type="button" class="flt__tag" data-action="filter-chip" data-filter-group="${el.dataset.filterGroup}" data-value="${el.dataset.value}">${el.dataset.value}<img src="./src/assets/img/filter/chip-x.svg" width="12" height="12" alt=""></button>`,
    )
    .join('')
}

function onFilterChip(btn) {
  const group = btn.dataset.filterGroup
  const value = btn.dataset.value
  const chip = document.querySelector(`.flt__chip[data-filter-group="${group}"][data-value="${value}"]`)
  if (!chip) return
  setFilterChip(chip, !chip.classList.contains('is-on'))
  syncFilterSwitch(group)
  syncFilterTags()
}

function onFilterAll(btn) {
  const group = btn.dataset.filterGroup
  const next = btn.getAttribute('aria-checked') !== 'true'
  document.querySelectorAll(`.flt__chip[data-filter-group="${group}"]`).forEach((el) => setFilterChip(el, next))
  syncFilterSwitch(group)
  syncFilterTags()
}

function onFilterFold(btn) {
  const group = btn.dataset.filterGroup
  const sec = document.querySelector(`.flt__sec[data-filter-group="${group}"]`)
  const open = btn.getAttribute('aria-expanded') !== 'true'
  btn.setAttribute('aria-expanded', open ? 'true' : 'false')
  sec?.classList.toggle('is-fold', !open)
}

function onFilterReset() {
  document.querySelectorAll('.flt__chip').forEach((el) => setFilterChip(el, false))
  ;['area', 'cat', 'cho'].forEach(syncFilterSwitch)
  syncFilterTags()
  emit('map:filter', { action: 'reset', ...getFilterValues() })
}

function setFilterTriggers(open) {
  document.querySelectorAll('[data-action="filter"]').forEach((el) => {
    el.classList.toggle('is-on', open)
    el.setAttribute('aria-expanded', open ? 'true' : 'false')
  })
}

function openFilter() {
  const el = document.getElementById('filterPop')
  if (!el) return
  if (MO_MQ.matches) {
    setMoDock('close')
    closeLayerList()
  }
  el.hidden = false
  setFilterTriggers(true)
  el.focus()
  emit('map:filter', { open: true, ...getFilterValues() })
}

function closeFilter() {
  const el = document.getElementById('filterPop')
  if (!el || el.hidden) return
  el.hidden = true
  setFilterTriggers(false)
  emit('map:filter', { open: false, ...getFilterValues() })
}

function onFilterApply() {
  emit('map:filter', { action: 'apply', ...getFilterValues() })
  closeFilter()
}

function onSearch(btn) {
  const target = document.getElementById(btn.dataset.target || '')
  const keyword = (target?.value || '').trim()
  announce(keyword ? `검색어: ${keyword}` : '검색어가 없습니다.')
  emit('map:search', { keyword, target: btn.dataset.target || '' })
}

function isCoordSearchOpen() {
  return document.getElementById('coordPop')?.hidden === false
}

function setCoordSearchTrigger(open) {
  document.querySelectorAll('[data-action="coord-search"]').forEach((el) => {
    el.setAttribute('aria-expanded', open ? 'true' : 'false')
  })
}

function openCoordSearch() {
  const el = document.getElementById('coordPop')
  if (!el) return
  el.hidden = false
  setCoordSearchTrigger(true)
  emit('map:coord-search', { open: true })
}

function closeCoordSearch() {
  const el = document.getElementById('coordPop')
  if (!el || el.hidden) return
  el.hidden = true
  setCoordSearchTrigger(false)
  emit('map:coord-search', { open: false })
}

function toggleCoordSearch() {
  if (isCoordSearchOpen()) closeCoordSearch()
  else openCoordSearch()
}

function onCoordGo() {
  const x = document.getElementById('coordX')?.value.trim() || ''
  const y = document.getElementById('coordY')?.value.trim() || ''
  const systemEl = document.querySelector('[data-bind="coord-system"]')
  const system = systemEl?.selectedOptions?.[0]?.textContent?.trim() || systemEl?.value || ''
  announce(x || y ? `좌표 검색: ${x}, ${y}` : '좌표가 없습니다.')
  emit('map:coord-search', { action: 'search', x, y, system })
}

function setPrintActive(on) {
  document.querySelectorAll('[data-action="tool"][data-tool="print"]').forEach((el) => {
    el.setAttribute('aria-pressed', on ? 'true' : 'false')
    el.closest('.tools__item')?.classList.toggle('is-active', on)
  })
}

function onPrint() {
  setPrintActive(true)
  emit('map:tool', { tool: 'print', on: true })
  const done = () => {
    if (done.ran) return
    done.ran = true
    window.removeEventListener('afterprint', done)
    printMq?.removeEventListener?.('change', onPrintMq)
    setPrintActive(false)
    emit('map:tool', { tool: 'print', on: false })
  }
  const onPrintMq = (e) => {
    if (!e.matches) done()
  }
  const printMq = window.matchMedia('print')
  window.addEventListener('afterprint', done)
  printMq.addEventListener?.('change', onPrintMq)
  window.print()
}

function onTool(btn) {
  const tool = btn.dataset.tool
  const on = btn.getAttribute('aria-pressed') !== 'true'
  if (tool === 'layer') {
    if (on) openLayerList()
    else closeLayerList()
  } else if (tool === 'basemap') {
    if (on) openBasemap()
    else closeBasemap()
  } else if (tool === 'area') {
    if (on) openAreaInfo()
    else closeAreaInfo()
  } else if (tool === 'print') {
    if (on) onPrint()
    else setPrintActive(false)
  } else {
    document.querySelectorAll(`[data-action="tool"][data-tool="${tool}"]`).forEach((el) => {
      el.setAttribute('aria-pressed', on ? 'true' : 'false')
      el.closest('.tools__item')?.classList.toggle('is-active', on)
    })
  }
  if (tool !== 'print') emit('map:tool', { tool, on })
}

function clampZoom(n) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(n)))
}

function syncZoomUi() {
  document.querySelectorAll('[data-bind="zoom-level"]').forEach((el) => {
    el.textContent = `Lv.${zoomLevel}`
  })
  const ratio = (zoomLevel - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN)
  const fill = ratio * RAIL_H
  const knob = Math.max(0, Math.min(RAIL_H - KNOB_H, fill - KNOB_H / 2))
  document.querySelectorAll('.tools__rail').forEach((rail) => {
    rail.style.setProperty('--zoom-fill', `${fill}px`)
    rail.style.setProperty('--zoom-knob', `${knob}px`)
    rail.setAttribute('aria-valuenow', String(zoomLevel))
    rail.setAttribute('aria-valuetext', `레벨 ${zoomLevel}`)
  })
}

function setZoom(level, dir = 'set') {
  const next = clampZoom(level)
  if (next === zoomLevel) return
  zoomLevel = next
  syncZoomUi()
  emit('map:zoom', { dir, level: zoomLevel })
}

function onZoom(btn) {
  const dir = btn.dataset.dir === 'out' ? 'out' : 'in'
  setZoom(zoomLevel + (dir === 'in' ? 1 : -1), dir)
}

function levelFromPointer(rail, clientY) {
  const rect = rail.getBoundingClientRect()
  const t = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
  return clampZoom(ZOOM_MAX - t * (ZOOM_MAX - ZOOM_MIN))
}

function bindZoomRail() {
  document.querySelectorAll('.tools__rail').forEach((rail) => {
    let dragging = false

    rail.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return
      dragging = true
      rail.classList.add('is-drag')
      rail.setPointerCapture(event.pointerId)
      setZoom(levelFromPointer(rail, event.clientY), 'set')
      event.preventDefault()
    })
    rail.addEventListener('pointermove', (event) => {
      if (!dragging) return
      setZoom(levelFromPointer(rail, event.clientY), 'drag')
    })
    const endDrag = (event) => {
      if (!dragging) return
      dragging = false
      rail.classList.remove('is-drag')
      if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId)
    }
    rail.addEventListener('pointerup', endDrag)
    rail.addEventListener('pointercancel', endDrag)
    rail.addEventListener('keydown', (event) => {
      const step = {
        ArrowUp: 1,
        ArrowRight: 1,
        ArrowDown: -1,
        ArrowLeft: -1,
        PageUp: 2,
        PageDown: -2,
      }
      if (event.key === 'Home') {
        event.preventDefault()
        setZoom(ZOOM_MAX, 'set')
        return
      }
      if (event.key === 'End') {
        event.preventDefault()
        setZoom(ZOOM_MIN, 'set')
        return
      }
      if (!(event.key in step)) return
      event.preventDefault()
      setZoom(zoomLevel + step[event.key], step[event.key] > 0 ? 'in' : 'out')
    })
  })
}

function onLayerInput(input) {
  const id = input.dataset.layerId
  const checked = input.checked
  if (id) {
    document.querySelectorAll(`[data-action="toggle-layer"][data-layer-id="${id}"]`).forEach((el) => {
      if (el !== input) el.checked = checked
    })
  }
  const row = input.closest('.tree__d4')
  if (row) toggleClass(row, 'is-on', checked)
  if (id && !input.dataset.parentId) {
    document
      .querySelectorAll(`[data-action="toggle-layer"][data-parent-id="${id}"]`)
      .forEach((child) => {
        child.checked = checked
      })
  }
  emit('map:layer-change', {
    id,
    name: input.dataset.layerName || input.value,
    checked,
    parentId: input.dataset.parentId || '',
  })
  if (id === 'LYR_MARINA_STATUS' || id === 'GRP_MARINA_STATUS') {
    if (checked) openMarina()
    else closeMarina()
  }
}

function onSwitch(btn) {
  const on = btn.getAttribute('aria-checked') !== 'true'
  btn.setAttribute('aria-checked', on ? 'true' : 'false')
  btn.classList.toggle('is-on', on)
  const label = btn.querySelector('span')
  if (label) label.textContent = on ? 'on' : 'off'
  emit('map:layer-change', {
    id: btn.dataset.layerId,
    name: '',
    checked: on,
    parentId: '',
  })
}

function closeLyrTips(keep) {
  document.querySelectorAll('.lyr-list__row.is-tip').forEach((el) => {
    if (el === keep) return
    el.classList.remove('is-tip')
    el.querySelector('.lyr-list__opac')?.setAttribute('aria-expanded', 'false')
  })
}

function onLyrOpac(btn) {
  const row = btn.closest('.lyr-list__row')
  const on = !row?.classList.contains('is-tip')
  closeLyrTips(on ? row : null)
  if (row && on) {
    row.classList.add('is-tip')
    btn.setAttribute('aria-expanded', 'true')
    const range = row.querySelector('[data-action="lyr-opacity"]')
    if (range) range.style.setProperty('--pct', `${range.value}%`)
  }
}

function onClick(event) {
  const actionEl = event.target.closest('[data-action]')
  const insideCoord = event.target.closest('#coordPop')
  const isCoordTrigger = actionEl?.dataset.action === 'coord-search'
  if (isCoordSearchOpen() && !insideCoord && !isCoordTrigger) closeCoordSearch()
  const action = actionEl?.dataset.action
  if (action !== 'lyr-opac' && !event.target.closest('.lyr-list__tip')) closeLyrTips()
  if (!actionEl) return

  if (action === 'tab') onTab(actionEl)
  if (action === 'toggle') onToggle(actionEl)
  if (action === 'open-tour') {
    event.preventDefault()
    openTour()
  }
  if (action === 'close-tour-list') closeTourList()
  if (action === 'close-marina-list') closeMarina()
  if (action === 'marina-item' || action === 'marina-pin') selectMarinaItem(actionEl.dataset.marinaId)
  if (action === 'marina-loc' || action === 'marina-info' || action === 'marina-route') {
    if (action !== 'marina-route') selectMarinaItem(actionEl.dataset.marinaId)
    emit('map:marina', { action, id: actionEl.dataset.marinaId || '' })
  }
  if (action === 'marina-more') emit('map:marina', { action, id: '' })
  if (action === 'close-tour-overlay') closeTourOverlay()
  if (action === 'close-tour-detail') closeTourDetail()
  if (action === 'tour-detail-route' || action === 'tour-detail-down') {
    emit('map:tour-detail', { action, sel: actionEl.dataset.sel || '' })
  }
  if (action === 'tour-near-km') setTourNearKm(actionEl.dataset.km)
  if (action === 'tour-item' || action === 'tour-pin') onTourItem(actionEl)
  if (action === 'tour-info') openTourOverlay()
  if (action === 'tour-tab') setTourTab(actionEl.dataset.tab)
  if (action === 'tour-all' || action === 'tour-route') emit('map:tour-item', { id: actionEl.dataset.tourId || '', action })
  if (action === 'tour-sel' || action === 'tour-more') emit('map:tour', { action, sel: actionEl.dataset.sel || '' })
  if (action === 'search') onSearch(actionEl)
  if (action === 'coord-search') toggleCoordSearch()
  if (action === 'coord-locate') emit('map:coord-search', { action: 'locate' })
  if (action === 'coord-go') onCoordGo()
  if (action === 'filter') {
    const pop = document.getElementById('filterPop')
    if (pop && !pop.hidden) closeFilter()
    else openFilter()
  }
  if (action === 'close-filter') closeFilter()
  if (action === 'filter-chip') onFilterChip(actionEl)
  if (action === 'filter-all') onFilterAll(actionEl)
  if (action === 'filter-fold') onFilterFold(actionEl)
  if (action === 'filter-reset') onFilterReset()
  if (action === 'filter-apply') onFilterApply()
  if (action === 'collapse-panel') {
    if (app?.classList.contains('is-panel-off')) openPanel()
    else closePanel()
  }
  if (action === 'panel-gnb') {
    if (app?.classList.contains('is-panel-off')) {
      event.preventDefault()
      openPanel()
    }
  }
  if (action === 'close-lyr-list' || action === 'close-mo-picked') closeLayerList()
  if (action === 'attr-layer') openAttr({ title: actionEl.dataset.layerName || '' })
  if (action === 'close-basemap') closeBasemap()
  if (action === 'basemap-pick') pickBasemap(actionEl.dataset.map)
  if (action === 'basemap-color') pickBasemapColor(actionEl.dataset.color)
  if (action === 'close-attr') closeAttr()
  if (action === 'close-eval') closeEval()
  if (action === 'eval-tab') setEvalTab(actionEl.dataset.tab)
  if (action === 'eval-criteria') emit('map:eval-criteria')
  if (action === 'cluster') onCluster(actionEl)
  if (action === 'attr-min') {
    const panel = document.getElementById('attrPanel')
    panel?.classList.toggle('is-min')
    emit('map:attr', { open: true, min: panel?.classList.contains('is-min'), id: panel?.dataset.layerId })
  }
  if (action === 'attr-max') {
    const panel = document.getElementById('attrPanel')
    if (panel) {
      panel.classList.toggle('is-max')
      panel.classList.remove('is-min')
    }
    emit('map:attr', { open: true, max: panel?.classList.contains('is-max'), id: panel?.dataset.layerId })
  }
  if (action === 'legend-tab') setLegendTab(actionEl.dataset.tab)
  if (action === 'close-legend-tour') closeTourLegend()
  if (action === 'legend-fold') {
    const panel = document.getElementById('legendPop')
    if (panel) {
      const min = !panel.classList.contains('is-min')
      panel.classList.toggle('is-min', min)
      actionEl.setAttribute('aria-expanded', min ? 'false' : 'true')
      actionEl.setAttribute('aria-label', min ? '범례 펼치기' : '범례 접기')
    }
  }
  if (action === 'attr-download') {
    emit('map:attr-download', { id: document.getElementById('attrPanel')?.dataset.layerId })
  }
  if (action === 'attr-row') {
    const row = actionEl.closest('tr')
    const body = row?.closest('tbody')
    if (row && body) {
      body.querySelectorAll('tr').forEach((el) => el.classList.toggle('is-on', el === row))
      emit('map:attr-row', { index: [...body.rows].indexOf(row) })
    }
  }
  if (action === 'reset-lyr-list') emit('map:layer-reset')
  if (action === 'tool') onTool(actionEl)
  if (action === 'zoom') onZoom(actionEl)
  if (action === 'info-layer') {
    setInfoLayer(actionEl.dataset.layerId, true)
    if (isTourLayer(actionEl.dataset.layerId)) {
      if (!isTourOpen()) openTour()
      openTourOverlay()
    } else {
      openModal('metaModal', { dimmed: true, tab: 'overview' })
    }
    emit('map:info', { id: actionEl.dataset.layerId })
  }
  if (action === 'close-modal') closeModal(actionEl.closest('.dlg')?.id)
  if (action === 'modal-tab') onModalTab(actionEl)
  if (action === 'modal-acc') setModalTab(actionEl.dataset.tab)
  if (action === 'fav-layer') {
    const id = actionEl.dataset.layerId
    const on = actionEl.getAttribute('aria-pressed') !== 'true'
    document.querySelectorAll(`[data-action="fav-layer"][data-layer-id="${id}"]`).forEach((el) => {
      el.setAttribute('aria-pressed', on ? 'true' : 'false')
    })
    emit('map:fav', { id, on })
    syncFavPane()
  }
  if (action === 'lyr-opac') onLyrOpac(actionEl)
  if (action === 'lyr-onoff') onSwitch(actionEl)
  if (action === 'lyr-remove') {
    actionEl.closest('.lyr-list__row')?.remove()
    emit('map:layer-remove', { id: actionEl.dataset.layerId })
  }
  if (action === 'lyr-set') emit('map:layer-set', { id: actionEl.dataset.layerId })
  if (action === 'spatial-op') emit('map:spatial', { kind: 'op' })
  if (action === 'spatial-an') emit('map:spatial', { kind: 'an' })
  if (action === 'mo-menu') setMoMenu(document.getElementById('moMenu')?.hidden !== false)
  if (action === 'mo-menu-close') setMoMenu(false)
  if (action === 'mo-nav') setMoNav(actionEl.dataset.nav)
  if (action === 'mo-sheet') {
    const open = app?.classList.contains('is-mo-peek') || app?.classList.contains('is-mo-open')
    setMoDock(open ? 'close' : 'peek')
  }
  if (action === 'mo-expand') openMoGroup(actionEl.dataset.group || 'mof')
  if (action === 'mo-collapse') setMoDock('peek')
  if (action === 'suggest') {
    setSuggest(!isSuggestOpen())
  }
  if (action === 'suggest-close') closeSuggest()
  if (action === 'suggest-chip') {
    const name = actionEl.dataset.suggest || ''
    if (MO_MQ.matches) {
      if (!isSuggestOpen()) setSuggest(true)
      setMoSuggestChip(name)
    }
    emit('map:suggest', { name })
  }
  if (action === 'mo-user') emit('map:user')
}

function onChange(event) {
  const input = event.target
  if (input.matches?.('[data-action="toggle-layer"]')) onLayerInput(input)
  if (input.matches?.('[data-action="lyr-sort"]')) {
    emit('map:layer-sort', { sort: input.value })
  }
  if (input.matches?.('[data-action="coord-system"]')) {
    emit('map:coord-search', {
      action: 'system',
      system: input.value,
      label: input.selectedOptions?.[0]?.textContent?.trim() || '',
    })
  }
  if (input.matches?.('[data-action="tour-detail-sel"]')) {
    emit('map:tour-detail', {
      action: 'tour-detail-sel',
      sel: input.dataset.sel || '',
      value: input.value,
      label: input.selectedOptions?.[0]?.textContent?.trim() || '',
    })
  }
}

function onSkipClick(event) {
  const link = event.target.closest('.skip a')
  if (!link) return
  const id = link.getAttribute('href')?.slice(1)
  const dest = id ? document.getElementById(id) : null
  if (!dest) return
  event.preventDefault()
  dest.setAttribute('tabindex', '-1')
  dest.focus({ preventScroll: false })
}

function syncViewport() {
  if (MO_MQ.matches) {
    closeLayerList()
    closeBasemap()
    closeAttr()
    closeEval()
    closeClusters()
    closeLegend()
    closeTourLegend()
    closeTour()
    closeMarina()
    closeCoordSearch()
    setMoMenu(false)
    return
  }
  setMoMenu(false)
  setMoDock('close')
}

function onKey(event) {
  if (event.key === 'Escape') {
    if (isCoordSearchOpen()) {
      closeCoordSearch()
      return
    }
    const overlay = document.getElementById('tourOverlay')
    if (overlay && !overlay.hidden) {
      closeTourOverlay()
      return
    }
    const tourList = document.getElementById('tourList')
    if (tourList && !tourList.hidden) {
      closeTourList()
      return
    }
    const marinaList = document.getElementById('marinaList')
    if (marinaList && !marinaList.hidden) {
      closeMarina()
      return
    }
    const opened = document.querySelector('.dlg:not([hidden])')
    if (opened) {
      closeModal(opened.id)
      return
    }
    const filter = document.getElementById('filterPop')
    if (filter && !filter.hidden) {
      closeFilter()
      return
    }
    const basemap = document.getElementById('basemapPop')
    if (basemap && !basemap.hidden) {
      closeBasemap()
      return
    }
    const areaInfo = document.getElementById('areaInfo')
    if (areaInfo && !areaInfo.hidden) {
      closeAreaInfo()
      return
    }
    const tourDetail = document.getElementById('tourDetail')
    if (tourDetail && !tourDetail.hidden) {
      closeTourDetail()
      return
    }
    const evalPanel = document.getElementById('evalPanel')
    if (evalPanel && !evalPanel.hidden) {
      closeEval()
      return
    }
    const attr = document.getElementById('attrPanel')
    if (attr && !attr.hidden) {
      closeAttr()
      return
    }
    const tourLegend = document.getElementById('legendTour')
    if (tourLegend && !tourLegend.hidden) {
      closeTourLegend()
      return
    }
    const legend = document.getElementById('legendPop')
    if (legend && !legend.hidden) {
      closeLegend()
      return
    }
    if (isSuggestOpen()) {
      closeSuggest()
      return
    }
    setMoMenu(false)
    if (MO_MQ.matches) {
      setMoDock('close')
      closeLayerList()
    }
    return
  }
  if (event.key !== 'Enter' || !event.target.matches?.('[data-bind="keyword"]')) return
  event.preventDefault()
  const btn = document.querySelector(`[data-action="search"][data-target="${event.target.id}"]`)
  if (btn) onSearch(btn)
}

document.addEventListener('click', onClick)
document.addEventListener('change', onChange)
document.addEventListener('input', (event) => {
  if (event.target.matches?.('[data-action="basemap-opacity"]')) {
    syncBasemapOpacity(event.target.value)
    emit('map:basemap', { open: true, opacity: Number(event.target.value) })
  }
  if (event.target.matches?.('[data-action="lyr-opacity"]')) {
    const range = event.target
    const row = range.closest('.lyr-list__row')
    const pct = row?.querySelector('[data-bind="lyr-opac"]')
    range.style.setProperty('--pct', `${range.value}%`)
    if (pct) pct.textContent = String(range.value)
    emit('map:layer-opacity', { id: range.dataset.layerId, opacity: Number(range.value) })
  }
})
document.addEventListener('click', onSkipClick)
document.addEventListener('keydown', onKey)
MO_MQ.addEventListener('change', syncViewport)
syncViewport()
bindZoomRail()
syncZoomUi()
syncFilterTags()
bootScreen()
syncMapChromePos()
if (typeof ResizeObserver === 'function') {
  const leftCol = document.querySelector('.app__left')
  if (leftCol) new ResizeObserver(syncMapChromePos).observe(leftCol)
}
window.addEventListener('resize', () => {
  syncMapChromePos()
  syncMoModalTop()
})

function bootScreen() {
  const screen = (document.body.dataset.screen || location.hash.replace(/^#/, '') || '').trim()
  const MODAL = {
    modal: { dimmed: true, tab: 'overview' },
    'modal-nodim': { dimmed: false, tab: 'overview' },
    'modal-spatial': { dimmed: true, tab: 'spatial' },
    'modal-marine': { dimmed: true, tab: 'marine' },
    'modal-model': { dimmed: true, tab: 'model' },
    'modal-data': { dimmed: true, tab: 'data' },
  }
  if (screen === 'mo-peek') setMoDock('peek')
  if (screen === 'mo-open') openMoGroup('mof')
  if (screen === 'mo-tree') expandMoTreeDemo()
  if (screen === 'mo-suggest') openSuggest()
  if (screen === 'mo-basemap' || screen === 'basemap') openBasemap()
  if (screen === 'mo-menu') setMoMenu(true)
  if (screen === 'lyr' || screen === 'mo-lyr') openLayerList()
  if (MODAL[screen]) openModal('metaModal', MODAL[screen])
  if (screen === 'filter' || screen === 'mo-filter') openFilter()
  if (screen === 'suggest') openSuggest()
  if (screen === 'tour') openTour()
  if (screen === 'tour-overlay') {
    openTour()
    openTourOverlay()
  }
  if (screen === 'tour-detail') openTourDetail()
  if (screen === 'marina') openMarina()
  if (screen === 'poi') openPoiStage('thum')
  if (screen === 'poi-list') openPoiStage('list')
  if (screen === 'coord') openCoordSearch()
  if (screen === 'area') openAreaInfo()
  if (screen === 'attr') openAttr()
  if (screen === 'eval') openEval()
  if (screen === 'eval-valid') openEval({ tab: 'valid' })
  if (screen === 'cluster') openClusters()
  const legendTab = { legend: 'grade', 'legend-use': 'use', 'legend-mgmt': 'mgmt' }[screen]
  if (legendTab) openLegend(legendTab)
  if (screen === 'legend-tour') openTourLegend()
}

window.MapUI = {
  getCheckedLayers,
  setLayerChecked,
  getZoom: () => zoomLevel,
  setZoom: (level) => setZoom(level, 'set'),
  openPanel,
  closePanel,
  openLayerList,
  closeLayerList,
  openBasemap,
  closeBasemap,
  openAreaInfo,
  closeAreaInfo,
  openModal,
  closeModal,
  setModalTab,
  openAttr,
  closeAttr,
  openEval,
  closeEval,
  setEvalTab,
  openClusters,
  closeClusters,
  setClusters,
  openLegend,
  closeLegend,
  openTourLegend,
  closeTourLegend,
  setLegendTab,
  openFilter,
  closeFilter,
  openCoordSearch,
  closeCoordSearch,
  getFilter: getFilterValues,
  openSuggest,
  closeSuggest,
  openTour,
  closeTour,
  openTourList,
  closeTourList,
  openTourOverlay,
  closeTourOverlay,
  openTourDetail,
  closeTourDetail,
  openMarina,
  closeMarina,
  openMoSheet: () => setMoDock('peek'),
  closeMoSheet: () => setMoDock('close'),
  openMoGroup,
  openMoMenu: () => setMoMenu(true),
  closeMoMenu: () => setMoMenu(false),
  setMoNav,
  on(name, fn) {
    document.addEventListener(name, fn)
    return () => document.removeEventListener(name, fn)
  },
}
