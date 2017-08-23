const { assignDefaults } = require('axis3d/utils')
const { ScopedContext } = require('axis3d/scope')
const { Component } = require('axis3d')
const { Texture } = require('axis3d/texture')
const inline = require('iphone-inline-video')

const {
  HAVE_NOTHING = 0,
  HAVE_METADATA = 1,
  HAVE_CURRENT_DATA = 2,
  HAVE_FUTURE_DATA = 3,
  HAVE_ENOUGH_DATA = 4,
} = HTMLVideoElement

const kDefaultPreferredReadyState = HAVE_CURRENT_DATA

class VideoTexture extends Component {
  static defaults() {
    return Object.assign(Texture.defaults(), {
    })
  }

  constructor(ctx, initialState = {}) {
    const texture = new Texture(ctx, initialState)
    assignDefaults(initialState, VideoTexture.defaults())
    super(ctx, initialState, update, texture)
    function update(state, next) {
      const {preferredReadyState = kDefaultPreferredReadyState} = state
      const {forceUpdate = false} = state
      const {domElement = null} = state
      const {data = domElement} = state
      const {readyState = HAVE_NOTHING} = (data || {})
      delete state.domElement
      delete state.data
      if (forceUpdate || readyState >= preferredReadyState) {
        state.data = data
        inline(state.data)
      }
      next()
    }
  }
}

module.exports = {
  VideoTexture
}
