import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import handlebars from 'vite-plugin-handlebars'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function pad2(n) {
  return String(n).padStart(2, '0')
}

function mockLeaves(count, name, groupId = 'LYR') {
  return Array.from({ length: count }, (_, i) => ({
    id: `${groupId}_${pad2(i + 1)}`,
    ico: pad2((i % 16) + 1),
    name: `${name} ${pad2(i + 1)}`,
  }))
}

const mapGroups = [
  {
    id: 'grpSafety',
    name: '해양안전·관리',
    count: 16,
    open: true,
    leaves: [
      { id: 'LYR_EDDY', ico: '01', name: '와류' },
      { id: 'LYR_ANCHOR', ico: '02', name: '묘박지' },
      { id: 'LYR_SHIP_ACC', ico: '03', name: '선박사고' },
      { id: 'LYR_LIFE_ACC', ico: '04', name: '인명사고' },
      { id: 'LYR_ROUTE_ACCESS', ico: '05', name: '추천항로접속항로' },
      { id: 'LYR_ROUTE_LINK', ico: '06', name: '추천항로연결항로' },
      { id: 'LYR_ROUTE_ALL', ico: '07', name: '추천항로전체항로' },
      { id: 'LYR_WRECK', ico: '08', name: '침선' },
      { id: 'LYR_FRONT', ico: '09', name: '해월전선' },
      { id: 'LYR_TSS', ico: '10', name: '통항분리수역' },
      { id: 'LYR_TSUNAMI', ico: '11', name: '해일위험지구' },
      { id: 'LYR_TRIAL_BAN', ico: '12', name: '시운전금지해역' },
      { id: 'LYR_TSS_EDGE', ico: '13', name: '통항분리경계' },
      { id: 'LYR_VTS', ico: '14', name: '선박교통관제구역' },
      { id: 'LYR_SAR', ico: '15', name: '수난구호관할구역' },
      { id: 'LYR_TANKER_BAN', ico: '16', name: '유조선통항금지해역' },
    ],
  },
  { id: 'grpEco', name: '해양·환경생태', count: 26 },
  { id: 'grpPort', name: '항만·항행', count: 11 },
  { id: 'grpFish', name: '어업활동', count: 12 },
  { id: 'grpTour', name: '해양관광', count: 9 },
  { id: 'grpEnergy', name: '해양에너지', count: 1 },
  { id: 'grpMilitary', name: '군사활동', count: 1 },
  { id: 'grpZone', name: '해양용도구역', count: 1 },
  { id: 'grpMineral', name: '골재·광물', count: 6 },
  { id: 'grpWater', name: '해양수자원', count: 6 },
  { id: 'grpBase', name: '기본공간정보', count: 9 },
  { id: 'grpStat', name: '해양수산통계', count: 8 },
  { id: 'grpSpace', name: '해양공간', count: 3 },
  { id: 'grpShare', name: '공유수면', count: 1 },
  { id: 'grpPolicy', name: '정책활용지도', count: 25 },
  { id: 'grpNondigital', name: '비디지털', count: 132 },
  { id: 'grpObs', name: '관측자료(원자료)', count: 16 },
  { id: 'grpFusion', name: '융합데이터', count: 10 },
  { id: 'grpBiz', name: '사업정보', count: 2 },
].map((group) => ({
  ...group,
  leaves: group.leaves ?? mockLeaves(group.count, group.name, group.id),
}))

const MAP_SCREENS = {
  'map-suggest.html': 'suggest',
  'map-tour.html': 'tour',
  'map-tour-overlay.html': 'tour-overlay',
  'map-tour-detail.html': 'tour-detail',
  'map-marina.html': 'marina',
  'map-poi.html': 'poi',
  'map-poi-list.html': 'poi-list',
  'map-modal.html': 'modal',
  'map-modal-spatial.html': 'modal-spatial',
  'map-modal-marine.html': 'modal-marine',
  'map-modal-model.html': 'modal-model',
  'map-modal-data.html': 'modal-data',
  'map-filter.html': 'filter',
  'map-coord.html': 'coord',
  'map-mo-filter.html': 'mo-filter',
  'map-attr.html': 'attr',
  'map-basemap.html': 'basemap',
  'map-area.html': 'area',
  'map-eval.html': 'eval',
  'map-eval-valid.html': 'eval-valid',
  'map-cluster.html': 'cluster',
  'map-lyr.html': 'lyr',
  'map-legend.html': 'legend',
  'map-legend-use.html': 'legend-use',
  'map-legend-mgmt.html': 'legend-mgmt',
  'map-legend-tour.html': 'legend-tour',
  'map-mo.html': 'mo',
  'map-mo-menu.html': 'mo-menu',
  'map-mo-lyr.html': 'mo-lyr',
  'map-mo-peek.html': 'mo-peek',
  'map-mo-open.html': 'mo-open',
  'map-mo-tree.html': 'mo-tree',
  'map-mo-suggest.html': 'mo-suggest',
  'map-mo-basemap.html': 'mo-basemap',
  'map-mo-modal.html': 'modal',
  'map-mo-attr.html': 'mo-attr',
  'map-login.html': 'login',
}

