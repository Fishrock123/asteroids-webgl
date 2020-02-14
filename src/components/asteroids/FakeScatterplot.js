'use strict'

// const DOT_SIZE = 2

class FakeScatterplot {
  constructor (scatterplot) {
    this.state = {
      width: 0,
      height: 0
    }

    this.axisX = 'fakeMetric'
    this.axisY = 'fakeMetric'

    // const self = this
    // Object.defineProperty(global, '_scatterplot', {
    //   get () { return self },
    //   configurable: true
    // })

    // Reduce some hidden class changes I guess
    // this.gl = gl
    this.glBuffer = null
    this.shaders = null
    this.programs = null
    this.vertexArrays = scatterplot.vertexArrays
    this.lastUpdateTime = 0
    this.radius = 0
  }

  setupWebGL () {
  }

  dispose () {
  }

  setKeyHovered () {
  }

  setProcessHovered () {
  }

  animationUpdate () {
  }

  changeAxies (axisX, axisY) {
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

  setTrailData (data) {
  }

  onSelectionBoxUpdate (aabb) {
  }

  onUpdate (symbols, selectedProcesses) {
  }

  animatedPaint (multiFrame) {
  }

  paint (delta) {
  }

  positionHistoricData (data) {
  }
}

module.exports = FakeScatterplot
