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
const pixelRatio$1 = window.devicePixelRatio;
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
    this.canvas.width = data.width * pixelRatio$1;
    this.canvas.height = data.height * pixelRatio$1;
    this.canvas.style.width = data.width + 'px';
    this.canvas.style.height = data.height + 'px';

    if (!this.pseudoWorker) {
      const workerUrl = new URL('editor-worker.js', import.meta.url).href;
      this.worker = new Worker(workerUrl, { type: 'module' });
      this.worker.onerror = error => this._onerror(error);
      this.worker.onmessage = ({ data }) => this['_' + data.call](data);
    } else {
      this.setupPseudoWorker();
    }
  }

  async setupPseudoWorker () {
    const PseudoWorker = await import(new URL('editor-worker.js', import.meta.url));
    this.worker = new PseudoWorker();
    this.worker.onerror = error => this._onerror(error);
    this.worker.onmessage = ({ data }) => this['_' + data.call](data);
  }

  setColor (color) {
    this.worker.postMessage({ call: 'setColor', color });
  }

  setEditorById (id) {
    this.worker.postMessage({ call: 'setEditorById', id });
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
      pixelRatio: pixelRatio$1,
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
          width: width*pixelRatio$1,
          height: height*pixelRatio$1
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

    if (eventName === 'onkeydown') {
      // remove editor
      if (data.cmdKey && data.key === 'b') {
        const { title } = this.focusedEditor;
        if (confirm('Are you sure you want to delete ' + title + '?')) {
          this.worker.postMessage({
            call: 'deleteEditor',
            id: this.focusedEditor.id
          });
        }
      }

      // add editor
      if (data.cmdKey && data.key === 'u') {
        e.preventDefault();
        this.ontoadd?.(); // ontoadd because onadd is fired from when editor is added
        return false
      }

      // rename editor
      if (data.cmdKey && data.key === 'm') {
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
    }

    this.worker.postMessage({ call: eventName, ...data });
  }
}

const methods = {};

const registerEvents = (parent) => {
  textarea = document.createElement('textarea');
  textarea.style.position = 'fixed';
  textarea.style.zIndex = 100;
  // textarea.style.left = (e.clientX ?? e.pageX) + 'px'
  // textarea.style.top = (e.clientY ?? e.pageY) + 'px'
  textarea.style.width = '100px';
  textarea.style.height = '100px';
  textarea.style.marginLeft = '-50px';
  textarea.style.marginTop = '-50px';
  textarea.style.opacity = 0;
  textarea.style.visibility = 'none';
  textarea.style.resize = 'none';
  textarea.style.cursor = 'default';
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
    if (cmdKey && key === '+') return false
    if (cmdKey && key === '-') return false
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

const API_URL = !location.port ? location.origin : 'http://localhost:3000';

let samples = new Map;

const fetchSample = async (audio, remoteUrl) => {
  const url = getFetchUrl(remoteUrl);

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

const getFetchUrl = (remoteUrl) => {
  const url = API_URL + '/fetch?url=' + encodeURIComponent(remoteUrl);
  return url
};

var initial = `{"id":"4moxr","value":"bpm(120)\n\ncolor('#f10')\n\nyt(['FJ3N_2r6R-o','guVAeFs5XwE','oHg5SJYRHA0'].seq(2))\n  [['pixelmess','noop'].seq(1)](2)\n  .wobble(1)\n  .mirror([2.5,5,.5,1,3].seq(1/4))\n  .glitch()\n  .out()\n\nmod(1/4).sin(mod(1/4).val(42.881).exp(.057))\n  .exp(8.82).tanh(15.18)\n  .on(8,1).val(0)\n  .out(.4)\n\npulse(\n  val(50)\n  .on(8,1/8).val(70)\n  .on(8,1/2,16).mul(1.5)\n  .on(16,1/2).mul(2)\n  .on(4,16).mul(1.5)\n).mod(1/16).exp(10)\n  .vol('.1 .1 .5 1'.seq(1/16))\n  .lp(700,1.2)\n  .on(4,8).delay(1/(512+200*mod(1).sin(1)),.8)\n  .on(1,8,16).vol(0)\n  .widen(.4)\n  .out(.35)\n\nmod(1/16).noise(333).exp(30)\n  .vol('.1 .4 1 .4'.seq(1/16))\n  .on(8,1/4).mul('1.5 13'.seq(1/32))\n  .hs(16000)\n  .bp(500+mod(1/4).val(8000).exp(2.85),.5,.5)\n  .on(8,2).vol(0)\n  .widen(.7)\n  .out(.2)\n\nmod(1/2).play('freesound:220752'.sample,-19025,1)\n  .vol('- - 1 -'.slide(1/8,.5))\n  .vol('- - 1 .3'.seq(1/8))\n  .tanh(2)\n  .widen(.04)\n  .out(.3)\n\nmod(4).play('freesound:243601'.sample,46000,.95)\n  .vol('- - - - - - 1 1 .8 - - - - - - -'.seq(1/16))\n  .on(16,1).val(0)\n  .delay(1/[100,200].seq(4))\n  .daverb(.2,5352)\n  .out(.23)\n\non(1,1,8).grp()\n  .noise()\n  .bp(6000)\n  .bp(14000)\n  .out(.08)\n.end()\n\nmain\n  .on(8,2)\n  .grp()\n    .bp(3000+mod(16,.06).cos(sync(16))*2800,4)\n    .pan(sin(sync(8)))\n  .end()\n  .tanh(1.5)\n  .plot()","title":"Techno. Chrome. Dance. This."}
/* -^-^-^-^- */
{"id":"34cqq","value":"bpm(100)\n\ncolor('#46f')\n\nmod(val(1/4).on(8,1).val(1/8).on(16,1/2).val(1/16))\n  .sin(mod(1/4).val(42.881).exp(.057))\n  .exp(8.82).tanh(15.18)\n  .on(16,1).val(0)\n  .out(.4)\n\nsaw('d d# f f#'.seq(1/4).note/4)\n  .mod(1/16).exp(10)\n  .vol('.5 .1 .5 1'.seq(1/4))\n  .lp(1800,1.2)\n  .delay(1/[200,150].seq(4))\n  .on(1,8,16).vol(0)\n  .out(.35)\n\nmod(1/16).noise(70).exp(19)\n  .vol('.1 .4 1 .4'.seq(1/16))\n  .on(8,1/4).mul('2 1'.seq(1/15))\n  .bp(2500+mod(1/8).val(2000).exp(2.85),1.2,.5)\n  .on(8,2).vol(0)\n  .out(.2)\n\nmod(1/2).play('freesound:220752'.sample,-19025,1)\n  .vol('- - 1 -'.slide(1/8,.5))\n  .vol('- - 1 .3'.seq(1/8))\n  .tanh(2)\n  .out(.7)\n\nmod(4).play('freesound:243601'.sample,26000,1.1)\n  .vol('- - - - - - 1 1 .8 - - - - - - -'.seq(1/16))\n  .on(16,1).val(0)\n  .delay(1/[100,200].seq(4))\n  .daverb()\n  .out(.4)\n\non(1,1,8).grp()\n  .noise()\n  .bp(6000)\n  .bp(14000)\n  .out(.08)\n.end()\n\nmain.tanh(1)\n  .on(8,2).grp()\n    .bp(3000+mod(16,.06).cos(sync(16))*2800,4)\n    .vol('.7 1.2 1.4 1.9 1.9 2.1 2.2 2.3'.seq(1/4))\n  .end().plot()","title":"Techno. Yo."}
/* -^-^-^-^- */
{"id":"4qfhk","value":"bpm(133)\n\ncolor('#2f0')\n\nyt(['PcI8Kq9y6cA'].seq(1))\n  .mirror([.5,1,1.6,2.1,1.2,2.5].seq(1/4))\n  .glitch()\n  .out()\n\nmod(1/4,.5).sin(50+mod(1/4).val(70).exp(14))\n  .soft(1)\n  .exp(15)\n  .soft(2.5)\n  .tanh(1.5)\n  .daverb(.5,14552)\n  .out(val(1).on(8,16).val(0)).plot(10)\n\nmod(1/16).play('freesound:183105'.sample,0,1.6,bar)\n  .vol('.1 .4 1 .4 .1 .3 1 .7'.seq(1/16))\n  .daverb(.07,1222)\n  .widen(.78)\n  .out(.18)\n\nmod(1/8,.5).tri('f f f5 f6'.slide(1/16,4).note/20)\n  .soft(8)\n  .exp(10)\n  .soft(18)\n  .lp(1300,.32)\n  .lp(1000+sin(sync(64))*400,1.5)\n  .on(8,16).bp(600+sin(sync(128))*300,1)\n  .daverb(.27,1225)\n  .widen(.04)\n  .out(.8)\n\nmod(1/16).play('freesound:117085'.sample,0,\n  val(val(1).on(9,16,16).val(3).on(10,16,16).val(4))\n     .on(16,1/2).val(2).on(38,1/8).val(4))\n  .daverb(.25,1666)\n  .out(.27)","title":"Find Me"}`.replaceAll('\n/* -^-^-^-^- */\n', '!!!').replaceAll('\n', '\\n').replaceAll('!!!','\n/* -^-^-^-^- */\n');

const getContext = (canvas, { alpha = true, antialias = false } = {}) => {
  const gl = canvas.getContext('webgl2', { alpha, antialias });
  gl.getExtension('EXT_color_buffer_float');
  return gl
};

const createShader = (gl, { type, src }) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src.trim());
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(shader))
  return shader
};