const mapBase = {
    title: '해양수산공간정보플랫폼',
    description: '해양수산공간정보플랫폼 - 지도',
    mapGroups,
    mapGroupCount: mapGroups.length,
    tourCats: [
      { id: 'LYR_TOUR_ALL', name: '전체' },
      { id: 'LYR_TOUR_STAY', name: '숙박' },
      { id: 'LYR_TOUR_COURSE', name: '코스' },
      { id: 'LYR_TOUR_FEST', name: '축제/공연/행사' },
      { id: 'LYR_TOUR_LEISURE', name: '레저스포츠' },
      { id: 'LYR_TOUR_NATURE', name: '자연 관광' },
      { id: 'LYR_TOUR_SHOP', name: '쇼핑' },
      { id: 'LYR_TOUR_CULTURE', name: '문화 관광' },
      { id: 'LYR_TOUR_EXP', name: '체험 관광' },
      { id: 'LYR_TOUR_SAFE', name: '생활 안전', last: true },
    ],
    tourPlaces: [
      { id: 'tour-fest-1', cat: '축제/공연/행사', name: '홍성 국가유산 야행', addr: '충청남도 홍성군 홍성읍 아문길 27', pin: '03', on: true, thumb: 'tour-detail/near-1.png', left: '49.2%', top: '45.5%' },
      { id: 'tour-shop-1', cat: '쇼핑', name: '유리알유희', addr: '강원특벽자치도 강릉시 창해로 351-2 (강문동)', pin: '06', thumb: 'tour-detail/near-2.png', left: '50.4%', top: '46.8%' },
      { id: 'tour-fest-2', cat: '축제/공연/행사', name: '삼길포 우럭축제', addr: '충청남도 서산시 대산읍 삼길포1로 72-2', pin: '03', thumb: 'tour-detail/near-3.png', left: '48.6%', top: '47.2%' },
      { id: 'tour-fest-3', cat: '축제/공연/행사', name: '시흥월곶포구축제', addr: '경기도 시흥시 월곶해안로 188 (월곶동)', pin: '03', thumb: 'tour-detail/near-4.png', left: '51.1%', top: '44.8%' },
      { id: 'tour-course-1', cat: '문화관광', name: '홍주성 천년여행길', addr: '충청남도 홍성군 홍성읍 조양로 272', pin: '02', thumb: 'poi/thumb-hongju.png', left: '47.8%', top: '46.1%' },
      { id: 'tour-shop-2', cat: '쇼핑', name: '유리알유희', addr: '강원특벽자치도 강릉시 창해로 351-2 (강문동)', pin: '06', thumb: 'tour-detail/near-2.png', left: '50.8%', top: '45.2%' },
      { id: 'tour-fest-4', cat: '축제/공연/행사', name: '삼길포 우럭축제', addr: '충청남도 서산시 대산읍 삼길포1로 72-2', pin: '03', thumb: 'tour-detail/near-3.png', left: '49.8%', top: '48.4%' },
      { id: 'tour-fest-5', cat: '축제/공연/행사', name: '시흥월곶포구축제', addr: '경기도 시흥시 월곶해안로 188 (월곶동)', pin: '03', thumb: 'tour-detail/near-4.png', left: '48.9%', top: '44.2%' },
    ],
    tourLegend: [
      { icon: 'stay', name: '숙박' },
      { icon: 'leisure', name: '레저 스포츠' },
      { icon: 'fest', name: '축제/공연/행사' },
      { icon: 'nature', name: '자연 관광' },
      { icon: 'safe', name: '생활 안전' },
      { icon: 'culture', name: '문화 관광' },
      { icon: 'shop', name: '쇼핑' },
      { icon: 'course', name: '코스' },
      { icon: 'exp', name: '체험 관광' },
    ],
    forecastLayers: [
      { id: 'LYR_FORECAST_LIFE', name: '생활해양예보지수' },
      { id: 'LYR_FORECAST_SHIP', name: '선박운항지수' },
      { id: 'LYR_FORECAST_SEA', name: '해황예보도' },
      { id: 'LYR_FORECAST_BEACH', name: '해수욕장 날씨' },
    ],
    tourStatLayers: [
      { id: 'LYR_STAT_VISIT', name: '지자체별 지역 방문자 통계' },
      { id: 'LYR_STAT_CROWD', name: '관광지 집중률 통계' },
    ],
    marinaPlaces: [
      { id: 'marina-1', name: '격포마리나', addr: '전라남도 부안군 변산면 격포항길 93-60', region: '전남권', area: '부안군', port: '격포마리나', operator: '부안군', depth: '5m', homepage: 'https://www.buan.go.kr', zip: '56347', phone: '063-580-4411', thumb: 'poi/thumb.jpg', left: '42.1%', top: '58.1%' },
      { id: 'marina-2', name: '죽림요트계류시설', addr: '경상남도 통영시 광도면 죽림리 1574-62', region: '경남권', area: '통영시', port: '죽림요트계류시설', operator: '통영시', depth: '6m', homepage: 'https://www.tongyeong.go.kr/00001/00139/05306.web', zip: '53015', phone: '055-650-4114', thumb: 'poi/thumb.jpg', left: '53.9%', top: '55.7%', on: true },
      { id: 'marina-3', name: '서울(여의도)', addr: '서울특별시 영등포구 여의서로 160', region: '수도권', area: '영등포구', port: '서울(여의도)', operator: '서울특별시', depth: '4m', homepage: 'https://www.seoul.go.kr', zip: '07258', phone: '02-2670-4114', thumb: 'tour-detail/near-1.png', left: '55.4%', top: '43.6%' },
      { id: 'marina-4', name: '왕산마리아', addr: '인천광역시 중구 왕산마리나길 143', region: '수도권', area: '중구', port: '왕산마리나', operator: '인천광역시', depth: '5m', homepage: 'https://www.incheon.go.kr', zip: '22386', phone: '032-899-3000', thumb: 'tour-detail/near-2.png', left: '56.9%', top: '30.6%' },
      { id: 'marina-5', name: '아라마리나', addr: '경기도 김포시 고촌읍 아라육로270번길 73', region: '수도권', area: '김포시', port: '아라마리나', operator: '김포시', depth: '4m', homepage: 'https://www.gimpo.go.kr', zip: '10111', phone: '031-980-2000', thumb: 'tour-detail/near-3.png', left: '58.9%', top: '23.4%' },
      { id: 'marina-6', name: '안산해양아카데미', addr: '경기도 안산시 단원구 대부황금로 7', region: '수도권', area: '안산시', port: '안산해양아카데미', operator: '안산시', depth: '5m', homepage: 'https://www.ansan.go.kr', zip: '15654', phone: '031-481-2000', thumb: 'tour-detail/near-4.png', left: '58.4%', top: '43.1%' },
      { id: 'marina-7', name: '전곡마리나', addr: '경기도 화성시 서신면 전곡항로 5', region: '수도권', area: '화성시', port: '전곡마리나', operator: '화성시', depth: '5m', homepage: 'https://www.hwaseong.go.kr', zip: '18554', phone: '031-350-2114', thumb: 'poi/thumb-hongju.png', left: '46.9%', top: '49.3%' },
      { id: 'marina-8', name: '제부마리나', addr: '전라남도 부안군 변산면 격포항길 93-60', region: '전남권', area: '부안군', port: '제부마리나', operator: '부안군', depth: '4m', homepage: 'https://www.buan.go.kr', zip: '56347', phone: '063-580-4411', thumb: 'poi/thumb.jpg', left: '55.2%', top: '50.8%' },
      { id: 'marina-9', name: '보령요트경기장', addr: '충청남도 보령시 남포면 용두육작길 48-28', region: '충청권', area: '보령시', port: '보령요트경기장', operator: '보령시', depth: '5m', homepage: 'https://www.brcn.go.kr', zip: '33492', phone: '041-930-3114', thumb: 'tour-detail/near-1.png', left: '63.0%', top: '39.8%' },
      { id: 'marina-10', name: '목포마리나', addr: '전라남도 목포시 삼학로 88-56', region: '전남권', area: '목포시', port: '목포마리나', operator: '목포시', depth: '6m', homepage: 'https://www.mokpo.go.kr', zip: '58748', phone: '061-270-8114', thumb: 'tour-detail/near-2.png', left: '62.9%', top: '63.0%' },
      { id: 'marina-11', name: '소호마리나', addr: '전라남도 여수시 소호로 392', region: '전남권', area: '여수시', port: '소호마리나', operator: '여수시', depth: '5m', homepage: 'https://www.yeosu.go.kr', zip: '59675', phone: '061-659-4114', thumb: 'tour-detail/near-3.png', left: '65.7%', top: '33.0%' },
      { id: 'marina-12', name: '이순신마리나', addr: '전라남도 여수시 웅천남2로 12', region: '전남권', area: '여수시', port: '이순신마리나', operator: '여수시', depth: '5m', homepage: 'https://www.yeosu.go.kr', zip: '59744', phone: '061-659-4114', thumb: 'tour-detail/near-4.png', left: '39.9%', top: '48.1%' },
    ],
    treeCats: [
      '골재·광물자원특성평가',
      '에너지개발특성평가',
      '해양관광특성평가',
      '환경·생태계특성평가',
      '연구·교육보전특성평가',
      '항만·항행특성평가',
      '군사활동특성평가',
      '안전관리특성평가',
    ],
    treeCatCount: 8,
}

