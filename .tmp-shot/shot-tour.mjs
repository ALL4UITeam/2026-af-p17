import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })
await page.goto('http://localhost:5173/map.html#tour', { waitUntil: 'networkidle0' })
await page.waitForSelector('#kids-tour.is-open')
const panel = await page.$('#layerPanel')
await panel.screenshot({ path: 'tour-panel.png' })
const clicks = await page.evaluate(() => {
  const click = (sel) => document.querySelector(sel)?.click()
  const vis = (el) => {
    if (!el) return { exists: false }
    const s = getComputedStyle(el)
    return {
      exists: true,
      hidden: el.hidden,
      display: s.display,
      isOpen: el.classList.contains('is-open'),
    }
  }
  click('[data-group-id="industry"][data-action="toggle"]')
  click('[data-group-id="fish"][data-action="toggle"]')
  const d3 = document.querySelector('#kids-fish [data-group-id="fish-d3"]') || document.querySelector('#kids-fish .tree__d3')
  d3?.click()
  const d4btn = document.querySelector('#kids-fish [data-toggle="branch"]')
  d4btn?.click()
  return {
    industry: vis(document.getElementById('kids-industry')),
    fish: vis(document.getElementById('kids-fish')),
    fishKids: vis(document.querySelector('#kids-fish .tree__kids, #kids-fish .tree__branch')),
    fishLeaves: vis(document.querySelector('#kids-fish .tree__leaves')),
    tour: vis(document.getElementById('kids-tour')),
    tourLeaves: vis(document.getElementById('leaves-tour')),
  }
})
console.log(JSON.stringify(clicks, null, 2))
await browser.close()
