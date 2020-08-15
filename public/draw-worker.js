var drawWaveform = (canvas, data, state) => {
  console.time('draw waveform');
  if (state === 2) data = data.subarray(0, data.length / 4 | 0);
  if (state === 3) data = data.subarray(0, data.length / 8 | 0);
  if (state === 4) data = data.subarray(0, data.length / 16 | 0);
  if (state === 5) data = data.subarray(0, data.length / 32 | 0);
  if (state === 6) data = data.subarray(0, data.length / 64 | 0);
  if (state === 7) data = data.subarray(-(data.length / 64 | 0));
  const ctx = canvas.getContext('2d');
  const width = canvas.width*2;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(0,0,0,.5)'; //'#99ff00'
  ctx.fillRect(0, 0, width, height); //*2, height*2)
  // ctx.strokeStyle = '#a6e22e' //'#568208' //'#99ff00'
  const color = 'rgba(215,255,105,.5)';
  const peak = '#f00';
  ctx.lineWidth = 1;
  ctx.globalCompositeOperation = 'lighter';
  ctx.beginPath();
  const h = height/2;
  ctx.moveTo(0, h);
  const w = Math.floor(data.length / width);
  for (let x = 0; x < width; x++) {
    ctx.beginPath();
    ctx.globalCompositeOperation = 'lighter';

    let max = Math.max(0, Math.max(...data.subarray(x*w, x*w+w)));
    if (max > 1) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = peak;
      max = 1;
    }
    else ctx.strokeStyle = color;

    let min = Math.min(0, Math.min(...data.subarray(x*w, x*w+w)));
    if (min < -1) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = peak;
      min = -1;
    }
    else ctx.strokeStyle = color;

    ctx.moveTo(x/2, (h - (max * h)));
    ctx.lineTo(x/2, (h - (min * h)));
    ctx.stroke();

    // let sum = 0
    // for (let i = x*w; i < x*w+w; i += s) {
    //   sum += Math.abs(wave[i])
    // }
    // let avg = Math.min(1, (sum / (w / s) )) * h

  }
  ctx.lineTo(width, h);
  ctx.stroke();
  console.timeEnd('draw waveform');
};

/* Taken from https://github.com/katspaugh/wavesurfer.js/blob/master/src/plugin/spectrogram/fft.js */

/* eslint-disable complexity, no-redeclare, no-var, one-var */

/**
 * Calculate FFT - Based on https://github.com/corbanbrook/dsp.js
 *
 * @param {Number} bufferSize Buffer size
 * @param {Number} sampleRate Sample rate
 * @param {Function} windowFunc Window function
 * @param {Number} alpha Alpha channel
 */
