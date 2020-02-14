precision highp float;

uniform sampler2D uSampler;

varying vec2 v_colorCoord;

void main() {
  vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;
  float alpha = 0.95 - length(uv);

  vec3 color = texture2D(uSampler, v_colorCoord).rgb;

  gl_FragColor = vec4(color, alpha * 0.9);
}
