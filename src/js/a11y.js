/**
 * a11y.js — KRDS / KWCAG 접근성 헬퍼
 *
 * ── export 목차 ───────────────────────────────────────
 *  announce          스크린리더 라이브 영역 (#liveStatus)
 *  setPressed        aria-pressed + 토글 클래스
 *  getFocusable      보이는 포커스 가능 요소
 *  focusPanel        패널 첫 포커스
 *  trapFocus         dialog Tab 순환 (반환: release)
 *  setBackgroundInert dialog 열릴 때 배경 inert
 *  bindTablist       tablist / tabpanel 키보드
 * ─────────────────────────────────────────────────────
 */

const FOCUSABLE_SEL = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/* —— 라이브 영역 · pressed —— */
export function announce(message) {
  const live = document.getElementById('liveStatus')
  if (!live || !message) return
  live.textContent = ''
  window.requestAnimationFrame(() => {
    live.textContent = message
  })
}

export function setPressed(el, pressed) {
  if (!el) return
  el.setAttribute('aria-pressed', String(pressed))
  el.classList.toggle('tools__item--on', pressed && el.classList.contains('tools__item'))
  el.classList.toggle('quick__item--on', pressed && el.hasAttribute('data-quick'))
  el.classList.toggle('cat--on', pressed && el.classList.contains('cat'))
}

/* —— 포커스 유틸 —— */
/** 보이는 포커스 가능 요소만 */
export function getFocusable(root) {
  if (!root) return []
  return [...root.querySelectorAll(FOCUSABLE_SEL)].filter((el) => {
    if (el.closest('[hidden]')) return false
    if (el.getAttribute('aria-hidden') === 'true') return false
    if (el.closest('[inert]')) return false
    return true
  })
}

export function focusPanel(panel) {
  if (!panel || panel.hidden) return
  window.requestAnimationFrame(() => {
    const first = getFocusable(panel)[0];
    (first || panel).focus()
  })
}

/**
 * dialog 포커스 트랩.
 * @returns {() => void} release
 */
export function trapFocus(dialog, { initialFocus } = {}) {
  if (!dialog) return () => {}

  const onKeyDown = (e) => {
    if (e.key !== 'Tab') return
    const list = getFocusable(dialog)
    if (!list.length) {
      e.preventDefault()
      dialog.focus()
      return
    }
    const first = list[0]
    const last = list[list.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first || document.activeElement === dialog) {
        e.preventDefault()
        last.focus()
      }
      return
    }
    if (document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  /** 포커스가 dialog 밖으로 나가면 다시 끌어옴 */
  const onFocusIn = (e) => {
    if (dialog.contains(e.target)) return
    e.stopPropagation()
    const list = getFocusable(dialog)
    ;(list[0] || dialog).focus()
  }

  dialog.addEventListener('keydown', onKeyDown)
  document.addEventListener('focusin', onFocusIn)

  window.requestAnimationFrame(() => {
    const target =
      initialFocus ||
      getFocusable(dialog)[0] ||
      dialog
    target.focus()
  })

  return () => {
    dialog.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('focusin', onFocusIn)
  }
}

/**
 * dialog 열릴 때 배경(형제 노드) inert.
 * liveStatus / script / dialog·dim 은 제외.
 */
export function setBackgroundInert(on, keep = []) {
  const keepSet = new Set(keep.filter(Boolean))
  ;[...document.body.children].forEach((el) => {
    if (keepSet.has(el)) return
    if (el.id === 'liveStatus') return
    if (el.tagName === 'SCRIPT') return
    el.toggleAttribute('inert', on)
  })
}

/* —— tablist —— */
/**
 * tablist + tabpanel.
 * @param {ParentNode} root tablist 또는 그 조상
 * @param {{ tabClass?: string, onChange?: (tab: Element) => void }} [opts]
 */
export function bindTablist(root, opts = {}) {
  if (!root) return
  const tabClass = opts.tabClass || 'tab--on'
  const list = root.matches('[role="tablist"]')
    ? root
    : root.querySelector('[role="tablist"]')
  if (!list) return

  const tabs = [...list.querySelectorAll('[role="tab"]')]

  function activate(tab, { focus = true } = {}) {
    tabs.forEach((t) => {
      const on = t === tab
      t.classList.toggle(tabClass, on)
      t.classList.toggle('tab--on', on)
      t.classList.toggle('dtab--on', on)
      t.classList.toggle('pop__tab--on', on)
      t.setAttribute('aria-selected', String(on))
      t.tabIndex = on ? 0 : -1
      const paneId = t.getAttribute('aria-controls')
      const pane = paneId ? document.getElementById(paneId) : null
      if (pane) pane.hidden = !on
    })
    if (focus) tab.focus()
    opts.onChange?.(tab)
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activate(tab))
    tab.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(tab)
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        activate(tabs[(i + 1) % tabs.length])
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        activate(tabs[(i - 1 + tabs.length) % tabs.length])
      } else if (e.key === 'Home') {
        e.preventDefault()
        activate(tabs[0])
      } else if (e.key === 'End') {
        e.preventDefault()
        activate(tabs[tabs.length - 1])
      }
    })
  })

  return { activate }
}
