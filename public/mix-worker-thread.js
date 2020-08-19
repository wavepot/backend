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
      this.bindListeners();
    } else {
      this.worker = workers.get(url);
      if (!this.worker) {
        this.worker = new SafeDynamicWorker(url);
        workers.set(url, this.worker);
        this.bindListeners();
      }
    }
  }

  bindListeners () {
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
      new Promise((_, reject) => setTimeout(reject, 30000, new Error('rpc: Timed out.'))),
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
      new Promise((_, reject) => setTimeout(reject, 30000, new Error('rpc: Timed out.'))),
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
  atomicWrapperFn.setTimeout = ms => { timeout = ms; };

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
      fn.setTimeout(5000);

      if (parent === top) mergeDown(fn, ...args);

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
    }, { recentOnly: true, timeout: 60000 });

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

  let result;
  if (fn.constructor.name === 'AsyncFunction') {
    result = await fn(context, context, context);
  } else {
    result = fn(context, context, context);
  }
  if (result instanceof Promise) {
    await result;
    context.tickBar();
    return
  }

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

const r=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t);}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

function FFT(size, shared = false) {
  this.shared = shared;

  this.size = size | 0;
  if (this.size <= 1 || (this.size & (this.size - 1)) !== 0)
    throw new Error('FFT size must be a power of two and bigger than 1');

  this._csize = size << 1;

  // NOTE: Use of `var` is intentional for old V8 versions
  var table = new Float32Array(this.size * 2);
  for (var i = 0; i < table.length; i += 2) {
    const angle = Math.PI * i / this.size;
    table[i] = Math.cos(angle);
    table[i + 1] = -Math.sin(angle);
  }
  this.table = table;

  // Find size's power of two
  var power = 0;
  for (var t = 1; this.size > t; t <<= 1)
    power++;

  // Calculate initial step's width:
  //   * If we are full radix-4 - it is 2x smaller to give inital len=8
  //   * Otherwise it is the same as `power` to give len=4
  this._width = power % 2 === 0 ? power - 1 : power;

  // Pre-compute bit-reversal patterns
  this._bitrev = new Float32Array(1 << this._width);
  for (var j = 0; j < this._bitrev.length; j++) {
    this._bitrev[j] = 0;
    for (var shift = 0; shift < this._width; shift += 2) {
      var revShift = this._width - shift - 2;
      this._bitrev[j] |= ((j >>> shift) & 3) << revShift;
    }
  }

  this._out = null;
  this._data = null;
  this._inv = 0;
}
module.exports = FFT;

FFT.prototype.fromComplexArray = function fromComplexArray(complex, storage) {
  var res = storage || new Float32Array(complex.length >>> 1);
  for (var i = 0; i < complex.length; i += 2)
    res[i >>> 1] = complex[i];
  return res;
};

FFT.prototype.createComplexArray = function createComplexArray() {
  let res;
  if (this.shared) {
    const buffer = new SharedArrayBuffer(this._csize * Float32Array.BYTES_PER_ELEMENT);
    res = new Float32Array(buffer);
  } else {
    res = new Float32Array(this._csize);
  }
  // for (var i = 0; i < res.length; i++)
    // res[i] = 0;
  return res;
};

FFT.prototype.toComplexArray = function toComplexArray(input, storage) {
  var res = storage || this.createComplexArray();
  for (var i = 0; i < res.length; i += 2) {
    res[i] = input[i >>> 1];
    // res[i + 1] = 0;
  }
  return res;
};

FFT.prototype.completeSpectrum = function completeSpectrum(spectrum) {
  var size = this._csize;
  var half = size >>> 1;
  for (var i = 2; i < half; i += 2) {
    spectrum[size - i] = spectrum[i];
    spectrum[size - i + 1] = -spectrum[i + 1];
  }
};

FFT.prototype.transform = function transform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 0;
  this._transform4();
  this._out = null;
  this._data = null;
};

FFT.prototype.realTransform = function realTransform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 0;
  this._realTransform4();
  this._out = null;
  this._data = null;
};

