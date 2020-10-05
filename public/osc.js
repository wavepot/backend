const PI = Math.PI
const TAU = 2*PI
export default (t='s') => {
  const sin = (c,x) => Math.sin(c[t]*x*TAU)
  const saw = (c,x) => 1-2*(c[t]%(1/x))*x
  const ramp = (c,x) => 2*(c[t]%(1/x))*x-1
  const tri = (c,x) => Math.abs(1-(2*c[t]*x)%2)*2-1
  const sqr = (c,x) => (c[t]*x%1/x<1/x/2)*2-1
  const pulse = (c,x,w=.5) => (c[t]*x%1/x<1/x/2*w)*2-1
  const noise = (c,x=123456) => {
    x=Math.sin(x+c.p)*100000
    return (x-Math.floor(x))*2-1
  }
  return { sin, saw, ramp, tri, sqr, pulse, noise }
}
