const ready = require('domready')
const style = document.createElement('style')
style.textContent = `
.IIV::-webkit-media-controls-play-button,
.IIV::-webkit-media-controls-start-playback-button {
    opacity: 0;
    pointer-events: none;
    width: 5px;
}
`
module.exports = function initializeIOSWorkaround() {
  if (false == document.head.contains(style)) {
    ready(() => {
      document.head.appendChild(style)
    })
  }
}
