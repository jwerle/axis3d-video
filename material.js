const { assignDefaults, ensureRGB } = require('axis3d/utils')
const { TextureShaderUniforms } = require('axis3d/texture')
const { ShaderDefines } = require('axis3d/shader')
const { Component } = require('axis3d')
const { Material } = require('axis3d/material')
const glslify = require('glslify')

const fragmentShader = glslify(__dirname+'/fragment.glsl')

class VideoMaterial extends Component {
  static defaults() {
    return Object.assign(Material.defaults(), {
      defaultColor: [0.2, 0.3, 0.4],
      precision: 'highp float',
      texture: { uniformName: 'video', format: 'rgb' }
    })
  }

  constructor(ctx, initialState = {}) {
    Object.assign(initialState, {fragmentShader})
    assignDefaults(initialState, VideoMaterial.defaults())
    const defines = {
      A3D_VIDEO_HAS_TEXTURE_2D({textureData}) {
        return textureData ? true : null
      },

      A3D_VIDEO_TEXTURE_2D_UNIFORM_NAME() {
        return initialState.texture.uniform
      },

      A3D_VIDEO_DEFAULT_COLOR(ctx, args = {}) {
        let color = initialState.defaultColor || null
        if (args && 'color' in args) {
          color = args.color
        } else if ('color' in ctx) {
          color = ctx.color
        }

        if (color) {
          color = makeSafeGLSLColor(color)
        }

        return color ? String(color) : null
      }
    }

    super(ctx, initialState,
      new TextureShaderUniforms(ctx, initialState.texture || {}),
      new ShaderDefines(ctx, defines),
      new Material(ctx, initialState)
    )
  }
}

function makeSafeGLSLColor(color) {
  return ensureRGB([...color]).map((c) => 1 == c || 0 == c ? c+'.0' : c)
}

module.exports = {
  VideoMaterial
}
