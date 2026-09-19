#version 150

// Composite vertex shader
// Simple fullscreen quad rendering

in vec3 vaPosition;

out vec2 texCoord;

void main() {
    gl_Position = vec4(vaPosition, 1.0);
    texCoord = vaPosition.xy * 0.5 + 0.5;
}
