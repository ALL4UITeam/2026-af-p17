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

const pageData = {
  '/guide-map.html': {
    title: 'MAP 스크립트 가이드',
    description: '지도 메타정보 팝업 개발 연동 가이드',
  },
  '/map.html': {
    title: '해양수산공간정보플랫폼',
    description: '해양수산공간정보플랫폼 - 지도',
    mapGroups,
    mapGroupCount: mapGroups.length,
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
  },
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
        const data = pageData[pagePath] ?? {
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
          if (/^map\.html$/i.test(file)) {
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
        if (/^map\.html$/i.test(file)) {
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
        map: path.resolve(__dirname, 'map.html'),
        viewer: path.resolve(__dirname, 'viewer.html'),
        'guide-map': path.resolve(__dirname, 'guide-map.html'),
        ...interInputs(),
        inter: path.resolve(__dirname, 'src/scss/inter.scss'),
        'inter-style': path.resolve(__dirname, 'src/scss/inter-style.scss'),
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
