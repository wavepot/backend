import biquad from './biquad.js'
import Delay from './delay.js'
import Daverb from './daverb.js'
import Wavetable from './wavetable.js'
import Osc from './osc.js'
import {
  toFinite,
  clamp,
  captureOneProxy,
  captureManyProxy,
  actlessProxy,
} from './util.js'

let once = 3
console.once = (...args) => {
  if (once === 0) return
  --once
  console.log(...args)
}

const filterKeys = Object.keys(biquad())

let i_c = 0
const contexts = []

let i_d = 0
const delays = []

let i_dv = 0
const daverbs = []

const sends = {}

const patterns = {}

const wavetable_oscs = ['sin','saw','ramp','tri','sqr','pulse','noise']
const wavetables_index = Object.fromEntries(
  wavetable_oscs.map(key => [key, 0]))
const wavetables = Object.fromEntries(
  wavetable_oscs.map(key => [key, []]))
let wavetable

const on = [
  (c,count,beat,mod) => { c._on = [count,beat,mod] },
  (run, { $, _on: [count,beat,mod=count] }) => {
    Math.floor($.t/(beat*4))%mod === count-1 && run()
  }
]

const actless = actlessProxy()

const Fluent = (api, method) => {
  const init = (a0,a1,a2,a3,a4) => {
    let c = contexts[i_c]
    if (!c || c._checksum !== method + a0) {
      c = contexts[i_c] = Context()
      c._checksum = method + a0

      c.o = () => c.o

      Object.assign(c.o, Object.fromEntries(
        Object.entries(api).map(([k, v]) => [k,
          (a0,a1,a2,a3,a4) => {
            c.x0 = toFinite(v(c,a0,a1,a2,a3,a4) ?? c.x0)
            return c.o
          }
        ])))

      c.o.on = captureManyProxy(c, c.o, on[0], on[1])
      // c.o.onmany = captureManyProxy(c, c.o, on[0], on[1])
      c.o.onall = (count,beat,mod) => {
        if (Math.floor($.t/(beat*4))%mod === count-1) {
          return c.o
        } else {
          return actless
        }
      }

      c.o.and = c.o

      c.o.valueOf =
      c.o[Symbol.toPrimitive] = () => c.x0
    }

    i_c++

    c.x2 = c.x1
    c.x1 = c.x0
    c.x0 = 0

    c.i = c.$.i
    c.n = c.$.n
    c.p = c.$.n

    c.s = c.$.s
    c.t = c.$.t // TODO: c.br = beatrate

    // clear filter history if filters are added/removed
    // otherwise math blows up
    if (c._prev_filter_n !== c._curr_filter_n) {
      c.y.fill(0)
    }
    c._prev_filter_n = c._curr_filter_n
    c._curr_filter_n = 0

    // eq buffer position increment
    c._i_e = 0

    return c.o[method](a0,a1,a2,a3,a4)
  }

  return init
}

const $ = {
  _out: [new Float32Array]
}

const Context = () => ({
  ...$,
  $,
  t: 0,
  s: 0,
  n: 0,
  i: 0,
  sr: 0,
  br: 0,
  x0: 0,
  x1: 0,
  x2: 0,
  _i_e: 0,
  _curr_filter_n: 0,
  _prev_filter_n: 0,
  _mod: Infinity,
  _spare: [],
  y: new Float32Array(256),
})

Object.assign($, Context())

const samples = {}
const sampler = (c,s,offset=0,stretch=1) => {
  // let N = s[0].length %
  let x = (c.n+offset)

  if (Number.isFinite(c._mod)) {
    let N = c._mod*c.$.br
    x = (x % N + N) % N
  }

  return s[0][Math.floor((x*stretch) % s[0].length)]
}
const fetchSample = async (url) => {
  try {
    const { sample } = await rpc({ call: 'fetchSample', url })
    samples[url] = sample
  } catch (error) {
    delete samples[url]
    console.error(error)
  }
}

