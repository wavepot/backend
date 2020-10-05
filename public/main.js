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

let ignore = false;
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

  _onhistory (history) {
    this.history = history;
  }

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

  const createUndoRedo = methods.createUndoRedo = () => {
    // create undo/redo capability
    ignore = true;
    textarea.focus();
    textarea.select();
    document.execCommand('insertText', false, 1);
    textarea.select();
    document.execCommand('insertText', false, 2);
    document.execCommand('undo', false);
    textarea.selectionStart = -1;
    textarea.selectionEnd = -1;
    ignore = false;
  };

  const removeUndoRedo = methods.removeUndoRedo = () => {
    // remove undo/redo capability
    ignore = true;
    textarea.focus();
    textarea.select();
    document.execCommand('undo', false);
    // document.execCommand('undo', false)
    // document.execCommand('undo', false)
    textarea.selectionStart = -1;
    textarea.selectionEnd = -1;
    // ignore = false
  };

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

  textarea.oninput = e => {
    if (ignore) return

    ignore = true;
    const editor = events.targets.focus;
    const needle = +textarea.value;
    if (needle === 0) { // is undo
      document.execCommand('redo', false);
      if (editor?.history) {
        if (editor.history.needle > 1) {
          editor.history.needle--;
          editor.worker.postMessage({
            call: 'onhistory',
            needle: editor.history.needle
          });
        }
      }
    } else if (needle === 2) { // is redo
      document.execCommand('undo', false);
      if (editor?.history) {
        if (editor.history.needle < editor.history.log.length) {
          editor.history.needle++;
          editor.worker.postMessage({
            call: 'onhistory',
            needle: editor.history.needle
          });
        }
      }
    }
    ignore = false;
    // if (needle !== history.needle) {
    //   if (needle >= 1) {
    //     history.needle = needle
    //     textarea.selectionStart = -1
    //     textarea.selectionEnd = -1
    //     events.targets?.focus?.postMessage({ call: 'onhistory', needle })
    //     // app.storeHistory(editor, history)
    //   } else {
    //     document.execCommand('redo', false)
    //   }
    // }
    // document.execCommand('redo', false)

    textarea.selectionStart = -1;
    textarea.selectionEnd = -1;
  };

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
        methods.createUndoRedo();
        textarea.style.pointerEvents = 'all';
        textarea.focus();
      } else if (eventName === 'onmouseout') {
        textarea.style.pointerEvents = 'none';
        methods.removeUndoRedo();
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
    if (cmdKey && key === 'z') return false
    if (cmdKey && key === 'y') return false
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

// hacky way to switch api urls from dev to prod
const API_URL = location.port.length === 4
  ? 'http://localhost:3000' : location.origin;

const mode = 'cors';

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

const URL$1 = API_URL;

const recent = async () => {
  const url = API_URL + '/recent';

  const res = await fetch(url, { mode, headers });

  const json = await res.json();

  return json
};

const load = async (title) => {
  const url = title[0] === '.' ? title : API_URL + '/' + title;

  const res = await fetch(url, { mode, headers });

  const json = await res.json();

  return json
};

const save = async (projectJson) => {
  const url = API_URL + '/' + projectJson.title;

  const res = await fetch(url, {
    method: 'POST',
    mode,
    headers,
    body: JSON.stringify(projectJson, null, 2)
  });

  const json = await res.json();

  return json
};

registerEvents(document.body);

const getSettings = () => {
  const sideWidth = 300;

  const common = {
    font: '/fonts/mplus-1m-regular.woff2',
    fontSize: '9.4pt',
    // fontSize: '16.4pt',
    padding: 10,
    titlebarHeight: 42,
  };

  const modules = {
    ...common,
    width: (window.innerWidth - sideWidth) / 2,
    height: window.innerHeight,
  };

  const tracks = {
    ...common,
    width: modules.width, //(window.innerWidth - modules.width),
    height: window.innerHeight,
  };

  return { tracks, modules }
};

class Editors {
  static async fromProject (el, title) {
    const json = await load(title);
    return new Editors(el, json)
  }

  constructor (el, project) {
    if (!project || typeof project === 'string') {
      const title = typeof project === 'string' ? project : 'untitled';
      project = {
        title,
        bpm: '125',
        tracks: [{
          title: title + '/track.js',
          value: 'export default c => 0'
        }],
        modules: [{
          title: title + '/module.js',
          value: 'export default c => 0'
        }]
      };
    }
    project.tracks = project.tracks.filter(track => !!track.value.trim());
    project.modules = project.modules.filter(mod => !!mod.value.trim());
    this.project = project;
    this.el = el;
    this.title = project.title;
    this.tracks = [project.tracks[0]];
    this.modules = [project.modules[0]];
    this.modulesEditors = {};
    this.currentModuleEditor = null;
    this.createEditors();
  }

  destroy () {
    this.tracksEditor.destroy();
    for (const moduleEditor of Object.values(this.modulesEditors)) {
      moduleEditor.destroy();
    }
  }

  createEditors () {
    const settings = getSettings();
    this.tracksEditor = new Editor({
      ...this.project.tracks[0],
      ...settings.tracks
    });
    this.tracksEditor.onchange = data => {
      const track = this.tracks.find(track => track.title === data.title);
      track.value = data.value;
      this.onchange?.(track);
      console.log('track changed:', data);
    };
    this.tracksEditor.onrename = data => {
      const track = this.tracks.find(track => track.title === data.prevTitle);
      track.title = data.title;
      this.onrename?.(track);
      console.log('track renamed:', data.prevTitle, data.title);
    };
    this.tracksEditor.onadd = data => {
      this.onadd?.(data);
      this.tracksEditor.resize();
    };
    this.tracksEditor.onremove = data => {
      const track = this.tracks.find(track => track.title === data.title);
      this.tracks.splice(this.tracks.indexOf(track), 1);
      this.onremove?.(data);
      this.tracksEditor.resize();
    };
    this.tracksEditor.ontoadd = () => this.ontoaddtrack?.();

    this.ensureModuleEditor(this.project.modules?.[0]?.title.split('/')[0] ?? this.title, this.project.modules[0]);

    this.tracksEditor.onfocus = editor => {
      const [dir, title] = editor.title.split('/');
      const prevModuleEditor = this.currentModuleEditor;
      const moduleEditor = this.ensureModuleEditor(dir);
      if (prevModuleEditor !== moduleEditor) {
        prevModuleEditor.canvas.style.display = 'none';
        prevModuleEditor.isVisible = false;
        moduleEditor.canvas.style.display = 'block';
        moduleEditor.isVisible = true;
        this.currentModuleEditor = moduleEditor;
        moduleEditor.resize();
      }
      this.onfocus?.(this.tracksEditor);
    };
    this.tracksEditor.canvas.style.left = settings.modules.width + 'px';
    this.tracksEditor.parent = this.el;

    this.el.appendChild(this.tracksEditor.canvas);
    this.tracksEditor.resize();

    this.project.tracks.slice(1).forEach(track => this.addTrack(track));
    this.project.modules.slice(1).forEach(module => this.addModule(module));
  }

  ensureModuleEditor (dir, module) {
    let moduleEditor = this.modulesEditors[dir];

    if (moduleEditor) {
      if (module) {
        moduleEditor.addSubEditor(module);
        if (!this.modules.find(mod => mod.title === module.title)) {
          this.modules.push(module);
        }
      }
      return moduleEditor
    }

    if (!module) {
      module = { title: dir + '/module.js', value: 'export default c => 0' };
    }
    if (!this.modules.find(mod => mod.title === module.title)) {
      this.modules.push(module);
    }

    const settings = getSettings();
    moduleEditor = this.modulesEditors[dir] = new Editor({
      ...module,
      ...settings.modules
    });
    moduleEditor.onfocus = () => this.onfocus?.(moduleEditor);
    moduleEditor.onchange = data => {
      const module = this.modules.find(module => module.title === data.title);
      module.value = data.value;
      this.onchange?.(module);
      console.log('module changed:', data);
    };
    moduleEditor.onrename = data => {
      const module = this.modules.find(module => module.title === data.prevTitle);
      module.title = data.title;
      this.onrename?.(module);
      console.log('module renamed:', data.prevTitle, data.title);
    };
    moduleEditor.onadd = data => {
      this.onadd?.(data);
      moduleEditor.resize();
    };
    moduleEditor.onremove = data => {
      const module = this.modules.find(module => module.title === data.title);
      this.modules.splice(this.modules.indexOf(module), 1);
      console.log('removed', module, this.modules);
      this.onremove?.(data);
      moduleEditor.resize();
    };
    moduleEditor.ontoadd = () => this.ontoaddmodule?.();

    if (this.currentModuleEditor) {
      moduleEditor.canvas.style.display = 'none';
      moduleEditor.isVisible = false;
    } else {
      this.currentModuleEditor = moduleEditor;
      moduleEditor.isVisible = true;
    }
    moduleEditor.canvas.style.left = 0;
    moduleEditor.parent = this.el;
    this.el.appendChild(moduleEditor.canvas);
    moduleEditor.resize();

    return moduleEditor
  }

  addTrack (track) {
    this.tracksEditor.addSubEditor(track);
    this.tracks.push(track);
  }

  addModule (module) {
    const [dir, title] = module.title.split('/');
    this.ensureModuleEditor(dir, module);
    // this.modules.push(module)
  }

  resize () {
    const settings = getSettings();
    this.tracksEditor.resize(settings.tracks);
    this.tracksEditor.canvas.style.left = settings.modules.width + 'px';
    Object.values(this.modulesEditors).forEach(editor => editor.resize(settings.modules));
  }

  async importProject (title) {
    const json = await load(title);
    json.tracks.forEach(track => this.addTrack(track));
    json.modules.forEach(module => this.addModule(module));
  }
}

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

var createAnalyser = ({
  audio = null,
  source = null,
  size = 1024,
  wave = [0,1].map(() => new Float32Array(size)),
  freq = [0,1].map(() => new Float32Array(size)),
} = {}) => {
  if (!source) {
    if (!audio) {
      audio = new AudioContext({ latencyHint: 'playback' });
    }
    source = audio.createBufferSource();
  } else {
    audio = source.context;
  }

  // frequency analyser
  const splitter = audio.createChannelSplitter(2);
  const analysers = [0,1].map((_, i) => {
    const analyser = audio.createAnalyser();
    analyser.fftSize = size*2;
    analyser.minDecibels = -100;
    analyser.maxDecibels = -0;
    analyser.smoothingTimeConstant = 0;
    splitter.connect(analyser, i, 0);
    return analyser
  });

  // waveform analyser
  let inputBuffer = { getChannelData: () => [] };
  const gain = audio.createGain();
  gain.gain.value = 0.0;
  gain.connect(audio.destination); // or node doesn't start
  const script = audio.createScriptProcessor(size, 2, 2);
  script.onaudioprocess = e => { inputBuffer = e.inputBuffer; };
  script.connect(gain);

  // connect
  source.connect(script);
  source.connect(splitter);

  const getData = () => {
    wave[0].set(inputBuffer.getChannelData(0));
    wave[1].set(inputBuffer.getChannelData(1));
    analysers[0].getFloatFrequencyData(freq[0]);
    analysers[1].getFloatFrequencyData(freq[1]);
    // analysers[0].getFloatTimeDomainData(wave[0])
    // analysers[1].getFloatTimeDomainData(wave[1])
    return { wave, freq }
  };

  return {
    getData,
    source,
    audio,
    size,
    wave,
    freq,
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

const fetchAudioBuffer = async (audio, url) => {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const audioBuffer = await audio.decodeAudioData(arrayBuffer);
  return audioBuffer
};

var Audio = (worker, { source, size = 1024, depth = 60*8, src = null, start = 0 } = {}) => {
  const audio = {
    size,
    depth,
  };

  audio.analyser = createAnalyser({ source, size });

  audio.stop = () => {};

  if (src) {
    fetchAudioBuffer(audio.analyser.audio, src).then(audioBuffer => {
      audio.analyser.source.buffer = audioBuffer;
      audio.analyser.source.loop = true;
      // analyser.source.loopStart = 23
      // analyser.source.loopEnd = 47.2
      audio.analyser.source.start(0, start);
    });
    audio.stop = () => audio.analyser.source.stop();
  }

  const data = audio.data = new Shared32Array(4 * size);

  setTimeout(() => {
    worker.postMessage({
      call: 'onsourcedata',
      name: 'audio',
      data,
    });
  }, 1000);

  audio.update = () => {
    const { wave, freq } = audio.analyser.getData();

    audio.data.set(wave[0], 0*size);
    audio.data.set(wave[1], 1*size);
    audio.data.set(freq[0], 2*size);
    audio.data.set(freq[1], 3*size);
  };

  return audio
};

var Stream = ({ worker, stream, name }) => {
  let _track;

  const [track] = stream.getVideoTracks();

  _track = track;

  const noop = () => {};

  const service = {
    update: noop,
    stop: noop,
    setStream (stream) {
      _track.enabled = false;
      _track.onmute = noop;
      const [track] = stream.getVideoTracks();
      _track = track;
      track.enabled = true;
      maybeBeginCapture(track);
    }
  };

  const beginCapture = track => {
    const capture = new ImageCapture(track);

    track.onmute = () => {
      track.onmute = noop;
      service.update = noop;
      maybeBeginCapture(track);
    };

    service.update = () => {
      if (!track.enabled) return
      capture.grabFrame().then(data => {
        worker.postMessage({
          call: 'onsourcedata',
          name,
          data,
        }, [data]);
      }).catch(error => {
        if (error) {
          console.error(name, error);
          console.dir(track);
          console.log(track.readyState, track.enabled, track.muted);
        }
      });
    };

    service.stop = () => {
      track.stop();
      service.onstop?.();
    };
  };

  const maybeBeginCapture = (track) => {
    if (track.muted) {
      track.onunmute = () => beginCapture(track);
    } else {
      beginCapture(track);
    }
  };

  if (!track) {
    stream.onaddtrack = ({ track }) => maybeBeginCapture(track);
  } else {
    maybeBeginCapture(track);
  }

  return service
};

var Webcam = async (worker) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      resizeMode: 'crop-and-scale',
      facingMode: 'user',
      frameRate: 24,
      width: 1280, //144,
      height: 720, //144
    }
  });

  const webcam = Stream({
    name: 'webcam',
    worker,
    stream,
  });

  return webcam
};

