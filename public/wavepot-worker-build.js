const toFinite = n => Number.isFinite(n) ? n : 0;

const clamp = (min, max, n) => Math.max(min, Math.min(max, n));

const parseFn = fn => {
  let s = fn.toString();
  let [args, body] = (s.split('\n')[0].includes('=>')
    ? s.split('=>')
    : [s.slice(s.indexOf('('), s.indexOf(')')+1), s.slice(s.indexOf(' {'))]
    ).map(s => s.trim());
  args = args.replace(/[\(\)]/g, '').split(',');
  let argNames = args.map(a => a.split('=')[0]);
  let inner = body[0] === '{' ? body.split('\n').slice(1,-1).join('\n').trim() : body;
  return { args, argNames, body, inner }
};

const notes = 'ccddeffggaab';
const stringToNote = s => {
  s = s.split('');
  let octave = parseInt(s[s.length - 1], 10);
  if (isNaN(octave)) octave = 4;
  const note = s[0].toLowerCase();
  const flat = s[1] === 'b';
  const sharp = s[1] === '#';
  return notes.indexOf(note) + (octave * 12) + sharp - flat
};

const EXCESS_WHITESPACE = / {1,}|\n/g;
const HAS_LETTER = /[a-zA-Z]/;
const parsePattern = x => x
  .replace(EXCESS_WHITESPACE, ' ') // remove excess whitespace
  .trim() // and trim
  .split(' ') // split to array of values
  .map(n => toFinite(
    HAS_LETTER.test(n)
      ? stringToNote(n) // has a letter then it is a musical note
      : parseFloat(n) // otherwise it's a scalar
    ));

class Rpc {
  callbackId = 0
  callbacks = new Map

  constructor () {}

  postCall (method, data, tx) {
    this.port.postMessage({ call: method, ...data }, tx);
  }

  rpc (method, data, tx) {
    return new Promise((resolve, reject) => {
      const id = this.callbackId++;

      this.callbacks.set(id, data => {
        this.callbacks.delete(id);
        if (data.error) reject(data.error);
        else resolve(data);
      });

      this.postCall(method, { data, callback: id }, tx);
    })
  }

  callback (data) {
    this.callbacks.get(data.responseCallback)(data.data ?? data);
  }

  register (port) {
    this.port = port;

    this.port.addEventListener('message', async ({ data }) => {
      // console.log(data)
      if (!(data.call in this)) {
        throw new ReferenceError(data.call + ' is not a method')
      }

      let result;
      try {
        if (data.call === 'callback') {
          result = await this[data.call](data);
        } else {
          result = await this[data.call](data.data ?? data);
        }
      } catch (error) {
        result = { error };
      }

      if ('callback' in data) {
        this.postCall('callback', { data: result, responseCallback: data.callback });
      }
    });

    this.port.addEventListener('error', error => {
      console.error(error);
      this.postCall('onerror', { error });
    });

    this.port.addEventListener('messageerror', error => {
      console.error(error);
      this.postCall('onmessageerror', { error });
    });

    return this
  }
}

class Shared32Array {
  constructor (length) {
    return new Float32Array(
      new SharedArrayBuffer(
        length * Float32Array.BYTES_PER_ELEMENT)
    )
  }
}

