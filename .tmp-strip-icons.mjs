import fs from 'node:fs'
import path from 'node:path'

const reps = [
  ['<span class="tree__d5-ico" aria-hidden="true"><img src="./src/assets/img/icon/row-plus.svg" width="18" height="18" alt=""></span>', '<span class="tree__d5-ico" aria-hidden="true"><span class="ico-close"></span></span>'],
  ['<button type="button" class="dlg__close" data-action="close-modal" aria-label="닫기">\n        <img src="./src/assets/img/modal/close.svg" alt="">\n      </button>', '<button type="button" class="dlg__close" data-action="close-modal" aria-label="닫기"></button>'],
  ['<img src="./src/assets/img/modal/chev.svg" alt="">', '<span class="dlg__chev" aria-hidden="true"></span>'],
  ['<span class="dlg-card__ico"><img src="./src/assets/img/modal/folder.svg" width="40" height="40" alt=""></span>', '<span class="dlg-card__ico dlg-card__ico--folder"></span>'],
  ['<span class="dlg-card__ico"><img src="./src/assets/img/modal/graph.svg" width="40" height="40" alt=""></span>', '<span class="dlg-card__ico dlg-card__ico--graph"></span>'],
  ['<span class="dlg-card__ico dlg-card__ico--sm"><img src="./src/assets/img/modal/building.svg" width="24" height="24" alt=""></span>', '<span class="dlg-card__ico dlg-card__ico--sm"></span>'],
  ['<span class="dlg-card__ico dlg-card__ico--pc"><img src="./src/assets/img/modal/desktop.svg" width="22" height="19" alt=""></span>', '<span class="dlg-card__ico dlg-card__ico--pc"></span>'],
  ['        <img src="./src/assets/img/icon/chevron-right.svg" width="12" height="12" alt="">\n', ''],
  ['<button type="button" class="status__more" aria-label="더보기">\n      <img src="./src/assets/img/icon/status-more.svg" width="11" height="11" alt="">\n    </button>', '<button type="button" class="status__more" aria-label="더보기"></button>'],
  ['<button type="button" class="coord-pop__btn" data-action="coord-locate" aria-label="현재 위치">\n          <img src="./src/assets/img/coord/locate.svg" width="24" height="24" alt="">\n        </button>', '<button type="button" class="coord-pop__btn" data-action="coord-locate" aria-label="현재 위치"></button>'],
  ['<button type="button" class="coord-pop__btn coord-pop__btn--search" data-action="coord-go" aria-label="좌표 검색">\n          <img src="./src/assets/img/coord/search.svg" width="16" height="16" alt="">\n        </button>', '<button type="button" class="coord-pop__btn coord-pop__btn--search" data-action="coord-go" aria-label="좌표 검색"></button>'],
  ['    <img src="./src/assets/img/icon/flag.svg" width="24" height="16" alt="">\n', ''],
  ['    <img src="./src/assets/img/icon/suggest.svg" width="20" height="20" alt="">\n', ''],
  [' <img src="./src/assets/img/icon/chip-x.svg" width="16" height="16" alt="">', ''],
  ['<img src="./src/assets/img/icon/chip-arr.svg" width="16" height="16" alt="">', ''],
  ['<img src="./src/assets/img/tour/close.svg" width="24" height="24" alt="">', ''],
  ['<img src="./src/assets/img/tour/select.svg" width="9" height="5" alt="">', ''],
  ['<img src="./src/assets/img/tour/search.svg" width="16" height="16" alt="">', ''],
  ['<img src="./src/assets/img/tour/back.svg" width="12" height="12" alt="">', ''],
  ['<img src="./src/assets/img/tour/all.svg" width="16" height="16" alt="">', ''],
  ['<img src="./src/assets/img/tour/route.svg" width="16" height="16" alt="">', ''],
  ['<img src="./src/assets/img/marina/location.svg" width="24" height="24" alt="">', ''],
  ['<img src="./src/assets/img/marina/info.svg" width="24" height="24" alt="">', ''],
  ['<span class="tour__fact-ico"><img src="./src/assets/img/tour/zip.svg" width="20" height="20" alt=""></span>', '<span class="tour__fact-ico tour__fact-ico--zip"></span>'],
  ['<span class="tour__fact-ico"><img src="./src/assets/img/tour/phone.svg" width="20" height="20" alt=""></span>', '<span class="tour__fact-ico tour__fact-ico--phone"></span>'],
  ['<span class="tour__fact-ico"><img src="./src/assets/img/tour/web.svg" width="20" height="20" alt=""></span>', '<span class="tour__fact-ico tour__fact-ico--web"></span>'],
  ['<span class="tour__fact-ico"><img src="./src/assets/img/tour/pin.svg" width="20" height="20" alt=""></span>', '<span class="tour__fact-ico tour__fact-ico--pin"></span>'],
  ['<span class="tour__fact-ico"><img src="./src/assets/img/tour/cal.svg" width="20" height="20" alt=""></span>', '<span class="tour__fact-ico tour__fact-ico--cal"></span>'],
  ['<span class="tour__fact-ico"><img src="./src/assets/img/tour/clock.svg" width="20" height="20" alt=""></span>', '<span class="tour__fact-ico tour__fact-ico--clock"></span>'],
  ['<span class="tour__fact-ico"><img src="./src/assets/img/tour/fee.svg" width="20" height="20" alt=""></span>', '<span class="tour__fact-ico tour__fact-ico--fee"></span>'],
  ['<img src="./src/assets/img/tour/ext.svg" width="12" height="12" alt="">', ''],
  ['<span class="tdetail__pill-ico"><img src="./src/assets/img/tour/route.svg" width="16" height="16" alt=""></span>', '<span class="tdetail__pill-ico tdetail__pill-ico--route"></span>'],
  ['<span class="tdetail__pill-ico"><img src="./src/assets/img/tour-detail/download.svg" width="16" height="16" alt=""></span>', '<span class="tdetail__pill-ico tdetail__pill-ico--download"></span>'],
  ['<span class="tdetail__dot"><img src="./src/assets/img/tour-detail/bullet.svg" width="12" height="12" alt=""></span>', '<span class="tdetail__dot"></span>'],
  ['<span class="tdetail__fact-ico"><img src="./src/assets/img/tour/zip.svg" width="20" height="20" alt=""></span>', '<span class="tdetail__fact-ico tdetail__fact-ico--zip"></span>'],
  ['<span class="tdetail__fact-ico"><img src="./src/assets/img/tour/phone.svg" width="20" height="20" alt=""></span>', '<span class="tdetail__fact-ico tdetail__fact-ico--phone"></span>'],
  ['<span class="tdetail__fact-ico"><img src="./src/assets/img/tour/web.svg" width="20" height="20" alt=""></span>', '<span class="tdetail__fact-ico tdetail__fact-ico--web"></span>'],
  ['<span class="tdetail__fact-ico"><img src="./src/assets/img/tour/pin.svg" width="20" height="20" alt=""></span>', '<span class="tdetail__fact-ico tdetail__fact-ico--pin"></span>'],
  ['<span class="tdetail__fact-ico"><img src="./src/assets/img/tour/cal.svg" width="20" height="20" alt=""></span>', '<span class="tdetail__fact-ico tdetail__fact-ico--cal"></span>'],
  ['<span class="tdetail__fact-ico"><img src="./src/assets/img/tour/clock.svg" width="20" height="20" alt=""></span>', '<span class="tdetail__fact-ico tdetail__fact-ico--clock"></span>'],
  ['<span class="tdetail__fact-ico"><img src="./src/assets/img/tour/fee.svg" width="20" height="20" alt=""></span>', '<span class="tdetail__fact-ico tdetail__fact-ico--fee"></span>'],
  ['<img src="./src/assets/img/tour-detail/dot-good.svg" width="8" height="8" alt="">', ''],
  ['<img src="./src/assets/img/tour-detail/dot-bad.svg" width="8" height="8" alt="">', ''],
  ['<img src="./src/assets/img/tour-detail/dot-warn.svg" width="8" height="8" alt="">', ''],
  ['<img src="./src/assets/img/tour-detail/dot-mid.svg" width="8" height="8" alt="">', ''],
  ['<img src="./src/assets/img/poi/info.svg" width="16" height="16" alt="">', ''],
  ['<img src="./src/assets/img/poi/route.svg" width="16" height="16" alt="">', ''],
  ['<span class="poi__mark"><img src="./src/assets/img/poi/hotel.svg" width="9" height="12" alt=""></span>', '<span class="poi__mark poi__mark--hotel"></span>'],
  ['<span class="poi__mark"><img src="./src/assets/img/poi/safety.svg" width="12" height="11" alt=""></span>', '<span class="poi__mark poi__mark--safety"></span>'],
]

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) walk(p, out)
    else if (name.endsWith('.hbs')) out.push(p)
  }
  return out
}

for (const file of walk('partials')) {
  let text = fs.readFileSync(file, 'utf8')
  const next = reps.reduce((s, [a, b]) => s.split(a).join(b), text)
  if (next !== text) {
    fs.writeFileSync(file, next)
    console.log('updated', file)
  }
}
