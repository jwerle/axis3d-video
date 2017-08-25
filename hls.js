const { assignDefaults } = require('axis3d/utils')
const { ScopedContext } = require('axis3d/scope')
const { VideoTexture } = require('./texture')
const { Component } = require('axis3d')
const HLS = require('hls.js')

class HLSVideoTexture extends Component {
  static defaults() {
    return {
      hls: {}
    }
  }

  constructor(ctx, initialState) {
    let currentSrc = null
    const cache = {} // src => {domElement, player}
    const texture = new VideoTexture(ctx)
    const context = new ScopedContext(ctx, {
      domElement() {
        if (cache[currentSrc]) {
          return cache[currentSrc].domElement
        }
      },

      hls() {
        if (cache[currentSrc]) {
          return cache[currentSrc].player
        }
      }
    })

    super(ctx, initialState, update, texture, context)

    function update(state, next) {
      const {data = document.createElement('video')} = state
      const {domElement = data} = state
      const {src} = state
      if ('string' != typeof src || 0 == src.length) { return next() }
      const entry = cache[src] = cache[src] || {}
      const player = entry.player
        ? entry.player
        : createPlayer(Object.assign({domElement}, state.hls))

      if (!entry.player) {
        player.loadSource(src)
        currentSrc = src
      }
      Object.assign(player.config, state.hls)
      Object.assign(entry, {player, domElement, src})
      Object.assign(state, {domElement})
      next()
    }

    function createPlayer({domElement, config}) {
      const player = new HLS(config)
      player.attachMedia(domElement)
      player.on(HLS.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case HLS.ErrorTypes.NETWORK_ERROR:
              debug("fatal network error encountered, try to recover")
              // try to recover network error
              player.startLoad()
              break
            case HLS.ErrorTypes.MEDIA_ERROR:
              debug("fatal media error encountered, try to recover")
              player.recoverMediaError()
              break
            default:
              // cannot recover
              hls.destroy()
              break
          }
        }
      })

      return player
    }
  }
}

module.exports = {
  HLSVideoTexture
}