FFT.prototype.inverseTransform = function inverseTransform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 1;
  this._transform4();
  for (var i = 0; i < out.length; i++)
    out[i] /= this.size;
  this._out = null;
  this._data = null;
};

// radix-4 implementation
//
// NOTE: Uses of `var` are intentional for older V8 version that do not
// support both `let compound assignments` and `const phi`
FFT.prototype._transform4 = function _transform4() {
  var out = this._out;
  var size = this._csize;

  // Initial step (permute and transform)
  var width = this._width;
  var step = 1 << width;
  var len = (size / step) << 1;

  var outOff;
  var t;
  var bitrev = this._bitrev;
  if (len === 4) {
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleTransform2(outOff, off, step);
    }
  } else {
    // len === 8
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleTransform4(outOff, off, step);
    }
  }

  // Loop through steps in decreasing order
  var inv = this._inv ? -1 : 1;
  var table = this.table;
  for (step >>= 2; step >= 2; step >>= 2) {
    len = (size / step) << 1;
    var quarterLen = len >>> 2;

    // Loop through offsets in the data
    for (outOff = 0; outOff < size; outOff += len) {
      // Full case
      var limit = outOff + quarterLen;
      for (var i = outOff, k = 0; i < limit; i += 2, k += step) {
        const A = i;
        const B = A + quarterLen;
        const C = B + quarterLen;
        const D = C + quarterLen;

        // Original values
        const Ar = out[A];
        const Ai = out[A + 1];
        const Br = out[B];
        const Bi = out[B + 1];
        const Cr = out[C];
        const Ci = out[C + 1];
        const Dr = out[D];
        const Di = out[D + 1];

        // Middle values
        const MAr = Ar;
        const MAi = Ai;

        const tableBr = table[k];
        const tableBi = inv * table[k + 1];
        const MBr = Br * tableBr - Bi * tableBi;
        const MBi = Br * tableBi + Bi * tableBr;

        const tableCr = table[2 * k];
        const tableCi = inv * table[2 * k + 1];
        const MCr = Cr * tableCr - Ci * tableCi;
        const MCi = Cr * tableCi + Ci * tableCr;

        const tableDr = table[3 * k];
        const tableDi = inv * table[3 * k + 1];
        const MDr = Dr * tableDr - Di * tableDi;
        const MDi = Dr * tableDi + Di * tableDr;

        // Pre-Final values
        const T0r = MAr + MCr;
        const T0i = MAi + MCi;
        const T1r = MAr - MCr;
        const T1i = MAi - MCi;
        const T2r = MBr + MDr;
        const T2i = MBi + MDi;
        const T3r = inv * (MBr - MDr);
        const T3i = inv * (MBi - MDi);

        // Final values
        const FAr = T0r + T2r;
        const FAi = T0i + T2i;

        const FCr = T0r - T2r;
        const FCi = T0i - T2i;

        const FBr = T1r + T3i;
        const FBi = T1i - T3r;

        const FDr = T1r - T3i;
        const FDi = T1i + T3r;

        out[A] = FAr;
        out[A + 1] = FAi;
        out[B] = FBr;
        out[B + 1] = FBi;
        out[C] = FCr;
        out[C + 1] = FCi;
        out[D] = FDr;
        out[D + 1] = FDi;
      }
    }
  }
};

// radix-2 implementation
//
// NOTE: Only called for len=4
FFT.prototype._singleTransform2 = function _singleTransform2(outOff, off,
                                                             step) {
  const out = this._out;
  const data = this._data;

  const evenR = data[off];
  const evenI = data[off + 1];
  const oddR = data[off + step];
  const oddI = data[off + step + 1];

  const leftR = evenR + oddR;
  const leftI = evenI + oddI;
  const rightR = evenR - oddR;
  const rightI = evenI - oddI;

  out[outOff] = leftR;
  out[outOff + 1] = leftI;
  out[outOff + 2] = rightR;
  out[outOff + 3] = rightI;
};

