#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

precision highp float;

uniform sampler2D uSampler;

varying vec2 v_colorCoord;

#ifdef GL_OES_standard_derivatives
#define INV_SQRT_2 0.70710678118654757 // 1 / sqrt(2)
float aastep(float threshold, float value) {
  float afwidth = INV_SQRT_2 * length(vec2(dFdx(value), dFdy(value)));
  return smoothstep(threshold - afwidth, threshold + afwidth, value);

  // Other potential approaches:

  // float afwidth = fwidth(value) * 0.5;
  // return smoothstep(threshold - afwidth, threshold + afwidth, value);

  // #define AA_STRENGTH 3.0
  // float blend_range = AA_STRENGTH * size * length(vec2(dFdx(value), dFdy(value)));
  // float blend_halfrng = 0.5 * blend_range;
  // float blend_dist = clamp(((threshold - blend_halfrng) / blend_range) + 0.5, 0.0, 1.0);
  // return smoothstep(threshold - blend_dist, threshold + blend_dist, value);
}
#endif

void main() {
#ifdef GL_OES_standard_derivatives
  // Compute circle edges by using extension AA dFd{xy} functions.
  vec2 uv = gl_PointCoord.xy * 2.2 - 1.1;
  float alpha = 1.0 - aastep(1.0, length(uv));
#else
  // // Rough blended approximation.
  vec2 uv = gl_PointCoord.xy * 8.0 - 4.0;
  float alpha = 4.0 - length(uv);
#endif

  vec3 color = texture2D(uSampler, v_colorCoord).rgb;
  gl_FragColor = vec4(color, alpha);
}
