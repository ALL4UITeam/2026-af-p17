/** KRDS / KWCAG 접근성 헬퍼 */

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

export function bindTablist(root) {
  if (!root) return
  const tabs = [...root.querySelectorAll('[role="tab"]')]

  function activate(tab) {
    tabs.forEach((t) => {
      const on = t === tab
      t.classList.toggle('tab--on', on)
      t.classList.toggle('dtab--on', on)
      t.setAttribute('aria-selected', String(on))
      t.tabIndex = on ? 0 : -1
    })
    tab.focus()
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
}

export function focusPanel(panel) {
  if (!panel || panel.hidden) return
  window.requestAnimationFrame(() => {
    panel.focus()
  })
}
