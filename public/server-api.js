import Shared32Array from './shared32array.js'

const API_URL = !location.port ? location.origin : 'http://localhost:3000'

const mode = 'cors'

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

export const URL = API_URL

export const recent = async () => {
  const url = API_URL + '/recent'

  const res = await fetch(url, { mode, headers })

  const json = await res.json()

  return json
}

export const load = async (title) => {
  const url = title[0] === '.' ? title : API_URL + '/' + title

  const res = await fetch(url, { mode, headers })

  const json = await res.json()

  return json
}

export const save = async (projectJson) => {
  const url = API_URL + '/' + projectJson.title

  const res = await fetch(url, {
    method: 'POST',
    mode,
    headers,
    body: JSON.stringify(projectJson, null, 2)
  })

  const json = await res.json()

  return json
}

let samples = new Map

export const fetchSample = async (audio, remoteUrl) => {
  const url = getFetchUrl(remoteUrl)

  let sample = samples.get(remoteUrl)

  if (!sample) {
    const res = await fetch(url)
    const arrayBuffer = await res.arrayBuffer()
    const audioBuffer = await audio.decodeAudioData(arrayBuffer)
    const floats = Array(audioBuffer.numberOfChannels).fill(0)
      .map((_, i) => audioBuffer.getChannelData(i))
    sample = floats.map(buf => {
      const shared = new Shared32Array(buf.length)
      shared.set(buf)
      return shared
    })
    samples.set(remoteUrl, sample)
  }

  return sample
}

export const getFetchUrl = (remoteUrl) => {
  const url = API_URL + '/fetch?url=' + encodeURIComponent(remoteUrl)
  return url
}
