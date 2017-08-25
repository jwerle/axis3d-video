const { assignDefaults } = require('axis3d/utils')
const { ScopedContext } = require('axis3d/scope')
const { VideoTexture } = require('./texture')
const { Component } = require('axis3d')
const shaka = require('shaka-player')

class DASHVideoTexture extends Component {
  static defaults() {
    return {
      dash: {
        abr: {
          defaultBandwidthEstimate: 10000000,
          manager: new shaka.abr.SimpleAbrManager(),
          enabled: true,
        },
        streaming: {
          // Ignore text-based streams that don't exist or fail to play back
          ignoreTextStreamFailures: true,
          // Minimum number of seconds of content to buffer before playback begins/resumes
          rebufferingGoal: 2,
          // Minimum number of seconds of content to be loaded ahead of the playhead
          bufferingGoal: 8,
          // connnection retry settings
          retryParameters: {
            maxAttempts: 8,
            fuzzFactor: 0.25,
            baseDelay: 250, // in milliseconds
          }
        }
      }
    }
  }

  constructor(ctx, initialState = {}) {
    if (false == shaka.Player.isBrowserSupported()) {
      throw new Error("DASHVideoTexture: MPEG-DASH is not supported")
    }
    assignDefaults(initialState, DASHVideoTexture.defaults())
    let currentSrc = null
    const cache = {} // src => {domElement, player}
    const texture = new VideoTexture(ctx)
    const context = new ScopedContext(ctx, {
      domElement() {
        if (cache[currentSrc]) {
          return cache[currentSrc].domElement
        }
      },

      dash() {
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
      const player = entry.player || createPlayer({domElement})
      if (player && !entry.player) {
        player.load(src)
        currentSrc = src
        console.log(Object.assign({}, initialState.dash, state.dash));
        player.configure(Object.assign({}, initialState.dash, state.dash))
        Object.assign(entry, {player, domElement, src})
      }
      Object.assign(state, {domElement})
      next()
    }

    function createPlayer({domElement}) {
      const player = new shaka.Player(domElement)
      const network = player.getNetworkingEngine()
      network.registerRequestFilter((index, req) => {
        const {uris} = req
        for (let i = 0; i < uris.length; ++i) {
          uris[0] = uris[0].replace(/https?:/, '')
        }
        return req
      })
      player.addEventListener('error', (e) => {
        ctx.emit('error', e)
      })
      return player
    }
  }
}

module.exports = {
  DASHVideoTexture
}
