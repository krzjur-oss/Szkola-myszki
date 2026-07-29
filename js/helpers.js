// =========================================================
// HELPERS & TOUCH UTILITIES
// =========================================================

/**
 * Returns {x, y, cx, cy} in element-local and client coordinates
 */
export function eventPos(e, container) {
  const rect = container.getBoundingClientRect();
  const src = (e.changedTouches && e.changedTouches.length > 0)
    ? e.changedTouches[0]
    : (e.touches && e.touches.length > 0)
      ? e.touches[0]
      : e;
  if (!src || src.clientX === undefined) return { x: 0, y: 0, cx: 0, cy: 0 };
  return {
    x: src.clientX - rect.left,
    y: src.clientY - rect.top,
    cx: src.clientX,
    cy: src.clientY
  };
}

/**
 * Adds click and touchend listeners to an element without duplicate firing
 */
export function onActivate(el, handler) {
  let touchFired = false;
  el.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchFired = true;
    handler(e);
    setTimeout(() => { touchFired = false; }, 400);
  }, { passive: false });
  el.addEventListener('click', (e) => {
    if (touchFired) return;
    handler(e);
  });
}