const compileProgram = (gl, {
  vertex,
  fragment,
  buffers = [],
  attrs = {},
  uniforms = {},
  cleanup = true
}) => {
  const program = gl.createProgram();
  if (typeof vertex === 'string') {
    vertex = createShader(gl, { type: gl.VERTEX_SHADER, src: vertex });
  }
  if (typeof fragment === 'string') {
    fragment = createShader(gl, { type: gl.FRAGMENT_SHADER, src: fragment });
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  buffers.forEach(([buffer, _attrs]) => {
    Object.entries(_attrs).forEach(([key, value]) => {
      value.buffer = buffer;
      attrs[key] = value;
    });
  });
  const vao = createVertexArray(gl, program, attrs);
  gl.linkProgram(program);
  setUniforms(gl, program, uniforms);
  gl.useProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(program))
  if (cleanup) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
  }
  program.vao = vao;
  return program
};

const putBuffer = (gl, {
  type = gl.ARRAY_BUFFER,
  buffer = gl.createBuffer(),
  data,
  usage = gl.STATIC_DRAW
}) => {
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, data, usage);
  gl.bindBuffer(type, null);
  return buffer
};

const putTexture1 = (gl, {
  texture = createTexture(gl),
  target = gl.TEXTURE_2D,
  level = 0,
  internal = gl.RGBA,
  format = gl.RGBA,
  type = gl.UNSIGNED_BYTE,
  data = null,
  flipY = false,
}) => {
  gl.bindTexture(target, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
  gl.texImage2D(target, level, internal, format, type, data);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.bindTexture(target, null);
};

const putSubTexture = (gl, {
  texture = createTexture(gl),
  target = gl.TEXTURE_2D,
  level = 0,
  xOffset = 0,
  yOffset = 0,
  width = 1,
  height = 1,
  format = gl.RGBA,
  type = gl.UNSIGNED_BYTE,
  data = null,
  flipY = false,
}) => {
  gl.bindTexture(target, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
  gl.texSubImage2D(target, level, xOffset, yOffset, width, height, format, type, data);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.bindTexture(target, null);
};

const createTexture = (gl, {
  texture = gl.createTexture(),
  target = gl.TEXTURE_2D,
  level = 0,
  internal = gl.RGBA,
  width = 1,
  height = 1,
  border = 0,
  format = gl.RGBA,
  type = gl.UNSIGNED_BYTE,
  data = null,
  min = gl.NEAREST,
  mag = gl.NEAREST,
  wrap_s = gl.CLAMP_TO_EDGE,
  wrap_t = gl.CLAMP_TO_EDGE,
  flipY = false,
}) => {
  gl.bindTexture(target, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
  gl.texImage2D(target, level, internal, width, height, border, format, type, data);
  gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, min);
  gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, mag);
  gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrap_s);
  gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrap_t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.bindTexture(target, null);
  return texture
};