function FFT(bufferSize, sampleRate, windowFunc, alpha) {
    this.bufferSize = bufferSize;
    this.sampleRate = sampleRate;
    this.bandwidth = (2 / bufferSize) * (sampleRate / 2);

    this.sinTable = new Float32Array(bufferSize);
    this.cosTable = new Float32Array(bufferSize);
    this.windowValues = new Float32Array(bufferSize);
    this.reverseTable = new Uint32Array(bufferSize);

    this.peakBand = 0;
    this.peak = 0;

    var i;
    switch (windowFunc) {
        case 'bartlett':
            for (i = 0; i < bufferSize; i++) {
                this.windowValues[i] =
                    (2 / (bufferSize - 1)) *
                    ((bufferSize - 1) / 2 - Math.abs(i - (bufferSize - 1) / 2));
            }
            break;
        case 'bartlettHann':
            for (i = 0; i < bufferSize; i++) {
                this.windowValues[i] =
                    0.62 -
                    0.48 * Math.abs(i / (bufferSize - 1) - 0.5) -
                    0.38 * Math.cos((Math.PI * 2 * i) / (bufferSize - 1));
            }
            break;
        case 'blackman':
            alpha = alpha || 0.16;
            for (i = 0; i < bufferSize; i++) {
                this.windowValues[i] =
                    (1 - alpha) / 2 -
                    0.5 * Math.cos((Math.PI * 2 * i) / (bufferSize - 1)) +
                    (alpha / 2) *
                        Math.cos((4 * Math.PI * i) / (bufferSize - 1));
            }
            break;
        case 'cosine':
            for (i = 0; i < bufferSize; i++) {
                this.windowValues[i] = Math.cos(
                    (Math.PI * i) / (bufferSize - 1) - Math.PI / 2
                );
            }
            break;
        case 'gauss':
            alpha = alpha || 0.25;
            for (i = 0; i < bufferSize; i++) {
                this.windowValues[i] = Math.pow(
                    Math.E,
                    -0.5 *
                        Math.pow(
                            (i - (bufferSize - 1) / 2) /
                                ((alpha * (bufferSize - 1)) / 2),
                            2
                        )
                );
            }
            break;
        case 'hamming':
            for (i = 0; i < bufferSize; i++) {
                this.windowValues[i] =
                    0.54 -
                    0.46 * Math.cos((Math.PI * 2 * i) / (bufferSize - 1));
            }
            break;
        case 'hann':
        case undefined:
            for (i = 0; i < bufferSize; i++) {
                this.windowValues[i] =
                    0.5 * (1 - Math.cos((Math.PI * 2 * i) / (bufferSize - 1)));
            }
            break;
        case 'lanczoz':
            for (i = 0; i < bufferSize; i++) {
                this.windowValues[i] =
                    Math.sin(Math.PI * ((2 * i) / (bufferSize - 1) - 1)) /
                    (Math.PI * ((2 * i) / (bufferSize - 1) - 1));
            }
            break;
        case 'rectangular':
            for (i = 0; i < bufferSize; i++) {
                this.windowValues[i] = 1;
            }
            break;
        case 'triangular':
            for (i = 0; i < bufferSize; i++) {
                this.windowValues[i] =
                    (2 / bufferSize) *
                    (bufferSize / 2 - Math.abs(i - (bufferSize - 1) / 2));
            }
            break;
        default:
            throw Error("No such window function '" + windowFunc + "'");
    }

    var limit = 1;
    var bit = bufferSize >> 1;
    var i;

    while (limit < bufferSize) {
        for (i = 0; i < limit; i++) {
            this.reverseTable[i + limit] = this.reverseTable[i] + bit;
        }

        limit = limit << 1;
        bit = bit >> 1;
    }

    for (i = 0; i < bufferSize; i++) {
        this.sinTable[i] = Math.sin(-Math.PI / i);
        this.cosTable[i] = Math.cos(-Math.PI / i);
    }

    this.calculateSpectrum = function(buffer) {
        // Locally scope variables for speed up
        var bufferSize = this.bufferSize,
            cosTable = this.cosTable,
            sinTable = this.sinTable,
            reverseTable = this.reverseTable,
            real = new Float32Array(bufferSize),
            imag = new Float32Array(bufferSize),
            bSi = 2 / this.bufferSize,
            sqrt = Math.sqrt,
            rval,
            ival,
            mag,
            spectrum = new Float32Array(bufferSize / 2);

        var k = Math.floor(Math.log(bufferSize) / Math.LN2);

        if (Math.pow(2, k) !== bufferSize) {
            throw 'Invalid buffer size, must be a power of 2.';
        }
        if (bufferSize !== buffer.length) {
            throw 'Supplied buffer is not the same size as defined FFT. FFT Size: ' +
                bufferSize +
                ' Buffer Size: ' +
                buffer.length;
        }

        var halfSize = 1,
            phaseShiftStepReal,
            phaseShiftStepImag,
            currentPhaseShiftReal,
            currentPhaseShiftImag,
            off,
            tr,
            ti,
            tmpReal;

        for (var i = 0; i < bufferSize; i++) {
            real[i] =
                buffer[reverseTable[i]] * this.windowValues[reverseTable[i]];
            imag[i] = 0;
        }

        while (halfSize < bufferSize) {
            phaseShiftStepReal = cosTable[halfSize];
            phaseShiftStepImag = sinTable[halfSize];

            currentPhaseShiftReal = 1;
            currentPhaseShiftImag = 0;

            for (var fftStep = 0; fftStep < halfSize; fftStep++) {
                var i = fftStep;

                while (i < bufferSize) {
                    off = i + halfSize;
                    tr =
                        currentPhaseShiftReal * real[off] -
                        currentPhaseShiftImag * imag[off];
                    ti =
                        currentPhaseShiftReal * imag[off] +
                        currentPhaseShiftImag * real[off];

                    real[off] = real[i] - tr;
                    imag[off] = imag[i] - ti;
                    real[i] += tr;
                    imag[i] += ti;

                    i += halfSize << 1;
                }

                tmpReal = currentPhaseShiftReal;
                currentPhaseShiftReal =
                    tmpReal * phaseShiftStepReal -
                    currentPhaseShiftImag * phaseShiftStepImag;
                currentPhaseShiftImag =
                    tmpReal * phaseShiftStepImag +
                    currentPhaseShiftImag * phaseShiftStepReal;
            }

            halfSize = halfSize << 1;
        }

        for (var i = 0, N = bufferSize / 2; i < N; i++) {
            rval = real[i];
            ival = imag[i];
            mag = bSi * sqrt(rval * rval + ival * ival);

            if (mag > this.peak) {
                this.peakBand = i;
                this.peak = mag;
            }
            spectrum[i] = mag;
        }
        return spectrum;
    };
}

