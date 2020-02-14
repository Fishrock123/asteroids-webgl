'use strict'

const React = require('react')
const PropTypes = require('prop-types')
const styled = require('styled-components').default
const colors = require('../colors')
const { revokeableListener } = require('../../lib/utils')
const Game = require('./Game')
const FakeScatterplot = require('./FakeScatterplot')

const AsteroidsContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;

  > * {
    position: absolute;
  }

  > *,
  > * > * {
    font-size: 14px;
    font-family: Source Sans Pro;
    color: ${colors.white};
    border-radius: 2px;
    border: 0;
  }
`

const AsteroidsScore = styled.div`
  top: 2px;
  left: 50%;
  transform: translate(-50%, 0);
  cursor: default;
  font-family: Source Code Pro;
  font-size: 20px;
`

const CloseButton = styled.button`
  top: 4px;
  right: 30px;
  padding: 4px 12px;
  background: ${colors.gray};
  cursor: pointer;
  letter-spacing: 1.8px;
  font-size: 12px;

  &:hover {
    text-decoration: underline;
  }
`

const StartButton = styled.button`
  padding: 12px;
  background: ${colors.darkMint};
  cursor: pointer;
  letter-spacing: 1.8px;

  &:hover {
    text-decoration: underline;
  }
`

const Centered = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

const GameOver = styled.div`
  margin: 8px;
  font-family: Source Code Pro;
  font-size: 20px;
`

const ScoreSup = styled.div`
  margin: 8px;
  color: ${colors.coolGrey};
  font-family: Source Code Pro;
  font-size: 20px;
`

const ScoreFinal = styled.div`
  margin-bottom: 22px;
  font-family: Source Code Pro;
  font-size: 36px;
`

const SCALE = 1000

class Asteroids extends React.Component {
  constructor (props) {
    super(props)

    this.gl = props.scatterplot.gl
    this.scatterplot = props.scatterplot
    this.interceptor = new FakeScatterplot(props.scatterplot)

    this.revokeListeners = null
    this.containerRef = React.createRef();

    this.state = {
      score: 0,
      gamestate: 'ready'
    }

    const regl = props.scatterplot.regl
    const reglFns = props.scatterplot.reglFns
    const buffer = props.scatterplot.buffer
    const vertexArrays = this.interceptor.vertexArrays

    this.game = new Game(this.gl, SCALE, regl, reglFns, buffer, vertexArrays, {
      score: score => this.setState({ score }),
      gameover: _ => this.setState({ gamestate: 'gameover' })
    })
  }

  componentDidMount () {
  }

  componentWillUnmount () {
    this.props.overrideHook(this.scatterplot)

    if (typeof this.revokeListeners === 'function') this.revokeListeners()
    this.game.stop()
  }

  start () {
    if (typeof this.revokeListeners === 'function') this.revokeListeners()

    this.props.overrideHook(this.interceptor)

    const rKeyUp = revokeableListener(document, 'keyup', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        this.props.onClose()
      } else if (e.key === 'w' || e.key === 'ArrowUp') {
        e.preventDefault()
        e.stopPropagation()
        this.game.input('up', false)
      } else if (e.key === 'a' || e.key === 'ArrowLeft') {
        e.preventDefault()
        e.stopPropagation()
        this.game.input('left', false)
      } else if (e.key === 's' || e.key === 'ArrowDown') {
        e.preventDefault()
        e.stopPropagation()
        this.game.input('down', false)
      } else if (e.key === 'd' || e.key === 'ArrowRight') {
        e.preventDefault()
        e.stopPropagation()
        this.game.input('right', false)
      } else if (e.key === ' ') {
        e.preventDefault()
        e.stopPropagation()
        this.game.input('fire', false)
      }
    })

    const rKeyDown = revokeableListener(document, 'keydown', (e) => {
      if (e.key === 'w' || e.key === 'ArrowUp') {
        e.preventDefault()
        e.stopPropagation()
        this.game.input('up', true)
      } else if (e.key === 'a' || e.key === 'ArrowLeft') {
        e.preventDefault()
        e.stopPropagation()
        this.game.input('left', true)
      } else if (e.key === 's' || e.key === 'ArrowDown') {
        e.preventDefault()
        e.stopPropagation()
        this.game.input('down', true)
      } else if (e.key === 'd' || e.key === 'ArrowRight') {
        e.preventDefault()
        e.stopPropagation()
        this.game.input('right', true)
      } else if (e.key === ' ') {
        e.preventDefault()
        e.stopPropagation()
        this.game.input('fire', true)
      }
    })

    const rMouseDown = revokeableListener(this.containerRef.current, 'mousedown', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.game.input('fire', true)
    })

    const rMouseUp = revokeableListener(this.containerRef.current, 'mouseup', (e) => {
      this.game.input('fire', false)
    })

    const rMouseMove = revokeableListener(this.containerRef.current, 'mousemove', (e) => {
      const devicePixelRatio = window.devicePixelRatio || 1
      const width = this.gl.drawingBufferWidth / devicePixelRatio
      const height = this.gl.drawingBufferHeight / devicePixelRatio

      this.game.input('mouseX', ((e.offsetX / width) * SCALE * 2) - SCALE)
      this.game.input('mouseY', (((height - e.offsetY) / height) * SCALE * 2) - SCALE)
    })

    this.revokeListeners = () => {
      rKeyUp()
      rKeyDown()
      rMouseDown()
      rMouseUp()
      rMouseMove()
    }

    this.setState({ gamestate: 'active' })
    this.game.start()
  }

  render () {
    const { props, state } = this
    return (
      <AsteroidsContainer ref={this.containerRef}>
        <AsteroidsScore>
          { `SCORE: ${state.score}` }
        </AsteroidsScore>
        <CloseButton onClick={e => {
          this.props.overrideHook(this.scatterplot)
          props.onClose(e)
        }} >
          ESC
        </CloseButton>
        {
          state.gamestate === 'ready'
          ? (
            <Centered>
              <StartButton onClick={_ => this.start()}>PLAY ASTEROIDS!</StartButton>
            </Centered>
            )
          : null
        }
        {
          state.gamestate === 'gameover'
          ? (
            <Centered>
              <GameOver>You crashed!</GameOver>
              <ScoreSup>SCORE</ScoreSup>
              <ScoreFinal>{ state.score }</ScoreFinal>
              <StartButton onClick={_ => this.start()}>PLAY AGAIN!</StartButton>
            </Centered>
            )
          : null
        }
      </AsteroidsContainer>
    )
  }
}

Asteroids.propTypes = {
  scatterplot: PropTypes.object.isRequired,
  overrideHook: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

module.exports = {
  Asteroids
}