const getUrl = id => `http://localhost:3000/fetch?url=youtube:${id.replace(/a-z-_/gi, '')}`;

var Youtube = worker => {
  const video = document.createElement('video');
  video.volume = 0.000000000000001; // mute prevents video from autoplaying (wtf!)
  video.crossOrigin = 'anonymous';
  video.autoplay = true;
  video.loop = true;
  // video.style.zIndex = 1000
  // video.style.position = 'fixed'
  // document.body.appendChild(video)

  const stream = video.captureStream();

  const youtube = Stream({
    name: 'youtube',
    worker,
    stream,
  });

  youtube.set = id => {
    video.src = getUrl(id);
  };

  youtube.onstop = () => video.pause();

  return youtube
};

var Editor$1 = (worker, { stream }) => {
  const editor = Stream({
    name: 'editor',
    worker,
    stream
  });

  const update = () => editor.update();
  const stop = () => {};

  return {
    ...editor,
    update,
    stop,
  }
};

// hacky way to switch root urls from dev to prod
const prefix = location.port == 8080
  ? '/shader/' : '';

const pixelRatio$1 = window.devicePixelRatio;
const workerUrl = new URL(prefix + 'shader-worker.js', import.meta.url).href;
console.log('worker url', workerUrl);

class Shader {
  constructor (el, { source, stream }) {
    this.el = el;
    this.source = source;
    this.stream = stream;
    this.canvas = El('shader', '', {
      tag: 'canvas',
      width: window.innerWidth,
      height: window.innerHeight
    });
    this.el.insertBefore(this.canvas, this.el.firstChild);

    this.worker = new Worker(workerUrl, { type: 'module' });
    this.worker.onmessage = ({ data }) => this[data.call](data);
    this.worker.onmessageerror = error => this.onerror(error);
    this.worker.onerror = error => this.onerror(error);

    this.sources = {};
    this.frame = 0;
    this.tick = () => {
      if (this.frame % 2 === 0) { // videos only need <30fps
        this.sources.webcam?.update();
        this.sources.youtube?.update();
        this.sources.editor?.update();
      }
      this.sources.audio?.update();
      this.frame++;
    };

    this.render = this.render.bind(this);

    this.offscreen = this.canvas.transferControlToOffscreen();

    this.worker.postMessage({
      call: 'setup',
      canvas: this.offscreen,
      pixelRatio: pixelRatio$1,
    }, [this.offscreen]);
  }

