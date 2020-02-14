
/**
 * Two-mode rounding, depending on scale of input:
 * Rounding to two decimal places for numbers between 0 and 1.
 * Normal integer rounding for numbers with absolute value >= 1.
 *
 * e.g.
 * round(0.0123) => 0.01
 * round(123.0123) => 123
 */

function round (num) {
  if (Math.abs(num) >= 1) return Math.round(num)
  else return Math.round(num * 100) / 100
}

function timerElapsed (start, delay) {
  if (typeof start === 'undefined' || typeof delay === 'undefined') {
    return false
  }

  return start + delay < Date.now()
}

function btoa (string) {
  return Buffer.from(string.toString(), 'binary').toString('base64')
}

function revokeableListener (emitter, event, cb) {
  if (typeof emitter.on === 'function') {
    emitter.on(event, cb)
  } else if (typeof emitter.addListener === 'function') {
    emitter.addListener(event, cb)
  } else if (typeof emitter.addEventListener === 'function') {
    emitter.addEventListener(event, cb)
  }

  return function revoke () {
    if (typeof emitter.removeListener === 'function') {
      emitter.removeListener(event, cb)
    } else if (typeof emitter.removeEventListener === 'function') {
      emitter.removeEventListener(event, cb)
    }
  }
}

function lerp (v0, v1, t) {
  return v0 * (1 - t) + v1 * t
}

function easeInSinusoidal (delta) {
  // decimal delta
  return -1 * Math.cos(delta * (Math.PI / 2)) + 1
}

module.exports = {
  round,
  timerElapsed,
  btoa,
  revokeableListener,
  lerp,
  easeInSinusoidal
}