const bufferMap = new Map;

const createVertexArray = (gl, program, attrs = {}) => {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  Object.entries(attrs).forEach(([name, {
    buffer,
    type = gl.ARRAY_BUFFER,
    size = 2,
    format = gl.SHORT,
    normalized = false,
    stride = 0,
    offset = 0,
  }], loc) => {
    if (!(buffer instanceof WebGLBuffer)) {
      if (!bufferMap.has(buffer)) {
        const key = buffer;
        buffer = putBuffer(gl, { data: buffer });
        bufferMap.set(key, buffer);
      } else {
        buffer = bufferMap.get(buffer);
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bindAttribLocation(program, loc, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, format, normalized, stride, offset);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  });
  gl.bindVertexArray(null);
  return vao
};

const setUniforms = (gl, program, uniforms = {}) => {
  gl.useProgram(program);
  for (const [key, [type, value]] of Object.entries(uniforms)) {
    gl['uniform' + type](gl.getUniformLocation(program, key), value);
  }
  gl.useProgram(null);
};

const setTextures = (gl, textures = []) => {
  textures.forEach((texture, i) => {
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(texture.target, texture.texture);
  });
};

const draw = (gl, {
  program,
  width,
  height,
  fbo = null,
  first = 0,
  count = 4,
  type = gl.TRIANGLE_STRIP,
  textures = [],
  uniforms = {},
}) => {
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.viewport(0, 0, width, height);

  setUniforms(gl, program, uniforms);
  setTextures(gl, textures);

  gl.useProgram(program);
  gl.bindVertexArray(program.vao);

  gl.drawArrays(type, first, count);

  gl.bindVertexArray(null);
  gl.useProgram(null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

const createScreen = (gl, {
  width,
  height,
  wrap_s = gl.REPEAT,
  wrap_t = gl.REPEAT,
}) => {
  const textures = [1,2].map(() => createTexture(gl, {
    width,
    height,
    wrap_s,
    wrap_t,
    // min: gl.LINEAR,
    // mag: gl.LINEAR,
  }));

  let textureSwapIndex = 0;
  let targetTexture = textures[textureSwapIndex];
  let sourceTexture = textures[1 - textureSwapIndex];

  const fbo = gl.createFramebuffer();
  const rbo = gl.createRenderbuffer();

  const screen = {
    fbo,
    target: gl.TEXTURE_2D,
    texture: sourceTexture,
    start: () => {
      textureSwapIndex = 0;
    },
    update: () => {
      targetTexture = textures[textureSwapIndex];
      textureSwapIndex = 1 - textureSwapIndex;
      sourceTexture = textures[textureSwapIndex];
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);
      screen.texture = sourceTexture;
      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },
    draw: (targetFbo = null) => {
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fbo);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, targetFbo);
      gl.blitFramebuffer(
        0, 0, width, height,
        0, 0, width, height,
        gl.COLOR_BUFFER_BIT,
        gl.NEAREST
      );
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    }
  };

  screen.screen = screen;

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);

  return screen
};

const compileModule = (gl, context, program) => {
  let opts;

  const { width, height } = context;

  if (typeof program === 'function') {
    // unpack opts sugar
    opts = program(context);
    if (typeof opts.type === 'string') {
      opts.type = gl[opts.type];
    }
    if (typeof opts.vertex === 'string') {
      // unpack program sugar
      opts.uniforms = {
        ...(opts.uniforms ?? {}),
        ...context.uniforms,
      };

      opts = {
        program: compileProgram(gl, opts),
        type: opts.type,
        count: opts.count,
        textures: opts.textures,
        draw: opts.draw,
        update: opts.update,
      };
    }
    if (opts.textures) {
      if (typeof opts.textures === 'function') {
        const textures = opts.textures;
        opts.texturesFn = c => {
          return Object.entries(textures(c))
            .map(([key, tex], i) => {
              setUniforms(gl, opts.program, { [key]: ['1i', i] });
              return tex
            })
        };
        delete opts.textures;
      } else {
        opts.textures = Object.entries(opts.textures)
          .map(([key, tex], i) => {
            setUniforms(gl, opts.program, { [key]: ['1i', i] });
            return tex
          });
      }
    }
    opts = { width, height, ...opts };
  } else {
    opts = { width, height, program };
  }

  return (...extra) => {
    extra = Object.assign({}, ...extra);
    const c = {
      ...context,
      ...extra,
      sources: {
        ...context.sources,
        ...extra,
      }
    };
    draw(gl, {
      ...opts,
      ...c,
      textures: opts.textures ?? opts.texturesFn?.(c) ?? [],
      uniforms: {
        ...(opts.draw?.(c, c, c) ?? {}),
        ...context.uniforms,
      },
      fbo: c.fbo
    });
  }
  // ,
  //   update: (...extra) => {
  //     const c = { ...context, ...Object.assign({}, ...extra) }
  //     opts.update?.(c, c, c)
  //   },
  //   stop: (...extra) => {
  //     const c = { ...context, ...Object.assign({}, ...extra) }
  //     opts.stop?.(c, c, c)
  //   }
  // }
};

var Noise = (gl, { size = 64 }) => {
  const length = size * size;

  const random = () => (Math.random() * size | 0);

  const target = gl.TEXTURE_2D;

  const numberOfSets = 50;
  const randomSets = Array.from({ length: numberOfSets },
    () => Uint8Array.from({ length }, random));

  const pickRandom = () => randomSets[Math.random() * numberOfSets | 0];

  const texture = createTexture(gl, {
    target,
    width: size,
    height: size,
    internal: gl.LUMINANCE,
    format: gl.LUMINANCE,
    wrap_s: gl.REPEAT,
    wrap_t: gl.REPEAT,
    data: pickRandom(),
  });

  const update = () => {
    putSubTexture(gl, {
      target,
      texture,
      width: size,
      height: size,
      format: gl.LUMINANCE,
      data: pickRandom()
    });
  };

  return { target, texture, update }
};

