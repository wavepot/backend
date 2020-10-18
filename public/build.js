var ask = (title, text, defaultValue) => {
  return new Promise(resolve => {
    const div = document.createElement('div');
    div.className = 'prompt';
    div.innerHTML = `
      <div class="inner">
        <div class="title">${title}</div>
        <div class="text">${text}</div>
        <input type="text" value="${defaultValue}">
        <div class="buttons">
          <button class="cancel">Cancel</button> <button class="ok">OK</button>
        </div>
      </div>
    `;

    const keyListener = e => {
      e.stopPropagation();
      if (e.which === 13) ok();
      if (e.which === 27) cancel();
    };

    const prevent = e => {
      e.stopPropagation();
    };

    const preventEvents = [
      'keyup',
      'input',
      'keypress',
      'mousedown',
      'mouseup',
      'mousemove',
      'mousewheel'
    ];

    const cleanup = () => {
      window.removeEventListener('keydown', keyListener, { capture: true });
      preventEvents.forEach(event => {
        window.removeEventListener(event, prevent, { capture: true });
      });
      document.body.removeChild(div);
    };

    const ok = () => {
      cleanup();
      resolve({ value: div.querySelector('input').value });
    };

    const cancel = () => {
      cleanup();
      resolve(false);
    };

    div.querySelector('.ok').onclick = ok;
    div.querySelector('.cancel').onclick = cancel;

    window.addEventListener('keydown', keyListener, { capture: true });
    preventEvents.forEach(event => {
      window.addEventListener(event, prevent, { capture: true });
    });

    document.body.appendChild(div);

    div.querySelector('input').focus();
    div.querySelector('input').select();
  })
};

const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const pixelRatio = window.devicePixelRatio;
let selectionText = '';
let textarea;

const editors = {};
class Editor {
  constructor (data) {
    this.data = data;
    this.isVisible = true;
    this.hasSetup = false;
    this.toAdd = [];
    this.id = data.id ?? (Math.random() * 10e6 | 0).toString(36);
    editors[this.id] = this;
    this._onchange(data);

    this.focusedEditor = this;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'editor';
    this.canvas.width = data.width * pixelRatio;
    this.canvas.height = data.height * pixelRatio;
    this.canvas.style.width = data.width + 'px';
    this.canvas.style.height = data.height + 'px';

    if (!this.pseudoWorker) {
      const workerUrl = new URL('worker.js', import.meta.url).href;
      this.worker = new Worker(workerUrl, { type: 'module' });
      this.worker.onerror = error => this._onerror(error);
      this.worker.onmessage = ({ data }) => this['_' + data.call](data);
    } else {
      this.setupPseudoWorker();
    }
  }

  async setupPseudoWorker () {
    const PseudoWorker = await import(new URL('worker.js', import.meta.url));
    this.worker = new PseudoWorker();
    this.worker.onerror = error => this._onerror(error);
    this.worker.onmessage = ({ data }) => this['_' + data.call](data);
  }

  destroy () {
    delete editors[this.id];
    this.worker.terminate();
    this.canvas.parentNode.removeChild(this.canvas);
  }

  _onerror (error) {
    console.error(error);
  }

  _onready () {
    const outerCanvas = this.pseudoWorker ? this.canvas : this.canvas.transferControlToOffscreen();
    this.worker.postMessage({
      call: 'setup',
      id: this.id,
      title: this.title,
      extraTitle: this.extraTitle,
      value: this.value,
      font: this.font,
      fontSize: this.fontSize,
      autoResize: this.autoResize,
      padding: this.padding,
      titlebarHeight: this.titlebarHeight,
      outerCanvas,
      pixelRatio,
    }, [outerCanvas]);
    this.onready?.();
    // this.stream = this.canvas.captureStream(15)
    // this.videoTrack = this.stream.getVideoTracks()[0]
    // this.videoTrack.requestFrame()
  }

  _onsetup () {
    this.hasSetup = true;
    if (this.toAdd.length) {
      this.toAdd.forEach(data => this.addSubEditor(data));
      this.toAdd = [];
    }
    this.onsetup?.();
  }

  focus () {
    this.handleEvent('mouse', 'click');
    this._onfocus();
  }

  update (fn) {
    this.onupdate = fn;
    this.worker.postMessage({ call: 'update' });
  }

