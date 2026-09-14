import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})

async function shot(page, name, w, h, url) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
  await page.goto(url, { waitUntil: 'networkidle0' })
  const info = await page.evaluate(() => {
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), d: s.display }
    }
    const chip = document.querySelector('.flt__chip[data-value="경기도"]')
    return {
      hidden: document.getElementById('filterPop')?.hidden,
      flt: box(document.getElementById('filterPop')),
      head: box(document.querySelector('.flt__head')),
      close: box(document.querySelector('.flt__close')),
      fold: box(document.querySelector('.flt__fold')),
      apply: box(document.querySelector('.flt__apply')),
      applyTxt: document.querySelector('.flt__apply')?.innerText?.trim(),
      tags: box(document.querySelector('.flt__tags')),
      grid4: getComputedStyle(document.querySelector('.flt__grid--4')).gridTemplateColumns,
      grid3: getComputedStyle(document.querySelector('.flt__grid--3')).gridTemplateColumns,
      grid7: getComputedStyle(document.querySelector('.flt__grid--7')).gridTemplateColumns,
      search: box(document.querySelector('.mo-search')),
      titleColor: getComputedStyle(document.querySelector('.flt__title')).color,
      headBg: getComputedStyle(document.querySelector('.flt__head')).backgroundColor,
      chipOn: document.querySelectorAll('.flt__chip.is-on').length,
    }
  })
  await page.screenshot({ path: `C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/${name}.png` })
  return info
}

const page = await browser.newPage()
const pc = await shot(page, 'flt-pc-now', 1280, 900, 'http://localhost:5173/map.html#filter')
console.log('PC', JSON.stringify(pc, null, 2))

await page.click('.flt__chip[data-value="경기도"]')
await page.click('.flt__fold[data-filter-group="cat"]')
const pcAfter = await page.evaluate(() => ({
  gyeonggi: document.querySelector('.flt__chip[data-value="경기도"]')?.classList.contains('is-on'),
  catFold: document.querySelector('.flt__sec[data-filter-group="cat"]')?.classList.contains('is-fold'),
  tags: [...document.querySelectorAll('.flt__tag')].map((el) => el.textContent),
}))
console.log('PC after click', pcAfter)
await page.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/flt-pc-click.png' })

await page.click('.flt__reset')
const pcReset = await page.evaluate(() => ({
  on: document.querySelectorAll('.flt__chip.is-on').length,
  tags: document.querySelector('[data-bind="filter-chips"]')?.innerHTML,
}))
console.log('PC reset', pcReset)

const mo = await shot(page, 'flt-mo-now', 360, 768, 'http://localhost:5173/map.html#mo-filter')
console.log('MO', JSON.stringify(mo, null, 2))

await page.click('.flt__chip[data-value="부산시"]')
await page.click('.flt__fold[data-filter-group="area"]')
const moAfter = await page.evaluate(() => ({
  busan: document.querySelector('.flt__chip[data-value="부산시"]')?.classList.contains('is-on'),
  areaFold: document.querySelector('.flt__sec[data-filter-group="area"]')?.classList.contains('is-fold'),
  searchDisplay: getComputedStyle(document.querySelector('.mo-search')).display,
}))
console.log('MO after click', moAfter)
await page.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/flt-mo-click.png' })

await page.click('.flt__apply')
const moApply = await page.evaluate(() => document.getElementById('filterPop')?.hidden)
console.log('MO apply closed', moApply)

await browser.close()