  async makeSources () {
    this.sources = {};
    this.sources.audio = this.sources.audio ?? Audio(this.worker, { source: this.source, size: 1024, depth: 60*8 });
    this.sources.webcam = this.sources.webcam ?? await Webcam(this.worker);
    this.sources.youtube = this.sources.youtube ?? Youtube(this.worker);
    this.sources.editor = this.sources.editor ?? Editor$1(this.worker, { stream: this.stream });
  }

  sourcecall ({ name, method, params }) {
    this.sources?.[name]?.[method]?.(...params);
  }

  onerror (error) {
    console.error(error.error ?? error);
    // this.stop()
  }

  load (filename) {
    this.worker.postMessage({
      call: 'load',
      filename //new URL(prefix + 'test-cg.js', import.meta.url).href,
    });
    this.start();
  }

  start () {
    if (this.playing) return
    this.makeSources();
    cancelAnimationFrame(this.animFrame);
    this.animFrame = requestAnimationFrame(this.render);
    this.worker.postMessage({
      call: 'start'
    });
    this.playing = true;
  }

  stop () {
    Object.values(this.sources).forEach(s => s.stop?.());
    this.sources = {};
    cancelAnimationFrame(this.animFrame);
    this.worker.postMessage({
      call: 'stop'
    });
    this.playing = false;
  }

  render () {
    this.animFrame = requestAnimationFrame(this.render);
    this.tick();
  }
}

class Tabs {
  constructor (el, tabs) {
    this.el = el;

    this.tabs = El('tabs');

    for (const tab of tabs) {
      this[tab] = El('tab ' + tab);
      this.tabs.appendChild(this[tab]);
    }

    this.el.appendChild(this.tabs);
  }

  setActive (tab) {
    if (this.active) {
      this.active.classList.remove('active');
    }
    tab.classList.add('active');
    this.active = tab;
  }
}

// https://github.com/oosmoxiecode/xgui.js/blob/master/src/xgui.js
const relativeMouseCoords = function (canvas, event) {
  var totalOffsetX = 0;
  var totalOffsetY = 0;
  var canvasX = 0;
  var canvasY = 0;
  var currentElement = canvas;

  do {
    totalOffsetX += currentElement.offsetLeft;
    totalOffsetY += currentElement.offsetTop;
  }
  while (currentElement = currentElement.offsetParent)

  canvasX = event.pageX - totalOffsetX;
  canvasY = event.pageY - totalOffsetY;

  // Fix for variable canvas width
  canvasX = Math.round( canvasX * (canvas.width / canvas.offsetWidth) );
  canvasY = Math.round( canvasY * (canvas.height / canvas.offsetHeight) );

  return {x:canvasX, y:canvasY}
};

const pixelRatio$2 = window.devicePixelRatio;

const settings = {
  height: 20,
  colors: ['#6047ff','#00f3b2','#ff391f'],
  muteColor: '#336',
  color: a => `rgba(0,243,178,${a})`
};

class Mixer {
  constructor (el, faders) {
    faders.forEach(fader => fader.vol = fader.vol ?? 0.8); // 0.8 is default in xone
    this.el = el;
    this.faders = faders;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'mixer';
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.ctx.scale(pixelRatio$2, pixelRatio$2);
    // this.ctx.fillStyle = 'rgba(0,0,0,.5)'
    // this.ctx.fillRect(0, 0, this.width, this.height)
    this.ctx.textBaseline = 'top';
    this.faders.forEach((_, i) => this.drawFader(i));
    this.registerEvents();
    this.el.appendChild(this.canvas);
  }

  destroy () {
    this.canvas.onmousedown = null;
    this.el.removeChild(this.canvas);
  }

  updateFader (i) {
    let y = (settings.height + 2) * i;
    let w = this.width;
    let off = 8.1;

    const gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
    gradient.addColorStop(.7, settings.colors[0]);
    gradient.addColorStop(.9, settings.colors[1]);
    gradient.addColorStop(.96, settings.colors[2]);

    this.ctx.fillStyle = '#1f1f2f';
    this.ctx.fillRect(w/2+off, y+3, w/2-4-off, settings.height - 6);
    this.ctx.fillStyle = this.faders[i].mute ? settings.muteColor : gradient; //settings.color(this.faders[i].vol*.8+.2)
    let r = ( (w/2-8-off) * (this.faders[i].vol) );
    this.ctx.fillRect(w/2+2+off, y+5, r, settings.height - 10);
  }

  drawFader (i) {
    let y = (settings.height + 2) * i;
    let w = this.width;
    let off = 8.1;
    this.ctx.fillStyle = 'rgba(0,0,0,.5)';
    this.ctx.fillRect(0, y, w, settings.height);
    this.updateFader(i);
    // ctx.fillStyle = '#f00'
    // ctx.clearRect(x, h + 5, 30, 20)
    // ctx.fillStyle = faders[i].solo ? '#fff' : '#666'
    // ctx.fillText('S', x+3, 7 + h)
    this.ctx.font = '6pt mono'; //sans serif'
    this.ctx.fillStyle = '#55a';
    this.ctx.fillText(i, 5, y + 6);

    this.ctx.fillStyle = settings.colors[this.faders[i].X ? 1 : 0];
    this.ctx.fillText('X', 119+off, y + 6);
    this.ctx.fillStyle = settings.colors[this.faders[i].Y ? 1 : 0];
    this.ctx.fillText('Y', 129+off, y + 6);

    this.ctx.font = '6.5pt mono'; //sans serif'
    this.ctx.fillStyle = '#aaf';
    this.ctx.fillText(this.faders[i].title, 16, y + 5.5);
    // ctx.fillStyle = faders[i].mute ? '#fff' : '#666'
    // ctx.fillText('M', x + 21, 7 + h)
    this.ctx.beginPath();
    this.ctx.fillStyle = settings.colors[this.faders[i].mute ? 2 : 1];
    this.ctx.arc(w/2 - 8+off, y + settings.height/2, 1.9, 0, 2*Math.PI);
    this.ctx.fill();
  }

