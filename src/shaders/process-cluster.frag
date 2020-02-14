precision highp float;

void main() {
  vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;
  float d = 1.0 - length(uv);

  gl_FragColor = vec4(0.4, 0.8, 0.7333333333333333, d * 0.35);
}
