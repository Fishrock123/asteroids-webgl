/**
 * Animated 2D Plot of an Application's Processes
 */
'use strict'

const d3 = require('d3')
const { lerp, easeInSinusoidal } = require('./utils')
const parseColor = require('parse-color')
const shadersSrc = require('./shader-sources')
const initRegl = require('regl')
const colors = require('../components/colors')

const DOT_SIZE = 2

const [ _colors, COLORS ] = buildColorTextureMap(colors)
const COLOR_ARRAY = new Uint8Array(_colors)

function buildColorTextureMap (colors) {
  const texture = []
  const map = {}

  const keys = Object.keys(colors)
  const length = keys.length
  for (let i = 0; i < length; i++) {
    const key = keys[i]
    // The pixels are mapped to the middle of texture indicies,
    //  and not the indicies themselves.
    // Essentially a simpler ((i / length) + ((i + 1) / length)) / 2
    map[key] = (i + 0.5) / length
    texture.push(...(parseColor(colors[key]).rgb))
  }

  return [texture, map]
}

class ScatterPlot {
  constructor (gl) {
    // this.hoveredKey = null
    // this.hoveredProcess = null

    // Reduce some hidden class changes I guess
    this.gl = gl
    this.regl = null
    this.reglFns = null
    this.buffer = null
    this.texture = null
    this.vertexArrays = {
      gridLines: new Float32Array(0)
    }
    this.lastUpdateTime = 0
    this.radius = 0

    this.setupWebGL()
  }

  setupWebGL () {
    const gl = this.gl

    if (gl.getSupportedExtensions().indexOf('OES_standard_derivatives') === -1) {
      console.warn('\'OES_standard_derivatives\' not supported.')
    } else {
      gl.getExtension('OES_standard_derivatives')
    }

    const src = shadersSrc

    const regl = this.regl = initRegl(gl)

    // Set up regl resources
    this.buffer = regl.buffer({
      length: 0,
      usage: 'dynamic'
    })
    this.texture = regl.texture({
      data: COLOR_ARRAY,
      width: COLOR_ARRAY.length / 3,
      height: 1,
      format: 'rgb'
    })
    const uSampler = this.texture

    // Defaults
    const blend = {
      enable: true,
      func: {
        srcRGB: 'src alpha',
        dstRGB: 'one minus src alpha',
        srcAlpha: 'one',
        dstAlpha: 'one minus src alpha'
      }
    }
    const depth = {
      enable: false
    }

    // De-duplicate process settings
    const processAttributes = {
      position: {
        buffer: regl.prop('data'),
        offset: 0,
        stride: 24
      },
      target: {
        buffer: regl.prop('data'),
        offset: 8,
        stride: 24
      },
      color: {
        buffer: regl.prop('data'),
        offset: 16,
        stride: 24
      }
    }
    const processUniforms = {
      delta: regl.prop('delta'),
      size: regl.prop('size'),
      uSampler
    }

    // Create regl render functions
    const gridLines = regl({
      frag: src.frag.charcoal,
      vert: src.vert.position2d,
      primitive: 'lines',
      attributes: {
        position: {
          buffer: regl.prop('data')
        }
      },
      count: regl.prop('count'),
      blend,
      depth
    })

    const processes = regl({
      frag: src.frag.process,
      vert: src.vert.process,
      primitive: 'points',
      attributes: processAttributes,
      uniforms: processUniforms,
      count: regl.prop('count'),
      blend,
      depth
    })

    const selectedProcs = regl({
      frag: src.frag.processSelected,
      vert: src.vert.process,
      primitive: 'points',
      attributes: processAttributes,
      uniforms: processUniforms,
      count: regl.prop('count'),
      blend,
      depth
    })

    const highlight = regl({
      frag: src.frag.highlight,
      vert: src.vert.process,
      primitive: 'points',
      attributes: processAttributes,
      uniforms: processUniforms,
      count: regl.prop('count'),
      blend,
      depth
    })

    const clusters = regl({
      frag: src.frag.cluster,
      vert: src.vert.cluster,
      primitive: 'points',
      attributes: {
        position: {
          buffer: regl.prop('data'),
          offset: 0,
          stride: 12
        },
        size: {
          buffer: regl.prop('data'),
          offset: 8,
          stride: 12
        }
      },
      uniforms: {
        delta: regl.prop('delta'),
        fadeDirection: regl.prop('fadeDir')
      },
      count: regl.prop('count'),
      blend,
      depth
    })

    this.reglFns = {
      gridLines,
      processes,
      selectedProcs,
      highlight,
      clusters
    }
  }

  dispose () {
    const gl = this.gl
    if (!gl) {
      // I don't think this should happen? - Jeremiah
      console.warn('ScatterPlot unmounted without having a gl instance.')
      return
    }

    if (this.regl) this.regl.destroy()

    this.gl = null
    this.regl = null
    this.buffer = null
    this.texture = null
  }

  setGridLines (hTicks, vTicks) {
    const length = (hTicks.length + vTicks.length) * 4
    if (length !== this.vertexArrays.gridLines.length) {
      this.vertexArrays.gridLines = new Float32Array(length)
    }
    const verts = this.vertexArrays.gridLines

    for (let i = 0; i < hTicks.length; i++) {
      const offset = i * 4
      verts[offset] = 1
      verts[offset + 1] = hTicks[i]
      verts[offset + 2] = -1
      verts[offset + 3] = hTicks[i]
    }
    for (let i = 0; i < vTicks.length; i++) {
      const offset = (hTicks.length * 4) + (i * 4)
      verts[offset] = vTicks[i]
      verts[offset + 1] = 1
      verts[offset + 2] = vTicks[i]
      verts[offset + 3] = -1
    }
  }

  onUpdate (symbols, selectedProcesses) {
    const vertexArrays = this.vertexArrays

    this.radius = DOT_SIZE

    window.requestAnimationFrame(() => this.animatedPaint(true))
  }

  animatedPaint (multiFrame) {
    // Don't bother scheduling paints if the gl instance isn't here.
    if (!this.gl) return

    // Calculate delta time.
    let timeDiff = (Date.now() - this.lastUpdateTime) / 500
    if (timeDiff > 1) timeDiff = 1
    // Don't bother requesting another paint if our animations are complete.
    if (multiFrame && timeDiff < 1) {
      window.requestAnimationFrame(() => this.animatedPaint(true))
    }
    const delta = easeInSinusoidal(timeDiff)

    this.paint(delta)
  }

  animationUpdate () {
    this.lastUpdateTime = Date.now()
  }

  paint (delta) {
    // Disposed.
    if (!this.gl || this.gl.isContextLost()) return

    const devicePixelRatio = window.devicePixelRatio || 1
    const radius = (this.radius <= 0 ? 1 : this.radius) * devicePixelRatio
    const diameter = radius * 2

    const vertexArrays = this.vertexArrays

    this.regl.poll()
    this.regl.clear({
      color: [0, 0, 0, 0]
    })

    if (vertexArrays.gridLines.length > 0) {
      this.reglFns.gridLines({
        data: this.buffer(vertexArrays.gridLines),
        count: vertexArrays.gridLines.length / 2
      })
    }
  }
}

module.exports = ScatterPlot
