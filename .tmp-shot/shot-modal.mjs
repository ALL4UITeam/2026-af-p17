import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })

async function shot(file, name) {
  await page.goto(`http://localhost:5173/${file}`, { waitUntil: 'networkidle0' })
  const info = await page.evaluate(() => {
    const dlg = document.getElementById('metaModal')
    const box = dlg?.querySelector('.dlg__box')
    const r = box?.getBoundingClientRect()
    return {
      hidden: dlg?.hidden,
      tabs: [...dlg.querySelectorAll('[data-action="modal-tab"]')].map((el) => ({
        tab: el.dataset.tab,
        on: el.classList.contains('is-on'),
      })),
      acc: [...dlg.querySelectorAll('.dlg-acc')].map((el) => ({
        id: el.dataset.acc,
        on: el.classList.contains('is-on'),
      })),
      dataHidden: document.getElementById('metaPaneData')?.hidden,
      badge: dlg.querySelector('.dlg__badge--pub')?.textContent,
      close: {
        w: Math.round(dlg.querySelector('.dlg__close')?.getBoundingClientRect().width || 0),
      },
      box: r ? { w: Math.round(r.width), h: Math.round(r.height) } : null,
    }
  })
  console.log(name, JSON.stringify(info))
  const box = await page.$('.dlg__box')
  if (box) await box.screenshot({ path: `C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/modal-${name}.png` })
}

await shot('map-modal.html', 'overview')
await shot('map-modal-spatial.html', 'spatial')
await shot('map-modal-marine.html', 'marine')
await shot('map-modal-model.html', 'model')
await shot('map-modal-data.html', 'data')

await page.goto('http://localhost:5173/map-modal-spatial.html', { waitUntil: 'networkidle0' })
await page.$eval('[data-action="modal-acc"][data-tab="marine"]', (el) => el.click())
console.log('click marine', await page.evaluate(() =>
  [...document.querySelectorAll('.dlg-acc')].map((el) => ({ id: el.dataset.acc, on: el.classList.contains('is-on') })),
))
await page.$eval('[data-action="modal-tab"][data-tab="data"]', (el) => el.click())
console.log('click data tab', await page.evaluate(() => ({
  dataHidden: document.getElementById('metaPaneData')?.hidden,
  metaHidden: document.getElementById('metaPaneMeta')?.hidden,
  dataOn: document.querySelector('[data-tab="data"]')?.classList.contains('is-on'),
})))

await browser.close()
