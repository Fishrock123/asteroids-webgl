'use strict'

/*
 * WebGL Helpers
 */

module.exports = {
  compileShader,
  buildProgram
}

// Compile a webgl shader with error logging.
function compileShader (gl, type, src) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    let strType
    if (type === gl.FRAGMENT_SHADER) {
      strType = 'Fragment'
    } else if (type === gl.VERTEX_SHADER) {
      strType = 'Vertex'
    } else {
      strType = 'unknown'
    }
    console.error('Error compiling ' + strType + ' shader:', gl.getShaderInfoLog(shader))
  }
  return shader
}

// Build and link a webgl program with error logging & validation.
function buildProgram (gl, fragShader, vertShader) {
  const program = gl.createProgram()
  gl.attachShader(program, fragShader)
  gl.attachShader(program, vertShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Error linking webgl program:', gl.getProgramInfoLog(program))
  }
  gl.validateProgram(program)
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error('Error validating webgl program:', gl.getProgramInfoLog(program))
  }

  return program
}