const Protocol = {
  youtube: {
    setup (v, url) {
      v.crossOrigin = 'anonymous';
      v.autoplay = true;
      v.loop = true;
    },
    src: url => getFetchUrl(url)
  }
};

const video = document.createElement('video');
video.volume = 0.000000000000001;

var Video = (gl, url) => {
  const [protocol, id] = url.split(':');

  Protocol[protocol].setup(video, url);

  let src = Protocol[protocol].src(url);
  video.src = src;

  const target = gl.TEXTURE_2D;

  const texture = createTexture(gl, {
    data: new Uint8Array([255,0,0,255]),
  });

  const noop = () => {};

  const updateVideo = () => {
    if (video.readyState < 2) return
    // NOTE: this used to be putSubTexture1
    // but turns out putTexture1 is 4x-5x faster
    putTexture1(gl, {
      texture,
      data: video,
      // flipY: true
    });
  };

  let updateStrategy = noop;

  video.onemptied = e => {
    updateStrategy = noop;
  };

  video.onplaying = e => {
    if (video.readyState < 2) return
    putTexture1(gl, {
      texture,
      data: video,
      // flipY: true
    });

    updateStrategy = updateVideo;
  };

  const update = () => updateStrategy();

  const stop = () => {
    video.pause();
    // opts.stop?.(video)
  };

  return {
    video,
    target,
    texture,
    update,
    stop,
    set (newUrl) {
      let src = Protocol[protocol].src(url);
      video.src = src;
    }
  }
};

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

var merge = c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'layer_a': c.a.screen,
    'layer_b': c.b.screen,
  }),
  vertex: `
    #version 300 es

    precision lowp float;

    in vec4 a_pos;
    in vec2 a_st;

    out vec2 v_texCoord;

    void main () {
      gl_Position = a_pos;
      v_texCoord = a_st;
    }
  `,
  fragment: `
    #version 300 es

    precision lowp float;

    uniform sampler2D layer_a;
    uniform sampler2D layer_b;

    in vec2 v_texCoord;

    out vec4 fragColor;

    void main () {
      vec4 A = texture(layer_a, v_texCoord);
      vec4 B = texture(layer_b, v_texCoord);

      fragColor.a = B.a+A.a - A.a*B.a;
      fragColor.rgb = (A.rgb * A.a * (1. - B.a) + B.rgb * B.a);
    }
  `
});

var video$1 = c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'u_video': c.sources.video,
  }),
  vertex: `
    #version 300 es

    precision lowp float;

    in vec4 a_pos;
    in vec2 a_st;

    out vec2 v_texCoord;

    void main () {
      vec4 flip_xy = vec4(1.,-1.,1.,1.);
      vec4 clip_pos = a_pos * flip_xy;

      gl_Position = clip_pos;

      v_texCoord = a_st;
    }
  `,
  fragment: `
    #version 300 es

    precision lowp sampler2DArray;
    precision lowp float;

    uniform sampler2D u_video;

    in vec2 v_texCoord;

    out vec4 fragColor;

    void main () {
      fragColor = texture(u_video, v_texCoord);
    }
  `
});

var glitch = c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'iChannel0': c.sources.screen,
    'iChannel1': c.sources.noise64,
  }),
  uniforms: {
    'iResolution': ['3fv', c.resolution],
  },
  draw: c => ({
    'iTime': ['1f', c.time],
  }),
  vertex: `
    #version 300 es

    precision lowp float;

    in vec4 a_pos;
    in vec2 a_st;

    out vec2 v_texCoord;

    void main () {
      gl_Position = a_pos;
      v_texCoord = a_st;
    }
  `,
  fragment: `
    #version 300 es

    precision lowp float;

    uniform sampler2D iChannel0;
    uniform sampler2D iChannel1;
    uniform vec3 iResolution;
    uniform float iTime;

    in vec2 v_texCoord;

    out vec4 fragColor;

    float rand(float n){return fract(sin(n) * 43758.5453123);}

    float noise(float p){
      float fl = floor(p);
      float fc = fract(p);
      return mix(rand(fl), rand(fl + 1.0), fc);
    }

    float blockyNoise(vec2 uv, float threshold, float scale, float seed)
    {
      float scroll = floor(iTime + sin(11.0 *  iTime) + sin(iTime) ) * 0.77;
      vec2 noiseUV = uv.yy / scale + scroll;
      float noise2 = texture(iChannel1, noiseUV).r;

      float id = floor( noise2 * 20.0);
      id = noise(id + seed) - 0.5;

      if ( abs(id) > threshold )
        id = 0.0;

      return id;
    }

    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
      float rgbIntesnsity = 0.1 + 0.1 * sin(iTime* 3.7);
      float displaceIntesnsity = 0.2 +  0.3 * pow( sin(iTime * 1.2), 5.0);
      float interlaceIntesnsity = 0.01;
      float dropoutIntensity = 0.1;

      vec2 uv = fragCoord/iResolution.xy;

      float displace = blockyNoise(uv + vec2(uv.y, 0.0), displaceIntesnsity, 25.0, 66.6);
      displace *= blockyNoise(uv.yx + vec2(0.0, uv.x), displaceIntesnsity, 111.0, 13.7);

      uv.x += displace ;

      vec2 offs = 0.1 * vec2(blockyNoise(uv.xy + vec2(uv.y, 0.0), rgbIntesnsity, 65.0, 341.0), 0.0);

      float colr = texture(iChannel0, uv-offs).r;
      float colg = texture(iChannel0, uv).g;
      float colb = texture(iChannel0, uv +offs).b;

      float line = fract(fragCoord.y / 3.0);
      vec3 mask = vec3(3.0, 0.0, 0.0);
      if (line > 0.333)
        mask = vec3(0.0, 3.0, 0.0);
      if (line > 0.666)
        mask = vec3(0.0, 0.0, 3.0);

      float maskNoise = blockyNoise(uv, interlaceIntesnsity, 90.0, iTime) * max(displace, offs.x);

      maskNoise = 1.0 - maskNoise;
      if ( maskNoise == 1.0)
          mask = vec3(1.0);

      float dropout = blockyNoise(uv, dropoutIntensity, 11.0, iTime) * blockyNoise(uv.yx, dropoutIntensity, 90.0, iTime);
      mask *= (1.0 - 5.0 * dropout);

      fragColor = vec4(mask * vec3(colr, colg, colb), 1.0);
    }

    void main () {
      vec2 fragCoord = v_texCoord * iResolution.xy;
      mainImage(fragColor, fragCoord);
      fragColor.a = 1.0;
    }
  `
});

