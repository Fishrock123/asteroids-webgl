'use strict'

const React = require('react')
const ReactDOM = require('react-dom')
const styled = require('styled-components').default

const Scatterplot = require('./components/Scatterplot')

const Background = styled.div`
  height: 100%;
`

const Wrapper = styled.span`
  flex: 1;
  overflow-y: hidden;
`

function onLoad () {
  // As per the original, done as an inline style because unrelated *reasons*.
  const mainWrapper = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  }

  // Originally loaded the entire web app rather than just the Scatterplot.
  ReactDOM.render(
    <div style={mainWrapper}>
      <Wrapper>
        <Background>
          <Scatterplot />
        </Background>
      </Wrapper>
    </div>,
    document.getElementById('app')
  )
}

window.onload = onLoad
