import Editor, { registerEvents } from './editor.js'
import LoopNode from './loop-node.js'
import Shared32Array from './shared32array.js'
import * as api from './api.js'

const initial = `\
// guide:
//
// ctrl+enter = play/pause
//
// mod(measure=1) = [beat time] modulo(%) [measure] (loop)
// sin(hz) saw(hz) ramp(hz) sqr(hz) tri(hz) pulse(hz,width) noise(seed)
// gen+w = wavetable, i.e: sinw saww triw ...
// gen+t = time synced, i.e: sint sawt, trit ...
// val(x) = explicit value x
// push() = pushes value to spare to join later
// join() = joins/sums previous spare values
// exp(decay_speed=10) = reverse exponential curve (decay)
// pat('.1 .2 .5 1',measure=last_mod) = pattern of scalars
// pat('a4 f#5 c3 d3',measure=last_mod) = pattern of notes
// patv(...) = shortcut to pattern volumes
// slide('.1 .2 .5 1',measure=last_mod,speed=1) = slide pattern
//   note: for sliding hz use wavetable oscillators
// slidev(...) = shortcut to slide volumes
// note('b#4') = note musical value in hz
// offt(time_offset) = shift time by time_offset (used with mod)
// vol(x)|mul(x) = multiply current value by x
// lp1(cut,amt=1) hp1(cut,amt=1)
// lp(cut,res=1,amt=1) hp(cut,res=1,amt=1)
// bp(cut,res=1,amt=1) bpp(cut,res=1,amt=1)
// not(cut,res=1,amt=1) ap(cut,res=1,amt=1)
// pk(cut,res=1,gain=1,amt=1)
// ls(cut,res=1,gain=1,amt=1) hs(cut,res=1,gain=1,amt=1)
// eq(bp(...),ls(...),...) = equalizer
// on(beat,measure,count=beat).[call]() = schedule next call
// use a second parenthesis group schedule many calls:
//   i.e on(...).many().calls.grouped()()
//   to bypass use an 'x' before, so xon() will passthrough
// delay(measure=1/16,feedback=.5,amt=.5)
// tanh(x=1) = tanh value multiplied by x (s-curve distortion)
// out(vol=1) = send value to speakers
// send('send_name',amt=1) = sends to send channel "send_name"
// val(send.send_name)...out() = process send "send_name"
// send.out is the output and it's chainable like everything
//
// all changes are saved immediately and refresh
// brings back the state as it was. to reset it
// type in devtools console:
//   delete localStorage.last
//
// enjoy :)

var kick =
  mod(1/4).sinm(mod(1/4).val(42.881).exp(.057))
  .exp(8.82).tanh(15.18)
  .out(.4)

var snare =
  mod(1/2).sample('freesound:220752',-19025,.95)
  .slidev('- - 1 -',1/8,.5)
    .patv('- - 1 .3',1/8)
    .tanh(2)
    .daverb()
  .out(.4)

var crash =
  on(1,2,8)
  .noisew(1)
  .bp(6000)
  .bp(14000)
  .out(.07)

var sitar =
  sample('freesound:350547').daverb().out()

var the_future =
  sample('freesound:166834')
  .daverb({
    wet: .5,
    preDelay: 1000,
    bandwidth: .22,
    inputDiffusion1: .8,
    inputDiffusion2: .7,
    decay: .6,
    damping: .092,
    decayDiffusion1: .89,
    decayDiffusion2: .87,
    excursionRate: .25,
    excursionDepth: .12
  })
  .hs(5000,1,-15,.5)
  .delay(16/(512+(420*sint(1/64))),.8).bpp(3000,.12,.5)
  .out(.7)

// var hihat =
//   mod(1/16).noisew(1).exp(30)
//   .patv('.1 .4 1 .4')
//   .on(8,1/4).patv('1.5 15',1/32)
//   .hs(16000)
//   // .bp(2000,3,1)
//   .bp(500+mod(1/2).val(8000).exp(2.85),.5,.5)
//   .on(8,2).vol(0)
//   .out(.23)

// var clap =
//   mod(1/4).noisew(8).exp(110)
//   .push().offt(.986).noisew(10).exp(110).vol(1.25)
//   .push().offt(.976).noisew(8).exp(110).vol(.9)
//   .push().noisew(8).exp(8.5).vol(.1)
//   .join()
//   .patv('- 1')
//   .bp(1200,1.7,1)
//   .on(8,1/4).send('fx')
//   .send('reverb',.5)
//   .out(.45)

// var bass_melody =
//   val(50)
//   .on(8,1/8).val(70)
//   .on(8,1/2,16).mul(1.5)
//   .on(16,1/2).mul(2)

// var bass =
//   mod(1/16).pulsew(bass_melody).exp(10)
//   .patv('.1 .1 .5 1')
//   .lp(700,1.2)
//   .out(.35)

send.out
  .on(2,1,32)
  .slidev('1.1 - - - 1.1 - - - 1.1 - 1.2 - 1 - 1 -', 1/16, 5)
  .on(8,2)
  .vol(.65).bp(2000+sint(1/32)*1800,5)
  ()
`

