#version 150

// Shadow fragment shader
// Depth rendering for shadow mapping

in vec2 texCoord;

uniform sampler2D Sampler0;

void main() {
    vec4 texColor = texture(Sampler0, texCoord);

    // Discard transparent pixels
    if (texColor.a < 0.5) discard;

    // Just output depth (implicit in gl_FragDepth)
    // This depth is automatically written to the shadow map
}