var Biquad = {
  lp1 (x0,freq=1000,amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,

    a1 = -Math.exp(-w0),
    a2 = 0.0,
    b0 = 1.0 + a1,
    b1 = b2 = 0.0,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2);
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  hp1 (x0,freq=1000,amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,

    a1 = -Math.exp(-w0),
    a2 = 0.0,
    b0 = (1.0 - a1) / 2.0,
    b1 = -b0,
    b2 = 0.0,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2);
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  lp (x0, freq=1000, Q=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    b0 = (1.0 - cos_w0) / 2.0,
    b1 =  1.0 - cos_w0,
    b2 = b0,
    a0 =  1.0 + alpha,
    a1 = -2.0 * cos_w0,
    a2 =  1.0 - alpha,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0;
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  hp (x0, freq=1000, Q=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    b0 = (1.0 + cos_w0) / 2.0,
    b1 = -(1.0 + cos_w0),
    b2 = b0,
    a0 = 1.0 + alpha,
    a1 = -2.0 * cos_w0,
    a2 = 1.0 - alpha,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0;
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  bp (x0, freq=1000, Q=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    b0 = sin_w0 / 2.0,
    b1 = 0.0,
    b2 = -b0,
    a0 = 1.0 + alpha,
    a1 = -2.0 * cos_w0,
    a2 = 1.0 - alpha,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0;
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  bpp (x0, freq=1000, Q=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    b0 = alpha,
    b1 = 0.0,
    b2 = -alpha,
    a0 = 1.0 + alpha,
    a1 = -2.0 * cos_w0,
    a2 = 1.0 - alpha,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0;
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  not (x0, freq=1000, Q=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    b0 = 1.0,
    b1 = -2.0 * cos_w0,
    b2 = 1.0,
    a0 = 1.0 + alpha,
    a1 = b1,
    a2 = 1.0 - alpha,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0;
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  ap (x0, freq=1000, Q=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    b0 = 1.0 - alpha,
    b1 = -2.0 * cos_w0,
    b2 = 1.0 + alpha,
    a0 = b2,
    a1 = b1,
    a2 = b0,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0;
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  pk (x0, freq=1000, Q=1, gain=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    a = Math.pow(10.0, gain / 40.0),
    b0 = 1.0 + alpha * a,
    b1 = -2.0 * cos_w0,
    b2 = 1.0 - alpha * a,
    a0 = 1.0 + alpha / a,
    a1 = b1,
    a2 = 1.0 - alpha / a,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0;
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  ls (x0, freq=1000, Q=1, gain=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    a = Math.pow(10.0, gain / 40.0),
    c = 2.0 * Math.sqrt(a) * alpha,
    b0 = a * ((a + 1.0) - (a - 1.0) * cos_w0 + c),
    b1 = 2.0 * a * ((a - 1.0) - (a + 1.0) * cos_w0),
    b2 = a * ((a + 1.0) - (a - 1.0) * cos_w0 - c),
    a0 = (a + 1.0) + (a - 1.0) * cos_w0 + c,
    a1 = -2.0 * ((a - 1.0) + (a + 1.0) * cos_w0),
    a2 = (a + 1.0) + (a - 1.0) * cos_w0 - c,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0;
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  hs (x0, freq=1000, Q=1, gain=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    a = Math.pow(10.0, gain / 40.0),
    c = 2.0 * Math.sqrt(a) * alpha,
    b0 = a * ((a + 1.0) + (a - 1.0) * cos_w0 + c),
    b1 = -2.0 * a * ((a - 1.0) + (a + 1.0) * cos_w0),
    b2 = a * ((a + 1.0) + (a - 1.0) * cos_w0 - c),
    a0 = (a + 1.0) - (a - 1.0) * cos_w0 + c,
    a1 = 2.0 * ((a - 1.0) - (a + 1.0) * cos_w0),
    a2 = (a + 1.0) - (a - 1.0) * cos_w0 - c,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0;
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  }
};

const O = {};
O.sin   = function (x=1) { return Math.sin(this * x * Math.PI * 2) };
O.cos   = function (x=1) { return Math.cos(this * x * Math.PI * 2) };
O.tri   = function (x=1) { return Math.abs(1-(2*this*x)%2)*2-1 };
O.saw   = function (x=1) { return 1-2*(this%(1/x))*x   };
O.ramp  = function (x=1) { return   2*(this%(1/x))*x-1 };
O.sqr   = function (x=1) { return      (this*x%1/x<1/x/2  )*2-1 };
O.pulse = function (x=1,w=.9) { return (this*x%1/x<1/x/2*w)*2-1 };
O.noise = function (x=1) {
  x=Math.sin(x+this)*10e4;
  return (x-Math.floor(x))*2-1
};

self.Biquad = Biquad;

const PRIVATE_API = ['constructor','valueOf','_reset'];
const getMethods = (obj) => {
  return Object.getOwnPropertyNames(obj)
    .filter(m => !PRIVATE_API.includes(m))
};

class Sound {
  constructor () {
    this.Lx0 = 0;
    this.Rx0 = 0;
    this.t = 0;
    this.p = 0;
    this._wavetables_i = 0;
    this._wavetables = new Array(100).fill(0);
    this._widen_buffer = new Array(256);
    this._plot_buffer = new Shared32Array(2048);

    const returnThis = () => this;
    this._ignoreNext =
      Object.fromEntries(
        getMethods(Sound.prototype)
          .map(m => [m, returnThis]));

    const returnIgnoreGrp = () => this._ignoreGrp;
    this._ignoreGrp =
      Object.fromEntries(
        getMethods(Sound.prototype)
          .map(m => [m, returnIgnoreGrp]));
    this._ignoreGrp.end = returnThis;
    this._ignoreNext.grp = () => this._ignoreGrp;
  }

  _reset () {
    this.t = t;
    this.p = n;
    this._wavetables_i = 0;
    return this
  }

  grp () {
    return this
  }

  end () {
    return this
  }

  val (x=0) {
    this.Lx0 = this.Rx0 = (+x).toFinite();
    return this
  }

  vol (x=1) {
    this.Lx0 *= x;
    this.Rx0 *= x;
    return this
  }

  mod (x=1,offset=0) {
    x = x * 4;
    this.t %= x;
    this.p = (n % (br * x))|0;
    if (this.p === 0) {
      this._wavetables.fill(offset*_wavetable_len);
    }
    return this
  }

  exp (x=1) {
    let exp = Math.exp(-this.t * x);
    this.Lx0 *= exp;
    this.Rx0 *= exp;
    return this
  }

  abs () {
    this.Lx0 = Math.abs(this.Lx0);
    this.Rx0 = Math.abs(this.Rx0);
    return this
  }

  tanh (x=1) {
    this.Lx0 = Math.tanh(this.Lx0 * x);
    this.Rx0 = Math.tanh(this.Rx0 * x);
    return this
  }

  atan (x=1) {
    this.Lx0 = (2 / Math.PI)*Math.atan((Math.PI / 2) * this.Lx0 * x);
    this.Rx0 = (2 / Math.PI)*Math.atan((Math.PI / 2) * this.Rx0 * x);
    return this
  }

  soft (x=1) {
    x = 1/x;
    this.Lx0 = this.Lx0 / (x + Math.abs(this.Lx0));
    this.Rx0 = this.Rx0 / (x + Math.abs(this.Rx0));
    return this
  }

  on (x=1, measure=1/4, count=x) {
    return (t/(measure*4)|0)%count === x-1
      ? this
      : this._ignoreNext
  }

  // TODO: improve this
  play (x,offset=0,speed=1,mod) {
    let N = mod ?? x[0].length;
    let p = (( ( (this.p+offset)*speed) % N + N) % N)|0;
    this.Lx0 = (x[0][p] ?? 0) * .5;
    this.Rx0 = ((x[1] ?? x[0])[p] ?? 0) * .5;
    return this
  }

  widen (x=.5) {
    this._widen_buffer[n & 255] = this.Rx0;
    this.Rx0 = this._widen_buffer[(n+((1-x)*256)) & 255];
    return this
  }

  delay (measure=1/16,feedback=.5,amt=.5) {
    let Ld = _delays[_delays_i++];
    let Rd = _delays[_delays_i++];
    let x = (bar*measure)|0;
    this.Lx0 = Ld.delay(x).feedback(feedback).run(this.Lx0, amt);
    this.Rx0 = Rd.delay(x).feedback(feedback).run(this.Rx0, amt);
    return this
  }

  daverb (x=1,seed=-1) {
    let d = _daverbs[_daverbs_i++];
    d.seedParameters(seed).process(this, x);
    return this
  }

  pan (x=0) { // -1..+1  0=center
    this.Lx0 *= Math.min(1, (2-(1 + 1*x)));
    this.Rx0 *= Math.min(1,    (1 + 1*x));
    return this
  }

  out (x=1) {
    main.Lx0 += this.Lx0 * x; //* x * (2-(1 + 1*LR))
    main.Rx0 += this.Rx0 * x; //* x *    (1 + 1*LR)
    return this
  }

  plot (x=1) {
    if (i === 0) {
      this._plot_buffer.fill(0);
    }
    let co = bar / (2048*x);
    if (i === bar - 1) {
      worker.plot(this._plot_buffer, (1/x));
      return this
    }
    if ((i % co)|0 === 0) {
      this._plot_buffer[(i/co)|0] = this.Lx0;
    }
    return this
  }

  valueOf () {
    return this.Lx0
  }
}

// aliases
Sound.prototype.mul = Sound.prototype.vol;

Object.keys(Biquad).forEach(m => {
  const { args, inner } = parseFn(Biquad[m]);

  const body = `
    x0 = this.Lx0
    ${inner.replace('return', 'this.Lx0 =')}
    x0 = this.Rx0
    ${inner.split('\n\n')[0]}
    ${inner.replace('return', 'this.Rx0 =').split('\n\n').slice(-2).join('\n\n')}
    return this
  `;

  Sound.prototype[m] = new Function(...args.slice(1), body);
});

self._wavetable = {};
self._wavetable_len = 44100;

Object.keys(O).forEach(osc => {
  const table =
  _wavetable[osc] =
  _wavetable[osc] = new Float32Array(_wavetable_len);
  for (let i = 0, t = 0; i < _wavetable_len; i++) {
    t = i / _wavetable_len;
    if (osc === 'noise') {
      table[i] = O[osc].call(i, 1);
    } else {
      table[i] = O[osc].call(t, 1);
    }
  }

  Sound.prototype[osc] = new Function('x=1', `
    let index = this._wavetables[this._wavetables_i]
    this._wavetables[this._wavetables_i++] = (index + x) % 44100
    this.Lx0 = this.Rx0 = _wavetable.${osc}[index|0]
    return this
  `);
});

const N = Number.prototype;

Object.defineProperty(N, 'note', {
  get () {
    return Math.pow(2, (this - 57)/12) * 440
  },
  set () {},
});

const S = String.prototype;

Object.defineProperty(S, 'sample', {
  get () {
    let s = samples[this];
    if (!s) {
      s = samples[this] = zeroSample;
      worker.fetchSample(this);
    }
    return s
  },
  set () {},
});

Object.defineProperty(S, 'pat', {
  get () {
    let pat = patterns[this] = patterns[this] ?? parsePattern(this);
    return pat
  },
  set () {},
});

Object.defineProperty(S, 'note', {
  get () {
    return stringToNote(this)
  },
  set () {},
});

S.seq = function (x) {
  return this.pat.seq(x)
};

S.slide = function (x) {
  return this.pat.slide(x)
};

const A = Array.prototype;

A.play = function (x=1,offset=0) {
  let N = this.length;
  return this[(( (n*x+offset) % N + N) % N)|0]
};

A.seq = function (x) {
  let N = this.length;
  return this[(( (t*(1/(x*4))) % N + N) % N)|0]
};

A.slide = function (x,speed=1) {
  let N = this.length;
  let pos = (( (t*(1/(x*4))) % N + N) % N);
  let now = pos|0;
  let next =  (((now + 1) % N + N) % N)|0;
  let alpha = pos - now;
  return this[now]+((this[next]-this[now])*Math.pow(alpha, speed))
};

const T = Object.getPrototypeOf(Float32Array).prototype; // TypedArray.prototype

T.play  = A.play;
T.seq   = A.seq;
T.slide = A.slide;

function Delay(size){
  this.size = size; //buffer.length //size || 512;
  this.buffer = new Float32Array(size);
  this.counter = 0;
  this._feedback = 0.5;
  this._delay = 100;
}

Delay.prototype.feedback = function(n){
  n = toFinite(clamp(0, 0.99, n));
  this._feedback = n;
  return this;
};

Delay.prototype.delay = function(n){
  n = toFinite(clamp(0, this.size, n));
  this._delay = n;
  return this;
};

Delay.prototype.run = function(inp, mix = .5) {
  mix = toFinite(clamp(0, 1, mix));
  var back = this.counter - this._delay;
  if (back < 0) back = this.size + back;
  var index0 = Math.floor(back);

  var index_1 = index0 - 1;
  var index1 = index0 + 1;
  var index2 = index0 + 2;

  if (index_1 < 0) index_1 = this.size - 1;
  if (index1 >= this.size) index1 = 0;
  if (index2 >= this.size) index2 = 0;

  var y_1 = this.buffer[index_1];
  var y0 = this.buffer[index0];
  var y1 = this.buffer[index1];
  var y2 = this.buffer[index2];

  var x = back - index0;

  var c0 = y0;
  var c1 = 0.5 * (y1 - y_1);
  var c2 = y_1 - 2.5 * y0 + 2.0 * y1 - 0.5 * y2;
  var c3 = 0.5 * (y2 - y_1) + 1.5 * (y0 - y1);

  var out = ((c3*x+c2)*x+c1)*x+c0;

  this.buffer[this.counter] = inp + out*this._feedback;

  this.counter++;

  if (this.counter >= this.size) this.counter = 0;

  return out * mix + inp * (1-mix);
};

/*
author: Khoin
github: https://github.com/khoin
repo: https://github.com/khoin/DattorroReverbNode

(modified slightly to process samples one by one instead of chunks)

In jurisdictions that recognize copyright laws, this software is to
be released into the public domain.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
THE AUTHOR(S) SHALL NOT BE LIABLE FOR ANYTHING, ARISING FROM, OR IN
CONNECTION WITH THE SOFTWARE OR THE DISTRIBUTION OF THE SOFTWARE.
*/

const rand = (x) => {
  x=Math.sin(x)*10e4;
  return (x-Math.floor(x))
};

let sampleRate$1 = 44100;

let cache = {};

class DattorroReverb {
  static TapDelays = [
    0.004771345, 0.003595309, 0.012734787, 0.009307483,
    0.022579886, 0.149625349, 0.060481839, 0.124995800,
    0.030509727, 0.141695508, 0.089244313, 0.106280031
  ]

  static get parameterDescriptors() {
    return [
      ["preDelay", 0, 0, sampleRate$1 - 1, "k-rate"],
      ["bandwidth", 0.9999, 0, 1, "k-rate"],
      ["inputDiffusion1", 0.75, 0, 1, "k-rate"],
      ["inputDiffusion2", 0.625, 0, 1, "k-rate"],
      ["decay", 0.5, 0, 1, "k-rate"],
      ["decayDiffusion1", 0.7, 0, 0.999999, "k-rate"],
      ["decayDiffusion2", 0.5, 0, 0.999999, "k-rate"],
      ["damping", 0.005, 0, 1, "k-rate"],
      ["excursionRate", 0.5, 0, 2, "k-rate"],
      ["excursionDepth", 0.7, 0, 2, "k-rate"],
      ["wet", 0.3, 0, 1, "k-rate"],
      ["dry", 0.6, 0, 1, "k-rate"]
    ].map(x => new Object({
      name: x[0],
      defaultValue: x[1],
      minValue: x[2],
      maxValue: x[3],
      automationRate: x[4]
    }));
  }

  constructor(_sampleRate) {
    sampleRate$1 = _sampleRate;

    this._Delays    = [];
    this._pDLength  = sampleRate$1; //+ (128 - sampleRate%128); // Pre-delay is always one-second long, rounded to the nearest 128-chunk
    this._preDelay  = new Float32Array(this._pDLength);
    this._pDWrite   = 0;
    this._lp1       = 0.0;
    this._lp2       = 0.0;
    this._lp3       = 0.0;
    this._excPhase  = 0.0;

    [
      0.004771345, 0.003595309, 0.012734787, 0.009307483,
      0.022579886, 0.149625349, 0.060481839, 0.1249958  ,
      0.030509727, 0.141695508, 0.089244313, 0.106280031
    ].forEach(x => this.makeDelay(x));

    this._taps = Int16Array.from([
      0.008937872, 0.099929438, 0.064278754, 0.067067639, 0.066866033, 0.006283391, 0.035818689,
      0.011861161, 0.121870905, 0.041262054, 0.08981553 , 0.070931756, 0.011256342, 0.004065724
    ], x => Math.round(x * sampleRate$1));

    this.parameterDescriptors = this.constructor.parameterDescriptors;
    this.defaultValues = Object.fromEntries(
      this.parameterDescriptors.map(p => {
        return [p.name, p.defaultValue]
      }));

    this.parameters = { ...this.defaultValues };

    this.seed = -1;
  }

  makeDelay(length) {
    // len, array, write, read, mask
    let len = Math.round(length * sampleRate$1);
    let nextPow2 = 2**Math.ceil(Math.log2((len)));
    this._Delays.push([
      new Float32Array(nextPow2),
      len - 1,
      0|0,
      nextPow2 - 1
    ]);
  }

  writeDelay(index, data) {
    return this._Delays[index][0][this._Delays[index][1]] = data;
  }

  readDelay(index) {
    return this._Delays[index][0][this._Delays[index][2]];
  }

  readDelayAt(index, i) {
    let d = this._Delays[index];
    return d[0][(d[2] + i)&d[3]];
  }

  // cubic interpolation
  // O. Niemitalo: https://www.musicdsp.org/en/latest/Other/49-cubic-interpollation.html
  readDelayCAt(index, i) {
    let d = this._Delays[index],
      frac = i-~~i,
      int  = ~~i + d[2] - 1,
      mask = d[3];

    let x0 = d[0][int++ & mask],
      x1 = d[0][int++ & mask],
      x2 = d[0][int++ & mask],
      x3 = d[0][int   & mask];

    let a  = (3*(x1-x2) - x0 + x3) / 2,
      b  = 2*x2 + x0 - (5*x1+x3) / 2,
      c  = (x2-x0) / 2;

    return (((a * frac) + b) * frac + c) * frac + x1;
  }

  setParameters (parameters) {
    this.parameters = { ...this.defaultValues, ...parameters };
    this.parameters.preDelay = ~~this.parameters.preDelay;
    this.parameters.damping = 1 - this.parameters.damping;
    this.parameters.excursionRate = this.parameters.excursionRate / sampleRate$1;
    this.parameters.excursionDepth = this.parameters.excursionDepth * sampleRate$1 / 1000;
  }

  seedParameters (seed) {
    if (seed === this.seed) return this
    this.seed = seed;
    if (cache[seed]) {
      this.parameters = cache[seed];
    } else {
      let d = this.parameterDescriptors;
      this.setParameters({
        preDelay:        rand(seed)     * 4000, //d[0].maxValue,
        bandwidth:       rand(seed + 1) * d[1].maxValue,
        inputDiffusion1: rand(seed + 2) * d[2].maxValue,
        inputDiffusion2: rand(seed + 3) * d[3].maxValue,
        decay:           rand(seed + 4) * d[4].maxValue,
        decayDiffusion1: rand(seed + 5) * d[5].maxValue,
        decayDiffusion2: rand(seed + 6) * d[6].maxValue,
        damping:         rand(seed + 7) * d[7].maxValue,
        excursionRate:   rand(seed + 8) * d[8].maxValue,
        excursionDepth:  rand(seed + 9) * d[9].maxValue,
      });
      console.log('set parameters', this.parameters);
      cache[seed] = this.parameters;
    }
    return this
  }

  // First input will be downmixed to mono if number of channels is not 2
  // Outputs Stereo.
  process(ctx, amt = .5) {
    let parameters = this.parameters;

    let
        pd   = parameters.preDelay          ,
        bw   = parameters.bandwidth           ,
        fi   = parameters.inputDiffusion1     ,
        si   = parameters.inputDiffusion2     ,
        dc   = parameters.decay               ,
        ft   = parameters.decayDiffusion1     ,
        st   = parameters.decayDiffusion2     ,
        dp   = parameters.damping         ,
        ex   = parameters.excursionRate   ,// / sampleRate        ,
        ed   = parameters.excursionDepth  ,// * sampleRate / 1000 ,
        we   = amt * 0.6, //parameters.wet             ,// * 0.6               , // lo & ro both mult. by 0.6 anyways
        dr   = 1 - amt; //parameters.dry                 ;


    this._preDelay[this._pDWrite] = (ctx.Lx0 + ctx.Rx0) *.5;

    // // write to predelay and dry output
    // if (inputs[0].length == 2) {
    //   for (let i = 127; i >= 0; i--) {
    //     this._preDelay[this._pDWrite+i] = (inputs[0][0][i] + inputs[0][1][i]) * 0.5;

    //     outputs[0][0][i] = inputs[0][0][i]*dr;
    //     outputs[0][1][i] = inputs[0][1][i]*dr;
    //   }
    // } else if (inputs[0].length > 0) {
    //   this._preDelay.set(
    //     inputs[0][0],
    //     this._pDWrite
    //   );
    //   for (let i = 127; i >= 0; i--)
    //     outputs[0][0][i] = outputs[0][1][i] = inputs[0][0][i]*dr;
    // } else {
    //   this._preDelay.set(
    //     new Float32Array(128),
    //     this._pDWrite
    //   );
    // }

    let i = 0|0;
    // while (i < 128) {
      let lo = 0.0,
        ro = 0.0;

      this._lp1 += bw * (this._preDelay[(this._pDLength + this._pDWrite - pd + i)%this._pDLength] - this._lp1);

      // pre-tank
      let pre = this.writeDelay(0,             this._lp1          - fi * this.readDelay(0) );
        pre = this.writeDelay(1, fi * (pre - this.readDelay(1)) +      this.readDelay(0) );
        pre = this.writeDelay(2, fi *  pre + this.readDelay(1)  - si * this.readDelay(2) );
        pre = this.writeDelay(3, si * (pre - this.readDelay(3)) +      this.readDelay(2) );

      let split = si * pre + this.readDelay(3);

      // excursions
      // could be optimized?
      let exc   = ed * (1 + Math.cos(this._excPhase*6.2800));
      let exc2  = ed * (1 + Math.sin(this._excPhase*6.2847));

      // left loop
      let temp =  this.writeDelay( 4, split + dc * this.readDelay(11)    + ft * this.readDelayCAt(4, exc) ); // tank diffuse 1
            this.writeDelay( 5,         this.readDelayCAt(4, exc)  - ft * temp                      ); // long delay 1
            this._lp2      += dp * (this.readDelay(5) - this._lp2)                                   ; // damp 1
        temp =  this.writeDelay( 6,         dc * this._lp2             - st * this.readDelay(6)         ); // tank diffuse 2
            this.writeDelay( 7,         this.readDelay(6)          + st * temp                      ); // long delay 2
      // right loop
        temp =  this.writeDelay( 8, split + dc * this.readDelay(7)     + ft * this.readDelayCAt(8, exc2)); // tank diffuse 3
            this.writeDelay( 9,         this.readDelayCAt(8, exc2) - ft * temp                      ); // long delay 3
            this._lp3      += dp * (this.readDelay(9) - this._lp3)                                   ; // damp 2
        temp =  this.writeDelay(10,         dc * this._lp3             - st * this.readDelay(10)        ); // tank diffuse 4
            this.writeDelay(11,         this.readDelay(10)         + st * temp                      ); // long delay 4

      lo =  this.readDelayAt( 9, this._taps[0])
        + this.readDelayAt( 9, this._taps[1])
        - this.readDelayAt(10, this._taps[2])
        + this.readDelayAt(11, this._taps[3])
        - this.readDelayAt( 5, this._taps[4])
        - this.readDelayAt( 6, this._taps[5])
        - this.readDelayAt( 7, this._taps[6]);

      ro =  this.readDelayAt( 5, this._taps[7])
        + this.readDelayAt( 5, this._taps[8])
        - this.readDelayAt( 6, this._taps[9])
        + this.readDelayAt( 7, this._taps[10])
        - this.readDelayAt( 9, this._taps[11])
        - this.readDelayAt(10, this._taps[12])
        - this.readDelayAt(11, this._taps[13]);

      // let out = x0*dr + (lo+ro)*we*.5
      // outputs[0][0][i] += lo * we;
      // outputs[0][1][i] += ro * we;

      this._excPhase  += ex;

      // i++;

      for (let j = 0, d = this._Delays[0]; j < this._Delays.length; d = this._Delays[++j]) {
        d[1] = (d[1] + 1) & d[3];
        d[2] = (d[2] + 1) & d[3];
      }
    // }

    // Update preDelay index
    this._pDWrite = (this._pDWrite + 1) % this._pDLength;

    ctx.Lx0 = ctx.Lx0*dr + lo*we;
    ctx.Rx0 = ctx.Rx0*dr + ro*we;
    // return [, ] // out;
  }
}

self.IS_DEV = !!location.port && location.port != '3000';

// Number prototype extensions
Number.prototype.toFinite = function () {
  return Number.isFinite(this) ? this : 0
};

Number.prototype.clamp = function (min, max) {
  return Math.min(max, Math.max(min, this))
};

// utils
self.toFinite = toFinite;

// constants
self.pi2 = Math.PI * 2;

// audio
self.bufferSize = 2**19;
self.sampleRate = 44100;
self.buffer = [new Float32Array([0]),new Float32Array([0])];
self.numberOfChannels = 2;

// clock
self.real_n = 0; // this doesn't adjust by bpm
self.n = 0; // this adjusts by bpm
self.i = 0; // current buffer iteration point
self.s = 0; // playing seconds (real, based on real_n)
self.t = 0; // playing time (sync based on bpm, 1 equals 1 beat time)
self._bpm = 120; // starting at 120bpm
self.br = 22050; // for 120bpm
self.bar = self.br * 4;
self._sync = self.sampleRate / self.br;
self._loop = 0;

self.main = new Sound();

// blocks
self._block_i = 0;

// sounds
self.sounds_i = 0;
self.sounds = Array.from(Array(100), () => (new Sound()));

// biquads
self._biquads_i = 0;
self._biquads = Array.from(Array(200),()=>({y1:0,y2:0,x1:0,x2:0}));

// delays
self._delays_i = 0;
self._delays = Array.from(Array(100),()=>(new Delay(44100)));

// daverbs
self._daverbs_i = 0;
self._daverbs = Array.from(Array(100),()=>(new DattorroReverb(44100)));

// samples
self.zeroSample = [new Float32Array([0]),new Float32Array([0])];
self.samples = {};

// patterns cache map
self.patterns = {};

// top level entry api
self.api = {
  bpm (x, measure=1) {
    if (x !== _bpm) {
      _bpm = x.clamp(1, 1000);
      let co = (60 * measure) / _bpm;
      br = (sampleRate * co)|0;
      bar = br * 4;

      // used in sync() ops
      _sync = sampleRate / br;

      // adjust n position for new bpm
      // only at the beginning of the loop
      if (i === 0) {
        n = Math.round(t) * br;
      }
    }
    t = n / br;
  },
  loop (beat) {
    if (i === 0) {
      n = (beat + 1) * br;
      t = n / br;
    }
  },
  sync (x=1) {
    return (1/x) * _sync
  },

  // oh no why is code repeating like that
  // because it's optimized better at compile time

  grp () {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.grp()
  },

  end () {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.end()
  },

  val (x) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.val(x)
  },

  vol (x) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.vol(x)
  },

  mod (x,a0) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.mod(x,a0)
  },

  exp (x) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.exp(x)
  },

  abs (x) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.abs(x)
  },

  tanh (x) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.tanh(x)
  },

  atan (x) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.atan(x)
  },

  soft (x) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.soft(x)
  },

  on (x,a0,a1) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.on(x,a0,a1)
  },

  play (x,a0,a1,a2) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.play(x,a0,a1,a2)
  },

  sin (x) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.sin(x)
  },

  cos (x) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.cos(x)
  },

  tri (x) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.tri(x)
  },

  saw (x) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.saw(x)
  },

  ramp (x) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.ramp(x)
  },

  sqr (x) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.sqr(x)
  },

  pulse (x) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.pulse(x)
  },

  noise (x) {
    let _s = sounds[sounds_i++];

    _s.t = t;
    _s.p = n;
    _s._wavetables_i = 0;

    return _s.noise(x)
  },
};
// const METHODS = ['mod','val','on','grp','play',
//   'sin','cos','tri','saw','ramp','sqr','pulse','noise']

