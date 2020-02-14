#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

precision highp float;

uniform sampler2D uSampler;

varying vec2 v_colorCoord;

const vec3 black = vec3(0, 0, 0);

#ifdef GL_OES_standard_derivatives
#define INV_SQRT_2 0.70710678118654757 // 1 / sqrt(2)
float aastep(float threshold, float value) {
  float afwidth = INV_SQRT_2 * length(vec2(dFdx(value), dFdy(value)));
  return smoothstep(threshold - afwidth, threshold + afwidth, value);
}
#endif

void main() {
#ifdef GL_OES_standard_derivatives
  // Compute circle edges by using extension AA dFd{xy} functions.
  const float bandOuter = 0.8;
  const float bandInner = 0.4;

  vec2 uv = gl_PointCoord.xy * 2.2 - 1.1;
  float uvLength = length(uv);
  float alpha = 1.0 - aastep(1.0, uvLength);

  float d1 = bandOuter - aastep(bandOuter, uvLength);
  float d2 = aastep(bandInner, uvLength) - bandInner;

  // Conditional assignments have almost zero cost
  // http://www.humus.name/Articles/Persson_LowLevelThinking.pdf
  float color_mix = d1 < d2 ? d1 : d2;
#else
  // Rough blended approximation.
  float bandOuter = 0.8 * 4.0;
  float bandInner = 0.325 * 4.0;

  vec2 uv = gl_PointCoord.xy * 8.0 - 4.0;
  float uvLength = length(uv);
  float alpha = 4.0 - uvLength;

  float d1 = bandOuter - uvLength;
  float d2 = uvLength - bandInner;

  // Conditional assignments have almost zero cost
  // http://www.humus.name/Articles/Persson_LowLevelThinking.pdf
  float color_mix = d1 < d2 ? d1 : d2;
#endif

  vec3 color = texture2D(uSampler, v_colorCoord).rgb;

  gl_FragColor = vec4(mix(color, black, color_mix), alpha);
}
