import Editor, { registerEvents } from './editor.js'
import Shared32Array from './shared32array.js'
import Rpc from './rpc.js'
import * as Server from './server-api.js'
import initial from './initial.js'
import Shader from './shader/shader.js'

self.bufferSize = 2**19
self.buffers = [1,2,3].map(() => ([new Shared32Array(self.bufferSize), new Shared32Array(self.bufferSize)]))
self.isRendering = false
self.renderTimeout = null

class Wavepot extends Rpc {
  data = {
    numberOfChannels: 2,
    sampleRate: 44100,
    sampleIndex: 0,
    bufferSize: self.bufferSize,
    barSize: 0,
    plot: {}
  }

  constructor () {
    super()
    Object.assign(self, this.data)
  }

  async setup () {
    await this.rpc('setup', this.data, [this.data.plot.backCanvas])
  }

  async compile () {
    let code = editor.value

    try {
      const { shaderFunc, rest } = shader.extractAndCompile(code)
      shader.shaderFunc = shaderFunc
      code = rest
      if (shader.shaderFunc) {
        console.log('compiled shader')
      } else {
        console.log('no shader')
      }
    } catch (error) {
      console.error('Error compiling shader')
      console.error(error)
    }

    const result = await this.rpc('compile', { code })
    console.log('compiled sound: ', result)
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
const shader = new Shader(container)

let editor
const FILE_DELIMITER = '\n/* -^-^-^-^- */\n'
let label = 'lastV6'
let tracks = localStorage[label]
if (tracks) tracks = tracks.split(FILE_DELIMITER).map(track => JSON.parse(track))
else tracks = initial.map(value => ({ id: ((Math.random()*10e6)|0).toString(36), value }))

async function main () {
  const canvas = document.createElement('canvas')
  canvas.className = 'back-canvas'
  canvas.width = window.innerWidth*window.devicePixelRatio
  canvas.height = window.innerHeight*window.devicePixelRatio
  canvas.style.width = window.innerWidth + 'px'
  canvas.style.height = window.innerHeight + 'px'
  wavepot.data.plot.backCanvas = canvas.transferControlToOffscreen()
  wavepot.data.plot.width = window.innerWidth
  wavepot.data.plot.height = window.innerHeight
  wavepot.data.plot.pixelRatio = window.devicePixelRatio
  container.appendChild(canvas)

  editor = window.editor = new Editor({
    // font: '/fonts/mononoki-Regular.woff2',
    // font: '/fonts/ClassCoder.woff2',
    font: '/fonts/labmono-regular-web.woff2',
    id: tracks[0].id,
    value: tracks[0].value,
    fontSize: '10.5pt',
    padding: 3.5,
    titlebarHeight: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  })

  tracks.slice(1).forEach(data => editor.addSubEditor(data))

  let save = () => {
    localStorage[label] = tracks.map(track => JSON.stringify(track)).join(FILE_DELIMITER)
  }

  editor.ontoadd = () => {
    const id = (Math.random() * 10e6 | 0).toString(36)
    const value = 'bpm(120)\n\nmod(1/4).saw(50).exp(10).out().plot()\n'
    editor.addSubEditor({ id, value })
  }

  editor.onchange = (data) => {
    const track = tracks.find(editor => editor.id === data.id)
    if (track) track.value = data.value
    save()
  }
  editor.onremove = (data) => {
    const track = tracks.find(editor => editor.id === data.id)
    if (track) {
      tracks.splice(tracks.indexOf(track), 1)
    }
    save()
  }
  editor.onupdate = async () => {
//    localStorage[label] = editor.value
  }
  container.appendChild(editor.canvas)
  editor.parent = document.body
  editor.rect = editor.canvas.getBoundingClientRect()
  // TODO: cleanup this shit
  const events = registerEvents(document.body)
  editor.onsetup = () => {
    events.setTarget('focus', editor, { target: events.textarea, type: 'mouseenter' })

    // leave time to setup
    setTimeout(() => {
      editor.onadd = (data) => {
        tracks.push(data)
        save()
      }
    }, 1000)

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
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'

    shader.resize()
  }

  await wavepot.register(worker).setup()
}

let audio,
    audioBuffers,
    bufferSourceNode,
    bar = {},
    isPlaying = false,
    playNext = () => {}

let origSyncTime = 0
let animFrame = 0
let coeff = 1

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
      target.set(nextWorkerBuffer[i].subarray(0, bufferIndex))
    }

    let syncTime
    if (offsetTime) {
      syncTime = getSyncTime()
    } else {
      syncTime = origSyncTime = audio.currentTime + 1
    }

    console.log('schedule for:', syncTime - offsetTime)

    offsetTime = syncTime
    if (bufferSourceNode) {
      bufferSourceNode.stop(syncTime)
    }

    barSize = bufferIndex

    const duration = barSize / sampleRate

    coeff = sampleRate / barSize

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

  const startAnim = () => {
    const tick = () => {
      animFrame = requestAnimationFrame(tick)
      shader.time = (audio.currentTime - origSyncTime) * coeff
      shader.tick()
    }
    animFrame = requestAnimationFrame(tick)
  }

  const stopAnim = () => {
    shader.stop()
    cancelAnimationFrame(animFrame)
  }

  const start = () => {
    isPlaying = true
    playNext()
    startAnim()
    toggle = () => {
      bufferSourceNode?.stop(0)
      stopAnim()
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
