export default class Rpc {
  callbackId = 0
  callbacks = new Map

  constructor () {}

  postCall (method, data, tx) {
    this.port.postMessage({ call: method, ...data }, tx)
  }

  rpc (method, data, tx) {
    return new Promise((resolve, reject) => {
      const id = this.callbackId++

      this.callbacks.set(id, data => {
        this.callbacks.delete(id)
        if (data.error) reject(data.error)
        else resolve(data)
      })

      this.postCall(method, { data, callback: id }, tx)
    })
  }

  callback (data) {
    this.callbacks.get(data.responseCallback)(data.data ?? data)
  }

  register (port) {
    this.port = port

    this.port.addEventListener('message', async ({ data }) => {
      // console.log(data)
      if (!(data.call in this)) {
        throw new ReferenceError(data.call + ' is not a method')
      }

      let result
      try {
        if (data.call === 'callback') {
          result = await this[data.call](data)
        } else {
          result = await this[data.call](data.data ?? data)
        }
      } catch (error) {
        result = { error }
      }

      if ('callback' in data) {
        this.postCall('callback', { data: result, responseCallback: data.callback })
      }
    })

    this.port.addEventListener('error', error => {
      console.error(error)
      this.postCall('onerror', { error })
    })

    this.port.addEventListener('messageerror', error => {
      console.error(error)
      this.postCall('onmessageerror', { error })
    })

    return this
  }
}
