import { parsePattern, stringToNote } from './util.js'
import Biquad from './biquad.js'
import Oscs from './osc.js'

const PRIVATE_API = ['constructor','valueOf','_reset']
const getMethods = (obj) => {
  return Object.getOwnPropertyNames(obj)
    .filter(m => !PRIVATE_API.includes(m))
}

class Sound {
  constructor () {
    this.x0 = 0
    this.t = 0
    this._mod = Infinity
    this._wavetables_i = 0
    this._wavetables = new Array(100).fill(0)

    const returnThis = () => this
    this._ignoreNext =
      Object.fromEntries(
        getMethods(Sound.prototype)
          .map(m => [m, returnThis]))

    const returnIgnoreGrp = () => this._ignoreGrp
    this._ignoreGrp =
      Object.fromEntries(
        getMethods(Sound.prototype)
          .map(m => [m, returnIgnoreGrp]))

    this._ignoreGrp.end = returnThis

    this._ignoreNext.grp = () => this._ignoreGrp
  }

  _reset (t) {
    this.t = t
    this.p = n
    this._wavetables_i = 0
    return this
  }

  grp () {
    return this
  }

  end () {
    return this
  }

  val (x=0) {
    this.x0 = x
    return this
  }

  vol (x=1) {
    this.x0 *= x
    return this
  }

  mod (x=1,offset=0) {
    x = x * 4
    this.t %= x
    this.p = (n % (br * x))|0
    if (this.p === 0) {
      this._wavetables.fill(offset*_wavetable_len)
    }
    return this
  }

  exp (x=10) {
    this.x0 *= Math.exp(-this.t * x)
    return this
  }

  tanh (x=1) {
    this.x0 = Math.tanh(this.x0 * x)
    return this
  }

  on (x=1, measure=1/4, count=x) {
    return (t/(measure*4)|0)%count === x-1
      ? this
      : this._ignoreNext
  }

  // TODO: improve this
  play (x,offset=0,speed=1) {
    let N = x.length
    this.x0 = x[(( ( (this.p+offset)*speed) % N + N) % N)|0]
    return this
  }

  delay (measure=1/16,feedback=.5,amt=.5) {
    let d = _delays[_delays_i++]
    this.x0 = d.delay((bar*measure)|0).feedback(feedback).run(this.x0, amt)
    return this
  }

  daverb (x={}) {
    let d = _daverbs[_daverbs_i++]
    this.x0 = d.process(this.x0, x)
    return this
  }

  out (x=1) {
    main.x0 += this.x0 * x
    return this
  }

  valueOf () {
    return this.x0
  }
}

// aliases
Sound.prototype.mul = Sound.prototype.vol

Object.assign(Sound.prototype, Biquad)

self._wavetable = {}
self._wavetable_len = 44100

Object.keys(Oscs).forEach(osc => {
  const table =
  _wavetable[osc] =
  _wavetable[osc] = new Float32Array(_wavetable_len)
  for (let i = 0, t = 0; i < _wavetable_len; i++) {
    t = i / _wavetable_len
    if (osc === 'noise') {
      table[i] = Oscs[osc].call(i, 1)
    } else {
      table[i] = Oscs[osc].call(t, 1)
    }
  }

  Sound.prototype[osc] = new Function('x=1', `
    let index = this._wavetables[this._wavetables_i]
    this._wavetables[this._wavetables_i++] = (index + x) % 44100
    this.x0 = _wavetable.${osc}[index|0]
    return this
  `)
})

const N = Number.prototype

Object.defineProperty(N, 'note', {
  get () {
    return Math.pow(2, (this - 57)/12) * 440
  },
  set () {},
})

const S = String.prototype

Object.defineProperty(S, 'sample', {
  get () {
    let s = samples[this]
    if (!s) {
      s = samples[this] = zeroSample
      worker.fetchSample(this)
    }
    return s
  },
  set () {},
})

Object.defineProperty(S, 'pat', {
  get () {
    let pat = patterns[this] = patterns[this] ?? parsePattern(this)
    return pat
  },
  set () {},
})

Object.defineProperty(S, 'note', {
  get () {
    return stringToNote(this)
  },
  set () {},
})

S.seq = function (x) {
  return this.pat.seq(x)
}

S.slide = function (x) {
  return this.pat.slide(x)
}

const A = Array.prototype

A.play = function (x=1,offset=0) {
  let N = this.length
  return this[(( (n*x+offset) % N + N) % N)|0]
}

A.seq = function (x) {
  let N = this.length
  return this[(( (t*(1/(x*4))) % N + N) % N)|0]
}

A.slide = function (x,speed=1) {
  let N = this.length
  let pos = (( (t*(1/(x*4))) % N + N) % N)
  let now = pos|0
  let next =  (((now + 1) % N + N) % N)|0
  let alpha = pos - now
  return this[now]+((this[next]-this[now])*Math.pow(alpha, speed))
}

const T = Object.getPrototypeOf(Float32Array).prototype // TypedArray.prototype

T.play  = A.play
T.seq   = A.seq
T.slide = A.slide

export default Sound