const create = () => {
  const context = Context()
  const PI = Math.PI
  const TAU = 2*PI
  const freqToFloat = (freq = 500) => toFinite(freq / ($.sr / 2))
  const join = (c) => c._spare.splice(0).reduce((p,n)=>p+n,c.x0)
  const push = (c) => { c._spare.push(c.x0) }
  const sample = (c,x,offset,stretch) => {
    let s = samples[x]
    if (!s) {
      s = samples[x] = [new Float32Array()]
      fetchSample(x)
    }
    return sampler(c,s,offset,stretch)
  }
  const eq = (c,...f) => {
    f.filter(Boolean).map(([[b0,b1,b2,a1,a2],amt=1],i) => {
      i = c._i_e
      c._i_e += 6
      c._curr_filter_n++

      let y = toFinite(
        b0*c.y[i+3]
      + b1*c.y[i+4]
      + b2*c.y[i+5]
      - a1*c.y[i+1]
      - a2*c.y[i+2]
      )

      c.y[i+5] = c.y[i+4]
      c.y[i+4] = c.y[i+3]
      c.y[i+3] = c.x0

      c.y[i] = y
      c.y[i+2] = c.y[i+1]
      c.y[i+1] = c.y[i]

      c.x0 = c.x0*(1-amt) + y*amt
    })
  }
  const delay = (c,sig=1/16,feedback=.5,amt=.5) => {
    let d = delays[i_d] = delays[i_d] ?? new Delay($.br*8)
    i_d++
    return d.delay(Math.floor($.br*4*sig)).feedback(feedback).run(c.x0, amt)
  }
  const daverb = (c,x={}) => {
    let dv = daverbs[i_dv] = daverbs[i_dv] ?? new Daverb($.sr)
    i_dv++
    return c.x0 * (x.dry??0.6) + dv.process(c.x0,x)
  }
  const val = (c,x) => +x
  const hz = (c,x) => c.s*x
  const bt = (c,x) => c.t*(1/(x*16))
  const exp = (c,x=10) => c.x0*Math.exp(-c.t*x)
  const tanh = (c,x=1) => Math.tanh(c.x0*x)
  const mod = (c,x=1) => {
    x = toFinite(x) || 1
    x = x * 4
    c.s = c.s % x
    c.t = c.t % x
    c.p = Math.floor(c.n % (x*c.$.br))
    c._mod = x
  }
  const repeat = mod
  const offt = (c,x) => { c.t=toFinite((c.t+x)%c._mod) }
  const offp = (c,x) => { c.p=toFinite((c.p+x)%(c._mod*c.$.br)) }
  const vol = (c,x) => c.x0*x
  const mul = vol
  const add = (c,x) => { c.x0 += x }
  const out = (c,x=1) => { o.send.out.add(c.x0*x) }
  const send = (c,key,amt=1) => {
    if (key in sends) {
      o.send[key].add(c.x0*amt)
    } else {
      o.send[key] = sends[key] = o.val(c.x0*amt)
    }
  }
  const xon = () => {}
  const notes = 'ccddeffggaab'
  const stringToNote = s => {
    s = s.split('')
    let octave = parseInt(s[s.length - 1], 10)
    if (isNaN(octave)) octave = 4
    const note = s[0].toLowerCase()
    const flat = s[1] === 'b'
    const sharp = s[1] === '#'
    return notes.indexOf(note) + (octave * 12) + sharp - flat
  }
  const note = (c,n) => {
    if ('string' === typeof n) n = stringToNote(n)
    return Math.pow(2, (n - 57)/12) * 440 // equally tempered
  }
  const EXCESS_WHITESPACE = / {1,}|\n/g
  const HAS_LETTER = /[a-zA-Z]/
  const parsePattern = x => x
    .replace(EXCESS_WHITESPACE, ' ') // remove excess whitespace
    .trim() // and trim
    .split(' ') // split to array of values
    .map(n => toFinite(
      HAS_LETTER.test(n)
        ? stringToNote(n) // has a letter then it is a musical note
        : parseFloat(n) // otherwise it's a scalar
      ))
  let _pat // TODO: memoize()
  const pat = (c,x,_mod=c._mod/4) => {
    _pat = patterns[x] = patterns[x] ?? parsePattern(x)
    return _pat[Math.floor(($.t/(_mod*4))%_pat.length)]
  }
  const patv = (c,x,_mod) => c.x0 * pat(c,x,_mod)
  let _pos, _now, _next, _alpha
  const slide = (c,x,_mod,speed=1) => {
    _pat = patterns[x] = patterns[x] ?? parsePattern(x)
    _pos = $.t/(_mod*4)%_pat.length
    _now = Math.floor(_pos)
    _next = (_now + 1)%_pat.length
    _alpha = _pos - _now
    return _pat[_now]+((_pat[_next]-_pat[_now])*Math.pow(_alpha, speed))
  }
  const slidev = (c,x,_mod,speed) => c.x0 * slide(c,x,_mod,speed)
  const api = {
    join,
    push,
    sample,
    delay,
    daverb,
    hz,
    bt,
    exp,
    tanh,
    mod,
    offt,
    offp,
    note,
    pat,
    patv,
    slide,
    slidev,
    eq,
    send,
    repeat,
    val,
    vol,
    mul,
    add,
    out,
    xon,
  }

  Object.assign(api, Osc('s'))
  Object.assign(api, Object.fromEntries(
    Object.entries(Osc('t')).map(([k, v]) => [k+'t', v])))

  Object.assign(api, Object.fromEntries(
    filterKeys.map(key => [key, (c,a0,a1,a2,a3,a4) => eq(c,o[key](a0,a1,a2,a3,a4))])))

  Object.assign(api, Object.fromEntries(
    wavetable_oscs.map(key => {
      const genfn = (c,x) => {
        let fn = wavetables[key][wavetables_index[key]]
        if (!fn) {
          fn = wavetables[key][wavetables_index[key]] = wavetable(key)
        }
        wavetables_index[key]++
        return fn(c,x)
      }
      return [key+'w',genfn]
    })))

  Object.assign(api, Object.fromEntries(
    wavetable_oscs.map(key => {
      const genfn = (c,x,shift=0) => {
        let fn = wavetables[key][wavetables_index[key]]
        if (!fn) {
          fn = wavetables[key][wavetables_index[key]] = wavetable(key)
        }
        wavetables_index[key]++
        if (c.p === 0) {
          fn.pos = shift
        }
        return fn(c,x,shift)
      }
      return [key+'m',genfn]
    })))

  const o = Object.fromEntries(
    Object.entries(api).map(([k,v]) =>
      [k,Fluent(api, k)]))

  o.on = Fluent(api, 'onall')

  return o
}