// METHODS.forEach(method => {
//   const { args, argNames } = parseFn(Sound.prototype[method])
//   self.api[method] = new Function(...args,
//     `
//     let _s = sounds[sounds_i++]

//     _s.t = t
//     _s.p = n
//     _s._wavetables_i = 0

//     return _s.${method}(${argNames})
//     `
//   )
// })

const compile = (code) => {
  let src = `
console.log('n is:', n)
for (i = 0; i < bufferSize; i++) {
  // make sure we have enough buffer to escape glitches
  // and that it divides to bars so it's rhythmic if it does
  if (i > 50000 && ((i % bar) === 0)) {
    break
  }

  n++
  real_n++
  s = real_n / ${sampleRate}

  ${code.split('\n\n').join(`

  // space out effects so they don't interfere
  // much when commenting out sounds
  // TODO: this is awful, use better heuristics
  _biquads_i += 5
  _daverbs_i += 5
  _delays_i += 5

  `)}

  buffer[0][i] = main.Lx0.toFinite()
  buffer[1][i] = main.Rx0.toFinite()
  sounds_i =
  _biquads_i =
  _daverbs_i =
  _delays_i =
  main.Lx0 = main.Rx0 = 0
}

return { bufferIndex: i, bpm: _bpm }
  `;

  let func = new Function(
    Object.keys(self.api),
    src
  ).bind(null, ...Object.values(self.api));

  return func
};

