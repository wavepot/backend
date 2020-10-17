import { toFinite, parseFn, parsePattern } from './util.js'
import Rpc from './rpc.js'
import Sound from './sound.js'
import Delay from './delay.js'
import Daverb from './daverb.js'

// Number prototype extensions
Number.prototype.toFinite = function () {
  return Number.isFinite(this) ? this : 0
}

Number.prototype.clamp = function (min, max) {
  return Math.min(max, Math.max(min, this))
}

// utils
self.toFinite = toFinite

// constants
self.pi2 = Math.PI * 2

// audio
self.bufferSize = 88200
self.sampleRate = 44100
self.buffer = new Float32Array(88200)
self.numberOfChannels = 1

// clock
self.real_n = 0 // this doesn't adjust by bpm
self.n = 0 // this adjusts by bpm
self.i = 0 // current buffer iteration point
self.s = 0 // playing seconds (real, based on real_n)
self.t = 0 // playing time (sync based on bpm, 1 equals 1 beat time)
self._bpm = 120 // starting at 120bpm
self.br = 22050 // for 120bpm
self.bar = self.br * 4
self._sync = self.sampleRate / self.br
self._loop = 0

self.main = new Sound()

// blocks
self._block_i = 0

// sounds
self.sounds_i = 0
self.sounds = Array.from(Array(100), () => (new Sound()))

// biquads
self._biquads_i = 0
self._biquads = Array.from(Array(200),()=>([0,0,0,0]))

// delays
self._delays_i = 0
self._delays = Array.from(Array(100),()=>(new Delay(44100)))

// daverbs
self._daverbs_i = 0
self._daverbs = Array.from(Array(100),()=>(new Daverb(44100)))

// samples
self.zeroSample = [new Float32Array([0]),new Float32Array([0])]
self.samples = {}

// patterns cache map
self.patterns = {}

// top level entry api
self.api = {
  bpm (x, measure=1) {
    if (x !== _bpm) {
      _bpm = x.clamp(1, 1000)
      let co = (60 * measure) / _bpm
      br = (sampleRate * co)|0
      bar = br * 4

      // used in sync() ops
      _sync = sampleRate / br

      // adjust n position for new bpm
      // only at the beginning of the loop
      if (i === 0) {
        n = Math.round(t) * br
      }
    }
    t = n / br
  },
  loop (beat) {
    if (i === 0) {
      n = (beat + 1) * br
      t = n / br
    }
  },
  sync (x=1) {
    return (1/x) * _sync
  },
}
const IGNORE_METHODS = ['constructor','out']
Object.getOwnPropertyNames(Sound.prototype)
.filter(method => !IGNORE_METHODS.includes(method))
.forEach(method => {
  const { args, argNames } = parseFn(Sound.prototype[method])
  self.api[method] = new Function(...args,
    `
return sounds[sounds_i++]._reset(t).${method}(${argNames})
    `
  )
})

export const compile = (code) => {
  let src = `
console.log('n is:', n)
for (i = 0; i < bufferSize; i++) {
  if (i > 50000 && ((i % (bar|0)) === 0)) {
    break
  }

  n++
  real_n++
  s = real_n / ${sampleRate}

  ${code.split('\n\n').join(`

  // TODO: use better heuristics
  _biquads_i += 5
  _daverbs_i += 5
  _delays_i += 5

  `)}

  buffer[i] = main.x0.toFinite()
  sounds_i =
  _biquads_i =
  _daverbs_i =
  _delays_i =
  main.x0 = 0
}

return { bufferIndex: i, bpm: _bpm }
  `
  let func = new Function(Object.keys(self.api), src).bind(null, ...Object.values(self.api))
  return func
}

/*

RPC API Interface with Main thread

*/

export default class Renderer extends Rpc {
  constructor () {
    super()
  }

  lastFunc () {}

  setup (data) {
    Object.assign(self, data)
  }

  compile ({ code }) {
    const func = compile(code)
    this.lastFunc = this.func
    this.func = func
    return true
  }

  render ({ buffer }) {
    console.log('will render', n)
    let result = {}
    let timeToRender = performance.now()
    self.buffer = buffer
    try {
      result = this.func()
    } catch (err) {
      console.error(err)
      if (this.func !== this.lastFunc) {
        console.error('error, retrying last')
        this.func = this.lastFunc
        return this.render({ buffer })
      }
    }
    timeToRender = performance.now() - timeToRender
    console.log('render:', timeToRender)
    return { ...result, timeToRender }
  }

  async fetchSample (url) {
    try {
      const { sample } = await this.rpc('fetchSample', { url })
      samples[url] = sample
    } catch (error) {
      delete samples[url]
      console.error(error)
    }
  }
}

self.worker = new Renderer()
self.worker.register(self)
