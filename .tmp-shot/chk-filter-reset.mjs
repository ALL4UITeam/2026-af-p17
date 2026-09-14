import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080 })
await page.goto('http://localhost:5173/map-filter.html', { waitUntil: 'networkidle0', timeout: 30000 })
await page.waitForSelector('#filterPop:not([hidden])')
const info = await page.evaluate(() => {
  const btn = document.querySelector('.flt__reset')
  const img = document.querySelector('.flt__reset-pc')
  const s = getComputedStyle(btn)
  const is = getComputedStyle(img)
  return {
    btn: { w: btn.offsetWidth, h: btn.offsetHeight, bg: s.backgroundColor, border: s.border, radius: s.borderRadius },
    img: { w: img.offsetWidth, h: img.offsetHeight, src: img.getAttribute('src'), natural: [img.naturalWidth, img.naturalHeight] },
    css: { w: is.width, h: is.height },
  }
})
const btn = await page.$('.flt__reset')
await btn.screenshot({ path: 'filter-reset.png' })
const flt = await page.$('#filterPop')
await flt.screenshot({ path: 'filter-now.png' })
console.log(JSON.stringify(info, null, 2))
await browser.close()