/*

RPC API Interface with Main thread

*/

class Renderer extends Rpc {
  constructor () {
    super();
    this.plotService = new Rpc().register(new Worker(IS_DEV ? 'plot-worker.js' : 'plot-worker-build.js', { type: 'module' }));
  }

  lastFunc () {}

  setup (data) {
    Object.assign(self, data);
    this.plotService.postCall('setup', data.plot, [data.plot.backCanvas]);
  }

  compile ({ code }) {
    const func = compile(code);
    this.lastFunc = this.func;
    this.func = func;
    return true
  }

  render ({ buffer }) {
    console.log('will render', n);
    let result = {};
    let timeToRender = performance.now();
    self.buffer = buffer;
    try {
      result = this.func();
    } catch (err) {
      console.error(err);
      if (this.func !== this.lastFunc) {
        console.error('error, retrying last');
        this.func = this.lastFunc;
        return this.render({ buffer })
      }
    }
    timeToRender = performance.now() - timeToRender;
    console.log('render:', timeToRender);
    return { ...result, timeToRender }
  }

  async fetchSample (url) {
    try {
      const { sample } = await this.rpc('fetchSample', { url });
      samples[url] = sample;
    } catch (error) {
      delete samples[url];
      console.error(error);
    }
  }

  plot (buffer, size=1) {
    this.plotService.postCall('draw', { buffer, size });
  }
}

self.worker = new Renderer();
self.worker.register(self);

export default Renderer;
export { compile };