// import fft from './lib/nfft.js'
const WINDOW = 2**13;
const SLICES = 4;
const HALF = WINDOW/2;

const fft = new FFT(
  WINDOW,
  44100,
  'bartlettHann',
  .2
);

var drawSpectrogram = (canvas, data) => {
  // data = data.subarray(0, 8192)
  const fftData = [];
console.time('fft');
  let slice;
  let remain = 0;
  for (let i = 0; i < SLICES; i++) {
    let pos = Math.floor(i * (data.length/SLICES));
    slice = data.subarray(pos, pos + WINDOW);

    if (slice.length < WINDOW) {
      remain = WINDOW - slice.length;
      slice = new Float32Array(WINDOW);
      slice.set(data.subarray(pos, pos+WINDOW));
    }

    fftData.push(fft.calculateSpectrum(slice));
  }
console.timeEnd('fft');

  console.time('draw spectrogram');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(0,0,0,.5)'; //'#99ff00'
  ctx.fillRect(0, 0, width, height); //*2, height*2)
  const imageData = ctx.getImageData(0, 0, width, height);
  const width4 = width * 4;
  let x, y;
  let xw, yp, val;
  for (let i = 0; i < imageData.data.length; i += 4) {
    x = (i % width4) / 4;
    y = i / width4 | 0;
    if (x === 0) {
      yp = (height-y) / height;
      yp = (yp ** 2) * HALF;
    }

    xw = Math.floor(x*SLICES / width);
    val = fftData[xw][yp|0];
    val = 255-Math.abs(Math.max(-255, Math.log10(val)*50));

    if (val !== 0) {
      imageData.data[i] = 255;
      imageData.data[i+1] = 100;
      imageData.data[i+3] = val;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  console.timeEnd('draw spectrogram');
};

const WINDOW$1 = 4096/2;

const fft$1 = new FFT(
  WINDOW$1,
  44100,
  'blackman',
  .5
);

var drawFrequency = (canvas, data) => {
  data = data.subarray(0,2048);
  console.time('draw frequency');
  // const fftData = []

  // let slice
  // let remain = 0
  // for (let i = 0; i < SLICES; i++) {
  //   let pos = Math.floor(i * (data.length/SLICES))
  //   slice = data.subarray(pos, pos + WINDOW)

  //   if (slice.length < WINDOW) {
  //     remain = WINDOW - slice.length
  //     slice = new Float32Array(WINDOW)
  //     slice.set(data.subarray(pos, pos+WINDOW))
  //   }

  //   fftData.push(

  const fftData = fft$1.calculateSpectrum(data);
  // }

  const ctx = canvas.getContext('2d');
  const width = canvas.width*2;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(0,0,0,.5)'; //'#99ff00'
  ctx.fillRect(0, 0, width, height); //*2, height*2)
  ctx.lineWidth = 1;
  ctx.globalCompositeOperation = 'lighter';
  const y = height;
  // const w = width /// (fftData.length - remain/2/fftData.length)// - (remain*4) / fftData.length))
  const h = fftData[0].length;

  const w = Math.floor(fftData.length / width);

  ctx.beginPath();
  ctx.moveTo(0, y);
  for (let x = 0; x < width; x++) {
    let xw = Math.floor(x * fftData.length / width);
    let val = fftData[xw];

    // let sum = 0
    // for (let i = x*w; i < x*w+w; i += s) {
    //   sum += Math.abs(data[i])
    // }
    // let val = (sum / (w / s) )

    // let val = Math.max(0, Math.max(...data.subarray(x*w, x*w+w)))

    // for (let y = 0; y < height; y++) {
      // let yp = (y/height) * fftData[xw].length
      // yp = Math.floor(
      //   linearToLog(0, fftData[xw].length,
      //   linearToLog(0, fftData[xw].length,
      //   linearToLog(0, fftData[xw].length,
      //   linearToLog(0, fftData[xw].length,
      //   linearToLog(0, fftData[xw].length, yp)
      //   ))))
      // )
      // let val = fftData[xw]
      val = 1-(Math.abs(Math.max(-255, Math.log10(val)*45)/255));//(200+(Math.sqrt(y)/5)) ))/255)
      // val = 20 * Math.log(val) / Math.LN10
      // console.log(val)
      // ctx.globalCompositeOperation = 'lighter'
      // ctx.fillRect(x/2, height*val, 1, 1)
    // ctx.moveTo(x/2, height * val) //(h - (max * h)))
    ctx.lineTo(x/2, height - height * val); //(h - (min * h)))
    // }
    // ctx.stroke()
  }
  ctx.strokeStyle = `rgba(100,150,255,.7)`;
  ctx.stroke();
  console.timeEnd('draw frequency');
};

let data = [];

const canvas = {};

onmessage = ({ data }) => {
  canvas.waveform = { canvas: data.waveform, draw: drawWaveform, state: 1, states: 8 };
  canvas.spectrogram = { canvas: data.spectrogram, draw: drawSpectrogram, state: 1, states: 1 };
  canvas.frequency = { canvas: data.frequency, draw: drawFrequency, state: 1, states: 1 };
  onmessage = ({ data }) => {
    const method = Object.keys(data)[0];
    const arg = data[method];
    self.methods[method](arg);
  };
};

self.methods = {
  toggle (which) {
    canvas[which].state = (canvas[which].state + 1) % canvas[which].states;
    if (canvas[which].state) {
      canvas[which].draw(canvas[which].canvas, data, canvas[which].state);
    }
  },
  draw (_data) {
    data = _data;
    if (canvas.waveform.state) {
      canvas.waveform.draw(canvas.waveform.canvas, data, canvas.waveform.state);
    }
    if (canvas.spectrogram.state) {
      canvas.spectrogram.draw(canvas.spectrogram.canvas, data, canvas.spectrogram.state);
    }
    if (canvas.frequency.state) {
      canvas.frequency.draw(canvas.frequency.canvas, data.subarray(0, 4096));
    }
  },
  drawSweep (_data) {
    data = _data;
    if (canvas.frequency.state) {
      canvas.frequency.draw(canvas.frequency.canvas, data);
    }
  }
};
