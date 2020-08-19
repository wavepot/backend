const dispatch = listeners => event =>
  listeners.forEach(fn => fn(event));

class SafeDynamicWorker {
  constructor (url) {
    this.url = url;

    this.ackId = 0;
    this.pendingAckMessages = [];

    this.listeners = {
      onerror: [this.reviveSafe.bind(this)],
      onmessage: [this.examineAck.bind(this)],
      onmessageerror: [],
      onfail: []
    };

    this.updateInstance();
  }

  dispatch (type, event) {
    dispatch(this.listeners[type])(event);
  }

  markAsSafe () {
    const prevSafe = this.safe;
    this.safe = this.worker;
    if (prevSafe && prevSafe !== this.safe) {
      setTimeout(() => {
        try {
          console.warn('safe: terminating previous safe worker');
          prevSafe.terminate();
        } catch (error) {
          console.error(error);
        }
      // give some time to finish operations
      // before forcefully terminating
      }, 5000);
    }
  }

  reviveSafe (err) {
    if (this.worker && this.worker.state !== 'failed') {
      this.worker.state = 'failed';
      this.unbindListeners();
      try {
        console.log('failed: terminating worker');
        this.worker.terminate();
      } catch (error) {
        console.error(error);
      }
      this.worker = null;
    }
    if (this.safe && this.worker !== this.safe && this.safe.state !== 'failed') {
      this.worker = this.safe;
      this.bindListeners();
      this.retryMessages();
    } else {
      // this.pendingAckMessages.splice(0)
      this.dispatch('onfail', new Error('Impossible to heal: ' + this.url));
    }
  }

  retryMessages () {
    this.pendingAckMessages.forEach(([msg, transfer]) => {
      this.worker.postMessage(msg, transfer);
    });
  }

  examineAck ({ data }) {
    if (data.ack) {
      this.pendingAckMessages =
      this.pendingAckMessages
        .filter(([msg]) =>
          msg.ackId !== data.ack);
    }
  }

  updateInstance () {
    if (this.worker) {
      this.unbindListeners();
      if (this.worker !== this.safe) {
        try {
          console.log('update: terminating previous worker');
          this.worker.terminate();
        } catch (error) {
          console.error(error);
        }
      }
    }
    this.worker = new Worker(this.url, { type: 'module' });
    this.bindListeners();
    this.retryMessages();
  }

  bindListeners () {
    this.worker.onerror = dispatch(this.listeners.onerror);
    this.worker.onmessage = dispatch(this.listeners.onmessage);
    this.worker.onmessageerror = dispatch(this.listeners.onmessageerror);
  }

  unbindListeners () {
    this.worker.onerror =
    this.worker.onmessage =
    this.worker.onmessageerror = null;
  }

  postMessage (message, transfer) {
    const payload = {
      ackId: ++this.ackId,
      message
    };
    this.pendingAckMessages.push([payload, transfer]);
    if (this.worker) {
      this.worker.postMessage(payload, transfer);
    }
  }

  set onerror (fn) {
    this.listeners.onerror.push(fn);
  }

  set onmessage (fn) {
    this.listeners.onmessage.push(fn);
  }

  set onmessageerror (fn) {
    this.listeners.onmessageerror.push(fn);
  }

  set onfail (fn) {
    this.listeners.onfail.push(fn);
  }
}

let callbackId = 0;
const callbacks = self.callbacks ?? new Map;
const isMain = typeof window !== 'undefined';
if (!isMain) self.callbacks = callbacks;

const rpcs = new Map;

const rpc = (url, method, args = []) => getRpc(url).rpc(method, args);
rpc.get = url => getRpc(url);
rpc.update = url => getRpc(url).worker.updateInstance();
rpc.markAsSafe = url => getRpc(url).worker.markAsSafe();
rpc.clear = () => rpcs.clear();
rpc.clearHanging = error => { [...callbacks.values()].forEach(fn => fn.reject(error)), callbacks.clear(); };
rpc.clearAll = () => (rpc.clear(), rpc.clearHanging());

const workers = self.workers ?? new Map;
if (!isMain) self.workers = workers;

class Rpc {
  constructor (url) {
    this.url = url;

    // here we distinguish between RPC instances
    // that run in Workers and RPC instances in the
    // main thread that interface as RPC workers
    if (new URL(url).protocol === 'main:') {
      this.worker = window[url].worker;
    } else {
      this.worker = workers.get(url);
      if (!this.worker) {
        this.worker = new SafeDynamicWorker(url);
        workers.set(url, this.worker);
        this.worker.onmessage = ({ data }) => {
          if (!data.call) return
          if (!(data.call in this)) {
            throw new ReferenceError('Rpc receive method not found: ' + data.call)
          }
          this[data.call](data);
        };
        this.worker.onmessageerror = error => rpc.onmessageerror?.(error, url);
        this.worker.onerror = error => rpc.onerror?.(error, url);
        this.worker.onfail = fail => rpc.onfail?.(fail, url);
      }
    }
  }

