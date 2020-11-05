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
import ButtonEye from './components/button-eye.js'
import ButtonCode from './components/button-code.js'

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
      shader.shaderFunc = shaderFunc ?? shader.shaderFunc
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

const workerUrl = new URL(IS_DEV ? 'wavepot-worker.js' : 'wavepot-worker-build.js', import.meta.url).href
const worker = new Worker(workerUrl, { type: 'module' })
const wavepot = new Wavepot()
const shader = new Shader(container)

let editor
const FILE_DELIMITER = '\n/* -^-^-^-^- */\n'
let label = 'lastV10'
let tracks = localStorage[label]

/* sidebar */
const sidebar = document.createElement('div')
sidebar.className = 'sidebar'

/* toolbar */
const toolbar = document.createElement('div')
toolbar.className = 'toolbar'
const playButton = new ButtonPlay(toolbar)
const saveButton = new ButtonSave(toolbar)
new ButtonLike(toolbar)
new ButtonShare(toolbar)
const logoButton = new ButtonLogo(toolbar)
const eyeButton = new ButtonEye(toolbar)
let gfxActive = true
eyeButton.eye.addEventListener('click', () => {
  if (eyeButton.eye.classList.contains('active')) {
    eyeButton.eye.classList.remove('active')
    gfxActive = true
    document.querySelector('.back-canvas').style.display = 'block'
    document.querySelector('.shader-canvas').style.display = 'block'
  } else {
    eyeButton.eye.classList.add('active')
    gfxActive = false
    document.querySelector('.back-canvas').style.display = 'none'
    document.querySelector('.shader-canvas').style.display = 'none'
  }
})
const codeButton = new ButtonCode(toolbar)
codeButton.code.addEventListener('click', () => {
  if (codeButton.code.classList.contains('active')) {
    codeButton.code.classList.remove('active')
    document.querySelector('.editor').style.display = 'block'
    document.querySelector('.track-list').style.display = 'block'
  } else {
    codeButton.code.classList.add('active')
    document.querySelector('.editor').style.display = 'none'
    document.querySelector('.track-list').style.display = 'none'
  }
})

