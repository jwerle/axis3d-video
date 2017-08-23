const { VideoTexture } = require('./texture')
const { Component } = require('axis3d')

class ProgressiveVideoTexture extends Component {
  constructor(ctx, initialState) {
    super(ctx, initialState,
      new VideoTexture(ctx),
    )
  }
}

module.exports = {
  ProgressiveVideoTexture
}