  async proxyRpc ({ url, callbackId, method, args }) {
    try {
      const result = await rpc(url, method, args);
      this.worker.postMessage({
        call: 'onreply',
        replyTo: callbackId,
        result
      });
    } catch (error) {
      this.worker.postMessage({
        call: 'onreply',
        replyTo: callbackId,
        error
      });
    }
  }

  rpc (method, args) {
    const cid = ++callbackId;

    const promise = Promise.race([
      new Promise((_, reject) => setTimeout(reject, 5000, new Error('rpc: Timed out.'))),
      new Promise((resolve, reject) =>
        callbacks.set(cid, { resolve, reject }))
    ]);

    this.worker.postMessage({
      call: method,
      callbackId,
      args
    });

    return promise
  }

  onerror ({ error }) {
    this.worker.dispatch('onerror', error);
    rpc.clearHanging(error);
  }

  onreply ({ replyTo, error, result }) {
    const callback = callbacks.get(replyTo);
    if (callback) {
      callbacks.delete(replyTo);
      if (error) {
        callback.reject(error);
      } else {
        callback.resolve(result);
      }
    }
  }
}

class RpcProxy {
  constructor (url) {
    this.url = url;
  }

  rpc (method, args) {
    const cid = ++callbackId;

    const promise = Promise.race([
      new Promise((_, reject) => setTimeout(reject, 5000, new Error('rpc: Timed out.'))),
      new Promise((resolve, reject) =>
        callbacks.set(cid, { resolve, reject }))
    ]);

    postMessage({
      call: 'proxyRpc',
      url: this.url,
      callbackId: cid,
      method,
      args
    });

    return promise
  }
}

const getRpc = url => {
  url = new URL(url, location.href).href;
  if (isMain) {
    if (!rpcs.has(url)) rpcs.set(url, new Rpc(url));
    return rpcs.get(url)
  } else {
    return new RpcProxy(url)
  }
};

const isMain$1 = typeof window !== 'undefined';

const install = self => {
  self.rpc = rpc;

  self.callbacks = self.callbacks ?? new Map;

  self.onmessage = async ({ data }) => {
    try {
      if (data.message.call === 'onreply') {
        const { replyTo, error, result } = data.message;
        const callback = self.callbacks.get(replyTo);
        if (callback) {
          self.callbacks.delete(replyTo);
          if (error) {
            callback.reject(error);
          } else {
            callback.resolve(result);
          }
        } else {
          console.warn('onreply discarded (receiver dead?)', replyTo, result ?? error, location.href);
        }
        self.postMessage({ ack: data.ackId });
        return
      }
      if (!(data.message.call in self.methods)) {
        throw new ReferenceError(
          'rpc: Method not found: ' + data.message.call)
      }
      const result = await self.methods[data.message.call](...data.message.args);
      self.postMessage({
        ack: data.ackId,
        call: 'onreply',
        replyTo: data.message.callbackId,
        result
      });
    } catch (error) {
      self.postMessage({
        ack: data.ackId,
        call: 'onreply',
        replyTo: data.message.callbackId,
        error
      });
      // self.postMessage({ call: 'onerror', error })
    }
  };

  self.onerror = (a, b, c, d, error) =>
    self.postMessage({ call: 'onerror', error });

  self.onunhandledrejection = error =>
    self.postMessage({ call: 'onerror', error: error.reason });
};

if (!isMain$1) {
  install(self);
}

class Shared32Array {
  constructor (length) {
    return new Float32Array(
      new SharedArrayBuffer(
        length * Float32Array.BYTES_PER_ELEMENT)
    )
  }
}

const isMain$2 = typeof window !== 'undefined';

const GC_THRESHOLD = 20 * 1000;

const buffers = new Map;

const garbageCollect = match => {
  const now = performance.now();
  for (const [key, buffer] of buffers.entries()) {
    if ((match && key.includes(match))
    || (now - buffer.accessedAt > GC_THRESHOLD)) {
      buffers.delete(key);
      // console.log('buffer service gc:', key)
    }
  }
  return true
};

const BufferService = {
  methods: {
    getBuffer: (checksum, size, channels = 2) => {
      const id = (checksum + size + channels).toString();
      let buffer = buffers.get(id);
      // console.log(id + ' buffer found:', !!buffer)
      // console.log([...buffers])
      // setTimeout(garbageCollect, 5*1000)
      if (buffer) {
        buffer.createdNow = false;
        buffer.accessedAt = performance.now();
        return buffer
      }
      buffer = Array.from(Array(channels), () => new Shared32Array(size));
      buffer.createdNow = true;
      buffer.accessedAt = performance.now();
      buffer.checksum = checksum;
      buffers.set(id, buffer);
      return buffer
    },

    clear: match => garbageCollect(match)
  },
  postMessage (data) {
    BufferService.worker.onmessage({ data });
  },
  worker: {
    postMessage (data) {
      BufferService.onmessage({ data: { ackId: -999999, message: data } });
    }
  }
};

if (isMain$2) {
  install(BufferService);
  window['main:buffer-service'] = BufferService;
  console.log('buffer service running');
}
// setInterval(garbageCollect, GC_INTERVAL)
