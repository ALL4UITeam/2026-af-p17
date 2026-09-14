import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
await page.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0' })

const info = await page.evaluate(() => {
  const status = document.querySelector('.status')
  const box = document.querySelector('.status__box')
  const sr = status.getBoundingClientRect()
  const br = box.getBoundingClientRect()
  const cs = getComputedStyle(status)
  return {
    status: {
      x: Math.round(sr.x),
      y: Math.round(sr.y),
      w: Math.round(sr.width),
      h: Math.round(sr.height),
      left: status.style.left,
      right: status.style.right,
      radius: cs.borderRadius,
      pad: cs.padding,
    },
    box: { w: Math.round(br.width), h: Math.round(br.height), radius: getComputedStyle(box).borderRadius },
    text: status.innerText.replace(/\s+/g, ' ').trim(),
  }
})
console.log(JSON.stringify(info, null, 2))

await page.screenshot({
  path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/status-now.png',
  clip: { x: 0, y: 720, width: 1280, height: 80 },
})
await page.$eval('.status', (el) => {
  const r = el.getBoundingClientRect()
  return { x: r.x, y: r.y, w: r.width, h: r.height }
}).then(async (r) => {
  await page.screenshot({
    path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/status-crop.png',
    clip: {
      x: Math.max(0, r.x - 20),
      y: Math.max(0, r.y - 16),
      width: Math.min(1280, r.w + 40),
      height: r.h + 32,
    },
  })
})

await browser.close()
