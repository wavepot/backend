const trim = s => s.trim()
const hasLength = s => s.length > 0

const didSetup = []

export default (code, locals) => {
  let globalSetup = ''
  let localSetup = ''

  const blocks = code
    .split('\n\n')
    .map(trim).filter(hasLength)

  const compiled = blocks.map((s,bi) => {
    const block = s.split('\n') // lines
      .map(trim).filter(hasLength)
      .join('\n').replaceAll('\n@', '@')
      .split('\n')

    // global block (runs once)
    if (block[0].indexOf('!!!') === 0) {
      const str = block.slice(1).join('\n')
      if (!didSetup.includes(str)) {
        didSetup.push(str)
        globalSetup += str
      }
      return '/*global setup*/' // TODO: handle block
    }

    // local block (runs on each sample)
    if (block[0].indexOf('###') === 0) {
      localSetup += ';\n' + block.slice(1).join('\n') //'/*block*/' // TODO: handle block
      return '/*local setup*/'
    }

    let zi = 0
    return block.filter(s => s.indexOf('//') !== 0)
      .map((s,i,arr) => {
      // comments
      let comment = s.indexOf('//')
      if (~comment) s = s.slice(0, comment)

      // local code runs as is
      if (s.indexOf('#') === 0) return s.slice(1)

      let parens = s.split('@')
      if (parens.length > 1) {
        s = Array(parens.length-1).fill('(').join('')
          + parens.join(')')
      }

      if (arr.length > 1) {
        s = (i < arr.length - 1
          ? Array(zi).fill(0).map((_, z) => 'z' + (zi-z) + ' = z' + (zi-z-1)).join(',')
          + (zi ? ',' : '')
          : ''
          ) + 'z0 = (' + (s||0) + ')' //+ (i > 0 ? ' + y0' : '')
      }

      if (i === arr.length-1) {
        s = 'out = (' + s + ') + out;'
      }

      zi++

      return s
    }).join('\n')
    return block
  }).join('\n\n')

  localSetup = localSetup || 't = 120..bpm(1)'

  const src = `${locals.map(s => `
let ${s} = self.${s}`).join('')}
${globalSetup}
console.time('renderer')

barRate = barRate || bufferSize

for (bufferIndex = 0; bufferIndex < bufferSize; bufferIndex++) {
  if (
    (bufferIndex > 50000 && ((bufferIndex % (barRate|0)) === 0))
  ) {
    //sampleIndex--
    //bufferIndex--
    break
  }

  sampleIndex++

  /* break when next beat is detected */
/*
  //if ((currentBufferTime+1)%2 < 0.0001 && bufferIndex > 40000) {
  if (bufferIndex === barRate && barRate > 40000) {
    console.log('bar detected', bufferIndex)
    nextBeatBufferIndex = bufferIndex
    lastBeatTime = prevBeatTime
    sampleIndex--
    break
  }
*/

  /* reset values to 0 */
  _biquads_i =
  _delays_i =
  _daverbs_i =
  _wavetables_i =
  out = 0

  /* clock time in real seconds */
  s = sampleIndex / sampleRate

  ${localSetup}


  /* user code */
  ${compiled}

  /* write buffer sample output */
  buffer[bufferIndex] = out

  prevBeatTime = beatTime
}
console.timeEnd('renderer')
${locals.map(s => `
self.${s} = ${s}`).join('')}
  `

  console.log('compiling:', src)

  const func = new Function(src)

  return { func, src, compiled }
}
