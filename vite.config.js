import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import handlebars from 'vite-plugin-handlebars'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const pageData = {
  '/map.html': {
    title: '통합 해양공간 GIS 플랫폼',
    description: '통합 해양공간 GIS 플랫폼 - 지도',
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
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        map: path.resolve(__dirname, 'map.html'),
        viewer: path.resolve(__dirname, 'viewer.html'),
        ...interInputs(),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames,
      },
    },
  },
})
