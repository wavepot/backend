import Editor, { registerEvents } from './editor.js'
import Shared32Array from './shared32array.js'
import Rpc from './rpc.js'
import * as Server from './server-api.js'
import initial from './initial.js'

self.bufferSize = 2**19
self.buffers = [1,2,3].map(() => new Shared32Array(self.bufferSize))
self.isRendering = false
self.renderTimeout = null

class Wavepot extends Rpc {
  data = {
    numberOfChannels: 1,
    sampleRate: 44100,
    sampleIndex: 0,
    bufferSize: self.bufferSize,
    barSize: 0,
  }

  constructor () {
    super()
    Object.assign(self, this.data)
  }

  async setup () {
    await this.rpc('setup', this.data)
  }

  async compile () {
    const result = await this.rpc('compile', { code: editor.value })
    console.log('compile: ', result)
  }

  async render (data) {
    return this.rpc('render', data)
  }

  async fetchSample ({ url }) {
    const sample = await Server.fetchSample(audio, url)
    return { sample }
  }
}

const worker = new Worker('wavepot-worker.js', { type: 'module' })
const wavepot = new Wavepot()

let editor
let label = 'lastV1'

async function main () {
  editor = new Editor({
    id: 'main',
    title: 'new-project.js',
    // font: '/fonts/mononoki-Regular.woff2',
    // font: '/fonts/ClassCoder.woff2',
    font: '/fonts/labmono-regular-web.woff2',
    value: localStorage[label] ?? initial,
    fontSize: '10.5pt',
    // fontSize: '16.4pt',
    padding: 3.5,
    titlebarHeight: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  })

  editor.onchange = async () => {
    localStorage[label] = editor.value
    // await wavepot.compile()
    // playNext()
  }
  editor.onupdate = async () => {
    localStorage[label] = editor.value
  }
  container.appendChild(editor.canvas)
  editor.parent = document.body
  editor.rect = editor.canvas.getBoundingClientRect()
  // TODO: cleanup this shit
  const events = registerEvents(document.body)
  editor.onsetup = () => {
    events.setTarget('focus', editor, { target: events.textarea, type: 'mouseenter' })

    document.body.addEventListener('keydown', e => {
      if (e.key === ' ' && (e.ctrlKey || e.metaKey)) {
        e.stopPropagation()
        e.preventDefault()
        toggle()
        return false
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.stopPropagation()
        e.preventDefault()
        toggle()
        return false
      }

      if (e.key === '.' && (e.ctrlKey || e.metaKey)) {
        e.stopPropagation()
        e.preventDefault()
        editor.update(() => {
          wavepot.compile().then(() => {
            if (!isPlaying) {
              toggle()
            }
            playNext()
          })
        })
        return false
      }
    }, { capture: true })
  }

  window.onresize = () => {
    editor.resize({
      width: window.innerWidth,
      height: window.innerHeight
    })
    // worker.postMessage({
    //   call: 'resize',
    //   width: window.innerWidth,
    //   height: window.innerHeight
    // })
    // canvas.style.width = window.innerWidth + 'px'
    // canvas.style.height = window.innerHeight + 'px'
  }

  await wavepot.register(worker).setup()
}

let audio,
    audioBuffers,
    bufferSourceNode,
    bar = {},
    isPlaying = false,
    playNext = () => {}

let toggle = async () => {
  audio = new AudioContext({
    numberOfChannels,
    sampleRate,
    latencyHint: 'playback' // without this audio glitches
  })

  audioBuffers = [1,2,3].map(() => audio.createBuffer(
    numberOfChannels,
    bufferSize,
    sampleRate
  ))

  let offsetTime = 0

  const getSyncTime = () => {
    const bar = barSize / sampleRate
    const time = audio.currentTime - offsetTime
    const remain = bar - (time % bar)
    return time + remain + offsetTime
  }

  playNext = async () => {
    if (!isPlaying) return false
    if (isRendering) return false

    bar.onended = null

    const nextWorkerBuffer = buffers.pop()
    if (!nextWorkerBuffer) {
      console.log('no worker buffer available!')
      return
    }

    isRendering = true
    renderTimeout = setTimeout(() => {
      console.log('Timed out!')
      buffers.push(nextWorkerBuffer)
      isRendering = false
    }, 10000)

    const { bpm, bufferIndex, timeToRender } = await wavepot.render({ buffer: nextWorkerBuffer })
    console.log('written:', bufferIndex, 'bpm:', bpm)
    clearTimeout(renderTimeout)
    isRendering = false

    if (!isPlaying) {
      buffers.push(nextWorkerBuffer)
      return
    }

    const nextBuffer = audioBuffers.pop()
    if (!nextBuffer) {
      console.log('no buffer available!')
      return
    }

    for (let i = 0; i < numberOfChannels; i++) {
      const target = nextBuffer.getChannelData(i)
      target.set(nextWorkerBuffer.subarray(0, bufferIndex))
    }

    let syncTime
    if (offsetTime) {
      syncTime = getSyncTime()
    } else {
      syncTime = audio.currentTime
    }

    console.log('schedule for:', syncTime - offsetTime)

    offsetTime = syncTime

    if (bufferSourceNode) {
      bufferSourceNode.stop(syncTime)
    }

    barSize = bufferIndex

    const duration = barSize / sampleRate

    bufferSourceNode = audio.createBufferSource()
    bufferSourceNode.buffer = nextBuffer
    bufferSourceNode.connect(audio.destination)
    bufferSourceNode.loop = true
    bufferSourceNode.loopStart = 0.0
    bufferSourceNode.loopEnd = duration
    const node = bufferSourceNode
    bufferSourceNode.onended = () => {
      node.disconnect()
      audioBuffers.push(nextBuffer)
      buffers.push(nextWorkerBuffer)
      console.log('ended')
    }

    bar = audio.createConstantSource()
    bar.onended = () => {
      bar.disconnect()
      onbar()
    }
    bar.start(syncTime)
    bar.stop(syncTime + Math.max(0.001, duration - Math.max(duration/2, (timeToRender*.001)*1.3) ))

    bufferSourceNode.start(syncTime)
  }

  console.log('connected node')

  const onbar = () => {
    console.log('bar')
    playNext()
  }

  const start = () => {
    isPlaying = true
    playNext()
    toggle = () => {
      bufferSourceNode?.stop(0)
      offsetTime = 0
      isPlaying = false
      isRendering = false
      toggle = start
    }
  }

  toggle = start

  await wavepot.compile()

  start()
}

main()