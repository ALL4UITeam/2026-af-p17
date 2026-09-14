import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
await page.goto('http://localhost:5173/map-basemap.html', { waitUntil: 'networkidle0' })

const hits = await page.evaluate(() => {
  const el = document.getElementById('basemapPop')
  const r = el.getBoundingClientRect()
  const pts = []
  for (let y = 0; y <= 4; y++) {
    for (let x = 0; x <= 2; x++) {
      const px = r.x + r.width * (x / 2)
      const py = r.y + r.height * (y / 4)
      const n = document.elementFromPoint(px, py)
      const chain = []
      let cur = n
      while (cur && cur !== document.body && chain.length < 6) {
        const cls = typeof cur.className === 'string' ? cur.className.split(' ')[0] : ''
        chain.push(cur.id ? `${cur.tagName.toLowerCase()}#${cur.id}` : cls || cur.tagName.toLowerCase())
        cur = cur.parentElement
      }
      pts.push({ x: Math.round(px), y: Math.round(py), chain: chain.join(' > ') })
    }
  }
  const enc = el.querySelector('[data-map="enc"]')
  const er = enc.getBoundingClientRect()
  const mid = document.elementFromPoint(er.x + er.width / 2, er.y + er.height / 2)
  const midChain = []
  let cur = mid
  while (cur && cur !== document.body && midChain.length < 8) {
    const cls = typeof cur.className === 'string' ? cur.className.split(' ')[0] : ''
    midChain.push(cur.id ? `${cur.tagName.toLowerCase()}#${cur.id}` : cls || cur.tagName.toLowerCase())
    cur = cur.parentElement
  }
  return {
    pts,
    enc: {
      x: Math.round(er.x),
      y: Math.round(er.y),
      w: Math.round(er.width),
      h: Math.round(er.height),
      chain: midChain.join(' > '),
    },
  }
})
console.log(JSON.stringify(hits, null, 2))
await browser.close()