const pageData = {
  '/guide.html': {
    title: '컴포넌트 가이드',
    description: '지도 UI 컴포넌트 · 코드 복사',
  },
  '/guide-map.html': {
    title: 'MAP 스크립트 가이드',
    description: '지도 메타정보 팝업 개발 연동 가이드',
  },
  '/map.html': mapBase,
  '/inter-SFR-001-02.html': {
    title: 'SFR-001-02 | 내부망',
    description: '내부망 관리 화면 SFR-001-02',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-001-02',
    pageTitle: 'SFR-001-02',
  },
  '/inter-SFR-006-01-01.html': {
    title: 'SFR-006-01-01 기본정보 | 내부망',
    description: '기본정보',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-01-01',
    pageTitle: '기본정보',
    currentStep: 1,
  },
  '/inter-SFR-006-01-02.html': {
    title: 'SFR-006-01-02 공유수면 매립면허 현황 | 내부망',
    description: '공유수면 매립면허 현황',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-01-02',
    pageTitle: '공유수면 매립면허 현황',
    currentStep: 2,
  },
  '/inter-SFR-006-01-03.html': {
    title: 'SFR-006-01-03 공유수면 점용사용 허가 현황 | 내부망',
    description: '공유수면 점용사용 허가 현황',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-01-03',
    pageTitle: '공유수면 점용·사용 허가 현황',
    currentStep: 3,
  },
  '/inter-SFR-006-01-04.html': {
    title: 'SFR-006-01-04 해양공간적합성협의 현황 | 내부망',
    description: '해양공간적합성협의 현황',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-01-04',
    pageTitle: '해양공간적합성협의 현황',
    currentStep: 4,
  },
  '/inter-SFR-006-01-05.html': {
    title: 'SFR-006-01-05 어업면허 현황 | 내부망',
    description: '어업면허 현황',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-01-05',
    pageTitle: '어업면허 현황',
    currentStep: 5,
  },
  '/inter-SFR-006-01-06.html': {
    title: 'SFR-006-01-06 이용 및 개발사업 현황 | 내부망',
    description: '이용 및 개발사업 현황',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-01-06',
    pageTitle: '이용 및 개발사업 현황',
    currentStep: 6,
  },
  '/inter-SFR-006-01-07.html': {
    title: 'SFR-006-01-07 지역위원회 구성, 운영 | 내부망',
    description: '지역위원회 구성, 운영',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-01-07',
    pageTitle: '지역위원회 구성, 운영',
    currentStep: 7,
  },
  '/inter-SFR-006-01-08.html': {
    title: 'SFR-006-01-08 지역협의회 구성, 운영 | 내부망',
    description: '지역협의회 구성, 운영',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-01-08',
    pageTitle: '지역협의회 구성, 운영',
    currentStep: 8,
  },
  '/inter-SFR-006-01-09.html': {
    title: 'SFR-006-01-09 지역역량 강화 | 내부망',
    description: '지역역량 강화',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-01-09',
    pageTitle: '지역역량 강화',
    currentStep: 9,
  },
  '/inter-SFR-006-01-10.html': {
    title: 'SFR-006-01-10 해양용도구역 지정 및 변경 | 내부망',
    description: '해양용도구역 지정 및 변경',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-01-10',
    pageTitle: '해양용도구역 지정 및 변경',
    currentStep: 10,
  },
  '/inter-SFR-006-02.html': {
    title: 'SFR-006-02 이행점검 현황 | 내부망',
    description: '이행점검 현황 모니터링 · 통계',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-02',
    pageTitle: '이행점검 현황',
  },
  '/inter-SFR-006-03.html': {
    title: 'SFR-006-03 이행점검 상세 | 내부망',
    description: '이행점검 상세 조회',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-03',
    pageTitle: '이행점검 상세',
  },
  '/inter-SFR-006-04.html': {
    title: 'SFR-006-04 이행점검 결과 목록 | 내부망',
    description: '이행점검 결과 목록',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-04',
    pageTitle: '이행점검 결과 목록',
  },
  '/inter-SFR-006-04-01.html': {
    title: 'SFR-006-04-01 이행점검 결과 | 내부망',
    description: '기초 지자체 이행점검 결과 등록',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-04-01',
    pageTitle: '기초 지자체 이행점검 결과 등록',
    currentStep: 1,
  },
  '/inter-SFR-006-04-02.html': {
    title: 'SFR-006-04-02 이행점검 결과 | 내부망',
    description: '시도 담당자 검토',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-04-02',
    pageTitle: '시도 담당자 검토',
    currentStep: 2,
  },
  '/inter-SFR-006-04-03.html': {
    title: 'SFR-006-04-03 이행점검 결과 | 내부망',
    description: '해양수산부 1차 검토',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-04-03',
    pageTitle: '해양수산부 1차 검토',
    currentStep: 3,
  },
  '/inter-SFR-006-04-04.html': {
    title: 'SFR-006-04-04 이행점검 결과 | 내부망',
    description: '전문기관 검토',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-04-04',
    pageTitle: '전문기관 검토',
    currentStep: 4,
  },
  '/inter-SFR-006-04-05.html': {
    title: 'SFR-006-04-05 이행점검 결과 | 내부망',
    description: '해양수산부 최종 검토 및 승인',
    siteName: '통합 해양공간 GIS 관리',
    pageCode: 'SFR-006-04-05',
    pageTitle: '해양수산부 최종 검토 및 승인',
    currentStep: 5,
  },
}

