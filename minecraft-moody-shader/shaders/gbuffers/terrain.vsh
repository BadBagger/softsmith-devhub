#version 150

// Terrain vertex shader for Moody
// Handles world geometry with spooky aesthetic

#moj_import <fog>

in vec3 Position;
in vec4 Color;
in vec2 UV0;
in ivec2 UV2;
in vec3 Normal;

uniform sampler2D Sampler0;
uniform sampler2D Sampler1;
uniform sampler2D Sampler2;

uniform mat4 ModelViewMat;
uniform mat4 ProjMat;
uniform mat4 IViewRotMat;

uniform float GameTime;
uniform vec4 ColorModulator;
uniform float Fog;

out float vertexDistance;
out vec4 vertexColor;
out vec4 lightMapColor;
out vec4 texCoord0;
out vec4 normal;
out vec3 worldPos;

#define WIND_STRENGTH 0.15
#define WAVE_FREQUENCY 2.5
#define WAVE_AMPLITUDE 0.08

void main() {
    gl_Position = ProjMat * (ModelViewMat * vec4(Position, 1.0));

    vertexDistance = fog_distance(ModelViewMat, Position, Fog);
    vertexColor = vec4(Color.rgb, 1.0) * ColorModulator;

    // Extract lightmap coordinates (block light, sky light)
    lightMapColor = vec4(vec2(UV2) * (1.0 / 16.0), 0.0, 1.0);

    texCoord0 = vec4(UV0, 0.0, 1.0);

    // Normal mapping for depth perception
    normal = vec4(normalize(Normal), 1.0);

    // World position for effects
    worldPos = (IViewRotMat * vec4(Position, 1.0)).xyz;

    // Subtle wind animation for vegetation
    if (Color.r == Color.g && Color.g == Color.b && Color.a > 0.9) {
        float wave = sin(GameTime * WAVE_FREQUENCY + worldPos.x * 0.1 + worldPos.z * 0.1) * WAVE_AMPLITUDE;
        gl_Position.xyz += vec3(wave * Position.y * 0.02, 0.0, wave * Position.y * 0.02);
    }
}
