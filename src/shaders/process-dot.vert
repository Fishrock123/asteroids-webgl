precision highp float;

attribute vec2 position;
attribute vec2 target;
attribute vec2 color;

uniform float delta;
uniform float size;

varying vec2 v_colorCoord;

void main() {
  vec2 pos = mix(position, target, delta);

  v_colorCoord = vec2(color[0], 0.0);

  gl_Position = vec4(pos, 0.0, 1.0);
  gl_PointSize = size;
}