// radix-4
//
// NOTE: Only called for len=8
FFT.prototype._singleTransform4 = function _singleTransform4(outOff, off,
                                                             step) {
  const out = this._out;
  const data = this._data;
  const inv = this._inv ? -1 : 1;
  const step2 = step * 2;
  const step3 = step * 3;

  // Original values
  const Ar = data[off];
  const Ai = data[off + 1];
  const Br = data[off + step];
  const Bi = data[off + step + 1];
  const Cr = data[off + step2];
  const Ci = data[off + step2 + 1];
  const Dr = data[off + step3];
  const Di = data[off + step3 + 1];

  // Pre-Final values
  const T0r = Ar + Cr;
  const T0i = Ai + Ci;
  const T1r = Ar - Cr;
  const T1i = Ai - Ci;
  const T2r = Br + Dr;
  const T2i = Bi + Di;
  const T3r = inv * (Br - Dr);
  const T3i = inv * (Bi - Di);

  // Final values
  const FAr = T0r + T2r;
  const FAi = T0i + T2i;

  const FBr = T1r + T3i;
  const FBi = T1i - T3r;

  const FCr = T0r - T2r;
  const FCi = T0i - T2i;

  const FDr = T1r - T3i;
  const FDi = T1i + T3r;

  out[outOff] = FAr;
  out[outOff + 1] = FAi;
  out[outOff + 2] = FBr;
  out[outOff + 3] = FBi;
  out[outOff + 4] = FCr;
  out[outOff + 5] = FCi;
  out[outOff + 6] = FDr;
  out[outOff + 7] = FDi;
};

// Real input radix-4 implementation
FFT.prototype._realTransform4 = function _realTransform4() {
  var out = this._out;
  var size = this._csize;

  // Initial step (permute and transform)
  var width = this._width;
  var step = 1 << width;
  var len = (size / step) << 1;

  var outOff;
  var t;
  var bitrev = this._bitrev;
  if (len === 4) {
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleRealTransform2(outOff, off >>> 1, step >>> 1);
    }
  } else {
    // len === 8
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleRealTransform4(outOff, off >>> 1, step >>> 1);
    }
  }

  // Loop through steps in decreasing order
  var inv = this._inv ? -1 : 1;
  var table = this.table;
  for (step >>= 2; step >= 2; step >>= 2) {
    len = (size / step) << 1;
    var halfLen = len >>> 1;
    var quarterLen = halfLen >>> 1;
    var hquarterLen = quarterLen >>> 1;

    // Loop through offsets in the data
    for (outOff = 0; outOff < size; outOff += len) {
      for (var i = 0, k = 0; i <= hquarterLen; i += 2, k += step) {
        var A = outOff + i;
        var B = A + quarterLen;
        var C = B + quarterLen;
        var D = C + quarterLen;

        // Original values
        var Ar = out[A];
        var Ai = out[A + 1];
        var Br = out[B];
        var Bi = out[B + 1];
        var Cr = out[C];
        var Ci = out[C + 1];
        var Dr = out[D];
        var Di = out[D + 1];

        // Middle values
        var MAr = Ar;
        var MAi = Ai;

        var tableBr = table[k];
        var tableBi = inv * table[k + 1];
        var MBr = Br * tableBr - Bi * tableBi;
        var MBi = Br * tableBi + Bi * tableBr;

        var tableCr = table[2 * k];
        var tableCi = inv * table[2 * k + 1];
        var MCr = Cr * tableCr - Ci * tableCi;
        var MCi = Cr * tableCi + Ci * tableCr;

        var tableDr = table[3 * k];
        var tableDi = inv * table[3 * k + 1];
        var MDr = Dr * tableDr - Di * tableDi;
        var MDi = Dr * tableDi + Di * tableDr;

        // Pre-Final values
        var T0r = MAr + MCr;
        var T0i = MAi + MCi;
        var T1r = MAr - MCr;
        var T1i = MAi - MCi;
        var T2r = MBr + MDr;
        var T2i = MBi + MDi;
        var T3r = inv * (MBr - MDr);
        var T3i = inv * (MBi - MDi);

        // Final values
        var FAr = T0r + T2r;
        var FAi = T0i + T2i;

        var FBr = T1r + T3i;
        var FBi = T1i - T3r;

        out[A] = FAr;
        out[A + 1] = FAi;
        out[B] = FBr;
        out[B + 1] = FBi;

        // Output final middle point
        if (i === 0) {
          var FCr = T0r - T2r;
          var FCi = T0i - T2i;
          out[C] = FCr;
          out[C + 1] = FCi;
          continue;
        }

        // Do not overwrite ourselves
        if (i === hquarterLen)
          continue;

        // In the flipped case:
        // MAi = -MAi
        // MBr=-MBi, MBi=-MBr
        // MCr=-MCr
        // MDr=MDi, MDi=MDr
        var ST0r = T1r;
        var ST0i = -T1i;
        var ST1r = T0r;
        var ST1i = -T0i;
        var ST2r = -inv * T3i;
        var ST2i = -inv * T3r;
        var ST3r = -inv * T2i;
        var ST3i = -inv * T2r;

        var SFAr = ST0r + ST2r;
        var SFAi = ST0i + ST2i;

        var SFBr = ST1r + ST3i;
        var SFBi = ST1i - ST3r;

        var SA = outOff + quarterLen - i;
        var SB = outOff + halfLen - i;

        out[SA] = SFAr;
        out[SA + 1] = SFAi;
        out[SB] = SFBr;
        out[SB + 1] = SFBi;
      }
    }
  }
};

