const { VideoTexture } = require('./texture')
const { Component } = require('axis3d')

class ProgressiveVideoTexture extends Component {
  constructor(ctx, initialState) {
    const texture = new VideoTexture(ctx)
    super(ctx, initialState, update, texture)
    function update(state, next) {
      const {data} = state
      const {domElement = data} = state
      const {src} = state || domElement
      if ('string' == typeof src && src != domElement.src) {
        domElement.src = src
        domElement.load()
      }
      next()
    }
  }
}

module.exports = {
  ProgressiveVideoTexture
}
