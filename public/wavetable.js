import Osc from './osc.js'

export default sr => {
  const osc = Osc('s')

  const tables = Object.fromEntries(Object.entries(osc)
    .map(([key, fn]) => {
      const c = { s:0, p:0 }
      const table = new Float32Array(sr)
      for (c.p = 0; c.p < sr; c.p++) {
        c.s = c.p/sr
        table[c.p] = fn(c,1,.9)
      }
      return [key,table]
    }).filter(Boolean))

  return type => {
    let index = 0
    const table = tables[type]
    const fn = (c,hz) => {
      index = fn.pos
      fn.pos = (fn.pos + hz) % sr
      return table[index|0]
    }
    fn.pos = 0
    return fn
  }
}
