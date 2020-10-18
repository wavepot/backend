import Plot from './plot.js'
import Rpc from './rpc.js'

export default class PlotService extends Rpc {
  constructor () {
    super()
  }

  setup (data) {
    data.ctx = data.backCanvas.getContext('2d')
    data.ctx.scale(data.pixelRatio, data.pixelRatio)
    this.data = data
    this.plot = Plot(data, 1)
  }

  draw ({ buffer, size }) {
    let data = this.data
    data.ctx.clearRect(0,0,data.width,data.height)

    // TODO: queue up
    this.plot.setBuffer(buffer)
    this.plot.setSize(size)
    this.plot.drawX()
    this.plot.drawY()
    this.plot.drawLine()
  }
}

new PlotService().register(self)