for (const [file, screen] of Object.entries(MAP_SCREENS)) {
  pageData[`/${file}`] = { ...mapBase, screen }
}

function mapInputs() {
  const entries = {
    map: path.resolve(__dirname, 'map.html'),
  }
  for (const file of Object.keys(MAP_SCREENS)) {
    const name = file.replace(/\.html$/i, '')
    // CSS 엔트리 키 'map-mo' 와 같으면 HTML이 덮여서 빌드에서 빠진다.
    const key = name === 'map-mo' ? 'map-mo-page' : name
    entries[key] = path.resolve(__dirname, file)
  }
  return entries
}

/** 루트의 inter-*.html 을 빌드 엔트리에 자동 포함 */
function interInputs() {
  const entries = {}
  for (const name of fs.readdirSync(__dirname)) {
    if (!/^inter-.+\.html$/i.test(name)) continue
    const key = name.replace(/\.html$/i, '')
    entries[key] = path.resolve(__dirname, name)
  }
  return entries
}

function assetFileNames(assetInfo) {
  const original = (assetInfo.originalFileNames?.[0] || '').replace(/\\/g, '/')
  const fromSrcAssets = original.match(/(?:^|\/)src\/assets\/(.+)$/)
  if (fromSrcAssets) {
    return `assets/${fromSrcAssets[1]}`
  }

  const name = assetInfo.names?.[0] || assetInfo.name || 'asset'
  return `assets/${name}`
}