var pixelmess = c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'iChannel0': c.sources.noise256,
    'iChannel1': c.sources.screen,
  }),
  uniforms: {
    'iResolution': ['3fv', c.resolution],
  },
  draw: c => ({
    'N': ['1f', c.size ?? 20],
    'iTime': ['1f', c.time],
  }),
  vertex: `
    #version 300 es

    precision lowp float;

    in vec4 a_pos;
    in vec2 a_st;

    out vec2 v_texCoord;

    void main () {
      gl_Position = a_pos;
      v_texCoord = a_st;
    }
  `,
  fragment: `
    #version 300 es

    precision lowp float;

    uniform sampler2D iChannel0;
    uniform sampler2D iChannel1;
    uniform vec3 iResolution;
    uniform float iTime;
    uniform float N;

    in vec2 v_texCoord;

    out vec4 fragColor;

    #define PI 3.1415
    #define TAO 6.283
    #define CLAMP_VAL 0.0

    float remap(float a0, float b0, float a1, float b1, float x) {
      return (b0 - x) / (b0-a0) * (b1-a1) + a1;
    }

    void mainImage( out vec4 fragColor, in vec2 fragCoord ){
        float i = iTime;
        vec2 mouse = vec2(0., 0.);
        vec2 uv = fragCoord.xy / iResolution.xy;
        uv = 1.0-uv;
        vec2 dividor = vec2(N)/iResolution.xy;

        vec2 p = mod(uv, dividor);

        vec2 tuv = vec2( remap(0.5, 1.5, 0.-mouse.x, 1.+mouse.x, uv.x+0.5),
                         remap(0.5, 1.5, 0.-mouse.x, 1.+mouse.x, uv.y+0.5)
                       );
        mat2 m = mat2(1,sin(uv.x*i),cos(uv.y*i),1.);
        //uv.x += 10.0*sin(iTime*0.0055);
        float scale = 1.; //sin(iTime*.2)*10.;
        vec4 n = texture(iChannel0, uv/scale-p);
        //vec4 n = texture(iChannel0, p);
        //vec4 n = texture(iChannel0, uv-p);
        //vec4 n = texture(iChannel0, uv-p*m);

        vec4 c = texture(iChannel1, tuv);
        c.rgb = sin(cos(mod(c.rgb,n.rgb)*TAO)*TAO);

        fragColor = vec4(c.r,c.r,c.r,1.0);
    }

    void main () {
      vec2 fragCoord = v_texCoord * iResolution.xy;
      mainImage(fragColor, fragCoord);
      fragColor.a = 1.0;
    }
  `
});

var wobble = c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'u_screen': c.sources.screen,
  }),
  draw: c => ({
    't': ['1f', c.time],
    'speed': ['1f', c.speed ?? 1],
  }),
  vertex: `
    #version 300 es

    precision lowp float;

    uniform float speed;
    uniform float t;

    in vec4 a_pos;
    in vec2 a_st;

    out vec2 v_texCoord;

    void main () {
      float s = speed * t;
      vec4 pos = vec4(
        a_pos.xy
      * vec2(sin(s), cos(s))
      + vec2(sin(s*.2), cos(s*.2))
      , a_pos.zw);
      gl_Position = pos;
      v_texCoord = a_st;
    }
  `,
  fragment: `
    #version 300 es

    precision lowp float;

    uniform sampler2D u_screen;

    in vec2 v_texCoord;

    out vec4 fragColor;

    void main () {
      fragColor = texture(u_screen, v_texCoord);
    }
  `
});

var mirror = c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'u_screen': c.sources.screen,
  }),
  draw: c => ({
    'times': ['1f', c.times ?? 4]
  }),
  vertex: `
    #version 300 es

    precision lowp float;

    in vec4 a_pos;
    in vec2 a_st;

    out vec2 v_texCoord;

    void main () {
      gl_Position = a_pos;
      v_texCoord = a_st;
    }
  `,
  fragment: `
    #version 300 es

    precision lowp float;

    uniform sampler2D u_screen;

    uniform float times;

    in vec2 v_texCoord;

    out vec4 fragColor;

    void main () {
      vec4 col = texture(u_screen, v_texCoord*times-times/2.+.5);
      fragColor = vec4(col.rgb,1.0);
    }
  `
});

self.t = 0;
self.frame = 0;
self.pixelRatio = window.devicePixelRatio;

self.color = '#f00';
self.videos = {};
self.screens = [];
self.scale = 2;

Array.prototype.seq = function (x=1) {
  let N = this.length;
  return this[(( (t*(1/(x))) % N + N) % N)|0]
};