/* tracklist */
self.focusTrack = id => {
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

sidebar.appendChild(toolbar)
sidebar.appendChild(trackList)
container.appendChild(sidebar)


/* menu panel */
const menu = document.createElement('div')
menu.className = 'menu'
menu.innerHTML = `<div class="menu-inner">
<div class="menu-select">
<button id="startnew">start new project</button>
<button id="openinitial">load initial demo</button>
<button id="importjson">import from json</button>
<button id="exportjson">export to json</button>
<button id="record">record</button>
<!-- <div class="menu-select-item"><a href="#">browse</a></div>
<div class="menu-select-item"><a href="#">saves</a></div>
<div class="menu-select-item"><a href="#">favorites</a></div>
<div class="menu-select-item"><a href="#">tools</a></div>
<div class="menu-select-item"><a href="#">info</a></div> -->
</div>
</div>`
menu.style.display = 'none'
menu.querySelector('.menu-inner').addEventListener('mousedown', e => {
  e.stopPropagation()
  e.preventDefault()
}, { capture: true })
menu.querySelector('.menu-inner').addEventListener('click', e => {
  e.stopPropagation()
  e.preventDefault()
})
const menuHide = () => {
  menu.style.display = 'none'
  trackList.style.display = 'block'
}
menu.addEventListener('mousedown', e => {
  e.stopPropagation()
  e.preventDefault()
  menuHide()
})
container.appendChild(menu)
logoButton.onclick = () => {
  menu.style.display = 'grid'
  trackList.style.display = 'none'
}


async function main () {
  const loadFromUrl = async () => {
    if (location.pathname.split('/').length === 3) {
      tracks = await Server.load(location.pathname.slice(1))
      document.title = location.pathname.split('/').pop() + ' – wavepot'
    }
    if (editor) {
      editor.destroy()
      createEditor(tracks[0])
      tracks.slice(1).forEach(data => editor.addSubEditor(data))
    }
  }

  window.addEventListener('popstate', async () => {
    await loadFromUrl()
  })

  if (location.pathname.split('/').length === 3) {
    await loadFromUrl()
  } else {
    if (!tracks) tracks = initial
    tracks = tracks.split(FILE_DELIMITER).map(track => JSON.parse(track))
    // else tracks = initial.map(value => ({ id: ((Math.random()*10e6)|0).toString(36), value }))
  }

  trackList.update()

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

  const createEditor = track => {
    editor = window.editor = self.editor = new Editor({
      font: '/fonts/Hermit-Regular.woff2',
      // font: '/fonts/mononoki-Regular.woff2',
      // font: '/fonts/ClassCoder.woff2',
      // font: '/fonts/labmono-regular-web.woff2',
      id: track.id,
      title: track.title,
      value: track.value,
      fontSize: '11pt',
      padding: 6.5,
      titlebarHeight: 25.5,
      width: window.innerWidth,
      height: window.innerHeight,
    })
    editor.ontoadd = () => {
      const id = (Math.random() * 10e6 | 0).toString(36)
      const title = 'untitled - (ctrl+m to rename)'
      const value = 'bpm(120)\n\nmod(1/4).saw(50).exp(10).out().plot()\n'
      editor.addSubEditor({ id, title, value })
    }
    editor.onblockcomment = () => {
      play()
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
    editor.onsetup = () => {
      events.setTarget('focus', editor, { target: events.textarea, type: 'mouseenter' })

      // leave time to setup
      setTimeout(() => {
        editor.onadd = (data) => {
          tracks.push(data)
          save()
        }
      }, 1000)

      let keydown = e => {
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
          play()
          // editor.update(() => {
          //   wavepot.compile().then(() => {
          //     if (!isPlaying) {
          //       toggle()
          //     }
          //     playNext()
          //   })
          // })
          return false
        }
      }

      document.body.addEventListener('keydown', keydown, { capture: true })
      editor.ondestroy = () => {
        document.body.removeEventListener('keydown', keydown, { capture: true })
      }
    }
    container.appendChild(editor.canvas)
    editor.parent = document.body
    editor.rect = editor.canvas.getBoundingClientRect()
  }

  createEditor(tracks[0])

  menu.querySelector('#startnew').addEventListener('click', e => {
    menuHide()
    editor.destroy()
    tracks = [{
      id: (Math.random()*10e6|0).toString(36),
      title: 'untitled - (ctrl+m to rename)',
      value: 'bpm(120)\n\nmod(1/4).saw(50).exp(10).out().plot()\n'
    }]
    createEditor(tracks[0])
    save()
  }, { capture: true })
  menu.querySelector('#openinitial').addEventListener('click', e => {
    menuHide()
    editor.destroy()
    tracks = initial
    tracks = tracks.split(FILE_DELIMITER).map(track => JSON.parse(track))
    createEditor(tracks[0])
    tracks.slice(1).forEach(data => editor.addSubEditor(data))
    save()
  }, { capture: true })
  menu.querySelector('#importjson').addEventListener('click', e => {
    menuHide()
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = e => {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.readAsText(file, 'utf-8')
      reader.onload = async e => {
        editor.destroy()
        tracks = JSON.parse(e.target.result)
        createEditor(tracks[0])
        tracks.slice(1).forEach(data => editor.addSubEditor(data))
        save()
      }
    }
    input.click()
  }, { capture: true })
  menu.querySelector('#exportjson').addEventListener('click', e => {
    menuHide()
    const name = new Date().toISOString().replace(/[^0-9]/g, ' ').trim().split(' ').slice(0, -1).join('-') + '.json'
    const file = new File([JSON.stringify(tracks)], name, { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(file)
    a.download = name
    a.click()
  }, { capture: true })
  menu.querySelector('#record').addEventListener('click', e => {
    menuHide()
    play((time) => {
      const audioStreamDest = audio.createMediaStreamDestination()
      gainNode.connect(audioStreamDest)
      console.log('audio stream capture started')

      const canvasStream = shader.canvas.captureStream(25)
      console.log('canvas stream capture started')

      canvasStream.addTrack(audioStreamDest.stream.getAudioTracks()[0])
      console.log('merged streams')

      const mediaRecorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm;codecs=h264' })
      // mediaRecorder.ignoreMutedMedia = true

      const chunks = []
      mediaRecorder.ondataavailable = e => {
        chunks.push(e.data)
        console.log('data from media recorder:', chunks.length)
      }

      mediaRecorder.onstart = () => {
        console.log('started recording')
        setTimeout(() => {
          mediaRecorder.stop()
          toggle()
        }, 8000)
      }
      mediaRecorder.onstop = async function(evt) {
        console.log('stopped recording')
        const name = new Date().toISOString().replace(/[^0-9]/g, ' ').trim().split(' ').slice(0, -1).join('-') + '.mp4'
        let blob = new Blob(chunks, { type: 'video/webm;codecs=h264' })
        const arrayBuffer = await blob.arrayBuffer()
        await import('./ffmpeg/ffmpeg.min.js')
        const { createFFmpeg } = FFmpeg
        const ffmpeg = createFFmpeg({ log: true })
        await ffmpeg.load()
        await ffmpeg.write('record.webm', new Uint8Array(arrayBuffer))
        await ffmpeg.run('-i record.webm -c:v libx264 -preset veryslow -crf 17 -vf format=yuv420p,fps=25 -c:a aac -ar 44100 output.mp4')
        const data = ffmpeg.read('output.mp4')
        blob = new Blob([data.buffer], { type: 'video/mp4' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = name
        a.click()
      }
      console.log('schedule to start recording:', time)
      setTimeout(() => {
        mediaRecorder.start()
      }, time * 1000 - 100)
    })
  }, { capture: true })


  tracks.slice(1).forEach(data => editor.addSubEditor(data))

  let save = () => {
    localStorage[label] = tracks.map(track => JSON.stringify(track)).join(FILE_DELIMITER)
    history.pushState({}, '', '/') // edited, so no url to point to, this enables refresh to use localstorage
    document.title = 'wavepot'
  }
  let saveServer = async () => {
    const responseJson = await Server.save(tracks)
    history.pushState({}, '',
      '/p/' + responseJson.generatedId)
    document.title = responseJson.generatedId + ' – wavepot'
  }

  saveButton.onsave = () => {
    saveServer()
  }


  // TODO: cleanup this shit
  const events = registerEvents(document.body)

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
  let h = wave.height/pixelRatio
  let w = wave.width/pixelRatio
  ctx.clearRect(0,0,w,h)
  ctx.beginPath()
  ctx.lineWidth = Math.max(1, 1.6/pixelRatio)
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

let toggle = async (cb) => {
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

  playNext = async (cb) => {
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

    if (cb) cb(syncTime - audio.currentTime)
  }

  console.log('connected node')

  const onbar = () => {
    console.log('bar')
    playNext()
  }

  const startAnim = () => {
    const tick = () => {
      animFrame = requestAnimationFrame(tick)
      drawWave()
      if (!gfxActive) return
      shader.time = (audio.currentTime - origSyncTime) * coeff
      clockBar.textContent =  Math.max(1, Math.floor(shader.time % 16) + 1)
      clockBeat.textContent = Math.max(1, Math.floor((shader.time*4) % 4) + 1)
      clockSixt.textContent = Math.max(1, Math.floor((shader.time*16) % 16) + 1)
      shader.tick()
    }
    animFrame = requestAnimationFrame(tick)
  }

  const stopAnim = () => {
    shader.stop()
    cancelAnimationFrame(animFrame)
  }

  const start = (cb) => {
    gainNode.gain.value = 1.0
    isPlaying = true
    playNext(cb)
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

  start(cb)
}

const play = (cb) => {
  editor.update(() => {
    wavepot.compile().then(() => {
      if (!isPlaying) {
        toggle(cb)
      }
      playNext(cb)
    })
  })
}
playButton.onplay = () => {
  if (isPlaying) return
  play()
}
playButton.onpause = () => {
  if (!isPlaying) return
  toggle()
}
drawWave()
main() //.then(toggle)
