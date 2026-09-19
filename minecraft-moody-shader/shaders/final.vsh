#version 150

// Final vertex shader
// Fullscreen quad for tone mapping and color correction

in vec3 vaPosition;

out vec2 texCoord;

void main() {
    gl_Position = vec4(vaPosition, 1.0);
    texCoord = vaPosition.xy * 0.5 + 0.5;
}
