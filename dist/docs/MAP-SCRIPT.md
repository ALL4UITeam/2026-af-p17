# MAP 스크립트 가이드

지도(`map.html`) 전용 JS 연동 문서입니다. 내부망(inter) 스크립트는 포함하지 않습니다.

## 파일

| 파일 | 역할 |
|------|------|
| `src/js/map.js` | 패널·도구·좌표·**메타 팝업 열기/닫기·포커스** (+ 모바일 UI 스크립트) |
| `src/js/meta.js` | **메타 데이터 조회·`fillMetaPop`** |
| `src/js/a11y.js` | announce / focus trap / tablist / inert |
| `src/js/zoom.js` | 줌 컨트롤 |

### SCSS 분리 (PC 기본 / 모바일 추가)

| 엔트리 | 산출 | 용도 |
|--------|------|------|
| `src/scss/main.scss` | `dist/assets/map.css` | **PC 전용** (내부망은 이것만) |
| `src/scss/map-mo.scss` | `dist/assets/map-mo.css` | **모바일 추가** (퍼블 map.html 만) |

- `main.scss` → 컴포넌트 PC + `pc/_hide-mo.scss` (`.mo-*` 숨김)
- `map-mo.scss` → `components/_mo.scss` (`@media max-width: 1023px`)
- 내부망: `map-mo` link / import **제외**. 모바일 마크업도 빼면 더 깔끔.

빌드 후: `dist/assets/map.js` + `map.css` (+ 선택 `map-mo.css`)

---

## 메타정보 팝업 흐름

```
.leaf__info[data-layer-id] 클릭
        │
        ▼
 fetchLayerMeta(id)     ← 개발이 API로 교체 (setMetaFetcher)
        │
        ▼
 fillMetaPop(data)      ← #metaPop 안 data-meta=* 채움
        │
        ▼
 openMetaPop(title, btn) ← 포커스 트랩 · 배경 inert · Esc
```

### 마크업 계약

```html
<button type="button"
  class="leaf__info"
  data-layer-id="LYR_ROUTE_ACCESS"
  aria-label="추천항로접속항로 정보">
```

팝업 본문은 `data-meta` 훅으로만 채웁니다. (`partials/pop-meta.hbs`)

| 훅 | 내용 |
|----|------|
| `data-meta="badges"` | 뱃지 |
| `data-meta="desc"` | 설명 |
| `data-meta="classes"` | 주제분류 |
| `data-meta="tags"` | 주제어 |
| `data-meta="cards"` | 유형/기관 카드 |
| `data-meta="spatial"` / `marine` / `model` | 아코디언 본문 |
| `data-meta="dataView"` | 데이터보기 탭 |

---

## 데이터 스펙 (`fillMetaPop` 인자)

```js
{
  id: 'LYR_ROUTE_ACCESS',
  title: '추천항로접속항로',
  badges: [
    { type: 'open', label: '공개' },   // open | db
    { type: 'db', label: '기초 DB' },
  ],
  overview: {
    desc: '설명 텍스트',
    classes: [
      {
        chip: 'mof',              // mof | gov | src
        chipLabel: '해양수산분류',
        path: ['공공질서 및 안전', '해경', '해상안전'],
      },
    ],
    tags: ['요트', '항로'],
    cards: [
      { icon: 'folder', label: '유형', value: '공간 자료(좌표형)' },
      // icon: folder | graph | building | desktop
    ],
  },
  spatial: '공간 메타…',
  marine: '해양특성…',
  model: '데이터모델…',
  dataView: '데이터보기…',
}
```

목업 샘플: `MOCK_META.LYR_ROUTE_ACCESS`, `MOCK_META.LYR_CATCH` (`src/js/meta.js`)

---

## 개발자 호출 방법

`map.html` 로드 후 전역 **`window.MapUI`** 사용.

### 1) API 연동 (권장)

```js
MapUI.setMetaFetcher(async (layerId) => {
  const res = await fetch(`/api/layers/${layerId}/meta`)
  if (!res.ok) throw new Error(res.status)
  return res.json() // 위 스펙과 동일한 객체
})
```

이후 info 버튼 클릭만 하면 자동으로 fetch → fill → open.

### 2) 코드에서 직접 열기

```js
// 레이어 ID만으로
await MapUI.openMeta('LYR_ROUTE_ACCESS')

// 이미 가진 데이터로 채운 뒤 열기
MapUI.fillMeta(myData)
MapUI.openMeta(myData.id) // 다시 fetch 함 → 데이터만 쓰려면 fill 후 내부 open만 필요

// 닫기
MapUI.closeMeta()
```

### 3) API 목록

| API | 설명 |
|-----|------|
| `MapUI.openMeta(layerId, trigger?)` | fetch → fill → 팝업 열기. `trigger`에 버튼 넘기면 닫을 때 포커스 복귀 |
| `MapUI.closeMeta()` | 팝업 닫기 |
| `MapUI.fillMeta(data)` | DOM만 채움 (열지 않음) |
| `MapUI.setMetaFetcher(fn)` | `(id) => Promise<data>` 교체 |
| `MapUI.MOCK_META` | 퍼블 목업 객체 (참고용) |

---

## 접근성 (퍼블 유지 — 수정 금지 권장)

- `role="dialog"` + `aria-modal="true"`
- 열림: 배경 `inert`, **포커스 트랩**, 초기 포커스 = 닫기
- Esc / 딤 클릭 닫기 → 트리거(info)로 포커스 복귀
- 탭: 화살표·Home·End (`bindTablist`)

---

## 그 밖의 map.js 동작 (참고)

| 기능 | 트리거 |
|------|--------|
| 패널 열기/닫기 | `#panelHandle`, Esc |
| LNB 선택 | `.lnb__item` |
| 레이어/트리 접기 | `.layer__item`, `.sub__row`, `.tree__fold` |
| 검색 submit | `.search` (announce만, API 없음) |
| 줌 | `#mapZoom` → `createZoom` |
| 도구·범례 | `.tools__item`, `.tools__legend` |
| 좌표 형식 | `.status__fmt-btn` listbox |

패널/도구는 UI 목업입니다. 실제 지도 SDK 연동은 개발 영역입니다.

---

## 확인

- 가이드 페이지: `guide-map.html`
- 실화면: `map.html` → 종합지도 → **추천항로접속항로** info  
  (`data-layer-id="LYR_ROUTE_ACCESS"` 목업 데이터)