const numberOfChannels = 1
const sampleRate = 44100
const bpm = 120

let audio, node, buffer, render = () => {}

let once = true

let editor

let currentWorker
let nextWorker

let playing = false
let updateInProgress = false
let hasChanged = false

let n = 0

const readyCallbacks = []

const methods = {
  ready () {
    readyCallbacks.splice(0).forEach(cb => cb())
  },
  play (worker, data) {
    n = data.n
    playing = true
    updateInProgress = false
    node.playBuffer(worker.buffer)
  },
  async fetchSample (worker, { url }) {
    const sample = await api.fetchSample(audio, url)
    return { sample }
  }
}

const workerUrl = new URL('render-worker.js', import.meta.url)
const worker = new Worker(workerUrl, { type: 'module' })
worker.onmessage = async ({ data }) => {
  let result
  try {
    result = await methods[data.call](worker, data)
  } catch (error) {
    result = { error }
  }
  if (data.callback) {
    worker.postMessage({
      call: 'callback',
      callback: data.callback,
      ...result
    })
  }
}
worker.onerror = error => {
  updateInProgress = false
  console.error(error)
}
worker.onmessageerror = error => {
  updateInProgress = false
  console.error(error)
}

const requestNextBuffer = () => {
  if (updateInProgress) return
  updateInProgress = true
  worker.postMessage({ call: 'play' })
}

const updateRenderFunction = (force = false) => {
  if (updateInProgress && !force) return

  hasChanged = false
  updateInProgress = true

  console.log('updating function')

  worker.postMessage({
    call: 'updateRenderFunction',
    value: editor.value,
    n: n //+node.bufferSize
  })
}

let toggle = async () => {
  audio = new AudioContext({
    numberOfChannels,
    sampleRate,
    latencyHint: 'playback' // without this audio glitches
  })

  node = new LoopNode({ numberOfChannels, bpm })

  node.connect(audio.destination)

  worker.buffer = Array(numberOfChannels).fill(0).map(() =>
    new Shared32Array(node.bufferSize))

  worker.postMessage({
    call: 'setup',
    buffer: worker.buffer,
    sampleRate,
    beatRate: node.beatRate
  })

  await new Promise(resolve => readyCallbacks.push(resolve))

  console.log('received worker ready')

  node.onbar = () => {
    if (hasChanged) {
      updateRenderFunction()
    } else {
      requestNextBuffer()
    }
  }

  console.log('connected node')

  const start = () => {
    updateRenderFunction()
    node.start()

    document.body.onclick = () => {}

    toggle = () => {
      node.stop(0)
      toggle = start
    }
  }

  toggle = start

  start()
}

document.body.onclick = () => {
  document.body.onclick = () => {}
  document.body.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.stopPropagation()
      e.preventDefault()
      toggle()
      return false
    }
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      updateRenderFunction(true)
    }
  }, { capture: true })
}

const main = async () => {
  editor = new Editor({
    id: 'main',
    title: 'new-project.js',
    font: '/fonts/SpaceMono-Regular.woff2',
    value: localStorage.last ?? initial,
    fontSize: '11.5pt',
    // fontSize: '16.4pt',
    padding: 10,
    titlebarHeight: 42,
    width: window.innerWidth,
    height: window.innerHeight,
  })

  editor.onchange = () => {
    localStorage.last = editor.value
    hasChanged = true
  }

  container.appendChild(editor.canvas)
  editor.parent = document.body
  editor.rect = editor.canvas.getBoundingClientRect()

  registerEvents(document.body)

  window.onresize = () => {
    editor.resize({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }
}

main()