// radix-2 implementation
//
// NOTE: Only called for len=4
FFT.prototype._singleRealTransform2 = function _singleRealTransform2(outOff,
                                                                     off,
                                                                     step) {
  const out = this._out;
  const data = this._data;

  const evenR = data[off];
  const oddR = data[off + step];

  const leftR = evenR + oddR;
  const rightR = evenR - oddR;

  out[outOff] = leftR;
  out[outOff + 1] = 0;
  out[outOff + 2] = rightR;
  out[outOff + 3] = 0;
};

// radix-4
//
// NOTE: Only called for len=8
FFT.prototype._singleRealTransform4 = function _singleRealTransform4(outOff,
                                                                     off,
                                                                     step) {
  const out = this._out;
  const data = this._data;
  const inv = this._inv ? -1 : 1;
  const step2 = step * 2;
  const step3 = step * 3;

  // Original values
  const Ar = data[off];
  const Br = data[off + step];
  const Cr = data[off + step2];
  const Dr = data[off + step3];

  // Pre-Final values
  const T0r = Ar + Cr;
  const T1r = Ar - Cr;
  const T2r = Br + Dr;
  const T3r = inv * (Br - Dr);

  // Final values
  const FAr = T0r + T2r;

  const FBr = T1r;
  const FBi = -T3r;

  const FCr = T0r - T2r;

  const FDr = T1r;
  const FDi = T3r;

  out[outOff] = FAr;
  out[outOff + 1] = 0;
  out[outOff + 2] = FBr;
  out[outOff + 3] = FBi;
  out[outOff + 4] = FCr;
  out[outOff + 5] = 0;
  out[outOff + 6] = FDr;
  out[outOff + 7] = FDi;
};

},{}],2:[function(require,module,exports){
module.exports = nextPowerOfTwo;

function nextPowerOfTwo (n) {
  if (n === 0) return 1
  n--;
  n |= n >> 1;
  n |= n >> 2;
  n |= n >> 4;
  n |= n >> 8;
  n |= n >> 16;
  return n+1
}
},{}],"ml-convolution":[function(require,module,exports){

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var FFT = _interopDefault(require('fft.js'));
var nextPOT = _interopDefault(require('next-power-of-two'));

function directConvolution(input, kernel) {
    const length = input.length + kernel.length - 1;
    const output = new Float32Array(length);
    output.fill(0);
    for (var i = 0; i < input.length; i++) {
        for (var j = 0; j < kernel.length; j++) {
            output[i + j] += input[i] * kernel[j];
        }
    }
    return output;
}

function fftProcessKernel(length, kernel, shared = true) {
  const resultLength = length + kernel.length;
  const fftLength = nextPOT(resultLength);

  const fft = new FFT(fftLength, shared);

  const fftKernel = createPaddedFFt(kernel, fft, fftLength);

  return fftKernel;
}

function fftConvolution(length, fftKernel, kernelLength) {
    const resultLength = length + kernelLength;
    const fftLength = nextPOT(resultLength);

    const fft = new FFT(fftLength);

    function go (input) {
      const fftInput = createPaddedFFt(input, fft, fftLength);

      // reuse arrays
      const fftConv = fftInput;
      const conv = new Float32Array(fftKernel.length);//.set(fftKernel);
      for (var i = 0; i < fftConv.length; i += 2) {
          const tmp = fftInput[i] * fftKernel[i] - fftInput[i + 1] * fftKernel[i + 1];
          fftConv[i + 1] = fftInput[i] * fftKernel[i + 1] + fftInput[i + 1] * fftKernel[i];
          fftConv[i] = tmp;
      }
      fft.inverseTransform(conv, fftConv);
      return fft.fromComplexArray(conv).slice(0, resultLength);
    }

    return go
}

function createPaddedFFt(data, fft, length) {
    const input = new Float32Array(length);
    input.set(data);
    const fftInput = fft.toComplexArray(input);
    const output = fft.createComplexArray();
    fft.transform(output, fftInput);
    return output;
}

exports.directConvolution = directConvolution;
exports.fftProcessKernel = fftProcessKernel;
exports.fftConvolution = fftConvolution;

},{"fft.js":1,"next-power-of-two":2}]},{},[]);

