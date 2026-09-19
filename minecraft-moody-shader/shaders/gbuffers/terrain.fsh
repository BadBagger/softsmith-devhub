#version 150

// Terrain fragment shader for Moody
// Spooky elementary aesthetic with efficient lighting

#moj_import <fog>

in float vertexDistance;
in vec4 vertexColor;
in vec4 lightMapColor;
in vec4 texCoord0;
in vec4 normal;
in vec3 worldPos;

uniform sampler2D Sampler0;
uniform sampler2D Sampler1;
uniform sampler2D Sampler2;

uniform vec4 ColorModulator;
uniform float Fog;
uniform float FogStart;
uniform float FogEnd;
uniform vec4 FogColor;

out vec4 FragColor;

#define CONTRAST 1.1
#define SATURATION 0.75
#define SPOOKY_TINT 1.5

// Spooky color grading
vec3 applySpookyGrading(vec3 col) {
    // Desaturate slightly
    float gray = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(gray), 1.0 - SATURATION);

    // Reduce green channel slightly for eerie feel
    col.g *= 0.85;
    col.b *= 0.95;
    col.r *= 1.05;

    // Apply spooky tint
    col.rg += vec3(0.1, 0.05) * SPOOKY_TINT * 0.1;

    // Contrast
    col = mix(vec3(0.5), col, CONTRAST);

    return col;
}

// Improved lighting calculation
vec3 calculateLighting(vec3 texCol, vec4 lightMap) {
    // Block light (warm, orange-ish)
    vec3 blockLight = texCol * lightMap.r * vec3(1.2, 0.8, 0.4);

    // Sky light (cool, blue-ish)
    vec3 skyLight = texCol * lightMap.g * vec3(0.5, 0.7, 1.0);

    // Combine with gentle falloff
    vec3 combined = blockLight + skyLight * 0.7;

    return combined;
}

void main() {
    // Sample texture
    vec4 texColor = texture(Sampler0, texCoord0.xy);

    // Discard transparent pixels
    if (texColor.a < 0.1) discard;

    // Apply vertex color and color modulation
    texColor *= vertexColor * ColorModulator;

    // Apply lighting
    vec3 lit = calculateLighting(texColor.rgb, lightMapColor);

    // Apply spooky color grading
    vec3 graded = applySpookyGrading(lit);

    // Fog calculation
    float fogDist = vertexDistance / Fog;
    fogDist = clamp(fogDist, 0.0, 1.0);

    // Mix with fog color
    vec3 foggedColor = mix(graded, FogColor.rgb, fogDist * 0.5);

    // Final output
    FragColor = vec4(foggedColor, texColor.a);
}