  _onupdate (data) {
    Object.assign(this, data);
    Object.assign(this.data, data);
    this.onupdate?.(data);
  }

  async _onchange (data) {
    Object.assign(this, data);
    Object.assign(this.data, data);
    // if (this.cache) {
    //   this.filename = await this.cache.put(this.title, this.value)
    //   console.log('put in cache:', this.filename)
    // }
    this.onchange?.(data);
  }

  _ondraw () {
    // this.videoTrack.requestFrame()
  }

  _onrename (data) {
    this.focusedEditor = data;
    this.onrename?.(data);
  }

  _onadd (data) {
    this.onadd?.(data);
  }

  _onremove (data) {
    this.onremove?.(data);
  }

  // _onhistory (history) {
  //   this.history = history
  // }

  _onfocus (editor) {
    this.focusedEditor = editor;
    this.onfocus?.(editor);
  }

  _onselection ({ text }) {
    if (textarea) {
      if (text.length) {
        textarea.select();
      } else {
        textarea.selectionStart = -1;
        textarea.selectionEnd = -1;
      }
    }
    selectionText = text;
  }

  _onresize () {
    this.resize(); // TODO: is this necessary?
    this.onresize?.();
  }

  resize ({ width, height } = {}) {
    this.parent = this.parent ?? this.canvas.parentNode;
    let rect = this.canvas.getBoundingClientRect();
    rect.y += window.pageYOffset;
    rect.x += window.pageXOffset;
    this.rect = rect;
    if ((width || height) && (rect.width !== width || rect.height !== height)) {
      this.worker
        .postMessage({
          call: 'onresize',
          width: width*pixelRatio,
          height: height*pixelRatio
        });
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';
      rect = this.canvas.getBoundingClientRect();
      rect.y += window.pageYOffset;
      rect.x += window.pageXOffset;
      this.rect = rect;
    }
  }

  addSubEditor (data) {
    if (this.hasSetup) {
      this.worker
        .postMessage({
          ...this.data,
          ...data,
          call: 'addSubEditor',
        });
    } else {
      this.toAdd.push(data);
    }
  }

  _onimagebitmap ({ imageBitmap }) {
    this.imageBitmap = imageBitmap;
  }

  handleEvent (type, eventName, e = {}) {
    const data = eventHandlers[type](e, eventName, this);
    if (!data) return false
    // if (ignore) return false

    if (!(data.cmdKey && data.key === 'x')) {
      e.preventDefault?.();
      e.stopPropagation?.();
    }

    // remove editor
    if ((data.ctrlKey || data.metaKey) && data.key === 'b') {
      const { title } = this.focusedEditor;
      if (confirm('Are you sure you want to delete ' + title + '?')) {
        this.worker.postMessage({
          call: 'deleteEditor',
          id: this.focusedEditor.id
        });
      }
    }

    // add editor
    if ((data.ctrlKey || data.metaKey) && data.key === ',') {
      this.ontoadd?.();
    }

    // rename editor
    if ((data.ctrlKey || data.metaKey) && data.key === 'm') {
      // TODO: completely hacky way to remove the textarea while
      // there is title change
      methods.events.setTarget('hover', null, new MouseEvent('mouseout'));
      e.preventDefault();
      ask('Change name', `Type a new name for "${this.focusedEditor.title}"`,
        this.focusedEditor.title).then(async (result) => {
        if (!result) return
        // if (this.id === this.focusedEditor.id) {
        //   const oldTitle = this.title
        //   this.title = result.value
        //   // this.onrename?.(oldTitle, this.title)
        // }
        this.worker
          .postMessage({
            call: 'renameEditor',
            id: this.focusedEditor.id,
            title: result.value
          });
      });
      return false
    }

    this.worker.postMessage({ call: eventName, ...data });
  }
}

const methods = {};