var convolve = r('ml-convolution');

var impulseConvolve = async (c, url, length) => {
  const impulse = await c.sample(url);
  if (length > -1) {
    impulse[0] = impulse[0].subarray(0, length);
  }
  const id = 'kernel:' + url + ':' + c.buffer[0].length + ':' + length;
  let kernel = await c.get(id);
  if (kernel === false) {
    console.log('processing kernel:', id);
    kernel = convolve.fftProcessKernel(c.buffer[0].length, impulse[0]);
    await c.set(id, kernel);
    console.log('set kernel cache:', id);
  } else {
    console.log('got cached kernel:', id);
  }
  const reverb = convolve.fftConvolution(c.buffer[0].length, kernel, impulse[0].length);
  return reverb
};

var ImpulseReverb = async (c, { url, offset = 0, length = -1 }=c) => {
  const reverb = await impulseConvolve(c, url, length);
  let tail = 0;
  let prev = (await c.get('prev:'+url+(c.n-c.buffer[0].length)))||new Float32Array();
  let curr;
  let len = 0;
  let i = 0;
  return c => {
    len = c.buffer[0].length;
    curr = reverb(c.buffer[0]);
    // add remaining tail from previous step
    for (i = 0; i < prev.length; i++) {
      curr[i] += prev[i];
    }
    tail = (curr.length - offset) - len;
    prev = curr.subarray(-tail);
    c.set('prev:'+url+c.n, prev, 5000);
    return curr.subarray(offset, offset + len)
  }
};

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

const isMain$3 = typeof window !== 'undefined';

const THREAD_URL = new URL('mix-worker-thread.js', import.meta.url).href;

const mixWorker = (url, context) => {
  const rpcUrl = getRpcUrl(url);
  return Promise.race([
    new Promise((resolve, reject) => setTimeout(reject, 30000, new Error('mixWorker: Timed out'))),
    rpc(rpcUrl, 'render', [url, context.toJSON?.() ?? context]).then(result => {
      if (isMain$3) rpc.markAsSafe(rpcUrl);
      return result
    })
  ])
};

rpc.onfail = rpc.onerror = (error, url) => mixWorker.onerror?.(error, url);

mixWorker.queueUpdates = false;

const scheduleUpdate = mixWorker.scheduleUpdate = new Set;

mixWorker.update = (url, force = false) => {
  if (!force && mixWorker.queueUpdates) {
    scheduleUpdate.add(url);
  } else {
    // rpc(BUFFER_SERVICE_URL, 'clear', [url])
    rpc.update(getRpcUrl(url));
  }
};

