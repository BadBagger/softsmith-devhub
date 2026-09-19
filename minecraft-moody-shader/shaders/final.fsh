#version 150

// Final shader - tone mapping and final color correction
// Completes the spooky Moody aesthetic

in vec2 texCoord;

uniform sampler2D colortex0;
uniform float Time;

out vec4 FragColor;

#define SATURATION 0.75
#define CONTRAST 1.1
#define BRIGHTNESS 0.95

// Tone mapping (Reinhard)
vec3 toneMap(vec3 col) {
    col = col / (col + vec3(1.0));
    return col;
}

// Color grading for spooky feel
vec3 colorGrade(vec3 col) {
    // Desaturate slightly
    float gray = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(gray), 1.0 - SATURATION);

    // Boost contrast
    col = mix(vec3(0.5), col, CONTRAST);

    // Adjust brightness
    col *= BRIGHTNESS;

    // Add purple/orange spooky tint
    col.r *= 1.02;
    col.g *= 0.98;
    col.b *= 1.03;

    return col;
}

// Simple atmospheric effect
vec3 addAtmosphere(vec3 col, vec2 uv) {
    // Subtle radial gradient
    vec2 center = vec2(0.5);
    float dist = length(uv - center);
    float fog = 0.1 * (1.0 - exp(-dist * dist * 2.0));

    vec3 fogColor = vec3(0.2, 0.15, 0.3);
    col = mix(col, fogColor, fog * 0.15);

    return col;
}

void main() {
    vec3 color = texture(colortex0, texCoord).rgb;

    // Apply tone mapping
    color = toneMap(color);

    // Apply color grading
    color = colorGrade(color);

    // Add atmospheric effects
    color = addAtmosphere(color, texCoord);

    // Slight noise for added spookiness (optional, can be disabled)
    float noise = fract(sin(dot(texCoord, vec2(12.9898, 78.233)) + Time) * 43758.5453);
    color += noise * 0.02;

    // Ensure color stays in valid range
    color = clamp(color, vec3(0.0), vec3(1.0));

    FragColor = vec4(color, 1.0);
}
