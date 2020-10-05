export default class LoopNode {
  constructor ({ bpm = null, numberOfChannels = 2 } = {}) {
    this.currentBufferIndex = 0
    this.offsetTime = 0
    this.numberOfChannels = numberOfChannels
    if (bpm) this.setBpm(bpm)
  }

  get bpm () {
    return parseFloat(
      (60 * (
        this.sampleRate
      / getBeatRate(this.sampleRate, this._bpm)
      )
    ).toFixed(6))
  }

  get beatRate () {
    return getBeatRate(this.sampleRate, this.bpm)
  }

  get currentTime () {
    return this.context.currentTime - this.offsetTime
  }

  get sampleRate () {
    return this.context.sampleRate
  }

  get barTime () {
    return this.bufferSize / this.sampleRate
  }

  get remainTime () {
    const bar = this.barTime
    const time = this.currentTime
    const remain = bar - (time % bar)
    return remain
  }

  get syncTime () {
    const bar = this.barTime
    const time = this.currentTime
    const remain = bar - (time % bar)
    return time + remain + this.offsetTime
  }

  get bufferSize () {
    return this.beatRate * 4
  }

  resetTime (offset = 0) {
    this.offsetTime = this.context.currentTime + offset
  }

  setBpm (bpm) {
    this._bpm = bpm
  }

  _onended () {
    this.gain.disconnect()
    this.playingNode?.disconnect()
    this.onended?.()
  }

  connect (destination) {
    this.context = destination.context
    this.destination = destination
    this.gain = this.context.createGain()
    this.audioBuffers = [1,2].map(() =>
      this.context.createBuffer(
        this.numberOfChannels,
        this.bufferSize,
        this.sampleRate
      )
    )
    this.nextBuffer = this.audioBuffers[0]
  }

  _onbar () {
    if (!this.playing) return
    if (this.scheduledNode) {
      this.playingNode = this.scheduledNode
      this.scheduledNode = null
      this.currentBufferIndex = 1 - this.currentBufferIndex
      this.nextBuffer = this.audioBuffers[this.currentBufferIndex]
    }
    this.scheduleNextBar()
    this.onbar?.()
  }

  scheduleNextBar (syncTime = this.syncTime) {
    const bar = this.context.createConstantSource()
    bar.onended = () => this._onbar()
    bar.start()
    bar.stop(syncTime)
  }

  playBuffer (buffer) {
    const syncTime = this.syncTime
    const output = this.nextBuffer
    for (let i = 0; i < this.numberOfChannels; i++) {
      const target = output.getChannelData(i)
      if (target.length !== buffer[i].length) {
        throw new RangeError('loop node: buffer size provided unequal to internal buffer size: '
          + buffer[i].length + ' instead of ' + target.length)
      }
      target.set(buffer[i])
    }

    if (!this.scheduledNode) {
      const node = this.scheduledNode = this.context.createBufferSource()
      node.buffer = this.nextBuffer
      node.connect(this.gain)
      node.loop = true
      node.start(syncTime)
      this.playingNode?.stop(syncTime)
    }
  }

  start () {
    if (!this.playing) {
      this.playing = true
      this.gain.connect(this.destination)
      this.scheduleNextBar()
    }
  }

  stop (syncTime = this.syncTime) {
    if (!this.playing) {
      throw new Error('loop node: `stop()` called but has not started')
    }
    this.playing = false
    if (this.playingNode) {
      this.playingNode.onended = () => this._onended()
      this.playingNode.stop(syncTime)
    }
    if (this.scheduledNode) {
      this.scheduledNode.stop(0)
      this.scheduledNode.disconnect()
    }
  }
}

const getBeatRate = (sampleRate, bpm) => {
  return Math.round(sampleRate * (60 / bpm))
}