  registerEvents () {
    let strategy;

    const get = e => {
      let { x, y } = relativeMouseCoords(this.canvas, e);
      const i = Math.ceil(y / pixelRatio$2 / (settings.height + 2)) - 1;
      x -= 8.1*2;
      return { x, y, i }
    };

    let selected = null;
    const reorderTrack = e => {
      const { i } = get(e);
      if (i < 0 || i > this.faders.length - 1) return
      if (selected === null) selected = i;
      if (i !== selected) {
        this.faders.splice(selected, 1, this.faders.splice(i, 1, this.faders[selected])[0]);
        this.drawFader(i);
        this.drawFader(selected);
        selected = i;
      }
    };
    const stopReorderTrack = () => { selected = null; };

    const adjustVolume = e => {
      const { x, i } = get(e);
      const vol = Math.max(0, Math.min(1, ( (x-(this.width)) / ((this.width * pixelRatio$2 / 2)) )));
      if (this.faders[i]) {
        this.faders[i].vol = vol;
        this.onchange?.(this.faders[i]);
        this.updateFader(i);
      }
    };

    const onmousemove = e => strategy[0](e);

    const stop = () => {
      strategy[1]?.();
      document.body.removeEventListener('mousemove', onmousemove);
      window.removeEventListener('blur', stop, { once: true });
      window.removeEventListener('mouseup', stop, { once: true });
    };

    this.canvas.onmousedown = e => {
      const { x, i } = get(e);

      // is mute button
      if (x < this.width && x >= this.width - 25) {
        this.faders[i].mute = !this.faders[i].mute;
        this.onchange?.(this.faders[i]);
        this.drawFader(i);
        return
      }

      // is Y
      if (x < this.width - 25 && x >= this.width - 45) {
        this.faders[i].Y = !this.faders[i].Y;
        this.faders[i].X = false;
        this.drawFader(i);
        return
      }

      // is X
      if (x < this.width - 45 && x >= this.width - 65) {
        this.faders[i].X = !this.faders[i].X;
        this.faders[i].Y = false;
        this.drawFader(i);
        return
      }
      if (x < this.width * pixelRatio$2 / 2 - 65) {
        strategy = [reorderTrack, stopReorderTrack];
      } else {
        strategy = [adjustVolume];
      }

      window.addEventListener('blur', stop, { once: true });
      window.addEventListener('mouseup', stop, { once: true });
      document.body.addEventListener('mousemove', onmousemove);
      onmousemove(e);
    };
  }

  resize () {
    this.width = 300, //(window.innerWidth - (window.innerWidth / 2)) / 2
    this.height = this.faders.length * (settings.height + 2);
    Object.assign(this.canvas, {
      width: this.width * pixelRatio$2,
      height: this.height * pixelRatio$2
    });
    Object.assign(this.canvas.style, {
      right: 0,
      width: this.width + 'px',
      height: this.height + 'px'
    });
  }
}

const fontUrl = '/fonts/mplus-1m-regular.woff2';

const fontFace = new FontFace(
  'mono',
  `local('mono'),
   url('${fontUrl}') format('woff2')`,
);
fontFace.load().then(font => {
  document.fonts.add(font);
});

class SelectMenu {
  constructor (el, items) {
    this.el = el;
    this.items = items.map(item => {
      item.el = Button(item.id, item.text);
      item.el.onclick = () => item.fn();
      this[item.id] = item;
      return item
    });
    this.menu = El('select-menu');
    this.items.forEach(item => this.menu.appendChild(item.el));
    this.el.appendChild(this.menu);
  }
}

class ButtonPlayPause {
  constructor (el, size = 29) {
    this.el = el;
    this.play = Icon(size, 'play', 'M6 4 L6 28 21 16 Z');
    this.pause = Icon(size, 'play pause', 'M16 6 L16 27 M6 6 L6 27');
    this.play.onmousedown = () => {
      this.play.parentNode.replaceChild(this.pause, this.play);
      this.onplay?.();
    };
    this.pause.onmousedown = () => {
      this.pause.parentNode.replaceChild(this.play, this.pause);
      this.onpause?.();
    };
    this.el.appendChild(this.play);
  }
}

const dispatch = listeners => event =>
  listeners.forEach(fn => fn(event));

