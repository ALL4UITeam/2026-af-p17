import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
const failed = []
page.on('response', (res) => {
  if (res.url().includes('/layer/') || res.url().includes('drag') || res.url().includes('opacity') || res.url().includes('mark') || res.url().includes('set.svg') || res.url().includes('del.svg')) {
    failed.push({ url: res.url(), status: res.status() })
  }
})
await page.setViewport({ width: 1920, height: 1080 })
await page.goto('http://localhost:5173/map-lyr.html', { waitUntil: 'networkidle0', timeout: 30000 })
const info = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const s = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    return {
      tag: el.tagName,
      w: Math.round(r.width),
      h: Math.round(r.height),
      bg: s.backgroundImage,
      color: s.color,
      display: s.display,
    }
  }
  return {
    grip: pick('.lyr-list__grip'),
    opac: pick('.lyr-list__opac'),
    mark: pick('.lyr-list__mark'),
    set: pick('.lyr-list__set'),
    del: pick('.lyr-list__del'),
    close: pick('.lyr-list__close'),
    arr: pick('.lyr-list__select-arr'),
    reset: pick('.lyr-list__reset'),
    ico: pick('.lyr-list__cat-ico'),
    html: document.querySelector('.lyr-list__row')?.innerHTML.slice(0, 400),
  }
})
console.log(JSON.stringify({ info, failed }, null, 2))
await browser.close()
