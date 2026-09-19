#version 150

// Block vertex shader
// Handles solid blocks with enhanced lighting

#moj_import <fog>

in vec3 Position;
in vec4 Color;
in vec2 UV0;
in ivec2 UV2;
in vec3 Normal;

uniform mat4 ModelViewMat;
uniform mat4 ProjMat;
uniform mat4 IViewRotMat;

uniform vec4 ColorModulator;
uniform float Fog;

out float vertexDistance;
out vec4 vertexColor;
out vec4 lightMapColor;
out vec4 texCoord0;
out vec3 normal;

void main() {
    gl_Position = ProjMat * (ModelViewMat * vec4(Position, 1.0));

    vertexDistance = fog_distance(ModelViewMat, Position, Fog);
    vertexColor = vec4(Color.rgb, 1.0) * ColorModulator;

    lightMapColor = vec4(vec2(UV2) * (1.0 / 16.0), 0.0, 1.0);
    texCoord0 = vec4(UV0, 0.0, 1.0);

    // Normal mapping
    normal = normalize(Normal);
}