const registerEvents = (parent) => {
  textarea = document.createElement('textarea');
  textarea.style.position = 'fixed';
  textarea.style.zIndex = 1000;
  // textarea.style.left = (e.clientX ?? e.pageX) + 'px'
  // textarea.style.top = (e.clientY ?? e.pageY) + 'px'
  textarea.style.width = '100px';
  textarea.style.height = '100px';
  textarea.style.marginLeft = '-50px';
  textarea.style.marginTop = '-50px';
  textarea.style.opacity = 0;
  textarea.style.visibility = 'none';
  textarea.style.resize = 'none';
  textarea.autocapitalize = 'none';
  textarea.autocomplete = 'off';
  textarea.spellchecking = 'off';
  textarea.value = 0;

  // const createUndoRedo = methods.createUndoRedo = () => {
  //   // create undo/redo capability
  //   ignore = true
  //   textarea.focus()
  //   textarea.select()
  //   document.execCommand('insertText', false, 1)
  //   textarea.select()
  //   document.execCommand('insertText', false, 2)
  //   document.execCommand('undo', false)
  //   textarea.selectionStart = -1
  //   textarea.selectionEnd = -1
  //   ignore = false
  // }

  // const removeUndoRedo = methods.removeUndoRedo = () => {
  //   // remove undo/redo capability
  //   ignore = true
  //   textarea.focus()
  //   textarea.select()
  //   document.execCommand('undo', false)
  //   // document.execCommand('undo', false)
  //   // document.execCommand('undo', false)
  //   textarea.selectionStart = -1
  //   textarea.selectionEnd = -1
  //   // ignore = false
  // }

  textarea.oncut = e => {
    e.preventDefault();
    e.clipboardData.setData('text/plain', selectionText);
    selectionText = '';
    events.targets?.focus?.worker.postMessage({ call: 'onkeydown', cmdKey: true, key: 'x' });
    textarea.selectionStart = -1;
    textarea.selectionEnd = -1;
  };

  textarea.oncopy = e => {
    e.preventDefault();
    e.clipboardData.setData('text/plain', selectionText);
  };

  textarea.onpaste = e => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    events.targets?.focus?.worker.postMessage({ call: 'onpaste', text });
  };

  // textarea.oninput = e => {
  //   if (ignore) return
  //   ignore = true
  //   const editor = events.targets.focus
  //   const needle = +textarea.value

  //   if (needle === 0) { // is undo
  //     document.execCommand('redo', false)
  //     if (editor?.history) {
  //       if (editor.history.needle > 1) {
  //         editor.history.needle--
  //         editor.worker.postMessage({
  //           call: 'onhistory',
  //           needle: editor.history.needle
  //         })
  //       }
  //     }
  //   } else if (needle === 2) { // is redo
  //     document.execCommand('undo', false)
  //     if (editor?.history) {
  //       if (editor.history.needle < editor.history.log.length) {
  //         editor.history.needle++
  //         editor.worker.postMessage({
  //           call: 'onhistory',
  //           needle: editor.history.needle
  //         })
  //       }
  //     }
  //   }
  //   ignore = false
  //   // if (needle !== history.needle) {
  //   //   if (needle >= 1) {
  //   //     history.needle = needle
  //   //     textarea.selectionStart = -1
  //   //     textarea.selectionEnd = -1
  //   //     events.targets?.focus?.postMessage({ call: 'onhistory', needle })
  //   //     // app.storeHistory(editor, history)
  //   //   } else {
  //   //     document.execCommand('redo', false)
  //   //   }
  //   // }
  //   // document.execCommand('redo', false)

  //   textarea.selectionStart = -1
  //   textarea.selectionEnd = -1
  // }

  const targetHandler = (e, type) => {
    // if (ignore) return
    let _target = emptyTarget;
    for (const target of Object.values(editors)) {
      if (events.isWithin(e, target)) {
        _target = target;
        break
      }
    }
    events.setTarget(type, _target, e);
  };

  const rect = parent.getBoundingClientRect();
  const emptyTarget = {
    rect,
    parent,
    handleEvent () {}
  };

  const events = methods.events = {
    ignore: false,
    textarea,
    targets: {},
    setTarget (type, target, e) {
      const previous = this.targets[type];
      let noBlur = false;

      // enable overlayed items to handle their own events
      // so as far as we are concerned, the target is null
      if (target
      && e.target !== textarea
      && e.target !== target.canvas
      && e.target !== target.parent
      && (target !== emptyTarget && events.targets.hover !== emptyTarget)
      ) {
        target = null;
        type = 'hover';
        noBlur = true;
      }

      this.targets[type] = target;

      if (previous !== target) {
        const focus = type === 'focus';
        if (previous && !noBlur) {
          previous.handleEvent(
            focus ? 'window' : 'mouse',
            focus ? 'onblur' : 'onmouseout',
            e
          );
        }
        if (target) {
          target.handleEvent(
            focus ? 'window' : 'mouse',
            focus ? 'onfocus' : 'onmouseenter',
            e
          );
          target.handleEvent('mouse', 'on' + e.type, e);
        }
      }
    },
    isWithin (e, { isVisible, rect, parent }) {
      if (!isVisible) return
      let { left, top, right, bottom } = rect;
      left -= parent.scrollLeft; //+ window.pageXOffset
      right -= parent.scrollLeft; //+ window.pageXOffset
      top -= parent.scrollTop; //+ window.pageYOffset
      bottom -= parent.scrollTop; //+ window.pageYOffset
      if ((e.pageX ?? e.clientX) >= left && (e.pageX ?? e.clientX) <= right
      && (e.pageY ?? e.clientY) >= top && (e.pageY ?? e.clientY) <= bottom) {
        return true
      }
    },
    destroy () {
      const handlers = [
        ...mouseEventHandlers,
        ...keyEventHandlers,
        ...windowEventHandlers
      ];

      for (const [target, eventName, fn] of handlers.values()) {
        target.removeEventListener(eventName, fn);
      }

      window.removeEventListener('mousedown', focusTargetHandler, { capture: true, passive: false });
      window.removeEventListener('mousewheel', hoverTargetHandler, { capture: true, passive: false });
      window.removeEventListener('mousemove', hoverTargetHandler, { capture: true, passive: false });

      document.body.removeChild(textarea);
      textarea.oncut =
      textarea.oncopy =
      textarea.onpaste =
      textarea.oninput = null;
      textarea = null;
    }
  };

  const handlerMapper = (target, type) => eventName => {
    const handler = e => {
      let targets = events.targets;

      if (!targets.forceWithin) {
        if (eventName === 'onmousedown') {
          targetHandler(e, 'focus');
        } else if (eventName === 'onmousewheel' || eventName === 'onmousemove') {
          targetHandler(e, 'hover');
        }
      }
      if (type === 'mouse') {
        if (eventName === 'onmouseup') {
          targets.forceWithin = null;
        }
        if (eventName === 'onmousedown' && !targets.forceWithin) {
          targets.forceWithin = targets.hover;
        }
        if (targets.forceWithin) {
          return targets.forceWithin.handleEvent?.(type, eventName, e)
        }
        if (targets.hover && events.isWithin(e, targets.hover)) {
          return targets.hover.handleEvent?.(type, eventName, e)
        }
      } else if (targets.focus) {
        return targets.focus.handleEvent?.(type, eventName, e)
      }
      if (type === 'window') {
        if (eventName === 'onfocus') {
          return targets.focus?.handleEvent?.(type, eventName, e)
        } else {
          for (const editor of Object.values(editors)) {
            editor.handleEvent?.(type, eventName, e);
          }
        }
      }
    };
    target.addEventListener(
      eventName.slice(2),
      handler,
      { passive: false }
    );
    return [target, eventName.slice(2), handler]
  };

  const mouseEventHandlers = [
    'onmousewheel',
    'onmousedown',
    'onmouseup',
    'onmouseover',
    'onmousemove',
  ].map(handlerMapper(parent, 'mouse'));

  const keyEventHandlers = [
    'onkeydown',
    'onkeyup',
  ].map(handlerMapper(parent, 'key'));

  const windowEventHandlers = [
    'onblur',
    'onfocus',
    'onresize',
    'oncontextmenu',
  ].map(handlerMapper(window, 'window'));

  return events
};

