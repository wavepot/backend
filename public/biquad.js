export default sr => {
  const TAU = 2 * Math.PI

  let b0, b1, b2, a0, a1, a2
  let w0, sin_w0, cos_w0, alpha
  let a, c

  const common = (cut, res) => {
    w0 = TAU * cut / sr
    sin_w0 = Math.sin(w0)
    cos_w0 = Math.cos(w0)
    alpha = sin_w0 / (2.0 * res)
  }

  const lp1 = (cut, amt=1) => {
    w0 = TAU * cut / sr

    //a0 = 1.0
    a1 = -Math.exp(-w0)
    a2 = 0.0
    b0 = 1.0 + a1
    b1 = b2 = 0.0

    return [[b0, b1, b2, a1, a2], amt]
  }

  const hp1 = (cut, amt=1) => {
    w0 = TAU * cut / sr

    //a0 = 1.0
    a1 = -exp(-w0)
    a2 = 0.0
    b0 = (1.0 - a1) / 2.0
    b1 = -b0
    b2 = 0.0

    return [[b0, b1, b2, a1, a2], amt]
  }

  const lp = (cut, res=1, amt=1) => {
    common(cut, res)

    b0 = (1.0 - cos_w0) / 2.0
    b1 = 1.0 - cos_w0
    b2 = b0
    a0 = 1.0 + alpha
    a1 = -2.0 * cos_w0
    a2 = 1.0 - alpha

    return [[b0/a0, b1/a0, b2/a0, a1/a0, a2/a0], amt]
  }

  const hp = (cut, res=1, amt=1) => {
    common(cut, res)

    b0 = (1.0 + cos_w0) / 2.0
    b1 = -(1.0 + cos_w0)
    b2 = b0
    a0 = 1.0 + alpha
    a1 = -2.0 * cos_w0
    a2 = 1.0 - alpha

    return [[b0/a0, b1/a0, b2/a0, a1/a0, a2/a0], amt]
  }

  const bp = (cut, res=1, amt=1) => {
    common(cut, res)

    b0 = sin_w0 / 2.0
    b1 = 0.0
    b2 = -b0
    a0 = 1.0 + alpha
    a1 = -2.0 * cos_w0
    a2 = 1.0 - alpha

    return [[b0/a0, b1/a0, b2/a0, a1/a0, a2/a0], amt]
  }

  const bpp = (cut, res=1, amt=1) => {
    common(cut, res)

    b0 = alpha
    b1 = 0.0
    b2 = -alpha
    a0 = 1.0 + alpha
    a1 = -2.0 * cos_w0
    a2 = 1.0 - alpha

    return [[b0/a0, b1/a0, b2/a0, a1/a0, a2/a0], amt]
  }

  const not = (cut, res=1, amt=1) => {
    common(cut, res)

    b0 = 1.0
    b1 = -2.0 * cos_w0
    b2 = 1.0
    a0 = 1.0 + alpha
    a1 = b1
    a2 = 1.0 - alpha

    return [[b0/a0, b1/a0, b2/a0, a1/a0, a2/a0], amt]
  }

  const ap = (cut, res=1, amt=1) => {
    common(cut, res)

    b0 = 1.0 - alpha
    b1 = -2.0 * cos_w0
    b2 = 1.0 + alpha
    a0 = b2
    a1 = b1
    a2 = b0

    return [[b0/a0, b1/a0, b2/a0, a1/a0, a2/a0], amt]
  }

  const pk = (cut, res=1, gain=1, amt=1) => {
    common(cut, res)

    a = Math.pow(10.0, gain / 40.0)
    b0 = 1.0 + alpha * a
    b1 = -2.0 * cos_w0
    b2 = 1.0 - alpha * a
    a0 = 1.0 + alpha / a
    a1 = b1
    a2 = 1.0 - alpha / a

    return [[b0/a0, b1/a0, b2/a0, a1/a0, a2/a0], amt]
  }

  const ls = (cut, res=1, gain=1, amt=1) => {
    common(cut, res)

    a = Math.pow(10.0, gain / 40.0)
    c = 2.0 * Math.sqrt(a) * alpha
    b0 = a * ((a + 1.0) - (a - 1.0) * cos_w0 + c)
    b1 = 2.0 * a * ((a - 1.0) - (a + 1.0) * cos_w0)
    b2 = a * ((a + 1.0) - (a - 1.0) * cos_w0 - c)
    a0 = (a + 1.0) + (a - 1.0) * cos_w0 + c
    a1 = -2.0 * ((a - 1.0) + (a + 1.0) * cos_w0)
    a2 = (a + 1.0) + (a - 1.0) * cos_w0 - c

    return [[b0/a0, b1/a0, b2/a0, a1/a0, a2/a0], amt]
  }

  const hs = (cut, res=1, gain=1, amt=1) => {
    common(cut, res)

    a = Math.pow(10.0, gain / 40.0)
    c = 2.0 * Math.sqrt(a) * alpha
    b0 = a * ((a + 1.0) + (a - 1.0) * cos_w0 + c)
    b1 = -2.0 * a * ((a - 1.0) + (a + 1.0) * cos_w0)
    b2 = a * ((a + 1.0) + (a - 1.0) * cos_w0 - c)
    a0 = (a + 1.0) - (a - 1.0) * cos_w0 + c
    a1 = 2.0 * ((a - 1.0) - (a + 1.0) * cos_w0)
    a2 = (a + 1.0) - (a - 1.0) * cos_w0 - c

    return [[b0/a0, b1/a0, b2/a0, a1/a0, a2/a0], amt]
  }

  return {
    lp1, hp1,
    lp, hp,
    bp, bpp,
    not, ap, pk,
    ls, hs,
  }
}
