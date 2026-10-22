import { drawImg } from './qrcode-lib.js'

export function drawQrCode(canvas, text, options = {}) {
  const size = options.size || 280
  const imgTag = drawImg(text, { size, typeNumber: 4, errorCorrectLevel: 'M' })

  const src = imgTag.match(/src="([^"]+)"/)?.[1]
  if (!src) return

  const img = new Image()
  img.onload = () => {
    const ctx = canvas.getContext('2d')
    canvas.width = size
    canvas.height = size
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(img, 0, 0, size, size)
  }
  img.src = src
}
