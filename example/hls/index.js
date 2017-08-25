const { PerspectiveCamera } = require('axis3d/camera')
const { PlaneGeometry } = require('axis3d-geometry')
const { Context } = require('axis3d')
const { Texture } = require('axis3d/texture')
const { Frame } = require('axis3d/frame')
const { Mesh } = require('axis3d/mesh')
const vec3 = require('gl-vec3')

// at the very least, a HLSVideoTexture is needed for rendering
// a video to a texture intelligently. VideoMaterial is a convenient wrapper
// around a fragment shader that uses UV data from the mesh to draw texture
// data to a fragment. It will also fallback to a color when the video frame
// data is not available
const {
  HLSVideoTexture,
  VideoMaterial
} = require('../../')

// the context object that wraps a WebGL context and canvas
// to draw to
const ctx = new Context({gl: {attributes: {antialias: true}}})

// a video DOM element is suitable to pass to the texture
// component which uploads the video frame if the video
// frame data is considered ready
const domElement = document.createElement('video')

// this geometry represents a plane surface which is what
// we will end up drawing to
const geometry = new PlaneGeometry({size: {x: 1, y: 1, z: 1}})

// the video material defines a fragment shader that will read from a
// Texture2D (sampler2D wrapper in axis3D) if texture data is present,
// otherwise it will just draw some default color
const material = new VideoMaterial(ctx)

// this texture accepts a video element that is progressively
// downloaded from the network and streamed to a shader texture
// used by the video material
const texture = new HLSVideoTexture(ctx)

// the camera that sits in the scene
const camera = new PerspectiveCamera(ctx)

// the frame component is a light weight wrapper around regl's
// requestAnimationFrame hook. It enqueues functions that are called
// on the next animation frame with the current frame context
const frame = new Frame(ctx)

// the mesh that wraps a plane goemetry and actually draws the
// surface on the screen
const mesh = new Mesh(ctx, {geometry})

// we can't attach the source directly to the video DOM element
// bescause it will throw an error as .m3u8 (hls) is not supported
// natively on most browsers
const src = '/assets/hls/big-buck-bunny.m3u8'

// handle any errors that may occur during rendering
ctx.on('error', (err) => console.error(err.stack || err))

// configure video DOM element
window.video = domElement
Object.assign(domElement, {
  autoplay: true,
  preload: 'metadata',
  muted: true,
  loop: true,
})

// this will force a fragment shader in the material to be compiled
// with a video texture
domElement.oncanplay = () => {
  console.log("can play '%s'", domElement.src)
  texture({domElement}, () => material())
  domElement.oncanplay = null
}

// handle network or playback errors
domElement.onerror = (e) => {
  console.error("error for '%s':", domElement.src, e.detail || e)
}

// compile initial shader in next frame to prevent
// this script execution from blocking
requestAnimationFrame(() => {
  // this will force a fragment shader in the material to be compiled
  // without a video texture
  texture({domElement: null}, () => material())
})

// enqueue the scene to be rendered in a frame loop by
// the frame component
requestAnimationFrame(() => {
  frame(scene)
})

// this is the surface scale that we cache
// and store here. It will be modified in the
// scene function below, but persisted here to
// prevent render glitches from occuring due to
// the availability of the textureResolution
// variable
const scale = [0, 0, 0]

// this is the actual scene that gets rendererd. Fragment shaders
// are compiled, cached, and used when appropriate based on
// texture state. this is handled in VideoMaterial
function scene({time}) {
  // we position the camera just a bit back along the z-axis
  camera({position: [0, 0, 0.5]}, () => {

    // we provide the video DOM element each frame to the
    // texture component which will decide if there is
    // enough data to give to the texture. the internal HLS
    // object will attach the DOM element as media and
    // load the source given source. All options in the
    // `.hls` object are passed directly to the constructor
    texture({domElement, src, hls: {debug: true}}, ({textureResolution, textureData}) => {

      // the material component will inject a shader define
      // used to determine if there is texture data available
      // to draw. It will then switch to the appropriate shader
      // if true. If there isn't texture data, then it will draw
      // a blue surface, otherwise the current video frame
      material(() => {

        // this is the default scale of our surface mesh
        // we leverage the texture resolution to determine the
        // appropriate scale of the mesh surface if texture data
        // exists in the context
        if (textureData) {
          // determine resolution paramters to apply scaling
          const [w, h] = textureResolution
          const aspect = w/h
          // linearly interpolate scale towards actual scale over
          // time with an interpolation factor to give an ease effect
          // towards the center of the screen
          vec3.lerp(scale, scale, [1, 1/aspect, 1], 0.07)
        }

        // this is where the actual draw call occurs
        mesh({scale})
      })
    })
  })
}
