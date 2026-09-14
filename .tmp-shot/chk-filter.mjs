import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080 })
await page.goto('http://localhost:5173/map-filter.html', { waitUntil: 'networkidle0', timeout: 30000 })
await page.waitForSelector('#filterPop:not([hidden])', { timeout: 8000 })
const info = await page.evaluate(() => {
  const flt = document.getElementById('filterPop')
  const head = flt.querySelector('.flt__head')
  const title = flt.querySelector('.flt__title')
  const close = flt.querySelector('.flt__close')
  const sw = flt.querySelector('.flt__switch')
  const chipOn = flt.querySelector('.flt__chip.is-on')
  const choOn = flt.querySelector('.flt__grid--7 .flt__chip.is-on')
  const choOff = flt.querySelector('.flt__grid--7 .flt__chip:not(.is-on)')
  const reset = flt.querySelector('.flt__reset')
  const apply = flt.querySelector('.flt__apply')
  const cs = (el) => {
    if (!el) return null
    const s = getComputedStyle(el)
    return {
      bg: s.backgroundColor,
      color: s.color,
      radius: s.borderRadius,
      border: s.border,
      w: Math.round(el.getBoundingClientRect().width),
      h: Math.round(el.getBoundingClientRect().height),
    }
  }
  return {
    hidden: flt.hidden,
    head: cs(head),
    title: cs(title),
    close: cs(close),
    switch: cs(sw),
    chipOn: cs(chipOn),
    choOn: cs(choOn),
    choOff: cs(choOff),
    reset: cs(reset),
    apply: cs(apply),
  }
})
const box = await page.$('#filterPop')
await box.screenshot({ path: 'filter-now.png' })
console.log(JSON.stringify(info, null, 2))
await browser.close()