class Shader {
  constructor (parent) {
    const canvas = document.createElement('canvas');
    canvas.className = 'shader-canvas';
    scale = 2;
    const width = canvas.width = window.innerWidth/scale;
    const height = canvas.height = window.innerHeight/scale;
    canvas.style.width = width*scale + 'px';
    canvas.style.height = height*scale + 'px';
    canvas.style.position = 'absolute';
    canvas.style.imageRendering = 'pixelated';
    parent.appendChild(canvas);

    this.canvas = canvas;
    this.gl = self.gl = getContext(canvas);

    this.setup();
    this.resize();

    this.sources = self.sources = {
      // audio: Audio(gl, { size: 1024, depth: 60*8, src: './music/alpha_molecule.ogg', start: 43 }),
      // webcam: Webcam(gl),
      // youtube: Youtube(gl),
      noise64: Noise(gl, { size: 64 }),
      noise256: Noise(gl, { size: 256 }),
    };

    this.buffers = {
      quad: [
        new Int16Array([
          -1, -1, 0, 0,
          -1,  1, 0, 1,
           1, -1, 1, 0,
           1,  1, 1, 1,
        ]), {
        'a_pos': { stride: 8 },
        'a_st': { stride: 8, offset: 4 },
        }],
    };

    this.programs = {
      merge: compileModule(gl, this, merge),
      video: compileModule(gl, this, video$1),
      glitch: compileModule(gl, this, glitch),
      pixelmess: compileModule(gl, this, pixelmess),
      wobble: compileModule(gl, this, wobble),
      mirror: compileModule(gl, this, mirror),
    };

    this.resize();
  }

  setup () {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.clear();
  }

  clear () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  tick () {
    t = this.time;
    if (parseFloat((t % 1).toFixed(2)) === 0) console.log(t);

    this.shaderFunc?.();

    screens.main.draw();

    screens_i = 1; // 0 is main

    this.frame = ++frame;
    if (frame % 4 == 0) {
      this.sources.noise64.update();
      this.sources.noise256.update();
    }
  }

  stop () {
    Object.values(this.sources).forEach(s => s.stop?.());
  }

  resize () {
    const canvas = this.canvas;
    const width = canvas.width = window.innerWidth/scale;
    const height = canvas.height = window.innerHeight/scale;
    canvas.style.width = width*scale + 'px';
    canvas.style.height = height*scale + 'px';

    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.resolution = [
      this.width,
      this.height,
      pixelRatio
    ];

    self.screens_i = 1;
    self.screens = Array.from(Array(10), () => (new Screen(this)));
    self.screens.main = self.screens[0];

    // self.screens.forEach(screen => Object.assign(screen, this))
  }

  // NOTE: this code is wrong, but we are trading
  // correctness and complexity for simplicity and
  // improved user experience, hence we use
  // heuristics to parse out any shader related code.
  // The alternative would be AST parsing where in that
  // case we might as well build a new language, and we
  // don't want to go down that path.
  extractAndCompile (code) {
    let blocks = code.split('\n\n');

    const methods = Object.keys(Shader.api);

    const rest = [];
    const ours = [];

    blocks.forEach(block => {
      for (const m of methods) {
        if (block.includes(m + '(')) {
          ours.push(block);
          return
        }
      }
      rest.push(block);
    });

    code = ours.join('\n\n').trim();
    if (!code.length) {
      return { shaderFunc: null, rest: rest.join('\n\n') }
    }

    // compile
console.log(code);
    let func = new Function(
      ...methods,
      code
    ).bind(this, ...Object.values(Shader.api));

    return { shaderFunc: func, rest: rest.join('\n\n') }
  }
}

class Screen {
  constructor (context) {
    Object.assign(this, context);
    this.screen = createScreen(gl, this);
    this.fbo = this.screen.fbo;
  }

  yt (id) {
    return this.vid('youtube:' + id)
  }

  vid (url) {
    let v = videos[url];
    if (!v) {
      v = videos[url] = Video(gl, url);
      this._video_url = url;
    }
    if (this._video_url !== url) {
      v.set(url);
      this._video_url = url;
    } else {
      if (frame % 2 === 0) {
        v.update();
      }
    }
    this.sources.video = v;
    this.programs.video(this);
    return this
  }

  color (color) {
    if (color !== self.color) {
      self.color = color;
      self.editor.setColor(color);
    }
  }

  glitch () {
    this.screen.update();
    this.programs.glitch(this);
    return this
  }

  pixelmess (size = 3) {
    this.screen.update();
    this.programs.pixelmess(this, { size: window.innerHeight / size / scale });
    return this
  }

  wobble (speed = 1) {
    this.screen.update();
    this.programs.wobble(this, { speed });
    return this
  }

  mirror (times = 4) {
    this.screen.update();
    this.programs.mirror(this, { times });
    return this
  }

  noop () {
    return this
  }

  draw () {
    this.screen.draw();
  }

  out (target = screens.main) {
    target.screen.update();
    this.screen.update();
    this.programs.merge(target, { a: target, b: this });
  }
}

Shader.api = {};
const IGNORE_METHODS = ['constructor','out'];
Object.getOwnPropertyNames(Screen.prototype)
.filter(method => !IGNORE_METHODS.includes(method))
.forEach(method => {
  const { args, argNames } = parseFn(Screen.prototype[method]);
  Shader.api[method] = new Function(...args,
    `
return screens[screens_i++].${method}(${argNames})
    `
  );
});

// dom helpers

const El = (className = '', html = '', props = {}) => {
  const el = document.createElement(props.tag ?? 'div');
  el.className = className;
  el.innerHTML = html;
  Object.assign(el, props);
  return el
};

const Button = (className, html, props = {}) =>
  El(className, html, { ...props, tag: 'button' });

const Icon = (size, name, path, extra = '') =>
  Button(`icon ${name}`, `<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${size}"
    height="${size}"
    viewBox="0 0 32 32"
    ><path class="path" d="${path}" />${extra}</svg>`);

class ButtonLogo {
  constructor (el) {
    this.el = el;
    this.logo = Icon(23, 'logo', 'M4.9 6 A 13.8 13.8 0 1 0 27.4 6', '<path class="path wave" d="M9.7 13.5 Q12 10.5, 15.5 13.9 T 22 13.9" />');
    this.logo.onclick = () => this.onclick?.();
    this.el.appendChild(this.logo);
  }
}

