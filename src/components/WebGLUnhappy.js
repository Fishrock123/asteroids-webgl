'use strict'

const React = require('react')

const styled = require('styled-components').default
const colors = require('./colors')
const Icons = require('./Icons')

const WebGLUnhappyContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - 330px);
  height: 100%;
  background-color: ${colors.woodsmoke};

  display: flex;
  align-items: center;
  justify-content: center;
`

const WebGLUnhappyBody = styled.div`
  text-align: center;
  font-family: Source Sans Pro;
  font-size: 12px;
  line-height: 1.33;
  color: ${colors.coolGrey};
`

const WebGLUnhappyIcon = styled.div`
  display: inline-block;
  margin-bottom: 10px;

  path {
    fill: ${colors.coolGrey} !important;
  }

  > svg {
    width: 48px;
    height: 48px;
  }
`

const WebGLUnhappyBig = styled.div`
  font-size: 16px;
`

module.exports = function WebGLUnhappy () {
  return (
    <WebGLUnhappyContainer>
      <WebGLUnhappyBody>
        <WebGLUnhappyIcon>
          <Icons.alert />
        </WebGLUnhappyIcon>
        <WebGLUnhappyBig>
          WebGL is unhappy.
        </WebGLUnhappyBig>
        <div>
          Please try using a different web browser.
        </div>
      </WebGLUnhappyBody>
    </WebGLUnhappyContainer>
  )
}
