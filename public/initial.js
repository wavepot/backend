export default [`/// guide
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

// Techno. Chrome. Dance. This.

bpm(120)

yt(['FJ3N_2r6R-o','guVAeFs5XwE','oHg5SJYRHA0'].seq(2))
  [['pixelmess','noop'].seq(1)](2)
  .wobble(1)
  .mirror([2.5,5,.5,1,3].seq(1/4))
  .glitch()
  .out()

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
  .widen(.4)
  .out(.35,.15)

mod(1/16).noise(333).exp(30)
  .vol('.1 .4 1 .4'.seq(1/16))
  .on(8,1/4).mul('1.5 13'.seq(1/32))
  .hs(16000)
  .bp(500+mod(1/4).val(8000).exp(2.85),.5,.5)
  .on(8,2).vol(0)
  .widen(.7)
  .out(.2,.3)

mod(1/2).stereo().play('freesound:220752'.sample,-19025,1)
  .vol('- - 1 -'.slide(1/8,.5))
  .vol('- - 1 .3'.seq(1/8))
  .tanh(2)
  .widen(.04)
  .out(.3)

mod(4).stereo().play('freesound:243601'.sample,46000,.95)
  .vol('- - - - - - 1 1 .8 - - - - - - -'.seq(1/16))
  .on(16,1).val(0)
  .delay(1/[100,200].seq(4))
  .daverb()
  .widen(.9)
  .out(.23)

on(1,1,8).grp()
  .noise()
  .bp(6000)
  .bp(14000)
  .out(.08)
.end()

main
  .stereo()
  .tanh(1.5)
  .on(8,2).grp()
    .bp(3000+mod(16,.06).cos(sync(16))*2800,4)
    .vol('.7 1.2 1.4 1.9 1.9 2.1 2.2 2.3'.seq(1/4))
  .end().plot()`,`// Techno. Yo.

bpm(100)

mod(val(1/4).on(8,1).val(1/8).on(16,1/2).val(1/16))
  .sin(mod(1/4).val(42.881).exp(.057))
  .exp(8.82).tanh(15.18)
  .on(16,1).val(0)
  .out(.4)

saw('d d# f f#'.seq(1/4).note/4)
  .mod(1/16).exp(10)
  .vol('.5 .1 .5 1'.seq(1/4))
  .lp(1800,1.2)
  .delay(1/[200,150].seq(4))
  .on(1,8,16).vol(0)
  .out(.35)

mod(1/16).noise(70).exp(19)
  .vol('.1 .4 1 .4'.seq(1/16))
  .on(8,1/4).mul('2 1'.seq(1/15))
  .bp(2500+mod(1/8).val(2000).exp(2.85),1.2,.5)
  .on(8,2).vol(0)
  .out(.2)

mod(1/2).play('freesound:220752'.sample[0],-19025,1)
  .vol('- - 1 -'.slide(1/8,.5))
  .vol('- - 1 .3'.seq(1/8))
  .tanh(2)
  .out(.7)

mod(4).play('freesound:243601'.sample[0],26000,1.1)
  .vol('- - - - - - 1 1 .8 - - - - - - -'.seq(1/16))
  .on(16,1).val(0)
  .delay(1/[100,200].seq(4))
  .daverb()
  .out(.4)

on(1,1,8).grp()
  .noise()
  .bp(6000)
  .bp(14000)
  .out(.08)
.end()

main.tanh(1.5)
  .on(8,2).grp()
    .bp(3000+mod(16,.06).cos(sync(16))*2800,4)
    .vol('.7 1.2 1.4 1.9 1.9 2.1 2.2 2.3'.seq(1/4))
  .end().plot()`,`// Find Me

bpm(133)

mod(1/4,.5).sin(50+mod(1/4).val(70).exp(14))
  .soft(1)
  .exp(15)
  .soft(2.5)
  .tanh(1.5)
  .daverb({
    dry: .7,
    wet:.18,
    bandwidth: .21,
    decay: .43,
    preDelay: 8200,
    inputDiffusion1: .94,
    inputDiffusion2: .95,
    decayDiffusion1: .89,
    decayDiffusion2: .88,
    damping: .8,
    excursionRate: .59,
    excursionDepth: .29,
  })
  .out(val(1).on(8,16).val(0)).plot(10)

mod(1/16).play('freesound:183105'.sample,0,1.6,bar)
  .vol('.1 .4 1 .4 .1 .3 1 .7'.seq(1/16))
  .daverb({wet:.07})
  .widen(.18)
  .out(.18,.3)

mod(1/8,.5).tri('f f f5 f6'.slide(1/16,4).note/20)
  .soft(8)
  .exp(10)
  .soft(18)
  .lp(1300,.32)
  .lp(1000+sin(sync(64))*400,1.5)
  .on(8,16).bp(600+sin(sync(128))*300,1)
  .daverb({wet:.15})
  .widen(.12)
  .out(1,.18)

mod(1/16).stereo().play('freesound:117085'.sample,0,
  val(val(1).on(9,16,16).val(3).on(10,16,16).val(4))
     .on(16,1/2).val(2).on(38,1/8).val(4))
  .daverb({wet:.07})
  .out(.2)`]