const api = create()

let buffer
let prev, render

$.clear = i => {
  let key

  // reset pools
  i_c = i_d = i_dv = 0

  for (key in sends) api.send[key] = api.val(0)
  for (key in wavetables_index) wavetables_index[key] = 0

  $.s = $.n/$.sr
  $.t = $.n/$.br // TODO: c.br = beatrate
}

let callbackId = 1
const callbacks = new Map

const rpc = (message, callback) => {
  return new Promise((resolve, reject) => {
    const id = callbackId++
    callbacks.set(id, data => {
      callbacks.delete(id)
      if (data.error) {
        reject(data.error)
      } else {
        resolve(data)
      }
    })
    postMessage({ ...message, callback: id })
  })
}

const methods = {
  async setup (data) {
    buffer = data.buffer
    $.sr = self.sampleRate = data.sampleRate
    $.br = data.beatRate
    wavetable = Wavetable($.sr)
    Object.assign(api, biquad($.sr))
    postMessage({ call: 'ready' })
  },
  callback (data) {
    callbacks.get(data.callback)(data)
  },
  updateRenderFunction ({ value, n }) {
    api.$ = $
    api.sr = $.sr
    api.br = $.br
    prev = render
    api.val(0).send('out')
    render = new Function(...Object.keys(api), value).bind(null, ...Object.values(api))
    if (!prev) prev = render
    $.n = n
    methods.play()
  },
  play () {
    if (!render) return

    console.time('play')

    $._out[0] = buffer[0]

    $.clear(0)
    try {
      render()
    } catch (err) {
      console.error(err)
      render = prev
      render()
    }

    $.n++

    for ($.i = 1; $.i < buffer[0].length; $.i++, $.n++) {
      $.clear($.i)
      render()
      $._out[0][$.i] = +api.send.out
    }

    console.timeEnd('play')

    postMessage({ call: 'play', n: $.n })
  }
}

onmessage = ({ data }) => methods[data.call](data)

addEventListener('error', error => {
  console.error('CAPTURE ERROR', error)
})
