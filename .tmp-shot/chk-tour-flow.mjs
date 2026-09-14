import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080 })

const box = (el) => {
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { x: Math.round(r.x), w: Math.round(r.width), hidden: el.hidden, display: getComputedStyle(el).display }
}

// 1) overlay screen: 1st panel + detail overlay
await page.goto('http://localhost:5173/map-tour-overlay.html', { waitUntil: 'networkidle0', timeout: 30000 })
const overlay = await page.evaluate(() => {
  const box = (el) => {
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.x), w: Math.round(r.width), hidden: el.hidden, display: getComputedStyle(el).display }
  }
  return {
    app: document.getElementById('app')?.className,
    panel: box(document.getElementById('layerPanel')),
    list: box(document.getElementById('tourList')),
    over: box(document.getElementById('tourOverlay')),
  }
})
await page.screenshot({ path: 'tour-overlay-2panel.png' })

// 2) list -> 정보 보기
await page.goto('http://localhost:5173/map-tour.html', { waitUntil: 'networkidle0', timeout: 30000 })
await page.click('[data-action="tour-info"]')
const afterInfo = await page.evaluate(() => {
  const box = (el) => {
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.x), w: Math.round(r.width), hidden: el.hidden, display: getComputedStyle(el).display }
  }
  return {
    app: document.getElementById('app')?.className,
    panel: box(document.getElementById('layerPanel')),
    list: box(document.getElementById('tourList')),
    over: box(document.getElementById('tourOverlay')),
  }
})
await page.screenshot({ path: 'tour-info-over.png' })

// 3) map.html checkbox
await page.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0', timeout: 30000 })
const before = await page.evaluate(() => ({
  listHidden: document.getElementById('tourList')?.hidden,
  isTour: document.getElementById('app')?.classList.contains('is-tour'),
}))
await page.evaluate(() => {
  const input = document.querySelector('[data-action="toggle-layer"][data-layer-id="GRP_TOUR"]')
  if (!input) return
  if (!input.checked) {
    input.checked = true
    input.dispatchEvent(new Event('change', { bubbles: true }))
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.click()
  }
})
// if click toggled off because it was already checked by click after we set checked...
await page.evaluate(() => {
  const input = document.querySelector('[data-action="toggle-layer"][data-layer-id="GRP_TOUR"]')
  if (input && !input.checked) {
    input.checked = true
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }
})
await page.waitForFunction(() => document.getElementById('app')?.classList.contains('is-tour'), { timeout: 3000 }).catch(() => {})
const afterChk = await page.evaluate(() => {
  const box = (el) => {
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.x), w: Math.round(r.width), hidden: el.hidden, display: getComputedStyle(el).display }
  }
  return {
    app: document.getElementById('app')?.className,
    panel: box(document.getElementById('layerPanel')),
    list: box(document.getElementById('tourList')),
    checked: document.querySelector('[data-action="toggle-layer"][data-layer-id="GRP_TOUR"]')?.checked,
  }
})
await page.screenshot({ path: 'tour-from-chk.png' })

// 4) close list
await page.click('[data-action="close-tour-list"]')
const afterClose = await page.evaluate(() => ({
  listHidden: document.getElementById('tourList')?.hidden,
  panelDisplay: getComputedStyle(document.getElementById('layerPanel')).display,
  isTour: document.getElementById('app')?.classList.contains('is-tour'),
}))

console.log(JSON.stringify({ overlay, afterInfo, before, afterChk, afterClose }, null, 2))
await browser.close()