const eventHandlers = {
  window (e, eventName, editor) {
    if (eventName === 'oncontextmenu') {
      return
    }
    if (eventName === 'onresize') {
      return
      // return {
      //   width: editor.width * pixelRatio,
      //   height: editor.height * pixelRatio
      // }
    }
    return {/* todo */}
  },
  mouse (e, eventName, editor) {
    if (textarea) {
      if (eventName === 'onmouseenter') {
        document.body.appendChild(textarea);
        // methods.createUndoRedo()
        textarea.style.pointerEvents = 'all';
        textarea.focus();
      } else if (eventName === 'onmouseout') {
        textarea.style.pointerEvents = 'none';
        // methods.removeUndoRedo()
        document.body.removeChild(textarea);
        textarea.blur();
      }
    }
    const rect = editor.rect;
    const clientX = e.pageX;
    const clientY = e.pageY;
    const deltaX = (e.deltaX || 0) / 1000;
    const deltaY = (e.deltaY || 0) / 1000;
    if (textarea) {
      textarea.style.left = e.clientX + 'px';
      textarea.style.top = e.clientY + 'px';
    }
    return {
      clientX: clientX - rect.x,
      clientY: clientY - rect.y,
      deltaX,
      deltaY,
      left: e.which === 1,
      middle: e.which === 2,
      right: e.which === 3
    }
  },
  key (e, eventName) {
    const {
      key,
      which,
      altKey,
      shiftKey,
      ctrlKey,
      metaKey
    } = e;
    const cmdKey = isMac ? metaKey : ctrlKey;
    if (cmdKey && key === 'r') return false
    // if (cmdKey && key === 'z') return false
    // if (cmdKey && key === 'y') return false
    if (cmdKey && key === 'c') return false
    if (cmdKey && key === 'x') return false
    if (cmdKey && (key === 'v' || key === 'V')) return false
    if (cmdKey && shiftKey && key === 'J') return false
    return {
      key,
      which,
      char: String.fromCharCode(which),
      altKey,
      shiftKey,
      ctrlKey,
      metaKey,
      cmdKey
    }
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

class Rpc {
  #callbackId = 0
  #callbacks = new Map

  constructor () {}

  postCall (method, data, tx) {
    this.port.postMessage({ call: method, ...data }, tx);
  }

  rpc (method, data, tx) {
    return new Promise((resolve, reject) => {
      const id = this.#callbackId++;

      this.#callbacks.set(id, data => {
        this.#callbacks.delete(id);
        if (data.error) reject(data.error);
        else resolve(data);
      });

      this.postCall(method, { data, callback: id }, tx);
    })
  }

  callback (data) {
    this.#callbacks.get(data.responseCallback)(data.data ?? data);
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

// hacky way to switch api urls from dev to prod
const API_URL = location.port.length === 4
  ? 'http://localhost:3000' : location.origin;

let samples = new Map;

const fetchSample = async (audio, remoteUrl) => {
  const url = API_URL + '/fetch?url=' + encodeURIComponent(remoteUrl);

  let sample = samples.get(remoteUrl);

  if (!sample) {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = await audio.decodeAudioData(arrayBuffer);
    const floats = Array(audioBuffer.numberOfChannels).fill(0)
      .map((_, i) => audioBuffer.getChannelData(i));
    sample = floats.map(buf => {
      const shared = new Shared32Array(buf.length);
      shared.set(buf);
      return shared
    });
    samples.set(remoteUrl, sample);
  }

  return sample
};

var initial = `/// guide
// ctrl+enter - start/stop
// ctrl+. - update sound
// bpm(bpm) - set bpm
// mod(sig) - modulo sound to time signature
// sin(hz) tri(hz) saw(hz) ramp(hz) pulse(hz) sqr(hz) noise(seed) - oscillator sound generators
// val(x) - explicit set sound to x
// vol(x)/mul(x) - multiply sound by x (set volume)
// exp(x) - exponential curve
// tanh(x) - hyperbolic tangent s-curve
// on(x,sig,count).dothis() - schedule 'dothis()' to execute when 'x' is reached, in time signature 'sig', looping on 'count'
// on(...).grp().many().calls().together().end() - group many calls together, must call .end() in the end
// out(vol=1) - send sound to main
// plot(zoom=1) - plot sound
// lp1(f) hp1(f) lp(f,q) hp(f,q) bp(f,q) bpp(f,q) ap(f,q) pk(f,q,gain) ls(f,q,gain) hs(f,q,gain) - biquad filters
// delay(sig,feedback,amount) - add delay to sound
// daverb(opts) - add dattorro reverb to sound
// [1,2,3,4].seq(sig) - sequence values to time signature
// [1,2,3,4].slide(sig,speed) - slide values to time signature with sliding speed
// '1 - 1 -'.pat - parses and returns a pattern array
// 'a b c d'.pat - returns an array of note numbers
// 10..note - returns the hz of a number
// 'a b c d'.seq(sig) - shortcut to .pat.seq()
// '1 2 3 4'.slide(sig,speed) - shortcut to .pat.slide()
// example: 'a4 b4 c3 d#3'.seq(sig).note will sequence the hz of these notes
// play(buffer,offset=0,speed=1) - playback an array-like buffer starting at offset and using speed
// 'freesound:123456'.sample - fetches a sample from https://freesound.org/ and returns it as a stereo or mono array
// example: mod(1/2).play('freesound:220752'.sample[0],-19025,1)

bpm(120)

mod(1/4).sin(mod(1/4).val(42.881).exp(.057))
  .exp(8.82).tanh(15.18)
  .on(8,1).val(0)
  .out(.4)

pulse(
  val(50)
  .on(8,1/8).val(70)
  .on(8,1/2,16).mul(1.5)
  .on(16,1/2).mul(2)
  .on(4,16).mul(1.5)
).mod(1/16).exp(10)
  .vol('.1 .1 .5 1'.seq(1/16))
  .lp(700,1.2)
  .on(4,8).delay(1/(512+200*mod(1).sin(1)),.8)
  .on(1,8,16).vol(0)
  .out(.35).plot()

mod(1/16).noise(333).exp(30)
  .vol('.1 .4 1 .4'.seq(1/16))
  .on(8,1/4).mul('1.5 13'.seq(1/32))
  .hs(16000)
  .bp(500+mod(1/4).val(8000).exp(2.85),.5,.5)
  .on(8,2).vol(0)
  .out(.2)

mod(1/2).play('freesound:220752'.sample[0],-19025,1)
  .vol('- - 1 -'.slide(1/8,.5))
  .vol('- - 1 .3'.seq(1/8))
  .tanh(2)
  .out(.3)

mod(4).play('freesound:243601'.sample[0],46000,.95)
  .vol('- - - - - - 1 1 .8 - - - - - - -'.seq(1/16))
  .on(16,1).val(0)
  .delay(1/[100,200].seq(4))
  .daverb()
  .out(.4)

val(0).on(1,1,8).grp()
  .noise()
  .bp(6000)
  .bp(14000)
  .out(.08)
.end()

main.tanh().vol(2)
  .on(8,2).grp()
    .bp(3000+mod(16,.06).cos(sync(16))*2800,4)
    .vol('.7 1.2 1.4 1.9 1.9 2.1 2.2 2.3'.seq(1/4))
  .end()`;

self.bufferSize = 2**19;
self.buffers = [1,2,3].map(() => new Shared32Array(self.bufferSize));
self.isRendering = false;
self.renderTimeout = null;

class Wavepot extends Rpc {
  data = {
    numberOfChannels: 1,
    sampleRate: 44100,
    sampleIndex: 0,
    bufferSize: self.bufferSize,
    barSize: 0,
    plot: {}
  }

  constructor () {
    super();
    Object.assign(self, this.data);
  }

  async setup () {
    await this.rpc('setup', this.data, [this.data.plot.backCanvas]);
  }

  async compile () {
    const result = await this.rpc('compile', { code: editor.value });
    console.log('compile: ', result);
  }

  async render (data) {
    return this.rpc('render', data)
  }

  async fetchSample ({ url }) {
    const sample = await fetchSample(audio, url);
    return { sample }
  }
}

const worker = new Worker('wavepot-worker.js', { type: 'module' });
const wavepot = new Wavepot();

let editor;
let label = 'lastV2';

async function main () {
  const canvas = document.createElement('canvas');
  canvas.className = 'back-canvas';
  canvas.width = window.innerWidth*window.devicePixelRatio;
  canvas.height = window.innerHeight*window.devicePixelRatio;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  wavepot.data.plot.backCanvas = canvas.transferControlToOffscreen();
  wavepot.data.plot.width = window.innerWidth;
  wavepot.data.plot.height = window.innerHeight;
  wavepot.data.plot.pixelRatio = window.devicePixelRatio;
  container.appendChild(canvas);

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
  });

  editor.onchange = async () => {
    localStorage[label] = editor.value;
    // await wavepot.compile()
    // playNext()
  };
  editor.onupdate = async () => {
    localStorage[label] = editor.value;
  };
  container.appendChild(editor.canvas);
  editor.parent = document.body;
  editor.rect = editor.canvas.getBoundingClientRect();
  // TODO: cleanup this shit
  const events = registerEvents(document.body);
  editor.onsetup = () => {
    events.setTarget('focus', editor, { target: events.textarea, type: 'mouseenter' });

    document.body.addEventListener('keydown', e => {
      if (e.key === ' ' && (e.ctrlKey || e.metaKey)) {
        e.stopPropagation();
        e.preventDefault();
        toggle();
        return false
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.stopPropagation();
        e.preventDefault();
        toggle();
        return false
      }

      if (e.key === '.' && (e.ctrlKey || e.metaKey)) {
        e.stopPropagation();
        e.preventDefault();
        editor.update(() => {
          wavepot.compile().then(() => {
            if (!isPlaying) {
              toggle();
            }
            playNext();
          });
        });
        return false
      }
    }, { capture: true });
  };

  window.onresize = () => {
    editor.resize({
      width: window.innerWidth,
      height: window.innerHeight
    });
    // worker.postMessage({
    //   call: 'resize',
    //   width: window.innerWidth,
    //   height: window.innerHeight
    // })
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  };

  await wavepot.register(worker).setup();
}

