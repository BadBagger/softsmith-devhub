#version 150

// Entity fragment shader
// Enhanced rendering for mobs and players

#moj_import <fog>

in float vertexDistance;
in vec4 vertexColor;
in vec4 lightMapColor;
in vec4 texCoord0;

uniform sampler2D Sampler0;
uniform vec4 ColorModulator;
uniform float Fog;
uniform vec4 FogColor;

out vec4 FragColor;

#define ENTITY_BRIGHTNESS 1.2
#define ENTITY_GLOW 0.15

vec3 enhanceEntityColors(vec3 col) {
    // Boost colors for entities to make them stand out
    col *= ENTITY_BRIGHTNESS;

    // Add slight glow effect
    float brightness = dot(col, vec3(0.299, 0.587, 0.114));
    col += vec3(brightness * ENTITY_GLOW);

    return col;
}

void main() {
    vec4 texColor = texture(Sampler0, texCoord0.xy);

    if (texColor.a < 0.1) discard;

    texColor *= vertexColor * ColorModulator;

    // Apply entity lighting
    vec3 blockLight = texColor.rgb * lightMapColor.r * 1.4;
    vec3 skyLight = texColor.rgb * lightMapColor.g * 0.9;

    vec3 lit = blockLight + skyLight;
    lit = enhanceEntityColors(lit);

    // Fog effect
    float fogDist = vertexDistance / Fog;
    fogDist = clamp(fogDist, 0.0, 1.0);

    vec3 foggedColor = mix(lit, FogColor.rgb, fogDist * 0.3);

    FragColor = vec4(foggedColor, texColor.a);
}
