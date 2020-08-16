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
    this.safe = this.worker;
  }

  reviveSafe (err) {
    if (this.worker && this.worker.state !== 'failed') {
      this.worker.state = 'failed';
      this.unbindListeners();
      try { this.worker.terminate(); } catch {}
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
        try { this.worker.terminate(); } catch {}
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

var randomId = (n = 6) => Array(n).fill().map(() => (16*Math.random()|0).toString(16)).join``;

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

class Rpc {
  constructor (url) {
    this.url = url;
    this.worker = new SafeDynamicWorker(url);
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

var atomic = (innerFn, { recentOnly = false, timeout = 5000 } = {}) => {
  let queue = [];

  let lock = false;

  const atomicWrapperFn = async (...args) => {
    if (lock) {
      return new Promise((resolve, reject) =>
        queue.push([resolve, reject, args]))
    }
    lock = true;
    let result;
    try {
      if (timeout) {
        result = await Promise.race([
          new Promise((resolve, reject) => setTimeout(reject, timeout, new Error('atomic: Timed out.'))),
          innerFn(...args)
        ]);
      } else {
        result = await innerFn(...args);
      }
    } catch (error) {
      // lock = false
      result = error;
      // console.log('ERROR WRAPPED', innerFn)
      const slice = queue.slice();
      queue = [];
      slice.forEach(([resolve, reject]) => reject(new Error('Queue discarded.')));
      // queue = []
    }
    lock = false;
    if (queue.length) {
      if (recentOnly) {
        const [resolve, reject, _args] = queue.pop();
        const slice = queue.slice();
        queue = [];
        slice.forEach(([resolve, reject]) => reject(new Error('atomic: Queue discarded.')));
        atomicWrapperFn(..._args).then(resolve, reject).catch(reject);
      } else {
        const [resolve, reject, _args] = queue.shift();
        atomicWrapperFn(..._args).then(resolve, reject).catch(reject);
      }
    }
    if (result instanceof Error) return Promise.reject(result)
    return result
  };

  atomicWrapperFn.innerFn = innerFn;

  return atomicWrapperFn
};

const checksumOf = (obj, ...args) => {
  if (args.length > 0) return serialize.array([obj, ...args])
  else return serialize[typeOf(obj)](obj, 10)
};

const serialize = {
  object: obj => {
    let sum = '';
    for (const key in obj) {
      if (key === 'n') continue
      if (key === 'buffer') continue
      if (key[0] === '_') continue
      if (obj[key] === undefined) {
        console.warn(key);
        continue
      }
      // console.log(key)
      sum += key + '=' + checksumOf(obj[key]) + ' ';
    }
    return sum
  },

  array: (array, limit = Infinity) => {
    if (array.length > limit) {
      return array.length
    } else {
      return array.map(el => checksumOf(el)).join(' ')
    }
  },

  string: string => string,

  number: number => number.toString(),

  function: fn => {
    if (fn.innerFn) return serialize.object(fn) + checksumOf(fn.innerFn)
    return serialize.object(fn) + fn.toString()
  },

  // undefined: x => console.warn('undefined found'),

  unknown: unknown => unknown.toString()
};

const typeOf = obj => {
  const type = typeof obj;

  if (type === 'object') {
    if (obj[0] != null) return 'array'
    else if (obj == null) return 'null'
    else return type
  } else if (type === 'string') {
    return type
  } else if (type === 'number') {
    return type
  } else if (type === 'function') {
    return type
  } else {
    return 'unknown'
  }
};

var Hyper = ({
  context: top,
  execute,
  mergeDown = Object.assign,
  mergeSide = Object.assign,
  mergeUp = x => x
}) => {
  const fnMap = new Map;
  const proto = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(top));
  const desc = Object.getOwnPropertyDescriptors(top);

  const createHyperFn = parent => {
    const context = { ...parent, parent };

    const fn = atomic(async (...args) => {
      const fns = args
        .filter(arg => typeof arg === 'function')
        .map(_fn => [
          _fn,
          mergeDown(
            mergeDown(createHyperFn(_fn), fn),
            ...args
          )
        ]);

      let lastSiblingHyperFn = null;
      for (const [_fn, hyperFn] of fns) {
        const checksum = checksumOf(_fn, fn);
        if (!fnMap.has(checksum)) {
          if (_fn.constructor.name === 'AsyncFunction') {
            const result = await execute(_fn, hyperFn);
            if (Array.isArray(result)) {
              fnMap.set(checksum, fn =>
                fn(...mergeDown(result, ...args))
              );
            } else {
              fnMap.set(checksum, typeof result === 'function' ? result : () => {});
            }
          } else {
            fnMap.set(checksum, _fn);
          }
        }

        await execute(
          fnMap.get(checksum),
          mergeSide(hyperFn, lastSiblingHyperFn)
        );

        lastSiblingHyperFn = hyperFn;
      }

      mergeUp(fn, lastSiblingHyperFn);
    }, { recentOnly: true });

    Object.defineProperties(fn, desc);
    mergeDown(fn, context);
    Object.defineProperties(fn, proto);

    fn.innerFn = parent;

    return fn
  };

  return createHyperFn(top)
};

var assertFinite = n => {
  if (Number.isFinite(n)) return n
  else throw new TypeError(`Not a finite number value: ${n}`)
};

var render = async (fn, context) => {
  const { buffer } = context;
  const numOfChannels = buffer.length;

// console.log('N IS', context.n, context.frame)
  assertFinite(context.n);

  if (numOfChannels > 2) {
    throw new RangeError('unsupported number of channels [' + numOfChannels + ']')
  }

  // context.prepare()
  // context.tick()

  const result = await fn(context, context, context);
// console.log('N IS', context.n)
  if (typeof result === 'object' && '0' in result && typeof result[0] === 'number') {
    if (numOfChannels === 1) {
      buffer[0][0] = (
        assertFinite(result[0])
      + assertFinite(result[1])
      ) / 2;
    } else {
      buffer[0][0] = assertFinite(result[0]);
      buffer[1][0] = assertFinite(result[1]);
    }
    context.tick();
    renderStereo(fn, context);
    return context
  } else if (typeof result === 'number') {
    // console.log('result is', result, context.toJSON())
    buffer[0][0] = assertFinite(result) / numOfChannels;
    context.tick();
    renderMono(fn, context);
    if (numOfChannels === 2) {
      buffer[1].set(buffer[0]);
    }
    return context
  }

  return result
};

const renderMono = (fn, context) => {
  const { buffer } = context;
  const { length } = buffer[0];
  const numOfChannels = buffer.length;

  if (numOfChannels === 1) {
    for (let i = 1; i < length; i++, context.tick()) {
      buffer[0][i] = assertFinite(fn(context, context, context));
    }
  } else {
    for (let i = 1; i < length; i++, context.tick()) {
      buffer[0][i] = assertFinite(fn(context, context, context)) / 2;
    }
  }
};

const renderStereo = (fn, context) => {
  const { buffer } = context;
  const { length } = buffer[0];
  const numOfChannels = buffer.length;

  let sample = [];

  if (numOfChannels === 1) {
    for (let i = 1; i < length; i++, context.tick()) {
      sample = fn(context, context, context);
      buffer[0][i] = (
        assertFinite(sample[0])
      + assertFinite(sample[1])
      ) / 2;
    }
  } else {
    for (let i = 1; i < length; i++, context.tick()) {
      sample = fn(context, context, context);
      buffer[0][i] = assertFinite(sample[0]);
      buffer[1][i] = assertFinite(sample[1]);
    }
  }
};

const isMain$1 = typeof window !== 'undefined';

const THREAD_URL = new URL('mix-worker-thread.js', import.meta.url).href;
const BUFFER_SERVICE_URL = new URL('buffer-service.js', import.meta.url).href;

const mixWorker = (url, context) => {
  const rpcUrl = getRpcUrl(url);
  return Promise.race([
    new Promise((resolve, reject) => setTimeout(reject, 5000, new Error('mixWorker: Timed out'))),
    rpc(rpcUrl, 'render', [url, context.toJSON?.() ?? context]).then(result => {
      if (isMain$1) rpc.markAsSafe(rpcUrl);
      return result
    })
  ])
};

rpc.onfail = rpc.onerror = (error, url) => mixWorker.onerror?.(error, url);

mixWorker.update = url => {
  // rpc(BUFFER_SERVICE_URL, 'clear', [url])
  rpc.update(getRpcUrl(url));
};
mixWorker.clear = () => rpc.clearAll();

const getRpcUrl = url => {
  url = new URL(url, location.href).href;
  return THREAD_URL + '?' + encodeURIComponent(url)
};

var mixBuffers = (target, ...sources) => {
  // console.log('mixing', source[0].length, '>', target[0].length)
  const tl = target[0].length;
  sources.forEach(source => {
    let sl, rl;
    if (Array.isArray(source[0])) { // [buffer,length]
      sl = (source[0][0].length * source[1])|0;
      source = source[0];
      rl = source[0].length;
    } else {
      sl = rl = source[0].length;
    }
    if (target.length === 2) {
      if (source.length === 2) { // stereo to stereo
        for (let x = 0; x < tl; x++) {
          target[0][x%tl] += source[0][x%sl%rl];
          target[1][x%tl] += source[1][x%sl%rl];
        }
      } else if (source.length === 1) { // mono to stereo
        for (let x = 0; x < tl; x++) {
          target[0][x%tl] += source[0][x%sl%rl]/2;
          target[1][x%tl] += source[0][x%sl%rl]/2;
        }
      }
    } else if (target.length === 1) {
      if (source.length === 2) { // stereo to mono
        for (let x = 0; x < tl; x++) {
          target[0][x%tl] += (source[0][x%sl%rl] + source[1][x%sl%rl])/2;
        }
      } else if (source.length === 1) { // mono to mono
        for (let x = 0; x < tl; x++) {
          target[0][x%tl] += source[0][x%sl%rl];
        }
      }
    }
  });
  return target
};

const BUFFER_SERVICE_URL$1 = new URL('buffer-service.js', import.meta.url).href;

// const INTEGRATORS = {
//   // global frame position
//   n: c => c.frame,
//   // local frame position
//   p: c => c.position,

//   // global time = since user hit play
//   // global time in seconds: s=1=1 sec
//   s: c => (1+c.frame) / c.sampleRate,
//   // global time beat synced: b=1=1 beat
//   b: c => (1+c.frame) / c.beatRate,

//   // local time = since begin of this buffer
//   // local time in seconds (since the start of this buffer)
//   t: c => (1+c.position) / c.sampleRate,
//   // local time beat synced: k=1=1 beat (since the start of this buffer)
//   k: c => (1+c.position) / c.beatRate,

//   // current frame sample value of current scope buffer
//   x: c => +c.input
// }

class Context {
  static nonEnumerableProps (context) {
    return {
      // n: 0, // global frame position
      c: context,
      parent: null,
      p: 0, // local frame position
      s: 0,
      b: 0,
      t: 0,
      k: 0,
      n1: 1,
      p1: 1,
      sr: 44100,
      br: 44100,
    }
  }

  constructor (data) {
    this.id = randomId();

    this.bpm = 60;
    this.beatRate = 44100;
    this.sampleRate = 44100;

    Object.entries(this.constructor.nonEnumerableProps(this))
      .forEach(([key, value]) => {
        Object.defineProperty(this, key, {
          value,
          writable: true,
          enumerable: false,
          configurable: false
        });
      });

    // Object.keys(INTEGRATORS).forEach(key => {
    //   const contextKey = '__' + key
    //   Object.defineProperty(this, key, {
    //     get () {
    //       if (contextKey in this) {
    //         return this[contextKey]
    //       } else {
    //         const newContext = typeof this === 'function'
    //           ? this.clone({ ig: key, ref: this.ref })
    //           : new Context({ ...this, ig: key, ref: this.ref })

    //         Object.defineProperty(this, contextKey, {
    //           value: newContext,
    //           writable: false,
    //           enumerable: false,
    //           configurable: false
    //         })

    //         return this[contextKey]
    //       }
    //     },
    //     set (value) {
    //       if (key === 'n') {
    //         this.frame = value
    //       } else {
    //         throw new TypeError('Attempt to rewrite integrator: ' + key)
    //       }
    //     },
    //     enumerable: false,
    //     configurable: false
    //   })
    // })

    Object.assign(this, data);

    this.prepare();
  }

  // public api

  async buf ({ id = '', len = this.buffer[0].length, ch = this.buffer.length } = {}) {
    return (await rpc(BUFFER_SERVICE_URL$1, 'getBuffer', [
      id+checksumOf(this),
      len|0,
      ch|0
    ]))
  }

  zero (buffer = this.buffer) {
    buffer.forEach(b => b.fill(0));
    return buffer
  }

  src (url, params = {}) {
    const targetUrl = new URL(url, this.url ?? location.href).href;
    const context = Object.assign(this.toJSON(), params, { url: targetUrl });
      // const checksum = c.checksum

      // if (checksums[c.url + c.id] === checksum) return

      // checksums[c.url + c.id] = checksum
    // console.log('here!')
    return mixWorker(targetUrl, context).then(result => {
      result.update = c => { c.src(url, params); };
      return result
    })
  }

  mix(...args) {
    return mixBuffers(...args)
  }

  // internals

  prepare () {
    this.c = this;

    this.sr = this.sampleRate;
    this.br = this.beatRate;

    this.n = this.n ?? 0;
    this.p = 0;

    this.n1 = this.n+1;
    this.p1 = this.p+1;

    this.s = this.n1 / this.sr;
    this.b = this.n1 / this.br;

    this.t = this.p1 / this.sr;
    this.k = this.p1 / this.br;
  }

  tick () {
    this.n = ++this.n;
    this.p = ++this.p;

    this.n1 = this.n+1;
    this.p1 = this.p+1;

    this.s = this.n1 / this.sr;
    this.b = this.n1 / this.br;

    this.t = this.p1 / this.sr;
    this.k = this.p1 / this.br;
  }

  // get checksum () {
  //   return checksumOf(this)
  // }

  // set checksum (value) {
  //   /* ignore */
  // }

  get bufferSize () { return this.buffer[0].length }

  // get c () { return this }
  // get sr () { return this.sampleRate }
  // get br () { return this.beatRate }

  toJSON () {
    const json = {};
    // this.prepare()
    for (const key in this) {
      if (key[0] === '_') continue
      if (typeof this[key] !== 'function') {
        json[key] = this[key];
      }
    }
    // delete json.g
    // delete json.worker
    // delete json.parent
    // json.n = this.n
    // json.frame = this.frame
    // json.checksum = this.checksum
    return json
  }

  // input=L+R of current buffer frame
  // input[0]=L
  // input[1]=R if stereo, otherwise L
  get input () {
    return [
      this.buffer[0][this.p],
      this.buffer[1]?.[this.p]??this.buffer[0][this.p]
    ]
  }

  get x () {
    return this.buffer[0][this.p]
      + (this.buffer[1]?.[this.p]??0)
  }
}

var Mix = context => {
  return Hyper({
    context: new Context(context),
    execute: render,
    mergeSide,
    mergeUp,
  })
};

const mergeUp = (...a) => {
  let ub, db;
  for (let u = a.length-1; u >= 1; u--) {
    for (let d = u-1; d >= 0; d--) {
      ub = a[u].buffer;
      db = a[d].buffer;
      if (ub !== db) {
        mixBuffers(db, ub);
      }
    }
  }
  return a[0]
};

const mergeSide = (...a) => {
  a = a.filter(x => typeof x !== 'string');
  for (let r = a.length-1; r >= 1; r--) {
    let l = r-1;
    for (let key in a[r]) {
      // sibling iteration shouldn't copy `frame`
      // i.e it should begin at the parent's
      //     position
      // if (key === 'n' || key === 'p') continue

      a[l][key] = a[r][key];
    }
  }
  return a[0]
};

self.hasSetup = false;
self.contexts = new Map;

const render$1 = async (context) => {
  let mix = self.contexts.get(context.id);

  if (!mix
  || mix.buffer.length !== context.buffer.length
  || mix.buffer[0].length !== context.buffer[0].length) {
    mix = Mix(context, {
      buffer: context.buffer
        .map(buffer => buffer.slice()) }); //new Float32Array(buffer.length)) })

    self.contexts.set(context.id, mix);
  }

  await mix(self.fn, context, { buffer: mix.buffer });

  context.buffer
    .forEach((buffer, i) => buffer.set(mix.buffer[i]));

  return context.buffer
};

const setup = async (url, context) => {
  self.url = url;
  self.fn = (await import(self.url)).default;

  // test a render
  await render$1({
    ...context,
    id: 'test',
    url: self.url,
    buffer: [
      new Float32Array(4),
      new Float32Array(4)
    ]
  });

  self.hasSetup = true;
};

self.methods = {
  render: atomic(async (url, context) => {
    if (!self.hasSetup) {
      await setup(url, context);
    }
    return render$1(context)
  })
};
