precision highp float;

attribute vec2 position;
attribute float size;

uniform float delta;
uniform float fadeDirection;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);

  float fadedSize = mix(mix(size, 0.0, delta), mix(0.0, size, delta), fadeDirection);
  gl_PointSize = fadedSize;
}
