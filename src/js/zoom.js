/**
 * 지도 줌 슬라이더
 * - 레벨: 0 ~ max (기본 12)
 * - 초기값: max / 2 (중간)
 * - 확대(+)/축소(-) 버튼, 레일 클릭, 노브 드래그
 *
 * @example
 * const zoom = createZoom({
 *   root: document.getElementById('mapZoom'),
 *   max: 12,
 *   onChange(level, prev, reason) {
 *     // map.setZoom(level)
 *   },
 * })
 * zoom.set(8)
 * zoom.setMax(18)
 * zoom.onChange((level) => { ... })
 */
export function createZoom(options = {}) {
  const root = options.root || document.getElementById('mapZoom')
  if (!root) {
    console.warn('[zoom] root not found')
    return null
  }

  const rail = root.querySelector('[data-zoom-rail]')
  const fill = root.querySelector('[data-zoom-fill]')
  const knob = root.querySelector('[data-zoom-knob]')
  const lv = root.querySelector('[data-zoom-lv]')
  const btnIn = root.querySelector('[data-zoom="in"]')
  const btnOut = root.querySelector('[data-zoom="out"]')

  let min = options.min ?? 0
  let max = Number(options.max ?? root.dataset.max ?? 12)
  let level = options.value ?? Math.round((min + max) / 2)
  const listeners = new Set()

  if (typeof options.onChange === 'function') {
    listeners.add(options.onChange)
  }

  function clamp(n) {
    return Math.min(max, Math.max(min, Math.round(n)))
  }

  function ratio() {
    if (max <= min) return 0
    return (level - min) / (max - min)
  }

  function render() {
    const pct = ratio() * 100
    fill.style.height = `${pct}%`
    knob.style.bottom = `${pct}%`
    knob.setAttribute('aria-valuemin', String(min))
    knob.setAttribute('aria-valuemax', String(max))
    knob.setAttribute('aria-valuenow', String(level))
    knob.setAttribute('aria-valuetext', `줌 레벨 ${level}`)
    if (lv) lv.textContent = `Lv.${level}`
    root.dataset.level = String(level)
    root.dataset.max = String(max)
  }

  function emit(prev, reason) {
    console.log(`[zoom] ${level} / ${max}`, { prev, reason })
    const live = document.getElementById('liveStatus')
    if (live && reason !== 'init') {
      live.textContent = `줌 레벨 ${level}`
    }
    listeners.forEach((fn) => {
      try {
        fn(level, prev, reason)
      } catch (err) {
        console.error('[zoom] onChange error', err)
      }
    })
  }

  function set(next, reason = 'set') {
    const prev = level
    level = clamp(next)
    render()
    if (level !== prev || reason === 'init') {
      emit(prev, reason)
    }
    return level
  }

  function step(delta, reason) {
    return set(level + delta, reason)
  }

  function levelFromClientY(clientY) {
    const rect = rail.getBoundingClientRect()
    if (rect.height <= 0) return level
    // 위(+max) → 아래(+min)
    const t = 1 - (clientY - rect.top) / rect.height
    return clamp(min + t * (max - min))
  }

  let dragging = false

  function onPointerDown(e) {
    e.preventDefault()
    dragging = true
    rail.setPointerCapture?.(e.pointerId)
    set(levelFromClientY(e.clientY), 'drag')
  }

  function onPointerMove(e) {
    if (!dragging) return
    set(levelFromClientY(e.clientY), 'drag')
  }

  function onPointerUp(e) {
    if (!dragging) return
    dragging = false
    if (rail.hasPointerCapture?.(e.pointerId)) {
      rail.releasePointerCapture(e.pointerId)
    }
  }

  btnIn?.addEventListener('click', () => step(1, 'in'))
  btnOut?.addEventListener('click', () => step(-1, 'out'))

  rail.addEventListener('pointerdown', onPointerDown)
  rail.addEventListener('pointermove', onPointerMove)
  rail.addEventListener('pointerup', onPointerUp)
  rail.addEventListener('pointercancel', onPointerUp)

  knob.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault()
      step(1, 'key')
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault()
      step(-1, 'key')
    } else if (e.key === 'Home') {
      e.preventDefault()
      set(max, 'key')
    } else if (e.key === 'End') {
      e.preventDefault()
      set(min, 'key')
    }
  })

  const api = {
    get: () => level,
    set: (n) => set(n, 'set'),
    setMax(nextMax) {
      max = Math.max(min, Number(nextMax) || max)
      level = clamp(level)
      render()
      return max
    },
    getMax: () => max,
    onChange(fn) {
      if (typeof fn === 'function') listeners.add(fn)
      return () => listeners.delete(fn)
    },
    destroy() {
      listeners.clear()
    },
  }

  set(level, 'init')
  return api
}
