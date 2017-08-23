#ifndef A3D_VIDEO_FRAGMENT
#define A3D_VIDEO_FRAGMENT

#ifndef A3D_VIDEO_DEFAULT_COLOR
#define A3D_VIDEO_DEFAULT_COLOR vec3(0.2, 0.3, 0.4)
#endif

#include <varying/uv>
#include <varying/read>
#include <texture/2d>

#ifdef A3D_VIDEO_HAS_TEXTURE_2D
uniform Texture2D video;
#endif

#define GLSL_FRAGMENT_MAIN_BEFORE Before
#define GLSL_FRAGMENT_MAIN_AFTER After

#include <fragment/main>

void Before(inout vec4 fragColor, inout VaryingData data) {
  fragColor.rgb = vec3(A3D_VIDEO_DEFAULT_COLOR);
}

void Main(inout vec4 fragColor, inout VaryingData data) {
#ifdef A3D_VIDEO_HAS_TEXTURE_2D
  fragColor.rgb = texture2D(video.data, data.uv).rgb;
#endif
}

void After(inout vec4 fragColor, inout VaryingData data) {
  fragColor.a = 1.0;
}

#endif