class ButtonPlayPause {
  constructor (el, size = 21) {
    this.el = el;
    this.play = Icon(size, 'play', 'M6 2 L6 28 26 15 Z');
    this.pause = Icon(size, 'play pause', 'M18 2 L18 28 M6 2 L6 28');
    this.play.onmousedown = () => {
      // this.setIconPause()
      this.onplay?.();
    };
    this.pause.onmousedown = () => {
      // this.setIconPlay()
      this.onpause?.();
    };
    this.setIconPause = () => {
      this.play.parentNode.replaceChild(this.pause, this.play);
    };
    this.setIconPlay = () => {
      this.pause.parentNode.replaceChild(this.play, this.pause);
    };
    this.el.appendChild(this.play);
  }
}

class ButtonSave {
  constructor (el) {
    this.el = el;
    // this.save = Icon(22, 'save', 'M5 27  L30 27  30 10  25 4  10 4  5 4  Z  M12 4  L12 11  23 11  23 4  M12 27  L12 17  23 17  23 27')
    // this.save = Icon(22, 'save', 'M5 27  L30 27  30 10  25 4  10 4  5 4  Z  M11 4  L11 10  21 10  21 4', '<circle class="path" cx="17.5" cy="18.5" r="4" />')
    this.save = Icon(23, 'save', 'M5 27  L30 27  30 10  25 4  10 4  5 4  Z  M10.5 9.5  L21 9.5', '<circle class="path" cx="17.4" cy="18.5" r="3.4" />');
    // this.save = Icon(32, 'save', 'M7 26 L28 26', '<circle class="path" cx="17.4" cy="14.4" r="5" />')
    // this.save = Icon(28, 'save', 'M28 22 L28 30 4 30 4 22 M16 4 L16 24 M8 16 L16 24 24 16')
    // this.save = Icon(24, 'save', 'M17 4 Q13 6, 16 10.5 T 15 17  M7 16 L16 24 25 16 ')
    // this.save = Icon(30, 'save', 'M9 22 C0 23 1 12 9 13 6 2 23 2 22 10 32 7 32 23 23 22 M11 18 L16 14 21 18 M16 14 L16 29')
    // this.save = Icon(28, 'save', 'M14 9 L3 9 3 29 23 29 23 18 M18 4 L28 4 28 14 M28 4 L14 18')
    // this.save = Icon(28, 'save', 'M28 22 L28 30 4 30 4 22 M16 4 L16 24 M8 12 L16 4 24 12')

    // this.save.disabled = true
    this.save.onclick = () => this.onsave?.();
    this.el.appendChild(this.save);
  }

  enable () {
    this.save.disabled = false;
  }

  disable () {
    this.save.disabled = true;
  }
}

class ButtonHeart {
  constructor (el) {
    this.el = el;
    this.heart = Icon(19.8, 'like', 'M4 16 C1 12 2 6 7 4 12 2 15 6 16 8 17 6 21 2 26 4 31 6 31 12 28 16 25 20 16 28 16 28 16 28 7 20 4 16 Z');
    this.heart.onclick = () => this.onclick?.();
    this.el.appendChild(this.heart);
  }
}

class ButtonShare {
  constructor (el) {
    this.el = el;
    this.share = Icon(24, 'share', '', `
<circle cx="18" cy="5" r="3" />
  <circle cx="6" cy="12" r="3" />
  <circle cx="18" cy="19" r="3" />
  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      `);
    this.share.onclick = () => this.onclick?.();
    this.el.appendChild(this.share);
  }
}

self.IS_DEV = !!location.port && location.port != '3000';

self.bufferSize = 2**19;
self.buffers = [1,2,3].map(() => ([new Shared32Array(self.bufferSize), new Shared32Array(self.bufferSize)]));
self.isRendering = false;
self.renderTimeout = null;

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
    super();
    Object.assign(self, this.data);
  }

  async setup () {
    await this.rpc('setup', this.data, [this.data.plot.backCanvas]);
  }

  async compile () {
    let code = editor.value;

    try {
      const { shaderFunc, rest } = shader.extractAndCompile(code);
      shader.shaderFunc = shaderFunc;
      code = rest;
      if (shader.shaderFunc) {
        console.log('compiled shader');
      } else {
        console.log('no shader');
      }
    } catch (error) {
      console.error('Error compiling shader');
      console.error(error);
    }

    const result = await this.rpc('compile', { code });
    console.log('compiled sound: ', result);
  }

  async render (data) {
    return this.rpc('render', data)
  }

  setColor ({ color }) {
    editor.setColor(color);
  }

  async fetchSample ({ url }) {
    const sample = await fetchSample(audio, url);
    return { sample }
  }
}

const worker = new Worker(IS_DEV ? 'wavepot-worker.js' : 'wavepot-worker-build.js', { type: 'module' });
const wavepot = new Wavepot();
const shader = new Shader(container);

let editor;
const FILE_DELIMITER = '\n/* -^-^-^-^- */\n';
let label = 'lastV10';
let tracks = localStorage[label];
if (!tracks) tracks = initial;
tracks = tracks.split(FILE_DELIMITER).map(track => JSON.parse(track));
// else tracks = initial.map(value => ({ id: ((Math.random()*10e6)|0).toString(36), value }))

/* sidebar */
const sidebar = document.createElement('div');
sidebar.className = 'sidebar';

/* toolbar */
const toolbar = document.createElement('div');
toolbar.className = 'toolbar';
const playButton = new ButtonPlayPause(toolbar);
new ButtonSave(toolbar);
new ButtonHeart(toolbar);
new ButtonShare(toolbar);
new ButtonLogo(toolbar);

/* tracklist */
self.focusTrack = id => {
  console.log('focus id', id);
  editor.setEditorById(id);
};
const trackList = document.createElement('ol');
trackList.className = 'track-list';
trackList.update = () => {
  trackList.innerHTML = tracks.map(track =>
    `<li class="track-list-item ${editor?.focusedEditor.id === track.id ? 'active' : ''}" onclick="focusTrack('${track.id}')">`
  + track.title.replaceAll('&','&amp;').replaceAll('<','&lt;')
  + '</li>'
  ).join('');
};
trackList.update();

