#version 150

// Shadow vertex shader
// Efficient shadow mapping for 2070 Super

in vec3 vaPosition;
in vec2 vaUV0;

uniform mat4 ModelViewMat;
uniform mat4 ProjMat;

out vec2 texCoord;

void main() {
    gl_Position = ProjMat * (ModelViewMat * vec4(vaPosition, 1.0));
    texCoord = vaUV0;
}
