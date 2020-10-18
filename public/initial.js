export default `/// guide
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

bpm(120)

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
  .out(.35).plot()

mod(1/16).noise(333).exp(30)
  .vol('.1 .4 1 .4'.seq(1/16))
  .on(8,1/4).mul('1.5 13'.seq(1/32))
  .hs(16000)
  .bp(500+mod(1/4).val(8000).exp(2.85),.5,.5)
  .on(8,2).vol(0)
  .out(.2)

mod(1/2).play('freesound:220752'.sample[0],-19025,1)
  .vol('- - 1 -'.slide(1/8,.5))
  .vol('- - 1 .3'.seq(1/8))
  .tanh(2)
  .out(.3)

mod(4).play('freesound:243601'.sample[0],46000,.95)
  .vol('- - - - - - 1 1 .8 - - - - - - -'.seq(1/16))
  .on(16,1).val(0)
  .delay(1/[100,200].seq(4))
  .daverb()
  .out(.4)

val(0).on(1,1,8).grp()
  .noise()
  .bp(6000)
  .bp(14000)
  .out(.08)
.end()

main.tanh().vol(2)
  .on(8,2).grp()
    .bp(3000+mod(16,.06).cos(sync(16))*2800,4)
    .vol('.7 1.2 1.4 1.9 1.9 2.1 2.2 2.3'.seq(1/4))
  .end()`