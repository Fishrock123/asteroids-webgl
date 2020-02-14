'use strict'
// I can't believe I have had to make this file. ~Jeremiah

const React = require('react')
const PropTypes = require('prop-types')
const styled = require('styled-components').default
const colors = require('./colors')

const Marker = styled.div`
  font-family: Source Sans Pro;
  font-size: 12px;
  color: ${colors.gray};
  pointer-events: none;
  position: absolute;
`

const AxisMarkers = props => {
  const tickCount = props.ticks.length - 1
  const markerWidth = props.width / tickCount
  const markerHeight = props.height / tickCount

  const offsetX = props.offsetX || 0
  const offsetY = props.offsetY || 0

  const offsets = props.ticks.slice(0, -1).map((tick, index) => {
    // map to inverted linear space from props.width->0
    let x = markerWidth * index
    let y = markerHeight * index

    return [
      offsetX + (props.constantX !== undefined ? props.constantX : x),
      offsetY + (props.constantY !== undefined ? props.constantY : y)
    ]
  })

  return props.ticks.slice(0, -1).map((tick, index) => (
    <Marker
      key={tick}
      style={{
        [props.xAlign]: offsets[index][0] + 'px',
        [props.yAlign]: offsets[index][1] + 'px'
      }} >
      { tick }
    </Marker>
  ))
}

AxisMarkers.propTypes = {
  ticks: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  xAlign: PropTypes.string.isRequired,
  yAlign: PropTypes.string.isRequired,
  offsetX: PropTypes.number,
  offsetY: PropTypes.number,
  constantX: PropTypes.number,
  constantY: PropTypes.number
}

module.exports = AxisMarkers
