#version 150

// Block fragment shader
// Enhanced lighting for blocks

#moj_import <fog>

in float vertexDistance;
in vec4 vertexColor;
in vec4 lightMapColor;
in vec4 texCoord0;
in vec3 normal;

uniform sampler2D Sampler0;
uniform vec4 ColorModulator;
uniform float Fog;
uniform vec4 FogColor;

out vec4 FragColor;

#define BLOCK_BRIGHTNESS_BOOST 1.15
#define SHADOW_DARKNESS 0.5

vec3 applyShadowLighting(vec3 col, vec3 norm) {
    // Simple directional light (roughly sun direction)
    vec3 lightDir = normalize(vec3(0.3, 1.0, 0.2));
    float diffuse = max(dot(norm, lightDir), 0.0);

    // Mix between lit and shadow
    float shadow = mix(SHADOW_DARKNESS, 1.0, diffuse);
    return col * shadow;
}

void main() {
    vec4 texColor = texture(Sampler0, texCoord0.xy);

    if (texColor.a < 0.1) discard;

    texColor *= vertexColor * ColorModulator;

    // Enhanced block lighting
    vec3 blockLight = texColor.rgb * lightMapColor.r * 1.3;
    vec3 skyLight = texColor.rgb * lightMapColor.g * 0.8;

    vec3 lit = (blockLight + skyLight) * BLOCK_BRIGHTNESS_BOOST;

    // Apply shadow-like effect based on normal
    lit = applyShadowLighting(lit, normal);

    // Fog
    float fogDist = vertexDistance / Fog;
    fogDist = clamp(fogDist, 0.0, 1.0);

    vec3 foggedColor = mix(lit, FogColor.rgb, fogDist * 0.4);

    FragColor = vec4(foggedColor, texColor.a);
}
