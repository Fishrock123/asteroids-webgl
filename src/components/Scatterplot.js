'use strict'

const React = require('react')

const ScatterplotLib = require('../lib/scatterplot')
const { Asteroids } = require('./asteroids/AsteroidsComponent')
const AxisMarkers = require('./AxisMarkers')
const WebGLUnhappy = require('./WebGLUnhappy')

const d3 = require('d3')

const PropTypes = require('prop-types')
const styled = require('styled-components').default
const colors = require('./colors')

// General scatterplot constants.
const MARGIN = 30

const outerContainerStyle = {
  height: '100%',
  width: '100%', // Orginally only part of compoanent area.
  position: 'relative',
  display: 'inline-block'
}

const agentsContainerStyle = {
  margin: MARGIN + 'px',
  height: 'calc(100% - 60px)',
  width: 'calc(100% - 60px)',
  position: 'relative',
  userSelect: 'none',
  border: `.25px solid ${colors.charcoal}`
}

const SelectorContainer = styled.div`
  position: absolute;
  pointer-events: ${props => props.pointerEvents || 'auto'}
`

const Cluster = styled.div`
  background-color: ${colors.woodsmoke};
  height: 100%;
  position: relative;
`

const ScalingSpan = styled.div`
  display: inline-block;
  border-radius: 2px;
  border: 1px solid ${colors.gray};
  font-family: Source Sans Pro;
  font-size: 10px;
  color: ${colors.coolGrey};
  padding: 0 5px;
  margin-left: 5px;
  vertical-align: 1px;
`

const ZeroMarker = styled.div`
  font-family: Source Sans Pro;
  font-size: 12px;
  color: ${colors.coolGrey};
  pointer-events: none;
  position: absolute;
  left: 4px;
  bottom: 4px;
`

// Originally this was computed based on the data in the scatterplot
const AXIS_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].reverse()

class Scatterplot extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loaded: false, // Originally unnecessary
      webgl: true,
      width: 640,
      height: 480,
      easterEgg: true // Originally false
    }
    this.scatterplot = null
    this.selectOrigin = { x: 0, y: 0 }
    this.sizeCanvas = () => this.handleResize()

    const self = this
    Object.defineProperty(global, '_scatterplot', {
      get () { return self },
      configurable: true
    })
  }

  render () {
    const { props, state } = this // to ease transition to stateless function component
    const devicePixelRatio = window.devicePixelRatio || 1
    const {
      height,
      width
    } = this.state

    this.renderDrawing()

    return (
      <Cluster>
        <div
          ref='outer'
          style={outerContainerStyle} >
          <div
            ref='container'
            style={agentsContainerStyle} >
            <ZeroMarker textual={this.textualYAxis}>0</ZeroMarker>
            <AxisMarkers
              comment='X-Axis'
              xAlign='right'
              yAlign='bottom'
              constantY={4}
              offsetX={3}
              width={width}
              height={height}
              ticks={AXIS_TICKS}
              />
            <AxisMarkers
              comment='Y-Axis'
              xAlign='left'
              yAlign='top'
              constantX={4}
              offsetY={2}
              width={width}
              height={height}
              ticks={AXIS_TICKS}
              />
            <canvas
              width={width * devicePixelRatio}
              height={height * devicePixelRatio}
              ref='canvas'
              style={{ width, height }} />
          </div>
          {
            state.easterEgg && state.loaded
            ? <Asteroids
              onClose={() => {
                this.setState({ easterEgg: false })

                // Originally unnecessary. Cleanly reset.
                Promise.resolve().then(_ => {
                  this.setState({ easterEgg: true })
                })
              }}
              scatterplot={this.scatterplot}
              overrideHook={override => { this.scatterplot = override }} />
            : null
          }
        </div>
        {
          !this.state.webgl
          ? <WebGLUnhappy />
          : null
        }
      </Cluster>
    )
  }

  handleResize () {
    if (!this.refs) return
    const container = this.refs.container
    if (!container) return

    const { width, height } = container.getBoundingClientRect()

    // XXX(Fishrock123): this is a bottleneck, place into a subcomponent
    this.setState({width, height})
  }

  componentDidMount () {
    window.addEventListener('resize', this.sizeCanvas)

    const { container, outer, canvas } = this.refs
    const { width, height } = container.getBoundingClientRect()
    this.state.width = width
    this.state.height = height

    if (canvas) {
      canvas.addEventListener('webglcontextcreationerror', (e) => {
        console.error('Asteroids WebGL: context creation error:', e.statusMessage)
      })
      canvas.addEventListener('webglcontextrestored', (e) => {
        console.log('Asteroids WebGL: Context restored.', e.statusMessage)
        if (this.scatterplot) this.scatterplot.setupWebGL()
        this.setState({ webgl: true })
      })
      canvas.addEventListener('webglcontextlost', (e) => {
        console.warn('Asteroids WebGL: Context lost.', e.statusMessage)
        this.setState({ webgl: false })
      })

      const gl = (
        canvas.getContext('webgl') ||
        canvas.getContext('webgl-experimental') ||
        canvas.getContext('experimental-webgl')
      )
      if (gl) {
        this.scatterplot = new ScatterplotLib(gl)
        this.setState({ webgl: true, loaded: true })
      } else {
        console.error('Could not load scatterplot. WebGL unavailable.')
        this.setState({ webgl: false })
      }
    } else {
      console.warn('Could not get Scatterplot canvas element.')
      this.setState({ webgl: false })
    }
    this.handleResize()
  }

  renderDrawing () {
    const {
      width,
      height
    } = this.state

    // Originally, these were computed from soe data ranges
    const AxisX = { max: 100 }
    const AxisY = { max: 100 }

    if (this.scatterplot) {
      const xTicks = d3.scaleLinear().domain([0, AxisX.max]).ticks()
      const yTicks = d3.scaleLinear().domain([0, AxisY.max]).ticks()

      const hTicks = []
      const vTicks = []

      for (const tick of xTicks) {
        // Conversion to clip-space.
        vTicks.push((tick / AxisX.max) * 2 - 1)
      }
      for (const tick of yTicks) {
        // Conversion to clip-space.
        hTicks.push((tick / AxisY.max) * 2 - 1)
      }

      this.scatterplot.setGridLines(hTicks, vTicks)
    }
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.sizeCanvas)

    if (this.scatterplot) this.scatterplot.dispose()
  }
}

module.exports = Scatterplot