const PAUSE_TIMEOUT = 10 * 1000; // 10 secs

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

    this.pause = this.pause.bind(this);

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
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.pause, PAUSE_TIMEOUT);

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

    this.paused = false;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.pause, PAUSE_TIMEOUT);
  }

  pause () {
    try {
      if (this.worker) {
        this.worker.terminate();
      }
      this.worker = null;
    } catch {}

    try {
      if (this.safe) {
        this.safe.terminate();
      }
      this.safe = null;
    } catch {}

    this.paused = true;
    this.onpause();
    console.log('worker paused: ', this.url);
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
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.pause, PAUSE_TIMEOUT);

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
rpc.update = (url, noCreate = false) => getRpc(url, noCreate)?.worker?.updateInstance();
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
      } else if (this.worker.paused) {
        this.worker.updateInstance();
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
    this.worker.onmessageerror = error => rpc.onmessageerror?.(error, this.url);
    this.worker.onerror = error => rpc.onerror?.(error, this.url);
    this.worker.onfail = fail => rpc.onfail?.(fail, this.url);
    this.worker.onpause = () => rpcs.delete(this.url);
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

const getRpc = (url, noCreate = false) => {
  url = new URL(url, location.href).href;
  if (isMain) {
    if (!rpcs.has(url)) {
      if (noCreate) return
      rpcs.set(url, new Rpc(url));
    }
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

class Shared32Array$1 {
  constructor (length) {
    return new Float32Array(
      new SharedArrayBuffer(
        length * Float32Array.BYTES_PER_ELEMENT)
    )
  }
}

// hacky way to switch api urls from dev to prod
const API_URL$1 = location.port.length === 4 ? 'http://localhost:3000' : location.origin;

var SampleService = audio => {
  const samples = new Map;

  const SampleService = {
    methods: {
      fetchSample: async url => {
        if (url[0] !== '/') {
          url = API_URL$1 + '/fetch?url=' + encodeURIComponent(url);
        } else {
          url = new URL(url, location.href).href;
        }

        let sample = samples.get(url);

        if (!sample) {
          const res = await fetch(url);
          const arrayBuffer = await res.arrayBuffer();
          const audioBuffer = await audio.decodeAudioData(arrayBuffer);
          console.log('got audiobuffer', url, audioBuffer);
          const floats = Array(audioBuffer.numberOfChannels).fill(0).map((_, i) =>
            audioBuffer.getChannelData(i));
          sample = floats.map(buf => {
            const shared = new Shared32Array$1(buf.length);
            shared.set(buf);
            return shared
          });
          samples.set(url, sample);
        }

        return sample
      }
    },
    postMessage (data) {
      SampleService.worker.onmessage({ data });
    },
    worker: {
      postMessage (data) {
        SampleService.onmessage({ data: { ackId: -999999, message: data } });
      }
    }
  };

  install(SampleService);
  window['main:sample-service'] = SampleService;
  console.log('sample service running');
};

let audio;

var Audio$1 = () => {
  if (audio) return audio

  audio = new AudioContext({
    numberOfChannels: 2,
    sampleRate: 44100,
    latencyHint: 'playback' // without this audio glitches
  });

  audio.onstatechange = e => {
    console.log('audio context state change:', audio.state);
  };

  audio.gain = audio.createGain();
  audio.gain.gain.value = 1;
  audio.gain.connect(audio.destination);

  SampleService(audio);

  return audio
};

class ListBrowse {
  constructor (el, list) {
    this.el = el;
    this.list = El('list-browse');

    list.forEach(item => {
      const path = item.replace(/[^a-z0-9-/]/gi, '');
      const meta = item.replace(/[^a-z0-9]/gi, '_');
      const img = `${URL$1}/${meta}.webp`;
      const ogg = `${URL$1}/${meta}.ogg`;
      const image = new Image;
      image.setAttribute('crossorigin', 'anonymous');
      image.src = img;
      let dragImg;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#373174';
        ctx.fillRect(0,0,100,50);
        ctx.drawImage(image, 0, 0, 100, 50);
        dragImg = new Image;
        dragImg.src = canvas.toDataURL();
      };

      const itemEl = El('item', `
        <a href="/${item}">
          <div class="name">${item}</div>
          <img src="${img}" crossorigin="anonymous">
        </a>
      `, { draggable: true });

      itemEl.ondragstart = e => {
        const dropArea = El('drop-area', 'drop here<br>to add track');
        dropArea.ondrop = e => {
          e.preventDefault();
          const data = e.dataTransfer.getData('text/plain');
          this.ondrop?.(data);
        };
        itemEl.ondragend = e => {
          document.body.removeChild(dropArea);
        };
        dropArea.ondragover = e => { // really? wtf?
          e.preventDefault();
        };
        dropArea.ondragenter = e => {
          dropArea.classList.add('dragover');
        };
        dropArea.ondragleave = e => {
          dropArea.classList.remove('dragover');
        };
        document.body.appendChild(dropArea);
        e.dataTransfer.setData('text/plain', item);
        e.dataTransfer.dropEffect = 'link';
        e.dataTransfer.setDragImage(dragImg, 100, 50);
      };

      let node;

      const buttonPlayPause = new ButtonPlayPause(itemEl, 22);
      buttonPlayPause.onplay = async () => {
        const audio = Audio$1();
        const res = await fetch(ogg);
        const arrayBuffer = await res.arrayBuffer();
        const audioBuffer = await audio.decodeAudioData(arrayBuffer);
        if (node) {
          node.stop();
        }
        node = audio.createBufferSource();
        node.buffer = audioBuffer;
        node.loop = true;
        node.connect(audio.destination);
        node.start();
      };
      buttonPlayPause.onpause = () => {
        if (node) {
          node.stop();
          node = null;
        }
      };
      this.list.onclick = () => {
        return false
      };
      this.list.appendChild(itemEl);
    });

    this.el.appendChild(this.list);
  }
}

class ButtonSave {
  constructor (el) {
    this.el = el;
    // this.save = Icon(32, 'save', 'M5 27  L30 27  30 10  25 4  10 4  5 4  Z  M12 4  L12 11  23 11  23 4  M12 27  L12 17  23 17  23 27')
    // this.save = Icon(32, 'save', 'M5 27  L30 27  30 10  25 4  10 4  5 4  Z  M11 4  L11 10  21 10  21 4', '<circle class="path" cx="17.5" cy="18.5" r="4" />')
    // this.save = Icon(32, 'save', 'M5 27  L30 27  30 10  25 4  10 4  5 4  Z  M10.5 9.5  L21 9.5', '<circle class="path" cx="17.4" cy="18.5" r="3.4" />')
    // this.save = Icon(32, 'save', 'M7 26 L28 26', '<circle class="path" cx="17.4" cy="14.4" r="5" />')
    // this.save = Icon(28, 'save', 'M28 22 L28 30 4 30 4 22 M16 4 L16 24 M8 16 L16 24 24 16')
    this.save = Icon(37, 'save', 'M17 4 Q13 6, 16 10.5 T 15 17  M7 16 L16 24 25 16 ');
    // this.save = Icon(30, 'save', 'M9 22 C0 23 1 12 9 13 6 2 23 2 22 10 32 7 32 23 23 22 M11 18 L16 14 21 18 M16 14 L16 29')
    // this.save = Icon(28, 'save', 'M14 9 L3 9 3 29 23 29 23 18 M18 4 L28 4 28 14 M28 4 L14 18')
    // this.save = Icon(28, 'save', 'M28 22 L28 30 4 30 4 22 M16 4 L16 24 M8 12 L16 4 24 12')

    this.save.disabled = true;
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

class ButtonLogo {
  constructor (el) {
    this.el = el;
    this.logo = Icon(32.5, 'logo', 'M4.9 6 A 13.8 13.8 0 1 0 27.4 6', '<path class="path wave" d="M9.7 13.5 Q12 10.5, 15.5 13.9 T 22 13.9" />');
    this.logo.onclick = () => this.onclick?.();
    this.el.appendChild(this.logo);
  }
}

class InputBpm {
  constructor (el) {
    this.el = el;

    this.bpm = document.createElement('div');
    this.value = this.bpm.textContent = '125';
    this.bpm.className = 'bpm';

    this.input = document.createElement('input');
    this.input.className = 'bpm';
    this.input.autocomplete = 'off';
    this.input.type = 'number';
    this.input.min = '1';
    this.input.max = '999';

    this.bpm.ondblclick = () => {
      this.input.value = this.bpm.textContent;
      this.bpm.parentNode.replaceChild(this.input, this.bpm);
      this.input.focus();
    };
    this.input.onblur = () => {
      this.input.parentNode.replaceChild(this.bpm, this.input);
      this.setValue(this.input.value || this.bpm.textContent);
    };

    this.el.appendChild(this.bpm);
  }

  setValue (bpm) {
    this.value = this.bpm.textContent = Math.min(
      999,
      Math.max(
        1,
        parseInt(
          bpm
        )));
  }
}

class Toolbar {
  constructor (el) {
    this.el = el;

    this.toolbar = El('toolbar');
    this.toolbarLeft = El('toolbar-left');
    this.toolbarCenter = El('toolbar-center');
    this.toolbarRight = El('toolbar-right');
    this.toolbar.appendChild(this.toolbarLeft);
    this.toolbar.appendChild(this.toolbarCenter);
    this.toolbar.appendChild(this.toolbarRight);

    this.inputBpm = new InputBpm(this.toolbarRight);
    this.buttonPlayPause = new ButtonPlayPause(this.toolbarRight);
    this.buttonSave = new ButtonSave(this.toolbarLeft);
    this.buttonLogo = new ButtonLogo(this.toolbarCenter);

    this.el.appendChild(this.toolbar);
  }
}

var toFinite = n => Number.isFinite(n) ? n : 0;

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
  buffers,
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
      buffer = Array.from(Array(channels), () => new Shared32Array$1(size));
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
const skipCreate = new Set;

mixWorker.update = (url, force = false, noCreate = false) => {
  if (noCreate) {
    skipCreate.add(url);
  }
  if (!force && mixWorker.queueUpdates) {
    scheduleUpdate.add(url);
  } else {
    rpc.update(getRpcUrl(url), noCreate);
  }
};

mixWorker.flushUpdates = () => {
  for (const url of scheduleUpdate) {
    mixWorker.update(url, true, skipCreate.has(url));
  }
  scheduleUpdate.clear();
  skipCreate.clear();
};

mixWorker.clear = () => rpc.clearAll();

const getRpcUrl = url => {
  url = new URL(url, location.href).href;
  return THREAD_URL + '?' + encodeURIComponent(url)
};

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

class LoopNode {
  constructor ({ bpm = null, numberOfChannels = 2 } = {}) {
    this.currentBufferIndex = 0;
    this.offsetTime = 0;
    this.numberOfChannels = numberOfChannels;
    if (bpm) this.setBpm(bpm);
  }

  get bpm () {
    return parseFloat(
      (60 * (
        this.sampleRate
      / getBeatRate(this.sampleRate, this._bpm)
      )
    ).toFixed(6))
  }

  get beatRate () {
    return getBeatRate(this.sampleRate, this.bpm)
  }

  get currentTime () {
    return this.context.currentTime - this.offsetTime
  }

  get sampleRate () {
    return this.context.sampleRate
  }

  get barTime () {
    return this.bufferSize / this.sampleRate
  }

  get remainTime () {
    const bar = this.barTime;
    const time = this.currentTime;
    const remain = bar - (time % bar);
    return remain
  }

  get syncTime () {
    const bar = this.barTime;
    const time = this.currentTime;
    const remain = bar - (time % bar);
    return time + remain + this.offsetTime
  }

  get bufferSize () {
    return this.beatRate * 4 //* 4 /// 5 | 0
  }

  resetTime (offset = 0) {
    this.offsetTime = this.context.currentTime + offset;
  }

  setBpm (bpm) {
    this._bpm = bpm;
  }

  _onended () {
    this.gain.disconnect();
    this.playingNode?.disconnect();
    this.onended?.();
  }

  connect (destination) {
    this.context = destination.context;
    this.destination = destination;
    this.gain = this.context.createGain();
    this.audioBuffers = [1,2].map(() =>
      this.context.createBuffer(
        this.numberOfChannels,
        this.bufferSize,
        this.sampleRate
      )
    );
    this.nextBuffer = this.audioBuffers[0];
  }

  _onbar () {
    if (!this.playing) return
    if (this.scheduledNode) {
      this.playingNode = this.scheduledNode;
      this.scheduledNode = null;
      this.currentBufferIndex = 1 - this.currentBufferIndex;
      this.nextBuffer = this.audioBuffers[this.currentBufferIndex];
    }
    this.scheduleNextBar();
    this.onbar?.();
  }

  scheduleNextBar (syncTime = this.syncTime) {
    const bar = this.context.createConstantSource();
    bar.onended = () => this._onbar();
    bar.start();
    bar.stop(syncTime);
  }

  playBuffer (buffer) {
    const syncTime = this.syncTime;
    const output = this.nextBuffer;
    for (let i = 0; i < this.numberOfChannels; i++) {
      const target = output.getChannelData(i);
      if (target.length !== buffer[i].length) {
        throw new RangeError('loop node: buffer size provided unequal to internal buffer size: '
          + buffer[i].length + ' instead of ' + target.length)
      }
      target.set(buffer[i]);
    }

    if (!this.scheduledNode) {
      const node = this.scheduledNode = this.context.createBufferSource();
      node.buffer = this.nextBuffer;
      node.connect(this.gain);
      node.loop = true;
      node.start(syncTime);
      this.playingNode?.stop(syncTime);
    }
  }

  start () {
    if (!this.playing) {
      this.playing = true;
      this.gain.connect(this.destination);
      this.scheduleNextBar();
    }
  }

  stop (syncTime = this.syncTime) {
    if (!this.playing) {
      throw new Error('loop node: `stop()` called but has not started')
    }
    this.playing = false;
    if (this.playingNode) {
      this.playingNode.onended = () => this._onended();
      this.playingNode.stop(syncTime);
    }
    if (this.scheduledNode) {
      this.scheduledNode.stop(0);
      this.scheduledNode.disconnect();
    }
  }
}

const getBeatRate = (sampleRate, bpm) => {
  return Math.round(sampleRate * (60 / bpm))
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

  assertFinite(context.n);

  if (numOfChannels > 2) {
    throw new RangeError('unsupported number of channels [' + numOfChannels + ']')
  }

  context.update();

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
    // console.log('processing kernel:', id)
    kernel = convolve.fftProcessKernel(c.buffer[0].length, impulse[0]);
    await c.set(id, kernel);
    // console.log('set kernel cache:', id)
  }
  const reverb = convolve.fftConvolution(c.buffer[0].length, kernel, impulse[0].length);
  return reverb
};

var ImpulseReverb = async (c, { url, offset = 0, length = -1, id = '' }=c) => {
  const reverb = await impulseConvolve(c, url, length);
  let tail = 0;
  let prev = (await c.get('prev:'+id+url+(c.n-c.buffer[0].length)))||new Float32Array();
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
    c.set('prev:'+id+url+c.n, prev, 5000);
    return curr.subarray(offset, offset + len)
  }
};

var impulseConvolve$1 = async (c, url, length) => {
  const impulse = await c.sample(url);
  if (length > -1) {
    impulse[0] = impulse[0].subarray(0, length);
    impulse[1] = impulse[1].subarray(0, length);
  }
  const id = 'impulse-convolve-stereo:kernel:' + url + ':' + c.buffer[0].length + ':' + length;
  let kernel = await c.get(id);
  if (kernel === false) {
    // console.log('processing kernel:', id)
    kernel = [
      convolve.fftProcessKernel(c.buffer[0].length, impulse[0]),
      convolve.fftProcessKernel(c.buffer[0].length, impulse[1])
    ];
    await c.set(id, kernel);
    // console.log('set kernel cache:', id)
  }
  const reverb = [
    convolve.fftConvolution(c.buffer[0].length, kernel[0], impulse[0].length),
    convolve.fftConvolution(c.buffer[0].length, kernel[1], impulse[0].length)
  ];
  return reverb
};

var ImpulseReverbStereo = async (c, { url, offset = 0, length = -1, id = '' }=c) => {
  const reverb = await impulseConvolve$1(c, url, length);
  let tail = 0;
  let prev = (await c.get('impulse-reverb-stereo:prev:'+id+url+(c.n-c.buffer[0].length)))
    ||[new Float32Array(),new Float32Array()];
  let curr;
  let len = 0;
  let i = 0;
  return c => {
    len = c.buffer[0].length;
    curr = [
      reverb[0](c.buffer[0]),
      reverb[1](c.buffer[1])
    ];
    // add remaining tail from previous step
    for (i = 0; i < prev[0].length; i++) {
      curr[0][i] += prev[0][i];
      curr[1][i] += prev[1][i];
    }
    tail = (curr[0].length - offset) - len;
    prev[0] = curr[0].subarray(-tail);
    prev[1] = curr[1].subarray(-tail);
    c.set('impulse-reverb-stereo:prev:'+id+url+c.n, prev, 5000);
    return [
      curr[0].subarray(offset, offset + len),
      curr[1].subarray(offset, offset + len),
    ]
  }
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
    this.id = data.id ?? randomId();

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

  buf ({ id = '', len = this.bufferSize, ch = this.buffer.length } = {}) {
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

  reverbStereo (params) {
    return ImpulseReverbStereo(this, params)
  }

  zero (buffer = this.buffer) {
    buffer.forEach(b => b.fill(0));
    return buffer
  }

  src (url, params = {}) {
    const targetUrl = new URL(url, this.url ?? location.href).href;
    const context = Object.assign(this.toJSON(), params, { url: targetUrl });
    return mixWorker(targetUrl, context).then(result => {
      result.update = c => { c.src(url, params); };
      return result
    })
  }

  async render (name, params) {
    const id = name + checksumOf(params);
    const buffer  = await this.buf({ ...params, id });
    if (buffer.createdNow) {
      console.log('shall render', name, id, buffer, params);
      await this.src('./' + name + '.js', { buffer, ...params, id });
    }
    return buffer
  }

  mix (...args) {
    return mixBuffers(...args)
  }

  async import (sources) {
    const entries = await Promise.all(
      Object.entries(sources)
        .map(async ([key, value]) => {
          const params = { ...value };
          delete params.src;
          const buffer = await this.render(value.src ?? key, {
            id: key,
            ...params,
          });
          return [key, buffer]
        }));

    return Object.fromEntries(entries)
  }

  // async import (sources) {
  //   const entries = await Promise.all(
  //     Object.entries(sources)
  //       .map(async ([key, value]) => {
  //         const buffer = value.buffer ?? await this.buf({
  //           id: value.id ?? key,
  //           len: value.len ?? this.br,
  //           ch: value.ch ?? 1,
  //         })
  //         const params = { ...value }
  //         delete params.src
  //         const src = await this.src('./' + (value.src ?? key) + '.js', {
  //           id: key,
  //           ...params,
  //           buffer
  //         })
  //         return [key, buffer]
  //       }))

  //   return Object.fromEntries(entries)
  // }

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

  get bufferSize () { return this.buffer[0].length*4 }

  toJSON () {
    const json = {};
    for (const key in this) {
      if (key[0] === '_') continue
      if (typeof this[key] !== 'function') {
        json[key] = this[key];
      }
    }
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

const values = new Map;
const ttlMap = new Map;

const GlobalService = {
  values,
  ttlMap,
  methods: {
    get: id => {
      const value = values.get(id);
      if (!value) return false
      else return value
    },
    set: (id, value, ttl) => {
      values.set(id, value);
      if (ttl) ttlMap.set(id, [performance.now(), ttl]);
      return value
    }
  },
  postMessage (data) {
    GlobalService.worker.onmessage({ data });
  },
  worker: {
    postMessage (data) {
      GlobalService.onmessage({ data: { ackId: -999999, message: data } });
    }
  }
};

setInterval(() => {
  const now = performance.now();
  for (const [id, [time, ttl]] of ttlMap.entries()) {
    if (now > time + ttl) {
      ttlMap.delete(id);
      values.delete(id);
      console.log('gs gc:', id, ttl, [values.size]);
    }
  }
  if (values.size > 30) {
    console.warn('gs: too many values:', values.size);
  }
}, 1000);

install(GlobalService);
window['main:global-service'] = GlobalService;
console.log('global service running');

mixWorker.queueUpdates = true;

class LoopPlayer {
  constructor (name, fn, { numberOfChannels = 2, bpm = 125 } = {}) {
    this.name = name;
    this.fn = fn;
    this.bpm = bpm;
    this.numberOfChannels = numberOfChannels;
    this.node = new LoopNode({ numberOfChannels, bpm });
    this.node.onbar = () => {
      this.context.n += this.buffer[0].length;

      if (this.onbar) {
(async () => {
          await this.onbar();
          this.render();
        })();
      } else {
        this.render();
      }
    };
    this.playing = false;

    this.render = atomic(
      (...args) => this._render(...args), {
        recentOnly: true,
        timeout: 5000
      });

    this.renderInitial = atomic(
      (...args) => this._render(...args), {
        recentOnly: true,
        timeout: 60000
      });
  }

  connect (destination) {
    this.node.connect(destination);
    this.buffer = Array(this.numberOfChannels).fill(0).map(() =>
      new Shared32Array$1(this.node.bufferSize));
    this.context = {
      n: 0,
      bpm: this.node.bpm, // NOTE: node.bpm !== this.bpm
      beatRate: this.node.beatRate,
      sampleRate: this.node.sampleRate,
      buffer: this.buffer
    };
    this.mix = Mix(this.context);
  }

  async _render ({ initial = false } = {}) {
    if (!this.playing) return

    mixWorker.flushUpdates();

    const time = performance.now();

    let n = this.context.n;

    // if (this.node.remainTime < this.avgRenderTime) {
    //   console.warn(`[${this.name}] not enough time, trying for next buffer:`, this.node.remainTime, this.avgRenderTime)
    //   n += this.buffer[0].length
    // }
    // console.log(this.node.remainTime)

    console.log(`[${this.name}] will render:`, n);
    try {
      await this.mix(this.fn, { n });
    } catch (error) {
      this.onerror?.(error);
      console.error(this.name, error);
      return
    }

    // if (this.context.n) {
    //   console.warn('too late, discard:', n, this.context.n)
    //   return
    // }

    // if (this.mix.n < this.context.n) {
    //   console.warn(`[${this.name}] too late, discard:`, this.mix.n, this.context.n)
    //   return
    // }

    if (!this.playing) {
      console.warn(`[${this.name}] not playing, discard:`, n);
      return
    }

    const diff = performance.now() - time;
    console.log(`[${this.name}] render took:`, diff);
    if (diff > 1000) console.warn('too slow!', (diff/1000).toFixed(1) + 's' );

    this.maxRenderTime = Math.max(diff/1000, this.maxRenderTime);
    if (this.avgRenderTime === -1) {
      this.avgRenderTime = diff/1000;
    } else {
      this.avgRenderTime = (diff/1000 + this.avgRenderTime) / 2;
    }
    // this.avgRenderTime = Math.max(diff/1000, this.maxRenderTime)

    console.log(`[${this.name}] will play:`, n);
    if (initial) {
      // this.node.resetTime?.(-3)
      this.node.start();
    }

    this.node.playBuffer(this.buffer);

    this.onrender?.(this.buffer);
  }

  setVolume (vol) {
    this.node.gain.gain.linearRampToValueAtTime(
      vol,
      this.node.context.currentTime + 0.1
    );
  }

  start () {
    this.maxRenderTime = 0;
    this.avgRenderTime = -1;
    this.playing = true;
    this.renderInitial({ initial: true });
  }

  stop (syncTime) {
    this.playing = false;
    this.node.stop(syncTime);
    mixWorker.clear();
  }
}

class DynamicCache {
  static async cleanup () {
    const cacheKeys = await window.caches.keys();
    await Promise.all(cacheKeys
      // .filter(key => key.startsWith('dynamic-cache:')) //TODO: enable this in prod
      .map(key => window.caches.delete(key))
    );
  }

  static install () {
    return new Promise(async resolve => {
      await DynamicCache.cleanup();

      const reg = await navigator
        .serviceWorker
        .register('/dynamic-cache-service-worker.js', { scope: '/' });

      if (reg.active) return resolve(reg.active)

      reg.onupdatefound = () => {
        reg.installing.onstatechange = event => {
          if (event.target.state === 'activated') {
            resolve(event.target);
          }
        };
      };

      reg.update();
    })
  }

  constructor (namespace = 'test', headers = { 'Content-Type': 'application/javascript' }) {
    this.namespace = namespace;
    this.headers = headers;
    this.path = '/dynamic-cache/cache/' + this.namespace;
  }

  toJSON () {
    return {
      namespace: this.namespace,
      headers: this.headers,
      path: this.path
    }
  }

  async put (filename, content, headers = this.headers) {
    filename = `${this.path}/${filename}`;
    const req = new Request(filename, { method: 'GET', headers });
    const res = new Response(content, { status: 200, headers });
    const cache = await caches.open('dynamic-cache:' + this.namespace);
    await cache.put(req, res);
    this.onchange?.(location.origin + filename);
    return location.origin + filename
  }
}

// ui

let players;
let shaders;
let shader;

const cache = new DynamicCache('projects', {
  'Content-Type': 'application/javascript'
});
cache.onchange = url => {
  console.log('cache put:', url);
  if (!url.includes('gl/')) {
    mixWorker.update(url, false, true);
    console.log('mix worker update:', url);
  } else {
    if (shader) {
      url = new URL('shader.js', url).href;
      shader.load(url);
    }
  }
};

mixWorker.onerror = (error, url) => {
  console.error(error, url);
};

const main = async (el) => {
  await DynamicCache.install();

  const tabs = new Tabs(el, [
    'project',
    'actions',
    'browse',
  ]);
  // tabs.setActive(tabs.actions)

  const actionsMenu = new SelectMenu(tabs.actions, [
    {
      id: 'browse',
      text: 'Browse Projects',
      fn: async () => {
        tabs.setActive(tabs.browse);
        const recent$1 = await recent();
        tabs.browse.innerHTML = '';
        const listBrowse = new ListBrowse(tabs.browse, recent$1.projects);
        listBrowse.ondrop = title => {
          editors.importProject(title);
        };
      }
    },
    {
      id: 'start',
      text: 'Start New Project',
      fn: async () => {
        const result = await ask('New Project', 'Type name for new project', 'untitled');
        if (result) {
          editors.destroy();
          editors = new Editors(el, result.value);
          bindEditorsListeners(editors);
          updateMixer();
        }
      }
    },
    {
      id: 'addtrack',
      text: 'Add Track',
      fn: async () => {
        const result = await ask('Set track path/name', `path/name`, '');
        if (result) {
          const [dir, title] = result.value.split('/');

          editors.addTrack({
            title: dir + '/' + title,
            value: 'export default c => 0',
          });

          editors.ensureModuleEditor(dir);

          updateMixer();

          players = null;
        }
      }
    },
    {
      id: 'addmodule',
      text: 'Add Module',
      fn: async () => {
        const result = await ask('Set module path/name', `path/name`, '');
        if (result) {
          const [dir, title] = result.value.split('/');

          const mod = {
            title: dir + '/' + title,
            value: 'export default c => 0',
          };

          editors.ensureModuleEditor(dir, mod);
        }
      }
    },
    // {
    //   id: 'import',
    //   text: 'Import from File',
    //   fn: () => {}
    // },
    // {
    //   id: 'export',
    //   text: 'Export to File',
    //   fn: () => {}
    // },
    // {
    //   id: 'export',
    //   text: 'Export to Audio',
    //   fn: () => {}
    // },
  ]);

  const toolbar = new Toolbar(el);
  const { buttonPlayPause, buttonSave, buttonLogo, inputBpm } = toolbar;

  let editors;
  if (location.pathname.split('/').length === 3) {
    editors = await Editors.fromProject(el, location.pathname.slice(1));
  } else {
    editors = await Editors.fromProject(el, './demos/drums');
  }

  const bindEditorsListeners = editors => {
    editors.onfocus = editor => {
      if (shader) {
        shader.sources.editor?.setStream(editor.stream);
      }
    };

    editors.onchange = file => {
      cache.put(file.title, file.value);
      buttonSave.enable();
    };

    editors.onrename = file => {
      editors.onchange(file);
      updateMixer();
      console.log('renamed', file);
    };

    editors.onadd = file => {
      editors.onchange(file);
      updateMixer();
    };

    editors.onremove = file => {
      editors.onchange(file);
      updateMixer();
    };

    editors.ontoaddtrack = () => actionsMenu.addtrack.fn();
    editors.ontoaddmodule = () => actionsMenu.addmodule.fn();
  };

  bindEditorsListeners(editors);

  inputBpm.setValue(editors.project.bpm);

  let mixer;

  const updateMixer = () => {
    if (mixer) {
      mixer.destroy();
    }
    mixer = new Mixer(tabs.project, editors.tracks);
    mixer.onchange = track => {
      if (track.player) {
        track.player.setVolume(track.mute ? 0 : track.vol);
      }
    };
  };

  updateMixer();

  const play = buttonPlayPause.onplay = async () => {
    const audio = Audio$1();

    if (editors.tracks.find(track => track.title.endsWith('shader.js'))) {
      shader = shader ?? new Shader(el, {
        source: audio.gain,
        stream: editors.tracksEditor.stream,
      });
    }

    const bpm = toFinite(+inputBpm.value);
    if (!players || players[0].bpm !== bpm) {
      await Promise.all([
        ...editors.tracks,
        ...editors.modules
      ].map(async file => {
        file.filename = await cache.put(file.title, file.value);
      }));

      //mixWorker.scheduleUpdate.clear()

      players = editors.tracks
        .filter(track => !track.title.endsWith('shader.js'))
        .map(track => {
          const player = new LoopPlayer(
            track.title,
            c => c.src(track.filename),
            { bpm, numberOfChannels: 2 }
          );
          player.track = track;
          track.player = player;
          return player
        });

      players.forEach(player => {
        player.connect(audio.gain);
        player.setVolume(player.track.mute ? 0 : player.track.vol);
        player.onrender = buffer => {};
        player.onerror = error => console.error(error);
      });
    }

    if (!shaders) {
      shaders = editors.tracks
        .filter(track => track.title.includes('gl/'))
        .map(track => {
          shader.load(track.filename);
          // TODO: shader volume->opacity
        });
    }

    players.forEach(player => player.start());

    if (shader) shader.start();
  };

  const stop = buttonPlayPause.onpause = () => {
    players.forEach(player => player.stop(0));
    if (shader) shader.stop();
    mixWorker.clear();
  };

  const save$1 = buttonSave.onsave = async () => {
    const title = editors.title;

    const bpm = toFinite(+inputBpm.value);

    editors.tracks = editors.tracks.filter(track => !!track.value.trim());
    editors.modules = editors.modules.filter(mod => !!mod.value.trim());

    const tracks = editors.tracks.map(track => ({
      title: track.title,
      value: track.value,
      vol: track.vol,
      mute: track.mute,
      X: track.X,
      Y: track.Y,
    }));

    const modules = editors.modules.map(module => ({
      title: module.title,
      value: module.value,
    }));

    const projectJson = {
      title,
      bpm,
      tracks,
      modules,
    };

    const respJson = await save(projectJson);

    history.pushState({}, '',
      '/' + title + '/' + respJson.generatedId);

    buttonSave.disable();
  };

  buttonLogo.onclick = () => {
    tabs.setActive(tabs.active === tabs.project
      ? tabs.actions
      : tabs.project
    );
  };

  tabs.setActive(tabs.project);

  window.onresize = () => editors.resize();
};

main(container);
