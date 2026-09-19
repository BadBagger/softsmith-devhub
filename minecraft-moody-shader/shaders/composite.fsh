#version 150

// Composite shader for post-processing
// Bloom, vignette, and spooky effects

in vec2 texCoord;

uniform sampler2D colortex0;
uniform sampler2D colortex1;

uniform float viewWidth;
uniform float viewHeight;
uniform float Bloom;
uniform float Vignette;

out vec4 FragColor;

#define BLOOM_INTENSITY 0.5
#define BLOOM_THRESHOLD 0.6
#define VIGNETTE_STRENGTH 0.4
#define VIGNETTE_SMOOTHNESS 0.7

// Gaussian blur for bloom
vec3 blur(sampler2D tex, vec2 uv, float radius) {
    vec3 result = vec3(0.0);
    float total = 0.0;

    for (float x = -2.0; x <= 2.0; x += 1.0) {
        for (float y = -2.0; y <= 2.0; y += 1.0) {
            float dist = sqrt(x*x + y*y);
            float weight = exp(-dist*dist / (2.0 * radius * radius));

            vec2 offset = vec2(x, y) * (1.0 / vec2(viewWidth, viewHeight)) * radius;
            result += texture(tex, uv + offset).rgb * weight;
            total += weight;
        }
    }

    return result / total;
}

// Extract bright areas for bloom
vec3 bloomExtract(vec3 col) {
    float brightness = dot(col, vec3(0.299, 0.587, 0.114));
    if (brightness > BLOOM_THRESHOLD) {
        return col * (brightness - BLOOM_THRESHOLD);
    }
    return vec3(0.0);
}

// Vignette effect
float vignette(vec2 uv) {
    uv = uv * 2.0 - 1.0;
    float dist = length(uv);
    float v = 1.0 - smoothstep(0.0, VIGNETTE_SMOOTHNESS, dist - 1.0);
    return mix(1.0, v, VIGNETTE_STRENGTH);
}

void main() {
    vec2 uv = texCoord;

    // Sample main color
    vec3 color = texture(colortex0, uv).rgb;

    // Apply bloom
    vec3 bright = bloomExtract(color);
    vec3 bloomed = blur(colortex0, uv, 4.0) * BLOOM_INTENSITY;
    color += bloomed * (Bloom * 0.5 + 0.25);

    // Clamp to prevent overexposure
    color = min(color, vec3(2.0));

    // Apply vignette
    float vig = vignette(uv);
    color *= vig;

    // Spooky atmospheric haze
    float haze = 0.08 * sin(uv.x * 10.0 + uv.y * 10.0) * 0.1;
    color += vec3(haze * 0.05);

    // Slight purple/blue tint for spooky effect
    color.b *= 1.05;
    color.r *= 0.98;

    FragColor = vec4(color, 1.0);
}
