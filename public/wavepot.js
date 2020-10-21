import Editor, { registerEvents } from './editor/editor.js'
import Shared32Array from './shared32array.js'
import Rpc from './rpc.js'
import * as Server from './server-api.js'
import initial from './initial.js'
import Shader from './shader/shader.js'
import ButtonLogo from './components/button-logo.js'
import ButtonPlay from './components/button-play.js'
import ButtonSave from './components/button-save.js'
import ButtonLike from './components/button-like.js'
import ButtonShare from './components/button-share.js'

self.IS_DEV = !!location.port && location.port != '3000'

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

  setColor ({ color }) {
    editor.setColor(color)
  }

  async fetchSample ({ url }) {
    const sample = await Server.fetchSample(audio, url)
    return { sample }
  }
}

const worker = new Worker(IS_DEV ? 'wavepot-worker.js' : 'wavepot-worker-build.js', { type: 'module' })
const wavepot = new Wavepot()
const shader = new Shader(container)

let editor
const FILE_DELIMITER = '\n/* -^-^-^-^- */\n'
let label = 'lastV10'
let tracks = localStorage[label]
if (!tracks) tracks = initial
tracks = tracks.split(FILE_DELIMITER).map(track => JSON.parse(track))
// else tracks = initial.map(value => ({ id: ((Math.random()*10e6)|0).toString(36), value }))

/* sidebar */
const sidebar = document.createElement('div')
sidebar.className = 'sidebar'

/* toolbar */
const toolbar = document.createElement('div')
toolbar.className = 'toolbar'
const playButton = new ButtonPlay(toolbar)
new ButtonSave(toolbar)
new ButtonLike(toolbar)
new ButtonShare(toolbar)
new ButtonLogo(toolbar)

/* tracklist */
self.focusTrack = id => {
  console.log('focus id', id)
  editor.setEditorById(id)
}
const trackList = document.createElement('ol')
trackList.className = 'track-list'
trackList.update = () => {
  trackList.innerHTML = tracks.map(track =>
    `<li class="track-list-item ${editor?.focusedEditor.id === track.id ? 'active' : ''}" onclick="focusTrack('${track.id}')">`
  + track.title.replaceAll('&','&amp;').replaceAll('<','&lt;')
  + '</li>'
  ).join('')
}
trackList.update()

sidebar.appendChild(toolbar)
sidebar.appendChild(trackList)
container.appendChild(sidebar)



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

  editor = window.editor = self.editor = new Editor({
    font: '/fonts/Hermit-Regular.woff2',
    // font: '/fonts/mononoki-Regular.woff2',
    // font: '/fonts/ClassCoder.woff2',
    // font: '/fonts/labmono-regular-web.woff2',
    id: tracks[0].id,
    title: tracks[0].title,
    value: tracks[0].value,
    fontSize: '11pt',
    padding: 6.5,
    titlebarHeight: 53,
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
  editor.onrename = (data) => {
    const track = tracks.find(editor => editor.id === data.id)
    if (track) {
      track.title = data.title
    }
    save()
  }
  editor.onfocus = (data) => {
    trackList.update()
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

const clock = document.createElement('div')
clock.className = 'clock'
const clockBar = document.createElement('div')
const clockBeat = document.createElement('div')
const clockSixt = document.createElement('div')
clock.appendChild(clockBar)
clock.appendChild(clockBeat)
clock.appendChild(clockSixt)
clockBar.textContent = '1'
clockBeat.textContent = '1'
clockSixt.textContent = '1'
container.appendChild(clock)

let audio,
    gainNode,
    audioBuffers,
    bufferSourceNode,
    bar = {},
    isPlaying = false,
    playNext = () => {}

let inputBuffer
let origSyncTime = 0
let animFrame = 0
let coeff = 1

const wave = document.createElement('canvas')
const wctx = wave.getContext('2d')
wave.className = 'wave'
wave.width = 250
wave.height = 52
wave.style.width = '125px'
wave.style.height = '26px'
wctx.scale(pixelRatio, pixelRatio)
container.appendChild(wave)

const drawWave = () => {
  let ctx = wctx
  let h = wave.height/2
  let w = wave.width/2
  ctx.clearRect(0,0,w,h)
  ctx.beginPath()
  ctx.strokeStyle = '#fff'
  if (!inputBuffer) {
    ctx.moveTo(0, h/2)
    ctx.lineTo(w, h/2)
    ctx.stroke()
    return
  }
  let b = inputBuffer.getChannelData(0)
  let co = b.length/w
  ctx.moveTo(0, (b[0]*0.5+.5)*h)
  for (let i = 0; i < w; i++) {
    ctx.lineTo(i, (b[(i*co)|0]*0.5+.5)*h)
  }
  ctx.stroke()
}

let toggle = async () => {
  audio = new AudioContext({
    numberOfChannels,
    sampleRate,
    latencyHint: 'playback' // without this audio glitches
  })

  gainNode = audio.createGain()
  gainNode.connect(audio.destination)

  const scriptGainNode = audio.createGain()
  scriptGainNode.connect(audio.destination)
  const scriptNode = audio.createScriptProcessor(2048, 1, 1)
  scriptNode.onaudioprocess = e => { inputBuffer = e.inputBuffer }
  scriptNode.connect(scriptGainNode)
  gainNode.connect(scriptNode)

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
    bufferSourceNode.connect(gainNode)
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
      clockBar.textContent =  Math.max(1, Math.floor(shader.time % 16) + 1)
      clockBeat.textContent = Math.max(1, Math.floor((shader.time*4) % 4) + 1)
      clockSixt.textContent = Math.max(1, Math.floor((shader.time*16) % 16) + 1)
      drawWave()
      shader.tick()
    }
    animFrame = requestAnimationFrame(tick)
  }

  const stopAnim = () => {
    shader.stop()
    cancelAnimationFrame(animFrame)
  }

  const start = () => {
    gainNode.gain.value = 1.0
    isPlaying = true
    playNext()
    startAnim()
    playButton.setIconPause()
    toggle = () => {
      playButton.setIconPlay()
      gainNode.gain.value = 0.0
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

playButton.onplay = () => {
  if (isPlaying) return
  editor.update(() => {
    wavepot.compile().then(() => {
      if (!isPlaying) {
        toggle()
      }
      playNext()
    })
  })
}
playButton.onpause = () => {
  if (!isPlaying) return
  toggle()
}
drawWave()
main() //.then(toggle)