let audio,
    audioBuffers,
    bufferSourceNode,
    bar = {},
    isPlaying = false,
    playNext = () => {};

let toggle = async () => {
  audio = new AudioContext({
    numberOfChannels,
    sampleRate,
    latencyHint: 'playback' // without this audio glitches
  });

  audioBuffers = [1,2,3].map(() => audio.createBuffer(
    numberOfChannels,
    bufferSize,
    sampleRate
  ));

  let offsetTime = 0;

  const getSyncTime = () => {
    const bar = barSize / sampleRate;
    const time = audio.currentTime - offsetTime;
    const remain = bar - (time % bar);
    return time + remain + offsetTime
  };

  playNext = async () => {
    if (!isPlaying) return false
    if (isRendering) return false

    bar.onended = null;

    const nextWorkerBuffer = buffers.pop();
    if (!nextWorkerBuffer) {
      console.log('no worker buffer available!');
      return
    }

    isRendering = true;
    renderTimeout = setTimeout(() => {
      console.log('Timed out!');
      buffers.push(nextWorkerBuffer);
      isRendering = false;
    }, 10000);

    const { bpm, bufferIndex, timeToRender } = await wavepot.render({ buffer: nextWorkerBuffer });
    console.log('written:', bufferIndex, 'bpm:', bpm);
    clearTimeout(renderTimeout);
    isRendering = false;

    if (!isPlaying) {
      buffers.push(nextWorkerBuffer);
      return
    }

    const nextBuffer = audioBuffers.pop();
    if (!nextBuffer) {
      console.log('no buffer available!');
      return
    }

    for (let i = 0; i < numberOfChannels; i++) {
      const target = nextBuffer.getChannelData(i);
      target.set(nextWorkerBuffer.subarray(0, bufferIndex));
    }

    let syncTime;
    if (offsetTime) {
      syncTime = getSyncTime();
    } else {
      syncTime = audio.currentTime;
    }

    console.log('schedule for:', syncTime - offsetTime);

    offsetTime = syncTime;

    if (bufferSourceNode) {
      bufferSourceNode.stop(syncTime);
    }

    barSize = bufferIndex;

    const duration = barSize / sampleRate;

    bufferSourceNode = audio.createBufferSource();
    bufferSourceNode.buffer = nextBuffer;
    bufferSourceNode.connect(audio.destination);
    bufferSourceNode.loop = true;
    bufferSourceNode.loopStart = 0.0;
    bufferSourceNode.loopEnd = duration;
    const node = bufferSourceNode;
    bufferSourceNode.onended = () => {
      node.disconnect();
      audioBuffers.push(nextBuffer);
      buffers.push(nextWorkerBuffer);
      console.log('ended');
    };

    bar = audio.createConstantSource();
    bar.onended = () => {
      bar.disconnect();
      onbar();
    };
    bar.start(syncTime);
    bar.stop(syncTime + Math.max(0.001, duration - Math.max(duration/2, (timeToRender*.001)*1.3) ));

    bufferSourceNode.start(syncTime);
  };

  console.log('connected node');

  const onbar = () => {
    console.log('bar');
    playNext();
  };

  const start = () => {
    isPlaying = true;
    playNext();
    toggle = () => {
      bufferSourceNode?.stop(0);
      offsetTime = 0;
      isPlaying = false;
      isRendering = false;
      toggle = start;
    };
  };

  toggle = start;

  await wavepot.compile();

  start();
};

main();
