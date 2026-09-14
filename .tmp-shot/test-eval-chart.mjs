import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))

await page.goto('http://localhost:5173/map-eval.html', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 400))

const all = await page.evaluate(() => {
  const panel = document.getElementById('evalPanel')
  const img = panel?.querySelector('.eval__radar img')
  const head = panel?.querySelector('.eval__head')
  return {
    open: !panel?.hidden,
    title: document.getElementById('evalTitle')?.textContent,
    headBg: head ? getComputedStyle(head).backgroundColor : '',
    titleColor: getComputedStyle(document.getElementById('evalTitle')).color,
    chart: !!img,
    chartSrc: img?.getAttribute('src') || '',
    chartW: img?.naturalWidth || 0,
    chartH: img?.naturalHeight || 0,
    cols: !!panel?.querySelector('.eval__cols'),
    rows: panel?.querySelectorAll('tbody tr:not([hidden])').length,
  }
})
console.log('EVAL', JSON.stringify(all))
await page.screenshot({ path: '.tmp-shot/eval-chart-now.png' })

await page.click('[data-action="eval-tab"][data-tab="valid"]')
await new Promise((r) => setTimeout(r, 200))
const valid = await page.evaluate(() => ({
  on: document.querySelector('[data-action="eval-tab"][data-tab="valid"]')?.classList.contains('is-on'),
  rows: document.querySelectorAll('#evalPanel tbody tr:not([hidden])').length,
  hidden: document.querySelectorAll('#evalPanel tbody tr[hidden]').length,
}))
console.log('VALID', JSON.stringify(valid))

await page.goto('http://localhost:5173/map-eval-valid.html', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 300))
const bootValid = await page.evaluate(() => ({
  open: !document.getElementById('evalPanel')?.hidden,
  validOn: document.querySelector('[data-action="eval-tab"][data-tab="valid"]')?.classList.contains('is-on'),
  chart: !!document.querySelector('.eval__radar img'),
}))
console.log('BOOT_VALID', JSON.stringify(bootValid))

await browser.close()