mixWorker.flushUpdates = () => {
  for (const url of scheduleUpdate) {
    mixWorker.update(url, true);
  }
  scheduleUpdate.clear();
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
    let sl, rl, _vol = 1, vol, o = 0;
    if (Array.isArray(source[0])) { // [buffer,length,volume,offset]
      sl = (source[0][0].length * source[1])|0; // specified length
      _vol = source[2]??1;
      o = source[3]??0; // offset
      source = source[0]; // actual buffer
      rl = source[0].length; // real length
    } else {
      sl = rl = source[0].length;
    }

    // branching early so we don't branch in the loop
    if (typeof _vol === 'function') {
      if (target.length === 2) {
        if (source.length === 2) { // stereo to stereo
          for (let x = 0; x < tl; x++) {
            vol = _vol(x);
            target[0][x%tl] += source[0][(x+o)%sl%rl]*vol;
            target[1][x%tl] += source[1][(x+o)%sl%rl]*vol;
          }
        } else if (source.length === 1) { // mono to stereo
          for (let x = 0; x < tl; x++) {
            vol = _vol(x);
            target[0][x%tl] += (source[0][(x+o)%sl%rl]/2)*vol;
            target[1][x%tl] += (source[0][(x+o)%sl%rl]/2)*vol;
          }
        }
      } else if (target.length === 1) {
        if (source.length === 2) { // stereo to mono
          for (let x = 0; x < tl; x++) {
            vol = _vol(x);
            target[0][x%tl] += ((source[0][(x+o)%sl%rl] + source[1][(x+o)%sl%rl])/2)*vol;
          }
        } else if (source.length === 1) { // mono to mono
          for (let x = 0; x < tl; x++) {
            vol = _vol(x);
            target[0][x%tl] += source[0][(x+o)%sl%rl]*vol;
          }
        }
      }
    } else {
      vol = _vol;
      if (target.length === 2) {
        if (source.length === 2) { // stereo to stereo
          for (let x = 0; x < tl; x++) {
            target[0][x%tl] += source[0][(x+o)%sl%rl]*vol;
            target[1][x%tl] += source[1][(x+o)%sl%rl]*vol;
          }
        } else if (source.length === 1) { // mono to stereo
          for (let x = 0; x < tl; x++) {
            target[0][x%tl] += (source[0][(x+o)%sl%rl]/2)*vol;
            target[1][x%tl] += (source[0][(x+o)%sl%rl]/2)*vol;
          }
        }
      } else if (target.length === 1) {
        if (source.length === 2) { // stereo to mono
          for (let x = 0; x < tl; x++) {
            target[0][x%tl] += ((source[0][(x+o)%sl%rl] + source[1][(x+o)%sl%rl])/2)*vol;
          }
        } else if (source.length === 1) { // mono to mono
          for (let x = 0; x < tl; x++) {
            target[0][x%tl] += source[0][(x+o)%sl%rl]*vol;
          }
        }
      }
    }
  });
  return target
};

const BUFFER_SERVICE_URL = 'main:buffer-service';
const SAMPLE_SERVICE_URL = 'main:sample-service';
const GLOBAL_SERVICE_URL = 'main:global-service';

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

  buf ({ id = '', len = this.buffer[0].length, ch = this.buffer.length } = {}) {
    return rpc(BUFFER_SERVICE_URL, 'getBuffer', [
      id+checksumOf(this),
      len|0,
      ch|0
    ])
  }

  get (id) {
    return rpc(GLOBAL_SERVICE_URL, 'get', [id])
  }

  set (id, value, ttl) {
    return rpc(GLOBAL_SERVICE_URL, 'set', [id, value, ttl])
  }

  sample (url) {
    return rpc(SAMPLE_SERVICE_URL, 'fetchSample', [url])
  }

  reverb (params) {
    return ImpulseReverb(this, params)
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

    this.update();
  }

  tick () {
    this.n = ++this.n;
    this.p = ++this.p;

    this.update();
  }

  tickBar () {
    this.n += this.buffer[0].length;
    this.p += this.buffer[0].length;

    this.update();
  }

  update () {
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
  self.methods.render = atomic(async (url, context) => {
    return render$1(context)
  });
};

self.methods = {
  render: atomic(async (url, context) => {
    if (!self.hasSetup) {
      await setup(url, context);
    }
    return render$1(context)
  }, { timeout: 60000 })
};
