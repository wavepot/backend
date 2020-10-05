export const toFinite = n => Number.isFinite(n) ? n : 0

export const clamp = (min, max, n) => Math.max(min, Math.min(max, n))

// export const ProxyChain = () => {
//   const acc = []

//   const add = (a0,a1,a2,a3,a4) => {
//     acc[acc.length-1].push(a0,a1,a2,a3,a4)
//     return proxy
//   }

//   const handler = {
//     get (obj, prop) {
//       acc.push([prop])
//       return add
//     },
//     apply () {
//       return acc.splice(0)
//     }
//   }

//   const proxy = new Proxy(() => {}, handler)

//   const init = () => {
//     acc.splice(0)
//     return proxy
//   }

//   return init
// }

export const actlessProxy = () => {
  const chain = () => proxy

  const handler = {
    get (obj, prop) {
      return chain
    },
    apply () {
      return proxy
    }
  }

  const proxy = new Proxy(chain, handler)

  return proxy
}

export const captureManyProxy = (context,parent,begin,end) => {
  const acc = []

  const add = (a0,a1,a2,a3,a4) => {
    acc[acc.length-1].push(a0,a1,a2,a3,a4)
    return proxy
  }

  const run = calls => () => {
    calls.forEach(([method,a0,a1,a2,a3,a4]) =>
      parent[method](a0,a1,a2,a3,a4))
  }

  const handler = {
    get (obj, prop) {
      if (prop === 'out' || prop === 'on' || prop === Symbol.toPrimitive) {
        const rest = acc.splice(1)
        proxy()
        run(rest)()
        return parent[prop]
      }
      acc.push([prop])
      return add
    },
    apply () {
      end(run(acc.splice(0)), context)
      return parent
    }
  }

  const proxy = new Proxy(() => {}, handler)

  return (a0,a1,a2,a3,a4) => {
    acc.splice(0)
    begin(context,a0,a1,a2,a3,a4)
    return proxy
  }
}

export const captureOneProxy = (context,parent,begin,end) => {
  const handler = {
    get (obj, prop) {
      return (a0,a1,a2,a3,a4) => {
        end(() => { parent[prop](a0,a1,a2,a3,a4) }, context)
        return parent
      }
    }
  }

  const proxy = new Proxy(() => {}, handler)

  return (a0,a1,a2,a3,a4) => {
    begin(context,a0,a1,a2,a3,a4)
    return proxy
  }
}