export default defineConfig({
  base: './',
  plugins: [
    handlebars({
      partialDirectory: [
        path.resolve(__dirname, 'partials'),
        path.resolve(__dirname, 'partials-inter'),
      ],
      helpers: {
        ifeq(a, b, options) {
          return a === b ? options.fn(this) : options.inverse(this)
        },
        /** currentStep 기준: is-on | is-done | '' */
        stepState(current, n) {
          const c = Number(current)
          const i = Number(n)
          if (c === i) return 'is-on'
          if (c > i) return 'is-done'
          return ''
        },
      },
      context(pagePath) {
        const key = `/${path.basename(String(pagePath).replace(/\\/g, '/'))}`
        const data = pageData[key] ?? pageData[pagePath] ?? {
          title: '통합 해양공간 GIS 플랫폼',
          description: '통합 해양공간 GIS 플랫폼',
          siteName: '통합 해양공간 GIS 관리',
          pageCode: '',
          pageTitle: '내부망',
        }
        return { ...data }
      },
    }),
    /**
     * inter.css / inter-style.css 를 각각 별도 산출물로 유지.
     * HTML에 걸린 SCSS link는 Vite가 페이지 CSS로 합치므로,
     * 빌드 시에는 제거하고 rollup 엔트리로만 빌드한 뒤 링크를 주입한다.
     * (dev는 HTML의 ./src/scss/*.scss link 그대로 사용)
     */
    {
      name: 'inter-split-css',
      transformIndexHtml: {
        order: 'pre',
        handler(html, ctx) {
          const file = path.basename(ctx.filename || ctx.path || '')
          if (ctx.server) return html
          if (/^inter-/i.test(file)) {
            return html.replace(
              /\s*<link\s+rel="stylesheet"\s+href="\.\/src\/scss\/inter(?:-style)?\.scss"\s*>/gi,
              '',
            )
          }
          if (/^map/i.test(file) && /\.html$/i.test(file)) {
            return html.replace(
              /\s*<link\s+rel="stylesheet"\s+href="\.\/src\/scss\/map-mo\.scss"\s*>/gi,
              '',
            )
          }
          return html
        },
      },
      generateBundle(_options, bundle) {
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (chunk.type !== 'chunk' || !chunk.isEntry) continue
          if (
            chunk.name !== 'inter' &&
            chunk.name !== 'inter-style' &&
            chunk.name !== 'map-mo'
          ) {
            continue
          }
          const code = (chunk.code || '').replace(/\s+/g, '')
          if (!code || code === '"use strict";') {
            delete bundle[fileName]
          }
        }
      },
    },
    {
      name: 'inter-split-css-inject',
      apply: 'build',
      enforce: 'post',
      transformIndexHtml(html, ctx) {
        const file = path.basename(ctx.filename || ctx.path || '')
        if (/^inter-/i.test(file)) {
          if (html.includes('./assets/inter.css')) return html
          return html.replace(
            '</head>',
            '  <link rel="stylesheet" href="./assets/inter.css">\n  <link rel="stylesheet" href="./assets/inter-style.css">\n</head>',
          )
        }
        if (/^map/i.test(file) && /\.html$/i.test(file)) {
          if (html.includes('./assets/map-mo.css')) return html
          // map.css 는 map.js 번들이 붙임. 모바일만 추가 주입.
          return html.replace(
            '</head>',
            '  <link rel="stylesheet" href="./assets/map-mo.css">\n</head>',
          )
        }
        return html
      },
    },
    /** file:// 로컬 열기용: crossorigin / module 제거 */
    {
      name: 'file-protocol-friendly',
      apply: 'build',
      enforce: 'post',
      transformIndexHtml(html) {
        return html
          .replace(/\s+crossorigin(?:="[^"]*")?/gi, '')
          .replace(/<link\s+rel="modulepreload"[^>]*>\s*/gi, '')
          .replace(
            /<script[^>]*src="\.\/assets\/modulepreload-polyfill\.js"[^>]*><\/script>\s*/gi,
            '',
          )
          .replace(/<script\s+type="module"/gi, '<script defer')
      },
      generateBundle(_options, bundle) {
        for (const file of Object.values(bundle)) {
          if (file.type !== 'chunk' || !file.code) continue
          file.code = file.code
            .replace(/import\s*["']\.\/modulepreload-polyfill\.js["'];?/g, '')
            .replace(
              /(?:""\+)?new URL\((["'][^"']+["']),\s*import\.meta\.url\)\.href/g,
              'new URL($1,(document.currentScript&&document.currentScript.src)||location.href).href',
            )
            .replace(/import\.meta\.url/g, '((document.currentScript&&document.currentScript.src)||location.href)')
        }
      },
    },
  ],
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [path.resolve(__dirname, 'src/scss')],
      },
    },
  },
  build: {
    assetsInlineLimit: 0,
    modulePreload: false,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        ...mapInputs(),
        guide: path.resolve(__dirname, 'guide.html'),
        viewer: path.resolve(__dirname, 'viewer.html'),
        ...interInputs(),
        'map-mo': path.resolve(__dirname, 'src/scss/map-mo.scss'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames,
      },
    },
  },
})
