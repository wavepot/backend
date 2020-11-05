
//→ wavepot.js:
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
    this.ondestroy?.();
  }

  _onblockcomment () {
    this.onblockcomment?.();
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

const mode = 'cors';

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

const load = async (title) => {
  const url = title[0] === '.' ? title : API_URL + '/' + title;

  const res = await fetch(url, { mode, headers });

  const json = await res.json();

  return json
};

const save = async (projectJson) => {
  const url = API_URL + '/p'; // + projectJson.title

  const res = await fetch(url, {
    method: 'POST',
    mode,
    headers,
    body: JSON.stringify(projectJson, null, 2)
  });

  const json = await res.json();

  return json
};

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
{"id":"34cqq","value":"bpm(100)\n\ncolor('#46f')\n\nmod(val(1/4).on(8,1).val(1/8).on(16,1/2).val(1/16))\n  .sin(mod(1/4).val(42.881).exp(.057))\n  .exp(8.82).tanh(15.18)\n  .on(16,1).val(0)\n  .out(.4)\n\nsaw('d d# f f#'.seq(1/4).note/4)\n  .mod(1/16).exp(10)\n  .vol('.5 .1 .5 1'.seq(1/4))\n  .lp(1800,1.2)\n  .delay(1/[200,150].seq(4))\n  .on(1,8,16).vol(0)\n  .out(.35)\n\nmod(1/16).noise(70).exp(19)\n  .vol('.1 .4 1 .4'.seq(1/16))\n  .on(8,1/4).mul('2 1'.seq(1/15))\n  .bp(2500+mod(1/8).val(2000).exp(2.85),1.2,.5)\n  .on(8,2).vol(0)\n  .out(.2)\n\nmod(1/2).play('freesound:220752'.sample,-19025,1)\n  .vol('- - 1 -'.slide(1/8,.5))\n  .vol('- - 1 .3'.seq(1/8))\n  .tanh(2)\n  .out(.7)\n\nmod(4).play('freesound:243601'.sample,26000,1.1)\n  .vol('- - - - - - 1 1 .8 - - - - - - -'.seq(1/16))\n  .on(16,1).val(0)\n  .delay(1/[100,200].seq(4))\n  .daverb(.3,242411)\n  .out(.4)\n\non(1,1,8).grp()\n  .noise()\n  .bp(6000)\n  .bp(14000)\n  .out(.08)\n.end()\n\nmain.tanh(1)\n  .on(8,2).grp()\n    .bp(3000+mod(16,.06).cos(sync(16))*2800,4)\n    .vol('.7 1.2 1.4 1.9 1.9 2.1 2.2 2.3'.seq(1/4))\n  .end().plot()","title":"Techno. Yo."}
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

var VideoCanvas = (gl) => {
  const target = gl.TEXTURE_2D;

  const texture = createTexture(gl, {
    data: new Uint8Array([255,0,0,255]),
  });

  const update = (canvas) => {
    putTexture1(gl, {
      texture,
      data: canvas,
      // flipY: true
    });
  };

  return {
    target,
    texture,
    update,
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
  draw: c => ({
    'shift': ['2fv', c.shift ?? [0,0]],
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

    uniform vec2 shift;

    in vec2 v_texCoord;

    out vec4 fragColor;

    void main () {
      vec4 A = texture(layer_a, v_texCoord);
      vec4 B = texture(layer_b, v_texCoord + shift);

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

var rotate = c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'u_screen': c.sources.screen,
  }),
  draw: c => ({
    'u_time': ['1f', c.time],
    'zoom': ['1f', c.zoom ?? .1],
    'speed': ['1f', c.speed ?? 1],
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
    uniform float u_time;
    uniform float zoom;
    uniform float speed;

    in vec2 v_texCoord;

    out vec4 fragColor;

    void main () {
      vec2 fragCoord = v_texCoord-.5;

      float Z = zoom;
      float A = u_time*speed;

      fragCoord += sin(A*0.8);

      Z += sin(A*.2)*100.;

      vec2 xy = mat2(cos(A),-sin(A),sin(A),cos(A))*fragCoord;

      xy.x += cos(.012*Z*xy).y;

      vec4 col = texture(u_screen, mod(xy, 1.0));

      fragColor = col;
      //fragColor.a = 1.0;
    }
  `
});

var zoom = c => ({
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
      vec4 col = texture(u_screen, v_texCoord/times);
      fragColor = vec4(col.rgb,1.0);
    }
  `
});

var blend = c => ({
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

      fragColor.a = A.a + B.a; //B.a+A.a - A.a*B.a;
      fragColor.rgb = A.rgb + B.rgb; //(A.rgb * A.a * (1. - B.a) + B.rgb * B.a);
    }
  `
});

self.t = 0;
self.frame = 0;
self.pixelRatio = window.devicePixelRatio;

self.color = '#f00';
self.videos = {};
self.screens = [];
self.scale = 1;

Array.prototype.seq = function (x=1) {
  let N = this.length;
  return this[(( (t*(1/(x))) % N + N) % N)|0]
};

class Shader {
  constructor (parent) {
    const canvas = document.createElement('canvas');
    canvas.className = 'shader-canvas';

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width*scale;
    canvas.height = height*scale;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    canvas.style.position = 'absolute';
    canvas.style.imageRendering = 'pixelated';
    parent.appendChild(canvas);

    this.canvas = canvas;
    this.gl = self.gl = getContext(canvas);

    this.setup();
    this.resize();

    self.videoCanvas = VideoCanvas(gl);

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
      blend: compileModule(gl, this, blend),
      video: compileModule(gl, this, video$1),
      glitch: compileModule(gl, this, glitch),
      pixelmess: compileModule(gl, this, pixelmess),
      wobble: compileModule(gl, this, wobble),
      mirror: compileModule(gl, this, mirror),
      rotate: compileModule(gl, this, rotate),
      zoom: compileModule(gl, this, zoom),
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

  shaderFunc () {}

  tick () {
    t = this.time;

    this.shaderFunc();

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
    let canvas = this.canvas;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width*scale;
    canvas.height = height*scale;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

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

  clear () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    return this
  }

  code () {
    let canvas = document.querySelector('canvas.editor');
    self.videoCanvas.update(canvas);
    this.sources.video = self.videoCanvas;
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

  rotate (zoom = .1, speed = 1) {
    this.screen.update();
    this.programs.rotate(this, { zoom, speed });
    return this
  }

  zoom (times = 4) {
    this.screen.update();
    this.programs.zoom(this, { times });
    return this
  }

  noop () {
    return this
  }

  draw () {
    this.screen.draw();
    return this
  }

  merge (target = screens.main, shift) {
    target.screen.update();
    this.screen.update();
    this.programs.merge(target, { a: target, b: this, shift });
    return this
  }

  blend (target = screens.main) {
    target.screen.update();
    this.screen.update();
    this.programs.blend(target, { a: target, b: this });
    return this
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

class ButtonEye {
  constructor (el) {
    this.el = el;
    this.eye = Icon(24, 'eye', 'M2 16 C2 16 7 6 16 6 25 6 30 16 30 16 30 16 25 26 16 26 7 26 2 16 2 16 Z', `
    <circle cx="16" cy="16" r="4" />
    `);
    this.eye.onclick = () => this.onclick?.();
    this.el.appendChild(this.eye);
  }
}

class ButtonCode {
  constructor (el) {
    this.el = el;
    this.code = Icon(24, 'code', 'M10 9 L3 17 10 25 M22 9 L29 17 22 25 M18 7 L14 27');
    this.code.onclick = () => this.onclick?.();
    this.el.appendChild(this.code);
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
      shader.shaderFunc = shaderFunc ?? shader.shaderFunc;
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

const workerUrl = new URL(IS_DEV ? 'wavepot-worker.js' : 'wavepot-worker-build.js', import.meta.url).href;
const worker = new Worker(workerUrl, { type: 'module' });
const wavepot = new Wavepot();
const shader = new Shader(container);

let editor;
const FILE_DELIMITER = '\n/* -^-^-^-^- */\n';
let label = 'lastV10';
let tracks = localStorage[label];

/* sidebar */
const sidebar = document.createElement('div');
sidebar.className = 'sidebar';

/* toolbar */
const toolbar = document.createElement('div');
toolbar.className = 'toolbar';
const playButton = new ButtonPlayPause(toolbar);
const saveButton = new ButtonSave(toolbar);
new ButtonHeart(toolbar);
new ButtonShare(toolbar);
const logoButton = new ButtonLogo(toolbar);
const eyeButton = new ButtonEye(toolbar);
let gfxActive = true;
eyeButton.eye.addEventListener('click', () => {
  if (eyeButton.eye.classList.contains('active')) {
    eyeButton.eye.classList.remove('active');
    gfxActive = true;
    document.querySelector('.back-canvas').style.display = 'block';
    document.querySelector('.shader-canvas').style.display = 'block';
  } else {
    eyeButton.eye.classList.add('active');
    gfxActive = false;
    document.querySelector('.back-canvas').style.display = 'none';
    document.querySelector('.shader-canvas').style.display = 'none';
  }
});
const codeButton = new ButtonCode(toolbar);
codeButton.code.addEventListener('click', () => {
  if (codeButton.code.classList.contains('active')) {
    codeButton.code.classList.remove('active');
    document.querySelector('.editor').style.display = 'block';
    document.querySelector('.track-list').style.display = 'block';
  } else {
    codeButton.code.classList.add('active');
    document.querySelector('.editor').style.display = 'none';
    document.querySelector('.track-list').style.display = 'none';
  }
});

/* tracklist */
self.focusTrack = id => {
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

sidebar.appendChild(toolbar);
sidebar.appendChild(trackList);
container.appendChild(sidebar);


/* menu panel */
const menu = document.createElement('div');
menu.className = 'menu';
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
</div>`;
menu.style.display = 'none';
menu.querySelector('.menu-inner').addEventListener('mousedown', e => {
  e.stopPropagation();
  e.preventDefault();
}, { capture: true });
menu.querySelector('.menu-inner').addEventListener('click', e => {
  e.stopPropagation();
  e.preventDefault();
});
const menuHide = () => {
  menu.style.display = 'none';
  trackList.style.display = 'block';
};
menu.addEventListener('mousedown', e => {
  e.stopPropagation();
  e.preventDefault();
  menuHide();
});
container.appendChild(menu);
logoButton.onclick = () => {
  menu.style.display = 'grid';
  trackList.style.display = 'none';
};


async function main () {
  const loadFromUrl = async () => {
    if (location.pathname.split('/').length === 3) {
      tracks = await load(location.pathname.slice(1));
      document.title = location.pathname.split('/').pop() + ' – wavepot';
    }
    if (editor) {
      editor.destroy();
      createEditor(tracks[0]);
      tracks.slice(1).forEach(data => editor.addSubEditor(data));
    }
  };

  window.addEventListener('popstate', async () => {
    await loadFromUrl();
  });

  if (location.pathname.split('/').length === 3) {
    await loadFromUrl();
  } else {
    if (!tracks) tracks = initial;
    tracks = tracks.split(FILE_DELIMITER).map(track => JSON.parse(track));
    // else tracks = initial.map(value => ({ id: ((Math.random()*10e6)|0).toString(36), value }))
  }

  trackList.update();

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
    });
    editor.ontoadd = () => {
      const id = (Math.random() * 10e6 | 0).toString(36);
      const title = 'untitled - (ctrl+m to rename)';
      const value = 'bpm(120)\n\nmod(1/4).saw(50).exp(10).out().plot()\n';
      editor.addSubEditor({ id, title, value });
    };
    editor.onblockcomment = () => {
      play();
    };
    editor.onchange = (data) => {
      const track = tracks.find(editor => editor.id === data.id);
      if (track) track.value = data.value;
      save$1();
    };
    editor.onremove = (data) => {
      const track = tracks.find(editor => editor.id === data.id);
      if (track) {
        tracks.splice(tracks.indexOf(track), 1);
      }
      save$1();
    };
    editor.onrename = (data) => {
      const track = tracks.find(editor => editor.id === data.id);
      if (track) {
        track.title = data.title;
      }
      save$1();
    };
    editor.onfocus = (data) => {
      trackList.update();
    };
    editor.onupdate = async () => {
  //    localStorage[label] = editor.value
    };
    editor.onsetup = () => {
      events.setTarget('focus', editor, { target: events.textarea, type: 'mouseenter' });

      // leave time to setup
      setTimeout(() => {
        editor.onadd = (data) => {
          tracks.push(data);
          save$1();
        };
      }, 1000);

      let keydown = e => {
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
          play();
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
      };

      document.body.addEventListener('keydown', keydown, { capture: true });
      editor.ondestroy = () => {
        document.body.removeEventListener('keydown', keydown, { capture: true });
      };
    };
    container.appendChild(editor.canvas);
    editor.parent = document.body;
    editor.rect = editor.canvas.getBoundingClientRect();
  };

  createEditor(tracks[0]);

  menu.querySelector('#startnew').addEventListener('click', e => {
    menuHide();
    editor.destroy();
    tracks = [{
      id: (Math.random()*10e6|0).toString(36),
      title: 'untitled - (ctrl+m to rename)',
      value: 'bpm(120)\n\nmod(1/4).saw(50).exp(10).out().plot()\n'
    }];
    createEditor(tracks[0]);
    save$1();
  }, { capture: true });
  menu.querySelector('#openinitial').addEventListener('click', e => {
    menuHide();
    editor.destroy();
    tracks = initial;
    tracks = tracks.split(FILE_DELIMITER).map(track => JSON.parse(track));
    createEditor(tracks[0]);
    tracks.slice(1).forEach(data => editor.addSubEditor(data));
    save$1();
  }, { capture: true });
  menu.querySelector('#importjson').addEventListener('click', e => {
    menuHide();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsText(file, 'utf-8');
      reader.onload = async e => {
        editor.destroy();
        tracks = JSON.parse(e.target.result);
        createEditor(tracks[0]);
        tracks.slice(1).forEach(data => editor.addSubEditor(data));
        save$1();
      };
    };
    input.click();
  }, { capture: true });
  menu.querySelector('#exportjson').addEventListener('click', e => {
    menuHide();
    const name = new Date().toISOString().replace(/[^0-9]/g, ' ').trim().split(' ').slice(0, -1).join('-') + '.json';
    const file = new File([JSON.stringify(tracks)], name, { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
  }, { capture: true });
  menu.querySelector('#record').addEventListener('click', e => {
    menuHide();
    play((time) => {
      const audioStreamDest = audio.createMediaStreamDestination();
      gainNode.connect(audioStreamDest);
      console.log('audio stream capture started');

      const canvasStream = shader.canvas.captureStream(25);
      console.log('canvas stream capture started');

      canvasStream.addTrack(audioStreamDest.stream.getAudioTracks()[0]);
      console.log('merged streams');

      const mediaRecorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm;codecs=h264' });
      // mediaRecorder.ignoreMutedMedia = true

      const chunks = [];
      mediaRecorder.ondataavailable = e => {
        chunks.push(e.data);
        console.log('data from media recorder:', chunks.length);
      };

      mediaRecorder.onstart = () => {
        console.log('started recording');
        setTimeout(() => {
          mediaRecorder.stop();
          toggle();
        }, 8000);
      };
      mediaRecorder.onstop = async function(evt) {
        console.log('stopped recording');
        const name = new Date().toISOString().replace(/[^0-9]/g, ' ').trim().split(' ').slice(0, -1).join('-') + '.mp4';
        let blob = new Blob(chunks, { type: 'video/webm;codecs=h264' });
        const arrayBuffer = await blob.arrayBuffer();
        await import('./ffmpeg.min-02e8d020.js');
        const { createFFmpeg } = FFmpeg;
        const ffmpeg = createFFmpeg({ log: true });
        await ffmpeg.load();
        await ffmpeg.write('record.webm', new Uint8Array(arrayBuffer));
        await ffmpeg.run('-i record.webm -c:v libx264 -preset veryslow -crf 17 -vf format=yuv420p,fps=25 -c:a aac -ar 44100 output.mp4');
        const data = ffmpeg.read('output.mp4');
        blob = new Blob([data.buffer], { type: 'video/mp4' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
      };
      console.log('schedule to start recording:', time);
      setTimeout(() => {
        mediaRecorder.start();
      }, time * 1000 - 100);
    });
  }, { capture: true });


  tracks.slice(1).forEach(data => editor.addSubEditor(data));

  let save$1 = () => {
    localStorage[label] = tracks.map(track => JSON.stringify(track)).join(FILE_DELIMITER);
    history.pushState({}, '', '/'); // edited, so no url to point to, this enables refresh to use localstorage
    document.title = 'wavepot';
  };
  let saveServer = async () => {
    const responseJson = await save(tracks);
    history.pushState({}, '',
      '/p/' + responseJson.generatedId);
    document.title = responseJson.generatedId + ' – wavepot';
  };

  saveButton.onsave = () => {
    saveServer();
  };


  // TODO: cleanup this shit
  const events = registerEvents(document.body);

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
  ctx.lineWidth = Math.max(1, 1.6/pixelRatio);
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

let toggle = async (cb) => {
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

  playNext = async (cb) => {
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

    if (cb) cb(syncTime - audio.currentTime);
  };

  console.log('connected node');

  const onbar = () => {
    console.log('bar');
    playNext();
  };

  const startAnim = () => {
    const tick = () => {
      animFrame = requestAnimationFrame(tick);
      drawWave();
      if (!gfxActive) return
      shader.time = (audio.currentTime - origSyncTime) * coeff;
      clockBar.textContent =  Math.max(1, Math.floor(shader.time % 16) + 1);
      clockBeat.textContent = Math.max(1, Math.floor((shader.time*4) % 4) + 1);
      clockSixt.textContent = Math.max(1, Math.floor((shader.time*16) % 16) + 1);
      shader.tick();
    };
    animFrame = requestAnimationFrame(tick);
  };

  const stopAnim = () => {
    shader.stop();
    cancelAnimationFrame(animFrame);
  };

  const start = (cb) => {
    gainNode.gain.value = 1.0;
    isPlaying = true;
    playNext(cb);
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

  start(cb);
};

const play = (cb) => {
  editor.update(() => {
    wavepot.compile().then(() => {
      if (!isPlaying) {
        toggle(cb);
      }
      playNext(cb);
    });
  });
};
playButton.onplay = () => {
  if (isPlaying) return
  play();
};
playButton.onpause = () => {
  if (!isPlaying) return
  toggle();
};
drawWave();
main(); //.then(toggle)

//→ ffmpeg.min-02e8d020.js:
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.FFmpeg=t():e.FFmpeg=t();}(window,(function(){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n});},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0});},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=3)}([function(e,t){var r,n,o=e.exports={};function i(){throw new Error("setTimeout has not been defined")}function a(){throw new Error("clearTimeout has not been defined")}function c(e){if(r===setTimeout)return setTimeout(e,0);if((r===i||!r)&&setTimeout)return r=setTimeout,setTimeout(e,0);try{return r(e,0)}catch(t){try{return r.call(null,e,0)}catch(t){return r.call(this,e,0)}}}!function(){try{r="function"==typeof setTimeout?setTimeout:i;}catch(e){r=i;}try{n="function"==typeof clearTimeout?clearTimeout:a;}catch(e){n=a;}}();var u,f=[],s=!1,l=-1;function p(){s&&u&&(s=!1,u.length?f=u.concat(f):l=-1,f.length&&d());}function d(){if(!s){var e=c(p);s=!0;for(var t=f.length;t;){for(u=f,f=[];++l<t;)u&&u[l].run();l=-1,t=f.length;}u=null,s=!1,function(e){if(n===clearTimeout)return clearTimeout(e);if((n===a||!n)&&clearTimeout)return n=clearTimeout,clearTimeout(e);try{n(e);}catch(t){try{return n.call(null,e)}catch(t){return n.call(this,e)}}}(e);}}function h(e,t){this.fun=e,this.array=t;}function m(){}o.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)t[r-1]=arguments[r];f.push(new h(e,t)),1!==f.length||s||c(d);},h.prototype.run=function(){this.fun.apply(null,this.array);},o.title="browser",o.browser=!0,o.env={},o.argv=[],o.version="",o.versions={},o.on=m,o.addListener=m,o.once=m,o.off=m,o.removeListener=m,o.removeAllListeners=m,o.emit=m,o.prependListener=m,o.prependOnceListener=m,o.listeners=function(e){return []},o.binding=function(e){throw new Error("process.binding is not supported")},o.cwd=function(){return "/"},o.chdir=function(e){throw new Error("process.chdir is not supported")},o.umask=function(){return 0};},function(e,t,r){var n,o;void 0===(o="function"==typeof(n=function(){return function(){var e=arguments.length;if(0===e)throw new Error("resolveUrl requires at least one argument; got none.");var t=document.createElement("base");if(t.href=arguments[0],1===e)return t.href;var r=document.getElementsByTagName("head")[0];r.insertBefore(t,r.firstChild);for(var n,o=document.createElement("a"),i=1;i<e;i++)o.href=arguments[i],n=o.href,t.href=n;return r.removeChild(t),n}})?n.call(t,r,t,e):n)||(e.exports=o);},function(e,t){var r=!1;t.logging=r,t.setLogging=function(e){r=e;},t.log=function(e,t){return r?console.log("[".concat(e,"] ").concat(t)):null};},function(e,t,r){r(4);var n=r(5);e.exports={createFFmpeg:n};},function(e,t,r){var n=function(e){var t=Object.prototype,r=t.hasOwnProperty,n="function"==typeof Symbol?Symbol:{},o=n.iterator||"@@iterator",i=n.asyncIterator||"@@asyncIterator",a=n.toStringTag||"@@toStringTag";function c(e,t,r,n){var o=t&&t.prototype instanceof s?t:s,i=Object.create(o.prototype),a=new O(n||[]);return i._invoke=function(e,t,r){var n="suspendedStart";return function(o,i){if("executing"===n)throw new Error("Generator is already running");if("completed"===n){if("throw"===o)throw i;return E()}for(r.method=o,r.arg=i;;){var a=r.delegate;if(a){var c=b(a,r);if(c){if(c===f)continue;return c}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if("suspendedStart"===n)throw n="completed",r.arg;r.dispatchException(r.arg);}else "return"===r.method&&r.abrupt("return",r.arg);n="executing";var s=u(e,t,r);if("normal"===s.type){if(n=r.done?"completed":"suspendedYield",s.arg===f)continue;return {value:s.arg,done:r.done}}"throw"===s.type&&(n="completed",r.method="throw",r.arg=s.arg);}}}(e,r,a),i}function u(e,t,r){try{return {type:"normal",arg:e.call(t,r)}}catch(e){return {type:"throw",arg:e}}}e.wrap=c;var f={};function s(){}function l(){}function p(){}var d={};d[o]=function(){return this};var h=Object.getPrototypeOf,m=h&&h(h(j([])));m&&m!==t&&r.call(m,o)&&(d=m);var y=p.prototype=s.prototype=Object.create(d);function g(e){["next","throw","return"].forEach((function(t){e[t]=function(e){return this._invoke(t,e)};}));}function v(e,t){var n;this._invoke=function(o,i){function a(){return new t((function(n,a){!function n(o,i,a,c){var f=u(e[o],e,i);if("throw"!==f.type){var s=f.arg,l=s.value;return l&&"object"==typeof l&&r.call(l,"__await")?t.resolve(l.__await).then((function(e){n("next",e,a,c);}),(function(e){n("throw",e,a,c);})):t.resolve(l).then((function(e){s.value=e,a(s);}),(function(e){return n("throw",e,a,c)}))}c(f.arg);}(o,i,n,a);}))}return n=n?n.then(a,a):a()};}function b(e,t){var r=e.iterator[t.method];if(void 0===r){if(t.delegate=null,"throw"===t.method){if(e.iterator.return&&(t.method="return",t.arg=void 0,b(e,t),"throw"===t.method))return f;t.method="throw",t.arg=new TypeError("The iterator does not provide a 'throw' method");}return f}var n=u(r,e.iterator,t.arg);if("throw"===n.type)return t.method="throw",t.arg=n.arg,t.delegate=null,f;var o=n.arg;return o?o.done?(t[e.resultName]=o.value,t.next=e.nextLoc,"return"!==t.method&&(t.method="next",t.arg=void 0),t.delegate=null,f):o:(t.method="throw",t.arg=new TypeError("iterator result is not an object"),t.delegate=null,f)}function w(e){var t={tryLoc:e[0]};1 in e&&(t.catchLoc=e[1]),2 in e&&(t.finallyLoc=e[2],t.afterLoc=e[3]),this.tryEntries.push(t);}function x(e){var t=e.completion||{};t.type="normal",delete t.arg,e.completion=t;}function O(e){this.tryEntries=[{tryLoc:"root"}],e.forEach(w,this),this.reset(!0);}function j(e){if(e){var t=e[o];if(t)return t.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var n=-1,i=function t(){for(;++n<e.length;)if(r.call(e,n))return t.value=e[n],t.done=!1,t;return t.value=void 0,t.done=!0,t};return i.next=i}}return {next:E}}function E(){return {value:void 0,done:!0}}return l.prototype=y.constructor=p,p.constructor=l,p[a]=l.displayName="GeneratorFunction",e.isGeneratorFunction=function(e){var t="function"==typeof e&&e.constructor;return !!t&&(t===l||"GeneratorFunction"===(t.displayName||t.name))},e.mark=function(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,p):(e.__proto__=p,a in e||(e[a]="GeneratorFunction")),e.prototype=Object.create(y),e},e.awrap=function(e){return {__await:e}},g(v.prototype),v.prototype[i]=function(){return this},e.AsyncIterator=v,e.async=function(t,r,n,o,i){void 0===i&&(i=Promise);var a=new v(c(t,r,n,o),i);return e.isGeneratorFunction(r)?a:a.next().then((function(e){return e.done?e.value:a.next()}))},g(y),y[a]="Generator",y[o]=function(){return this},y.toString=function(){return "[object Generator]"},e.keys=function(e){var t=[];for(var r in e)t.push(r);return t.reverse(),function r(){for(;t.length;){var n=t.pop();if(n in e)return r.value=n,r.done=!1,r}return r.done=!0,r}},e.values=j,O.prototype={constructor:O,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method="next",this.arg=void 0,this.tryEntries.forEach(x),!e)for(var t in this)"t"===t.charAt(0)&&r.call(this,t)&&!isNaN(+t.slice(1))&&(this[t]=void 0);},stop:function(){this.done=!0;var e=this.tryEntries[0].completion;if("throw"===e.type)throw e.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var t=this;function n(r,n){return a.type="throw",a.arg=e,t.next=r,n&&(t.method="next",t.arg=void 0),!!n}for(var o=this.tryEntries.length-1;o>=0;--o){var i=this.tryEntries[o],a=i.completion;if("root"===i.tryLoc)return n("end");if(i.tryLoc<=this.prev){var c=r.call(i,"catchLoc"),u=r.call(i,"finallyLoc");if(c&&u){if(this.prev<i.catchLoc)return n(i.catchLoc,!0);if(this.prev<i.finallyLoc)return n(i.finallyLoc)}else if(c){if(this.prev<i.catchLoc)return n(i.catchLoc,!0)}else {if(!u)throw new Error("try statement without catch or finally");if(this.prev<i.finallyLoc)return n(i.finallyLoc)}}}},abrupt:function(e,t){for(var n=this.tryEntries.length-1;n>=0;--n){var o=this.tryEntries[n];if(o.tryLoc<=this.prev&&r.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break}}i&&("break"===e||"continue"===e)&&i.tryLoc<=t&&t<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=e,a.arg=t,i?(this.method="next",this.next=i.finallyLoc,f):this.complete(a)},complete:function(e,t){if("throw"===e.type)throw e.arg;return "break"===e.type||"continue"===e.type?this.next=e.arg:"return"===e.type?(this.rval=this.arg=e.arg,this.method="return",this.next="end"):"normal"===e.type&&t&&(this.next=t),f},finish:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var r=this.tryEntries[t];if(r.finallyLoc===e)return this.complete(r.completion,r.afterLoc),x(r),f}},catch:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var r=this.tryEntries[t];if(r.tryLoc===e){var n=r.completion;if("throw"===n.type){var o=n.arg;x(r);}return o}}throw new Error("illegal catch attempt")},delegateYield:function(e,t,r){return this.delegate={iterator:j(e),resultName:t,nextLoc:r},"next"===this.method&&(this.arg=void 0),f}},e}(e.exports);try{regeneratorRuntime=n;}catch(e){Function("r","regeneratorRuntime = r")(n);}},function(e,t,r){function n(e){return function(e){if(Array.isArray(e))return o(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||function(e,t){if(!e)return;if("string"==typeof e)return o(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(r);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return o(e,t)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function o(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function i(e,t,r,n,o,i,a){try{var c=e[i](a),u=c.value;}catch(e){return void r(e)}c.done?t(u):Promise.resolve(u).then(n,o);}function a(e){return function(){var t=this,r=arguments;return new Promise((function(n,o){var a=e.apply(t,r);function c(e){i(a,n,o,c,u,"next",e);}function u(e){i(a,n,o,c,u,"throw",e);}c(void 0);}))}}function c(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n);}return r}function u(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?c(Object(r),!0).forEach((function(t){f(e,t,r[t]);})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):c(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t));}));}return e}function f(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function s(e,t){if(null==e)return {};var r,n,o=function(e,t){if(null==e)return {};var r,n,o={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r]);}return o}var l=r(6),p=r(2),d=p.setLogging,h=p.log,m=r(7),y=r(10),g=r(11),v=r(13),b=r(14),w=b.defaultOptions,x=b.getModule,O=b.fetchFile,j=Error("FFmpeg.js is not ready, make sure you have completed load()."),E=Error("FFmpeg.js can only run one command at a time"),P=null,S=null;e.exports=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=null,r=!1,o=m(u({},w,{},e)),i=o.log,c=o.logger,f=o.progress,p=s(o,["log","logger","progress"]),b=function(e){var n=e.message;"ffmpeg-stdout"===e.type&&"FFMPEG_END"===n&&null!==t&&(t(),t=null,r=!1);};d(i);var L=function(){var e=a(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(null!==P){e.next=8;break}return h("info","load ffmpeg-core"),e.next=4,x(p);case 4:(P=e.sent).setLogger((function(e){b(e),y(e,f),c(e),h(e.type,e.message);})),null===S&&(S=P.cwrap("proxy_main","number",["number","number"])),h("info","ffmpeg-core loaded");case 8:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),_=function(e,t){if(null===P)throw j;var r;return h("info","FS.".concat(e," ").concat(t[0])),(r=P.FS)[e].apply(r,n(t))},F=function(){var e=a(regeneratorRuntime.mark((function e(t,r){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.t0=_,e.t1=t,e.next=4,O(r);case 4:return e.t2=e.sent,e.t3=[e.t1,e.t2],e.abrupt("return",(0, e.t0)("writeFile",e.t3));case 7:case"end":return e.stop()}}),e)})));return function(t,r){return e.apply(this,arguments)}}(),k=function(e,t){return _("writeFile",[e,t])},T=function(e){return _("readFile",[e])},A=function(e){return _("unlink",[e])},R=function(e){return _("readdir",[e])},M=function(e){if(null===S)throw j;if(r)throw E;return r=!0,new Promise((function(r){var o=[].concat(n(l),n(v(e))).filter((function(e){return 0!==e.length}));h("info","ffmpeg command: ".concat(o.join(" "))),t=r,S(o.length,g(P,o));}))},D=function(e,t){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"";return M("-i ".concat(e," ").concat(r," ").concat(t))},N=function(e,t,r,n){var o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:"";return M("-i ".concat(e," -ss ").concat(r," -to ").concat(n," ").concat(o," ").concat(t))},I=function(e,t){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"",n=e.reduce((function(e,t){return "".concat(e,"\nfile ").concat(t)}),"");return k("concat_list.txt",n),M("-f concat -safe 0 -i concat_list.txt ".concat(r," ").concat(t))};return {load:L,FS:_,write:F,writeText:k,read:T,remove:A,ls:R,run:M,transcode:D,trim:N,concatDemuxer:I}};},function(e,t){e.exports=["./ffmpeg","-nostdin","-hide_banner"];},function(e,t,r){function n(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n);}return r}function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}var i="browser"===r(8)("type")?r(1):function(e){return e};e.exports=function(e){var t=function(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?n(Object(r),!0).forEach((function(t){o(e,t,r[t]);})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):n(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t));}));}return e}({},e);return ["corePath"].forEach((function(r){void 0!==e[r]&&(t[r]=i(t[r]));})),t};},function(e,t,r){(function(t){function n(e){return (n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var o=r(9);e.exports=function(e){var r={};return o()?r.type="electron":"object"===("undefined"==typeof window?"undefined":n(window))?r.type="browser":"function"==typeof importScripts?r.type="webworker":"object"===(void 0===t?"undefined":n(t))&&(r.type="node"),void 0===e?r:r[e]};}).call(this,r(0));},function(e,t,r){(function(t){e.exports=function(){return "undefined"!=typeof window&&"object"==typeof window.process&&"renderer"===window.process.type||(!(void 0===t||"object"!=typeof t.versions||!t.versions.electron)||"object"==typeof navigator&&"string"==typeof navigator.userAgent&&navigator.userAgent.indexOf("Electron")>=0)};}).call(this,r(0));},function(e,t){function r(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var r=[],n=!0,o=!1,i=void 0;try{for(var a,c=e[Symbol.iterator]();!(n=(a=c.next()).done)&&(r.push(a.value),!t||r.length!==t);n=!0);}catch(e){o=!0,i=e;}finally{try{n||null==c.return||c.return();}finally{if(o)throw i}}return r}(e,t)||function(e,t){if(!e)return;if("string"==typeof e)return n(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(r);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return n(e,t)}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function n(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}var o=0,i=function(e){var t=r(e.split(":"),3),n=t[0],o=t[1],i=t[2];return 60*parseFloat(n)*60+60*parseFloat(o)+parseFloat(i)};e.exports=function(e,t){var r=e.message;if("string"==typeof r)if(r.startsWith("  Duration")){var n=r.split(", ")[0].split(": ")[1],a=i(n);(0===o||o>a)&&(o=a);}else if(r.startsWith("frame")){var c=r.split("time=")[1].split(" ")[0];t({ratio:i(c)/o});}else r.startsWith("video:")&&t({ratio:1});};},function(e,t,r){var n=r(12);e.exports=function(e,t){var r=e._malloc(t.length*Uint32Array.BYTES_PER_ELEMENT);return t.forEach((function(t,o){var i=n(e,t);e.setValue(r+4*o,i,"i32");})),r};},function(e,t){e.exports=function(e,t){for(var r=e._malloc((t.length+1)*Uint8Array.BYTES_PER_ELEMENT),n=0;n<t.length;n+=1)e.setValue(r+n,t.charCodeAt(n),"i8");return e.setValue(r+t.length,0,"i8"),r};},function(e,t){e.exports=function(e){for(var t=[],r=0,n=0;(r=e.indexOf(" ",n))>=0;){var o=e.substring(n,r),i=o.indexOf("'"),a=o.indexOf('"');if(0===i||0===a){var c=o[0],u=e.indexOf(c,n+1);if(u<0)throw new Error("Bad command escape sequence ".concat(c," near ").concat(r));o=e.substring(n+1,u),n=u+2,t.push(o);}else if(i>0||a>0){-1===i&&(i=1/0),-1===a&&(a=1/0);var f=i<a?"'":'"',s=Math.min(i,a),l=e.indexOf(f,n+s+1);if(l<0)throw new Error("Bad command escape sequence ".concat(f," near ").concat(r));o=e.substring(n,l+1),n=l+2,t.push(o);}else ""!==o?(t.push(o),n=r+1):n=r+1;}return n!==e.length&&t.push(e.substring(n)),t};},function(e,t,r){var n=r(15),o=r(18),i=r(19);e.exports={defaultOptions:n,getModule:o,fetchFile:i};},function(e,t,r){(function(t){function n(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n);}return r}function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}var i=r(1),a=(r(16).dependencies,r(17));e.exports=function(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?n(Object(r),!0).forEach((function(t){o(e,t,r[t]);})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):n(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t));}));}return e}({},a,{corePath:void 0!==t&&"development"===t.env.FFMPEG_ENV?i("/node_modules/@ffmpeg/core/ffmpeg-core.js"):"/ffmpeg/ffmpeg-core.js"});}).call(this,r(0));},function(e){e.exports=JSON.parse('{"name":"@ffmpeg/ffmpeg","version":"0.8.3","description":"FFmpeg WebAssembly version","main":"src/index.js","directories":{"example":"examples"},"scripts":{"start":"node scripts/server.js","build":"rimraf dist && webpack --config scripts/webpack.config.prod.js","prepublishOnly":"npm run build","lint":"eslint src","wait":"rimraf dist && wait-on http://localhost:3000/dist/ffmpeg.dev.js","test":"npm-run-all -p -r start test:all","test:all":"npm-run-all wait test:browser:ffmpeg test:node:all","test:node":"node --experimental-wasm-threads --experimental-wasm-bulk-memory node_modules/.bin/_mocha --exit --bail --require ./scripts/test-helper.js","test:node:all":"npm run test:node -- ./tests/*.test.js","test:browser":"mocha-headless-chrome -a allow-file-access-from-files -a incognito -a no-sandbox -a disable-setuid-sandbox -a disable-logging -t 300000","test:browser:ffmpeg":"npm run test:browser -- -f ./tests/ffmpeg.test.html"},"browser":{"./src/node/index.js":"./src/browser/index.js"},"repository":{"type":"git","url":"git+https://github.com/ffmpegwasm/ffmpeg.wasm.git"},"keywords":["ffmpeg","WebAssembly","video"],"author":"Jerome Wu <jeromewus@gmail.com>","license":"MIT","bugs":{"url":"https://github.com/ffmpegwasm/ffmpeg.wasm/issues"},"engines":{"node":">=12.16.1"},"homepage":"https://github.com/ffmpegwasm/ffmpeg.wasm#readme","dependencies":{"@ffmpeg/core":"^0.7.1","idb":"^4.0.5","is-electron":"^2.2.0","is-url":"^1.2.4","node-fetch":"^2.6.0","regenerator-runtime":"^0.13.5","resolve-url":"^0.2.1"},"devDependencies":{"@babel/core":"^7.9.0","@babel/preset-env":"^7.9.0","babel-loader":"^8.1.0","cors":"^2.8.5","eslint":"^6.8.0","eslint-config-airbnb-base":"^14.1.0","eslint-plugin-import":"^2.20.1","expect.js":"^0.3.1","express":"^4.17.1","mocha":"^5.2.0","mocha-headless-chrome":"^2.0.3","npm-run-all":"^4.1.5","nyc":"^14.1.1","wait-on":"^3.3.0","webpack":"^4.42.0","webpack-cli":"^3.3.11","webpack-dev-middleware":"^3.7.2"}}');},function(e,t){e.exports={log:!1,logger:function(){},progress:function(){}};},function(e,t,r){function n(e,t,r,n,o,i,a){try{var c=e[i](a),u=c.value;}catch(e){return void r(e)}c.done?t(u):Promise.resolve(u).then(n,o);}var o=r(2).log;e.exports=function(){var e,t=(e=regeneratorRuntime.mark((function e(t){var r,n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(r=t.corePath,void 0!==window.Module){e.next=12;break}return o("info","fetch ffmpeg-core.worker.js script"),e.next=5,fetch(r.replace("ffmpeg-core.js","ffmpeg-core.worker.js"));case 5:return e.next=7,e.sent.blob();case 7:return n=e.sent,window.FFMPEG_CORE_WORKER_SCRIPT=URL.createObjectURL(n),o("info","worker object URL=".concat(window.FFMPEG_CORE_WORKER_SCRIPT)),o("info","download ffmpeg-core script (~25 MB) from ".concat(r)),e.abrupt("return",new Promise((function(e){var t=document.createElement("script");t.src=r,t.type="text/javascript",t.addEventListener("load",(function r(){t.removeEventListener("load",r),o("info","initialize ffmpeg-core"),window.Module.onRuntimeInitialized=function(){o("info","ffmpeg-core initialized"),e(window.Module);};})),document.getElementsByTagName("head")[0].appendChild(t);})));case 12:return o("info","ffmpeg-core is loaded already"),e.abrupt("return",Promise.resolve(window.Module));case 14:case"end":return e.stop()}}),e)})),function(){var t=this,r=arguments;return new Promise((function(o,i){var a=e.apply(t,r);function c(e){n(a,o,i,c,u,"next",e);}function u(e){n(a,o,i,c,u,"throw",e);}c(void 0);}))});return function(e){return t.apply(this,arguments)}}();},function(e,t,r){function n(e,t,r,n,o,i,a){try{var c=e[i](a),u=c.value;}catch(e){return void r(e)}c.done?t(u):Promise.resolve(u).then(n,o);}var o=r(1),i=function(e){return new Promise((function(t,r){var n=new FileReader;n.onload=function(){t(n.result);},n.onerror=function(e){var t=e.target.error.code;r(Error("File could not be read! Code=".concat(t)));},n.readAsArrayBuffer(e);}))};e.exports=function(){var e,t=(e=regeneratorRuntime.mark((function e(t){var r,n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(r=t,void 0!==t){e.next=3;break}return e.abrupt("return","undefined");case 3:if("string"!=typeof t){e.next=16;break}if(!/data:_data\/([a-zA-Z]*);base64,([^"]*)/.test(t)){e.next=8;break}r=atob(t.split(",")[1]).split("").map((function(e){return e.charCodeAt(0)})),e.next=14;break;case 8:return e.next=10,fetch(o(t));case 10:return n=e.sent,e.next=13,n.arrayBuffer();case 13:r=e.sent;case 14:e.next=20;break;case 16:if(!(t instanceof File||t instanceof Blob)){e.next=20;break}return e.next=19,i(t);case 19:r=e.sent;case 20:return e.abrupt("return",new Uint8Array(r));case 21:case"end":return e.stop()}}),e)})),function(){var t=this,r=arguments;return new Promise((function(o,i){var a=e.apply(t,r);function c(e){n(a,o,i,c,u,"next",e);}function u(e){n(a,o,i,c,u,"throw",e);}c(void 0);}))});return function(e){return t.apply(this,arguments)}}();}])}));