sidebar.appendChild(toolbar);
sidebar.appendChild(trackList);
container.appendChild(sidebar);



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
    titlebarHeight: 25,
    width: window.innerWidth,
    height: window.innerHeight,
  });

  tracks.slice(1).forEach(data => editor.addSubEditor(data));

  let save = () => {
    localStorage[label] = tracks.map(track => JSON.stringify(track)).join(FILE_DELIMITER);
  };

  editor.ontoadd = () => {
    const id = (Math.random() * 10e6 | 0).toString(36);
    const value = 'bpm(120)\n\nmod(1/4).saw(50).exp(10).out().plot()\n';
    editor.addSubEditor({ id, value });
  };

  editor.onchange = (data) => {
    const track = tracks.find(editor => editor.id === data.id);
    if (track) track.value = data.value;
    save();
  };
  editor.onremove = (data) => {
    const track = tracks.find(editor => editor.id === data.id);
    if (track) {
      tracks.splice(tracks.indexOf(track), 1);
    }
    save();
  };
  editor.onrename = (data) => {
    const track = tracks.find(editor => editor.id === data.id);
    if (track) {
      track.title = data.title;
    }
    save();
  };
  editor.onfocus = (data) => {
    trackList.update();
  };
  editor.onupdate = async () => {
//    localStorage[label] = editor.value
  };
  container.appendChild(editor.canvas);
  editor.parent = document.body;
  editor.rect = editor.canvas.getBoundingClientRect();
  // TODO: cleanup this shit
  const events = registerEvents(document.body);
  editor.onsetup = () => {
    events.setTarget('focus', editor, { target: events.textarea, type: 'mouseenter' });

    // leave time to setup
    setTimeout(() => {
      editor.onadd = (data) => {
        tracks.push(data);
        save();
      };
    }, 1000);

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

    shader.resize();
  };

  await wavepot.register(worker).setup();
}

const clock = document.createElement('div');
clock.className = 'clock';
const clockBar = document.createElement('div');
const clockBeat = document.createElement('div');
const clockSixt = document.createElement('div');
clock.appendChild(clockBar);
clock.appendChild(clockBeat);
clock.appendChild(clockSixt);
clockBar.textContent = '1';
clockBeat.textContent = '1';
clockSixt.textContent = '1';
container.appendChild(clock);

let audio,
    gainNode,
    audioBuffers,
    bufferSourceNode,
    bar = {},
    isPlaying = false,
    playNext = () => {};

let inputBuffer;
let origSyncTime = 0;
let animFrame = 0;
let coeff = 1;

const wave = document.createElement('canvas');
const wctx = wave.getContext('2d');
wave.className = 'wave';
wave.width = 250;
wave.height = 52;
wave.style.width = '125px';
wave.style.height = '26px';
wctx.scale(pixelRatio, pixelRatio);
container.appendChild(wave);

const drawWave = () => {
  let ctx = wctx;
  let h = wave.height/pixelRatio;
  let w = wave.width/pixelRatio;
  ctx.clearRect(0,0,w,h);
  ctx.beginPath();
  ctx.strokeStyle = '#fff';
  if (!inputBuffer) {
    ctx.moveTo(0, h/2);
    ctx.lineTo(w, h/2);
    ctx.stroke();
    return
  }
  let b = inputBuffer.getChannelData(0);
  let co = b.length/w;
  ctx.moveTo(0, (b[0]*0.5+.5)*h);
  for (let i = 0; i < w; i++) {
    ctx.lineTo(i, (b[(i*co)|0]*0.5+.5)*h);
  }
  ctx.stroke();
};

let toggle = async () => {
  audio = new AudioContext({
    numberOfChannels,
    sampleRate,
    latencyHint: 'playback' // without this audio glitches
  });

  gainNode = audio.createGain();
  gainNode.connect(audio.destination);

  const scriptGainNode = audio.createGain();
  scriptGainNode.connect(audio.destination);
  const scriptNode = audio.createScriptProcessor(2048, 1, 1);
  scriptNode.onaudioprocess = e => { inputBuffer = e.inputBuffer; };
  scriptNode.connect(scriptGainNode);
  gainNode.connect(scriptNode);

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
      target.set(nextWorkerBuffer[i].subarray(0, bufferIndex));
    }

    let syncTime;
    if (offsetTime) {
      syncTime = getSyncTime();
    } else {
      syncTime = origSyncTime = audio.currentTime + 1;
    }

    console.log('schedule for:', syncTime - offsetTime);

    offsetTime = syncTime;
    if (bufferSourceNode) {
      bufferSourceNode.stop(syncTime);
    }

    barSize = bufferIndex;

    const duration = barSize / sampleRate;

    coeff = sampleRate / barSize;

    bufferSourceNode = audio.createBufferSource();
    bufferSourceNode.buffer = nextBuffer;
    bufferSourceNode.connect(gainNode);
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

  const startAnim = () => {
    const tick = () => {
      animFrame = requestAnimationFrame(tick);
      shader.time = (audio.currentTime - origSyncTime) * coeff;
      clockBar.textContent =  Math.max(1, Math.floor(shader.time % 16) + 1);
      clockBeat.textContent = Math.max(1, Math.floor((shader.time*4) % 4) + 1);
      clockSixt.textContent = Math.max(1, Math.floor((shader.time*16) % 16) + 1);
      drawWave();
      shader.tick();
    };
    animFrame = requestAnimationFrame(tick);
  };

  const stopAnim = () => {
    shader.stop();
    cancelAnimationFrame(animFrame);
  };

  const start = () => {
    gainNode.gain.value = 1.0;
    isPlaying = true;
    playNext();
    startAnim();
    playButton.setIconPause();
    toggle = () => {
      playButton.setIconPlay();
      gainNode.gain.value = 0.0;
      bufferSourceNode?.stop(0);
      stopAnim();
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

playButton.onplay = () => {
  if (isPlaying) return
  editor.update(() => {
    wavepot.compile().then(() => {
      if (!isPlaying) {
        toggle();
      }
      playNext();
    });
  });
};
playButton.onpause = () => {
  if (!isPlaying) return
  toggle();
};
drawWave();
main(); //.then(toggle)
